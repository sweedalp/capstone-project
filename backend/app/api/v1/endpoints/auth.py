from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from itsdangerous import URLSafeTimedSerializer
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi.security import OAuth2PasswordBearer

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, TokenResponse
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.core.config import settings


router = APIRouter()

# Token serializer for password reset links
serializer = URLSafeTimedSerializer(settings.JWT_SECRET)


# ---------------- HELPERS ----------------

def send_reset_email(to_email: str, reset_link: str, username: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset Your Password — AI LMS"
    msg["From"] = settings.MAIL_FROM
    msg["To"] = to_email

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#1e293b;">Password Reset Request</h2>
        <p style="color:#475569;">Hi {username},</p>
        <p style="color:#475569;">Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="{reset_link}" style="
            display:inline-block;
            margin:24px 0;
            padding:12px 28px;
            background:#2563eb;
            color:#ffffff;
            text-decoration:none;
            border-radius:8px;
            font-weight:bold;
            font-size:15px;
        ">Reset Password</a>
        <p style="color:#94a3b8;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="color:#cbd5e1;font-size:12px;">AI LMS Knowledge Intelligence Platform</p>
    </div>
    """

    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
        server.starttls()
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.sendmail(settings.MAIL_FROM, to_email, msg.as_string())


# ---------------- REGISTER ----------------

@router.post("/register", status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        (User.email == user_data.email) |
        (User.username == user_data.username)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )

    new_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


# ---------------- LOGIN ----------------

@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        (User.username == form_data.username) |
        (User.email == form_data.username)
    ).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token({"sub": user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ---------------- GET CURRENT USER (/me) ----------------

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role,
    }


# ---------------- FORGOT PASSWORD ----------------

@router.post("/forgot-password")
def forgot_password(
    email: str,
    db: Session = Depends(get_db)
):
    print(
        f"[SMTP DEBUG] username='{settings.MAIL_USERNAME}' password='{settings.MAIL_PASSWORD}' from='{settings.MAIL_FROM}'")
    user = db.query(User).filter(User.email == email).first()

    # Always return success — prevents attackers knowing which emails are registered
    if not user:
        return {"message": "If that email exists, a reset link has been sent."}

    token = serializer.dumps(email, salt="password-reset")
    reset_link = f"http://localhost:3000/reset-password?token={token}"

    try:
        send_reset_email(
            to_email=email,
            reset_link=reset_link,
            username=user.full_name or user.username
        )
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send reset email. Check your mail server settings in .env"
        )

    return {"message": "If that email exists, a reset link has been sent."}


# ---------------- RESET PASSWORD ----------------

@router.post("/reset-password")
def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    try:
        # Token expires after 1 hour (3600 seconds)
        email = serializer.loads(token, salt="password-reset", max_age=3600)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset link is invalid or has expired. Please request a new one."
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters."
        )

    user.hashed_password = hash_password(new_password)
    db.commit()

    return {"message": "Password reset successfully. You can now log in."}