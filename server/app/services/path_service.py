from app.db.neo4j_client import Neo4jClient

class PathFindingService:
    def __init__(self):
        self.driver = Neo4jClient().get_driver()

    def find_reasoning_path(self, start_node: str, end_node: str):
        """
        Finds the shortest path between two concepts.
        Returns the nodes and edges involved + Confidence Score.
        """
        with self.driver.session() as session:
            # Dijkstra Shortest Path
            query = """
            MATCH (start:Entity {name: $start}), (end:Entity {name: $end})
            MATCH p = shortestPath((start)-[*]-(end))
            RETURN p
            """
            result = session.run(query, start=start_node, end=end_node)
            path_data = result.single()
            
            if not path_data:
                return None
                
            path = path_data["p"]
            
            # Confidence Logic (Secret Weapon)
            # Longer paths = Lower confidence
            length = len(path.relationships)
            confidence = max(0.95 - (length * 0.15), 0.2) # Decay 15% per hop
            
            return {
                "nodes": [n["name"] for n in path.nodes],
                "confidence": round(confidence, 2),
                "type": "Golden Beam" # UX Tag
            }
