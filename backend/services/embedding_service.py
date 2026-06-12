import google.generativeai as genai
import os

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

def create_embeddings(texts):
    embeddings = []

    for text in texts:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text
        )

        embeddings.append(
            result["embedding"]
        )

    return embeddings


def get_model():
    return None