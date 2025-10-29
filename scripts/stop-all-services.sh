#!/bin/bash
#
# Stop All Local Services
# Usage: ./scripts/stop-all-services.sh
#

echo "🛑 Stopping All PSW Services..."
echo ""

# Stop backend
echo "1️⃣  Stopping Backend Server..."
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    kill $(lsof -t -i:4000) 2>/dev/null || true
    echo "   ✅ Backend stopped"
else
    echo "   ℹ️  Backend not running"
fi

# Stop Cloudflare Tunnel
echo ""
echo "2️⃣  Stopping Cloudflare Tunnel..."
if pgrep -f cloudflared > /dev/null; then
    pkill -f cloudflared
    echo "   ✅ Tunnel stopped"
else
    echo "   ℹ️  Tunnel not running"
fi

# Stop Ollama (optional - comment out if you want Ollama to keep running)
echo ""
echo "3️⃣  Stopping Ollama..."
if pgrep -x "ollama" > /dev/null; then
    echo "   ⚠️  Keep Ollama running? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        pkill -x ollama
        echo "   ✅ Ollama stopped"
    else
        echo "   ℹ️  Keeping Ollama running"
    fi
else
    echo "   ℹ️  Ollama not running"
fi

# Note about Whisper and XTTS
echo ""
echo "4️⃣  Whisper.cpp and XTTS"
echo "   ℹ️  Stop these manually if needed"

echo ""
echo "✅ Services stopped!"
echo ""
echo "To restart: ./scripts/start-all-services.sh"
