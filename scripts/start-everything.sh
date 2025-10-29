#!/bin/bash
# Start Everything - Backend Server + Cloudflare Tunnel
# Starts services in correct order: Backend first, then Tunnel

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOGS_DIR="$PROJECT_ROOT/logs"
PID_FILE="$LOGS_DIR/service-pids.txt"

# Create logs directory
mkdir -p "$LOGS_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting PSW Reporting Services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$PROJECT_ROOT"

# Function to check if port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local name=$2
    local max_wait=${3:-30}
    local wait_count=0
    
    echo -e "   ${CYAN}Waiting for $name to be ready...${NC}"
    while [ $wait_count -lt $max_wait ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            return 0
        fi
        sleep 1
        wait_count=$((wait_count + 1))
        echo -n "."
    done
    echo ""
    return 1
}

# ============================================================================
# STEP 1: Start Backend Server (Port 4000)
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Starting Backend Server (Port 4000)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if already running
if check_port 4000; then
    EXISTING_PID=$(lsof -ti:4000)
    echo -e "   ${YELLOW}⚠️  Port 4000 already in use (PID: $EXISTING_PID)${NC}"
    read -p "   Kill existing process and restart? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill $EXISTING_PID 2>/dev/null || true
        sleep 2
    else
        echo -e "   ${GREEN}✅ Using existing backend process${NC}"
        BACKEND_PID=$EXISTING_PID
        BACKEND_RUNNING=true
    fi
fi

if [ "$BACKEND_RUNNING" != true ]; then
    cd "$PROJECT_ROOT/backend"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "   ${YELLOW}⚠️  Installing backend dependencies...${NC}"
        npm install
    fi
    
    # Check for .env file
    if [ ! -f ".env" ]; then
        echo -e "   ${YELLOW}⚠️  Creating backend/.env template...${NC}"
        cat > .env << EOF
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000,https://pswback.tailoredcaresolutions.com
NODE_ENV=development
EOF
        echo -e "   ${CYAN}Please update backend/.env with your Vercel URL in ALLOWED_ORIGINS${NC}"
    fi
    
    # Start backend in background
    echo -e "   ${BLUE}Starting backend server...${NC}"
    nohup npm start > "$LOGS_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo "   Backend PID: $BACKEND_PID"
    
    # Wait for backend to be ready
    if wait_for_service "http://localhost:4000/health" "Backend" 30; then
        echo -e "   ${GREEN}✅ Backend started successfully!${NC}"
        BACKEND_RUNNING=true
        
        # Show first few lines of backend output
        sleep 1
        echo -e "   ${CYAN}Backend logs (first 5 lines):${NC}"
        head -5 "$LOGS_DIR/backend.log" | sed 's/^/      /'
    else
        echo -e "   ${RED}❌ Backend failed to start after 30 seconds${NC}"
        echo "   Check logs: tail -f $LOGS_DIR/backend.log"
        exit 1
    fi
fi

cd "$PROJECT_ROOT"

# ============================================================================
# STEP 2: Start Cloudflare Tunnel
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Starting Cloudflare Tunnel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if cloudflared throw installed
if ! command -v cloudflared &> /dev/null; then
    echo -e "   ${RED}❌ cloudflared not installed${NC}"
    echo "   Install with: brew install cloudflared"
    echo "   Or download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/"
    exit 1
fi

# Check if tunnel is already running
if pgrep -f "cloudflared.*tunnel run" > /dev/null || pgrep -f "cloudflared.*--url.*4000" > /dev/null; then
    EXISTING_TUNNEL_PID=$(pgrep -f "cloudflared.*tunnel run\|cloudflared.*--url.*4000")
    echo -e "   ${YELLOW}⚠️  Cloudflare Tunnel already running (PID: $EXISTING_TUNNEL_PID)${NC}"
    read -p "   Kill existing tunnel and restart? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pkill -f "cloudflared.*tunnel\|cloudflared.*--url" || true
        sleep 2
    else
        echo -e "   ${GREEN}✅ Using existing tunnel process${NC}"
        TUNNEL_PID=$EXISTING_TUNNEL_PID
        TUNNEL_RUNNING=true
    fi
fi

if [ "$TUNNEL_RUNNING" != true ]; then
    # Check for named tunnel configuration
    TUNNEL_CONFIG="$HOME/.cloudflared/config.yml"
    TUNNEL_NAME=""
    
    if [ -f "$TUNNEL_CONFIG" ]; then
        TUNNEL_NAME=$(grep "^tunnel:" "$TUNNEL_CONFIG" | awk '{print $2}' | head -1)
    fi
    
    if [ -n "$TUNNEL_NAME" ]; then
        echo -e "   ${BLUE}Found named tunnel: ${CYAN}$TUNNEL_NAME${NC}"
        echo "   Starting named tunnel..."
        nohup cloudflared tunnel run "$TUNNEL_NAME" > "$LOGS_DIR/tunnel.log" 2>&1 &
        TUNNEL_PID=$!
        echo "   Tunnel PID: $TUNNEL_PID"
    else
        echo -e "   ${YELLOW}⚠️  No named tunnel found${NC}"
        echo "   Starting quick tunnel (temporary - URL changes on restart)..."
        echo -e "   ${CYAN}For permanent URL, setup named tunnel:${NC}"
        echo "      ./scripts/setup-cloudflare-tunnel.sh"
        echo ""
        nohup cloudflared tunnel --url http://localhost:4000 > "$LOGS_DIR/tunnel.log" 2>&1 &
        TUNNEL_PID=$!
        echo "   Tunnel PID: $TUNNEL_PID"
    fi
    
    # Wait a bit for tunnel to establish
    echo -e "   ${CYAN}Waiting for tunnel to establish...${NC}"
    sleep 5
    
    # Save known tunnel URL
    echo "https://pswback.tailoredcaresolutions.com" > "$HOME/.cloudflared/tunnel_url.txt"
    TUNNEL_URL="https://pswback.tailoredcaresolutions.com"
    
    # Try to extract URL from logs (for quick tunnels)
    if [ -f "$LOGS_DIR/tunnel.log" ]; then
        QUICK_TUNNEL_URL=$(grep -i "https://.*trycloudflare.com" "$LOGS_DIR/tunnel.log" | head -1 | grep -o 'https://[^ ]*' | head -1)
        if [ -n "$QUICK_TUNNEL_URL" ]; then
            echo "$QUICK_TUNNEL_URL" > "$HOME/.cloudflared/tunnel_url.txt"
            TUNNEL_URL=$QUICK_TUNNEL_URL
        fi
    fi
    
    # Test tunnel
    if wait_for_service "$TUNNEL_URL/health" "Tunnel" 15; then
        echo -e "   ${GREEN}✅ Tunnel is reachable!${NC}"
        echo "   Tunnel URL: $TUNNEL_URL"
    else
        echo -e "   ${YELLOW}⚠️  Tunnel started but may need more time to be reachable${NC}"
        echo "   URL: $TUNNEL_URL"
        echo "   Check logs: tail -f $LOGS_DIR/tunnel.log"
    fi
    
    TUNNEL_RUNNING=true
fi

# ============================================================================
# STEP 3: Save PIDs and Final Status
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Services Started - Final Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Save PIDs for later reference
cat > "$PID_FILE" << EOF
BACKEND_PID=$BACKEND_PID
TUNNEL_PID=$TUNNEL_PID
TUNNEL_URL=$TUNNEL_URL
Started at: $(date)
EOF

# Test backend
echo -e "${CYAN}Testing services...${NC}"
if curl -s -f http://localhost:4000/health > /dev/null 2>&1; then
    BACKEND_STATUS=$(curl -s http://localhost:4000/health | head -1)
    echo -e "${GREEN}✅ Backend Server: RUNNING${NC}"
    echo "   $BACKEND_STATUS"
else
    echo -e "${RED}❌ Backend Server: NOT RESPONDING${NC}"
fi

echo ""

# Test tunnel
if [ -n "$TUNNEL_URL" ]; then
    if curl -s -f "$TUNNEL_URL/health" > /dev/null 2>&1; then
        TUNNEL_STATUS=$(curl -s "$TUNNEL_URL/health" | head -1)
        echo -e "${GREEN}✅ Cloudflare Tunnel: RUNNING${NC}"
        echo "   URL: $TUNNEL_URL"
        echo "   $TUNNEL_STATUS"
    else
        echo -e "${YELLOW}⚠️  Cloudflare Tunnel: STARTED (may need more time)${NC}"
        echo "   URL: $TUNNEL_URL"
        echo "   Give it 10-30 seconds to fully establish"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${CYAN}1. Update Vercel Environment Variable:${NC}"
echo "   → Vercel Dashboard → Settings → Environment Variables"
echo "   → Set: NEXT_PUBLIC_BACKEND_URL = $TUNNEL_URL"
echo "   → Redeploy your app"
echo ""
echo -e "${CYAN}2. Update Backend CORS (if needed):${NC}"
echo "   → Edit: backend/.env"
echo "   → Add your Vercel URL to ALLOWED_ORIGINS"
echo "   → Restart: ./scripts/stop-all-services.sh && ./scripts/start-everything.sh"
echo ""
echo -e "${CYAN}3. Monitor Logs:${NC}"
echo "   → Backend: tail -f $LOGS_DIR/backend.log"
echo "   → Tunnel: tail -f $LOGS_DIR/tunnel.log"
echo ""
echo -e "${CYAN}4. Stop Services:${NC}"
echo "   → ./scripts/stop-all-services.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✨ All services started! Check logs directory for output.${NC}"
echo ""

