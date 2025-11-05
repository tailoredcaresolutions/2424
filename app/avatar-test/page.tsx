"use client";

import VisemeAvatarSVG from "@/components/VisemeAvatarSVG";
import { useState } from "react";

export default function AvatarTestPage() {
  const [wsUrl, setWsUrl] = useState(
    process.env.NEXT_PUBLIC_VOICE_WS_URL || "wss://voice.tailoredcaresolutions.com/ws/speak"
  );
  const [wsToken, setWsToken] = useState(process.env.NEXT_PUBLIC_VOICE_WS_TOKEN || "");
  const [autoConnect, setAutoConnect] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Viseme Avatar SVG Test
          </h1>
          <p className="text-gray-600">
            WebSocket-connected avatar with real-time lip-sync
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Display */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Live Avatar
            </h2>

            <div className="flex items-center justify-center min-h-[400px]">
              <VisemeAvatarSVG
                wsUrl={wsUrl}
                wsToken={wsToken}
                size="xl"
                autoConnect={autoConnect}
              />
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Configuration
            </h2>

            <div className="space-y-6">
              {/* WebSocket URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WebSocket URL
                </label>
                <input
                  type="text"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="wss://voice.tailoredcaresolutions.com/ws/speak"
                />
              </div>

              {/* Token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token (optional)
                </label>
                <input
                  type="text"
                  value={wsToken}
                  onChange={(e) => setWsToken(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Leave empty if no auth required"
                />
              </div>

              {/* Auto-connect */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoConnect"
                  checked={autoConnect}
                  onChange={(e) => setAutoConnect(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="autoConnect" className="ml-2 text-sm text-gray-700">
                  Auto-connect on load
                </label>
              </div>

              {/* Viseme Map Reference */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Viseme Map
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-mono text-purple-600">MBP</span>
                    <span className="text-gray-600">M, B, P (lips closed)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-purple-600">AI</span>
                    <span className="text-gray-600">AH, AY, EY (open)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-purple-600">E</span>
                    <span className="text-gray-600">EH, AE (wide smile)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-purple-600">O</span>
                    <span className="text-gray-600">OH, AO, OW (rounded)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-purple-600">U</span>
                    <span className="text-gray-600">UW, UH (small)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-purple-600">FV</span>
                    <span className="text-gray-600">F, V (teeth on lip)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-purple-600">L</span>
                    <span className="text-gray-600">L (tongue visible)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-purple-600">rest</span>
                    <span className="text-gray-600">Silence/neutral</span>
                  </div>
                </div>
              </div>

              {/* Event Protocol */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Event Protocol
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400">
                  <div>{"{"}</div>
                  <div className="ml-4">"type": "viseme",</div>
                  <div className="ml-4">"t": 120,</div>
                  <div className="ml-4">"v": "MBP",</div>
                  <div className="ml-4">"hold": 80</div>
                  <div>{"}"}</div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  How to Test
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Click "Connect" button on the avatar</li>
                  <li>Send speech request to orchestrator backend</li>
                  <li>Watch avatar lip-sync in real-time</li>
                  <li>Viseme events update every ~80-180ms</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Backend Info */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Backend Integration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Orchestrator</h3>
              <code className="block bg-gray-100 p-3 rounded text-xs">
                http://127.0.0.1:8787/health
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">WebSocket</h3>
              <code className="block bg-gray-100 p-3 rounded text-xs">
                ws://127.0.0.1:8787/ws/speak
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Production WS</h3>
              <code className="block bg-gray-100 p-3 rounded text-xs">
                wss://voice.tailoredcaresolutions.com/ws/speak
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Test Message</h3>
              <code className="block bg-gray-100 p-3 rounded text-xs whitespace-pre">
                {`{"type":"speak","text":"test","language":"en"}`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
