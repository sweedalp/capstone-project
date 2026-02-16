# Project Structure Overview

## Complete Directory Tree

```
capstone_project/
├── .github/                      # GitHub Actions & CI/CD
│   └── workflows/
│       └── ci-cd.yml            # Automated testing & deployment
│
├── ai_services/                  # AI/ML Services (Team 2)
│   ├── knowledge_extraction/    # Extract structured knowledge
│   │   ├── __init__.py
│   │   └── extractor.py         # Knowledge extraction logic
│   ├── content_generation/      # Generate AI content
│   │   ├── __init__.py
│   │   └── generator.py         # Content generation (TTS, video)
│   ├── qa_system/               # Question Answering
│   │   ├── __init__.py
│   │   └── qa.py                # RAG-based Q&A system
│   ├── Dockerfile               # AI services container
│   ├── main.py                  # AI services entry point
│   ├── README.md                # AI services documentation
│   └── requirements.txt         # Python dependencies
│
├── backend/                      # Backend API (Team 3)
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   ├── __init__.py
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   └── courses.py       # Course management endpoints
│   │   ├── core/                # Core functionality
│   │   │   ├── config.py        # Application configuration
│   │   │   └── database.py      # Database connection
│   │   ├── models/              # Database models
│   │   │   ├── __init__.py
│   │   │   ├── user.py          # User model
│   │   │   └── course.py        # Course, Module, Lesson models
│   │   ├── schemas/             # Pydantic schemas
│   │   │   └── __init__.py
│   │   ├── services/            # Business logic
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── Dockerfile               # Backend container
│   ├── main.py                  # FastAPI application
│   ├── README.md                # Backend documentation
│   └── requirements.txt         # Python dependencies
│
├── database/                     # Database schemas & migrations
│   ├── init.sql                 # Initial database setup
│   └── SCHEMA.md                # Database schema documentation
│
├── docs/                         # Project documentation
│   ├── API.md                   # API endpoint documentation
│   ├── TEAM_GUIDE.md            # Team collaboration guide
│   └── TESTING.md               # Testing guidelines
│
├── frontend/                     # React Frontend (Team 4)
│   ├── src/
│   │   ├── services/            # API services
│   │   │   └── api.js           # API client
│   │   ├── App.jsx              # Main App component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── Dockerfile               # Frontend container
│   ├── index.html               # HTML template
│   ├── package.json             # Node dependencies
│   ├── README.md                # Frontend documentation
│   └── vite.config.js           # Vite configuration
│
├── shared/                       # Shared utilities
│   └── README.md                # Shared resources documentation
│
├── tests/                        # Test suites (Team 5)
│   └── README.md                # Testing documentation
│
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── docker-compose.yml           # Docker services configuration
├── GETTING_STARTED.md           # Quick start guide
├── README.md                    # Main project README
└── TEAM_ASSIGNMENTS.md          # Team member assignments
```

## Key Files by Team

### Team 1: Product Direction & Priorities
**Documentation & Planning:**
- `README.md` - Project overview
- `TEAM_ASSIGNMENTS.md` - Team member assignments
- `docs/TEAM_GUIDE.md` - Collaboration guidelines

**Responsibilities:**
- Maintain project documentation
- Define user stories and requirements
- Coordinate between teams

---

### Team 2: AI/Data/Intelligence
**Working Directory:** `/ai_services/`

**Key Files:**
- `ai_services/main.py` - AI services API
- `knowledge_extraction/extractor.py` - Knowledge extraction
- `content_generation/generator.py` - Content generation (MANDATORY)
- `qa_system/qa.py` - Question answering system

**Must Implement:**
- ✅ Narrated summary generation
- ✅ Q&A interface with RAG
- ✅ Knowledge extraction pipeline

---

### Team 3: Application/Integrations
**Working Directory:** `/backend/`

**Key Files:**
- `backend/main.py` - FastAPI application
- `app/api/auth.py` - Authentication routes
- `app/api/courses.py` - Course management routes
- `app/models/user.py` - User model
- `app/models/course.py` - Course models
- `app/core/database.py` - Database connection

**Must Implement:**
- User authentication (JWT)
- Course CRUD operations
- Progress tracking
- Integration with AI services

---

### Team 4: Frontend/UX
**Working Directory:** `/frontend/`

**Key Files:**
- `frontend/src/App.tsx` - Main application
- `src/services/api.ts` - API client
- `src/types/index.ts` - TypeScript definitions

**Must Implement:**
- Learner dashboard
- Course viewing interface
- Trainer content management
- Leadership analytics dashboard

---

### Team 5: Demo & Documentation
**Working Directory:** `/docs/` and `/tests/`

**Key Files:**
- `docs/API.md` - API documentation
- `docs/TESTING.md` - Testing guide
- `tests/` - Test files

**Must Create:**
- Complete API documentation
- Testing guide and test coverage
- Demo video/presentation
- User manuals

---

## Getting Started for Each Team

### Team 2 (AI Services)
```bash
cd ai_services
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Team 3 (Backend)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Team 4 (Frontend)
```bash
cd frontend
npm install
npm run dev
```

---

## Development Workflow

1. **Choose a task** from the project board
2. **Create a branch**: `git checkout -b feature/your-feature`
3. **Make changes** in your team's directory
4. **Test your changes** locally
5. **Commit**: `git commit -m "feat: description"`
6. **Push**: `git push origin feature/your-feature`
7. **Create Pull Request** on GitHub
8. **Get review** from team member
9. **Merge** after approval

---

## Quick Commands

```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f ai_services
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Run tests
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test

# AI Services
cd ai_services && pytest
```

---

## Important Links

- **API Documentation:** http://localhost:8000/docs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **AI Services:** http://localhost:8001

---

## Next Steps

1. **All Teams:**
   - Read [GETTING_STARTED.md](GETTING_STARTED.md)
   - Set up development environment
   - Configure API keys in `.env`

2. **Product Team:**
   - Define user stories
   - Create wireframes
   - Prioritize features

3. **Technical Teams:**
   - Review architecture
   - Set up local environment
   - Start implementing assigned features

---

**Project Start Date:** February 16, 2026  
**GitHub:** sweedalp  
**Email:** sweedalpinto97@gmail.com
