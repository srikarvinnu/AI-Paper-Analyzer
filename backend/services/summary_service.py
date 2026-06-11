import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)


def generate_summary(text):

    text = text[:3000]

    prompt = f"""
You are an expert research paper analyst.

Return ONLY valid JSON.

{{
    "paper_summary": "",
    "problem_statement": "",
    "objectives": [],
    "methodology": "",
    "key_findings": [],
    "conclusion": "",
    "limitations": "",
    "future_work": ""
}}

Analyze the following document:

{text}
"""

    response = model.generate_content(
        prompt
    )

    cleaned_response = (
        response.text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    try:
        return json.loads(
            cleaned_response
        )
    except:
        return cleaned_response