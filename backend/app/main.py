from fastapi import FastAPI

app = FastAPI(
    title="PGIS API"
)

@app.get("/")
def root():
    return {
        "status": "running"
    }
