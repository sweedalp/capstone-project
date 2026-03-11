# 🎥 AI Video Learning Assistant

An AI-powered video learning system that converts uploaded videos into:

* 📄 **Transcript**
* 📝 **Summary Notes**
* ❓ **Quiz Questions**
* 🧠 **Flashcards**

The system extracts audio from videos, transcribes speech using Whisper, and generates learning content using Azure OpenAI.

---

## 🚀 Features

* Upload video files
* Extract audio automatically
* Generate transcript using Whisper
* Create:

  * Lecture summary
  * Study notes
  * Quiz questions
  * Flashcards
* FastAPI backend API
* Swagger UI for testing
* Simple local deployment

---

## 🏗️ Architecture

```
Frontend Upload
      ↓
FastAPI Server
      ↓
Audio Extraction (MoviePy)
      ↓
Whisper Transcription
      ↓
Azure OpenAI
      ↓
Summary + Notes + Quiz + Flashcards
```

---

## 📂 Project Structure

```
video_learning_whispher/

├── app.py
├── services/
│   ├── whisper_service.py
│   └── openai_service.py
├── uploads/
├── .env
├── requirements.txt
```

---

## ⚙️ Installation

### 1. Clone project

```
git clone <repo-url>
cd video_learning_whispher
```

---

### 2. Create virtual environment

```
python -m venv .venv
source .venv/bin/activate
```

Windows:

```
.venv\Scripts\activate
```

---

### 3. Install dependencies

```
pip install fastapi uvicorn python-dotenv moviepy openai-whisper openai
```

---

### 4. Install FFmpeg (required for video processing)

Mac:

```
brew install ffmpeg
```

Ubuntu:

```
sudo apt install ffmpeg
```

Windows:

Download from https://ffmpeg.org/

---

## 🔑 Environment Variables

Create `.env` file:

```
AZURE_OPENAI_API_KEY=your_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-4o
```

---

## ▶️ Run Server

```
python -m uvicorn app:app --reload
```

Server runs at:

```
http://127.0.0.1:8000
```

---

## 📤 Upload Video

Open:

```
http://127.0.0.1:8000/docs
```

Use endpoint:

```
POST /process-video
```

Upload video → get response:

```
{
  "transcript": "...",
  "summary_notes": "...",
  "quiz": "...",
  "flashcards": "..."
}
```

---

## 🔄 Processing Flow

### Step 1 — Upload video

User uploads lecture video.

### Step 2 — Extract audio

MoviePy extracts audio from video.

### Step 3 — Transcription

Whisper converts speech → text.

### Step 4 — AI Content Generation

Azure OpenAI generates:

* Summary
* Notes
* Quiz
* Flashcards

---

## 🧠 Example Use Cases

* Online learning platforms
* Lecture summarization
* Study assistant tools
* Course content generation
* Interview preparation
* Knowledge extraction from videos

---

## ⚠️ Limitations

* CPU Whisper transcription is slow
* Large videos require more processing time
* No authentication
* No frontend UI
* No real-time processing

---

## 🔮 Future Improvements

* Web UI
* Database storage
* Video streaming support
* Voice assistant integration
* Real-time transcription
* Multi-language support
* Authentication

---

## 🛠 Tech Stack

* Python
* FastAPI
* Whisper
* Azure OpenAI
* MoviePy
* FFmpeg

---

## 📜 License

MIT License
