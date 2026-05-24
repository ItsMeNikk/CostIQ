import { NextResponse } from "next/server";
import { sendAuditEmail } from "@/lib/email";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SendEmailBody {
  email?: unknown;
  monthlySavings?: unknown;
  annualSavings?: unknown;
  reportUrl?: unknown;
  company?: unknown;
}

export async function POST(request: Request) {
  let body: SendEmailBody;
  try {
    body = (await request.json()) as SendEmailBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const monthlySavings = Number(body.monthlySavings);
  const annualSavings = Number(body.annualSavings);
  const reportUrl = typeof body.reportUrl === "string" ? body.reportUrl.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() || undefined : undefined;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email address" }, { status: 400 });
  }
  if (!Number.isFinite(monthlySavings) || !Number.isFinite(annualSavings)) {
    return NextResponse.json({ ok: false, error: "Invalid savings values" }, { status: 400 });
  }
  if (!reportUrl || !/^https?:\/\//i.test(reportUrl)) {
    return NextResponse.json({ ok: false, error: "Invalid report URL" }, { status: 400 });
  }

  try {
    const { id } = await sendAuditEmail({
      to: email,
      monthlySavings,
      annualSavings,
      reportUrl,
      company,
    });
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[send-email] failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
