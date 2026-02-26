"""
Database Seed Script
Populates the database with sample data so the frontend has real data to display.

Run:  python -m app.seed
"""

from app.core.database import SessionLocal, engine, Base
from app.models import *  # noqa: F401, F403
from app.core.security import hash_password
import datetime


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ── 1. Users ────────────────────────────────────────────
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        student = User(
            email="anagha@student.com",
            username="anagha",
            hashed_password=hash_password("password123"),
            full_name="Anagha N",
            role=UserRole.LEARNER,
            avatar="👩‍🎓",
        )
        trainer1 = User(
            email="sarah@trainer.com",
            username="sarah",
            hashed_password=hash_password("password123"),
            full_name="Dr. Sarah Jenkins",
            role=UserRole.TRAINER,
            avatar="👩‍🏫",
        )
        trainer2 = User(
            email="ravi@trainer.com",
            username="ravi",
            hashed_password=hash_password("password123"),
            full_name="Prof. Ravi Kumar",
            role=UserRole.TRAINER,
            avatar="👨‍🏫",
        )
        admin = User(
            email="admin@learnai.com",
            username="admin",
            hashed_password=hash_password("admin123"),
            full_name="Admin User",
            role=UserRole.ADMIN,
            avatar="👨‍💼",
        )
        db.add_all([student, trainer1, trainer2, admin])
        db.commit()
        db.refresh(student)
        db.refresh(trainer1)
        db.refresh(trainer2)

        # ── 2. Categories ──────────────────────────────────────
        cat_prog = Category(name="Programming", description="Software development courses")
        cat_ds = Category(name="Data Science", description="ML, AI, and analytics")
        cat_ui = Category(name="UI/UX Design", description="Design and user experience")
        cat_bi = Category(name="Business Intelligence", description="BI tools and strategies")
        db.add_all([cat_prog, cat_ds, cat_ui, cat_bi])
        db.commit()
        db.refresh(cat_prog)
        db.refresh(cat_ds)
        db.refresh(cat_ui)

        # ── 3. Courses ─────────────────────────────────────────
        course1 = Course(
            title="Advanced Python: AI & ML Integration",
            description="Master Python for AI and machine learning applications.",
            thumbnail_url="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
            level=LevelEnum.intermediate,
            duration_minutes=870,
            is_published=True,
            trainer_id=trainer1.id,
            category_id=cat_prog.id,
        )
        course2 = Course(
            title="Advanced Neural Networks",
            description="Deep dive into neural network architectures.",
            thumbnail_url="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400",
            level=LevelEnum.advanced,
            duration_minutes=600,
            is_published=True,
            trainer_id=trainer2.id,
            category_id=cat_ds.id,
        )
        course3 = Course(
            title="UI/UX Interaction Principles",
            description="Learn modern interaction design patterns.",
            thumbnail_url="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
            level=LevelEnum.intermediate,
            duration_minutes=480,
            is_published=True,
            trainer_id=trainer1.id,
            category_id=cat_ui.id,
        )
        course4 = Course(
            title="Introduction to Machine Learning",
            description="Beginner-friendly course covering ML fundamentals.",
            thumbnail_url="https://images.unsplash.com/photo-1515879218367-8466d910auj7?w=400",
            level=LevelEnum.beginner,
            duration_minutes=720,
            is_published=True,
            trainer_id=trainer2.id,
            category_id=cat_ds.id,
        )
        db.add_all([course1, course2, course3, course4])
        db.commit()
        db.refresh(course1)
        db.refresh(course2)
        db.refresh(course3)

        # ── 4. Modules & Lessons ───────────────────────────────
        c1_m1 = Module(course_id=course1.id, title="Python Fundamentals Review", order_index=1)
        c1_m2 = Module(course_id=course1.id, title="Data Handling with NumPy & Pandas", order_index=2)
        c1_m3 = Module(course_id=course1.id, title="Neural Networks Basics", order_index=3)
        c1_m4 = Module(course_id=course1.id, title="Building ML Models", order_index=4)
        db.add_all([c1_m1, c1_m2, c1_m3, c1_m4])
        db.commit()
        db.refresh(c1_m1); db.refresh(c1_m2); db.refresh(c1_m3); db.refresh(c1_m4)

        l1 = Lesson(module_id=c1_m1.id, title="Python Functions", lesson_type=LessonTypeEnum.video, order_index=1, duration_minutes=25)
        l2 = Lesson(module_id=c1_m1.id, title="Loops Explained", lesson_type=LessonTypeEnum.video, order_index=2, duration_minutes=20)
        l3 = Lesson(module_id=c1_m1.id, title="Data Types Overview", lesson_type=LessonTypeEnum.video, order_index=3, duration_minutes=18)
        l4 = Lesson(module_id=c1_m1.id, title="Functions Quiz", lesson_type=LessonTypeEnum.quiz, order_index=4, duration_minutes=15)
        l5 = Lesson(module_id=c1_m2.id, title="NumPy Arrays", lesson_type=LessonTypeEnum.video, order_index=1, duration_minutes=30)
        l6 = Lesson(module_id=c1_m2.id, title="Pandas DataFrames", lesson_type=LessonTypeEnum.video, order_index=2, duration_minutes=35)
        l7 = Lesson(module_id=c1_m2.id, title="Data Cleaning", lesson_type=LessonTypeEnum.text, order_index=3, duration_minutes=20)
        l8 = Lesson(module_id=c1_m3.id, title="Perceptrons", lesson_type=LessonTypeEnum.video, order_index=1, duration_minutes=28)
        l9 = Lesson(module_id=c1_m3.id, title="Backpropagation", lesson_type=LessonTypeEnum.video, order_index=2, duration_minutes=35)
        l10 = Lesson(module_id=c1_m3.id, title="Optimization", lesson_type=LessonTypeEnum.video, order_index=3, duration_minutes=30)
        l11 = Lesson(module_id=c1_m3.id, title="Neural Nets Quiz", lesson_type=LessonTypeEnum.quiz, order_index=4, duration_minutes=20)
        l12 = Lesson(module_id=c1_m4.id, title="Scikit-learn Intro", lesson_type=LessonTypeEnum.video, order_index=1, duration_minutes=25)
        l13 = Lesson(module_id=c1_m4.id, title="Model Evaluation", lesson_type=LessonTypeEnum.video, order_index=2, duration_minutes=30)
        db.add_all([l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12, l13])
        db.commit()
        db.refresh(l1); db.refresh(l2); db.refresh(l3); db.refresh(l4)
        db.refresh(l5); db.refresh(l6); db.refresh(l7)
        db.refresh(l8); db.refresh(l9); db.refresh(l10)

        db.add_all([
            LessonContent(lesson_id=l1.id, content_type=ContentTypeEnum.video_url, content="https://example.com/videos/python-functions.mp4"),
            LessonContent(lesson_id=l2.id, content_type=ContentTypeEnum.video_url, content="https://example.com/videos/loops-explained.mp4"),
            LessonContent(lesson_id=l7.id, content_type=ContentTypeEnum.text_body, content="# Data Cleaning\n\nData cleaning is the process of..."),
        ])
        db.commit()

        # Course 2 modules
        c2_m1 = Module(course_id=course2.id, title="CNN Architectures", order_index=1)
        c2_m2 = Module(course_id=course2.id, title="RNN & LSTM", order_index=2)
        c2_m3 = Module(course_id=course2.id, title="Transformers", order_index=3)
        db.add_all([c2_m1, c2_m2, c2_m3])
        db.commit()
        db.refresh(c2_m1); db.refresh(c2_m2)
        c2_l1 = Lesson(module_id=c2_m1.id, title="Convolutional Layers", lesson_type=LessonTypeEnum.video, order_index=1, duration_minutes=30)
        c2_l2 = Lesson(module_id=c2_m1.id, title="Pooling & Stride", lesson_type=LessonTypeEnum.video, order_index=2, duration_minutes=25)
        c2_l3 = Lesson(module_id=c2_m2.id, title="Understanding RNNs", lesson_type=LessonTypeEnum.video, order_index=1, duration_minutes=35)
        db.add_all([c2_l1, c2_l2, c2_l3])
        db.commit()
        db.refresh(c2_l1); db.refresh(c2_l2)

        # Course 3 modules
        c3_m1 = Module(course_id=course3.id, title="Design Thinking", order_index=1)
        db.add(c3_m1)
        db.commit()
        db.refresh(c3_m1)
        c3_l1 = Lesson(module_id=c3_m1.id, title="User Research Methods", lesson_type=LessonTypeEnum.video, order_index=1, duration_minutes=20)
        c3_l2 = Lesson(module_id=c3_m1.id, title="Wireframing", lesson_type=LessonTypeEnum.video, order_index=2, duration_minutes=25)
        db.add_all([c3_l1, c3_l2])
        db.commit()
        db.refresh(c3_l1)

        # ── 5. Enrollments ─────────────────────────────────────
        enr1 = Enrollment(user_id=student.id, course_id=course1.id)
        enr2 = Enrollment(user_id=student.id, course_id=course2.id)
        enr3 = Enrollment(user_id=student.id, course_id=course3.id)
        db.add_all([enr1, enr2, enr3])
        db.commit()
        db.refresh(enr1); db.refresh(enr2); db.refresh(enr3)

        # ── 6. Progress ───────────────────────────────────────
        now = datetime.datetime.utcnow()

        for les in [l1, l2, l3, l5, l6, l8, l9, l10]:
            db.add(Progress(enrollment_id=enr1.id, lesson_id=les.id, is_completed=True,
                            completed_at=now - datetime.timedelta(days=2),
                            time_spent_seconds=les.duration_minutes * 60))
        db.add(Progress(enrollment_id=enr1.id, lesson_id=l4.id, is_completed=True,
                        score=40.0, completed_at=now - datetime.timedelta(days=3), time_spent_seconds=900))
        db.commit()

        db.add(Progress(enrollment_id=enr2.id, lesson_id=c2_l1.id, is_completed=True, completed_at=now - datetime.timedelta(days=1)))
        db.add(Progress(enrollment_id=enr2.id, lesson_id=c2_l2.id, is_completed=True, completed_at=now - datetime.timedelta(hours=2)))
        db.commit()

        db.add(Progress(enrollment_id=enr3.id, lesson_id=c3_l1.id, is_completed=True, completed_at=now - datetime.timedelta(days=1)))
        db.commit()

        # ── 7. Deadlines ──────────────────────────────────────
        db.add(Deadline(course_id=course1.id, title="Neural Nets Quiz", due_date=now + datetime.timedelta(days=5), weight_percent=15.0))
        db.add(Deadline(course_id=course3.id, title="UI Case Study Submission", due_date=now + datetime.timedelta(days=7)))
        db.commit()

        # ── 8. Activity Logs ──────────────────────────────────
        db.add_all([
            ActivityLog(user_id=student.id, course_id=course1.id, action="completed_module",
                        description="Completed Module 3: Optimization", icon="✅",
                        created_at=now - datetime.timedelta(hours=2)),
            ActivityLog(user_id=student.id, course_id=course1.id, action="generated_ai_notes",
                        description="Generated AI notes for Backpropagation", icon="📝",
                        created_at=now - datetime.timedelta(hours=8)),
            ActivityLog(user_id=student.id, course_id=course2.id, action="started_discussion",
                        description="Started discussion in Data Science 101", icon="💬",
                        created_at=now - datetime.timedelta(days=1)),
        ])
        db.commit()

        print("✅  Database seeded successfully!")
        print(f"   Learner:  username=anagha  password=password123")
        print(f"   Trainer:  username=sarah   password=password123")
        print(f"   Admin:    username=admin   password=admin123")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
