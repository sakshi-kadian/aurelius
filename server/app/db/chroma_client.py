import chromadb
import os

class ChromaClient:
    _instance = None
    _client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ChromaClient, cls).__new__(cls)
            # NOTE: Docker maps ChromaDB container port 8000 → host port 8001
            # So when connecting from the host machine (local dev), use 8001.
            host = os.getenv("CHROMA_HOST", "localhost")
            port = int(os.getenv("CHROMA_PORT", "8001"))  # FIX: was "8000", should be "8001"

            try:
                cls._client = chromadb.HttpClient(host=host, port=port)
                cls._client.heartbeat()  # Validate connection immediately
                print(f"✅ ChromaDB Connected at {host}:{port}")
            except Exception as e:
                print(f"⚠️ ChromaDB Connection Failed at {host}:{port} — {e}. Falling back to in-memory mode.")
                cls._client = chromadb.Client()  # In-memory fallback for local dev
        return cls._instance

    def get_client(self):
        return self._client
