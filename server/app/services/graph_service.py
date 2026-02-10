from app.db.neo4j_client import Neo4jClient
from typing import List, Dict
import re

class GraphService:
    def __init__(self):
        self.driver = Neo4jClient().get_driver()

    def sanitize_token(self, text: str) -> str:
        """
        Cleans entity names to be consistent (e.g., lowercase, stripped).
        """
        return text.strip().title() # "star barbie" -> "Star Barbie"

    def upsert_triplets(self, triplets: List[Dict[str, str]]):
        """
        Writes a batch of triplets to the knowledge graph.
        Uses MERGE to ensure idempotency (no duplicates).
        """
        if not triplets:
            return

        with self.driver.session() as session:
            for triplet in triplets:
                subj = self.sanitize_token(triplet.get("subject", ""))
                obj = self.sanitize_token(triplet.get("object", ""))
                pred = triplet.get("predicate", "RELATED_TO").upper().replace(" ", "_")
                
                # Sanitize Predicate to ensure strictly Alphanumeric (Security)
                pred = re.sub(r'[^A-Z0-9_]', '', pred)

                if not subj or not obj:
                    continue

                # Dynamic Cypher query using f-string for Relationship Type
                # (Safe because we stripped non-alphanumeric chars from 'pred')
                query = (
                    f"MERGE (s:Entity {{name: $subj}}) "
                    f"MERGE (o:Entity {{name: $obj}}) "
                    f"MERGE (s)-[:{pred}]->(o)"
                )
                
                session.run(query, subj=subj, obj=obj)
                print(f"✅ Graph Write: ({subj}) -[{pred}]-> ({obj})")

    def get_whole_graph(self):
        """
        Fetches the entire graph for the 3D visualizer.
        """
        with self.driver.session() as session:
            result = session.run("MATCH (n)-[r]->(m) RETURN n.name, r, m.name LIMIT 1000")
            nodes = set()
            links = []
            
            for record in result:
                source = record["n.name"]
                target = record["m.name"]
                rel_type = record["r"].type
                
                nodes.add(source)
                nodes.add(target)
                links.append({"source": source, "target": target, "type": rel_type})
                
            return {
                "nodes": [{"id": name} for name in nodes],
                "links": links
            }
