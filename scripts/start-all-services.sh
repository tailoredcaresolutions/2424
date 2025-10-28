#!/bin/bash
#
# Start All Local Services
# Usage: ./scripts/start-all-services.sh
#

set -e

echo "🚀 Starting All PSW Services..."
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# 1. Check and start Ollama
echo "1️⃣  Checking Ollama (localhost:11434)..."
if ! pgrep -x "ollama" > /dev/null; then
    echo "   ⚠️  Ollama not running"
    echo "   Starting Ollama..."
    ollama serve > /tmp/ollama.log 2>&1 &
    echo "   ✅ Ollama started"
    sleep 3
else
    echo "   ✅ Ollama already running"
fi

# 2. Check Whisper.cpp
echo ""
echo "2️⃣  Checking Whisper.cpp (localhost:9000)..."
if check_port 9000; then
    echo "   ✅ Whisper.cpp is running"
else
    echo "   ⚠️  Whisper.cpp not detected on port 9000"
    echo "   Please start Whisper.cpp manually"
    echo "   See: docs/LOCAL_AI_MODELS_SETUP.md"
fi

# 3. Check XTTS
echo ""
echo "3️⃣  Checking Coqui XTTS (localhost:8020)..."
if check_port 8020; then
    echo "   ✅ XTTS is running"
else
    echo "   ⚠️  XTTS not detected on port 8020"
    echo "   Please start XTTS manually"
    echo "   See: docs/LOCAL_AI_MODELS_SETUP.md"
fi

# 4. Start Backend
echo ""
echo "4️⃣  Starting Backend Server (localhost:4000)..."
if check_port 4000; then
    echo "   ⚠️  Port 4000 already in use"
    echo "   Kill existing process? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        echo "   Killing process on port 4000..."
        kill $(lsof -t -i:4000) 2>/dev/null || true
        sleep 2
    else
        echo "   Skipping backend start"
    fi
fi

if ! check_port 4000; then
    cd "$(dirname "$0")/../backend"
    npm start > /tmp/psw-backend.log 2>&1 &
    echo "   ✅ Backend started (logs: /tmp/psw-backend.log)"
    sleep 3
fi

# 5. Start Cloudflare Tunnel
echo ""
echo "5️⃣  Starting Cloudflare Tunnel..."
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "   ⚠️  cloudflared not installed"
    echo "   Install with: brew install cloudflare/cloudflare/cloudflared"
    echo ""
    echo "   Skipping tunnel..."
else
    echo "   Starting tunnel in foreground..."
    echo "   (Tunnel URL will be displayed below)"
    echo ""

    # Check for named tunnel
    if [ -f ~/.cloudflared/config.yml ]; then
        TUNNEL_NAME=$(grep "^tunnel:" ~/.cloudflared/config.yml | awk '{print $2}')
        if [ -n "$TUNNEL_NAME" ]; then
            cloudflared tunnel run "$TUNNEL_NAME"
        else
            cloudflared tunnel --url http://localhost:4000
        fi
    else
        cloudflared tunnel --url http://localhost:4000
    fi
fi

echo ""
echo "✅ All services started!"
