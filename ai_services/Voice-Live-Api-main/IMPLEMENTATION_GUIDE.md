# Voice Agent Implementation Guide

This guide explains how to manage the Voice Agent's knowledge base.

> [!IMPORTANT]
> The Voice Agent starts with **NO KNOWLEDGE**. 
> You **MUST** upload context (Text or PDF) via the API or the provided script for the agent to answer questions.
> If no context is provided, the agent will strictly refuse to answer.

## 1. Uploading Context

We provide a helper script `upload_context.py` to easily upload files.

### 1.1 Upload a Text File
Create a text file (e.g., `my_products.txt`) with your content, then run:

```bash
python upload_context.py my_products.txt
```

### 1.2 Upload a PDF File
You can upload product manuals, policies, or books in PDF format:

```bash
python upload_context.py my_manual.pdf
```

### 1.3 Clear & Replace Context
To clear the existing knowledge base before uploading new content, use the `--clear` flag:

```bash
python upload_context.py my_new_data.txt --clear
```

## 2. Managing Context via API (Advanced)

You can also interact directly with the API using `curl` or Postman.

**Base URL**: `http://localhost:8001`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/context` | Get current context stats (count, size). |
| `POST` | `/context/text` | Add a JSON payload: `{"text": "...", "label": "..."}` |
| `POST` | `/context/pdf` | Upload a file as `multipart/form-data`. |
| `DELETE` | `/context` | Clear all context. |

### Example: Upload PDF via Curl
```bash
curl -X POST "http://localhost:8001/context/pdf" \
     -F "file=@/path/to/manual.pdf" \
     -F "label=Manual"
```

## 3. Verify

1.  Start the voice client:
    ```bash
    python test.py
    ```
2.  Ask a question based on your uploaded content.
3.  Ask an unrelated question. The agent should strictly refuse to answer.
