# AI Capstone Project - LMS & Knowledge Intelligence Platform

## Project Overview
An AI-enabled Learning & Knowledge Intelligence Platform that allows:
- **Learners** → to navigate courses, find answers, revise
- **Trainers** → to reuse and enhance materials  
- **Leadership** → to understand readiness
- **LTC** → to scale programs confidently

## Mission
Build a system that **captures, organizes, and makes intelligence reusable**.

## Project Goals
Transform raw knowledge (lectures, recordings, transcripts, slide decks, documents, exercises, Q&A discussions) into formats that can **teach, assist, and scale** without requiring a live trainer every time.

---

## Team Structure (10 Members)

### Product Direction & Priorities (1-2 members)
- Define requirements and priorities
- Coordinate between teams
- Manage project roadmap

### AI/Data/Intelligence (2-3 members)
- NLP and knowledge extraction
- AI content generation
- Model integration and training

### Application/Integrations (2-3 members)
- Backend APIs and services
- Database design
- Third-party integrations

### Frontend/UX (2-3 members)
- User interfaces for learners, trainers, leadership
- Responsive design
- Interactive features

### Demo & Documentation (1-2 members)
- Documentation and guides
- Demo preparation
- Testing and QA

---

## Project Structure

```
capstone_project/
├── backend/              # Backend services and APIs
├── frontend/             # Frontend applications
├── ai_services/          # AI/ML services and models
├── database/             # Database schemas and migrations
├── docs/                 # Documentation
├── tests/                # Testing suites
├── deployment/           # Deployment configs
└── shared/               # Shared utilities and configs
```

---

## Delivery Framework

### Stage 1 - LMS Foundation
Build the platform where:
- Users can log in
- Courses are organized and structured
- Content is uploaded
- Progress can be tracked

### Stage 2 - Knowledge → Intelligence → Learning Assets
Transform LTC's raw knowledge into formats that can **teach, assist, and scale**:
- Clean transcripts
- Topic and chapter segmentation
- Searchable concepts
- Question answering
- AI-generated media (voiceovers, videos, micro-learning clips)

---

## Minimum Deliverables

Every team must demonstrate at least one AI-generated learning enhancement:
- ✅ Narrated summary
- ✅ Q&A interface
- ✅ Guided walkthrough
- ✅ Revision assistant

---

## Technology Stack

### Backend
- **Language**: Python/Node.js
- **Framework**: FastAPI/Express.js
- **Database**: PostgreSQL/MongoDB
- **Cache**: Redis

### Frontend
- **Framework**: React with JavaScript
- **UI Library**: Material-UI/Tailwind CSS
- **State Management**: Zustand

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud**: AWS/Azure/GCP

---

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- Docker & Docker Compose
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd capstone_project

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup frontend
cd ../frontend
npm install

# Setup AI services (install video agent dependencies)
cd ai_services/ai-video-chat-agent
pip install -r requirements.txt

# Run all backend services (from project root)
cd ../../
python start_all.py
```

# Run frontend (in a separate terminal)
cd frontend
npm run dev

### Environment Variables
Copy `.env.example` to `.env` and configure your API keys and database credentials.

---

## Team Collaboration Guidelines

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fixes

### Commit Convention
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(api): add course creation endpoint
```

### Code Review
- All PRs require at least 1 approval
- Run tests before submitting PR
- Keep PRs focused and small

---

## License
[Your License Here]

---

## Contact
- **Team Lead**: [Name]
- **Email**: sweedalpinto97@gmail.com
- **GitHub**: sweedalp
