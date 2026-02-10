import requests
import json
from typing import List, Dict, Any

class LLMEngine:
    """
    The 'Neuro' Engine.
    Connects to local Ollama instance (Llama 3.1) to perform reasoning.
    """
    OLLAMA_URL = "http://localhost:11434/api/generate"
    MODEL = "llama3" # Or 'mistral', ensure this is pulled in Ollama

    @staticmethod
    def extract_triplets(text_chunk: str) -> List[Dict[str, str]]:
        """
        Forces the LLM to convert text into a Knowledge Graph.
        Returns: List of {"subject": "...", "predicate": "...", "object": "..."}
        """
        
        system_prompt = """
        You are a Knowledge Graph extraction engine.
        Your task is to extract exact facts from the text as semantic triplets: (Subject, Predicate, Object).
        
        RULES:
        1. OUTPUT MUST BE STRICT JSON ARRAY. No preamble, no explanation.
        2. Format: [{"subject": "Entity1", "predicate": "RELATIONSHIP", "object": "Entity2"}]
        3. Predicates must be UPPERCASE verbs (e.g., OWNS, LOCATED_AT, INVENTED).
        4. Do not hallucinatel only extract what is explicitly stated.
        5. If no facts are found, return [].
        
        Example Input: "Elon Musk founded SpaceX in 2002."
        Example Output: [{"subject": "Elon Musk", "predicate": "FOUNDED", "object": "SpaceX"}, {"subject": "SpaceX", "predicate": "ESTABLISHED_IN", "object": "2002"}]
        """
        
        payload = {
            "model": LLMEngine.MODEL,
            "prompt": f"{system_prompt}\n\nTEXT:\n{text_chunk}\n\nOUTPUT:",
            "stream": False,
            "format": "json" # Llama 3 supports native JSON mode
        }
        
        try:
            response = requests.post(LLMEngine.OLLAMA_URL, json=payload)
            response.raise_for_status()
            
            result_json = response.json()
            content = result_json.get("response", "[]")
            
            # Parsing the JSON string from the LLM
            triplets = json.loads(content)
            return triplets
            
        except Exception as e:
            print(f"LLM Extraction Failed: {e}")
            return []
