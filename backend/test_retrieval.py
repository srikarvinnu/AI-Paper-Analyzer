from services.pdf_service import (
    extract_text_from_pdf,
    chunk_text
)

from services.embedding_service import (
    create_embeddings,
    model
)

from services.rag_service import (
    store_chunks,
    search_chunks
)

pdf_path = "uploads/1706.03762v7.pdf"

text = extract_text_from_pdf(pdf_path)

chunks = chunk_text(text)

embeddings = create_embeddings(chunks)

try:
    store_chunks(chunks, embeddings)
except:
    pass

question = "What is the Transformer architecture?"

question_embedding = model.encode(question)

results = search_chunks(
    question_embedding
)

print("\nTOP MATCHES:\n")

for chunk in results:
    print("=" * 50)
    print(chunk[:500])