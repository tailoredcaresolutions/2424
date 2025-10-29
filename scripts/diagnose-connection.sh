#!/bin/bash
# Frontend-Backend Connection Diagnostic Script

echo "🔍 Diagnosing Frontend-Backend Communication..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Backend Server
echo "1️⃣  Checking Backend Server..."
if curl -s -f http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Backend is running on localhost:4000${NC}"
    curl -s http://localhost:4000/health | head -1
else
    echo -e "   ${RED}❌ Backend NOT running${NC}"
    echo "   Fix: cd backend && npm start"
fi

echo ""

# 2. Check Cloudflare Tunnel
echo "2️⃣  Checking Cloudflare Tunnel..."
if pgrep -f "cloudflared.*tunnel" > /dev/null || pgrep -f "cloudflared "../url" > /dev/null; then
    echo -e "   ${GREEN}✅ Cloudflare Tunnel process is running${NC}"
    
    # Try to find tunnel URL
    if [ -f "$HOME/.cloudflared/tunnel_url.txt" ]; then
        TUNNEL_URL=$(cat "$HOME/.cloudflared/tunnel_url.txt")
        echo "   Found tunnel URL: $TUNNEL_URL"
        
        # Test tunnel URL
        if curl -s -f "$TUNNEL_URL/health" > /dev/null 2>&1; then
            echo -e "   ${GREEN}✅ Tunnel URL is reachable${NC}"
        else
            echo -e "   ${YELLOW}⚠️  Tunnel URL exists but not reachable${NC}"
            echo "   URL: $TUNNEL_URL"
        fi
    fi
    
    # Check the known tunnel URL
    echo ""
    echo "   Testing known tunnel URL: pswback.tailoredcaresolutions.com"
    if curl -s -f "https://pswback.tailoredcaresolutions.com/health" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ pswback.tailoredcaresolutions.com is reachable${NC}"
        TUNNEL_URL="https://pswback.tailoredcaresolutions.com"
    else
        echo -e "   ${RED}❌ pswback.tailoredcaresolutions.com not reachable${NC}"
        echo "   This is your tunnel URL - check if tunnel is running"
    fi
else
    echo -e "   ${RED}❌ Cloudflare Tunnel NOT running${NC}"
    echo "   Fix: ./scripts/start-tunnel.sh"
fi

echo ""

# 3. Check Environment Variables
echo "3️⃣  Checking Environment Variables..."

# Check local .env.local
if [ -f ".env.local" ]; then
    echo -e "   ${GREEN}✅ .env.local exists${NC}"
    if grep -q "NEXT_PUBLIC_BACKEND_URL" .env.local; then
        BACKEND_URL=$(grep "NEXT_PUBLIC_BACKEND_URL" .env.local | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        echo "   NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL"
        
        # Test if URL is reachable (if it's not localhost)
        if [[ ! "$BACKEND_URL" =~ localhost ]]; then
            if curl -s -f "$BACKEND_URL/health" > /dev/null 2>&1; then
                echo -e "   ${GREEN}✅ Backend URL is reachable${NC}"
            else
                echo -e "   ${RED}❌ Backend URL NOT reachable${NC}"
                echo "   Check if tunnel is running and URL is correct"
            fi
        fi
    else
        echo -e "   ${YELLOW}⚠️  NEXT_PUBLIC_BACKEND_URL not set in .env.local${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  .env.local not found (OK for production)${NC}"
fi

# Check backend .env
if [ -f "backend/.env" ]; then
    echo -e "   ${GREEN}✅ backend/.env exists${NC}"
    if grep -q "ALLOWED_ORIGINS" backend/.env; then
        ORIGINS=$(grep "ALLOWED_ORIGINS" backend/.env | cut -d'=' -f2)
        echo "   ALLOWED_ORIGINS=$ORIGINS"
    else
        echo -e "   ${YELLOW}⚠️  ALLOWED_ORIGINS not set in backend/.env${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  backend/.env not found${NC}"
fi

echo ""

# 4. Check Backend Routes
echo "4️⃣  Checking Backend Routes..."
MISSING_ROUTES=0

if [ -f "backend/routes/whisper.js" ]; then
    echo -e "   ${GREEN}✅ whisper.js route exists${NC}"
else
    echo -e "   ${RED}❌ Missing: backend/routes/whisper.js${NC}"
    MISSING_ROUTES=1
fi

if [ -f "backend/routes/xtts.js" ]; then
    echo -e "   ${GREEN}✅ xtts.js route exists${NC}"
else
    echo -e "   ${RED}❌ Missing: backend/routes/xtts.js${NC}"
    MISSING_ROUTES=1
fi

if [ -f "backend/routes/ollama.js" ]; then
    echo -e "   ${GREEN}✅ ollama.js route exists${NC}"
else
    echo -e "   ${RED}❌ Missing: backend/routes/ollama.js${NC}"
    MISSING_ROUTES=1
fi

echo ""

# 5. Check Frontend API Routes
echo "5️⃣  Checking Frontend API Routes..."
if [ -f "app/api/transcribe-whisper/route.js" ]; then
    echo -e "   ${GREEN}✅ transcribe-whisper route exists${NC}"
else
    echo -e "   ${RED}❌ Missing: app/api/transcribe-whisper/route.js${NC}"
fi

if [ -f "app/api/synthesize-xtts/route.js" ]; then
    echo -e "   ${GREEN}✅ synthesize-xtts route exists${NC}"
else
    echo -e "   ${RED}❌ Missing: app/api/synthesize-xtts/route.js${NC}"
fi

echo ""

# 6. Test Connection Flow
echo "6️⃣  Testing Connection Flow..."

# Test backend health
if curl -s -f http://localhost:4000/health > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Backend health check: OK${NC}"
    
    # Test if backend has the expected routes
    echo "   Testing backend routes..."
    
    # Test /api/whisper/health (if it exists)
    if curl -s -f http://localhost:4000/api/whisper/health > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ /api/whisper/health: OK${NC}"
    else
        echo -e "   ${YELLOW}⚠️  /api/whisper/health: Not available${NC}"
    fi
    
    # Test /api/xtts/health (if it exists)
    if curl -s -f http://localhost:4000/api/xtts/health > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ /api/xtts/health: OK${NC}"
    else
        echo -e "   ${YELLOW}⚠️  /api/xtts/health: Not available${NC}"
    fi
else
    echo -e "   ${RED}❌ Backend health check: FAILED${NC}"
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Quick Fixes:"
echo ""
echo "1. Start Backend:"
echo "   cd backend && npm start"
echo ""
echo "2. Start Tunnel:"
echo "   ./scripts/start-tunnel.sh"
echo ""
echo "3. Update Environment Variables:"
echo "   - Set NEXT_PUBLIC_BACKEND_URL in Vercel (for production)"
echo "   - Set ALLOWED_ORIGINS in backend/.env"
echo ""
echo "4. For detailed troubleshooting, see:"
echo "   TROUBLESHOOTING_FRONTEND_BACKEND.md"
echo ""

