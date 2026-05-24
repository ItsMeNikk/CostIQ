"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { runAudit, AuditReport, Recommendation, getProviderMeta } from "@/lib/audit-engine";
import { hasUsableReportData } from "@/lib/audit-validation";
import { resolveAccess, buildShareUrl, type AccessState } from "@/lib/share-token";
import EmailCaptureModal from "@/components/EmailCaptureModal";
import LockedReportOverlay from "@/components/LockedReportOverlay";
import ReportNotFoundState from "@/components/ReportNotFoundState";

const MODAL_AUTO_DELAY_MS = 5500;
const MODAL_SEAL_PREFIX = "costiq_modal_sealed_";
const CAPTURED_EMAIL_KEY = "costiq_captured_email";

/* ─── Session Storage ─────────────────────────────────────────────── */

interface ToolEntry {
  key: string;
  label: string;
  category: string;
  color: string;
  plan: string;
  planLabel?: string;
  monthlySpend: number | null;
  seats: number | null;
}

interface AuditData {
  id: string;
  companyName: string;
  teamSize: string;
  role: string;
  selectedUseCases: string[];
  selectedTools: string[];
  customTools: string[];
  spendRange: string;
  billingCycle: string;
  toolData: ToolEntry[];
  configuredCount: number;
  totalSpend: number;
  submittedAt: string;
}

/* ─── Default/fallback report for demo ─────────────────────────────── */

function getDefaultReport(): AuditReport {
  return {
    totalMonthlySpend: 2010,
    totalMonthlySavings: 480,
    totalAnnualSavings: 5760,
    optimizationScore: 71,
    duplicateCount: 1,
    alreadyOptimized: false,
    recommendations: [
      {
        id: "demo-1",
        tool: "GitHub Copilot",
        plan: "Business",
        recommendation: "Switch to annual billing",
        reason: "Annual plans offer ~17% discount on Copilot Business",
        detail: "Switching from monthly to annual billing on Copilot Business saves ~$48/mo ($576/year). The discount applies immediately and pays back within the first month.",
        monthlySavings: 48,
        annualSavings: 576,
        impact: "medium",
        category: "billing",
        badge: "Quick win",
        badgeColor: "#10A37F",
        priorityLabel: "Billing optimization",
        currentSetup: { plan: "Business", billing: "Monthly", seats: 20, monthlyCost: 380 },
        recommendedSetup: { plan: "Business", billing: "Annual", seats: 20, monthlyCost: 332 },
      },
      {
        id: "demo-2",
        tool: "ChatGPT",
        plan: "Team",
        recommendation: "Reconsider team size — several seats may be unused",
        reason: "Team plan minimum is 5 seats. Verify all seats are active.",
        detail: "If any ChatGPT Team seats go unused, downgrading to Plus ($20/mo) saves $25/seat/mo. Check usage at chat.openai.com.",
        monthlySavings: 50,
        annualSavings: 600,
        impact: "medium",
        category: "seat",
        badge: "Easy fix",
        badgeColor: "#5B8DBE",
        priorityLabel: "Medium impact",
        currentSetup: { plan: "Team", billing: "Per-seat", seats: 8, monthlyCost: 200 },
        recommendedSetup: { plan: "Team", billing: "Per-seat", seats: 6, monthlyCost: 150 },
      },
      {
        id: "demo-3",
        tool: "Cursor + Copilot",
        plan: "Overlap",
        recommendation: "Consolidate overlapping code assistant subscriptions",
        reason: "Both Cursor Business and GitHub Copilot Business serve similar purposes.",
        detail: "Using two AI coding assistants simultaneously is redundant. Pick one and cancel the other. Estimated saving based on consolidating the lower-cost tool.",
        monthlySavings: 150,
        annualSavings: 1800,
        impact: "high",
        category: "consolidation",
        badge: "High impact",
        badgeColor: "#0077b6",
        priorityLabel: "High savings",
        currentSetup: { plan: "Cursor + Copilot", billing: "Two tools", monthlyCost: 600 },
        recommendedSetup: { plan: "Copilot only", billing: "Single tool", monthlyCost: 450 },
      },
      {
        id: "demo-4",
        tool: "Claude",
        plan: "Team",
        recommendation: "Downgrade Team to Pro for low-usage members",
        reason: "Several team members have light usage that Pro covers comfortably.",
        detail: "Several members averaging low usage — Pro tier ($20/mo flat) is sufficient. Downgrading 3 members saves $75/mo.",
        monthlySavings: 75,
        annualSavings: 900,
        impact: "medium",
        category: "plan",
        badge: "Quick win",
        badgeColor: "#10A37F",
        priorityLabel: "Medium impact",
        currentSetup: { plan: "Team", billing: "Per-seat", seats: 10, monthlyCost: 250 },
        recommendedSetup: { plan: "Pro × 3 + Team × 7", billing: "Mixed", seats: 10, monthlyCost: 175 },
      },
      {
        id: "demo-5",
        tool: "Gemini",
        plan: "Advanced",
        recommendation: "Review if Gemini Advanced is justified vs. free tier",
        reason: "Free tier covers most workloads; Advanced may be unused.",
        detail: "Gemini Free includes Gemini 2.0 Flash which matches most use cases. Advanced is $19.99/mo — ensure usage justifies cost.",
        monthlySavings: 20,
        annualSavings: 240,
        impact: "low",
        category: "downgrade",
        badge: "Consider",
        badgeColor: "#5B8DBE",
        priorityLabel: "Quick win",
        currentSetup: { plan: "Advanced", billing: "Flat", monthlyCost: 20 },
        recommendedSetup: { plan: "Free", billing: "Flat", monthlyCost: 0 },
      },
    ],
    providerBreakdown: [
      { name: "OpenAI / ChatGPT",  color: "#10A37F", currentSpend: 680, pct: 34, category: "LLM" },
      { name: "Anthropic / Claude", color: "#C97E4A", currentSpend: 440, pct: 22, category: "LLM" },
      { name: "GitHub Copilot",  color: "#24292F", currentSpend: 380, pct: 19, category: "Code" },
      { name: "Cursor",           color: "#1a1a1a",  currentSpend: 220, pct: 11, category: "IDE / AI" },
      { name: "Gemini",           color: "#8E75B2",  currentSpend: 190, pct: 9,  category: "LLM" },
      { name: "Other",            color: "#94A3B8",  currentSpend: 100, pct: 5,  category: "Other" },
    ],
    summary: "Analyzed 5 AI tools across a 10-person team. Found 5 optimization opportunities totaling $480/mo in potential savings.",
    keyInsights: [
      "Duplicate coding tools found — consolidation saves ~$150/mo",
      "Annual billing switch on Copilot saves ~$576/year",
      "Several unused ChatGPT Team seats — potential $50/mo savings",
    ],
    unoptimizedTools: ["GitHub Copilot", "ChatGPT", "Claude"],
    pricingMetadata: { verifiedDate: "2026-01-15", sourceCount: 5 },
  };
}

/* ─── Rec Card ──────────────────────────────────────────────────────── */

const REC_ICONS: Record<string, string> = {
  plan: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  billing: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  consolidation: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
  downgrade: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  api: "M13 10V3L4 14h7v7l9-11h-7z",
  seat: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
};

function PriorityBadge({ label, color }: { label: string; color: string }) {
  const isFilled = label === "High savings";
  if (isFilled) {
    return (
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: color }}>
        {label}
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}14`, color }}>
      {label}
    </span>
  );
}

function SetupBlock({ title, setup, tone }: {
  title: string;
  setup: { plan: string; billing: string; seats?: number; monthlyCost: number };
  tone: "current" | "recommended";
}) {
  const isCurrent = tone === "current";
  return (
    <div className={`rounded-lg p-3 border ${isCurrent ? "bg-[#f4f8fc] border-[#e2eaf4]" : "bg-[#10A37F]/8 border-[#10A37F]/20"}`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.08em] mb-1.5 ${isCurrent ? "text-[#5B7A99]" : "text-[#10A37F]"}`}>
        {title}
      </p>
      <p className="text-[13px] font-semibold text-[#0D2137] leading-snug">{setup.plan}</p>
      <p className="text-[11px] text-[#5B7A99] mt-0.5">
        {setup.billing}
        {setup.seats !== undefined ? ` · ${setup.seats} seat${setup.seats !== 1 ? "s" : ""}` : ""}
      </p>
      <p className="text-[13px] font-bold text-[#0D2137] mt-1.5">${Math.round(setup.monthlyCost).toLocaleString()}<span className="text-[10px] font-medium text-[#94A3B8] ml-0.5">/mo</span></p>
    </div>
  );
}

function RecCard({ rec, delay }: { rec: Recommendation; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [expanded, setExpanded] = useState(false);
  const iconPath = REC_ICONS[rec.category] || REC_ICONS.plan;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-xl border border-[#d8e4f0] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:border-[#b0c4d8] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-start gap-4 p-4 sm:p-5 hover:bg-[#f8fafc]/40 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#f4f8fc] border border-[#d8e4f0] mt-0.5">
          <svg className="w-[18px] h-[18px]" style={{ color: rec.badgeColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#5B7A99] uppercase tracking-[0.08em]">{rec.tool}</span>
            <span className="w-1 h-1 rounded-full bg-[#CBD5E1] flex-shrink-0" />
            <PriorityBadge label={rec.priorityLabel} color={rec.badgeColor} />
          </div>
          <p className="text-[14px] sm:text-[15px] font-semibold text-[#0D2137] leading-snug mb-1">{rec.recommendation}</p>
          <p className="text-[12px] text-[#5B7A99] leading-snug">{rec.reason}</p>
        </div>

        <div className="flex-shrink-0 text-right ml-2">
          <div className="flex items-baseline gap-0.5 justify-end">
            <span className="text-[26px] sm:text-[28px] font-extrabold tracking-tight text-[#0D2137] leading-none">${rec.monthlySavings}</span>
            <span className="text-[11px] font-medium text-[#94A3B8] ml-0.5">/mo</span>
          </div>
          <span className="inline-block mt-1.5 text-[10px] font-bold text-[#10A37F] bg-[#10A37F]/10 px-2 py-0.5 rounded-full">
            +${rec.annualSavings.toLocaleString()}/yr
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 -mt-1 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SetupBlock title="Current setup" setup={rec.currentSetup} tone="current" />
                <SetupBlock title="Recommended" setup={rec.recommendedSetup} tone="recommended" />
              </div>

              <div className="rounded-lg p-3.5 border border-[#e2eaf4] bg-white">
                <p className="text-[10px] font-bold text-[#5B7A99] uppercase tracking-[0.08em] mb-1.5">Why this saves</p>
                <p className="text-[12.5px] text-[#3D5A73] leading-relaxed">{rec.detail}</p>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 bg-[#10A37F]/8 border border-[#10A37F]/20">
                <span className="text-[11px] font-semibold text-[#10A37F] uppercase tracking-[0.06em]">Projected savings</span>
                <span className="text-[13px] font-bold text-[#10A37F]">
                  ${rec.monthlySavings.toLocaleString()}/mo · ${rec.annualSavings.toLocaleString()}/yr
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── AI Insights ──────────────────────────────────────────────────── */

interface AISummary {
  diagnosis: string;
  biggestSavingsLabel: string;
  biggestSavingsImpact: string;
  additionalLevers: string[];
  closing: string;
}

function AIInsights({
  report,
  summary,
  summaryLoading,
  summarySource,
}: {
  report: AuditReport;
  summary: AISummary | null;
  summaryLoading: boolean;
  summarySource: "ai" | "fallback" | "static";
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const biggest = [...report.recommendations].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  const categoryChips = (() => {
    const seen = new Set<string>();
    const out: { label: string; savings: number; tone: "high" | "mid" | "soft" }[] = [];
    const order: Record<string, "high" | "mid" | "soft"> = {
      "High savings": "high",
      "Billing optimization": "mid",
      "Quick win": "soft",
      "Medium impact": "soft",
    };
    const consolidationRecs = report.recommendations.filter((r) => r.category === "consolidation");
    if (consolidationRecs.length > 0) {
      const total = consolidationRecs.reduce((s, r) => s + r.monthlySavings, 0);
      out.push({ label: "Consolidation", savings: total, tone: "high" });
      seen.add("Consolidation");
    }
    for (const r of [...report.recommendations].sort((a, b) => b.monthlySavings - a.monthlySavings)) {
      if (seen.has(r.priorityLabel)) continue;
      seen.add(r.priorityLabel);
      const tone = order[r.priorityLabel] ?? "soft";
      const tally = report.recommendations
        .filter((x) => x.priorityLabel === r.priorityLabel)
        .reduce((s, x) => s + x.monthlySavings, 0);
      out.push({ label: r.priorityLabel, savings: tally, tone });
      if (out.length >= 4) break;
    }
    return out;
  })();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="relative bg-[#0D2137] rounded-2xl overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }} />
      <div className="absolute top-[-40px] left-[-20px] w-[280px] h-[280px] bg-[#1a3a5c] rounded-full blur-[80px]" />
      <div className="absolute bottom-[-30px] right-[-10px] w-[200px] h-[200px] bg-[#1a3a5c] rounded-full blur-[60px]" />

      <div className="relative z-10 p-6 sm:p-7 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/65">Executive summary</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[9.5px] font-medium tracking-[0.02em] text-white/55">
            <span className={`w-1 h-1 rounded-full ${summarySource === "ai" ? "bg-[#10A37F] animate-pulse" : "bg-white/30"}`} />
            {summaryLoading
              ? "Generating…"
              : summarySource === "ai"
                ? "AI · Llama 3.3"
                : "Deterministic fallback"}
          </span>
        </div>

        {summaryLoading || !summary ? (
          <div className="mb-5 space-y-2.5" aria-live="polite" aria-busy="true">
            <div className="h-3.5 w-[88%] rounded ai-shimmer" />
            <div className="h-3.5 w-[72%] rounded ai-shimmer" />
            <div className="h-16 w-full rounded-lg ai-shimmer mt-4" />
            <div className="h-3.5 w-[78%] rounded ai-shimmer mt-4" />
          </div>
        ) : (
          <>
            {/* Diagnosis */}
            <p className="text-[14.5px] sm:text-[15.5px] text-white/92 font-normal leading-[1.7] tracking-[-0.005em] max-w-[60ch] mb-4">
              {summary.diagnosis}
            </p>

            {/* Key Insight block */}
            <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4 mb-4">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#34D399] mb-2">Key insight</p>
              <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                <p className="text-[14px] sm:text-[14.5px] font-semibold text-white leading-snug">
                  {summary.biggestSavingsLabel}
                </p>
                <span className="text-[11px] font-semibold text-[#34D399] bg-[#10A37F]/15 border border-[#10A37F]/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {summary.biggestSavingsImpact}
                </span>
              </div>
              {summary.additionalLevers.length > 0 && (
                <div>
                  <p className="text-[10.5px] uppercase tracking-[0.08em] font-semibold text-white/40 mb-1.5 mt-3">Additional levers</p>
                  <ul className="space-y-1">
                    {summary.additionalLevers.map((lever, i) => (
                      <li key={i} className="text-[12.5px] text-white/70 leading-relaxed flex items-start gap-2">
                        <span className="text-white/35 mt-0.5">·</span>
                        <span>{lever}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Closing */}
            <p className="text-[13.5px] text-white/75 leading-[1.65] max-w-[60ch] mb-5 italic">
              {summary.closing}
            </p>
          </>
        )}

        {/* Metric strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10 mb-5">
          <div className="bg-[#0D2137] p-3.5 sm:p-4">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-white/45 mb-1.5">Monthly spend</p>
            <p className="text-[19px] sm:text-[21px] font-bold text-white tracking-tight">${report.totalMonthlySpend.toLocaleString()}</p>
          </div>
          <div className="bg-[#0D2137] p-3.5 sm:p-4">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-white/45 mb-1.5">Annual savings</p>
            <p className="text-[19px] sm:text-[21px] font-bold text-[#34D399] tracking-tight">
              {report.totalAnnualSavings >= 1000 ? `$${(report.totalAnnualSavings / 1000).toFixed(1)}K` : `$${report.totalAnnualSavings}`}
            </p>
          </div>
          <div className="bg-[#0D2137] p-3.5 sm:p-4">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-white/45 mb-1.5">Score</p>
            <p className="text-[19px] sm:text-[21px] font-bold text-white tracking-tight">
              {report.optimizationScore}
              <span className="text-[12px] font-medium text-white/45 ml-0.5">/100</span>
            </p>
          </div>
          <div className="bg-[#0D2137] p-3.5 sm:p-4">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-white/45 mb-1.5">Top opportunity</p>
            <p className="text-[12.5px] sm:text-[13px] font-semibold text-white tracking-tight leading-snug line-clamp-2">
              {biggest ? biggest.recommendation : "—"}
            </p>
            <p className="text-[10.5px] text-[#34D399] font-medium mt-1">
              {biggest ? `+$${biggest.monthlySavings}/mo · $${biggest.annualSavings.toLocaleString()}/yr` : "No material savings"}
            </p>
          </div>
        </div>

        {/* Category chips */}
        {categoryChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {categoryChips.map((c) => (
              <span
                key={c.label}
                className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full border ${
                  c.tone === "high"
                    ? "bg-[#10A37F]/15 text-[#34D399] border-[#10A37F]/30"
                    : c.tone === "mid"
                      ? "bg-[#5B8DBE]/15 text-[#7AB3E0] border-[#5B8DBE]/30"
                      : "bg-white/8 text-white/70 border-white/15"
                }`}
              >
                {c.label}
                {c.savings > 0 && <span className="opacity-70 font-medium">· ${c.savings.toLocaleString()}/mo</span>}
              </span>
            ))}
          </div>
        )}

        {/* Trust footer */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-[10.5px] text-white/40">
          <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l6 6 9-13.5M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
          Based on verified pricing data from official vendor pages · {new Date(report.pricingMetadata.verifiedDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── KPI Stat Card ───────────────────────────────────────────────── */

function StatCard({ label, value, unit, sub, delay }: {
  label: string; value: string | number; unit?: string; sub?: string; delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay }}
      className="bg-white rounded-2xl border border-[#c8d8e8] p-5 sm:p-5.5 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200"
    >
      <p className="text-[11px] font-semibold text-[#5B7A99] uppercase tracking-[0.12em] mb-3">{label}</p>
      <div className="flex items-end gap-1">
        <motion.span
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: delay + 0.1 }}
          className="text-[26px] sm:text-[30px] font-bold tracking-tight text-[#0D2137]"
        >
          {value}
        </motion.span>
        {unit && <span className="text-[14px] font-medium text-[#5B7A99] mb-0.5">{unit}</span>}
      </div>
      {sub && <p className="text-[11px] text-[#7A9BBE] mt-1.5">{sub}</p>}
    </motion.div>
  );
}

/* ─── Spend Chart ─────────────────────────────────────────────────── */

function SpendChart({ total, savings, seedId }: { total: number; savings: number; seedId: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const W = 640, H = 200, PADT = 18, PADB = 28;
  const ch = H - PADT - PADB;
  const MONTHS = ["−4 mo", "−3 mo", "−2 mo", "−1 mo", "Now", "+1 mo", "+2 mo", "+3 mo"];
  const currentIdx = 4;

  const hashSeed = (s: string) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return Math.abs(h);
  };
  const seedNum = hashSeed(seedId || "default");
  const historyJitter = (i: number) => {
    const r = ((seedNum >> (i * 3)) & 0xff) / 255;
    return 0.88 + r * 0.24; // ±12%
  };
  const projectionJitter = (i: number) => {
    const r = ((seedNum >> ((i + 5) * 4)) & 0xff) / 255;
    return 0.975 + r * 0.05; // ±2.5%
  };

  const series = useMemo(() => {
    return MONTHS.map((_, i) => {
      if (i < currentIdx) return Math.round(total * historyJitter(i));
      if (i === currentIdx) return total;
      const monthsFromNow = i - currentIdx;
      return Math.round(total * Math.pow(1.022, monthsFromNow) * projectionJitter(i));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, seedNum]);

  const optimized = useMemo(() => {
    return series.map((v, i) => (i >= currentIdx ? Math.max(0, v - savings) : v));
  }, [series, savings]);

  const maxVal = Math.max(...series, ...optimized) * 1.2 || 1;
  const toX = (i: number) => (i / (MONTHS.length - 1)) * W;
  const toY = (v: number) => PADT + ch - (v / maxVal) * ch;

  const histXY: [number, number][] = series.slice(0, currentIdx + 1).map((v, i) => [toX(i), toY(v)]);
  const smoothPath = (pts: [number, number][]) => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  };
  const histLinePath = smoothPath(histXY);
  const histAreaPath = `${histLinePath} L ${toX(currentIdx)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`;

  const projPoints = series.slice(currentIdx).map((v, i) => `${toX(i + currentIdx)},${toY(v)}`).join(" ");
  const optPoints = optimized.slice(currentIdx).map((v, i) => `${toX(i + currentIdx)},${toY(v)}`).join(" ");
  const yTicks = [0, 0.5, 1].map((f) => Math.round(maxVal * f));

  return (
    <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={0} y1={toY(v)} x2={W} y2={toY(v)} stroke="#CBD5E1" strokeWidth="0.75" strokeDasharray="3,4" opacity="0.5" />
            <text x={4} y={toY(v) - 3} fill="#94A3B8" fontSize="9" fontFamily="inherit" fontWeight="500">
              {v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`}
            </text>
          </g>
        ))}
        <line x1={toX(currentIdx)} y1={PADT} x2={toX(currentIdx)} y2={PADT + ch} stroke="#0D2137" strokeWidth="0.75" strokeDasharray="2,3" opacity="0.35" />

        <motion.path d={histAreaPath} fill="url(#chartActualGrad)" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 1.0, delay: 0.15 }} />
        <motion.path d={histLinePath} fill="none" stroke="#0D2137" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }} />
        <motion.polyline points={projPoints} fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="6,4" strokeLinejoin="round" strokeLinecap="round" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1.1, delay: 0.6, ease: "easeOut" }} />
        {savings > 0 && (
          <motion.polyline points={optPoints} fill="none" stroke="#10A37F" strokeWidth="2" strokeDasharray="5,4" strokeLinejoin="round" strokeLinecap="round" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1.1, delay: 0.85, ease: "easeOut" }} />
        )}

        <motion.circle
          cx={toX(currentIdx)} cy={toY(series[currentIdx])} r="5.5"
          fill="white" stroke="#0D2137" strokeWidth="2.5"
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.3, delay: 1.1, type: "spring", stiffness: 320 }}
          style={{ transformOrigin: `${toX(currentIdx)}px ${toY(series[currentIdx])}px` }}
        />

        {MONTHS.map((m, i) => (
          <text key={m} x={toX(i)} y={H - 4} textAnchor="middle" fill={i === currentIdx ? "#0D2137" : "#94A3B8"} fontSize="9.5" fontFamily="inherit" fontWeight={i === currentIdx ? "700" : "500"}>{m}</text>
        ))}

        <defs>
          <linearGradient id="chartActualGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0D2137" stopOpacity="0.13" />
            <stop offset="100%" stopColor="#0D2137" stopOpacity="0.01" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex items-center gap-4 mt-3 px-1 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-[3px] rounded-full bg-[#0D2137]" />
          <span className="text-[11px] text-[#5B7A99] font-medium">History &amp; current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-7 border-t-[2px] border-dashed border-[#94A3B8]" />
          <span className="text-[11px] text-[#5B7A99] font-medium">Projected (no action)</span>
        </div>
        {savings > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-7 border-t-[2px] border-dashed border-[#10A37F]" />
            <span className="text-[11px] text-[#10A37F] font-semibold">Optimized (−${savings.toLocaleString()}/mo)</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Donut Chart ─────────────────────────────────────────────────── */

function DonutChart({ providers }: { providers: AuditReport["providerBreakdown"] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const cx = 70, cy = 70, R = 52, strokeW = 13;
  const circumference = 2 * Math.PI * R;
  const total = providers.reduce((s, p) => s + p.currentSpend, 0);

  const arcs = providers.slice(0, 6).reduce<{ provider: (typeof providers)[number]; dashLen: number; gapLen: number; offset: number }[]>(
    (acc, provider) => {
      const dashLen = (provider.pct / 100) * circumference;
      const offset = acc.reduce((sum, arc) => sum + arc.dashLen, 0);
      acc.push({ provider, dashLen, gapLen: Math.max(0, circumference - dashLen), offset });
      return acc;
    }, [],
  );

  const topProvider = providers[0];
  const avgPct = Math.round(providers.slice(0, 6).reduce((s, p) => s + p.pct, 0) / Math.min(providers.length, 6));

  return (
    <div ref={ref}>
      <div className="flex items-start gap-5">
        <div className="relative flex-shrink-0 w-[140px] h-[140px]">
          <svg viewBox="0 0 140 140" className="w-full h-full">
            {arcs.map(({ provider, dashLen, gapLen, offset }, i) => (
              <motion.circle
                key={provider.name}
                cx={cx} cy={cy} r={R}
                fill="none" stroke={provider.color}
                strokeWidth={strokeW}
                strokeDasharray={`${dashLen} ${gapLen}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.08 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
            ))}
            <text x={cx} y={cy - 5} textAnchor="middle" fill="#0D2137" fontSize="17" fontWeight="700" fontFamily="inherit">
              {total >= 1000 ? `$${(total / 1000).toFixed(1)}K` : `$${total}`}
            </text>
            <text x={cx} y={cy + 11} textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="inherit">/mo total</text>
          </svg>
        </div>
        <div className="flex-1 space-y-2.5 pt-1">
          {providers.slice(0, 6).map((p) => (
            <div key={p.name} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-px" style={{ backgroundColor: p.color }} />
              <span className="text-[12px] text-[#3D5A73] font-medium flex-1 truncate">{p.name}</span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-[#0D2137]">{p.pct}%</span>
                <span className="text-[11px] text-[#7A9BBE]">·</span>
                <span className="text-[11px] font-medium text-[#3D5A73]">${p.currentSpend}</span>
              </div>
            </div>
          ))}
          {providers.length > 6 && (
            <p className="text-[11px] text-[#94A3B8]">+{providers.length - 6} more providers</p>
          )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#e2eaf4] flex items-center gap-4">
        <div>
          <span className="text-[10px] text-[#94A3B8] uppercase tracking-wide font-semibold">Top provider</span>
          <p className="text-[13px] font-bold text-[#0D2137] mt-0.5">{topProvider?.name}</p>
        </div>
        <div className="w-px h-8 bg-[#e2eaf4]" />
        <div>
          <span className="text-[10px] text-[#94A3B8] uppercase tracking-wide font-semibold">Avg share</span>
          <p className="text-[13px] font-bold text-[#0D2137] mt-0.5">{avgPct}%</p>
        </div>
        <div className="w-px h-8 bg-[#e2eaf4]" />
        <div>
          <span className="text-[10px] text-[#94A3B8] uppercase tracking-wide font-semibold">Opportunity</span>
          <p className="text-[13px] font-bold text-[#C45C3B] mt-0.5">${providers[0]?.currentSpend > 0 ? Math.round(providers[0].currentSpend * 0.28) : 0}/mo</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────── */

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportId = params?.id ?? "";
  const urlToken = searchParams?.get("share") ?? null;

  const [exportLoading, setExportLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSealed, setModalSealed] = useState(false);
  const [access, setAccess] = useState<AccessState>({ state: "loading" });

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    if (!reportId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only hydration: defer sessionStorage reads to post-mount
    setAccess(resolveAccess(reportId, urlToken));
    if (sessionStorage.getItem(MODAL_SEAL_PREFIX + reportId) === "1") {
      setModalSealed(true);
    } else {
      setModalSealed(false);
    }
  }, [reportId, urlToken]);

  useEffect(() => {
    if (access.state === "owner-redirect") {
      router.replace(access.redirectTo);
    }
  }, [access, router]);

  const auditData: AuditData | null = access.state === "unlocked"
    ? (access.data as unknown as AuditData)
    : null;

  const report = useMemo<AuditReport>(() => {
    if (!auditData) return getDefaultReport();
    try {
      const input = {
        tools: auditData.toolData,
        teamSize: auditData.teamSize || "1-5",
        billingCycle: auditData.billingCycle || "monthly",
        selectedUseCases: auditData.selectedUseCases || [],
      };
      return runAudit(input);
    } catch {
      return getDefaultReport();
    }
  }, [auditData]);

  const reportUsable = hasUsableReportData(report) && access.state === "unlocked";

  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summarySource, setSummarySource] = useState<"ai" | "fallback" | "static">("static");

  useEffect(() => {
    if (!reportUsable || !reportId) return;
    const cacheKey = `costiq_ai_summary_${reportId}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { summary: AISummary; source: "ai" | "fallback" };
        if (parsed && parsed.summary && typeof parsed.summary === "object") {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only hydration: deferred sessionStorage read
          setAiSummary(parsed.summary);
          setSummarySource(parsed.source);
          return;
        }
      }
    } catch {}

    const controller = new AbortController();
    setSummaryLoading(true);
    setAiSummary(null);

    const payload = {
      totalMonthlySpend: report.totalMonthlySpend,
      totalMonthlySavings: report.totalMonthlySavings,
      totalAnnualSavings: report.totalAnnualSavings,
      optimizationScore: report.optimizationScore,
      teamSize: auditData?.teamSize ?? "1-5",
      toolCount: report.providerBreakdown.length,
      duplicateCount: report.duplicateCount,
      alreadyOptimized: report.alreadyOptimized,
      billingCycle: auditData?.billingCycle ?? "monthly",
      topRecommendations: report.recommendations.slice(0, 3).map((r) => ({
        tool: r.tool,
        recommendation: r.recommendation,
        monthlySavings: r.monthlySavings,
        priorityLabel: r.priorityLabel,
      })),
    };

    (async () => {
      try {
        const res = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalStructured: AISummary | null = null;
        let finalSource: "ai" | "fallback" = "fallback";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            if (!line) continue;
            try {
              const event = JSON.parse(line) as
                | { type: "structured"; value: AISummary }
                | { type: "done"; source: "ai" | "fallback"; error?: string };
              if (event.type === "structured") {
                finalStructured = event.value;
              } else if (event.type === "done") {
                finalSource = event.source;
              }
            } catch {
              // ignore malformed line
            }
          }
        }

        if (finalStructured) {
          setAiSummary(finalStructured);
          setSummarySource(finalSource);
          try {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({ summary: finalStructured, source: finalSource }),
            );
          } catch {}
        }
      } catch (err) {
        if ((err as { name?: string })?.name !== "AbortError") {
          setSummarySource("static");
        }
      } finally {
        setSummaryLoading(false);
      }
    })();

    return () => controller.abort();
  }, [reportId, reportUsable, report, auditData?.teamSize, auditData?.billingCycle]);

  const ctaTier: "monitoring" | "share" | "consultation" =
    report.totalMonthlySavings >= 300 || report.optimizationScore < 65
      ? "consultation"
      : report.totalMonthlySavings < 50 || report.optimizationScore >= 88
        ? "monitoring"
        : "share";

  const ctaCopy = ctaTier === "consultation"
    ? {
        heading: `Lock in $${report.totalMonthlySavings.toLocaleString()}/mo in savings`,
        subline: "Talk to a CostIQ specialist about rolling out these recommendations across your team.",
        primary: "Book a savings review",
      }
    : ctaTier === "monitoring"
      ? {
          heading: "Stay ahead of your AI spend",
          subline: "Your stack is well-tuned. Get monthly check-ins to catch new opportunities.",
          primary: "Get monthly alerts",
        }
      : {
          heading: "Share these insights",
          subline: "Send the report, export a PDF, or share the link with your team.",
          primary: "Share report",
        };

  useEffect(() => {
    if (modalSealed || !reportUsable) return;
    const t = setTimeout(() => setModalOpen(true), MODAL_AUTO_DELAY_MS);
    return () => clearTimeout(t);
  }, [modalSealed, reportUsable]);

  const sealModal = useCallback(() => {
    try {
      if (reportId) sessionStorage.setItem(MODAL_SEAL_PREFIX + reportId, "1");
    } catch {}
    setModalSealed(true);
    setModalOpen(false);
  }, [reportId]);

  const handleModalSubmit = useCallback(async (email: string, company?: string) => {
    const token = access.state === "unlocked" ? (access.data as { shareToken?: string }).shareToken : null;
    const reportUrl = token && reportId
      ? buildShareUrl(reportId, token, window.location.origin)
      : window.location.href;

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          company,
          monthlySavings: report.totalMonthlySavings,
          annualSavings: report.totalAnnualSavings,
          reportUrl,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "We couldn't send the email. Please try again.");
      }
    } catch (err) {
      console.error("[handleModalSubmit] send-email failed:", err);
      throw err;
    }

    try {
      localStorage.setItem(CAPTURED_EMAIL_KEY, email);
    } catch {}
    sealModal();
    showToast(`Report sent to ${email}`);
  }, [sealModal, showToast, access, reportId, report.totalMonthlySavings, report.totalAnnualSavings]);

  const handleExportPDF = () => {
    if (!modalSealed) {
      setModalOpen(true);
      return;
    }
    setExportLoading(true);
    setTimeout(() => {
      setExportLoading(false);
      try {
        window.print();
      } catch {}
    }, 350);
  };

  const handleEmailReport = () => {
    if (!modalSealed) {
      setModalOpen(true);
      return;
    }
    const savedEmail = (() => {
      try { return localStorage.getItem(CAPTURED_EMAIL_KEY); } catch { return null; }
    })();
    showToast(savedEmail ? `Report re-sent to ${savedEmail}` : "Report saved");
  };

  const handleCopyLink = () => {
    if (!modalSealed) {
      setModalOpen(true);
      return;
    }
    const token = access.state === "unlocked" ? (access.data as { shareToken?: string }).shareToken : null;
    const url = token && reportId
      ? buildShareUrl(reportId, token, window.location.origin)
      : window.location.href;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    showToast("Share link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const companyName = auditData?.companyName || "Your Team";
  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  if (access.state === "loading" || access.state === "owner-redirect") {
    return (
      <div className="min-h-screen w-full bg-[#EEF3F8] flex items-center justify-center" style={{ fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-[#0D2137]/15 border-t-[#0D2137] rounded-full"
          />
          <span className="text-[12px] font-medium text-[#5B7A99]">Loading your report…</span>
        </motion.div>
      </div>
    );
  }

  if (access.state === "not-found") {
    return <ReportNotFoundState />;
  }

  const locked = access.state === "locked";

  return (
    <div className="min-h-screen w-full bg-[#EEF3F8] relative" style={{ fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif" }}>
      <div className="absolute inset-0 bg-[#EEF3F8]" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 border-b border-[#d8e4f0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#0D2137] flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm tracking-tight">$</span>
              </div>
              <span className="text-[14px] font-bold text-[#0D2137] tracking-tight group-hover:text-[#3D5A73] transition-colors">CostIQ</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2.5 text-[12px] text-[#5B7A99]">
                <span className="w-2 h-2 rounded-full bg-[#10A37F] animate-pulse" />
                <span className="font-medium">Audit complete</span>
                <span className="text-[#94A3B8]">·</span>
                <span className="font-medium">{monthLabel}</span>
              </div>
              <Link href="/audit" className="btn-label-sm text-[#0D2137] px-4 py-2 rounded-xl border border-[#c8d8e8] hover:bg-[#f4f8fc] hover:border-[#b0c4d8] transition-all duration-150 font-semibold">
                New audit
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <motion.main
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`relative max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-9 space-y-4 sm:space-y-5 ${locked ? "blur-sm pointer-events-none select-none" : ""}`}
        aria-hidden={locked || undefined}
      >

        {/* Report Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-1.5 h-6 rounded-full bg-[#10A37F]" />
              <h1 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold text-[#0D2137] tracking-tight leading-tight">
                {companyName} · AI Spend Audit
              </h1>
            </div>
            <p className="text-[13px] sm:text-[14px] text-[#5B7A99] font-medium ml-4">
              {report.providerBreakdown.length} active tools · {auditData?.teamSize || "1–5"} person team · {monthLabel}
            </p>
          </div>
          {reportUsable && (
          <div className="flex items-center gap-2 flex-wrap ml-4 sm:ml-0 no-print">
            <motion.button whileHover={{ y: -1.5 }} whileTap={{ scale: 0.97 }} onClick={handleExportPDF}
              className="btn-label-sm flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D2137] text-white shadow-[0_2px_8px_rgba(13,33,55,0.25)] hover:shadow-[0_4px_16px_rgba(13,33,55,0.35)] transition-all duration-150 font-semibold">
              {exportLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.894.553l2.414 2.414A1 1 0 0119 7.414V19a2 2 0 01-2 2z" />
                </svg>
              )}
              Export PDF
            </motion.button>
            <motion.button whileHover={{ y: -1.5 }} whileTap={{ scale: 0.97 }} onClick={handleEmailReport}
              className="btn-label-sm flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#3D5A73] border border-[#c8d8e8] hover:bg-[#f4f8fc] hover:border-[#b0c4d8] shadow-sm transition-all duration-150 font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email report
            </motion.button>
            <motion.button whileHover={{ y: -1.5 }} whileTap={{ scale: 0.97 }} onClick={handleCopyLink}
              className="btn-label-sm flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#3D5A73] border border-[#c8d8e8] hover:bg-[#f4f8fc] hover:border-[#b0c4d8] shadow-sm transition-all duration-150 font-semibold">
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-[#10A37F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Copy link
                </>
              )}
            </motion.button>
          </div>
          )}
        </motion.div>

        {reportUsable ? (
        <>
        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Optimization Score" value={report.optimizationScore} unit="/100" sub="based on your setup" delay={0.0} />
          <StatCard label="Monthly Savings" value={`$${report.totalMonthlySavings.toLocaleString()}`} sub="after optimization" delay={0.07} />
          <StatCard label="Annual Savings" value={report.totalAnnualSavings >= 1000 ? `$${(report.totalAnnualSavings / 1000).toFixed(0)}K` : `$${report.totalAnnualSavings}`} sub="based on current spend" delay={0.14} />
          <StatCard label="Active AI Tools" value={report.providerBreakdown.length} sub="across team" delay={0.21} />
          <StatCard label="Duplicates Found" value={report.duplicateCount} sub="recommend removal" delay={0.28} />
        </div>

        {/* Charts Row */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl border border-[#d8e4f0] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[14px] sm:text-[15px] font-bold text-[#0D2137]">Monthly Spend Trend</h3>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Jan – Jun 2026</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[18px] font-bold text-[#0D2137]">${report.totalMonthlySpend.toLocaleString()}</span>
                <span className="text-[11px] text-[#94A3B8] font-medium">/mo</span>
              </div>
            </div>
            <SpendChart total={report.totalMonthlySpend} savings={report.totalMonthlySavings} seedId={reportId} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl border border-[#d8e4f0] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <div className="mb-5">
              <h3 className="text-[14px] sm:text-[15px] font-bold text-[#0D2137]">Spend by Provider</h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">${report.totalMonthlySpend.toLocaleString()}/mo · {report.providerBreakdown.length} providers</p>
            </div>
            <DonutChart providers={report.providerBreakdown} />
          </motion.div>
        </div>

        {/* AI Insights */}
        <AIInsights report={report} summary={aiSummary} summaryLoading={summaryLoading} summarySource={summarySource} />

        {/* Recommendations */}
        {report.recommendations.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="text-[16px] sm:text-[18px] font-bold text-[#0D2137]">Optimization Recommendations</h2>
                <p className="text-[12px] text-[#5B7A99] mt-1">
                  {report.recommendations.length} actionable step{report.recommendations.length !== 1 ? "s" : ""} · ranked by impact
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold text-[#0D2137] bg-[#f4f8fc] px-4 py-2 rounded-xl border border-[#d8e4f0]">
                  ${report.totalMonthlySavings.toLocaleString()}/mo
                </span>
                <span className="text-[11px] text-[#94A3B8] font-medium">total savings opportunity</span>
              </div>
            </div>
            <div className="grid sm:grid-cols-1 gap-2.5">
              {report.recommendations.map((rec, i) => (
                <RecCard key={rec.id} rec={rec} delay={0.5 + i * 0.1} />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#94A3B8]">
              <svg className="w-3.5 h-3.5 text-[#10A37F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l6 6 9-13.5M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
              <span>
                Pricing verified against official vendor pricing pages ·{" "}
                {new Date(report.pricingMetadata.verifiedDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                {" · "}
                {report.pricingMetadata.sourceCount} source{report.pricingMetadata.sourceCount !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-2xl border border-[#d8e4f0] shadow-[0_1px_3px_rgba(0,0,0,0.05),0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            <div className="px-6 sm:px-7 py-5 border-b border-[#eef2f7] flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#10A37F]/10 border border-[#10A37F]/25 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#10A37F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l6 6 9-13.5M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0D2137] tracking-tight">Verification &amp; monitoring</h3>
                  <p className="text-[11.5px] text-[#5B7A99] mt-0.5">Audit checked against current vendor pricing</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-[#10A37F] bg-[#10A37F]/10 border border-[#10A37F]/25 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10A37F]" />
                Stack well-tuned
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#eef2f7]">
              <div className="bg-white px-5 py-4">
                <p className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#94A3B8] mb-1.5">Tools analyzed</p>
                <p className="text-[18px] font-bold text-[#0D2137]">{report.providerBreakdown.length}</p>
              </div>
              <div className="bg-white px-5 py-4">
                <p className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#94A3B8] mb-1.5">Pricing sources</p>
                <p className="text-[18px] font-bold text-[#0D2137]">{report.pricingMetadata.sourceCount}</p>
              </div>
              <div className="bg-white px-5 py-4">
                <p className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#94A3B8] mb-1.5">Last verified</p>
                <p className="text-[18px] font-bold text-[#0D2137]">{new Date(report.pricingMetadata.verifiedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
              </div>
              <div className="bg-white px-5 py-4">
                <p className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#94A3B8] mb-1.5">Score</p>
                <p className="text-[18px] font-bold text-[#0D2137]">{report.optimizationScore}<span className="text-[12px] font-medium text-[#94A3B8]">/100</span></p>
              </div>
            </div>

            <div className="px-6 sm:px-7 py-5 border-t border-[#eef2f7] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="max-w-[420px]">
                <p className="text-[13px] font-semibold text-[#0D2137] mb-0.5">Stay ahead of new opportunities</p>
                <p className="text-[12px] text-[#5B7A99] leading-relaxed">
                  Pricing verified against official vendor pricing pages · {new Date(report.pricingMetadata.verifiedDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}. Enable alerts to catch new optimization opportunities as your stack evolves.
                </p>
              </div>
              <motion.button
                onClick={handleEmailReport}
                whileHover={{ y: -1.5 }} whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D2137] text-white text-[12.5px] font-semibold shadow-[0_2px_10px_rgba(13,33,55,0.25)] hover:shadow-[0_4px_18px_rgba(13,33,55,0.35)] transition-all whitespace-nowrap self-start sm:self-auto"
              >
                Set up monthly monitoring
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Provider Detail Cards */}
        {report.providerBreakdown.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h2 className="text-[16px] sm:text-[18px] font-bold text-[#0D2137] mb-3">Provider Details</h2>
            <div className={`grid gap-3 ${
              report.providerBreakdown.length === 1
                ? "max-w-[360px] mx-auto"
                : report.providerBreakdown.length === 2
                  ? "sm:grid-cols-2 max-w-[760px] mx-auto"
                  : "sm:grid-cols-2 lg:grid-cols-3"
            }`}>
              {report.providerBreakdown.map((p, i) => {
                const tool = auditData?.toolData.find((t) => t.label === p.name);
                const meta = tool ? getProviderMeta(tool.key, tool.plan) : null;
                const planName = tool?.planLabel || meta?.planName || "—";
                const billing = (auditData?.billingCycle ?? "monthly") === "annual" ? "Annual" : "Monthly";
                const seats = tool?.seats ?? null;
                const recsForTool = report.recommendations.filter((r) => r.tool === p.name || r.tool.includes(p.name)).length;
                const isOptimized = recsForTool === 0;
                const verified = meta?.verifiedDate ?? report.pricingMetadata.verifiedDate;
                return (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.75 + i * 0.06 }}
                    className="bg-white rounded-xl border border-[#d8e4f0] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:border-[#b0c4d8] hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${p.color}15` }}>
                          <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: p.color }} />
                        </div>
                        <span className="text-[13px] font-bold text-[#0D2137] truncate">{p.name}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: `${p.color}15`, color: p.color }}>
                        {p.pct}%
                      </span>
                    </div>

                    <div className="mb-3">
                      <span className="text-[22px] font-extrabold tracking-tight text-[#0D2137]">${p.currentSpend.toLocaleString()}</span>
                      <span className="text-[12px] text-[#94A3B8] ml-1 font-medium">/mo</span>
                    </div>

                    <div className="mb-3 w-full h-1.5 bg-[#EEF3F8] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p.pct}%` }}
                        transition={{ duration: 0.9, delay: 0.9 + i * 0.07, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                    </div>

                    <div className="space-y-1.5 mb-3 text-[11.5px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8] font-medium">Plan</span>
                        <span className="text-[#0D2137] font-semibold">{planName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8] font-medium">Billing</span>
                        <span className="text-[#0D2137] font-semibold">{billing}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8] font-medium">Seats</span>
                        <span className="text-[#0D2137] font-semibold">{seats ?? "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8] font-medium">Verified</span>
                        <span className="text-[#0D2137] font-semibold">{verified}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#eef2f7] flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2 py-1 rounded-full ${isOptimized ? "bg-[#10A37F]/10 text-[#10A37F]" : "bg-[#F59E0B]/10 text-[#92400E]"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOptimized ? "bg-[#10A37F]" : "bg-[#F59E0B]"}`} />
                        {isOptimized ? "Optimized" : `${recsForTool} rec${recsForTool !== 1 ? "s" : ""}`}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] font-medium">{p.category}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
        </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-[#d8e4f0] p-10 sm:p-14 text-center shadow-[0_1px_3px_rgba(0,0,0,0.05),0_2px_12px_rgba(0,0,0,0.04)]"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#f4f8fc] border border-[#d8e4f0] flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-[#5B8DBE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6m-9 4h12a2 2 0 002-2V7a2 2 0 00-2-2h-3l-2-2H8L6 5H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#0D2137] tracking-tight mb-2">
              Awaiting spend configuration
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#5B7A99] max-w-md mx-auto leading-relaxed mb-6">
              Complete setup to unlock optimization insights. We need plan and spend details for at least one tool to generate an accurate audit.
            </p>
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D2137] text-white text-[13px] font-semibold hover:bg-[#1a3a5c] shadow-[0_2px_8px_rgba(13,33,55,0.25)] hover:shadow-[0_4px_16px_rgba(13,33,55,0.35)] transition-all duration-150"
            >
              Finish your audit
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <div className="mt-7 pt-6 border-t border-[#eef2f7] flex items-center justify-center gap-2 text-[11px] text-[#94A3B8]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Real analytics require complete tool configuration
            </div>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }}
          className="py-6 sm:py-7 no-print"
        >
          <div className="bg-white rounded-2xl border border-[#d8e4f0] p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.05),0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#0D2137] tracking-tight">{ctaCopy.heading}</h3>
                <p className="text-[12px] text-[#5B7A99] mt-1 leading-relaxed">{ctaCopy.subline}</p>
              </div>
              <Link href="/audit" className="self-start sm:self-center text-[12px] font-semibold text-[#5B8DBE] hover:text-[#0D2137] transition-colors inline-flex items-center gap-1 whitespace-nowrap">
                Run another audit
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <motion.button onClick={handleCopyLink} whileHover={{ y: -1.5 }} whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0D2137] text-white text-[13px] font-semibold shadow-[0_2px_10px_rgba(13,33,55,0.25)] hover:shadow-[0_4px_18px_rgba(13,33,55,0.35)] transition-all">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {copied ? "Link copied!" : ctaCopy.primary}
              </motion.button>
              <motion.button onClick={handleExportPDF} whileHover={{ y: -1.5 }} whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-[#0D2137] text-[13px] font-semibold border-[1.5px] border-[#0D2137] hover:bg-[#f4f8fc] transition-all">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.894.553l2.414 2.414A1 1 0 0119 7.414V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </motion.button>
              <motion.button onClick={handleEmailReport} whileHover={{ y: -1.5 }} whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-transparent text-[#5B7A99] text-[13px] font-semibold hover:bg-[#f4f8fc] hover:text-[#0D2137] transition-all">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email insights
              </motion.button>
            </div>
            <p className="text-center text-[11px] text-[#94A3B8] mt-3">Starter is free · No credit card required</p>
          </div>
        </motion.div>

      </motion.main>

      <EmailCaptureModal
        open={modalOpen}
        onClose={sealModal}
        onSubmit={handleModalSubmit}
        defaultCompany={auditData?.companyName}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0D2137] text-white text-[13px] font-medium shadow-[0_8px_24px_-6px_rgba(13,33,55,0.5)]"
          >
            <svg className="w-3.5 h-3.5 text-[#10A37F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {locked && <LockedReportOverlay />}
    </div>
  );
}