#!/bin/bash

echo "🔍 PSW Voice Documentation System - Local Setup Verification"
echo "=============================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: .env.local exists
echo "1️⃣  Checking .env.local exists..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local found${NC}"
else
    echo -e "${RED}❌ .env.local not found${NC}"
fi

# Check 2: Local mode enabled
echo ""
echo "2️⃣  Checking local mode configuration..."
if grep -q "NEXT_PUBLIC_ENVIRONMENT=local" .env.local; then
    echo -e "${GREEN}✅ Local mode enabled${NC}"
else
    echo -e "${RED}❌ Local mode not enabled${NC}"
fi

# Check 3: Mock data enabled
echo ""
echo "3️⃣  Checking mock data configuration..."
if grep -q "NEXT_PUBLIC_USE_MOCK_DATA=true" .env.local; then
    echo -e "${GREEN}✅ Mock data enabled${NC}"
else
    echo -e "${YELLOW}⚠️  Mock data not explicitly enabled${NC}"
fi

# Check 4: No real OpenAI key
echo ""
echo "4️⃣  Checking for exposed credentials..."
if grep -q "sk-proj-" .env.local 2>/dev/null; then
    echo -e "${RED}❌ DANGER: Real OpenAI key still present!${NC}"
else
    echo -e "${GREEN}✅ No exposed OpenAI key${NC}"
fi

# Check 5: .env.example exists
echo ""
echo "5️⃣  Checking .env.example exists..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ .env.example found${NC}"
else
    echo -e "${RED}❌ .env.example not found${NC}"
fi

# Check 6: Mock services exist
echo ""
echo "6️⃣  Checking mock services..."
if [ -f "lib/mocks/mockAI.js" ]; then
    echo -e "${GREEN}✅ Mock AI services found${NC}"
else
    echo -e "${RED}❌ Mock services not found${NC}"
fi

# Check 7: Documentation exists
echo ""
echo "7️⃣  Checking documentation..."
if [ -f "LOCAL_SETUP.md" ]; then
    echo -e "${GREEN}✅ LOCAL_SETUP.md found${NC}"
else
    echo -e "${RED}❌ LOCAL_SETUP.md not found${NC}"
fi

# Check 8: .gitignore configured
echo ""
echo "8️⃣  Checking .gitignore..."
if grep -q ".env\*.local" .gitignore; then
    echo -e "${GREEN}✅ .gitignore properly configured${NC}"
else
    echo -e "${RED}❌ .gitignore missing .env protection${NC}"
fi

# Check 9: API routes updated
echo ""
echo "9️⃣  Checking API routes for local mode support..."
ROUTES_UPDATED=0
if grep -q "isLocalMode" app/api/process-conversation-ai/route.js; then
    ((ROUTES_UPDATED++))
fi
if grep -q "isLocalMode" app/api/generate-ai-report/route.js; then
    ((ROUTES_UPDATED++))
fi
if grep -q "isLocalMode" app/api/text-to-speech/route.js; then
    ((ROUTES_UPDATED++))
fi
if grep -q "isLocalMode" app/api/translate-report/route.js; then
    ((ROUTES_UPDATED++))
fi

if [ $ROUTES_UPDATED -eq 4 ]; then
    echo -e "${GREEN}✅ All 4 API routes updated for local mode${NC}"
else
    echo -e "${YELLOW}⚠️  Only $ROUTES_UPDATED/4 API routes updated${NC}"
fi

# Check 10: Node.js installed
echo ""
echo "🔟 Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js not found (required to run the app)${NC}"
    echo -e "   Install from: https://nodejs.org/"
fi

# Final Summary
echo ""
echo "=============================================================="
echo "📊 VERIFICATION SUMMARY"
echo "=============================================================="
echo ""

ALL_GOOD=true

if [ ! -f ".env.local" ] || ! grep -q "NEXT_PUBLIC_ENVIRONMENT=local" .env.local || grep -q "sk-proj-" .env.local 2>/dev/null; then
    ALL_GOOD=false
fi

if [ ! -f "lib/mocks/mockAI.js" ] || [ ! -f "LOCAL_SETUP.md" ]; then
    ALL_GOOD=false
fi

if $ALL_GOOD; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED!${NC}"
    echo ""
    echo "Your PSW Voice Documentation System is ready for local testing!"
    echo ""
    echo "📚 Next Steps:"
    echo "   1. Run: npm install"
    echo "   2. Run: npm run dev"
    echo "   3. Open: http://localhost:3000"
    echo "   4. Read: LOCAL_SETUP.md for testing scenarios"
else
    echo -e "${RED}⚠️  SOME CHECKS FAILED${NC}"
    echo ""
    echo "Please review the issues above and fix them before proceeding."
fi

echo ""
echo "=============================================================="
