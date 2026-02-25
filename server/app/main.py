from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

# Rate limiter (Step 12)
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Aurelius Neuro-Symbolic Engine Starting...")
    print(f"   Neo4j: {os.getenv('NEO4J_URI', 'bolt://localhost:7687')}")
    print(f"   ChromaDB: localhost:{os.getenv('CHROMA_PORT', '8001')}")
    print(f"   LLM Backend: {'Groq Cloud ⚡' if os.getenv('GROQ_API_KEY') else 'Local Ollama 🖥️'}")
    yield
    print("🛑 Aurelius Engine Shutting Down.")


app = FastAPI(
    title="Aurelius API",
    description="Neuro-Symbolic Reasoning Engine for verifiable Graph RAG",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiting (Step 12)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — Step 11: locked to frontend origin, not wildcard
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route registration
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
        "version": "1.0.0",
        "status": "online",
        "mode": "Neuro-Symbolic",
    }


@app.get("/health")
async def health_check():
    """
    Step 10: Comprehensive health check — verifies all dependent services.
    Used by the frontend NavBar for live status monitoring.
    """
    services = {}

    # Check Neo4j
    try:
        from app.db.neo4j_client import Neo4jClient
        client = Neo4jClient()
        client.verify_connection()
        services["neo4j"] = "connected"
    except Exception as e:
        services["neo4j"] = f"offline: {str(e)[:50]}"

    # Check ChromaDB
    try:
        from app.db.chroma_client import ChromaClient
        chroma = ChromaClient().get_client()
        chroma.heartbeat()
        services["chromadb"] = "connected"
    except Exception as e:
        services["chromadb"] = f"offline: {str(e)[:50]}"

    # Check LLM backend
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        services["llm"] = "groq:configured"
    else:
        # Try pinging local Ollama
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.get("http://localhost:11434/api/tags")
                services["llm"] = "ollama:online" if resp.status_code == 200 else "ollama:not-responding"
        except Exception:
            services["llm"] = "ollama:offline"

    # Overall status: degraded if any critical service is offline
    all_online = all("offline" not in v for v in services.values())

    return {
        "status": "healthy" if all_online else "degraded",
        "version": "1.0.0",
        "services": services,
    }
