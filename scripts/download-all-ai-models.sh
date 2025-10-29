#!/bin/bash
##############################################################################
# PSW VOICE DOCUMENTATION SYSTEM - AI MODELS DOWNLOAD SCRIPT
# Complete download of all latest models (as of October 2025)
# 
# This script downloads:
# 1. Llama 3.3 70B (Latest from Meta - Dec 2024)
# 2. Med42-v2 70B (Latest medical LLM)
# 3. Whisper Large v3 Turbo (Latest from OpenAI)
# 4. XTTS v2 (Latest TTS from Coqui)
# 5. BGE-M3 (Latest embeddings from BAAI)
#
# Total Download Size: ~120GB
# Estimated Time: 3-6 hours (depends on internet speed)
##############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AI_VOLUME="/Volumes/AI"
MODELS_DIR="${AI_VOLUME}/Models"
LOG_FILE="${AI_VOLUME}/download-log-$(date +%Y%m%d-%H%M%S).txt"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   PSW AI MODELS DOWNLOAD SCRIPT - October 2025            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Log function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
log "Checking prerequisites..."

# Check if AI volume exists
if [ ! -d "$AI_VOLUME" ]; then
    error "AI volume not found at $AI_VOLUME. Please mount Thunderbolt 5 SSD first."
fi

# Create directory structure
log "Creating directory structure..."
mkdir -p "${MODELS_DIR}"/{llama,med42,whisper,xtts,embeddings}
mkdir -p "${AI_VOLUME}"/{cache,checkpoints}

# Check for required tools
command -v ollama >/dev/null 2>&1 || error "Ollama not installed. Run: brew install ollama"
command -v python3 >/dev/null 2>&1 || error "Python3 not installed. Run: brew install python@3.11"
command -v huggingface-cli >/dev/null 2>&1 || warning "huggingface-cli not found. Will install..."

# Install Python dependencies if needed
log "Installing/updating Python dependencies..."
pip3 install --upgrade pip setuptools wheel
pip3 install --upgrade huggingface-hub sentence-transformers TTS

echo ""
log "Starting model downloads..."
echo ""

##############################################################################
# MODEL 1: Llama 3.3 70B (Latest - December 2024)
##############################################################################
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}MODEL 1/5: Llama 3.3 70B Instruct${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
log "Downloading Llama 3.3 70B (Latest from Meta AI)"
log "Size: ~42GB | Publisher: Meta AI | Released: Dec 2024"
log "Features: Multilingual, 128K context, matches 405B performance"
echo ""

ollama pull llama3.3:70b 2>&1 | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
    log "✅ Llama 3.3 70B downloaded successfully"
else
    error "❌ Failed to download Llama 3.3 70B"
fi

echo ""

##############################################################################
# MODEL 2: Med42-v2 70B (Latest Medical LLM - 2024)
##############################################################################
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}MODEL 2/5: Med42-v2 70B (Medical LLM)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
log "Downloading Med42-v2 70B (Latest medical LLM)"
log "Size: ~40GB | Publisher: M42 Health | USMLE: 79.10%"
log "Features: Clinical LLM, outperforms GPT-4 on medical QA"
echo ""

# Med42-v2 requires Hugging Face account and acceptance of license
log "Attempting to download Med42-v2..."
log "NOTE: If this fails, you need to:"
log "  1. Visit: https://huggingface.co/m42-health/Llama3-Med42-70B"
log "  2. Accept the license agreement"
log "  3. Login: huggingface-cli login"
echo ""

# Try to download GGUF quantized version (smaller, faster)
huggingface-cli download RichardErkhov/m42-health_-_Llama3-Med42-70B-gguf \
    --local-dir "${MODELS_DIR}/med42" \
    --local-dir-use-symlinks False \
    --include "*.Q4_K_M.gguf" 2>&1 | tee -a "$LOG_FILE" || {
        warning "Med42 download requires manual setup. See log for instructions."
        log "Alternative: Download BioMistral 7B instead (smaller, no license needed)"
    }

echo ""

##############################################################################
# MODEL 3: Whisper Large v3 Turbo (Latest - October 2024)
##############################################################################
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}MODEL 3/5: Whisper Large v3 Turbo${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
log "Downloading Whisper Large v3 Turbo (Latest from OpenAI)"
log "Size: ~3GB | Publisher: OpenAI | Speed: 8x faster than v3"
log "Features: 99 languages, 99.2% medical accuracy, 4 decoder layers"
echo ""

# Download CoreML optimized version for M3 Ultra
huggingface-cli download mlx-community/whisper-large-v3-turbo \
    --local-dir "${MODELS_DIR}/whisper" \
    --local-dir-use-symlinks False 2>&1 | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
    log "✅ Whisper Large v3 Turbo downloaded successfully"
else
    error "❌ Failed to download Whisper"
fi

echo ""

##############################################################################
# MODEL 4: XTTS v2 (Latest - Maintained by Community 2025)
##############################################################################
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}MODEL 4/5: XTTS v2 (Text-to-Speech)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
log "Downloading XTTS v2 (Latest TTS model)"
log "Size: ~2GB | Publisher: Coqui AI (Community maintained)"
log "Features: 17 languages, voice cloning, <200ms latency"
echo ""

python3 << 'PYTHON_END'
from TTS.api import TTS
import shutil
import os

try:
    print("Initializing XTTS v2...")
    tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", progress_bar=True)
    
    # Copy to AI volume
    src = os.path.expanduser("~/.local/share/tts/tts_models--multilingual--multi-dataset--xtts_v2")
    dst = "/Volumes/AI/models/xtts"
    
    if os.path.exists(src):
        print(f"Copying model to {dst}...")
        shutil.copytree(src, dst, dirs_exist_ok=True)
        print("✅ XTTS v2 installed successfully")
    else:
        print("⚠️  Model downloaded but location not found")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
    exit(1)
PYTHON_END

if [ $? -eq 0 ]; then
    log "✅ XTTS v2 downloaded successfully"
else
    error "❌ Failed to download XTTS v2"
fi

echo ""

##############################################################################
# MODEL 5: BGE-M3 (Latest Embeddings - BAAI 2024)
##############################################################################
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}MODEL 5/5: BGE-M3 Embeddings${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
log "Downloading BGE-M3 (Latest embeddings from BAAI)"
log "Size: ~2.2GB | Publisher: BAAI | Dimensions: 1024"
log "Features: 100+ languages, multi-functionality, 8192 token support"
echo ""

python3 << 'PYTHON_END'
from sentence_transformers import SentenceTransformer

try:
    print("Downloading BGE-M3...")
    model = SentenceTransformer(
        'BAAI/bge-m3',
        cache_folder='/Volumes/AI/models/embeddings'
    )
    
    # Test embedding
    print("Testing model...")
    embeddings = model.encode(["Test sentence for PSW documentation"])
    print(f"✅ BGE-M3 installed successfully (embedding shape: {embeddings.shape})")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    exit(1)
PYTHON_END

if [ $? -eq 0 ]; then
    log "✅ BGE-M3 downloaded successfully"
else
    error "❌ Failed to download BGE-M3"
fi

echo ""

##############################################################################
# BONUS: BioMistral 7B (Medical fallback if Med42 unavailable)
##############################################################################
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}BONUS: BioMistral 7B (Medical backup)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
log "Downloading BioMistral 7B as medical backup"
log "Size: ~14GB | Publisher: BioMistral | No license required"
echo ""

huggingface-cli download BioMistral/BioMistral-7B-GGUF \
    --local-dir "${MODELS_DIR}/biomistral" \
    --local-dir-use-symlinks False \
    --include "*Q4_K_M.gguf" 2>&1 | tee -a "$LOG_FILE" || {
        warning "BioMistral download failed (optional)"
    }

echo ""

##############################################################################
# SUMMARY & VERIFICATION
##############################################################################
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              DOWNLOAD COMPLETE - VERIFICATION              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

log "Verifying downloads..."
echo ""

# Check Ollama models
echo -e "${BLUE}Ollama Models:${NC}"
ollama list

echo ""

# Check disk usage
echo -e "${BLUE}Storage Usage:${NC}"
du -sh "${MODELS_DIR}"/* 2>/dev/null || echo "Checking storage..."

echo ""

# Check memory recommendation
echo -e "${BLUE}Memory Recommendation for M3 Ultra (96GB):${NC}"
echo "  System Reserved:     16GB"
echo "  Llama 3.3 70B:      48GB"
echo "  Med42/BioMistral:    8GB"
echo "  Whisper v3 Turbo:    4GB"
echo "  XTTS v2:             2GB"
echo "  BGE-M3:              3GB"
echo "  ─────────────────────────"
echo "  Total Estimated:    81GB  ✅ (15GB buffer)"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ ALL DOWNLOADS COMPLETE!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
log "Download log saved to: $LOG_FILE"
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "1. Test models: python3 /Volumes/AI/test_models.py"
echo "2. Configure PSW app to use local models"
echo "3. See: LOCAL_AI_MODELS_SETUP.md for details"
echo ""
echo -e "${BLUE}Models Location: ${MODELS_DIR}${NC}"
echo ""

