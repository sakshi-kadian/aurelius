import pypdf
import re
import os
import tempfile
from fastapi import UploadFile, HTTPException


class PDFEngine:
    @staticmethod
    async def extract_text(file: UploadFile) -> str:
        """
        Extracts and cleans text from an uploaded PDF.
        Uses a proper NamedTemporaryFile to prevent race conditions on concurrent uploads.
        """
        tmp = None
        try:
            content = await file.read()

            # STEP 2 FIX: Use tempfile.NamedTemporaryFile instead of raw open()
            # This guarantees unique filenames under concurrent uploads and OS-managed cleanup.
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(content)
                tmp_path = tmp.name

            reader = pypdf.PdfReader(tmp_path)
            full_text = ""

            for page in reader.pages:
                text = page.extract_text()
                if text:
                    # 1. Remove "Page N of M" patterns and trailing page numbers
                    text = re.sub(r'Page \d+ of \d+', '', text)
                    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)

                    # 2. Strip short lines (likely headers/footers/artifacts)
                    lines = text.split('\n')
                    cleaned_lines = [line for line in lines if len(line.strip()) > 5]
                    full_text += "\n".join(cleaned_lines) + "\n"

            return full_text.strip()

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"PDF Extraction Failed: {str(e)}")
        finally:
            # Always clean up the temp file, even if an exception occurred
            if tmp and os.path.exists(tmp.name):
                os.remove(tmp.name)

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
        """
        Splits text into sliding window chunks for better RAG context.
        chunk_size=1000 chars, overlap=200 chars ensures no context loss at boundaries.
        """
        chunks = []
        start = 0
        text_len = len(text)

        while start < text_len:
            end = start + chunk_size
            chunk = text[start:end]
            if chunk.strip():  # Skip empty chunks
                chunks.append(chunk)
            start += chunk_size - overlap  # Sliding window

        return chunks
