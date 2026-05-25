import { NextResponse } from "next/server";
import { after } from "next/server";
import { sendAuditEmail } from "@/lib/email";
import { getSupabase } from "@/lib/supabase";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per-IP: 8 sends per 5 min   ·   Per-email: 1 send per 30s (cooldown)
const IP_LIMIT = { max: 8, windowMs: 5 * 60_000 };
const EMAIL_LIMIT = { max: 1, windowMs: 30_000 };

interface SendEmailBody {
  email?: unknown;
  monthlySavings?: unknown;
  annualSavings?: unknown;
  reportUrl?: unknown;
  company?: unknown;
  role?: unknown;
  reportId?: unknown;
}

function str(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function tooMany(retryAfterSeconds: number) {
  return NextResponse.json(
    { ok: false, error: "Too many requests — please wait a moment and try again." },
    { status: 429, headers: { "retry-after": String(retryAfterSeconds) } },
  );
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const ipGate = rateLimit("send-email:ip", ip, IP_LIMIT.max, IP_LIMIT.windowMs);
  if (!ipGate.ok) return tooMany(ipGate.retryAfterSeconds);

  let body: SendEmailBody;
  try {
    body = (await request.json()) as SendEmailBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const monthlySavings = Number(body.monthlySavings);
  const annualSavings = Number(body.annualSavings);
  const reportUrl = typeof body.reportUrl === "string" ? body.reportUrl.trim() : "";
  const company = str(body.company);
  const role = str(body.role);
  const reportId = str(body.reportId);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email address" }, { status: 400 });
  }
  if (!Number.isFinite(monthlySavings) || !Number.isFinite(annualSavings)) {
    return NextResponse.json({ ok: false, error: "Invalid savings values" }, { status: 400 });
  }
  if (!reportUrl || !/^https?:\/\//i.test(reportUrl)) {
    return NextResponse.json({ ok: false, error: "Invalid report URL" }, { status: 400 });
  }

  const emailGate = rateLimit("send-email:address", email, EMAIL_LIMIT.max, EMAIL_LIMIT.windowMs);
  if (!emailGate.ok) return tooMany(emailGate.retryAfterSeconds);

  try {
    const { id } = await sendAuditEmail({
      to: email,
      monthlySavings,
      annualSavings,
      reportUrl,
      company: company ?? undefined,
    });

    // Persist lead after we've responded — DB latency must never gate the user UX.
    after(async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      try {
        const { error } = await supabase.from("leads").insert({
          email,
          company,
          role,
          report_id: reportId,
          monthly_savings: monthlySavings,
          annual_savings: annualSavings,
        });
        if (error) console.warn("[send-email] lead insert failed:", error.message);
      } catch (err) {
        console.warn("[send-email] lead insert threw:", err instanceof Error ? err.message : err);
      }
    });

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[send-email] failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
