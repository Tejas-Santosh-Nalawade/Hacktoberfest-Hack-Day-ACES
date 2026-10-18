import io

from fastapi import HTTPException

MAX_BYTES = 10 * 1024 * 1024
MAX_CHARS = 80_000
NO_TEXT = "This file has no readable text. Try a text-based PDF or paste notes."


def extract_text(filename: str, data: bytes) -> dict:
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "File is larger than 10 MB")

    name = (filename or "").lower()
    pages = None
    try:
        if name.endswith(".pdf"):
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(data))
            pages = len(reader.pages)
            text = "\n".join((p.extract_text() or "") for p in reader.pages)
        elif name.endswith(".docx"):
            from docx import Document

            doc = Document(io.BytesIO(data))
            text = "\n".join(p.text for p in doc.paragraphs)
        elif name.endswith(".txt"):
            text = data.decode("utf-8", errors="ignore")
        else:
            raise HTTPException(400, "Unsupported file type. Upload a PDF, DOCX or TXT.")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(422, NO_TEXT)

    text = text.strip()
    if not text:
        raise HTTPException(422, NO_TEXT)

    truncated = len(text) > MAX_CHARS
    text = text[:MAX_CHARS]
    return {
        "filename": filename,
        "pages": pages,
        "chars": len(text),
        "text": text,
        "truncated": truncated,
    }
