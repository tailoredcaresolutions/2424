# > LOCAL AI MODELS SETUP GUIDE
## Complete Model Download & Configuration for PSW System

**Target Hardware**: Mac Studio M3 Ultra (96GB RAM) + Thunderbolt 5 SSD (/Volumes/AI)
**Date**: October 23, 2025
**Total Download Size**: ~70GB
**Total RAM Required**: ~65GB active, ~75GB peak

---

## =Ë TABLE OF CONTENTS

1. [Required Models Overview](#required-models-overview)
2. [Prerequisites & Tools](#prerequisites--tools)
3. [Model Downloads (Step-by-Step)](#model-downloads)
4. [Configuration & Testing](#configuration--testing)
5. [Memory Management](#memory-management)
6. [Troubleshooting](#troubleshooting)

---

## <¯ REQUIRED MODELS OVERVIEW

### Complete Model Stack

| Model | Purpose | Size | RAM Usage | Speed | Priority |
|-------|---------|------|-----------|-------|----------|
| **Llama 3.2 70B Q4_K_M** | Main conversational AI | 38GB | 42-48GB | 45-55 tok/s | CRITICAL |
| **BioMistral 7B FP16** | Medical entity extraction | 14GB | 8GB | 180+ tok/s | CRITICAL |
| **WhisperKit Large-v3-turbo** | Speech-to-text | 3.1GB | 4GB | 52x realtime | CRITICAL |
| **XTTS v2** | Text-to-speech | 1.8GB | 2GB | <200ms latency | REQUIRED |
| **BGE-M3** | Embeddings | 2.2GB | 3GB | 10k emb/s | REQUIRED |
| **Llama 3.2 34B Q6_K** | Alternative (lighter) | 24GB | 28GB | 70-80 tok/s | OPTIONAL |
| **PointLLM 13B** | Clinical notes | 8GB | 6GB | 120 tok/s | OPTIONAL |

**Total Storage**: ~70GB (critical models) + ~32GB (optional models)
**Total RAM**: ~65GB (all critical models loaded)

---

## =à PREREQUISITES & TOOLS

### 1. Install Homebrew (if not installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Python & Dependencies

```bash
# Install Python 3.11
brew install python@3.11

# Create virtual environment
python3.11 -m venv /Volumes/AI/venv
source /Volumes/AI/venv/bin/activate

# Upgrade pip
pip install --upgrade pip setuptools wheel
```

### 3. Install AI Tools

```bash
# Ollama - LLM runtime optimized for Apple Silicon
brew install ollama

# Hugging Face CLI - for model downloads
pip install huggingface-hub

# MLX - Apple's ML framework
pip install mlx mlx-lm

# WhisperKit - optimized Whisper for Apple Silicon
pip install whisperkit

# Coqui TTS - text-to-speech
pip install coqui-tts

# Sentence Transformers - for embeddings
pip install sentence-transformers

# llama.cpp - for GGUF models
brew install llama.cpp
```

### 4. Configure Environment

```bash
# Set AI volume path
export AI_MODELS_PATH="/Volumes/AI/models"
export AI_CACHE_PATH="/Volumes/AI/cache"

# Add to ~/.zshrc or ~/.bashrc for persistence
echo 'export AI_MODELS_PATH="/Volumes/AI/models"' >> ~/.zshrc
echo 'export AI_CACHE_PATH="/Volumes/AI/cache"' >> ~/.zshrc

# Create directory structure
mkdir -p /Volumes/AI/models/{llama,biomistral,whisper,xtts,embeddings}
mkdir -p /Volumes/AI/cache
mkdir -p /Volumes/AI/checkpoints
```

---

## =å MODEL DOWNLOADS

### MODEL 1: Llama 3.2 70B (Primary Conversational AI)

**Purpose**: Main AI for conversational documentation
**Size**: 38GB
**Download Time**: ~30-60 minutes (depending on internet)

#### Option A: Using Ollama (RECOMMENDED)

```bash
# Start Ollama service
ollama serve &

# Pull the quantized model
ollama pull llama3.2:70b-instruct-q4_K_M

# Verify installation
ollama list

# Test the model
ollama run llama3.2:70b-instruct-q4_K_M "Hello, test response"

# Model location
ls -lh ~/.ollama/models/
```

#### Option B: Direct Download (Advanced)

```bash
# Using Hugging Face CLI
huggingface-cli login  # Login with your HF token

# Download from Hugging Face
huggingface-cli download \
  meta-llama/Llama-3.2-70B-Instruct-GGUF \
  --local-dir /Volumes/AI/models/llama3.2-70b \
  --include "*Q4_K_M.gguf"

# Verify download
ls -lh /Volumes/AI/models/llama3.2-70b/
```

#### Configuration

```python
# Create config file: /Volumes/AI/models/llama3.2-70b/config.json
{
  "model_path": "/Volumes/AI/models/llama3.2-70b/llama-3.2-70b-instruct.Q4_K_M.gguf",
  "n_ctx": 128000,
  "n_batch": 512,
  "n_gpu_layers": 60,
  "use_mlock": true,
  "use_mmap": true,
  "temperature": 0.7,
  "top_p": 0.95,
  "repeat_penalty": 1.1
}
```

---

### MODEL 2: BioMistral 7B (Medical Entity Extraction)

**Purpose**: Extract medical entities, vital signs, medications
**Size**: 14GB
**Accuracy**: 86.5% on medical questions

#### Download

```bash
# Using Hugging Face
huggingface-cli download \
  BioMistral/BioMistral-7B-GGUF \
  --local-dir /Volumes/AI/models/biomistral \
  --include "*fp16.gguf"

# Alternative: MLX optimized version
python -m mlx_lm.convert \
  --hf-path BioMistral/BioMistral-7B \
  --mlx-path /Volumes/AI/models/biomistral-mlx
```

#### Test

```bash
# Test with llama.cpp
llama-cli \
  -m /Volumes/AI/models/biomistral/biomistral-7b.fp16.gguf \
  -p "Extract vital signs from: Blood pressure 120/80, pulse 72" \
  -n 128
```

---

### MODEL 3: WhisperKit Large-v3-turbo (Speech Recognition)

**Purpose**: Convert voice to text
**Size**: 3.1GB
**Performance**: 52x real-time (1 hour audio in ~1 minute)

#### Download

```bash
# Install WhisperKit
pip install whisperkit

# Download model with quantization
python3 << 'EOF'
from whisperkit import WhisperKit

# Download and setup
whisper = WhisperKit.download_model(
    model_name="large-v3-turbo",
    save_dir="/Volumes/AI/models/whisper",
    quantize="int8",
    optimize_for_device="m3"
)

print("WhisperKit installed successfully!")
EOF
```

#### Alternative: Using whisper.cpp

```bash
# Clone whisper.cpp
git clone https://github.com/ggerganov/whisper.cpp /Volumes/AI/whisper.cpp
cd /Volumes/AI/whisper.cpp

# Build with Metal support
make clean
WHISPER_COREML=1 make -j

# Download models
bash ./models/download-ggml-model.sh large-v3-turbo

# Move to AI volume
mv models/ggml-large-v3-turbo.bin /Volumes/AI/models/whisper/
```

#### Test

```bash
# Test transcription (record a test audio first)
python3 << 'EOF'
from whisperkit import WhisperKit

whisper = WhisperKit(
    model_path="/Volumes/AI/models/whisper",
    device="mps"
)

# Test with sample audio
result = whisper.transcribe("test_audio.wav")
print(result['text'])
EOF
```

---

### MODEL 4: XTTS v2 (Text-to-Speech)

**Purpose**: Generate voice responses
**Size**: 1.8GB
**Latency**: <200ms first token

#### Download

```bash
# Install Coqui TTS
pip install coqui-tts

# Download XTTS v2 model
python3 << 'EOF'
from TTS.api import TTS

# Initialize and download
tts = TTS(
    model_name="tts_models/multilingual/multi-dataset/xtts_v2",
    progress_bar=True
)

# Move to AI volume
import shutil
import os

src = os.path.expanduser("~/.local/share/tts/tts_models--multilingual--multi-dataset--xtts_v2")
dst = "/Volumes/AI/models/xtts"

if os.path.exists(src):
    shutil.copytree(src, dst, dirs_exist_ok=True)
    print(f"Model moved to {dst}")
EOF
```

#### Create Voice Samples

```bash
# Record 30-second voice sample for cloning
# Save as: /Volumes/AI/models/xtts/voice_samples/psw_voice_1.wav

# Test voice synthesis
python3 << 'EOF'
from TTS.api import TTS

tts = TTS(model_path="/Volumes/AI/models/xtts").to("mps")

# Generate speech
tts.tts_to_file(
    text="This is a test of the PSW documentation system.",
    file_path="/tmp/test_output.wav",
    speaker_wav="/Volumes/AI/models/xtts/voice_samples/psw_voice_1.wav",
    language="en"
)

print("Audio generated at /tmp/test_output.wav")
EOF
```

---

### MODEL 5: BGE-M3 (Embeddings)

**Purpose**: Vector embeddings for semantic search
**Size**: 2.2GB
**Performance**: 10,000 embeddings/second

#### Download

```bash
# Install sentence-transformers
pip install sentence-transformers faiss-cpu

# Download BGE-M3
python3 << 'EOF'
from sentence_transformers import SentenceTransformer

# Download and save to AI volume
model = SentenceTransformer(
    'BAAI/bge-m3',
    cache_folder='/Volumes/AI/models/embeddings'
)

# Test
embeddings = model.encode(["This is a test sentence"])
print(f"Embedding shape: {embeddings.shape}")
print("BGE-M3 installed successfully!")
EOF
```

---

### MODEL 6 (OPTIONAL): Llama 3.2 34B (Lighter Alternative)

**Purpose**: Faster alternative when 70B is too heavy
**Size**: 24GB
**Use When**: High load or memory constraints

#### Download

```bash
# Using Ollama
ollama pull llama3.2:34b-instruct-q6_K

# Or direct download
huggingface-cli download \
  meta-llama/Llama-3.2-34B-Instruct-GGUF \
  --local-dir /Volumes/AI/models/llama3.2-34b \
  --include "*Q6_K.gguf"
```

---

### MODEL 7 (OPTIONAL): PointLLM 13B (Clinical Notes)

**Purpose**: Specialized for clinical documentation
**Size**: 8GB

#### Download

```bash
huggingface-cli download \
  OpenGVLab/PointLLM-13B-Medical \
  --local-dir /Volumes/AI/models/pointllm \
  --include "*.gguf"
```

---

## ™ CONFIGURATION & TESTING

### Create Model Configuration File

```bash
cat > /Volumes/AI/models/config.yaml << 'EOF'
# PSW System Local AI Configuration
version: "1.0.0"
environment: "local"

models:
  conversational:
    name: "Llama 3.2 70B"
    path: "/Volumes/AI/models/llama3.2-70b/llama-3.2-70b-instruct.Q4_K_M.gguf"
    quantization: "Q4_K_M"
    context_length: 128000
    gpu_layers: 60
    temperature: 0.7

  medical:
    name: "BioMistral 7B"
    path: "/Volumes/AI/models/biomistral/biomistral-7b.fp16.gguf"
    quantization: "FP16"
    context_length: 8192
    gpu_layers: 40
    temperature: 0.1

  speech_recognition:
    name: "WhisperKit Large-v3-turbo"
    path: "/Volumes/AI/models/whisper"
    model_type: "coreml"
    quantization: "int8"

  text_to_speech:
    name: "XTTS v2"
    path: "/Volumes/AI/models/xtts"
    voice_samples: "/Volumes/AI/models/xtts/voice_samples"

  embeddings:
    name: "BGE-M3"
    path: "/Volumes/AI/models/embeddings"
    dimension: 1024

memory:
  total_available: 96GB
  reserved_for_system: 16GB
  reserved_for_models: 65GB
  max_concurrent_requests: 50

storage:
  models_volume: "/Volumes/AI"
  data_volume: "/Volumes/NAS/psw-data"
  cache_path: "/Volumes/AI/cache"
EOF
```

### Create Test Script

```bash
cat > /Volumes/AI/test_models.py << 'EOF'
#!/usr/bin/env python3
"""
Test all AI models for PSW system
"""
import time
import psutil
from pathlib import Path

def test_llama():
    """Test Llama 3.2 70B"""
    print("> Testing Llama 3.2 70B...")
    import subprocess

    cmd = [
        "ollama", "run", "llama3.2:70b-instruct-q4_K_M",
        "Respond with exactly: 'Llama model working'"
    ]

    start = time.time()
    result = subprocess.run(cmd, capture_output=True, text=True)
    elapsed = time.time() - start

    if result.returncode == 0:
        print(f"   SUCCESS - Response time: {elapsed:.2f}s")
        print(f"  =Ý Response: {result.stdout.strip()[:100]}")
    else:
        print(f"  L FAILED - {result.stderr}")

def test_whisper():
    """Test WhisperKit"""
    print("\n<¤ Testing WhisperKit...")
    try:
        from whisperkit import WhisperKit

        whisper = WhisperKit(
            model_path="/Volumes/AI/models/whisper",
            device="mps"
        )
        print("   SUCCESS - WhisperKit loaded")
    except Exception as e:
        print(f"  L FAILED - {str(e)}")

def test_tts():
    """Test XTTS v2"""
    print("\n=
 Testing XTTS v2...")
    try:
        from TTS.api import TTS

        tts = TTS(model_path="/Volumes/AI/models/xtts")
        print("   SUCCESS - XTTS v2 loaded")
    except Exception as e:
        print(f"  L FAILED - {str(e)}")

def test_embeddings():
    """Test BGE-M3"""
    print("\n=Ê Testing BGE-M3 Embeddings...")
    try:
        from sentence_transformers import SentenceTransformer

        model = SentenceTransformer(
            'BAAI/bge-m3',
            cache_folder='/Volumes/AI/models/embeddings'
        )

        # Test embedding
        start = time.time()
        embedding = model.encode(["Test sentence"])
        elapsed = time.time() - start

        print(f"   SUCCESS - Embedding generated in {elapsed*1000:.1f}ms")
        print(f"  =Ð Shape: {embedding.shape}")
    except Exception as e:
        print(f"  L FAILED - {str(e)}")

def check_memory():
    """Check memory usage"""
    print("\n=¾ Memory Status:")
    mem = psutil.virtual_memory()
    print(f"  Total: {mem.total / (1024**3):.1f} GB")
    print(f"  Available: {mem.available / (1024**3):.1f} GB")
    print(f"  Used: {mem.used / (1024**3):.1f} GB ({mem.percent}%)")

def check_storage():
    """Check storage"""
    print("\n=¿ Storage Status:")
    ai_volume = Path("/Volumes/AI")
    if ai_volume.exists():
        import shutil
        total, used, free = shutil.disk_usage(ai_volume)
        print(f"  AI Volume: {used / (1024**3):.1f} GB used / {total / (1024**3):.1f} GB total")
    else:
        print("     AI Volume not mounted")

if __name__ == "__main__":
    print("=" * 60)
    print("PSW SYSTEM - LOCAL AI MODELS TEST")
    print("=" * 60)

    check_memory()
    check_storage()

    print("\n" + "=" * 60)
    print("TESTING MODELS")
    print("=" * 60)

    test_llama()
    test_whisper()
    test_tts()
    test_embeddings()

    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
EOF

chmod +x /Volumes/AI/test_models.py
```

### Run Tests

```bash
# Activate virtual environment
source /Volumes/AI/venv/bin/activate

# Install test dependencies
pip install psutil

# Run tests
python3 /Volumes/AI/test_models.py
```

---

## >à MEMORY MANAGEMENT

### Monitor Memory Usage

```bash
# Create monitoring script
cat > /Volumes/AI/monitor_memory.sh << 'EOF'
#!/bin/bash
echo "= PSW System Memory Monitor"
echo "================================"

while true; do
    clear
    echo "$(date '+%Y-%m-%d %H:%M:%S')"
    echo ""

    # System memory
    vm_stat | grep -E "Pages (free|active|inactive|wired)" | \
        awk '{printf "%-20s %10s\n", $1, $2}'

    echo ""
    echo "AI Model Processes:"
    ps aux | grep -E "(ollama|python|whisper)" | grep -v grep | \
        awk '{printf "%-20s %5s%% CPU %5s%% MEM\n", $11, $3, $4}'

    sleep 5
done
EOF

chmod +x /Volumes/AI/monitor_memory.sh
```

### Optimize for 96GB

```python
# Memory optimization script
# Save as: /Volumes/AI/optimize_memory.py

import subprocess
import psutil

class MemoryOptimizer:
    """Optimize model loading for 96GB RAM"""

    def __init__(self):
        self.total_ram = 96 * 1024  # 96GB in MB
        self.reserved_system = 16 * 1024  # 16GB for system
        self.available = self.total_ram - self.reserved_system

    def recommend_config(self):
        """Recommend optimal configuration"""
        configs = {
            "llama_70b": {
                "gpu_layers": 60,
                "context_length": 128000,
                "batch_size": 512,
                "threads": 16,
                "memory": 48000  # 48GB
            },
            "biomistral_7b": {
                "gpu_layers": 40,
                "context_length": 8192,
                "batch_size": 256,
                "threads": 8,
                "memory": 8000  # 8GB
            },
            "whisper": {
                "memory": 4000  # 4GB
            },
            "xtts": {
                "memory": 2000  # 2GB
            },
            "embeddings": {
                "memory": 3000  # 3GB
            }
        }

        total_required = sum(c.get("memory", 0) for c in configs.values())

        print(f"Total RAM: {self.total_ram / 1024:.1f} GB")
        print(f"Reserved for system: {self.reserved_system / 1024:.1f} GB")
        print(f"Available for models: {self.available / 1024:.1f} GB")
        print(f"Required by models: {total_required / 1024:.1f} GB")
        print(f"Headroom: {(self.available - total_required) / 1024:.1f} GB")

        if total_required <= self.available:
            print("\n All models can run simultaneously")
        else:
            print("\n   Insufficient memory - consider alternative configuration")

        return configs

if __name__ == "__main__":
    optimizer = MemoryOptimizer()
    configs = optimizer.recommend_config()
```

---

## =' TROUBLESHOOTING

### Common Issues

#### Issue 1: "Model not found"

```bash
# Check if AI volume is mounted
ls -la /Volumes/AI/models

# Verify model files
find /Volumes/AI/models -name "*.gguf" -ls

# Re-download if needed
ollama pull llama3.2:70b-instruct-q4_K_M
```

#### Issue 2: "Out of memory"

```bash
# Check current memory usage
vm_stat | grep "Pages free"

# Kill heavy processes
killall ollama
killall python3

# Use lighter models
ollama pull llama3.2:34b-instruct-q6_K  # Use 34B instead of 70B
```

#### Issue 3: "Slow performance"

```bash
# Enable Metal acceleration
export PYTORCH_ENABLE_MPS_FALLBACK=1
export WHISPER_METAL=1

# Increase GPU layers
# Edit model config to use more GPU layers
```

#### Issue 4: "Permission denied"

```bash
# Fix permissions
sudo chmod -R 755 /Volumes/AI/models
sudo chown -R $(whoami) /Volumes/AI/models
```

### Performance Benchmarks

```bash
# Benchmark script
cat > /Volumes/AI/benchmark.sh << 'EOF'
#!/bin/bash

echo "=€ PSW System Performance Benchmark"
echo "===================================="

# Test Llama inference speed
echo "Testing Llama 3.2 70B..."
time ollama run llama3.2:70b-instruct-q4_K_M \
    "Generate a brief PSW shift summary" \
    --verbose

# Test Whisper transcription
echo -e "\nTesting Whisper transcription..."
# Add whisper test here

echo -e "\nBenchmark complete!"
EOF

chmod +x /Volumes/AI/benchmark.sh
./Volumes/AI/benchmark.sh
```

---

##  VERIFICATION CHECKLIST

Before proceeding, verify:

- [ ] All tools installed (Ollama, Python, MLX, etc.)
- [ ] Llama 3.2 70B downloaded (~38GB)
- [ ] BioMistral 7B downloaded (~14GB)
- [ ] WhisperKit downloaded (~3GB)
- [ ] XTTS v2 downloaded (~2GB)
- [ ] BGE-M3 downloaded (~2GB)
- [ ] Total storage used: ~70GB
- [ ] All models tested successfully
- [ ] Memory usage <65GB with all models loaded
- [ ] Configuration files created
- [ ] Test script runs without errors

---

## <¯ NEXT STEPS

Once all models are downloaded and tested:

1.  Return to [LOCAL_SETUP.md](LOCAL_SETUP.md) for app configuration
2.  Update `.env.local` with local model paths
3.  Configure the PSW app to use local models
4.  Test end-to-end voice ’ documentation flow
5.  Monitor performance and optimize as needed

---

## =Ú ADDITIONAL RESOURCES

- **Ollama Documentation**: https://ollama.ai/docs
- **MLX Documentation**: https://ml-explore.github.io/mlx/
- **WhisperKit**: https://github.com/argmaxinc/WhisperKit
- **Coqui TTS**: https://github.com/coqui-ai/TTS
- **BGE-M3**: https://huggingface.co/BAAI/bge-m3

---

**Status**:  Ready for Download
**Estimated Setup Time**: 2-4 hours (depending on internet speed)
**Last Updated**: October 23, 2025
