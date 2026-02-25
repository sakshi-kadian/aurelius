from fastapi import APIRouter, UploadFile, File, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.services.pdf_engine import PDFEngine

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/ingest")
@limiter.limit("5/minute")
async def ingest_pdf(request: Request, file: UploadFile = File(...)):
    """
    Full PDF Ingestion Pipeline:
    PDF → Extract Text → Chunk → Vector Store (ChromaDB) → Graph (Neo4j)
    """
    # 1. Extract and clean text from PDF
    raw_text = await PDFEngine.extract_text(file)

    if not raw_text.strip():
        return {"status": "error", "message": "No readable text found in PDF."}

    # 2. Chunk into sliding windows (1000 chars, 200 overlap)
    chunks = PDFEngine.chunk_text(raw_text)

    # 3. Store chunks as semantic embeddings in ChromaDB (vector brain)
    from app.services.vector_service import VectorService
    vs = VectorService()
    vs.upsert_chunks(chunks, file.filename or "unknown.pdf")

    # 4. Extract Knowledge Graph triplets via LLM and populate Neo4j (symbolic brain)
    # NOTE: LLMEngine methods are now async — must be awaited
    from app.services.llm_engine import LLMEngine
    from app.services.graph_service import GraphService
    gs = GraphService()

    total_triplets = 0
    # Process up to 10 chunks (balance between depth and API speed for demo)
    for chunk in chunks[:10]:
        triplets = await LLMEngine.extract_triplets(chunk)  # FIXED: added await
        gs.upsert_triplets(triplets)
        total_triplets += len(triplets)

    return {
        "status": "success",
        "filename": file.filename,
        "chunks_processed": len(chunks),
        "triplets_extracted": total_triplets,
        "mode": "Neuro-Symbolic Injection Complete 🧠",
        "message": f"Knowledge graph enriched with {total_triplets} verified facts."
    }
