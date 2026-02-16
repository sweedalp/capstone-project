# Database Schema Documentation

## Overview
The LMS platform uses PostgreSQL for relational data and MongoDB for unstructured content/knowledge storage.

## PostgreSQL Schema

### Users Table
Stores user information for learners, trainers, and leadership.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) CHECK (role IN ('learner', 'trainer', 'leadership', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

### Courses Table
Stores course information.

```sql
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    trainer_id INTEGER REFERENCES users(id),
    thumbnail_url VARCHAR(500),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_trainer ON courses(trainer_id);
CREATE INDEX idx_courses_published ON courses(is_published);
```

### Modules Table
Organizes course content into modules.

```sql
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modules_course ON modules(course_id);
```

### Lessons Table
Individual lessons within modules.

```sql
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50),
    content_url VARCHAR(500),
    transcript TEXT,
    duration_minutes INTEGER,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lessons_module ON lessons(module_id);
```

### Enrollments Table
Tracks user course enrollments.

```sql
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
```

### Progress Table
Tracks learner progress through lessons.

```sql
CREATE TABLE progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    last_position INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_progress_lesson ON progress(lesson_id);
```

## MongoDB Collections

### knowledge_base
Stores extracted knowledge and intelligence.

```javascript
{
  _id: ObjectId,
  course_id: Integer,
  lesson_id: Integer,
  content_type: String, // "transcript", "summary", "concept", "topic"
  title: String,
  content: String,
  metadata: {
    extracted_at: Date,
    topics: [String],
    concepts: [String],
    key_takeaways: [String]
  },
  embeddings: [Float], // Vector embeddings for semantic search
  created_at: Date
}
```

### ai_generated_content
Stores AI-generated learning materials.

```javascript
{
  _id: ObjectId,
  course_id: Integer,
  lesson_id: Integer,
  content_type: String, // "narrated_summary", "explainer_video", "micro_clip", "quiz"
  title: String,
  content_url: String,
  metadata: {
    duration: Integer,
    voice: String,
    script: String,
    language: String
  },
  created_at: Date
}
```

### qa_history
Stores Q&A interactions for analytics.

```javascript
{
  _id: ObjectId,
  user_id: Integer,
  course_id: Integer,
  question: String,
  answer: String,
  sources: [String],
  confidence: Float,
  helpful: Boolean,
  created_at: Date
}
```

## Relationships

```
users (1) ----< (N) enrollments (N) >---- (1) courses
users (1) ----< (N) progress (N) >---- (1) lessons
courses (1) ----< (N) modules (N) >---- (1) lessons
users (TRAINER) (1) ----< (N) courses
```

## Indexes for Performance

- Email and username for fast user lookup
- Course and user IDs in enrollments for quick enrollment checks
- User and lesson IDs in progress for progress tracking
- MongoDB indexes on course_id, lesson_id, and content_type
- Vector index on embeddings for semantic search

## Migration Commands

```bash
# Initialize Alembic
cd backend
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head
```
