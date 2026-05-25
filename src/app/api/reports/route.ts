import { NextResponse } from "next/server";
import { after } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Per-IP: 15 report saves per 10 min   ·   Per-report-id: 1 (idempotent guard)
const IP_LIMIT = { max: 15, windowMs: 10 * 60_000 };
const ID_LIMIT = { max: 1, windowMs: 24 * 60 * 60_000 };

// Reads are cheap but still gated so a hot link can't be scraped at high volume.
const GET_IP_LIMIT = { max: 60, windowMs: 5 * 60_000 };

interface SaveReportBody {
  id?: unknown;
  shareToken?: unknown;
  companyName?: unknown;
  teamSize?: unknown;
  role?: unknown;
  billingCycle?: unknown;
  totalMonthlySpend?: unknown;
  totalMonthlySavings?: unknown;
  totalAnnualSavings?: unknown;
  data?: unknown;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function tooMany(retryAfterSeconds: number) {
  return NextResponse.json(
    { ok: false, error: "Too many requests — please wait a moment and try again." },
    { status: 429, headers: { "retry-after": String(retryAfterSeconds) } },
  );
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const gate = rateLimit("reports:get:ip", ip, GET_IP_LIMIT.max, GET_IP_LIMIT.windowMs);
  if (!gate.ok) return tooMany(gate.retryAfterSeconds);

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const share = url.searchParams.get("share");

  if (!id || !share) {
    return NextResponse.json({ ok: false, error: "Missing id or share token" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Storage not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("reports")
    .select("share_token, data")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.warn("[reports:get] select failed:", error.message);
    return NextResponse.json({ ok: false, error: "Lookup failed" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (data.share_token !== share) {
    // Treat as not-found to avoid leaking the existence of the id to scrapers.
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: data.data });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const ipGate = rateLimit("reports:ip", ip, IP_LIMIT.max, IP_LIMIT.windowMs);
  if (!ipGate.ok) return tooMany(ipGate.retryAfterSeconds);

  let body: SaveReportBody;
  try {
    body = (await request.json()) as SaveReportBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const id = str(body.id);
  const shareToken = str(body.shareToken);
  if (!id || !shareToken) {
    return NextResponse.json({ ok: false, error: "Missing id or shareToken" }, { status: 400 });
  }
  if (!body.data || typeof body.data !== "object") {
    return NextResponse.json({ ok: false, error: "Missing data payload" }, { status: 400 });
  }

  const idGate = rateLimit("reports:id", id, ID_LIMIT.max, ID_LIMIT.windowMs);
  if (!idGate.ok) {
    // Same report submitted twice within the window — treat as a no-op success.
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const row = {
    id,
    share_token: shareToken,
    company_name: str(body.companyName),
    team_size: str(body.teamSize),
    role: str(body.role),
    billing_cycle: str(body.billingCycle),
    total_monthly_spend: num(body.totalMonthlySpend),
    total_monthly_savings: num(body.totalMonthlySavings),
    total_annual_savings: num(body.totalAnnualSavings),
    data: body.data as Record<string, unknown>,
  };

  // Fire-and-forget insert — return 202 immediately so the client never waits on DB latency.
  after(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const { error } = await supabase.from("reports").insert(row);
      if (error) console.warn("[reports] insert failed:", error.message);
    } catch (err) {
      console.warn("[reports] insert threw:", err instanceof Error ? err.message : err);
    }
  });

  return NextResponse.json({ ok: true }, { status: 202 });
}
