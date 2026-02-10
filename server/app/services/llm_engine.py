import os
import json
import requests
from typing import List, Dict, Any
from groq import Groq

class LLMEngine:
    """
    The 'Neuro' Engine.
    Connects to either Groq Cloud (Production) or local Ollama instance (Local Dev) for reasoning.
    """
    
    # Configuration
    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    MODEL_LOCAL = os.getenv("LLM_MODEL", "llama3")
    MODEL_GROQ = "llama3-8b-8192" # Fast, Free Tier Model on Groq

    @staticmethod
    def _call_groq(prompt: str) -> str:
        """Call Groq Cloud API for ultra-fast Llama 3 inference."""
        client = Groq(api_key=LLMEngine.GROQ_API_KEY)
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a precise Knowledge Graph extraction engine. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            model=LLMEngine.MODEL_GROQ,
            temperature=0,
            response_format={"type": "json_object"}
        )
        return chat_completion.choices[0].message.content

    @staticmethod
    def _call_ollama(prompt: str) -> str:
        """Call local Ollama instance."""
        payload = {
            "model": LLMEngine.MODEL_LOCAL,
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }
        response = requests.post(LLMEngine.OLLAMA_URL, json=payload)
        response.raise_for_status()
        return response.json().get("response", "[]")

    @staticmethod
    def extract_triplets(text_chunk: str) -> List[Dict[str, str]]:
        """
        Forces the LLM to convert text into a Knowledge Graph.
        Returns: List of {"subject": "...", "predicate": "...", "object": "..."}
        """
        
        system_instructions = """
        Your task is to extract exact facts from the text as semantic triplets: (Subject, Predicate, Object).
        
        RULES:
        1. OUTPUT MUST BE STRICT JSON ARRAY. No preamble, no explanation.
        2. Format: [{"subject": "Entity1", "predicate": "RELATIONSHIP", "object": "Entity2"}]
        3. Predicates must be UPPERCASE verbs (e.g., OWNS, LOCATED_AT, INVENTED).
        4. Do not hallucinate; only extract what is explicitly stated.
        5. If no facts are found, return [].
        
        Example Input: "Elon Musk founded SpaceX in 2002."
        Example Output: [{"subject": "Elon Musk", "predicate": "FOUNDED", "object": "SpaceX"}, {"subject": "SpaceX", "predicate": "ESTABLISHED_IN", "object": "2002"}]
        """
        
        full_prompt = f"{system_instructions}\n\nTEXT:\n{text_chunk}\n\nOUTPUT JSON:"
        
        try:
            # HYBRID LOGIC: Prefer Groq (Cloud/Prod), fallback to Ollama (Local)
            if LLMEngine.GROQ_API_KEY:
                print("Using Groq Cloud Engine (Llama 3)...")
                content = LLMEngine._call_groq(full_prompt)
            else:
                print("Using Local Ollama Engine (Llama 3)...")
                content = LLMEngine._call_ollama(full_prompt)
            
            # Parsing the JSON string from the LLM
            triplets = json.loads(content)
            
            # Validate output is a list
            if isinstance(triplets, dict) and "triplets" in triplets:
                return triplets["triplets"] # Handle edge case where LLM wraps in root object
            if not isinstance(triplets, list):
                return []
                
            return triplets
            
        except Exception as e:
            print(f"LLM Extraction Failed: {e}")
            return []
