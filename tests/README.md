# Testing Directory

This directory contains all test files for the project.

## Structure

```
tests/
├── backend/              # Backend API tests
│   ├── test_auth.py
│   ├── test_courses.py
│   └── test_progress.py
├── frontend/             # Frontend component tests
│   ├── components/
│   └── pages/
├── ai_services/          # AI services tests
│   ├── test_extraction.py
│   └── test_generation.py
└── integration/          # Integration tests
    └── test_e2e.py
```

## Running Tests

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app --cov-report=html
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### AI Services Tests
```bash
cd ai_services
pytest
```

## Writing Tests

See [docs/TESTING.md](../docs/TESTING.md) for detailed testing guidelines.
