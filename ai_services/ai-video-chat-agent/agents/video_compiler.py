"""
agents/video_compiler.py
FAST CONCAT VERSION:
Use already-built scene video clips and concatenate them with ffmpeg.
This is much faster than rebuilding from frames again.
"""

import os
import subprocess
import tempfile
from pathlib import Path

from config.settings import VIDEOS_DIR, LANGUAGES


class VideoCompiler:
    def compile(self, script, clips, language="en"):
        lang_name = LANGUAGES.get(language, {}).get("name", language)
        print(f"  🎬 Fast compiling {lang_name} final video...")

        if not clips:
            raise ValueError("No clips generated!")

        topic = script.get("topic", "video").replace(" ", "_")[:30]
        output_path = str(VIDEOS_DIR / f"{topic}_{language}.mp4")

        ordered_clips = sorted(
            clips,
            key=lambda c: c.get("scene_number", 0)
        )

        clip_paths = []
        for clip in ordered_clips:
            path = (
                clip.get("video_path")
                or clip.get("clip_path")
                or clip.get("path")
            )
            if path and os.path.exists(path):
                clip_paths.append(path)

        if not clip_paths:
            raise ValueError("No valid scene clip paths found for final compile")

        # First try stream-copy concat (fastest)
        try:
            self._concat_with_copy(clip_paths, output_path)
        except Exception as e:
            print(f"  ⚠️ Fast concat failed, retrying with re-encode: {e}")
            self._concat_with_reencode(clip_paths, output_path)

        file_size = os.path.getsize(output_path) / (1024 * 1024)
        print(f"  ✅ Final video: {output_path} ({file_size:.1f} MB)")
        return output_path

    def _concat_with_copy(self, clip_paths, output_path):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            list_file = f.name
            for path in clip_paths:
                safe_path = path.replace("\\", "/").replace("'", "'\\''")
                f.write(f"file '{safe_path}'\n")

        try:
            cmd = [
                "ffmpeg",
                "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", list_file,
                "-c", "copy",
                output_path,
            ]
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=False,
            )
            if result.returncode != 0:
                raise RuntimeError(result.stderr.strip() or "ffmpeg concat copy failed")
        finally:
            try:
                os.remove(list_file)
            except OSError:
                pass

    def _concat_with_reencode(self, clip_paths, output_path):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            list_file = f.name
            for path in clip_paths:
                safe_path = path.replace("\\", "/").replace("'", "'\\''")
                f.write(f"file '{safe_path}'\n")

        try:
            cmd = [
                "ffmpeg",
                "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", list_file,
                "-c:v", "libx264",
                "-preset", "ultrafast",
                "-crf", "32",
                "-c:a", "aac",
                "-b:a", "96k",
                "-movflags", "+faststart",
                "-pix_fmt", "yuv420p",
                output_path,
            ]
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=False,
            )
            if result.returncode != 0:
                raise RuntimeError(result.stderr.strip() or "ffmpeg concat re-encode failed")
        finally:
            try:
                os.remove(list_file)
            except OSError:
                pass