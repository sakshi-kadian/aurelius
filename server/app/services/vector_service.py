from app.db.chroma_client import ChromaClient
from chromadb.utils import embedding_functions
import uuid

class VectorService:
    def __init__(self):
        self.client = ChromaClient().get_client()
        # Use a high-quality local embedding model
        self.ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
        self.collection = self.client.get_or_create_collection(
            name="aurelius_knowledge", 
            embedding_function=self.ef
        )

    def upsert_chunks(self, chunks: list[str], source_file: str):
        """
        Embeds and stores text chunks.
        """
        if not chunks:
            return

        ids = [f"{source_file}_{i}_{uuid.uuid4().hex[:8]}" for i in range(len(chunks))]
        metadatas = [{"source": source_file, "chunk_index": i} for i in range(len(chunks))]
        
        try:
            self.collection.upsert(
                documents=chunks,
                ids=ids,
                metadatas=metadatas
            )
            print(f"🧠 Vector Memory: Stored {len(chunks)} chunks from {source_file}")
        except Exception as e:
            print(f"❌ Vector Upsert Failed: {e}")

    def query_similar(self, query_text: str, n_results: int = 5):
        """
        Retrieves the most relevant text chunks for a question.
        """
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        return results['documents'][0] if results['documents'] else []
