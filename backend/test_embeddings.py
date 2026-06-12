import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    result = genai.embed_content(
    model="models/gemini-embedding-001",
    content="Hello world"
)

    print("SUCCESS")
    print(len(result["embedding"]))

except Exception as e:
    print("ERROR:")
    print(e)