import { NextRequest, NextResponse } from "next/server";
import { validateDAR } from "@/lib/ajv";
import { writeReport } from "@/lib/report";

export async function POST(req: NextRequest) {
  try {
    const { noteText, dar, sessionId } = await req.json();
    if (!noteText || !dar || !sessionId) {
      return NextResponse.json({ error: "missing noteText|dar|sessionId" }, { status: 400 });
    }
    // Validate and patch errors
    const ok = validateDAR(dar);
    if (!ok) {
      const errs = (validateDAR.errors || []).map(e => `${e.instancePath || "(root)"} ${e.message}`);
      dar.errors_or_gaps = Array.from(new Set([...(dar.errors_or_gaps || []), ...errs]));
    }
    // Ensure stamps
    dar.date_time = dar.date_time || new Date().toISOString();

    const paths = await writeReport(sessionId, noteText, dar);
    return NextResponse.json({ ok: true, paths }, { status: 200 });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "finalize_failed" }, { status: 500 });
  }
}
