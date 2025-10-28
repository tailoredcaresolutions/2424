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
