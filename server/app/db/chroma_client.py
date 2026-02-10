import chromadb
import os

class ChromaClient:
    _instance = None
    _client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ChromaClient, cls).__new__(cls)
            # Connect to Chroma running in Docker (or local fallback)
            host = os.getenv("CHROMA_HOST", "localhost")
            port = os.getenv("CHROMA_PORT", "8000")
            
            try:
                cls._client = chromadb.HttpClient(host=host, port=port)
                print(f"✅ ChromaDB Connected at {host}:{port}")
            except Exception as e:
                print(f"⚠️ ChromaDB Connection Failed: {e}. Falling back to ephemeral mode.")
                cls._client = chromadb.Client() # In-memory fallback
        return cls._instance

    def get_client(self):
        return self._client
