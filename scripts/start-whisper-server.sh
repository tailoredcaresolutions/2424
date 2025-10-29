#!/bin/bash
#
# Start Whisper.cpp HTTP Server
#

echo "🎙️  Starting Whisper.cpp HTTP Server..."

WHISPER_DIR="/Volumes/AI/whisper.cpp"
MODELS_DIR="/Volumes/AI/Models/whisper"
MODEL_NAME="ggml-base.en.bin"
PORT=9000

# Create models directory
mkdir -p "$MODELS_DIR"

# Download model if not exists
if [ ! -f "$MODELS_DIR/$MODEL_NAME" ]; then
    echo "   📥 Downloading base.en model (74MB)..."
    cd "$WHISPER_DIR"
    bash ./models/download-ggml-model.sh base.en
    mv "models/$MODEL_NAME" "$MODELS_DIR/"
fi

# Check if already running
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ⚠️  Whisper server already running on port $PORT"
    exit 0
fi

# Start server
"$WHISPER_DIR/build/bin/whisper-server" \
    -m "$MODELS_DIR/$MODEL_NAME" \
    -t $(sysctl -n hw.ncpu) \
    --host 0.0.0.0 \
    --port $PORT \
    --convert \
    > /tmp/whisper-server.log 2>&1 &

sleep 2

if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ✅ Whisper server started on http://localhost:$PORT"
    echo "   📄 Logs: tail -f /tmp/whisper-server.log"
else
    echo "   ❌ Failed to start - check logs"
    tail /tmp/whisper-server.log
fi
