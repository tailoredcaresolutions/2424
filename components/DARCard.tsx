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
