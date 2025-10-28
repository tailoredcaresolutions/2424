#!/bin/bash
#
# Automated Cloudflare Tunnel Setup
# This script automates the entire tunnel configuration process
#

set -e

echo "🌐 Cloudflare Tunnel - Automated Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
TUNNEL_NAME="psw-backend"
CONFIG_DIR="$HOME/.cloudflared"
CONFIG_FILE="$CONFIG_DIR/config.yml"

# Step 1: Check if cloudflared is installed
echo "1️⃣  Checking cloudflared installation..."
if ! command -v cloudflared &> /dev/null; then
    echo -e "${YELLOW}cloudflared not found. Installing...${NC}"

    if command -v brew &> /dev/null; then
        brew install cloudflare/cloudflare/cloudflared
        echo -e "${GREEN}✅ cloudflared installed${NC}"
    else
        echo -e "${RED}❌ Homebrew not found. Please install Homebrew first:${NC}"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
else
    echo -e "${GREEN}✅ cloudflared already installed${NC}"
    cloudflared --version
fi

echo ""

# Step 2: Check backend is running
echo "2️⃣  Checking if backend server is running..."
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend running on port 4000${NC}"
else
    echo -e "${YELLOW}⚠️  Backend not running. Starting it now...${NC}"

    cd "$(dirname "$0")/../backend"

    if [ ! -d node_modules ]; then
        echo "   Installing backend dependencies..."
        npm install
    fi

    if [ ! -f .env ]; then
        echo -e "${RED}❌ backend/.env not found!${NC}"
        echo "   Copy .env.example to .env and configure it:"
        echo "   cd backend && cp .env.example .env && nano .env"
        exit 1
    fi

    echo "   Starting backend..."
    npm start > /tmp/psw-backend.log 2>&1 &
    sleep 5

    if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend started${NC}"
    else
        echo -e "${RED}❌ Failed to start backend. Check /tmp/psw-backend.log${NC}"
        exit 1
    fi
fi

echo ""

# Step 3: Choose tunnel type
echo "3️⃣  Choose tunnel type:"
echo "   1) Quick Tunnel (temporary URL, no login required)"
echo "   2) Named Tunnel (permanent URL, requires Cloudflare account)"
echo ""
read -p "Enter choice (1 or 2): " TUNNEL_CHOICE

echo ""

if [ "$TUNNEL_CHOICE" = "1" ]; then
    # Quick Tunnel
    echo "🚀 Starting Quick Tunnel..."
    echo ""
    echo -e "${YELLOW}⚠️  Note: Quick tunnel URL changes every restart${NC}"
    echo -e "${YELLOW}   For permanent URL, choose option 2 next time${NC}"
    echo ""
    echo "Starting tunnel (press Ctrl+C to stop)..."
    echo ""

    cloudflared tunnel --url http://localhost:4000

elif [ "$TUNNEL_CHOICE" = "2" ]; then
    # Named Tunnel
    echo "🔐 Setting up Named Tunnel..."
    echo ""

    # Step 3a: Login
    echo "Step 3a: Cloudflare Login"
    echo "   This will open your browser to login to Cloudflare"
    read -p "   Press Enter to continue..."

    cloudflared tunnel login

    if [ ! -f "$HOME/.cloudflared/cert.pem" ]; then
        echo -e "${RED}❌ Login failed. Certificate not found.${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Logged in to Cloudflare${NC}"
    echo ""

    # Step 3b: Check if tunnel already exists
    echo "Step 3b: Creating tunnel..."

    if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
        echo -e "${YELLOW}⚠️  Tunnel '$TUNNEL_NAME' already exists${NC}"
        read -p "   Delete and recreate? (y/n): " RECREATE

        if [ "$RECREATE" = "y" ]; then
            echo "   Deleting existing tunnel..."
            TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
            cloudflared tunnel delete "$TUNNEL_ID"
            echo "   Creating new tunnel..."
            cloudflared tunnel create "$TUNNEL_NAME"
        fi
    else
        cloudflared tunnel create "$TUNNEL_NAME"
    fi

    # Get tunnel ID and credentials file
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
    CREDS_FILE="$HOME/.cloudflared/$TUNNEL_ID.json"

    if [ ! -f "$CREDS_FILE" ]; then
        echo -e "${RED}❌ Credentials file not found: $CREDS_FILE${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Tunnel created: $TUNNEL_NAME (ID: $TUNNEL_ID)${NC}"
    echo ""

    # Step 3c: Create config file
    echo "Step 3c: Creating configuration..."

    mkdir -p "$CONFIG_DIR"

    cat > "$CONFIG_FILE" <<EOF
tunnel: $TUNNEL_NAME
credentials-file: $CREDS_FILE

ingress:
  # Route to local backend
  - service: http://localhost:4000
EOF

    echo -e "${GREEN}✅ Configuration created: $CONFIG_FILE${NC}"
    echo ""

    # Step 3d: Setup DNS (optional)
    echo "Step 3d: DNS Configuration (optional)"
    echo ""
    echo "   Do you want to set up a custom domain?"
    echo "   (If no, you'll use a .trycloudflare.com URL)"
    read -p "   Setup custom domain? (y/n): " SETUP_DNS

    if [ "$SETUP_DNS" = "y" ]; then
        echo ""
        read -p "   Enter your domain (e.g., psw.yourdomain.com): " CUSTOM_DOMAIN

        cloudflared tunnel route dns "$TUNNEL_NAME" "$CUSTOM_DOMAIN"

        echo -e "${GREEN}✅ DNS configured: $CUSTOM_DOMAIN${NC}"
        TUNNEL_URL="https://$CUSTOM_DOMAIN"
    else
        # Use trycloudflare.com subdomain
        SUBDOMAIN="$TUNNEL_NAME-$(echo $TUNNEL_ID | cut -c1-8)"
        cloudflared tunnel route dns "$TUNNEL_NAME" "$SUBDOMAIN.trycloudflare.com" || true
        TUNNEL_URL="https://$SUBDOMAIN.trycloudflare.com"

        echo -e "${GREEN}✅ Using Cloudflare domain: $TUNNEL_URL${NC}"
    fi

    echo ""
    echo "=========================================="
    echo -e "${GREEN}✅ Tunnel Setup Complete!${NC}"
    echo "=========================================="
    echo ""
    echo "📋 Configuration Summary:"
    echo "   Tunnel Name: $TUNNEL_NAME"
    echo "   Tunnel ID: $TUNNEL_ID"
    echo "   Config File: $CONFIG_FILE"
    echo "   Tunnel URL: $TUNNEL_URL"
    echo ""
    echo "🚀 To start your tunnel:"
    echo "   cloudflared tunnel run $TUNNEL_NAME"
    echo ""
    echo "   Or use the convenience script:"
    echo "   ./scripts/start-tunnel.sh"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Update backend/.env:"
    echo "      ALLOWED_ORIGINS=http://localhost:3000,$TUNNEL_URL"
    echo ""
    echo "   2. Update Vercel environment variables:"
    echo "      NEXT_PUBLIC_BACKEND_URL=$TUNNEL_URL"
    echo ""
    echo "   3. Test the tunnel:"
    echo "      curl $TUNNEL_URL/health"
    echo ""

    # Save tunnel URL to file for later reference
    echo "$TUNNEL_URL" > "$HOME/.cloudflared/tunnel_url.txt"

    # Ask if user wants to start tunnel now
    read -p "Start tunnel now? (y/n): " START_NOW

    if [ "$START_NOW" = "y" ]; then
        echo ""
        echo "🚀 Starting tunnel (press Ctrl+C to stop)..."
        echo ""
        cloudflared tunnel run "$TUNNEL_NAME"
    else
        echo ""
        echo "Tunnel configured but not started."
        echo "Start it later with: cloudflared tunnel run $TUNNEL_NAME"
    fi

else
    echo -e "${RED}Invalid choice. Please run again and choose 1 or 2.${NC}"
    exit 1
fi
