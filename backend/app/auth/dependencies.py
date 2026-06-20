from fastapi import Depends
from fastapi import HTTPException
from fastapi.security import HTTPBearer

from jose import jwt

from app.auth.jwt import (
    SECRET_KEY,
    ALGORITHM
)

security = HTTPBearer()


def get_current_user(
    credentials=Depends(security)
):

    try:

        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return int(
            payload["sub"]
        )

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="invalid token"
        )
