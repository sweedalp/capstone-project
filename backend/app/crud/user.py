"""
User CRUD operations
"""

from sqlalchemy.orm import Session
from typing import Optional

from app.models.user import User, UserRole
from app.core.security import hash_password


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(
    db: Session,
    email: str,
    username: str,
    password: str,
    full_name: str = None,
    role: str = "learner",
) -> User:
    db_user = User(
        email=email,
        username=username,
        hashed_password=hash_password(password),
        full_name=full_name,
        role=UserRole(role),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user: User, **kwargs) -> User:
    for key, value in kwargs.items():
        if value is not None and hasattr(user, key):
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user
