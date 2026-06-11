from services.embedding_service import model
from services.rag_service import search_chunks

import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load API key
load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

llm = genai.GenerativeModel(
    "gemini-2.5-flash"
)

question = "What is the Transformer architecture?"

# Create embedding for question
question_embedding = model.encode(
    question
)

# Retrieve relevant chunks
chunks = search_chunks(
    question_embedding
)

context = "\n\n".join(chunks)

prompt = f"""
Answer the question using ONLY the provided context.

Context:

{context}

Question:

{question}
"""

response = llm.generate_content(
    prompt
)

print("\nANSWER:\n")
print(response.text)