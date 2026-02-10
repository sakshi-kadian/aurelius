from neo4j import GraphDatabase
import os

class Neo4jClient:
    _instance = None
    _driver = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Neo4jClient, cls).__new__(cls)
            uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
            user = os.getenv("NEO4J_USER", "neo4j")
            password = os.getenv("NEO4J_PASSWORD", "password")
            cls._driver = GraphDatabase.driver(uri, auth=(user, password))
        return cls._instance

    def get_driver(self):
        return self._driver

    def close(self):
        if self._driver:
            self._driver.close()
            print("🛑 Neo4j Connection Closed.")

    def verify_connection(self):
        try:
            self._driver.verify_connectivity()
            print("✅ Neo4j Connection Verified.")
            return True
        except Exception as e:
            print(f"❌ Neo4j Connection Failed: {e}")
            return False
