from app.db.neo4j_client import Neo4jClient
from typing import Optional, Dict, List


class PathFindingService:
    def __init__(self):
        self.driver = Neo4jClient().get_driver()

    def find_reasoning_path(self, start_entity: str, end_entity: str) -> Optional[Dict]:
        """
        STEP 6: True weighted pathfinding.
        Finds the path with highest cumulative confidence between two entities.
        This is Confidence-Maximizing Path Selection — equivalent to running Dijkstra
        on (1 - confidence) edge weights to find the most reliable reasoning chain.

        Uses fuzzy case-insensitive CONTAINS matching to find entities even if the
        extracted name doesn't exactly match what's stored in the graph.
        """
        with self.driver.session() as session:
            # Step 1: Find matching start node (fuzzy)
            start_result = session.run(
                """
                MATCH (n:Entity)
                WHERE toLower(n.name) CONTAINS toLower($name)
                   OR toLower($name) CONTAINS toLower(n.name)
                RETURN n.name AS name LIMIT 1
                """,
                name=start_entity
            ).single()

            # Step 2: Find matching end node (fuzzy)
            end_result = session.run(
                """
                MATCH (n:Entity)
                WHERE toLower(n.name) CONTAINS toLower($name)
                   OR toLower($name) CONTAINS toLower(n.name)
                RETURN n.name AS name LIMIT 1
                """,
                name=end_entity
            ).single()

            if not start_result or not end_result:
                print(f"⚠️ Pathfinding: One or both nodes not found — '{start_entity}', '{end_entity}'")
                return None

            start_name = start_result["name"]
            end_name = end_result["name"]

            if start_name == end_name:
                return None

            # Step 3: Find all paths up to depth 8, ranked by max confidence product
            # This selects the most trustworthy reasoning chain (Dijkstra equivalent)
            result = session.run(
                """
                MATCH (start:Entity {name: $start}), (end:Entity {name: $end})
                MATCH p = (start)-[*1..8]-(end)
                WITH p,
                     [r IN relationships(p) | coalesce(r.confidence, 1.0)] AS confidences
                WITH p,
                     length(p) AS path_length,
                     reduce(acc = 1.0, c IN confidences | acc * c) AS path_confidence
                WHERE path_length > 0
                ORDER BY path_confidence DESC, path_length ASC
                LIMIT 1
                RETURN [n IN nodes(p) | n.name] AS node_names,
                       path_confidence,
                       path_length
                """,
                start=start_name,
                end=end_name
            ).single()

            if not result:
                print(f"⚠️ No path found between '{start_name}' and '{end_name}'")
                return None

            node_names: List[str] = result["node_names"]
            raw_confidence: float = result["path_confidence"]
            path_length: int = result["path_length"]

            # Apply decay for longer paths (penalizes indirect reasoning)
            decay_factor = max(0.95 - (path_length * 0.05), 0.3)
            final_confidence = round(raw_confidence * decay_factor, 2)

            print(f"✅ Path Found: {' → '.join(node_names)} (confidence: {final_confidence})")

            return {
                "nodes": node_names,
                "confidence": final_confidence,
                "path_length": path_length,
                "type": "Golden Beam" if final_confidence >= 0.7 else "Weak Signal"
            }
