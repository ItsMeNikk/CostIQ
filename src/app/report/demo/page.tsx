"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import Link from "next/link";

/* ─── Mock Data ─────────────────────────────────────────────────────── */

const OPT_SCORE = 71;
const MONTHLY_SAVINGS = 1240;
const ANNUAL_SAVINGS = 14880;
const ACTIVE_TOOLS = 7;
const DUPLICATES = 2;

const PROVIDERS = [
  { name: "OpenAI / ChatGPT", spend: 680, pct: 34, trend: "+12%", color: "#10A37F" },
  { name: "Anthropic / Claude", spend: 440, pct: 22, trend: "+5%", color: "#D4A27F" },
  { name: "GitHub Copilot", spend: 380, pct: 19, trend: "+8%", color: "#24292F" },
  { name: "Cursor", spend: 220, pct: 11, trend: "+3%", color: "#1a1a1a" },
  { name: "AWS Bedrock", spend: 190, pct: 9, trend: "+18%", color: "#FF9900" },
  { name: "Gemini", spend: 90, pct: 5, trend: "-2%", color: "#8E75B2" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const SPEND_TREND = [1420, 1580, 1650, 1820, 1980, 2010];
const PROJECTED = [2010, 2120, 2240, 2360, 2480, 2600];

const RECOMMENDATIONS = [
  {
    id: 1,
    provider: "GitHub Copilot",
    action: "Switch Business plan to annual billing",
    saving: 240,
    savingLabel: "/year",
    impact: "high",
    badge: "Quick win",
    badgeColor: "#141414",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: 2,
    provider: "Cursor",
    action: "Downgrade 4 unused Pro seats",
    saving: 80,
    savingLabel: "/mo",
    impact: "medium",
    badge: "Easy fix",
    badgeColor: "#6B91C4",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    id: 3,
    provider: "OpenAI",
    action: "Consolidate overlapping coding tools — remove duplicate subscriptions",
    saving: 480,
    savingLabel: "/mo",
    impact: "high",
    badge: "High impact",
    badgeColor: "#0077b6",
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
  },
  {
    id: 4,
    provider: "Anthropic",
    action: "Move Team plan to annual — unlock ~20% discount",
    saving: 600,
    savingLabel: "/year",
    impact: "medium",
    badge: "Quick win",
    badgeColor: "#141414",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    id: 5,
    provider: "AWS Bedrock",
    action: "Review on-demand usage — switch idle capacity to reserved",
    saving: 220,
    savingLabel: "/mo",
    impact: "low",
    badge: "Consider",
    badgeColor: "#48cae4",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
];

/* ─── Utility Components ─────────────────────────────────────────── */

function StatCard({
  label,
  value,
  unit,
  sub,
  accent,
  delay,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent?: string;
  delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="relative bg-[#ebebeb]/85 backdrop-blur-sm rounded-2xl border border-[#48cae4]/35 p-5 sm:p-6 hover:shadow-[0_8px_30px_rgba(4,102,200,0.12)] hover:border-[#141414]/40 transition-all duration-200 overflow-hidden group"
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 -translate-y-8 translate-x-4"
        style={{ backgroundColor: accent || "#141414" }}
      />
      <p className="text-[11px] font-semibold text-[#03045e]/45 uppercase tracking-[0.14em] mb-3">{label}</p>
      <div className="flex items-end gap-1.5">
        <motion.span
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: delay + 0.1 }}
          className="text-[28px] sm:text-[34px] font-bold tracking-tight"
          style={{ color: accent ? "#03045e" : "#141414" }}
        >
          {value}
        </motion.span>
        {unit && (
          <span className="text-[16px] font-semibold text-[#03045e]/50 mb-1">{unit}</span>
        )}
      </div>
      {sub && (
        <p className="text-[11px] text-[#03045e]/45 mt-1.5 font-medium">{sub}</p>
      )}
    </motion.div>
  );
}

/* ─── SVG Area Chart (no external deps) ────────────────────────────── */

function SpendAreaChart() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const W = 600, H = 180, PADL = 0, PADR = 0, PADT = 10, PADB = 30;
  const cw = W - PADL - PADR;
  const ch = H - PADT - PADB;

  const maxVal = 2700;
  const toX = (i: number) => PADL + (i / (MONTHS.length - 1)) * cw;
  const toY = (v: number) => PADT + ch - (v / maxVal) * ch;

  const actual = SPEND_TREND.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const proj = PROJECTED.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const area = `0,${toY(0)} ${actual} ${toX(MONTHS.length - 1)},${toY(0)}`;
  const projArea = `0,${toY(0)} ${proj} ${toX(MONTHS.length - 1)},${toY(0)}`;

  return (
    <div ref={ref} className="relative w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {[500, 1000, 1500, 2000, 2500].map((v) => (
          <g key={v}>
            <line
              x1={PADL} y1={toY(v)} x2={W - PADR} y2={toY(v)}
              stroke="#48cae4" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.4"
            />
            <text x={PADL + 2} y={toY(v) - 4} fill="#03045e" fillOpacity="0.35" fontSize="8" fontFamily="sans-serif">
              {v >= 1000 ? `$${v / 1000}k` : `$${v}`}
            </text>
          </g>
        ))}

        {/* Projected area (faded) */}
        <motion.polygon
          points={projArea}
          fill="url(#projGrad)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        />

        {/* Actual area (solid) */}
        <motion.polygon
          points={area}
          fill="url(#actualGrad)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Actual line */}
        <motion.polyline
          points={actual}
          fill="none"
          stroke="#141414"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.1 }}
        />

        {/* Projected line */}
        <motion.polyline
          points={proj}
          fill="none"
          stroke="#48cae4"
          strokeWidth="1.5"
          strokeDasharray="5,3"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.5 }}
        />

        {/* Data points */}
        {SPEND_TREND.map((v, i) => (
          <motion.circle
            key={i}
            cx={toX(i)} cy={toY(v)} r="4"
            fill="#141414"
            stroke="white"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.6 + i * 0.1, type: "spring", stiffness: 300 }}
          />
        ))}

        {/* Month labels */}
        {MONTHS.map((m, i) => (
          <text key={m} x={toX(i)} y={H - 5} textAnchor="middle" fill="#03045e" fillOpacity="0.4" fontSize="9" fontFamily="sans-serif">
            {m}
          </text>
        ))}

        <defs>
          <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#141414" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#141414" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#48cae4" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#48cae4" stopOpacity="0.01" />
          </linearGradient>
        </defs>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 rounded-full bg-[#141414]" />
          <span className="text-[11px] text-[#03045e]/50 font-medium">Current spend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 rounded-full bg-[#48cae4] border-dashed" style={{ borderBottom: "1.5px dashed #48cae4" }} />
          <span className="text-[11px] text-[#03045e]/50 font-medium">Projected (no action)</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Donut Chart (SVG) ────────────────────────────────────────────── */

function DonutChart() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const cx = 60, cy = 60, R = 48, strokeW = 14;
  const circumference = 2 * Math.PI * R;

  const arcs = useMemo(
    () =>
      PROVIDERS.reduce<{ provider: (typeof PROVIDERS)[number]; dashLen: number; gapLen: number; offset: number }[]>(
        (acc, provider) => {
          const dashLen = (provider.pct / 100) * circumference;
          const offset = acc.reduce((sum, arc) => sum + arc.dashLen, 0);
          acc.push({ provider, dashLen, gapLen: circumference - dashLen, offset });
          return acc;
        },
        [],
      ),
    [circumference],
  );

  return (
    <div ref={ref} className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-[120px] h-[120px] flex-shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          {arcs.map(({ provider, dashLen, gapLen, offset }, i) => (
              <motion.circle
                key={provider.name}
                cx={cx} cy={cy} r={R}
                fill="none"
                stroke={provider.color}
                strokeWidth={strokeW}
                strokeDasharray={`${dashLen} ${gapLen}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" fill="#03045e" fontSize="16" fontWeight="700" fontFamily="sans-serif">
            $2K
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#03045e" fillOpacity="0.4" fontSize="8" fontFamily="sans-serif">
            /mo total
          </text>
        </svg>
      </div>
      <div className="space-y-2 w-full">
        {PROVIDERS.slice(0, 5).map((p) => (
          <div key={p.name} className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-[12px] text-[#03045e]/65 font-medium flex-1 truncate">{p.name}</span>
            <span className="text-[12px] font-bold text-[#03045e]">${p.spend}</span>
            <span className="text-[10px] text-[#03045e]/40 font-medium">/mo</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────── */

export default function ReportDemoPage() {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExportPDF = () => {
    setExportLoading(true);
    setTimeout(() => setExportLoading(false), 1500);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#b8e4ee] relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[#b8e4ee]" />
      <div className="absolute inset-0 grid-bg opacity-10" />

      {/* Nav */}
      <div className="sticky top-0 z-50 bg-[#ebebeb]/80 backdrop-blur-xl border-b border-[#48cae4]/25">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-xl bg-[#141414] flex items-center justify-center shadow-btn-primary">
                <span className="text-white font-bold text-xs">$</span>
              </div>
              <span className="text-[14px] font-semibold text-[#03045e] group-hover:text-[#141414] transition-colors">CostIQ</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-[12px] text-[#03045e]/50">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Audit complete · May 2026
              </div>
              <Link
                href="/audit"
                className="btn-label-sm text-[#141414] px-3.5 py-1.5 rounded-xl border border-[#141414]/30 hover:bg-[#141414]/8 transition-colors"
              >
                New audit
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-[24px] sm:text-[30px] font-bold text-[#03045e] tracking-tight mb-1">
              Audit Report · Relay AI
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#03045e]/55 font-medium">
              Based on 7 AI tools, 12-person team · May 2026
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleExportPDF}
              className="btn-label-sm flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141414] text-white shadow-[0_4px_14px_rgba(4,102,200,0.3)] hover:shadow-[0_6px_20px_rgba(4,102,200,0.4)] transition-all duration-200"
            >
              {exportLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.894.553l2.414 2.414A1 1 0 0119 7.414V19a2 2 0 01-2 2z" />
                </svg>
              )}
              Export PDF
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-label-sm flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ebebeb]/80 border border-[#48cae4]/40 text-[#03045e] hover:bg-[#f5f6f8] hover:shadow-card transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Copy link
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-label-sm flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ebebeb]/80 border border-[#48cae4]/40 text-[#03045e] hover:bg-[#f5f6f8] hover:shadow-card transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email report
            </motion.button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard label="Optimization score" value={OPT_SCORE} unit="/100" accent="#141414" delay={0.0} />
          <StatCard label="Est. monthly savings" value={`$${MONTHLY_SAVINGS.toLocaleString()}`} sub="after optimization" accent="#10A37F" delay={0.08} />
          <StatCard label="Est. annual savings" value={`$${ANNUAL_SAVINGS.toLocaleString()}`} sub="based on current spend" accent="#10A37F" delay={0.16} />
          <StatCard label="Active AI tools" value={ACTIVE_TOOLS} sub="across team" accent="#6B91C4" delay={0.24} />
          <StatCard label="Duplicates found" value={DUPLICATES} sub="recommend removal" accent="#DC2626" delay={0.32} />
        </div>

        {/* Charts Row */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Spend Trend */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#ebebeb]/85 backdrop-blur-sm rounded-2xl border border-[#48cae4]/35 p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#03045e]">AI spend overview</h3>
                <p className="text-[11px] text-[#03045e]/45 mt-0.5">Monthly trend · Jan–Jun 2026</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[20px] font-bold text-[#141414]">$2,010</span>
                <span className="text-[11px] text-[#03045e]/45">/mo</span>
              </div>
            </div>
            <SpendAreaChart />
          </motion.div>

          {/* Provider Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#ebebeb]/85 backdrop-blur-sm rounded-2xl border border-[#48cae4]/35 p-5 sm:p-6"
          >
            <div className="mb-5">
              <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#03045e]">Spend by provider</h3>
              <p className="text-[11px] text-[#03045e]/45 mt-0.5">$2,010/mo total · 6 providers</p>
            </div>
            <DonutChart />
          </motion.div>
        </div>

        {/* AI Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative bg-[#023e8a] rounded-2xl p-6 sm:p-8 overflow-hidden"
        >
          <div className="absolute inset-0">
            <div className="absolute top-[-30%] left-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] right-[-5%] w-[200px] h-[200px] bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">AI-generated summary</span>
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="text-[10px] text-white/50">Based on your setup</span>
              </div>
              <p className="text-[14px] sm:text-[15px] text-white font-medium leading-relaxed">
                Your team is spending <span className="font-bold text-white">$2,010/month</span> on AI tools — with significant room to optimize. Consolidating overlapping subscriptions, switching to annual billing, and removing 4 unused seats could reduce that by <span className="font-bold text-white">62%</span>, saving roughly <span className="font-bold text-white">$14,880/year</span>. The biggest wins are in your coding tool stack.
              </p>
              <div className="flex items-center gap-3 mt-5">
                {["$14,880/yr potential", "5 actionable steps", "32% waste detected"].map((tag) => (
                  <span key={tag} className="text-[11px] font-medium text-white/70 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-[#ebebeb]/85 backdrop-blur-sm rounded-2xl border border-[#48cae4]/35 p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#03045e]">Optimization recommendations</h3>
              <p className="text-[12px] text-[#03045e]/45 mt-0.5">5 actionable steps ranked by impact</p>
            </div>
            <span className="text-[12px] font-bold text-[#141414] bg-[#141414]/8 px-3 py-1.5 rounded-full border border-[#141414]/15">
              ${MONTHLY_SAVINGS.toLocaleString()}/mo savings
            </span>
          </div>

          <div className="space-y-3">
            {RECOMMENDATIONS.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-4 p-4 bg-[#ebebeb]/60 rounded-xl border border-[#48cae4]/25 hover:border-[#141414]/35 hover:shadow-[0_2px_12px_rgba(4,102,200,0.08)] transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${rec.badgeColor}14` }}>
                  <svg className="w-4 h-4" style={{ color: rec.badgeColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={rec.icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-bold text-[#03045e]/55">{rec.provider}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${rec.badgeColor}15`, color: rec.badgeColor }}>
                      {rec.badge}
                    </span>
                  </div>
                  <p className="text-[13px] sm:text-[14px] font-medium text-[#03045e] leading-snug">{rec.action}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-[16px] sm:text-[18px] font-bold text-[#10A37F]">${rec.saving}</span>
                  <span className="text-[10px] text-[#10A37F]/60 font-medium block">{rec.savingLabel}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Provider Detail Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {PROVIDERS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.07 }}
              className="bg-[#ebebeb]/85 backdrop-blur-sm rounded-2xl border border-[#48cae4]/35 p-5 hover:border-[#141414]/40 hover:shadow-[0_4px_20px_rgba(4,102,200,0.1)] transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${p.color}18` }}>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: p.color }} />
                  </div>
                  <span className="text-[13px] font-semibold text-[#03045e]">{p.name}</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${p.color}15`, color: p.color }}>
                  {p.trend}
                </span>
              </div>
              <div className="mb-3">
                <span className="text-[24px] font-bold text-[#03045e]">${p.spend}</span>
                <span className="text-[12px] text-[#03045e]/45 ml-1">/mo</span>
              </div>
              <div className="mb-1.5">
                <div className="w-full h-1.5 bg-[#48cae4]/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.8 + i * 0.07 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#03045e]/45">{p.pct}% of total spend</span>
                <span className="text-[11px] font-semibold text-[#141414]">
                  {p.spend >= 400 ? "Review pricing" : "On track"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="text-center py-6 sm:py-8"
        >
          <p className="text-[13px] text-[#03045e]/45 mb-4">Ready to implement these savings?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.a
              href="/audit"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-label-xs inline-flex items-center gap-3 px-7 py-3.5 rounded-xl bg-[#141414] text-white shadow-[0_4px_16px_rgba(4,102,200,0.35)] hover:shadow-[0_6px_24px_rgba(4,102,200,0.45)] transition-all duration-200"
            >
              Run another audit
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.a>
            <span className="text-[11px] text-[#03045e]/40">Starter is free · No credit card</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}