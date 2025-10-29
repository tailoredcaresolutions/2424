#!/bin/bash
#
# Update Tunnel URLs Across Configuration
# Run this after setting up your Cloudflare Tunnel
#

set -e

echo "🔧 Update Tunnel URLs in Configuration"
echo "======================================="
echo ""

# Check if tunnel URL file exists
TUNNEL_URL_FILE="$HOME/.cloudflared/tunnel_url.txt"

if [ -f "$TUNNEL_URL_FILE" ]; then
    TUNNEL_URL=$(cat "$TUNNEL_URL_FILE")
    echo "Found saved tunnel URL: $TUNNEL_URL"
else
    read -p "Enter your Cloudflare Tunnel URL: " TUNNEL_URL
fi

echo ""
echo "Updating configuration files..."
echo ""

# Update backend .env
BACKEND_ENV="backend/.env"
if [ -f "$BACKEND_ENV" ]; then
    echo "1️⃣  Updating backend/.env..."

    # Check if ALLOWED_ORIGINS exists
    if grep -q "ALLOWED_ORIGINS=" "$BACKEND_ENV"; then
        # Update existing line
        sed -i.bak "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app,$TUNNEL_URL|" "$BACKEND_ENV"
    else
        # Add new line
        echo "ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app,$TUNNEL_URL" >> "$BACKEND_ENV"
    fi

    echo "   ✅ Updated ALLOWED_ORIGINS"
else
    echo "   ⚠️  backend/.env not found - skipping"
fi

echo ""

# Update vercel.json redirects
VERCEL_JSON="vercel.json"
if [ -f "$VERCEL_JSON" ]; then
    echo "2️⃣  Updating vercel.json..."

    # Create temporary file with updated URL
    sed "s|https://your-tunnel-url.trycloudflare.com|$TUNNEL_URL|g" "$VERCEL_JSON" > "$VERCEL_JSON.tmp"
    mv "$VERCEL_JSON.tmp" "$VERCEL_JSON"

    echo "   ✅ Updated API redirects"
else
    echo "   ⚠️  vercel.json not found - skipping"
fi

echo ""

# Update README
README="README.md"
if [ -f "$README" ]; then
    echo "3️⃣  Updating README.md..."

    sed -i.bak "s|https://your-tunnel-url.trycloudflare.com|$TUNNEL_URL|g" "$README"
    sed -i.bak "s|https://random-name.trycloudflare.com|$TUNNEL_URL|g" "$README"

    echo "   ✅ Updated documentation"
fi

echo ""
echo "=========================================="
echo "✅ Configuration Updated!"
echo "=========================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Restart backend server:"
echo "   cd backend && npm start"
echo ""
echo "2. Update Vercel environment variables:"
echo "   Go to: https://vercel.com/your-project/settings/environment-variables"
echo "   Set: NEXT_PUBLIC_BACKEND_URL=$TUNNEL_URL"
echo ""
echo "3. Redeploy Vercel:"
echo "   git push (Vercel will auto-deploy)"
echo ""
echo "4. Test the connection:"
echo "   curl $TUNNEL_URL/health"
echo ""
