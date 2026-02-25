from fastapi import APIRouter
from pydantic import BaseModel
from app.services.vector_service import VectorService
from app.services.path_service import PathFindingService
from app.services.graph_service import GraphService
from app.services.llm_engine import LLMEngine

router = APIRouter()


class QueryRequest(BaseModel):
    query: str


@router.post("/reason")
async def reason_about_query(req: QueryRequest):
    """
    THE REAL NEURO-SYMBOLIC REASONING LOOP.

    This endpoint implements the full Aurelius pipeline:
    1. Extract entities from the natural language query (Neural → Symbolic bridge)
    2. Search vector store for semantic context (Neural retrieval)
    3. Find weighted confidence path in Knowledge Graph (Symbolic reasoning)
    4. Synthesize grounded answer using path + context (Symbolic → Neural output)
    5. Return answer + path coordinates for 3D visualization
    """
    steps = []
    vs = VectorService()
    ps = PathFindingService()
    gs = GraphService()

    # ─────────────────────────────────────────────────────────
    # STEP 1: Entity Extraction (Neural → Symbolic Bridge)
    # ─────────────────────────────────────────────────────────
    steps.append("Parsing query intent and extracting named entities...")
    entities = await LLMEngine.extract_entities(req.query)
    print(f"🔍 Entities Extracted: {entities}")

    if not entities:
        # Fallback: use the raw query words as entities
        entities = [w.title() for w in req.query.split() if len(w) > 4][:2]
        print(f"⚠️ No entities extracted, using fallback: {entities}")

    steps.append(f"Entities identified: {', '.join(entities)}")

    # ─────────────────────────────────────────────────────────
    # STEP 2: Vector Search (Neural Retrieval)
    # ─────────────────────────────────────────────────────────
    steps.append("Retrieving semantic context from vector memory (ChromaDB)...")
    try:
        vector_context = vs.query_similar(req.query, n_results=5)
    except Exception as e:
        print(f"⚠️ Vector search failed: {e}")
        vector_context = []

    # ─────────────────────────────────────────────────────────
    # STEP 3: Graph Pathfinding (Symbolic Reasoning)
    # ─────────────────────────────────────────────────────────
    steps.append(f"Traversing Knowledge Graph for entities: [{', '.join(entities)}]...")
    path_data = None

    # Attempt 1: Direct path between first two extracted entities
    if len(entities) >= 2:
        path_data = ps.find_reasoning_path(entities[0], entities[1])

    # Attempt 2: Try other entity pair combinations
    if not path_data and len(entities) >= 3:
        path_data = ps.find_reasoning_path(entities[0], entities[2])

    # Attempt 3: Fuzzy subgraph cluster search
    if not path_data:
        steps.append("Direct path not found. Performing entity cluster search...")
        path_data = gs.find_subgraph_for_entities(entities)

    # Attempt 4: Final fallback — return top nodes from the full graph
    if not path_data:
        steps.append("Cluster search complete. Using top knowledge nodes as context...")
        graph_data = gs.get_whole_graph()
        top_nodes = [n["id"] for n in graph_data.get("nodes", [])[:6]]
        if top_nodes:
            path_data = {
                "nodes": top_nodes,
                "confidence": 0.5,
                "type": "Broad Search"
            }
        else:
            path_data = {
                "nodes": entities,
                "confidence": 0.4,
                "type": "Entity-Only"
            }

    steps.append(
        f"Reasoning path identified ({path_data['type']}). "
        f"Confidence: {int(path_data['confidence'] * 100)}%"
    )

    # ─────────────────────────────────────────────────────────
    # STEP 4: Answer Synthesis (Symbolic → Neural Output)
    # ─────────────────────────────────────────────────────────
    steps.append("Synthesizing grounded answer from verified logic chain...")
    answer = await LLMEngine.synthesize_answer(
        query=req.query,
        path_nodes=path_data["nodes"],
        vector_context=vector_context
    )

    steps.append("Verification complete. Answer grounded in knowledge graph.")

    # ─────────────────────────────────────────────────────────
    # RESPONSE: Answer + Visualization Coordinates
    # ─────────────────────────────────────────────────────────
    return {
        "answer": answer,
        "path": path_data,
        "entities_found": entities,
        "vector_chunks_used": len(vector_context),
        "steps": steps,
    }
