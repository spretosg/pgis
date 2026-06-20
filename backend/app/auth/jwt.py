from jose import jwt
from datetime import datetime
from datetime import timedelta

SECRET_KEY = "CHANGE_ME_LATER"

ALGORITHM = "HS256"


def create_access_token(user_id: int):

    payload = {
        "sub": str(user_id),
        "exp": datetime.utcnow() + timedelta(days=7)
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
