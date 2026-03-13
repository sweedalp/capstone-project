import whisper
try:
    from moviepy import VideoFileClip
except ImportError:
    from moviepy.editor import VideoFileClip

model = whisper.load_model("tiny")


def transcribe_video(video_path: str):
    audio_path = video_path.replace(".mp4", ".wav")

    # extract audio
    video = VideoFileClip(video_path)
    video.audio.write_audiofile(audio_path)

    # transcribe
    result = model.transcribe(audio_path)

    return result["text"]

