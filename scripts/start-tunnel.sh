#!/bin/bash
#
# Start Cloudflare Tunnel
# Usage: ./scripts/start-tunnel.sh
#

set -e

echo "🌐 Starting Cloudflare Tunnel..."
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ Error: cloudflared not found"
    echo "📦 Install with: brew install cloudflare/cloudflare/cloudflared"
    exit 1
fi

# Check if backend is running
if ! lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Warning: Backend is not running on port 4000"
    echo "   Start it first: ./scripts/start-backend.sh"
    echo ""
    echo "Continuing anyway (tunnel will forward to non-existent server)..."
    sleep 2
fi

# Check if named tunnel exists
if [ -f ~/.cloudflared/config.yml ]; then
    echo "✅ Found named tunnel configuration"
    echo "   Using: ~/.cloudflared/config.yml"
    echo ""

    # Extract tunnel name from config
    TUNNEL_NAME=$(grep "^tunnel:" ~/.cloudflared/config.yml | awk '{print $2}')

    if [ -n "$TUNNEL_NAME" ]; then
        echo "🔗 Starting tunnel: $TUNNEL_NAME"
        echo ""
        cloudflared tunnel run "$TUNNEL_NAME"
    else
        echo "❌ Error: Could not parse tunnel name from config"
        exit 1
    fi
else
    echo "📝 No named tunnel configured. Starting quick tunnel..."
    echo ""
    echo "⚠️  Note: Quick tunnel URL changes on every restart"
    echo "   For permanent URL, setup named tunnel:"
    echo "   See docs/CLOUDFLARE_TUNNEL_SETUP.md"
    echo ""

    cloudflared tunnel --url http://localhost:4000
fi
