from fastapi import FastAPI
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to DBs
    print("Aurelius Neuro-Symbolic Engine Starting...")
    yield
    # Shutdown: Close connections
    print("Aurelius Engine Shutting Down...")

app = FastAPI(
    title="Aurelius API",
    description="Neuro-Symbolic Reasoning Engine for GraphRAG",
    version="0.1.0",
    lifespan=lifespan
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.ingest import router as ingest_router
from app.api.graph import router as graph_router
from app.api.reason import router as reason_router

app.include_router(ingest_router, prefix="/api/v1", tags=["Ingestion"])
app.include_router(graph_router, prefix="/api/v1", tags=["Visualization"])
app.include_router(reason_router, prefix="/api/v1", tags=["Reasoning"])

@app.get("/")
async def root():
    return {
        "system": "Aurelius",
        "status": "online",
        "mode": "Neuro-Symbolic"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
