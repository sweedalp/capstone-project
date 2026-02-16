# Testing Guide

## Overview
This document outlines the testing strategy for the LMS & Knowledge Intelligence Platform.

## Testing Structure

```
tests/
├── backend/              # Backend API tests
│   ├── test_auth.py
│   ├── test_courses.py
│   ├── test_progress.py
│   └── test_analytics.py
├── frontend/             # Frontend component tests
│   ├── components/
│   └── pages/
├── ai_services/          # AI services tests
│   ├── test_knowledge_extraction.py
│   ├── test_content_generation.py
│   └── test_qa_system.py
├── integration/          # Integration tests
│   └── test_e2e.py
└── conftest.py          # Shared fixtures
```

## Backend Testing

### Setup
```bash
cd backend
pip install pytest pytest-asyncio pytest-cov
```

### Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

### Example Test
```python
# tests/backend/test_auth.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user():
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpass123",
        "full_name": "Test User"
    })
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"

def test_login_success():
    response = client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "testpass123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_credentials():
    response = client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
```

## Frontend Testing

### Setup
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Example Component Test
```typescript
// tests/frontend/components/CourseCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CourseCard from '@/components/CourseCard';

describe('CourseCard', () => {
  it('renders course title and description', () => {
    const course = {
      id: 1,
      title: 'Test Course',
      description: 'Test Description'
    };

    render(<CourseCard course={course} />);
    
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});
```

## AI Services Testing

### Example Test
```python
# tests/ai_services/test_knowledge_extraction.py
import pytest
from knowledge_extraction.extractor import KnowledgeExtractor

@pytest.fixture
def extractor():
    return KnowledgeExtractor()

def test_clean_transcript(extractor):
    raw_text = "Um, so, like, today we'll, uh, learn about AI."
    cleaned = extractor.clean_transcript(raw_text)
    
    assert "Um" not in cleaned
    assert "uh" not in cleaned
    assert "AI" in cleaned

def test_extract_key_takeaways(extractor):
    content = """
    Artificial Intelligence is transforming industries.
    Machine learning is a subset of AI.
    Deep learning uses neural networks.
    """
    
    takeaways = extractor.extract_key_takeaways(content, num_points=3)
    
    assert len(takeaways) <= 3
    assert any("AI" in t or "Artificial Intelligence" in t for t in takeaways)
```

## Integration Testing

### Example E2E Test
```python
# tests/integration/test_e2e.py
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_complete_user_journey():
    # 1. Register user
    register_response = client.post("/api/auth/register", json={
        "email": "learner@test.com",
        "username": "learner123",
        "password": "pass123",
        "role": "learner"
    })
    assert register_response.status_code == 201
    
    # 2. Login
    login_response = client.post("/api/auth/login", json={
        "username": "learner123",
        "password": "pass123"
    })
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    # 3. Get courses
    headers = {"Authorization": f"Bearer {token}"}
    courses_response = client.get("/api/courses", headers=headers)
    assert courses_response.status_code == 200
    
    # 4. Enroll in course
    course_id = courses_response.json()["items"][0]["id"]
    enroll_response = client.post(
        f"/api/courses/{course_id}/enroll",
        headers=headers
    )
    assert enroll_response.status_code == 200
    
    # 5. Check progress
    progress_response = client.get(
        f"/api/progress/me",
        headers=headers
    )
    assert progress_response.status_code == 200
```

## Test Coverage Goals

- **Backend**: > 80% code coverage
- **Frontend**: > 70% code coverage
- **AI Services**: > 75% code coverage
- **Critical paths**: 100% coverage

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-cov
      - name: Run tests
        run: |
          cd backend
          pytest --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      - name: Run tests
        run: |
          cd frontend
          npm test
```

## Manual Testing Checklist

### Authentication
- [ ] User can register with valid credentials
- [ ] User cannot register with duplicate email
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong password
- [ ] JWT token works for protected routes

### Course Management
- [ ] Trainer can create course
- [ ] Learner can view published courses
- [ ] Learner can enroll in course
- [ ] Progress is tracked correctly
- [ ] Course completion works

### AI Features
- [ ] Narrated summary generation works
- [ ] Q&A system returns relevant answers
- [ ] Semantic search finds correct content
- [ ] Content generation completes successfully

### Analytics
- [ ] Leadership dashboard shows correct metrics
- [ ] Charts render properly
- [ ] Filters work correctly
- [ ] Export functionality works

## Performance Testing

```python
# tests/performance/test_load.py
import pytest
from locust import HttpUser, task, between

class LMSUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(3)
    def view_courses(self):
        self.client.get("/api/courses")
    
    @task(1)
    def generate_summary(self):
        self.client.post("/api/ai/generate-summary", json={
            "text": "Sample content...",
            "voice": "female"
        })
```

Run with:
```bash
locust -f tests/performance/test_load.py
```

## Security Testing

- [ ] SQL injection testing
- [ ] XSS vulnerability testing
- [ ] CSRF protection verification
- [ ] Authentication bypass attempts
- [ ] Rate limiting verification
- [ ] API key exposure check
