"""
Search & QA Endpoint
GET /api/v1/search?q=&type=&course_id=
POST /api/v1/search/qa
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.module import Module, Lesson
from app.models.course import Course
from app.models.enrollment import Enrollment

router = APIRouter()


@router.get("/")
def search(
    q: str = Query(..., min_length=1),
    type: Optional[str] = Query(None),  # "course" | "lesson" | "all"
    course_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = []

    # Tokenize query so "What is a function?" matches lessons with "function"
    stop_words = {"what", "is", "a", "an", "the", "how", "do", "does", "why",
                  "when", "where", "explain", "tell", "me", "about", "to", "of"}
    tokens = [
        word.strip("?.,!").lower()
        for word in q.split()
        if word.strip("?.,!").lower() not in stop_words and len(word.strip("?.,!")) > 2
    ]
    # Fall back to full query if all words were stop words
    if not tokens:
        tokens = [q.lower()]

    def make_filters(col):
        return or_(*[func.lower(col).like(f"%{t}%") for t in tokens])

    # ── Search Courses ────────────────────────────────────────────────
    if type in (None, "all", "course"):
        courses = db.query(Course).filter(
            Course.is_published == True,
            or_(make_filters(Course.title), make_filters(Course.description)),
        ).offset(skip).limit(limit).all()

        for c in courses:
            results.append({
                "id": f"course-{c.id}",
                "type": "course",
                "title": c.title,
                "description": c.description,
                "thumbnail_url": c.thumbnail_url,
                "level": c.level.value if c.level else None,
                "course_id": c.id,
                "course_title": c.title,
                "url": f"/learner/courses/{c.id}",
            })

    # ── Search Lessons ────────────────────────────────────────────────
    if type in (None, "all", "lesson"):
        lesson_query = (
            db.query(Lesson, Module, Course)
            .join(Module, Module.id == Lesson.module_id)
            .join(Course, Course.id == Module.course_id)
            .filter(
                Course.is_published == True,
                or_(make_filters(Lesson.title), make_filters(Module.title)),
            )
        )

        if course_id:
            lesson_query = lesson_query.filter(Course.id == course_id)

        lessons = lesson_query.offset(skip).limit(limit).all()

        for lesson, module, course in lessons:
            results.append({
                "id": f"lesson-{lesson.id}",
                "type": "lesson",
                "title": lesson.title,
                "description": f"{course.title} • {module.title}",
                "thumbnail_url": course.thumbnail_url,
                "lesson_type": lesson.lesson_type.value if lesson.lesson_type else "text",
                "duration_minutes": lesson.duration_minutes,
                "course_id": course.id,
                "course_title": course.title,
                "module_title": module.title,
                "lesson_id": lesson.id,
                "url": f"/learner/courses/{course.id}/lessons/{lesson.id}",
            })

    return {
        "query": q,
        "total": len(results),
        "results": results,
    }


@router.get("/suggestions")
def get_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id
    ).limit(3).all()

    suggestions = []
    seen = set()

    def add(s: str):
        key = s.strip().lower()
        if key not in seen and len(suggestions) < 5:
            seen.add(key)
            suggestions.append(s.strip())

    for enr in enrollments:
        course = db.query(Course).filter(Course.id == enr.course_id).first()
        if not course:
            continue
        # Use course title (short enough to be a good suggestion)
        add(f"What is {course.title}?")
        # Use first lesson title (more specific than module title)
        first_lesson = (
            db.query(Lesson)
            .join(Module, Module.id == Lesson.module_id)
            .filter(Module.course_id == course.id)
            .order_by(Module.order_index, Lesson.order_index)
            .first()
        )
        if first_lesson:
            add(f"Explain {first_lesson.title}")

    generic = [
        "How do loops work?",
        "Explain variables and data types",
        "What is object oriented programming?",
        "How to use if-else statements?",
        "What is a function?",
    ]
    for g in generic:
        add(g)

    return {"suggestions": suggestions[:5]}


@router.post("/qa")
def ask_question(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import os
    from openai import AzureOpenAI

    question = payload.get("question", "").strip()
    course_id = payload.get("course_id")

    if not question:
        return {"answer": None, "sources": [], "error": "Question is required"}

    stop_words = {"what", "is", "a", "an", "the", "how", "do", "does", "why",
                  "when", "where", "explain", "tell", "me", "about", "to", "of"}
    tokens = [
        word.strip("?.,!").lower()
        for word in question.split()
        if word.strip("?.,!").lower() not in stop_words and len(word.strip("?.,!")) > 2
    ]
    if not tokens:
        tokens = [question.lower()]

    def make_filters(col):
        return or_(*[func.lower(col).like(f"%{t}%") for t in tokens])

    lesson_query = (
        db.query(Lesson, Module, Course)
        .join(Module, Module.id == Lesson.module_id)
        .join(Course, Course.id == Module.course_id)
        .filter(
            Course.is_published == True,
            or_(
                make_filters(Lesson.title),
                make_filters(Module.title),
                make_filters(Course.title),
            ),
        )
    )
    if course_id:
        lesson_query = lesson_query.filter(Course.id == course_id)

    relevant = lesson_query.limit(3).all()

    sources = []
    context_text = ""
    for lesson, module, course in relevant:
        sources.append({
            "lesson_id": lesson.id,
            "lesson_title": lesson.title,
            "course_id": course.id,
            "course_title": course.title,
            "module_title": module.title,
            "url": f"/learner/courses/{course.id}/lessons/{lesson.id}",
        })
        context_text += f"- {lesson.title} (Course: {course.title}, Module: {module.title})\n"

    try:
        client = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview"),
        )
        system_prompt = (
            "You are a helpful AI tutor for an online learning platform. "
            "Answer any question clearly and concisely. "
            "If the question relates to course content provided below, use it. "
            "Otherwise answer from your general knowledge.\n\n"
        )
        if context_text:
            system_prompt += f"Related course content:\n{context_text}"

        response = client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT", "gpt-4o"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question},
            ],
            temperature=0.5,
            max_tokens=500,
        )
        answer = response.choices[0].message.content.strip()
    except Exception as e:
        answer = f"AI service unavailable: {str(e)}"

    return {
        "question": question,
        "answer": answer,
        "sources": sources,
        "ai_generated": True,
    }