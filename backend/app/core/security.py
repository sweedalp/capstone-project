from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session


from app.core.database import get_db
from app.models.user import User
from app.core.config import settings  #  Use centralized config

SECRET_KEY = settings.JWT_SECRET        # No more hardcoded secrets
ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.JWT_EXPIRATION // 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MAX_PASSWORD_LENGTH_BYTES = 72

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def _truncate_password(password: str) -> str:
    """
    Bcrypt only uses the first 72 bytes of the password and raises
    if the input is longer. We proactively truncate so both hashing
    and verification behave consistently and don't error.
    """
    if password is None:
        return ""
    return password[:MAX_PASSWORD_LENGTH_BYTES]


def hash_password(password: str) -> str:
    return pwd_context.hash(_truncate_password(password))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(_truncate_password(plain_password), hashed_password)
    except ValueError:
        # If bcrypt still rejects the password (e.g. due to an old incompatible hash),
        # treat it as an authentication failure rather than crashing the request.
        return False


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Single authoritative implementation of get_current_user.
    Import this wherever you need to protect a route.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        if username is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()

    if user is None:
        raise credentials_exception

    return user
def require_role(allowed_roles: list):
    """
    Dependency that checks the user's role.
    Usage: current_user: User = Depends(require_role(["trainer", "admin"]))
    """
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    return role_checker
