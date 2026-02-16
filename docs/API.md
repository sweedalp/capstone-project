# API Documentation

## Base URL
- Development: `http://localhost:8000`
- Production: `https://api.lms.yourdomain.com`

## Authentication
All protected endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "securepassword",
  "full_name": "John Doe",
  "role": "learner"
}

Response 201:
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "John Doe",
  "role": "learner",
  "created_at": "2026-02-16T10:00:00Z"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "username",
  "password": "securepassword"
}

Response 200:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "username",
    "email": "user@example.com",
    "role": "learner"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response 200:
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "John Doe",
  "role": "learner"
}
```

---

## Course Endpoints

### List Courses
```http
GET /api/courses?page=1&limit=10
Authorization: Bearer <token>

Response 200:
{
  "items": [
    {
      "id": 1,
      "title": "Introduction to AI",
      "description": "Learn the basics of AI",
      "trainer_id": 2,
      "thumbnail_url": "/uploads/course1.jpg",
      "is_published": true,
      "created_at": "2026-02-01T10:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### Create Course (Trainer/Admin only)
```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Advanced Python Programming",
  "description": "Deep dive into Python",
  "is_published": false
}

Response 201:
{
  "id": 2,
  "title": "Advanced Python Programming",
  "description": "Deep dive into Python",
  "trainer_id": 2,
  "is_published": false,
  "created_at": "2026-02-16T10:00:00Z"
}
```

### Get Course Details
```http
GET /api/courses/{course_id}
Authorization: Bearer <token>

Response 200:
{
  "id": 1,
  "title": "Introduction to AI",
  "description": "Learn the basics of AI",
  "trainer": {
    "id": 2,
    "full_name": "Jane Trainer"
  },
  "modules": [
    {
      "id": 1,
      "title": "Module 1: Basics",
      "lessons": [
        {
          "id": 1,
          "title": "What is AI?",
          "content_type": "video",
          "duration_minutes": 15
        }
      ]
    }
  ]
}
```

---

## AI Services Endpoints

### Generate Narrated Summary
```http
POST /api/ai/generate-summary
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Long transcript text here...",
  "voice": "female",
  "language": "en"
}

Response 200:
{
  "summary_text": "This lesson covers...",
  "audio_url": "/media/summaries/xyz.mp3",
  "duration": 45,
  "created_at": "2026-02-16T10:00:00Z"
}
```

### Question Answering
```http
POST /api/ai/qa
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "What is machine learning?",
  "course_id": 1
}

Response 200:
{
  "question": "What is machine learning?",
  "answer": "Machine learning is a subset of AI that...",
  "sources": [
    {
      "lesson_id": 3,
      "title": "Introduction to ML",
      "relevance": 0.95
    }
  ],
  "confidence": 0.92
}
```

### Semantic Search
```http
POST /api/knowledge/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "neural networks",
  "course_id": 1,
  "limit": 5
}

Response 200:
{
  "results": [
    {
      "id": "abc123",
      "title": "Neural Network Basics",
      "content": "Neural networks are...",
      "lesson_id": 5,
      "relevance": 0.89
    }
  ]
}
```

---

## Progress Tracking

### Get User Progress
```http
GET /api/progress/{user_id}
Authorization: Bearer <token>

Response 200:
{
  "user_id": 1,
  "courses": [
    {
      "course_id": 1,
      "title": "Introduction to AI",
      "progress_percentage": 65,
      "completed_lessons": 13,
      "total_lessons": 20,
      "last_accessed": "2026-02-15T14:30:00Z"
    }
  ]
}
```

### Update Progress
```http
POST /api/progress/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "lesson_id": 3,
  "completed": true,
  "last_position": 0
}

Response 200:
{
  "message": "Progress updated successfully",
  "progress": {
    "lesson_id": 3,
    "completed": true,
    "completed_at": "2026-02-16T10:00:00Z"
  }
}
```

---

## Analytics (Leadership)

### Get Platform Overview
```http
GET /api/analytics/overview
Authorization: Bearer <token>

Response 200:
{
  "total_users": 150,
  "total_courses": 12,
  "active_learners": 98,
  "completion_rate": 72.5,
  "avg_progress": 58.3
}
```

### Get Team Readiness
```http
GET /api/analytics/readiness?team_id=5
Authorization: Bearer <token>

Response 200:
{
  "team_id": 5,
  "team_name": "Engineering Team",
  "members": 15,
  "readiness_score": 78,
  "courses_completed": 45,
  "courses_in_progress": 23,
  "skills_acquired": ["Python", "Machine Learning", "APIs"]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid input data",
  "errors": {
    "email": ["Invalid email format"]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users
- AI generation endpoints: 10 requests per minute

## Pagination
All list endpoints support pagination:
- `?page=1` - Page number (default: 1)
- `?limit=10` - Items per page (default: 10, max: 100)
