import pypdf
import re
from fastapi import UploadFile, HTTPException

class PDFEngine:
    @staticmethod
    async def extract_text(file: UploadFile) -> str:
        """
        Extracts and cleans text from an uploaded PDF.
        Removes headers, footers, and page numbers to prevent 'garbage nodes'.
        """
        try:
            # Read file into memory
            content = await file.read()
            
            # Save temporarily (pypdf requires a file-like object or path)
            temp_path = f"temp_{file.filename}"
            with open(temp_path, "wb") as f:
                f.write(content)
            
            reader = pypdf.PdfReader(temp_path)
            full_text = ""
            
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    # CONFIG: Usage of Regex to clean "Garbage"
                    # 1. Remove Page Numbers (e.g., "Page 1 of 10")
                    text = re.sub(r'Page \d+ of \d+', '', text)
                    text = re.sub(r'\d+\s*$', '', text, flags=re.MULTILINE) # Simple page numbers at end of line
                    
                    # 2. Remove common headers/footers (customize as needed)
                    # This removes lines that are too short (likely artifacts)
                    lines = text.split('\n')
                    cleaned_lines = [line for line in lines if len(line.strip()) > 5]
                    
                    full_text += "\n".join(cleaned_lines) + "\n"
            
            # Cleanup temp file
            import os
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
            return full_text.strip()
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"PDF Extraction Failed: {str(e)}")

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
        """
        Splits text into sliding windows for better RAG context.
        """
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - overlap # Sliding window
            
        return chunks
