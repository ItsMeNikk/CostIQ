import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface LeadRow {
  id: string;
  email: string;
  company: string | null;
  role: string | null;
  report_id: string | null;
  monthly_savings: number | null;
  annual_savings: number | null;
  created_at: string;
}

export interface ReportRow {
  id: string;
  share_token: string;
  company_name: string | null;
  team_size: string | null;
  role: string | null;
  billing_cycle: string | null;
  total_monthly_spend: number | null;
  total_monthly_savings: number | null;
  total_annual_savings: number | null;
  data: Record<string, unknown>;
  created_at: string;
}

// Generous ceiling — Supabase writes happen in `after()`, never blocking the response,
// so a long timeout is fine. The bound only exists so a wedged socket can be reclaimed.
// On networks with slow IPv6 fallback this needs to be > ~6s.
const SUPABASE_FETCH_TIMEOUT_MS = 15_000;

function boundedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPABASE_FETCH_TIMEOUT_MS);

  const externalSignal = init?.signal;
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort(externalSignal.reason);
    else externalSignal.addEventListener("abort", () => controller.abort(externalSignal.reason), { once: true });
  }

  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  cached = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { fetch: boundedFetch },
  });
  return cached;
}
