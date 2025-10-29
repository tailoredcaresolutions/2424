#!/bin/bash
# Start All Services - Frontend-Backend Communication Setup
# This script ensures everything needed for frontend-backend communication is running

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting All PSW Reporting Services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# 1. Check if backend server is running
echo "1️⃣  Checking Backend Server (port 4000)..."
if curl -s -f http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Backend already running${NC}"
    BACKEND_RUNNING=true
else
    echo -e "   ${YELLOW}⚠️  Backend not running${NC}"
    BACKEND_RUNNING=false
fi

# 2. Check if Cloudflare Tunnel is running
echo ""
echo "2️⃣  Checking Cloudflare Tunnel..."
TUNNEL_RUNNING=false
if pgrep -f "cloudflared.*tunnel run" > /dev/null || pgrep -f "cloudflared.*--url" > /dev/null; then
    echo -e "   ${GREEN}✅ Tunnel already running${NC}"
    TUNNEL_RUNNING=true
    
    # Try to get tunnel URL
    if [ -f "$HOME/.cloudflared/tunnel_url.txt" ]; then
        TUNNEL_URL=$(cat "$HOME/.cloudflared/tunnel_url.txt")
        echo "   Tunnel URL: $TUNNEL_URL"
    fi
else
    echo -e "   ${YELLOW}⚠️  Tunnel not running${NC}"
fi

# 3. Start Backend Server if needed
if [ "$BACKEND_RUNNING" = false ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 Starting Backend Server..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd "$PROJECT_ROOT/backend"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "   ${YELLOW}⚠️  Installing backend dependencies...${NC}"
        npm install
    fi
    
    # Start backend in background
    echo -e "   ${BLUE}Starting backend server on port 4000...${NC}"
    nohup npm start > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo "   Backend PID: $BACKEND_PID"
    
    # Wait for backend to start
    echo "   Waiting for backend to start..."
    MAX_WAIT=30
    WAIT_COUNT=0
    while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
        if curl -s -f http://localhost:4000/health > /dev/null 2>&1; then
            echo -e "   ${GREEN}✅ Backend started successfully!${NC}"
            BACKEND_RUNNING=true
            break
        fi
        sleep 1
        WAIT_COUNT=$((WAIT_COUNT + 1))
        echo -n "."
    done
    echo ""
    
    if [ "$BACKEND_RUNNING" = false pursue ]; then
        echo -e "   ${RED}❌ Backend failed to start after ${MAX_WAIT} seconds${NC}"
        echo "   Check logs: tail -f logs/backend.log"
        exit 1
    fi
    
    cd "$PROJECT_ROOT"
fi

# 4. Check environment variables
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Checking Environment Configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check backend .env
if [ -f "$PROJECT_ROOT/backend/.env" ]; then
    echo -e "   ${GREEN}✅ backend/.env exists${NC}"
    
    if grep -q "ALL薄弱ED_ORIGINS" "$PROJECT_ROOT/backend/.env"; then
        ORIGINS=$(grep "ALLOWED_ORIGINS" "$PROJECT_ROOT/backend/.env" | cut -d'=' -f2 | tr -d ' ' | head -1)
        echo "   ALLOWED_ORIGINS: $ORIGINS"
    else
        echo -e "   ${YELLOW}⚠️  ALLOWED_ORIGINS not set in backend/.env${NC}"
        echo "   Add: ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app"
    fi
else
    echo -e "   ${YELLOW}⚠️  backend/.env not儿媳 found${NC}"
    echo "   Creating template..."
    cat > "$PROJECT_ROOT/backend/.env" << EOF
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
EOF
    echo "   Created backend/.env template - please update ALLOWED_ORIGINS with your Vercel URL"
fi

# Check frontend .env.local
if [ -f "$PROJECT_ROOT/.env.local" ]; then
    echo -e "   ${GREEN}✅ .env.local exists${NC}"
    
    if grep -q "NEXT_PUBLIC_BACKEND_URL" "$PROJECT_ROOT/.env.local"; then
        BACKEND_URL=$(grep "NEXT_PUBLIC_BACKEND_URL" "$PROJECT_ROOT/.env.local" | cut -d'=' -f2 | tr -d ' ' | tr -d '"' یاد | tr -d "'" | head -1)
        echo "   NEXT_PUBLIC_BACKEND_URL: $BACKEND_URL"
    else
        echo -e "   ${YELLOW}⚠️  NEXT_PUBLIC_BACKEND_URL not set in .env.local${NC}"
        echo "   For local dev, add: NEXT_PUBLIC_BACKEND_URL=http://localhost:4000"
    fi
else
    echo -e "   ${YELLOW}ℹ️  .env.local not found (OK - will use defaults)${NC}"
fi

# 5. Start Cloudflare Tunnel if needed
if [ "$TUNNEL_RUNNING" = false ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌐 Starting Cloudflare Tunnel..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check if cloudflared is installed
    if ! command -v cloudflared &> /dev/null; then
        echo -e "   ${RED}❌ cloudflared not installed${NC}"
        echo "   Install with: brew install cloudflared"
        echo "   Or download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/"
        exit 1
    fi
    
    # Check for named tunnel
    if [ -f "$HOME/.cloudflared/config.yml" ]; then
        TUNNEL_NAME=$(grep "^tunnel:" "$HOME/.cloudflared/config.yml" | awk '{print $2}' | head -1)
        if [ -n "$TUNNEL_NAME" ]; then
            echo -e "   ${BLUE}Found named tunnel: $TUNNEL_NAME${NC}"
            echo "   Starting tunnel in background..."
            nohup cloudflared tunnel run "$TUNNEL_NAME" > "$PROJECT_ROOT/logs/tunnel.log" 2>&1 &
            TUNNEL_PID=$!
            echo "   Tunnel PID: $TUNNEL_PID"
            
            # Try to get tunnel URL from config or saved file
            if [ -f "$HOME/.cloudflared/tunnel_url.txt" ]; then
                TUNNEL_URL=$(cat "$HOME/.cloudflared/tunnel_url.txt")
                echo "   Tunnel URL: $TUNNEL_URL"
            else
                echo "   Waiting for tunnel to establish..."
                sleep 5
                # Try to extract URL from logs
                if [ -f "$PROJECT_ROOT/logs/tunnel.log" ]; then
                    TUNNEL_URL=$(grep -i "https://.*trycloudflare.com\|https://.*tailoredcaresolutions.com" "$PROJECT_ROOT/logs/tunnel.log" | head -1 | grep -o 'https://[^ ]*' | head -1)
                    if [ -n "$TUNNEL_URL" ]; then
                        echo "$TUNNEL_URL" > "$HOME/.cloudflared/tunnel_url.txt"
                        echo "   Tunnel URL: $TUNNEL_URL"
                    fi
                fi
            fi
        else
            echo -e "   ${YELLOW}⚠️  No tunnel name found in config${NC}"
            echo "   Starting quick tunnel..."
            nohup cloudflared tunnel --url http://localhost:4000 > "$PROJECT_ROOT/logs/tunnel.log" 2>&1 &
            TUNNEL_PID=$!
            echo "   Tunnel PID: $TUNNEL_PID"
            echo "   Check logs for URL: tail -f logs/tunnel.log"
        fi
    else
        echo -e "   ${YELLOW}⚠️  No tunnel config found${NC}"
        echo "   Starting quick tunnel (temporary URL)..."
        nohup cloudflared tunnel --url http://localhost:4000 > "$PROJECT_ROOT/logs/tunnel.log" 2>&1 &
        TUNNEL_PID=$!
        echo "   Tunnel PID: $TUNNEL_PID"
        echo "   ⚠️  Quick tunnel URL changes on restart"
        echo "   For permanent URL, setup named tunnel: ./scripts/setup-cloudflare-tunnel.sh"
        echo "   Check logs for URL: tail -f logs/tunnel.log"
        sleep 3
    fi
    
    TUNNEL_RUNNING=true
    
    # Wait a bit and verify tunnel
    sleep 3
    if [ -n "$TUNNEL_URL" ]; then
        if curl -s -f "$TUNNEL_URL/health" > /dev/null 2>&1; then
            echo -e "   ${GREEN}✅ Tunnel is reachable!${NC}"
        else
            echo -e "   ${YELLOW}⚠️  Tunnel started but not yet reachable${NC}"
            echo "   Give it a few more seconds..."
        fi
    fi
fi

# 6. Final status check
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Startup Complete - Final Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test backend
if curl -s -f http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend Server: RUNNING${NC}"
    curl -s http://localhost:4000/health | head -1
else
    echo -e "${RED}❌ Backend Server: NOT RUNNING${NC}"
fi

echo ""

# Test tunnel if URL available
if [ -n "$TUNNEL_URL" ]; then
    if curl -s -f "$TUNNEL_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Cloudflare Tunnel: RUNNING${NC}"
        echo "   URL: $TUNNEL_URL"
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANT: Update Vercel Environment Variable:${NC}"
        echo "   NEXT_PUBLIC_BACKEND_URL=$TUNNEL_URL"
        echo "   Then redeploy your Vercel app"
    else
        echo -e "${YELLOW}⚠️  Cloudflare Tunnel: STARTED (checking...)${NC}"
        echo "   URL: $TUNNEL_URL"
        echo "   It may take a few seconds to be reachable"
    fi
elif [ "$TUNNEL_RUNNING" = true ]; then
    echo -e "${YELLOW}⚠️  Cloudflare Tunnel: STARTED${NC}"
    echo "   Check logs for URL: tail -f logs/tunnel.log"
    echo "   Look for a line with 'https://*.trycloudflare.com'"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. If tunnel URL was shown above, update Vercel:"
echo "   → Vercel Dashboard → Settings → Environment Variables"
echo "   → Set NEXT_PUBLIC_BACKEND_URL to tunnel URL"
echo "   → Redeploy app"
echo ""
echo "2. Update backend/.env ALLOWED_ORIGINS:"
echo "   → Add your Vercel app URL"
echo "   → Restart backend: cd backend && npm start"
echo ""
echo "3. Monitor logs:"
echo "   → Backend: tail -f logs/backend.log"
echo "   → Tunnel: tail -f logs/tunnel.log"
echo ""
echo "4. Run diagnostics:"
echo "   → ./scripts/diagnose-connection.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/logs"

# Save PIDs for later reference
echo "BACKEND_PID=$BACKEND_PID" > "$PROJECT_ROOT/logs/service-pids.txt"
echo "TUNNEL_PID=$TUNNEL_PID" >> "$PROJECT_ROOT/logs/service-pids.txt"
echo "Started at: $(date)" >> "$PROJECT_ROOT/logs/service-pids.txt"

echo -e "${GREEN}✨ Services are starting! Check logs directory for output.${NC}"
echo ""
