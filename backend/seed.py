"""
Seed Script — populates database with test data
Run: python seed.py

Creates:
- 1 admin user
- 1 trainer user
- 2 learner users
- 2 categories
- 2 courses with modules, lessons (video/text/quiz)
- Enrollments for learners
- Some progress data
"""

import sys
import os
from app.models.user import User, UserRole
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal

from app.models.course import Course, Category, LevelEnum
from app.models.module import Module, Lesson, LessonContent, LessonTypeEnum, ContentTypeEnum
from app.models.enrollment import Enrollment, Progress
from app.models.activity import ActivityLog
from passlib.context import CryptContext
import datetime
import json

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def clear_data():
    print("Clearing existing data...")
    db.query(ActivityLog).delete()
    db.query(Progress).delete()
    db.query(Enrollment).delete()
    db.query(LessonContent).delete()
    db.query(Lesson).delete()
    db.query(Module).delete()
    db.query(Course).delete()
    db.query(Category).delete()
    db.query(User).delete()
    db.commit()
    print("Cleared.")

def seed():
    clear_data()

    # ── Users ─────────────────────────────────────────────────────────
    print("Creating users...")

    admin = User(
        username="admin",
        email="admin@lms.com",
        full_name="Admin User",
        hashed_password=hash_password("admin123"),
        role=UserRole.ADMIN,
        is_active=True,
    )

    trainer = User(
        username="trainer1",
        email="trainer@lms.com",
        full_name="Sarah Johnson",
        hashed_password=hash_password("trainer123"),
        role=UserRole.TRAINER,
        is_active=True,
    )

    learner1 = User(
        username="learner1",
        email="learner@lms.com",
        full_name="Anagha N",
        hashed_password=hash_password("learner123"),
        role=UserRole.LEARNER,
        is_active=True,
    )

    learner2 = User(
        username="learner2",
        email="learner2@lms.com",
        full_name="John Doe",
        hashed_password=hash_password("learner123"),
        role=UserRole.LEARNER,
        is_active=True,
    )

    db.add_all([admin, trainer, learner1, learner2])
    db.commit()
    print(f"  ✅ Users created")

    # ── Categories ────────────────────────────────────────────────────
    print("Creating categories...")

    cat_python = Category(name="Python Programming", description="Python language courses")
    cat_ai = Category(name="AI & Machine Learning", description="AI and ML courses")

    db.add_all([cat_python, cat_ai])
    db.commit()
    print(f"  ✅ Categories created")

    # ── Course 1 — Python Fundamentals ───────────────────────────────
    print("Creating Course 1: Python Fundamentals...")

    course1 = Course(
        title="Python Fundamentals",
        description="Learn Python from scratch. Variables, functions, loops, data structures and more.",
        thumbnail_url="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
        level=LevelEnum.beginner,
        is_published=True,
        trainer_id=trainer.id,
        category_id=cat_python.id,
    )
    db.add(course1)
    db.commit()

    # Module 1 — Getting Started
    mod1 = Module(course_id=course1.id, title="Getting Started with Python", order_index=1,
                  description="Setup and basic syntax")
    db.add(mod1)
    db.commit()

    # Lessons for Module 1
    l1 = Lesson(module_id=mod1.id, title="Introduction to Python", lesson_type=LessonTypeEnum.video,
                order_index=1, duration_minutes=10)
    l2 = Lesson(module_id=mod1.id, title="Variables and Data Types", lesson_type=LessonTypeEnum.text,
                order_index=2, duration_minutes=15)
    l3 = Lesson(module_id=mod1.id, title="Module 1 Quiz", lesson_type=LessonTypeEnum.quiz,
                order_index=3, duration_minutes=10)
    db.add_all([l1, l2, l3])
    db.commit()

    # Content for l1 — video
    db.add(LessonContent(
        lesson_id=l1.id,
        content_type=ContentTypeEnum.video_url,
        content="https://www.youtube.com/embed/kqtD5dpn9C8"
    ))

    # Content for l2 — text
    db.add(LessonContent(
        lesson_id=l2.id,
        content_type=ContentTypeEnum.text_body,
        content="""
<h2>Variables and Data Types in Python</h2>
<p>In Python, variables are created when you assign a value to them. Python is dynamically typed — you don't need to declare the type.</p>

<h3>Basic Data Types</h3>
<ul>
  <li><strong>int</strong> — whole numbers: <code>x = 10</code></li>
  <li><strong>float</strong> — decimal numbers: <code>x = 3.14</code></li>
  <li><strong>str</strong> — text: <code>name = "Python"</code></li>
  <li><strong>bool</strong> — True or False: <code>is_active = True</code></li>
</ul>

<h3>Example</h3>
<pre><code>
name = "Alice"
age = 25
height = 5.6
is_student = True

print(type(name))    # str
print(type(age))     # int
print(type(height))  # float
</code></pre>

<h3>Key Points</h3>
<p>Python uses dynamic typing — the type is determined at runtime. You can check the type of any variable using the <code>type()</code> function.</p>
        """
    ))

    # Content for l3 — quiz
    quiz1 = {
        "questions": [
            {
                "id": 1,
                "text": "What is the correct way to create a variable in Python?",
                "code": None,
                "hint": "Python uses dynamic typing — no need to declare types",
                "answers": [
                    {"value": "a", "text": "int x = 5", "correct": False},
                    {"value": "b", "text": "x = 5", "correct": True},
                    {"value": "c", "text": "var x = 5", "correct": False},
                    {"value": "d", "text": "declare x = 5", "correct": False},
                ]
            },
            {
                "id": 2,
                "text": "What data type is the value 3.14 in Python?",
                "code": "x = 3.14\nprint(type(x))",
                "hint": "Numbers with decimal points are not integers",
                "answers": [
                    {"value": "a", "text": "int", "correct": False},
                    {"value": "b", "text": "str", "correct": False},
                    {"value": "c", "text": "float", "correct": True},
                    {"value": "d", "text": "double", "correct": False},
                ]
            },
            {
                "id": 3,
                "text": "Which function is used to find the type of a variable?",
                "code": None,
                "hint": "It starts with the letter 't'",
                "answers": [
                    {"value": "a", "text": "typeof()", "correct": False},
                    {"value": "b", "text": "type()", "correct": True},
                    {"value": "c", "text": "gettype()", "correct": False},
                    {"value": "d", "text": "vartype()", "correct": False},
                ]
            },
            {
                "id": 4,
                "text": "What will be the output of: print(type(True))?",
                "code": "print(type(True))",
                "hint": "True and False are boolean values in Python",
                "answers": [
                    {"value": "a", "text": "<class 'int'>", "correct": False},
                    {"value": "b", "text": "<class 'str'>", "correct": False},
                    {"value": "c", "text": "<class 'bool'>", "correct": True},
                    {"value": "d", "text": "<class 'boolean'>", "correct": False},
                ]
            },
            {
                "id": 5,
                "text": "How do you create a string variable in Python?",
                "code": None,
                "hint": "Strings are surrounded by quotes",
                "answers": [
                    {"value": "a", "text": "name = Alice", "correct": False},
                    {"value": "b", "text": 'name = "Alice"', "correct": True},
                    {"value": "c", "text": "string name = Alice", "correct": False},
                    {"value": "d", "text": "str(name) = Alice", "correct": False},
                ]
            }
        ],
        "quick_tip": "Remember — Python is dynamically typed, no need to declare variable types!",
        "ai_tutor_prompt": "Confused about data types? Ask me to explain any concept!"
    }
    db.add(LessonContent(
        lesson_id=l3.id,
        content_type=ContentTypeEnum.quiz_json,
        content=json.dumps(quiz1)
    ))
    db.commit()

    # Module 2 — Functions
    mod2 = Module(course_id=course1.id, title="Functions and Control Flow", order_index=2,
                  description="Learn functions, if statements and loops")
    db.add(mod2)
    db.commit()

    l4 = Lesson(module_id=mod2.id, title="Writing Functions in Python", lesson_type=LessonTypeEnum.video,
                order_index=1, duration_minutes=12)
    l5 = Lesson(module_id=mod2.id, title="If Statements and Loops", lesson_type=LessonTypeEnum.text,
                order_index=2, duration_minutes=15)
    l6 = Lesson(module_id=mod2.id, title="Functions Quiz", lesson_type=LessonTypeEnum.quiz,
                order_index=3, duration_minutes=10)
    db.add_all([l4, l5, l6])
    db.commit()

    db.add(LessonContent(
        lesson_id=l4.id,
        content_type=ContentTypeEnum.video_url,
        content="https://www.youtube.com/embed/9Os0o3wzS_I"
    ))

    db.add(LessonContent(
        lesson_id=l5.id,
        content_type=ContentTypeEnum.text_body,
        content="""
<h2>If Statements and Loops</h2>
<h3>If Statements</h3>
<pre><code>
x = 10
if x > 5:
    print("x is greater than 5")
elif x == 5:
    print("x equals 5")
else:
    print("x is less than 5")
</code></pre>

<h3>For Loop</h3>
<pre><code>
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
</code></pre>

<h3>While Loop</h3>
<pre><code>
count = 0
while count < 5:
    print(count)
    count += 1
</code></pre>
        """
    ))

    quiz2 = {
        "questions": [
            {
                "id": 1,
                "text": "What keyword is used to define a function in Python?",
                "code": None,
                "hint": "It's a 3-letter keyword",
                "answers": [
                    {"value": "a", "text": "function", "correct": False},
                    {"value": "b", "text": "def", "correct": True},
                    {"value": "c", "text": "func", "correct": False},
                    {"value": "d", "text": "define", "correct": False},
                ]
            },
            {
                "id": 2,
                "text": "What is the output of this code?",
                "code": "def greet(name):\n    return 'Hello ' + name\n\nprint(greet('Python'))",
                "hint": "The function concatenates Hello with the argument",
                "answers": [
                    {"value": "a", "text": "Hello name", "correct": False},
                    {"value": "b", "text": "greet Python", "correct": False},
                    {"value": "c", "text": "Hello Python", "correct": True},
                    {"value": "d", "text": "Error", "correct": False},
                ]
            },
            {
                "id": 3,
                "text": "Which loop is best when you know the number of iterations?",
                "code": None,
                "hint": "One loop iterates over a sequence, the other checks a condition",
                "answers": [
                    {"value": "a", "text": "while loop", "correct": False},
                    {"value": "b", "text": "for loop", "correct": True},
                    {"value": "c", "text": "do-while loop", "correct": False},
                    {"value": "d", "text": "repeat loop", "correct": False},
                ]
            },
            {
                "id": 4,
                "text": "What does the return statement do in a function?",
                "code": None,
                "hint": "Think about what happens after a function finishes executing",
                "answers": [
                    {"value": "a", "text": "Prints the result", "correct": False},
                    {"value": "b", "text": "Ends the program", "correct": False},
                    {"value": "c", "text": "Sends a value back to the caller", "correct": True},
                    {"value": "d", "text": "Repeats the function", "correct": False},
                ]
            },
            {
                "id": 5,
                "text": "What will this code print?",
                "code": "for i in range(3):\n    print(i)",
                "hint": "range(3) generates numbers starting from 0",
                "answers": [
                    {"value": "a", "text": "1 2 3", "correct": False},
                    {"value": "b", "text": "0 1 2 3", "correct": False},
                    {"value": "c", "text": "0 1 2", "correct": True},
                    {"value": "d", "text": "1 2", "correct": False},
                ]
            }
        ],
        "quick_tip": "Functions are reusable blocks of code — define once, use many times!",
        "ai_tutor_prompt": "Need help understanding functions? Ask me!"
    }
    db.add(LessonContent(
        lesson_id=l6.id,
        content_type=ContentTypeEnum.quiz_json,
        content=json.dumps(quiz2)
    ))
    db.commit()
    print(f"  ✅ Course 1 created with {2} modules and {6} lessons")

    # ── Course 2 — AI Fundamentals ───────────────────────────────────
    print("Creating Course 2: AI Fundamentals...")

    course2 = Course(
        title="AI & Machine Learning Fundamentals",
        description="Introduction to Artificial Intelligence, Machine Learning concepts and practical applications.",
        thumbnail_url="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800",
        level=LevelEnum.intermediate,
        is_published=True,
        trainer_id=trainer.id,
        category_id=cat_ai.id,
    )
    db.add(course2)
    db.commit()

    mod3 = Module(course_id=course2.id, title="Introduction to AI", order_index=1,
                  description="What is AI and how does it work")
    db.add(mod3)
    db.commit()

    l7 = Lesson(module_id=mod3.id, title="What is Artificial Intelligence?", lesson_type=LessonTypeEnum.video,
                order_index=1, duration_minutes=15)
    l8 = Lesson(module_id=mod3.id, title="Types of Machine Learning", lesson_type=LessonTypeEnum.text,
                order_index=2, duration_minutes=20)
    l9 = Lesson(module_id=mod3.id, title="AI Basics Quiz", lesson_type=LessonTypeEnum.quiz,
                order_index=3, duration_minutes=10)
    db.add_all([l7, l8, l9])
    db.commit()

    db.add(LessonContent(
        lesson_id=l7.id,
        content_type=ContentTypeEnum.video_url,
        content="https://www.youtube.com/embed/ad79nYk2keg"
    ))

    db.add(LessonContent(
        lesson_id=l8.id,
        content_type=ContentTypeEnum.text_body,
        content="""
<h2>Types of Machine Learning</h2>
<p>Machine Learning is a subset of AI that allows systems to learn from data.</p>

<h3>1. Supervised Learning</h3>
<p>The model learns from labeled training data. Examples: spam detection, image classification.</p>

<h3>2. Unsupervised Learning</h3>
<p>The model finds patterns in unlabeled data. Examples: customer segmentation, anomaly detection.</p>

<h3>3. Reinforcement Learning</h3>
<p>The model learns by trial and error with rewards. Examples: game playing AI, robotics.</p>

<h3>Key Algorithms</h3>
<ul>
  <li>Linear Regression</li>
  <li>Decision Trees</li>
  <li>Neural Networks</li>
  <li>K-Means Clustering</li>
</ul>
        """
    ))

    quiz3 = {
        "questions": [
            {
                "id": 1,
                "text": "What is Artificial Intelligence?",
                "code": None,
                "hint": "Think about machines mimicking human intelligence",
                "answers": [
                    {"value": "a", "text": "A type of robot", "correct": False},
                    {"value": "b", "text": "Simulation of human intelligence by machines", "correct": True},
                    {"value": "c", "text": "A programming language", "correct": False},
                    {"value": "d", "text": "A database system", "correct": False},
                ]
            },
            {
                "id": 2,
                "text": "Which type of ML uses labeled training data?",
                "code": None,
                "hint": "The model is 'supervised' by having correct answers provided",
                "answers": [
                    {"value": "a", "text": "Unsupervised Learning", "correct": False},
                    {"value": "b", "text": "Reinforcement Learning", "correct": False},
                    {"value": "c", "text": "Supervised Learning", "correct": True},
                    {"value": "d", "text": "Deep Learning", "correct": False},
                ]
            },
            {
                "id": 3,
                "text": "Which ML type learns through rewards and penalties?",
                "code": None,
                "hint": "Think of training a dog with treats",
                "answers": [
                    {"value": "a", "text": "Supervised Learning", "correct": False},
                    {"value": "b", "text": "Unsupervised Learning", "correct": False},
                    {"value": "c", "text": "Reinforcement Learning", "correct": True},
                    {"value": "d", "text": "Transfer Learning", "correct": False},
                ]
            },
            {
                "id": 4,
                "text": "What is a Neural Network inspired by?",
                "code": None,
                "hint": "It's modeled after a biological structure",
                "answers": [
                    {"value": "a", "text": "Computer circuits", "correct": False},
                    {"value": "b", "text": "The human brain", "correct": True},
                    {"value": "c", "text": "A spreadsheet", "correct": False},
                    {"value": "d", "text": "A decision tree", "correct": False},
                ]
            },
            {
                "id": 5,
                "text": "Which is an example of Unsupervised Learning?",
                "code": None,
                "hint": "No labels are provided — the model finds patterns itself",
                "answers": [
                    {"value": "a", "text": "Spam email detection", "correct": False},
                    {"value": "b", "text": "Image classification", "correct": False},
                    {"value": "c", "text": "Customer segmentation", "correct": True},
                    {"value": "d", "text": "Weather prediction", "correct": False},
                ]
            }
        ],
        "quick_tip": "AI = making machines smart. ML = teaching machines from data!",
        "ai_tutor_prompt": "Confused about AI vs ML? Ask me to clarify!"
    }
    db.add(LessonContent(
        lesson_id=l9.id,
        content_type=ContentTypeEnum.quiz_json,
        content=json.dumps(quiz3)
    ))
    db.commit()
    print(f"  ✅ Course 2 created")

    # ── Enrollments ───────────────────────────────────────────────────
    print("Creating enrollments...")

    enr1 = Enrollment(user_id=learner1.id, course_id=course1.id)
    enr2 = Enrollment(user_id=learner1.id, course_id=course2.id)
    enr3 = Enrollment(user_id=learner2.id, course_id=course1.id)
    db.add_all([enr1, enr2, enr3])
    db.commit()
    print(f"  ✅ Enrollments created")

    # ── Progress (learner1 has done some work) ────────────────────────
    print("Creating progress data...")

    now = datetime.datetime.utcnow()

    # Learner1 completed lesson 1 and 2 in course1
    p1 = Progress(enrollment_id=enr1.id, lesson_id=l1.id, is_completed=True,
                  completed_at=now - datetime.timedelta(days=2),
                  time_spent_seconds=620)
    p2 = Progress(enrollment_id=enr1.id, lesson_id=l2.id, is_completed=True,
                  completed_at=now - datetime.timedelta(days=1),
                  time_spent_seconds=900)
    # Learner1 attempted quiz with low score (for revision assistant)
    p3 = Progress(enrollment_id=enr1.id, lesson_id=l3.id, is_completed=True,
                  completed_at=now - datetime.timedelta(hours=5),
                  time_spent_seconds=480, score=40.0)
    # Learner1 started course 2
    p4 = Progress(enrollment_id=enr2.id, lesson_id=l7.id, is_completed=True,
                  completed_at=now - datetime.timedelta(hours=2),
                  time_spent_seconds=750)
    # Learner1 attempted AI quiz with low score
    p5 = Progress(enrollment_id=enr2.id, lesson_id=l9.id, is_completed=True,
                  completed_at=now - datetime.timedelta(hours=1),
                  time_spent_seconds=360, score=55.0)

    db.add_all([p1, p2, p3, p4, p5])
    db.commit()

    # ── Activity Logs ─────────────────────────────────────────────────
    db.add_all([
        ActivityLog(user_id=learner1.id, course_id=course1.id,
                    action="completed_lesson", description="Completed: Introduction to Python",
                    icon="📺", created_at=now - datetime.timedelta(days=2)),
        ActivityLog(user_id=learner1.id, course_id=course1.id,
                    action="completed_lesson", description="Completed: Variables and Data Types",
                    icon="📖", created_at=now - datetime.timedelta(days=1)),
        ActivityLog(user_id=learner1.id, course_id=course1.id,
                    action="completed_quiz", description="Scored 40% on Module 1 Quiz",
                    icon="📝", created_at=now - datetime.timedelta(hours=5)),
        ActivityLog(user_id=learner1.id, course_id=course2.id,
                    action="completed_lesson", description="Completed: What is AI?",
                    icon="📺", created_at=now - datetime.timedelta(hours=2)),
    ])
    db.commit()
    print(f"  ✅ Progress and activity created")

    print("\n" + "="*50)
    print("✅ SEED COMPLETE!")
    print("="*50)
    print("\n👤 Login Credentials:")
    print("  Admin:   admin@lms.com     / admin123")
    print("  Trainer: trainer@lms.com   / trainer123")
    print("  Learner: learner@lms.com   / learner123")
    print("  Learner: learner2@lms.com  / learner123")
    print("\n📚 Courses Created:")
    print(f"  - Python Fundamentals (ID: {course1.id})")
    print(f"  - AI & ML Fundamentals (ID: {course2.id})")
    print("\n🎯 Learner (learner@lms.com) has:")
    print("  - Enrolled in both courses")
    print("  - Completed 3 lessons")
    print("  - Scored 40% on Python quiz (triggers revision assistant)")
    print("  - Scored 55% on AI quiz (triggers revision assistant)")
    print("="*50)

    db.close()

if __name__ == "__main__":
    seed()