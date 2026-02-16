# Team Assignment & Contact Information

## Team Members

### Team 1: Product Direction & Priorities
**Role:** Define requirements, manage roadmap, coordinate teams

| Name | Email | GitHub | Focus Area |
|------|-------|--------|------------|
| Member 1 | member1@example.com | @member1 | Product Management |
| Member 2 | member2@example.com | @member2 | Requirements & UX Research |

**Responsibilities:**
- Product roadmap and feature prioritization
- User stories and acceptance criteria
- Sprint planning and backlog management
- Stakeholder communication

**Key Deliverables:**
- Product Requirements Document (PRD)
- User stories with acceptance criteria
- Sprint planning documents
- Wireframes and user flows

---

### Team 2: AI/Data/Intelligence
**Role:** Build AI capabilities for knowledge extraction and content generation

| Name | Email | GitHub | Focus Area |
|------|-------|--------|------------|
| Member 3 | member3@example.com | @member3 | Knowledge Extraction & NLP |
| Member 4 | member4@example.com | @member4 | Content Generation (TTS, Video) |
| Member 5 | member5@example.com | @member5 | Q&A System & Vector Search |

**Responsibilities:**
- Knowledge extraction from transcripts and documents
- AI-powered content generation (MANDATORY: narrated summaries)
- Question answering with RAG
- Semantic search implementation

**Key Deliverables:**
- ✅ Narrated summary generation
- ✅ Q&A interface
- ✅ Knowledge extraction pipeline
- ✅ At least ONE working AI feature

**Tech Stack:** Python, OpenAI, LangChain, Pinecone, ElevenLabs

**Directory:** `/ai_services/`

---

### Team 3: Application/Integrations
**Role:** Backend API development and system integration

| Name | Email | GitHub | Focus Area |
|------|-------|--------|------------|
| Member 6 | member6@example.com | @member6 | Backend API & Authentication |
| Member 7 | member7@example.com | @member7 | Database & Course Management |
| Member 8 | member8@example.com | @member8 | Integrations & Services |

**Responsibilities:**
- RESTful API development
- Database design and implementation
- Authentication and authorization
- Integration with AI services and third-party APIs

**Key Deliverables:**
- Complete API endpoints (auth, courses, progress)
- Database schema and migrations
- JWT authentication
- API documentation

**Tech Stack:** FastAPI, PostgreSQL, MongoDB, SQLAlchemy

**Directory:** `/backend/`

---

### Team 4: Frontend/UX
**Role:** User interface development

| Name | Email | GitHub | Focus Area |
|------|-------|--------|------------|
| Member 9 | member9@example.com | @member9 | Learner Interface |
| Member 10 | member10@example.com | @member10 | Trainer & Leadership Dashboards |

**Responsibilities:**
- Learner dashboard and course viewing
- Trainer content management interface
- Leadership analytics dashboard
- Responsive design and UX

**Key Deliverables:**
- Learner interface (courses, learning, progress)
- Trainer interface (course creation, content upload)
- Leadership dashboard (analytics, readiness)
- Responsive, accessible UI

**Tech Stack:** React, TypeScript, Material-UI, React Router

**Directory:** `/frontend/`

---

## Communication

### Primary Communication Channel
- **Platform:** Slack / Discord / Microsoft Teams
- **Channel:** #capstone-project

### Meetings
- **Daily Standup:** 10:00 AM (15 minutes)
- **Weekly Review:** Friday 3:00 PM (1 hour)
- **Sprint Planning:** Every 2 weeks

### Code Reviews
- All PRs require at least 1 approval
- Tag relevant team members for review
- Respond to reviews within 24 hours

### Emergency Contact
- **Team Lead:** [Name]
- **Email:** sweedalpinto97@gmail.com
- **Phone:** [Optional]

---

## Collaboration Guidelines

### Branch Naming Convention
```
feature/{team}-{feature-name}
bugfix/{description}
hotfix/{critical-issue}

Examples:
feature/ai-narrated-summaries
feature/frontend-learner-dashboard
bugfix/login-validation
```

### Commit Message Format
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scopes: backend, frontend, ai, db, docs

Examples:
feat(ai): add narrated summary generation
fix(backend): resolve authentication token issue
docs(team): update team assignments
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests pass

## Related Issues
Closes #123

## Screenshots (if applicable)
```

---

## Inter-Team Dependencies

### Backend → AI Services
Backend team calls AI services for:
- Content processing
- Summary generation
- Q&A functionality

### Frontend → Backend
Frontend consumes backend APIs for:
- Authentication
- Course data
- Progress tracking
- User management

### AI Team → Backend
AI team needs from backend:
- Course and lesson content
- User context for personalization
- Storage for generated content

---

## Issue Tracking

### Labels
- `priority-high` - Must be completed this sprint
- `priority-medium` - Important but not urgent
- `priority-low` - Nice to have
- `bug` - Something broken
- `feature` - New functionality
- `docs` - Documentation
- `question` - Need clarification

### Assigning Issues
- Product team creates issues
- Technical teams pick up issues from backlog
- Assign yourself when starting work
- Move through: To Do → In Progress → Review → Done

---

## Quick Links

- **GitHub Repository:** [Add URL]
- **Project Board:** [Add URL]
- **Documentation:** `/docs/`
- **API Docs (Swagger):** http://localhost:8000/docs
- **Design Files:** [Add Figma/Miro link]
- **Team Drive:** [Add link]

---

## Work Distribution

### Week 1-2: Setup & Foundation
- **Product:** Requirements gathering, user stories
- **Backend:** API structure, database setup
- **Frontend:** Project setup, component library
- **AI:** Environment setup, API exploration

### Week 3-4: Core Features
- **Product:** Prioritization, wireframes
- **Backend:** Auth, courses, content APIs
- **Frontend:** Learner interface, course viewer
- **AI:** Knowledge extraction, basic processing

### Week 5-6: AI Integration
- **Product:** Feature refinement
- **Backend:** AI service integration
- **Frontend:** AI features UI (search, Q&A)
- **AI:** Narrated summaries, Q&A system (MANDATORY)

### Week 7-8: Polish & Demo
- **All Teams:** Bug fixes, testing
- **Product:** Demo preparation
- **Frontend:** UI polish, responsiveness
- **AI:** Optimize generation quality

---

**Last Updated:** February 16, 2026  
**Maintained by:** Product Team
