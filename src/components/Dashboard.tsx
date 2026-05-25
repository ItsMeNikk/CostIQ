"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useId, useMemo } from "react";

function useFloatCount(end: number, decimals: number, duration: number = 2000, inView: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(parseFloat(start.toFixed(decimals)));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, decimals, inView]);
  return count;
}

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0, className = "" }: {
  value: number; prefix?: string; suffix?: string; decimals?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useFloatCount(value, decimals, 2000, inView);
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}{count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

function DonutChart({ segments, size = 120, strokeWidth = 18 }: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const arcs = useMemo(
    () =>
      segments.reduce<
        { seg: (typeof segments)[number]; dashLen: number; dashGap: number; segOffset: number }[]
      >((acc, seg) => {
        const dashLen = (seg.value / total) * circumference;
        const segOffset = acc.reduce((sum, arc) => sum + arc.dashLen, 0);
        acc.push({ seg, dashLen, dashGap: circumference - dashLen, segOffset });
        return acc;
      }, []),
    [segments, total, circumference],
  );

  return (
    <div ref={ref} className="flex items-center gap-5">
      <svg width={size} height={size} className="transform -rotate-90">
        {arcs.map(({ seg, dashLen, dashGap, segOffset }) => (
            <motion.circle
              key={seg.label}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLen} ${dashGap}`}
              strokeDashoffset={-segOffset}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={inView ? { strokeDashoffset: -segOffset } : {}}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              className="transition-all duration-200"
            />
        ))}
        <circle cx={cx} cy={cy} r={radius - strokeWidth / 2 - 4} fill="transparent" />
      </svg>
      <div className="space-y-2">
        {segments.map((seg) => {
          const pct = Math.round((seg.value / total) * 100);
          return (
            <div key={seg.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[11px] text-[#03045e]/60 font-medium">{seg.label}</span>
              <span className="text-[11px] text-[#03045e]/45 ml-auto pl-4 font-mono">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AreaChart({ data, width = 320, height = 80 }: { data: number[]; width?: number; height?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const gradientId = `areaGrad${useId().replace(/:/g, "")}`;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 4;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * (width - padding * 2) + padding,
    y: (1 - (v - min) / range) * (height - padding * 2) + padding,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg ref={ref as React.Ref<SVGSVGElement>} width={width} height={height} className="max-w-full h-auto overflow-hidden">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141414" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#141414" stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path
        d={areaPath}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke="#141414"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={inView ? { pathLength: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
      />
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={2.5}
          fill="#141414"
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.8 + i * 0.04 }}
        />
      ))}
    </svg>
  );
}

const providerBreakdown = [
  { label: "ChatGPT", value: 480, color: "#141414" },
  { label: "Claude", value: 340, color: "#48cae4" },
  { label: "Cursor", value: 220, color: "#00b4d8" },
  { label: "Copilot", value: 180, color: "#6B91C4" },
];

const monthlyTrend = [1840, 2100, 1950, 2400, 2280, 2650, 2890, 2720, 3045, 3180, 2950, 3045];
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const recommendations = [
  {
    id: 1,
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    text: "Switch 68% of ChatGPT Plus seats to Team plan — same features, 33% cheaper per seat",
    savings: "$142/mo",
    priority: "high",
    tool: "ChatGPT",
    toolColor: "#141414",
  },
  {
    id: 2,
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    text: "Cursor Teams plan includes bulk seat pricing — consolidate 6 individual seats to save",
    savings: "$89/mo",
    priority: "high",
    tool: "Cursor",
    toolColor: "#48cae4",
  },
  {
    id: 3,
    icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
    text: "GitHub Copilot Business has 40% off annual — switch billing to save $210/yr",
    savings: "$210/yr",
    priority: "medium",
    tool: "Copilot",
    toolColor: "#48cae4",
  },
  {
    id: 4,
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    text: "You have 3 idle Claude seats (no activity in 30 days) — downgrade or remove",
    savings: "$60/mo",
    priority: "medium",
    tool: "Claude",
    toolColor: "#6B91C4",
  },
];

const aiInsights = [
  {
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    text: "Moving ChatGPT to Team plan across your 8 seats would save $1,704/year without reducing access.",
    severity: "warning",
  },
  {
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    text: "Your Copilot Business plan ends Dec 15. Annual billing saves $210 — renewal notice sent.",
    severity: "success",
  },
  {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    text: "Cursor usage is up 3× since Oct. Team plan pricing caps at 20 seats — you're at 6.",
    severity: "info",
  },
];

export default function Dashboard() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="dashboard" className="relative overflow-hidden py-16 sm:py-20 md:py-24">
{/* Solid background */}
      <div className="absolute inset-0 bg-[#b8e4ee]" />
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div ref={ref} className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#141414] mb-4"
          >
            <span className="w-1.5 h-1.5 bg-[#141414] rounded-full animate-pulse" />
            Sample audit report
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[28px] xs:text-[32px] sm:text-[36px] md:text-[48px] font-bold tracking-tight text-[#03045e] mb-3 sm:mb-4"
          >
            Your audit report,{" "}
            <span className="text-[#141414]">ready in 2 minutes</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[14px] sm:text-[15px] md:text-[16px] text-[#03045e]/60 max-w-xl mx-auto font-light px-2"
          >
            A real sample for a typical startup. Add your team&apos;s tools and plans — yours will look exactly like this.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="bg-white/92 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-[#00b4d8]/40 shadow-soft-xl overflow-hidden"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-[#00b4d8]/20 bg-[#90e0ef]/50">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFD93D]/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#6BCB77]/60" />
            </div>
            <div className="flex-1 mx-3 sm:mx-5">
              <div className="bg-white/80 rounded-lg px-3 py-1 text-[10px] sm:text-[11px] text-[#03045e]/40 font-mono text-center border border-[#00b4d8]/20 flex items-center justify-center gap-1.5">
                <svg className="w-2.5 h-2.5 text-[#141414]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                costiq.io/audit/preview
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-[#48cae4]/20 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-[#03045e]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <div className="w-5 h-5 rounded bg-[#48cae4]/20 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-[#03045e]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 md:p-7">
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-5 sm:mb-7">
              {[
                {
                  label: "Total Monthly AI Spend",
                  value: <AnimatedNumber value={1220} prefix="$" decimals={0} />,
                  sub: "Across 4 tools",
                  color: "text-[#03045e]",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
                },
                {
                  label: "Potential Savings",
                  value: <AnimatedNumber value={491} prefix="$" decimals={0} />,
                  sub: "From recommended actions",
                  color: "text-[#141414]",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
                },
                {
                  label: "Optimization Score",
                  value: "58",
                  sub: "out of 100 — room to improve",
                  color: "text-[#48cae4]",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
                },
                {
                  label: "Team Size",
                  value: "8",
                  sub: "seats across all tools",
                  color: "text-[#03045e]",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
                },
              ].map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                  className="bg-[#90e0ef]/15 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#00b4d8]/20 hover:border-[#141414]/25 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[10px] sm:text-[11px] text-[#03045e]/50 font-medium tracking-wide leading-tight">{kpi.label}</p>
                    <div className="w-6 h-6 rounded-lg bg-[#48cae4]/15 flex items-center justify-center group-hover:bg-[#141414]/10 transition-colors">
                      <svg className="w-3 h-3 text-[#03045e]/40 group-hover:text-[#141414] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        {kpi.icon}
                      </svg>
                    </div>
                  </div>
                  <p className={`text-[18px] sm:text-[22px] font-bold ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-[9px] sm:text-[10px] text-[#03045e]/40 mt-0.5 leading-tight">{kpi.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Main content */}
            <div className="grid lg:grid-cols-5 gap-4 sm:gap-5">
              <div className="lg:col-span-3 space-y-4 sm:space-y-5">
                {/* Spend trend */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-[#90e0ef]/10 rounded-2xl border border-[#00b4d8]/25 p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-[13px] sm:text-[14px] font-semibold text-[#03045e]">Estimated monthly spend trend</h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                        <span className="text-[11px] text-[#141414] font-semibold">+$1,205 from last year</span>
                        <span className="text-[11px] text-[#03045e]/45">— based on typical startup growth</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full max-w-full overflow-hidden">
                    <AreaChart data={monthlyTrend} width={320} height={80} />
                  </div>
                  <div className="flex flex-wrap justify-between gap-x-1 gap-y-0.5 mt-2">
                    {monthLabels.map((m, i) => (
                      <span key={m} className={`text-[8px] sm:text-[9px] ${i === 11 ? "text-[#141414] font-medium" : "text-[#03045e]/35"}`}>{m}</span>
                    ))}
                  </div>
                </motion.div>

                {/* Tool breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="bg-[#90e0ef]/10 rounded-2xl border border-[#00b4d8]/25 p-4 sm:p-5"
                >
                  <h4 className="text-[13px] sm:text-[14px] font-semibold text-[#03045e] mb-4">Spend by tool</h4>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <DonutChart segments={providerBreakdown} size={90} strokeWidth={14} />
                    <div className="flex-1 space-y-2.5">
                      {providerBreakdown.map((seg, i) => {
                        const pct = seg.value / providerBreakdown.reduce((s, x) => s + x.value, 0);
                        return (
                          <div key={seg.label} className="flex items-center gap-2">
                            <div className="w-16 text-[11px] text-[#03045e]/60 font-medium">{seg.label}</div>
                            <div className="flex-1 h-1 bg-[#48cae4]/15 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={inView ? { width: `${pct * 100}%` } : {}}
                                transition={{ duration: 0.6, delay: 0.9 + i * 0.1 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: seg.color }}
                              />
                            </div>
                            <div className="text-[11px] text-[#03045e]/55 font-mono w-12 text-right">${seg.value}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="lg:col-span-2 space-y-4 sm:space-y-5">
                {/* Recommendations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.65 }}
                  className="bg-[#90e0ef]/10 rounded-2xl border border-[#00b4d8]/25 p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="text-[13px] sm:text-[14px] font-semibold text-[#03045e]">Your recommendations</h4>
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#141414] tabular-nums">
                      <AnimatedNumber value={491} prefix="$" /> <span className="text-[#03045e]/45 font-normal">/mo</span>
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {recommendations.map((rec, i) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, x: 15 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.4, delay: 0.75 + i * 0.08 }}
                        className="group flex items-start gap-2.5 p-2.5 bg-white/60 rounded-xl border border-[#00b4d8]/20 hover:border-[#141414]/30 hover:bg-white transition-all duration-200 cursor-default"
                      >
                        <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center ${
                          rec.priority === "high" ? "bg-[#141414]/10" : "bg-[#48cae4]/10"
                        }`}>
                          <svg className={`w-3 h-3 ${rec.priority === "high" ? "text-[#141414]" : "text-[#48cae4]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={rec.icon} />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] sm:text-[12px] text-[#03045e]/75 leading-relaxed">{rec.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/80 border border-[#00b4d8]/25" style={{ color: rec.toolColor }}>
                              {rec.tool}
                            </span>
                            <span className={`text-[11px] sm:text-[12px] font-bold ${rec.priority === "high" ? "text-[#141414]" : "text-[#48cae4]"}`}>
                              {rec.savings}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* AI Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="bg-[#141414]/10 rounded-2xl border border-[#141414]/20 p-4 sm:p-5"
                >
                  <div className="flex items-center gap-2 mb-3.5">
                    <div className="w-5 h-5 rounded-lg bg-[#141414]/15 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-[#141414]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="text-[12px] sm:text-[13px] font-semibold text-[#141414]">AI-generated summary</h4>
                  </div>
                  <div className="space-y-2.5">
                    {aiInsights.map((insight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.4, delay: 0.9 + i * 0.1 }}
                        className="flex items-start gap-2.5"
                      >
                        <div className={`w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5 ${
                          insight.severity === "warning" ? "bg-amber-50 border border-amber-200" :
                          insight.severity === "success" ? "bg-green-50 border border-green-200" :
                          "bg-blue-50 border border-blue-200"
                        }`}>
                          <svg className={`w-2.5 h-2.5 ${
                            insight.severity === "warning" ? "text-amber-500" :
                            insight.severity === "success" ? "text-green-500" :
                            "text-blue-500"
                          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={insight.icon} />
                          </svg>
                        </div>
                        <p className="text-[11px] sm:text-[12px] text-[#03045e]/65 leading-relaxed font-light">{insight.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}