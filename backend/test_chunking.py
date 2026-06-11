from services.pdf_service import (
    extract_text_from_pdf,
    chunk_text
)

text = extract_text_from_pdf(
    "uploads/1706.03762v7.pdf"
)

chunks = chunk_text(text)

print(
    "Total Chunks:",
    len(chunks)
)

print(
    "\nChunk 1 Length:",
    len(chunks[0].split())
)

print(
    "\nChunk 2 Length:",
    len(chunks[1].split())
)