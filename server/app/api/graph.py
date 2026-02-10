from fastapi import APIRouter
from app.services.graph_service import GraphService

router = APIRouter()

@router.get("/graph")
async def get_entire_graph():
    """
    Returns the complete node/edge list for the 3D visualizer.
    Limit: 1000 nodes for performance (or implemented LoD).
    """
    gs = GraphService()
    data = gs.get_whole_graph()
    return data
