#!/bin/bash
# Stop All Services - Clean Shutdown

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[ lion'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🛑 Stopping All PSW Reporting Services..."
echo ""

# Stop backend
echo "1️⃣  Stopping Backend Server..."
if [ -f "$PROJECT_ROOT/logs/service-pids.txt" ]; then
    BACKEND_PID=$(grep "BACKEND_PID=" "$PROJECT_ROOT/logs/service-pids.txt" | cut -d'=' -f2)
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID"
        echo -e "   ${GREEN}✅ Backend stopped (PID: $BACKEND_PID)${NC}"
    fi
fi

# Also try to find and kill by process
if lsof -ti:4000 > /dev/null 2>&1; then
    kill $(lsof -ti:4000) 2>/dev/null
    echo -e "   ${GREEN}✅ Backend on port 4000 stopped${NC}"
fi

# Stop tunnel
echo ""
echo "2️⃣  Stopping Cloudflare Tunnel..."
if [ -f "$PID_FILE" ]; then
    TUNNEL_PID=$(grep "TUNNEL_PID=" "$PID_FILE" | cut -d'=' -f2)
    if [ -n "$TUNNEL_PID" ] && kill -0 "$TUNNEL_PID" 2>/dev/null; then
        kill "$TUNNEL_PID"
        echo -e "   ${GREEN}✅ Tunnel stopped (PID: $TUNNEL_PID)${NC}"
    fi
fi

# Also try to find and kill cloudflared processes
if pgrep -f cloudflared > /dev/null; then
    pkill -f cloudflared
    echo -e "   ${GREEN}✅ All cloudflared processes stopped${NC}"
fi

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""
