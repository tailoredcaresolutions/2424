#!/bin/bash

# PSW Voice Documentation System - Screenshot Capture Script
# Saves all screenshots to: ./screenshots/

echo "🚀 Starting screenshot capture for PSW Voice Documentation System..."

# Create screenshots directory
SCREENSHOT_DIR="./screenshots"
mkdir -p "$SCREENSHOT_DIR"

echo "📁 Screenshots will be saved to: $SCREENSHOT_DIR"

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Error: Server is not running at http://localhost:3000"
    echo "Please start the server with: npm run dev"
    exit 1
fi

# Array of pages to capture
declare -a pages=(
    "/:home"
    "/reports:reports"
    "/settings:settings"
    "/profile:profile"
    "/analytics:analytics"
    "/search:search"
    "/demo-dar:demo-dar"
    "/admin:admin-dashboard"
    "/admin/users:admin-users"
    "/admin/monitoring:admin-monitoring"
    "/admin/audit-logs:admin-audit-logs"
    "/admin/backups:admin-backups"
)

# Capture screenshots using Playwright
echo "📸 Capturing screenshots..."

for page in "${pages[@]}"; do
    IFS=':' read -r url filename <<< "$page"
    echo "  Capturing: $url -> ${filename}.png"
    
    npx playwright screenshot \
        "http://localhost:3000${url}" \
        "${SCREENSHOT_DIR}/${filename}.png" \
        --viewport-size=1920,1080 \
        --wait-for-timeout=2000
done

echo ""
echo "✅ Screenshot capture complete!"
echo "📁 Screenshots saved to: $SCREENSHOT_DIR"
echo ""
echo "📋 Files created:"
ls -lh "$SCREENSHOT_DIR"/*.png

echo ""
echo "🎉 All done! You can now use these screenshots for:"
echo "   - Presentations"
echo "   - Documentation"
echo "   - Onboarding materials"
echo "   - Training guides"
