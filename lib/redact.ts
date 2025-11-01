export function redactForExport(text: string): string {
  // Minimal demo redactor: remove simple identifiers (names, phone-like).
  // Extend with your PHI rules as needed.
  return text
    .replace(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g, "[REDACTED_NAME]")
    .replace(/\+?\d[\d\-\s]{6,}\b/g, "[REDACTED_PHONE]");
}
