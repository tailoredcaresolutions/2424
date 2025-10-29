#!/bin/bash
# Secure Backend Startup Script
# Only runs on Mac Serial: QJ0CMFK6W2
# Hard Drive: /Volumes/AI

# Security Check 1: Verify Mac Serial Number
EXPECTED_SERIAL="QJ0CMFK6W2"
ACTUAL_SERIAL=$(ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformSerialNumber | awk '{print $3}' | tr -d '"')

if [ "$ACTUAL_SERIAL" != "$EXPECTED_SERIAL" ]; then
    echo "❌ SECURITY ERROR: Wrong machine! Expected $EXPECTED_SERIAL, got $ACTUAL_SERIAL"
    exit 1
fi

# Security Check 2: Verify Hard Drive Exists
if [ ! -d "/Volumes/AI" ]; then
    echo "❌ SECURITY ERROR: /Volumes/AI hard drive not mounted!"
    exit 1
fi

# Security Check 3: Verify Project Directory
PROJECT_DIR="/Volumes/AI/psw-reporting-production"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ SECURITY ERROR: Project directory not found on /Volumes/AI!"
    exit 1
fi

echo "✅ Security checks passed:"
echo "   - Mac Serial: $ACTUAL_SERIAL"
echo "   - Hard Drive: /Volumes/AI (mounted)"
echo "   - Project: $PROJECT_DIR"
echo ""
echo "🚀 Starting backend server on port 4000..."

cd "$PROJECT_DIR/backend" || exit 1
PORT=4000 npm run start
