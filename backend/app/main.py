from fastapi import FastAPI

from app.db.base import Base
from app.db.database import engine
from app.api.polygons import router as polygon_router

import app.models


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PGIS API"
)

app.include_router(polygon_router)
@app.get("/")
def root():
    return {
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "database": "connected"
    }
