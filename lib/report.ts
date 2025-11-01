import { promises as fs } from "fs";
import path from "path";
import { redactForExport } from "./redact";

const REPORTS_ROOT = "/Volumes/AI/AI Services/reports";

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export function stampPaths(sessionId: string) {
  const date = new Date();
  const yyyy = date.toISOString().slice(0,10); // YYYY-MM-DD
  const base = path.join(REPORTS_ROOT, yyyy, sessionId);
  return {
    base,
    json: path.join(base, "report.dar.json"),
    md: path.join(base, "report.md"),
    html: path.join(base, "report.html")
  };
}

export function toMarkdown(noteText: string, dar: any): string {
  return [
    "# Shift Report (DAR)",
    "",
    `**Date/Time:** ${dar?.date_time ?? ""}`,
    `**PSW:** ${dar?.psw_id ?? ""}`,
    `**Client:** ${dar?.client_name ?? dar?.client_id ?? ""}`,
    "",
    "## Narrative (Paragraph)",
    "",
    redactForExport(noteText || ""),
    "",
    "## DAR JSON (key fields)",
    "",
    "```json",
    JSON.stringify(dar ?? {}, null, 2),
    "```"
  ].join("\n");
}

export function toHTML(noteText: string, dar: any): string {
  const md = toMarkdown(noteText, dar);
  // Simple markdown-to-html stub; replace with a renderer if needed
  const esc = (s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  return `<html><head><meta charset="utf-8"><title>Shift Report</title></head><body><pre>${esc(md)}</pre></body></html>`;
}

export async function writeReport(sessionId: string, noteText: string, dar: any) {
  const p = stampPaths(sessionId);
  await ensureDir(p.base);
  await fs.writeFile(p.json, JSON.stringify(dar ?? {}, null, 2), "utf-8");
  await fs.writeFile(p.md, toMarkdown(noteText, dar), "utf-8");
  await fs.writeFile(p.html, toHTML(noteText, dar), "utf-8");
  return p;
}
