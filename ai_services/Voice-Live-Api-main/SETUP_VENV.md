# Avoid dependency conflicts: use a venv for this project

The Voice-Live-Api stack (FastAPI, pypdf, azure-identity, etc.) can conflict with other tools you have (pandas, crewai, langchain, numpy versions). Use a **dedicated virtual environment** for this project so the rest of your system stays unchanged.



# Create venv
python3 -m venv .venv

# Activate (macOS/Linux)
source .venv/bin/activate

# Install only this project's deps
pip install -r requirements.txt
```

## Run the app

```bash
# Activate if not already
source .venv/bin/activate

# Start context API
python api.py

# In another terminal (with .venv active): run voice client
python test.py
```

When you’re done, run `deactivate` to leave the venv. Your base/conda environment and other projects are unaffected.
