# Quick Start Guide

## Prerequisites

Before starting, ensure you have the following installed:
- **Python 3.9+** ([Download](https://www.python.org/downloads/))
- **Node.js 16+** ([Download](https://nodejs.org/))
- **PostgreSQL 14+** ([Download](https://www.postgresql.org/download/))
- **MongoDB 6+** ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/downloads))
- **Docker** (Optional, recommended) ([Download](https://www.docker.com/))

## Installation Steps

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd capstone_project
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env and add your API keys
```

3. **Start all services with Docker Compose**
```bash
docker-compose up -d
```

4. **Access the applications**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- AI Services: http://localhost:8001
- API Docs: http://localhost:8000/docs

### Option 2: Manual Setup

#### Step 1: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup database
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE lms_db;
\q

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000

#### Step 2: Setup Frontend

```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

#### Step 3: Setup AI Services

```bash
# Navigate to ai_services directory (new terminal)
cd ai_services

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download required models
python -m spacy download en_core_web_sm

# Start AI services
python main.py
```

AI Services will be available at: http://localhost:8001

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lms_db
MONGODB_URL=mongodb://localhost:27017/lms_knowledge
REDIS_URL=redis://localhost:6379

# API Keys
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
PINECONE_API_KEY=your_pinecone_key

# Application
SECRET_KEY=your_secret_key_here
JWT_SECRET=your_jwt_secret_here
```

### API Keys Setup

1. **OpenAI API Key** (Required for AI features)
   - Sign up at https://platform.openai.com
   - Generate API key from dashboard
   - Add to `.env` file

2. **ElevenLabs API Key** (Required for text-to-speech)
   - Sign up at https://elevenlabs.io
   - Get API key from settings
   - Add to `.env` file

3. **Pinecone API Key** (Required for vector search)
   - Sign up at https://www.pinecone.io
   - Create project and get API key
   - Add to `.env` file

## Testing the Setup

### Test Backend
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

### Test Frontend
Open browser to http://localhost:3000
You should see the LMS dashboard.

### Test AI Services
```bash
curl http://localhost:8001/health
# Expected: {"status": "healthy"}
```

## Common Issues & Solutions

### Port Already in Use
```bash
# Windows - Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify database exists: `psql -U postgres -l`

### Module Not Found Error
- Make sure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Node Modules Error
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Default Login Credentials

After running database initialization:

**Admin Account:**
- Email: admin@lms.com
- Username: admin
- Password: admin123

**Trainer Account:**
- Email: trainer@lms.com
- Username: trainer
- Password: admin123

**Learner Account:**
- Email: learner@lms.com
- Username: learner
- Password: admin123

⚠️ **Change these passwords in production!**

## Next Steps

1. **For Developers:**
   - Read [TEAM_GUIDE.md](docs/TEAM_GUIDE.md) for team collaboration
   - Check [API.md](docs/API.md) for API documentation
   - See [TESTING.md](docs/TESTING.md) for testing guidelines

2. **For Product Team:**
   - Define user stories and requirements
   - Create wireframes for key pages
   - Prioritize features for MVP

3. **For AI Team:**
   - Test knowledge extraction pipeline
   - Implement narrated summary generation
   - Set up vector database

4. **For Frontend Team:**
   - Design component library
   - Implement learner dashboard
   - Create course viewing interface

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Push to remote: `git push origin feature/your-feature`
4. Create Pull Request on GitHub
5. Wait for review and approval
6. Merge to `develop` branch

## Getting Help

- Check documentation in `/docs` directory
- Ask in team communication channel
- Create GitHub issue for bugs
- Contact team lead: sweedalpinto97@gmail.com

## Useful Commands

```bash
# Backend
cd backend
python -m pytest                    # Run tests
alembic revision -m "message"      # Create migration
alembic upgrade head               # Apply migrations

# Frontend
cd frontend
npm run build                      # Build for production
npm run preview                    # Preview production build
npm run lint                       # Lint code

# Docker
docker-compose up -d               # Start all services
docker-compose down                # Stop all services
docker-compose logs -f backend     # View backend logs
docker-compose ps                  # List running services

# Git
git status                         # Check status
git add .                          # Stage all changes
git commit -m "message"           # Commit changes
git pull origin develop            # Pull latest changes
```

---

**Happy Coding! 🚀**

For detailed documentation, visit the `/docs` directory.
