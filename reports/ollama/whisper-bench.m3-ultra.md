# Whisper M3 Ultra Benchmark Results

**Date**: 2025-10-28T06:06:13.740Z
**Hardware**: Mac Studio M3 Ultra (28 cores, 26 threads)
**Metal**: Enabled
**Test Audio**: jfk.wav (~11 seconds)

## Results

| Model | Size | Lang Mode | Latency (ms) | RTF | Load (ms) | Encode (ms) | Decode (ms) | Pick |
|-------|------|-----------|--------------|-----|-----------|-------------|-------------|------|
| tiny | 74M | multi | 210 | 0.019 | 38 | 19 | 1 |  |
| tiny.en | 74M | en-only | 166 | 0.015 | 39 | 20 | 0 | ⚡ Daily |
| base | 142M | multi | 197 | 0.018 | 56 | 20 | 0 |  |
| base.en | 142M | en-only | 202 | 0.018 | 56 | 21 | 1 |  |
| small | 466M | multi | 365 | 0.033 | 142 | 54 | 0 |  |
| small.en | 466M | en-only | 353 | 0.032 | 138 | 45 | 0 |  |
| medium | 1.5G | multi | 814 | 0.074 | 398 | 119 | 0 |  |
| medium.en | 1.5G | en-only | 876 | 0.080 | 461 | 116 | 0 |  |
| large-v2 | 2.9G | multi | 1386 | 0.126 | 761 | 205 | 0 |  |
| large-v3 | 2.9G | multi | 1417 | 0.129 | 781 | 207 | 0 |  |
| large-v3-turbo | 1.6G | multi | 742 | 0.067 | 423 | 177 | 0 | 🏆 Flag |

## Selections

**Daily Driver**: tiny.en (166ms, RTF 0.015)
**Flagship**: large-v3-turbo (742ms, RTF 0.067)
