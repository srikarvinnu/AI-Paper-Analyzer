from fastapi.middleware.cors import CORSMiddleware
from httpcore import request
from typer import prompt
from services.chat_service import (
    init_db,
    create_conversation,
    save_message,
    get_conversations,
    get_messages,
    delete_conversation,
    rename_conversation,
    update_conversation_title,
    save_uploaded_file,
    get_uploaded_file
)
from services.summary_service import (
    generate_summary
)
from services.pdf_service import (
    extract_text_from_pdf,
    chunk_text,
    extract_metadata
)

from services.rag_service import (
    store_chunks,
)
from fastapi import FastAPI, UploadFile, File, Query, Form
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import fitz
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

from services.embedding_service import (
    create_embeddings,
)
from services.rag_service import search_chunks

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

# Gemini model
model = genai.GenerativeModel("gemini-2.5-flash")

# FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
init_db()
print("DATABASE INITIALIZED")

# Upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


# Request model for chatbot
class ConversationRequest(
    BaseModel
):
    title: str
    user_email: str


class ChatRequest(BaseModel):
    conversation_id: int
    question: str

class RenameRequest(BaseModel):
    title: str


@app.get("/")
def home():
    return {
        "message": "AI Research Paper Analyzer API Running"
    }
@app.post("/conversation")
async def create_chat(
    request: ConversationRequest
):

    print(
        "CREATE CHAT CALLED"
    )

    print(
        request.title
    )

    print(
        request.user_email
    )

    conversation_id = create_conversation(
        request.title,
        request.user_email
    )

    return {
        "conversation_id": conversation_id
    }

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as f:
        f.write(await file.read())

    pdf = fitz.open(file_path)

    text = ""

    for page in pdf:
        text += page.get_text()

    pages = len(pdf)

    pdf.close()

    return {
        "filename": file.filename,
        "pages": pages,
        "text_preview": text[:1000]
    }


@app.post("/summarize")
async def summarize_pdf(file: UploadFile = File(...)):

    try:

        file_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        with open(file_path, "wb") as f:
            f.write(await file.read())

        pdf = fitz.open(file_path)

        text = ""

        for page in pdf:
            text += page.get_text()

        pdf.close()

        analysis = generate_summary(
            text
        )

        return {
            "filename": file.filename,
            "analysis": analysis
        }

    except Exception as e:

        return {
            "filename": file.filename,
            "error": str(e)
        }
@app.post("/index-pdf")
async def index_pdf(
    conversation_id: int = Form(...),
    file: UploadFile = File(...)
):
    print(
    "PDF UPLOAD RECEIVED:",
    conversation_id,
    file.filename
)
    try:

        file_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        with open(file_path, "wb") as f:
            f.write(await file.read())

        save_uploaded_file(
            conversation_id,
            file.filename,
            file_path
        )

        print(
            "PDF SAVED:",
            conversation_id,
            file.filename
        )

        # Extract text
        metadata = extract_metadata(
            file_path
        )
        text = extract_text_from_pdf(
            file_path
        )

        # Create chunks
        chunks = chunk_text(
            text
        )

        # Create embeddings
        embeddings = create_embeddings(
            chunks
        )


        # Store chunks in ChromaDB
        stored = store_chunks(
        conversation_id,
        chunks,
        embeddings
        
)

        return {
    "filename": file.filename,
    "chunks_stored": stored,
    "title": metadata.get("title"),
    "word_count": len(text.split()),
    "chunks": len(chunks)
}
    except Exception as e:

        return {
            "error": str(e)
        }

@app.post("/ask")
async def ask_question(request: ChatRequest):

    try:
        conversation_id = request.conversation_id
        question = request.question

        messages = get_messages(
        conversation_id
    )

        save_message(
        conversation_id,
        "user",
        question
    )

        question_embedding = create_embeddings(
    [question]
)[0]

        chunks = search_chunks(
    conversation_id,
    question_embedding
)
        if not chunks:
            return {
                "answer":
                "I could not find relevant information in the uploaded paper.",
                "sources": []
    }

        print("\nQUESTION =", question)
        print("CHUNKS FOUND =", len(chunks))

        for i, chunk in enumerate(chunks):
            print(f"\nCHUNK {i+1}")
            print(chunk[:500])
            print("----------------")

        context = "\n\n".join(
        chunks
    )
        print(
    "CONTEXT LENGTH =",
    len(context)
)

        prompt = f"""
```

You are an AI Research Paper Assistant.

Answer ONLY using the provided context.

If the answer is not found in the context,
reply:

"I could not find that information in the uploaded paper."

Context:

{context}

Question:

{question}
"""

        response = model.generate_content(
        prompt
    )

        answer = response.text

        save_message(
        conversation_id,
        "assistant",
        answer
    )

        return {
        "conversation_id": conversation_id,
        "question": question,
        "answer": answer,
        "sources": chunks
    }

    except Exception as e:

        import traceback

        traceback.print_exc()

        print("ERROR =", str(e))


    return {
        "answer":
        "⚠️ AI service is temporarily busy. Please wait for some time and try again.",
        "sources": []
    }

@app.get("/conversations")
async def conversations(
    user_email: str = Query(...)
):

    data = get_conversations(
        user_email
    )

    result = []

    for row in data:

        result.append({
            "id": row[0],
            "title": row[2],
            "created_at": row[3]
        })

    return result
@app.get("/conversation/{conversation_id}")
async def conversation_messages(
    conversation_id: int
):

    messages = get_messages(
        conversation_id
    )

    result = []


    for role, content in messages:

        result.append({
            "role": role,
            "content": content
        })

    return result
@app.delete(
    "/conversation/{conversation_id}"
)
async def delete_chat(
    conversation_id: int
):

    delete_conversation(
        conversation_id
    )

    return {
        "message":
        "Conversation deleted"
    }
@app.put(
    "/conversation/{conversation_id}"
)
async def rename_chat(
    conversation_id: int,
    request: RenameRequest
):

    rename_conversation(
        conversation_id,
        request.title
    )

    return {
        "message":
        "Conversation renamed"
    }