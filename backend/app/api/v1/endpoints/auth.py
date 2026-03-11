from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
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

@router.post("/login")
def login(
    request: Request,
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

    # ── If 2FA is enabled, return temp token ─────────────────────────────
    if getattr(user, 'totp_enabled', False):
        import uuid
        temp_token = create_access_token({
            "sub": user.username,
            "jti": str(uuid.uuid4()),
            "2fa_pending": True,
        })
        return {
            "requires_2fa": True,
            "temp_token": temp_token,
            "access_token": "",
            "token_type": "bearer",
        }

    # ── Normal login ──────────────────────────────────────────────────────
    import uuid
    jti = str(uuid.uuid4())
    access_token = create_access_token({"sub": user.username, "jti": jti})

    try:
        from app.models.user_session import UserSession
        ua_string = request.headers.get("user-agent", "Unknown")
        try:
            from user_agents import parse
            ua = parse(ua_string)
            device = f"{ua.browser.family} · {ua.os.family}"
        except Exception:
            device = ua_string[:100] if ua_string else "Unknown Device"
        ip = request.client.host if request.client else "Unknown"
        session = UserSession(
            user_id=user.id,
            token_jti=jti,
            device=device,
            ip_address=ip,
        )
        db.add(session)
        db.commit()
    except Exception as e:
        print(f"[SESSION] Could not save session: {e}")

    return {
        "requires_2fa": False,
        "access_token": access_token,
        "token_type": "bearer",
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
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


# ---------------- UPDATE PROFILE ----------------

@router.put("/profile")
def update_profile(
    full_name: str = None,
    email: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if full_name is not None:
        current_user.full_name = full_name
    if email is not None:
        existing = db.query(User).filter(User.email == email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = email
    db.commit()
    db.refresh(current_user)
    return {
        "message": "Profile updated",
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role,
    }


# ---------------- CHANGE PASSWORD ----------------

@router.put("/change-password")
def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(new_password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    current_user.hashed_password = hash_password(new_password)
    db.commit()
    return {"message": "Password changed successfully"}


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

# ── CHANGE PASSWORD (Settings Page) ──────────────────────────────────────────

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
def change_password_settings(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Settings page: change password using a JSON body."""
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters",
        )
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

# ── TWO FACTOR AUTHENTICATION ─────────────────────────────────────────────────
import pyotp
import qrcode
import io
import base64

class Verify2FARequest(BaseModel):
    code: str

class Disable2FARequest(BaseModel):
    code: str

@router.post("/2fa/setup")
def setup_2fa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a TOTP secret and return QR code for scanning."""
    secret = pyotp.random_base32()
    current_user.totp_secret = secret
    current_user.totp_enabled = False
    db.commit()

    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(
        name=current_user.email,
        issuer_name="AI LMS"
    )

    qr = qrcode.make(uri)
    buf = io.BytesIO()
    qr.save(buf, format="PNG")
    buf.seek(0)
    qr_base64 = base64.b64encode(buf.read()).decode("utf-8")

    return {
        "secret": secret,
        "qr_code": f"data:image/png;base64,{qr_base64}",
        "message": "Scan the QR code with Google Authenticator"
    }


@router.post("/2fa/verify")
def verify_2fa(
    payload: Verify2FARequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Verify the TOTP code and enable 2FA."""
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA setup not started. Call /2fa/setup first.")

    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(payload.code):
        raise HTTPException(status_code=400, detail="Invalid code. Please try again.")

    current_user.totp_enabled = True
    db.commit()
    return {"message": "2FA enabled successfully!"}


@router.post("/2fa/disable")
def disable_2fa(
    payload: Disable2FARequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Disable 2FA after verifying code."""
    if not current_user.totp_enabled:
        raise HTTPException(status_code=400, detail="2FA is not enabled.")

    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(payload.code):
        raise HTTPException(status_code=400, detail="Invalid code. Please try again.")

    current_user.totp_enabled = False
    current_user.totp_secret = None
    db.commit()
    return {"message": "2FA disabled successfully!"}


@router.get("/2fa/status")
def get_2fa_status(
    current_user: User = Depends(get_current_user),
):
    """Check if 2FA is enabled for current user."""
    return {
        "totp_enabled": current_user.totp_enabled or False
    }

# ── 2FA LOGIN ─────────────────────────────────────────────────────────────────
class TwoFALoginRequest(BaseModel):
    temp_token: str
    code: str

@router.post("/2fa/login")
def login_with_2fa(
    request: Request,
    payload: TwoFALoginRequest,
    db: Session = Depends(get_db),
):
    """Complete login by verifying 2FA code after password check."""
    from app.core.security import SECRET_KEY, ALGORITHM
    from jose import jwt, JWTError

    try:
        data = jwt.decode(payload.temp_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = data.get("sub")
        is_pending = data.get("2fa_pending", False)
        if not username or not is_pending:
            raise HTTPException(status_code=400, detail="Invalid temp token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Temp token expired or invalid")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(payload.code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")

    import uuid
    jti = str(uuid.uuid4())
    access_token = create_access_token({"sub": user.username, "jti": jti})

    try:
        from app.models.user_session import UserSession
        ua_string = request.headers.get("user-agent", "Unknown")
        try:
            from user_agents import parse
            ua = parse(ua_string)
            device = f"{ua.browser.family} · {ua.os.family}"
        except Exception:
            device = ua_string[:100] if ua_string else "Unknown Device"
        ip = request.client.host if request.client else "Unknown"
        session = UserSession(
            user_id=user.id,
            token_jti=jti,
            device=device,
            ip_address=ip,
        )
        db.add(session)
        db.commit()
    except Exception as e:
        print(f"[SESSION] Could not save session: {e}")

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }