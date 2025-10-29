# 🚀 PRODUCTION DIRECTORY SETUP & GUARDRAILS
## Clean Production Environment - /Volumes/AI/psw-reporting-production/

**Created:** January 24, 2025  
**Purpose:** Establish clean production environment free from development artifacts  
**Status:** 🔴 NOT YET CREATED - READY TO EXECUTE

---

## 📍 CRITICAL DIRECTORY INFORMATION

### Production Directory
```
/Volumes/AI/psw-reporting-production/
```

### Current Development Directory (TO BE ARCHIVED)
```
/Volumes/AI/Psw reporting conversational/
```

---

## 🎯 OBJECTIVES

1. **Clean Slate:** New directory free from duplicate files and development artifacts
2. **Production Only:** Only essential files for production deployment
3. **No Conflicts:** Eliminate lingering files that may affect loading
4. **Organized Structure:** Proper file organization from the start
5. **Version Control:** Clear separation between dev and production

---

## 📋 PRODUCTION DIRECTORY STRUCTURE

```
/Volumes/AI/psw-reporting-production/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── process-conversation-ai/
│   │   ├── generate-ai-report/
│   │   ├── text-to-speech/
│   │   ├── translate-report/
│   │   └── health/
│   ├── reports/
│   ├── settings/
│   ├── profile/
│   ├── analytics/
│   ├── admin/
│   ├── search/
│   ├── demo-dar/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/                   # React components
│   ├── PSWVoiceReporter.js      # Main component (with gold orb)
│   ├── Navigation.tsx
│   ├── DARCard.tsx
│   └── ui/
├── lib/                          # Utility libraries
│   ├── hooks/
│   ├── mocks/
│   ├── database/
│   └── security/
├── public/                       # Static assets
│   ├── favicon.ico
│   ├── manifest.json
│   └── icons/
├── docs/                         # Documentation
│   ├── PRODUCTION_DIRECTORY_SETUP.md
│   ├── ISSUES_FOUND_AND_SOLUTIONS.md
│   ├── FINAL_COMPREHENSIVE_TEST_RESULTS.md
│   └── LOCAL_AI_MODELS_SETUP.md
├── package.json                  # Dependencies
├── package-lock.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── .env.local                    # Environment variables
├── .gitignore
└── README.md
```

---

## 🛡️ GUARDRAILS - MANDATORY CHECKPOINTS

### ⚠️ CRITICAL: READ BEFORE EVERY PHASE

**These guardrails MUST be checked at every half-point of development:**

### Checkpoint 1: Before Starting Any Work
```
□ Am I working in /Volumes/AI/psw-reporting-production/?
□ Have I verified the current directory with pwd?
□ Are there any duplicate files that need removal?
□ Is the .env.local file properly configured?
□ Is Ollama pointing to /Volumes/AI/ollama?
```

### Checkpoint 2: Mid-Phase (50% Complete)
```
□ Am I still in /Volumes/AI/psw-reporting-production/?
□ Have I created any files in the wrong directory?
□ Are all imports pointing to correct paths?
□ Have I tested the changes in the production directory?
□ Are there any console errors or warnings?
```

### Checkpoint 3: Before Completing Phase
```
□ Final directory verification: /Volumes/AI/psw-reporting-production/
□ All files in correct locations?
□ No duplicate files present?
□ All tests passing?
□ Documentation updated?
□ Ready to proceed to next phase?
```

### Checkpoint 4: Before Any File Operation
```
□ Verify current directory: pwd
□ Confirm target path includes /Volumes/AI/psw-reporting-production/
□ Check for existing file conflicts
□ Backup if modifying existing files
```

---

## 🔄 MIGRATION PROCESS

### Phase 1: Create Production Directory
```bash
#!/bin/bash
# create_production_directory.sh

echo "🚀 Creating Production Directory..."

# Create main directory
mkdir -p /Volumes/AI/psw-reporting-production

# Navigate to production directory
cd /Volumes/AI/psw-reporting-production

# Verify location
pwd
# Expected output: /Volumes/AI/psw-reporting-production

echo "✅ Production directory created"
```

### Phase 2: Copy Essential Files Only
```bash
#!/bin/bash
# copy_production_files.sh

echo "📦 Copying production files..."

SOURCE="/Volumes/AI/Psw reporting conversational"
DEST="/Volumes/AI/psw-reporting-production"

# Copy package files
cp "$SOURCE/package.json" "$DEST/"
cp "$SOURCE/package-lock.json" "$DEST/"
cp "$SOURCE/next.config.js" "$DEST/"
cp "$SOURCE/tsconfig.json" "$DEST/"
cp "$SOURCE/tailwind.config.ts" "$DEST/"
cp "$SOURCE/postcss.config.js" "$DEST/"

# Copy app directory (excluding .next and node_modules)
rsync -av --exclude='.next' --exclude='node_modules' "$SOURCE/app/" "$DEST/app/"

# Copy components (with gold orb updates)
rsync -av "$SOURCE/components/" "$DEST/components/"

# Copy lib directory
rsync -av "$SOURCE/lib/" "$DEST/lib/"

# Copy public directory
rsync -av "$SOURCE/public/" "$DEST/public/"

# Copy documentation
mkdir -p "$DEST/docs"
cp "$SOURCE/PRODUCTION_DIRECTORY_SETUP.md" "$DEST/docs/"
cp "$SOURCE/ISSUES_FOUND_AND_SOLUTIONS.md" "$DEST/docs/"
cp "$SOURCE/FINAL_COMPREHENSIVE_TEST_RESULTS.md" "$DEST/docs/"
cp "$SOURCE/docs/LOCAL_AI_MODELS_SETUP.md" "$DEST/docs/"

# Copy environment file (will need to be configured)
cp "$SOURCE/.env.local" "$DEST/.env.local"

# Copy .gitignore
cp "$SOURCE/.gitignore" "$DEST/"

echo "✅ Files copied to production directory"
```

### Phase 3: Install Dependencies (Clean)
```bash
#!/bin/bash
# install_production_dependencies.sh

echo "📥 Installing production dependencies..."

cd /Volumes/AI/psw-reporting-production

# Verify location
pwd

# Remove any existing node_modules and lock files
rm -rf node_modules
rm -f package-lock.json

# Fresh install
npm install

# Fix better-sqlite3 bindings
npm install better-sqlite3 --build-from-source

# Verify installation
node -e "console.log('✅ Node.js working')"

echo "✅ Dependencies installed"
```

### Phase 4: Configure Environment
```bash
#!/bin/bash
# configure_production_environment.sh

echo "⚙️ Configuring production environment..."

cd /Volumes/AI/psw-reporting-production

# Update .env.local
cat > .env.local << 'EOF'
# Production Environment Configuration
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_USE_MOCK_DATA=false

# Ollama Configuration
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama3.3:70b
OLLAMA_MODELS_PATH=/Volumes/AI/ollama

# Application Settings
NEXT_PUBLIC_APP_NAME=PSW Voice Documentation System
NEXT_PUBLIC_APP_VERSION=1.0.0

# Security (CHANGE IN PRODUCTION)
DATABASE_ENCRYPTION_KEY=CHANGE_THIS_IN_PRODUCTION_USE_STRONG_KEY

# Feature Flags
ENABLE_TTS=true
ENABLE_TRANSLATION=true
ENABLE_VOICE_INPUT=true
EOF

echo "✅ Environment configured"
```

### Phase 5: Verify Production Setup
```bash
#!/bin/bash
# verify_production_setup.sh

echo "🧪 Verifying production setup..."

cd /Volumes/AI/psw-reporting-production

# Verify directory
echo "📍 Current directory:"
pwd

# Check essential files
echo "📄 Checking essential files..."
files=(
    "package.json"
    "next.config.js"
    "app/page.tsx"
    "components/PSWVoiceReporter.js"
    ".env.local"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file MISSING"
    fi
done

# Check directory structure
echo "📁 Checking directory structure..."
dirs=(
    "app"
    "components"
    "lib"
    "public"
    "docs"
)

for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✅ $dir/"
    else
        echo "  ❌ $dir/ MISSING"
    fi
done

# Check for duplicate files
echo "🔍 Checking for duplicates..."
find . -type f -name "*.js" -o -name "*.tsx" | sort | uniq -d

echo "✅ Verification complete"
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Pre-Migration
- [ ] Backup current development directory
- [ ] Document current working state
- [ ] Stop all running services (Next.js, Ollama)
- [ ] Export any important data

### Migration Steps
- [ ] Run create_production_directory.sh
- [ ] Run copy_production_files.sh
- [ ] Run install_production_dependencies.sh
- [ ] Run configure_production_environment.sh
- [ ] Run verify_production_setup.sh

### Post-Migration
- [ ] Start Ollama (verify models at /Volumes/AI/ollama)
- [ ] Start Next.js in production directory
- [ ] Run comprehensive tests
- [ ] Verify all pages load
- [ ] Test API endpoints
- [ ] Confirm gold orb displays correctly

---

## 🚨 CRITICAL REMINDERS

### ALWAYS CHECK BEFORE ANY OPERATION:
```bash
# Run this command EVERY TIME before making changes
pwd
# Expected output: /Volumes/AI/psw-reporting-production
```

### IF YOU'RE IN THE WRONG DIRECTORY:
```bash
# Navigate to production directory
cd /Volumes/AI/psw-reporting-production

# Verify
pwd
```

### NEVER WORK IN:
- ❌ /Volumes/AI/Psw reporting conversational/ (old dev directory)
- ❌ Any other directory
- ✅ ONLY: /Volumes/AI/psw-reporting-production/

---

## 📊 DIRECTORY COMPARISON

### Old Development Directory (ARCHIVE ONLY)
```
/Volumes/AI/Psw reporting conversational/
├── .next/                    # Build artifacts (EXCLUDE)
├── node_modules/             # Dependencies (REINSTALL FRESH)
├── Duplicate files           # May cause conflicts (EXCLUDE)
├── Test files                # Development only (EXCLUDE)
└── Old versions              # Outdated code (EXCLUDE)
```

### New Production Directory (CLEAN)
```
/Volumes/AI/psw-reporting-production/
├── app/                      # ✅ Clean app code
├── components/               # ✅ Updated components (gold orb)
├── lib/                      # ✅ Essential utilities
├── public/                   # ✅ Static assets
├── docs/                     # ✅ Documentation
├── package.json              # ✅ Fresh dependencies
└── .env.local                # ✅ Production config
```

---

## 🔐 SECURITY NOTES

### Files to Update in Production:
1. **.env.local** - Change DATABASE_ENCRYPTION_KEY
2. **package.json** - Verify all dependencies
3. **.gitignore** - Ensure sensitive files excluded

### Files to NEVER Commit:
- .env.local
- node_modules/
- .next/
- data/*.db
- *.log

---

## 📝 PHASE DEVELOPMENT GUARDRAILS

### Before Starting ANY Phase:
```
1. pwd → Verify: /Volumes/AI/psw-reporting-production/
2. Check for duplicate files
3. Review phase objectives
4. Confirm Ollama is running
5. Verify environment variables
```

### At 50% of ANY Phase:
```
1. pwd → Verify: /Volumes/AI/psw-reporting-production/
2. Test current changes
3. Check console for errors
4. Verify no files created in wrong location
5. Review remaining tasks
```

### Before Completing ANY Phase:
```
1. pwd → Verify: /Volumes/AI/psw-reporting-production/
2. Run all tests
3. Verify all files in correct locations
4. Update documentation
5. Commit changes (if using git)
6. Prepare for next phase
```

---

## 🎯 SUCCESS CRITERIA

### Production Directory is Ready When:
- ✅ All files in /Volumes/AI/psw-reporting-production/
- ✅ No duplicate files present
- ✅ Dependencies installed fresh
- ✅ Environment configured correctly
- ✅ All tests passing
- ✅ Gold orb displaying correctly
- ✅ Local AI integration working
- ✅ All 7 pages loading
- ✅ No console errors
- ✅ Documentation complete

---

## 🚀 NEXT STEPS

1. **Review this document** thoroughly
2. **Execute migration scripts** in order
3. **Verify production setup** with tests
4. **Begin Phase 2** (Database fix) in production directory
5. **Always check** pwd before any operation

---

## ⚠️ EMERGENCY ROLLBACK

If something goes wrong:
```bash
# Stop services
lsof -ti:3000 | xargs kill -9

# Return to old directory
cd /Volumes/AI/Psw\ reporting\ conversational

# Restart services
npm run dev
```

---

**REMEMBER:** 
🎯 **ALWAYS WORK IN: /Volumes/AI/psw-reporting-production/**  
🚫 **NEVER WORK IN: /Volumes/AI/Psw reporting conversational/**

**Status:** 🔴 READY TO EXECUTE  
**Next Action:** Run migration scripts to create production directory
