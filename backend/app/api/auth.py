from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db

from app.models.user import User

from app.schemas.user import (
    UserRegister
)

from app.auth.security import (
    hash_password
)

    
from app.schemas.user import UserLogin
from app.auth.security import verify_password
from app.auth.jwt import create_access_token

from app.auth.dependencies import (
    get_current_user
)

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    existing = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing:
        return {
            "error": "email already exists"
        }

    new_user = User(
        email=user.email,
        password_hash=hash_password(
            user.password
        )
    )

    db.add(new_user)
    db.commit()

    return {
        "status": "registered"
    }


@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        return {
            "error": "invalid credentials"
        }

    if not verify_password(
        user.password,
        db_user.password_hash
    ):
        return {
            "error": "invalid credentials"
        }

    token = create_access_token(
        db_user.id
    )

    return {
        "access_token": token
    }

@router.get("/me")
def me(
    user_id: int = Depends(
        get_current_user
    )
):

    return {
        "user_id": user_id
    }
