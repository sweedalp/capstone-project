# Backend - LMS & Knowledge Intelligence Platform

## Overview
RESTful API backend for the LMS platform with AI integration capabilities.

## Structure
```
backend/
├── app/
│   ├── api/              # API routes
│   ├── core/             # Core functionality
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   ├── schemas/          # Pydantic schemas
│   └── utils/            # Utility functions
├── tests/                # Backend tests
├── requirements.txt      # Python dependencies
└── main.py              # Application entry point
```

## Tech Stack
- **Framework**: FastAPI
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL + MongoDB
- **Authentication**: JWT
- **Documentation**: Auto-generated (Swagger/OpenAPI)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course (trainer/admin)
- `GET /api/courses/{id}` - Get course details
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### Content
- `POST /api/content/upload` - Upload learning materials
- `GET /api/content/{id}` - Get content
- `DELETE /api/content/{id}` - Delete content

### Knowledge Base
- `POST /api/knowledge/process` - Process raw content into structured knowledge
- `GET /api/knowledge/search` - Search knowledge base
- `GET /api/knowledge/{id}` - Get knowledge item

### AI Services
- `POST /api/ai/summarize` - Generate summary
- `POST /api/ai/qa` - Question answering
- `POST /api/ai/generate-video` - Generate explainer video
- `POST /api/ai/tts` - Text to speech

### User Progress
- `GET /api/progress/{user_id}` - Get user progress
- `POST /api/progress/update` - Update progress

### Analytics (Leadership)
- `GET /api/analytics/overview` - Platform overview
- `GET /api/analytics/readiness` - Team readiness metrics

## Running the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Environment Variables
See `.env.example` in the root directory.

## Database Migrations
```bash
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Team Assignment
**Application/Integrations Team (2-3 members)**
- Member 1: Authentication & User Management
- Member 2: Course & Content Management
- Member 3: API Integration & Backend Services
