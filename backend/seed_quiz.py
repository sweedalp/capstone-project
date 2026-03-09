"""Seed quiz lessons and scores so Curriculum page has real data."""
import datetime
from app.core.database import SessionLocal
from app.models.module import Lesson, Module, LessonTypeEnum
from app.models.enrollment import Enrollment, Progress
from app.models.course import Course
from app.models.user import User, UserRole

db = SessionLocal()

# ── 1. Show current state ──────────────────────────────────────────────────
print("=== CURRENT LESSONS ===")
for c in db.query(Course).all():
    print(f"Course {c.id}: {c.title}")
    for m in db.query(Module).filter(Module.course_id == c.id).order_by(Module.order_index).all():
        for l in db.query(Lesson).filter(Lesson.module_id == m.id).order_by(Lesson.order_index).all():
            print(f"  lesson_id={l.id} type={l.lesson_type} \"{l.title}\"")

# ── 2. Add quiz lessons to every module that lacks one ────────────────────
print("\n=== ADDING QUIZ LESSONS ===")
for m in db.query(Module).all():
    has_quiz = db.query(Lesson).filter(
        Lesson.module_id == m.id, Lesson.lesson_type == "quiz"
    ).first()
    if not has_quiz:
        count = db.query(Lesson).filter(Lesson.module_id == m.id).count()
        quiz = Lesson(
            module_id=m.id,
            title=f"{m.title} Assessment",
            lesson_type=LessonTypeEnum.quiz,
            order_index=count + 1,
            duration_minutes=15,
        )
        db.add(quiz)
        print(f"  Added quiz: \"{quiz.title}\" (module_id={m.id})")
db.commit()

# ── 3. Show all quiz lessons ───────────────────────────────────────────────
quiz_lessons = db.query(Lesson).filter(Lesson.lesson_type == "quiz").all()
print(f"\n=== QUIZ LESSONS ({len(quiz_lessons)} total) ===")
for ql in quiz_lessons:
    m = db.query(Module).filter(Module.id == ql.module_id).first()
    print(f"  lesson_id={ql.id} course_id={m.course_id} \"{ql.title}\"")

# ── 4. Seed quiz scores (low enough to trigger problem areas) ─────────────
# Avg per quiz_idx: [47], [56], [59] — all < 65 so they appear as problem areas
# Struggle rate: set0=83%, set1=67%, set2=67% — triggers optimization plan (>35%)
score_sets = [
    [42.0, 38.0, 55.0, 45.0, 50.0, 48.0],   # avg 46 → CRITICAL
    [58.0, 52.0, 60.0, 55.0, 62.0, 50.0],   # avg 56 → warning
    [72.0, 68.0, 45.0, 55.0, 50.0, 62.0],   # avg 59 → warning
]

now = datetime.datetime.utcnow()
seeded = 0

for ql_idx, quiz_lesson in enumerate(quiz_lessons):
    mod = db.query(Module).filter(Module.id == quiz_lesson.module_id).first()
    enrs = db.query(Enrollment).filter(Enrollment.course_id == mod.course_id).all()
    scores = score_sets[ql_idx % 3]
    for i, enr in enumerate(enrs):
        already = db.query(Progress).filter(
            Progress.enrollment_id == enr.id,
            Progress.lesson_id == quiz_lesson.id,
        ).first()
        if not already:
            sv = scores[i % len(scores)]
            db.add(Progress(
                enrollment_id=enr.id,
                lesson_id=quiz_lesson.id,
                score=sv,
                is_completed=True,
                time_spent_seconds=900,
                completed_at=now - datetime.timedelta(days=i + 1),
            ))
            seeded += 1

db.commit()
print(f"\nSeeded {seeded} quiz score records")
print(f"Total progress rows with scores: {db.query(Progress).filter(Progress.score.isnot(None)).count()}")
db.close()
print("Done!")
