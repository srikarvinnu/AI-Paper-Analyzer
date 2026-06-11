from services.pdf_service import (
    extract_text_from_pdf,
    chunk_text
)

from services.embedding_service import (
    create_embeddings
)

from services.rag_service import (
    store_chunks
)

pdf_path = "uploads/1706.03762v7.pdf"

text = extract_text_from_pdf(pdf_path)

chunks = chunk_text(text)

embeddings = create_embeddings(chunks)

stored = store_chunks(
    chunks,
    embeddings
)

print("Chunks Stored:", stored)