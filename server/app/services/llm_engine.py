import os
import json
import httpx
from typing import List, Dict, Any
from groq import AsyncGroq


class LLMEngine:
    """
    The 'Neuro' Engine.
    Dual-path: Groq Cloud (ultra-fast LPU) → Local Ollama fallback.
    All methods are async to avoid blocking FastAPI's event loop.
    """

    OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    MODEL_LOCAL = os.getenv("LLM_MODEL", "llama3")
    MODEL_GROQ = "llama3-8b-8192"  # Fast, generous free-tier on Groq

    # -------------------------------------------------------------------------
    # PRIVATE: Low-Level LLM Callers
    # -------------------------------------------------------------------------

    @staticmethod
    async def _call_groq(prompt: str, system: str, json_mode: bool = True) -> str:
        """Async call to Groq Cloud LPU (ultra-fast Llama 3 inference)."""
        client = AsyncGroq(api_key=LLMEngine.GROQ_API_KEY)
        kwargs: Dict[str, Any] = {
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            "model": LLMEngine.MODEL_GROQ,
            "temperature": 0,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        else:
            kwargs["max_tokens"] = 512  # type: ignore

        response = await client.chat.completions.create(**kwargs)
        return response.choices[0].message.content or ""

    @staticmethod
    async def _call_ollama(prompt: str, system: str, json_mode: bool = True) -> str:
        """Async call to local Ollama instance using httpx (non-blocking)."""
        full_prompt = f"{system}\n\n{prompt}" if system else prompt
        payload: Dict[str, Any] = {
            "model": LLMEngine.MODEL_LOCAL,
            "prompt": full_prompt,
            "stream": False,
        }
        if json_mode:
            payload["format"] = "json"

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(LLMEngine.OLLAMA_URL, json=payload)
            response.raise_for_status()
            return response.json().get("response", "")

    @staticmethod
    async def _call_llm(prompt: str, system: str, json_mode: bool = True) -> str:
        """
        HYBRID ROUTER: Groq first (fast), Ollama fallback (local).
        This dual-path is intentional — ensures the engine always has an inference backend.
        """
        if LLMEngine.GROQ_API_KEY:
            print("🌐 LLM: Using Groq Cloud (Llama 3 LPU)...")
            return await LLMEngine._call_groq(prompt, system, json_mode)
        else:
            print("🖥️  LLM: Using Local Ollama (Llama 3)...")
            return await LLMEngine._call_ollama(prompt, system, json_mode)

    # -------------------------------------------------------------------------
    # PUBLIC: High-Level Intelligence Methods
    # -------------------------------------------------------------------------

    @staticmethod
    async def extract_triplets(text_chunk: str) -> List[Dict[str, str]]:
        """
        NEURO → SYMBOLIC: Converts raw text into structured Knowledge Graph triplets.
        Forces the LLM to produce (Subject, Predicate, Object) tuples.
        Returns: [{"subject": "...", "predicate": "...", "object": "..."}]
        """
        system = "You are a precise Knowledge Graph extraction engine. Output valid JSON only. No preamble, no explanation."

        prompt = f"""Extract exact facts from the text as semantic triplets.

RULES:
1. OUTPUT MUST BE A JSON ARRAY: [{{"subject": "Entity1", "predicate": "RELATIONSHIP", "object": "Entity2"}}]
2. Predicates must be UPPERCASE verbs (e.g., OWNS, IMPROVES, DISCOVERED, CAUSED_BY).
3. Do NOT hallucinate — only extract what is explicitly stated.
4. If no clear facts are found, return an empty array: []

EXAMPLE:
Input: "Attention mechanisms improved translation quality in 2017."
Output: [{{"subject": "Attention Mechanisms", "predicate": "IMPROVED", "object": "Translation Quality"}}, {{"subject": "Attention Mechanisms", "predicate": "INTRODUCED_IN", "object": "2017"}}]

TEXT TO ANALYZE:
{text_chunk}

OUTPUT JSON:"""

        try:
            content = await LLMEngine._call_llm(prompt, system, json_mode=True)
            triplets = json.loads(content)

            # Handle edge case where LLM wraps array in a root object
            if isinstance(triplets, dict):
                for key in ["triplets", "facts", "data", "results"]:
                    if key in triplets:
                        triplets = triplets[key]
                        break

            if not isinstance(triplets, list):
                return []

            return [t for t in triplets if isinstance(t, dict) and "subject" in t and "predicate" in t and "object" in t]

        except Exception as e:
            print(f"❌ Triplet Extraction Failed: {e}")
            return []

    @staticmethod
    async def extract_entities(query: str) -> List[str]:
        """
        Extracts 1-3 key named entities from a natural language query.
        These become the start/end nodes for graph pathfinding.
        """
        system = "You are an entity extraction engine. Extract key named entities for Knowledge Graph search. Output valid JSON only."

        prompt = f"""Extract the 1-3 most important named entities from this query for Knowledge Graph lookup.

RULES:
1. OUTPUT MUST BE STRICT JSON: {{"entities": ["Entity1", "Entity2"]}}
2. Use Title Case (e.g., "Attention Mechanism", "Neural Network", "Transformer")
3. Extract CONCEPTS and PROPER NOUNS, not common words (not: "the", "what", "how")
4. If no clear entities, infer the main topic as an entity

QUERY: "{query}"
OUTPUT JSON:"""

        try:
            content = await LLMEngine._call_llm(prompt, system, json_mode=True)
            data = json.loads(content)
            entities = data.get("entities", [])
            # Validate: filter empty strings, ensure list
            return [str(e).strip() for e in entities if str(e).strip()]
        except Exception as e:
            print(f"❌ Entity Extraction Failed: {e}")
            return []

    @staticmethod
    async def synthesize_answer(query: str, path_nodes: List[str], vector_context: List[str]) -> str:
        """
        SYMBOLIC → NEURAL: Synthesizes a grounded, cited answer using:
        - The verified Knowledge Graph path (certain facts)
        - Supporting vector chunks from source documents (context)
        This is the 'right hemisphere' of the neuro-symbolic loop.
        """
        system = (
            "You are Aurelius, a Neuro-Symbolic Reasoning Engine. "
            "Your answers are grounded ONLY in verified Knowledge Graph paths and source document evidence. "
            "You never hallucinate. You always cite the reasoning path explicitly."
        )

        path_str = " → ".join(path_nodes) if path_nodes else "No direct graph path found."
        context_str = "\n\n---\n\n".join(vector_context[:3]) if vector_context else "No supporting context available."

        prompt = f"""USER QUESTION:
{query}

VERIFIED KNOWLEDGE GRAPH PATH (Deterministic Logic Chain):
{path_str}

SUPPORTING EVIDENCE (From Source Documents):
{context_str}

INSTRUCTIONS:
- Ground your entire answer in the provided evidence above
- Explicitly reference the reasoning path (e.g., "The graph shows: X → Y → Z")
- Be precise and concise (2-4 sentences)
- If the evidence is insufficient to answer, state that clearly and honestly
- Do NOT add information not present in the path or context

GROUNDED ANSWER:"""

        try:
            return await LLMEngine._call_llm(prompt, system, json_mode=False)
        except Exception as e:
            print(f"❌ Answer Synthesis Failed: {e}")
            return f"The Aurelius reasoning engine encountered an error during synthesis: {str(e)}"
