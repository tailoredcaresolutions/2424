#!/usr/bin/env bash
set -euo pipefail

# 0) Dependencies used by your updated API (AJV). Safe to re-run.
if [ -f package.json ]; then
  echo "▶ Installing dependencies (ajv)..."
  npm i ajv --save >/dev/null 2>&1 || yarn add ajv
else
  echo "✖ Run this inside your Next.js project root (where package.json exists)."
  exit 1
fi

# 1) Ensure base folders exist
mkdir -p app/demo-dar
mkdir -p components

# 2) Create a reusable DAR viewer card (toggle JSON, copy, export)
cat > components/DARCard.tsx <<'TSX'
"use client";

import React, { useState } from "react";

type DAR = {
  client_name?: string;
  date_time?: string;
  language?: string;
  DAR?: { Data?: string; Action?: string; Response?: string };
  adls?: {
    personal_care?: string;
    mobility?: string;
    nutrition?: { meal?: string; intake?: string; items?: string[] };
    continence?: string;
    mood?: string;
    social?: string;
    safety_environment?: string;
  };
  observations?: {
    vital_signs?: { bp?: string; hr?: string; temp?: string; spo2?: string };
    medications?: { name: string; dose?: string; time?: string; source?: string }[];
    pain?: { scale_0_10?: number | string; location?: string };
  };
  follow_up?: { notify_supervisor_RN?: boolean | string; reason?: string };
  psw_id?: string;
  errors_or_gaps?: string[];
};

export default function DARCard({
  noteText,
  dar
}: {
  noteText: string;
  dar: DAR | null;
}) {
  const [showJSON, setShowJSON] = useState(false);

  const onCopyText = async () => {
    try {
      await navigator.clipboard.writeText(noteText || "");
      alert("Paragraph copied to clipboard.");
    } catch {
      alert("Copy failed.");
    }
  };

  const onCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(dar ?? {}, null, 2));
      alert("DAR JSON copied to clipboard.");
    } catch {
      alert("Copy failed.");
    }
  };

  const onExportJSON = () => {
    const fileNameSafe = (dar?.client_name || "client")
      .toLowerCase()
      .replace(/[^a-z0-9\-]+/g, "-");
    const blob = new Blob([JSON.stringify(dar ?? {}, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dt = (dar?.date_time || new Date().toISOString()).replace(/[:]/g, "");
    a.href = url;
    a.download = `report-${fileNameSafe}-${dt}.dar.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full rounded-2xl border border-gray-200 p-4 shadow-sm bg-white">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Generated Progress Note</h3>
        <div className="flex gap-2">
          <button
            onClick={onCopyText}
            className="px-3 py-1.5 rounded-lg bg-gray-800 text-white text-sm"
          >
            Copy Paragraph
          </button>
          <button
            onClick={() => setShowJSON((s) => !s)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm"
          >
            {showJSON ? "Hide DAR JSON" : "Show DAR JSON"}
          </button>
          <button
            onClick={onCopyJSON}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm"
          >
            Copy JSON
          </button>
          <button
            onClick={onExportJSON}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm"
          >
            Export as DAR JSON
          </button>
        </div>
      </div>

      <div className="mt-3">
        <p className="whitespace-pre-wrap text-gray-900">{noteText || "—"}</p>
      </div>

      {showJSON && (
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-gray-50 p-4 text-xs leading-5 text-gray-800">
{JSON.stringify(dar ?? {}, null, 2)}
        </pre>
      )}
    </div>
  );
}
TSX

# 3) Create a demo page that calls your API and displays paragraph + toggle JSON
cat > app/demo-dar/page.tsx <<'TSX'
"use client";

import React, { useState } from "react";
import DARCard from "@/components/DARCard";

type DAR = Record<string, any>;

export default function DemoDARPage() {
  const [input, setInput] = useState("");
  const [noteText, setNoteText] = useState<string>("");
  const [dar, setDar] = useState<DAR | null>(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");

  const run = async () => {
    setLoading(true);
    setNoteText("");
    setDar(null);

    try {
      const res = await fetch("/api/generate-ai-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shiftData: {
            client_name: "Demo Client",
            psw_name: "Demo PSW",
            observations: [input],
            care_activities: [],
            client_responses: [],
            communications: [],
            languages_used: [lang]
          },
          conversation: [
            { role: "user", content: input }
          ]
        })
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }

      const data = await res.json();
      // Your updated API returns: noteText (paragraph) + dar (JSON)
      setNoteText(data.noteText || data.response || "");
      setDar(data.dar || null);
    } catch (e: any) {
      alert(`Request failed: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">DAR Demo (Paragraph + JSON)</h1>
      <p className="text-sm text-gray-600">
        Enter a PSW-style narrative and click <b>Generate</b>. The page will show a concise paragraph + DAR JSON,
        with options to copy or export the JSON.
      </p>

      <div className="rounded-2xl border border-gray-200 p-4 bg-white shadow-sm space-y-3">
        <label className="text-sm font-medium">Input Language</label>
        <select
          className="w-full rounded-lg border px-3 py-2"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          <option value="en">English (en)</option>
          <option value="fil">Filipino / Tagalog (fil)</option>
          <option value="es">Spanish (es)</option>
          <option value="pt">Portuguese (pt)</option>
          <option value="bo">Tibetan (bo)</option>
          <option value="hi">Hindi (hi)</option>
        </select>

        <label className="text-sm font-medium">PSW Input</label>
        <textarea
          className="w-full rounded-lg border px-3 py-2 min-h-[140px]"
          placeholder='e.g., "Helped Mr. Johnson with breakfast. He ate about 75%..."'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={run}
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {(noteText || dar) && <DARCard noteText={noteText} dar={dar} />}
    </main>
  );
}
TSX

# 4) Success message + where to go
echo "✅ UI added."
echo "Open: http://localhost:3000/demo-dar"
echo "You will see: input box -> Generate -> Paragraph + toggleable DAR JSON with Copy and Export."
