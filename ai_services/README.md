# AI Services - Knowledge Intelligence

## Overview
AI/ML services for transforming raw content into intelligent, teachable assets.

## Structure
```
ai_services/
├── knowledge_extraction/    # Extract structured knowledge
├── content_generation/      # Generate AI content
├── nlp/                     # NLP processing
├── speech/                  # TTS and STT
├── video/                   # Video generation
├── qa_system/              # Question answering
├── vector_store/           # Vector database operations
├── models/                 # ML models and embeddings
├── utils/                  # Utility functions
├── requirements.txt
└── main.py
```

## Core Capabilities

### 1. Knowledge Extraction
Transform raw materials into structured knowledge:
- **Transcript cleaning** - Clean and format transcripts
- **Topic segmentation** - Identify distinct topics/chapters
- **Concept extraction** - Extract key concepts and definitions
- **Summarization** - Create clean summaries
- **Key takeaways** - Generate main points

### 2. AI Understanding
Make knowledge searchable and queryable:
- **Semantic search** - Vector-based knowledge search
- **Question answering** - Answer questions from content
- **Concept mapping** - Link related concepts
- **Prerequisite detection** - Identify learning prerequisites

### 3. Content Generation (Mandatory)
Generate AI-enhanced learning materials:
- **Narrated summaries** - Auto-generate lesson summaries with voiceover
- **Explainer videos** - Create short explainer videos
- **Micro-learning clips** - Bite-sized learning content
- **Multilingual content** - Translate and localize
- **Personalized revision** - Custom revision materials
- **Guided walkthroughs** - Step-by-step explanations

## Tech Stack
- **LLM**: OpenAI GPT-4, Claude
- **Embeddings**: OpenAI Embeddings, Sentence Transformers
- **Vector DB**: Pinecone, ChromaDB
- **Speech**: Whisper (STT), ElevenLabs/Google TTS
- **Video**: FFmpeg, MoviePy  
- **NLP**: LangChain, spaCy, NLTK

## API Endpoints

### Knowledge Processing
- `POST /process/transcript` - Process and clean transcript
- `POST /process/extract-topics` - Extract topics from content
- `POST /process/summarize` - Generate summary

### AI Understanding
- `POST /search/semantic` - Semantic search
- `POST /qa/answer` - Answer questions
- `POST /qa/concepts` - Extract concepts

### Content Generation
- `POST /generate/narrated-summary` - Generate voiceover summary
- `POST /generate/explainer-video` - Create explainer video
- `POST /generate/micro-clip` - Create micro-learning clip
- `POST /generate/revision-quiz` - Generate revision quiz

## Running AI Services

```bash
cd ai_services
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
# **Note:** Install `requirements.txt` wherever it is present in each service folder before running.
pip install -r requirements.txt

### Start All Backend Services (from project root)
```bash
python start_all.py
```

### Start Frontend (open a new terminal)
```bash
cd frontend
npm install
npm run dev
```
```

Service runs on `http://localhost:8001`

## Team Assignment
**AI/Data/Intelligence Team (2-3 members)**
- Member 1: Knowledge Extraction & NLP
- Member 2: Content Generation & Media AI
- Member 3: Q&A System & Vector Search


pip install fastapi uvicorn python-multipart PyPDF2