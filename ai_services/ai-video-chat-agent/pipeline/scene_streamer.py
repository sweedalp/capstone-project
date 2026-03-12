"""
pipeline/scene_streamer.py
FIXED: Proper frame sorting, size verification, smooth clip building
"""

import os
import time
import glob
import base64
import re

try:
    from moviepy.editor import ImageSequenceClip, AudioFileClip
except ImportError:
    from moviepy import ImageSequenceClip, AudioFileClip

from config.settings import FPS, VIDEOS_DIR
from PIL import Image


class SceneStreamer:
    def __init__(self):
        self.clips_dir = VIDEOS_DIR / "clips"
        self.clips_dir.mkdir(parents=True, exist_ok=True)

    def build_scene_clip(self, scene_num, frames_dir, audio_path,
                         duration, job_id):
        start = time.time()

        # CRITICAL FIX: Sort frames by number, not alphabetically
        frames = self._get_sorted_frames(frames_dir)

        if not frames:
            raise ValueError(f"No frames in {frames_dir}")

        # Verify all frames are same size
        frames = self._verify_frame_sizes(frames)

        if not frames:
            raise ValueError(f"No valid frames in {frames_dir}")

        audio = AudioFileClip(audio_path)
        dur = audio.duration

        # Calculate proper fps to match audio duration
        scene_fps = len(frames) / dur if dur > 0 else FPS

        # Ensure fps is reasonable
        scene_fps = max(5, min(30, scene_fps))

        video = ImageSequenceClip(frames, fps=scene_fps)
        video = video.set_duration(dur).set_audio(audio)

        clip_path = str(self.clips_dir / f"{job_id}_scene_{scene_num}.mp4")

        video.write_videofile(
            clip_path,
            fps=min(FPS, int(scene_fps)),
            codec="libx264",
            audio_codec="aac",
            bitrate="2500k",
            threads=2,
            preset="ultrafast",
            logger=None,
        )

        video.close()
        audio.close()

        with open(clip_path, "rb") as f:
            video_bytes = f.read()

        return {
            "scene_number": scene_num,
            "clip_path": clip_path,
            "video_base64": base64.b64encode(video_bytes).decode("utf-8"),
            "duration": dur,
            "size_kb": len(video_bytes) / 1024,
            "build_time": time.time() - start,
            "frame_count": len(frames),
        }

    def _get_sorted_frames(self, frames_dir):
        """
        Get frames sorted by NUMERIC order, not alphabetical.
        This prevents frame_10.png sorting before frame_2.png.
        """
        all_files = glob.glob(os.path.join(frames_dir, "*.png"))

        if not all_files:
            return []

        # Extract number from filename and sort numerically
        def extract_number(filepath):
            filename = os.path.basename(filepath)
            # Match any digits in the filename
            numbers = re.findall(r'(\d+)', filename)
            if numbers:
                return int(numbers[-1])  # Use the last number found
            return 0

        sorted_frames = sorted(all_files, key=extract_number)
        return sorted_frames

    def _verify_frame_sizes(self, frames):
        """Ensure ALL frames are exactly the same size."""
        if not frames:
            return frames

        # Get target size from first frame
        try:
            first = Image.open(frames[0])
            target_size = first.size
            first.close()
        except Exception:
            return frames

        valid_frames = []
        for fp in frames:
            try:
                img = Image.open(fp)
                if img.size != target_size:
                    img = img.resize(target_size, Image.LANCZOS)
                    img.save(fp, "PNG")
                img.close()
                valid_frames.append(fp)
            except Exception:
                continue

        return valid_frames

    def cleanup_clips(self, job_id):
        try:
            for f in self.clips_dir.glob(f"{job_id}_*.mp4"):
                f.unlink(missing_ok=True)
        except Exception:
            pass