#!/bin/bash
# Setup script for Voice-Live-Api with isolated virtual environment

set -e

echo "🐍 Creating virtual environment with Python 3.12.4..."
python3 -m venv .venv

echo "✅ Virtual environment created!"
echo ""
echo "📦 Installing dependencies..."
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "✨ Setup complete!"
echo ""
echo "To use the virtual environment:"
echo "  source .venv/bin/activate"
echo ""
echo "Then run:"
echo "  python api.py        # Start FastAPI context server"
echo "  python test.py       # Start voice chat client"
echo ""
echo "To deactivate when done:"
echo "  deactivate"
