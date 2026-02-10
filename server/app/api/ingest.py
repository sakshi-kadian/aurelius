from fastapi import APIRouter, UploadFile, File
from app.services.pdf_engine import PDFEngine

router = APIRouter()

@router.post("/ingest")
async def ingest_pdf(file: UploadFile = File(...)):
    """
    Step 1: Ingest PDF -> Extract Text -> Chunk.
    This is the entry point for the "Neural Vortex".
    """
    # 1. Extract
    raw_text = await PDFEngine.extract_text(file)
    
    # 2. Chunk
    chunks = PDFEngine.chunk_text(raw_text)
    
    # 3. Store in Vector DB (Parallel/Async ideally, but blocking for safety first)
    from app.services.vector_service import VectorService
    vs = VectorService()
    vs.upsert_chunks(chunks, file.filename)
    
    # 4. Extract & Store Graph Knowledge (The Heavy Lifting)
    from app.services.llm_engine import LLMEngine
    from app.services.graph_service import GraphService
    gs = GraphService()
    
    total_triplets = 0
    # Process only first 5 chunks for speed in demo (or all for full depth)
    for chunk in chunks[:10]: 
        triplets = LLMEngine.extract_triplets(chunk)
        gs.upsert_triplets(triplets)
        total_triplets += len(triplets)
    
    return {
        "status": "success",
        "filename": file.filename,
        "chunks_processed": len(chunks),
        "triplets_extracted": total_triplets,
        "mode": "Neuro-Symbolic Injection Complete"
    }
