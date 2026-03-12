from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import PyPDF2
import io

app = FastAPI(
    title="Voice Live Context API",
    version="1.0.0"
)

# In-memory storage
context_store = []


# =====================
# Models
# =====================

class ContextItem(BaseModel):
    text: str
    label: str = "general"


# =====================
# Root
# =====================

@app.get("/")
def root():
    return {"message": "Voice Live Context API running"}


# =====================
# TEXT CONTEXT
# =====================

@app.post("/context/text")
def add_text_context(item: ContextItem):

    context_store.append({
        "text": item.text,
        "label": item.label
    })

    return {
        "status": "success",
        "added": 1,
        "total_chunks": len(context_store)
    }


@app.post("/context/text/batch")
def add_text_batch(items: List[ContextItem]):

    count = 0

    for item in items:
        context_store.append({
            "text": item.text,
            "label": item.label
        })
        count += 1

    return {
        "status": "success",
        "added": count,
        "total_chunks": len(context_store)
    }


# =====================
# PDF CONTEXT
# =====================

@app.post("/context/pdf")
async def add_pdf(file: UploadFile = File(...)):

    content = await file.read()

    pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))

    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"

    context_store.append({
        "text": text,
        "label": file.filename
    })

    return {
        "status": "success",
        "filename": file.filename,
        "total_chunks": len(context_store)
    }


@app.post("/context/pdf/batch")
async def add_pdf_batch(files: List[UploadFile] = File(...)):

    count = 0

    for file in files:

        content = await file.read()

        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))

        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"

        context_store.append({
            "text": text,
            "label": file.filename
        })

        count += 1

    return {
        "status": "success",
        "added": count,
        "total_chunks": len(context_store)
    }


# =====================
# GET CONTEXT INFO
# =====================

@app.get("/context")
def get_context():

    total_chars = sum(len(item["text"]) for item in context_store)

    return {
        "chunks": len(context_store),
        "total_characters": total_chars,
        "has_context": len(context_store) > 0
    }


# =====================
# DELETE CONTEXT
# =====================

@app.delete("/context")
def clear_context():

    context_store.clear()

    return {
        "status": "success",
        "message": "All context cleared"
    }


# =====================
# INSTRUCTIONS
# =====================

@app.get("/instructions")
def get_instructions():

    # Robust multilingual instructions
    instructions = ("""

You are Voxa, a friendly AI voice assistant.

Communication Style:
- Speak naturally like a helpful friend.
- Keep responses short, conversational, and easy to understand.
- Do NOT say emoji names like 'smile', 'thumbs up', 'wave' etc.
- Use examples, analogies, and short story-style explanations when helpful.

Language Rule:
- Detect user's language and reply in the same language.
- Translate knowledge base content if needed.

Knowledge Base Rule (IMPORTANT):
- Always prioritize information from the knowledge base.
- If the question relates to something mentioned in the knowledge base, answer using that information.

Expansion Rule (VERY IMPORTANT):
- You ARE allowed to expand using general knowledge to explain better.
- You CAN add real-world examples, device names, or common usage.
- Example:
  If knowledge base mentions "Siri is a voice assistant",
  you can explain:
  "Siri is Apple's voice assistant used in iPhones, MacBooks, and other Apple devices."

Restriction Rule:
- DO NOT invent fake companies, fake pricing, or fake technical specs not related to context.
- Only expand logically from real-world common knowledge.

If information truly does not exist in context or related general knowledge:
Say politely:
"I don't have specific details about that, but I can explain related concepts."

Noise handling:
If transcript is gibberish, politely ask user to repeat.

Goal:
Help users understand concepts clearly using knowledge base AND real-world examples.
"""

    )
    
    # Add context constraint
    if context_store:
        context_text = "\n\n".join([c["text"] for c in context_store])
        if len(context_text) > 20000:
            context_text = context_text[:20000] + "\n... (truncated)"
        instructions += "\n\n--- KNOWLEDGE BASE ---\n" + context_text + "\n--- END KNOWLEDGE BASE ---\n"
        instructions += (
            "Rules:\n"
            "- Prioritize knowledge base content when answering lesson-related questions.\n"
            "- For questions outside the knowledge base, answer using your general AI knowledge.\n"
            "- Never say you cannot answer something — always try to help.\n"
        )
    else:
        instructions += "\nAnswer all questions using your general AI knowledge. Never refuse to answer."

    return {
        "instructions": instructions,
        "context_summary": f"{len(context_store)} chunks"
    }


# =====================
# RUN SERVER
# =====================

if __name__ == "__main__":

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001
    )
