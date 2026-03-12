from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="AI Services - Knowledge Intelligence",
    description="AI/ML services for knowledge extraction and content generation",
    version="1.0.0"
)
from ai_content_router import router as ai_content_router

app.include_router(ai_content_router)
# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "AI Services - Knowledge Intelligence",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Import routers (to be implemented)
# from knowledge_extraction import router as knowledge_router
# from content_generation import router as generation_router
# from qa_system import router as qa_router

# app.include_router(knowledge_router, prefix="/process", tags=["Knowledge Processing"])
# app.include_router(generation_router, prefix="/generate", tags=["Content Generation"])
# app.include_router(qa_router, prefix="/qa", tags=["Question Answering"])

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_SERVICES_PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
