from app.db.neo4j_client import Neo4jClient
from typing import List, Dict, Optional
import re


class GraphService:
    def __init__(self):
        self.driver = Neo4jClient().get_driver()

    def sanitize_token(self, text: str) -> str:
        """Normalizes entity names for consistent graph keys (Title Case)."""
        return text.strip().title()

    def upsert_triplets(self, triplets: List[Dict[str, str]]):
        """
        Writes a batch of triplets to the knowledge graph.
        Uses MERGE for idempotency (no duplicates ever created).
        STEP 6: Stores confidence=1.0 on every new relationship for true weighted Dijkstra.
        """
        if not triplets:
            return

        with self.driver.session() as session:
            for triplet in triplets:
                subj = self.sanitize_token(triplet.get("subject", ""))
                obj = self.sanitize_token(triplet.get("object", ""))
                pred = triplet.get("predicate", "RELATED_TO").upper().replace(" ", "_")

                # Security: strip non-alphanumeric characters from predicate (prevents Cypher injection)
                pred = re.sub(r'[^A-Z0-9_]', '', pred)
                if not pred:
                    pred = "RELATED_TO"

                if not subj or not obj:
                    continue

                # STEP 6: Set confidence=1.0 on new edges (coalesce prevents overwriting existing scores)
                query = (
                    f"MERGE (s:Entity {{name: $subj}}) "
                    f"MERGE (o:Entity {{name: $obj}}) "
                    f"MERGE (s)-[r:{pred}]->(o) "
                    f"ON CREATE SET r.confidence = 1.0, r.created_at = timestamp() "
                )

                session.run(query, subj=subj, obj=obj)
                print(f"✅ Graph Write: ({subj}) -[{pred}]-> ({obj})")

    def get_whole_graph(self) -> Dict:
        """
        Fetches the entire knowledge graph for the 3D visualizer.
        Returns nodes and links with relationship types.
        Limit 1000 nodes for rendering performance.
        """
        with self.driver.session() as session:
            result = session.run(
                "MATCH (n)-[r]->(m) RETURN n.name AS src, type(r) AS rel, m.name AS tgt LIMIT 1000"
            )
            nodes: set = set()
            links = []

            for record in result:
                source = record["src"]
                target = record["tgt"]
                rel_type = record["rel"]

                if source and target:
                    nodes.add(source)
                    nodes.add(target)
                    links.append({"source": source, "target": target, "type": rel_type})

            return {
                "nodes": [{"id": name} for name in nodes],
                "links": links
            }

    def find_subgraph_for_entities(self, entities: List[str]) -> Optional[Dict]:
        """
        STEP 7: Fuzzy entity search — finds graph nodes that partially match entity names.
        Used as fallback when direct path between two entities is not found.
        Returns a subgraph cluster around the matched entities.
        """
        if not entities:
            return None

        entity_titles = [e.strip().title() for e in entities]
        # Also try lowercase for broader matching
        entity_lower = [e.strip().lower() for e in entities]

        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (n:Entity)
                WHERE any(e IN $entities WHERE
                    toLower(n.name) CONTAINS e OR
                    e CONTAINS toLower(n.name)
                )
                OPTIONAL MATCH (n)-[r]->(m)
                RETURN DISTINCT n.name AS node_name, m.name AS connected_name
                LIMIT 30
                """,
                entities=entity_lower
            )

            nodes: set = set()
            for record in result:
                if record["node_name"]:
                    nodes.add(record["node_name"])
                if record["connected_name"]:
                    nodes.add(record["connected_name"])

            if not nodes:
                return None

            node_list = list(nodes)[:8]
            return {
                "nodes": node_list,
                "confidence": 0.65,
                "type": "Entity Cluster"
            }

    def get_graph_stats(self) -> Dict:
        """Returns graph complexity metrics for the UI stats panel."""
        with self.driver.session() as session:
            node_count = session.run("MATCH (n:Entity) RETURN count(n) AS cnt").single()["cnt"]
            edge_count = session.run("MATCH ()-[r]->() RETURN count(r) AS cnt").single()["cnt"]
            return {
                "node_count": node_count,
                "edge_count": edge_count,
                "density": round(edge_count / max(node_count * (node_count - 1), 1), 4)
            }
