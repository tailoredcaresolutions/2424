#!/bin/bash
#
# Start Backend Server
# Usage: ./scripts/start-backend.sh
#

set -e

echo "🚀 Starting PSW Backend Server..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../backend"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: backend/.env not found"
    echo "📝 Copy .env.example to .env and configure it:"
    echo "   cp .env.example .env"
    echo "   nano .env"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if database exists
if [ ! -f ../data/local_psw_data.db ]; then
    echo "⚠️  Warning: Database not found at ../data/local_psw_data.db"
    echo "   Backend will attempt to create it on first run"
fi

# Check if Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
    echo "⚠️  Warning: Ollama is not running"
    echo "   Start it with: ollama serve"
fi

# Start backend server
echo ""
echo "✅ Starting backend on port 4000..."
echo "   API: http://localhost:4000"
echo "   Health: http://localhost:4000/health"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm start
