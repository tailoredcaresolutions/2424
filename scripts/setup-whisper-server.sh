#!/bin/bash
#
# Setup Whisper.cpp HTTP Server
#

set -e

echo "🎙️  Setting up Whisper.cpp HTTP Server..."

# Configuration
WHISPER_DIR="/Volumes/AI/whisper.cpp"
MODELS_DIR="/Volumes/AI/Models/whisper"
WHISPER_PORT=9000

# 1. Clone repository
echo "1️⃣  Cloning Whisper.cpp..."
if [ ! -d "$WHISPER_DIR" ]; then
    git clone https://github.com/ggml-org/whisper.cpp.git "$WHISPER_DIR"
fi

cd "$WHISPER_DIR"

# 2. Build
echo "2️⃣  Building Whisper.cpp server..."
mkdir -p build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release -DWHISPER_BUILD_SERVER=ON -DGGML_METAL=ON
cmake --build . --config Release -j $(sysctl -n hw.ncpu)

echo "✅ Whisper.cpp setup complete!"
echo "Server binary: $WHISPER_DIR/build/bin/whisper-server"
