"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />,
    title: "Comprehensive AI audit",
    description: "Add every AI tool — we benchmark your plans against alternatives to find where you're overpaying.",
    badge: "10–30 min setup",
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />,
    title: "Savings breakdown",
    description: "See exactly how much you can save per tool, per month — with specific actions ranked by impact.",
    badge: "Up to 60% savings",
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />,
    title: "Plan optimization",
    description: "Know if you're on the right tier. Switch tiers, enable team plans, or go annual — we tell you what saves the most.",
    badge: "Per-plan analysis",
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
    title: "Team cost attribution",
    description: "See which tools and functions are driving spend — by seat, by team, by month.",
    badge: "Per-seat tracking",
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
    title: "Shareable audit reports",
    description: "Export a clean PDF or share a link. Hand it to finance, leadership, or your board.",
    badge: "PDF + shareable link",
  },
  {
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
    title: "AI-generated summary",
    description: "Every audit comes with a plain-English breakdown of the biggest wins for your team size and use case.",
    badge: "Plain-English",
  },
];

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
{/* Solid background */}
      <div className="absolute inset-0 bg-[#d8eef4]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div ref={ref} className="text-center mb-12 sm:mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#141414] mb-4"
          >
            <span className="w-1.5 h-1.5 bg-[#141414] rounded-full" />
            What you get
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[28px] xs:text-[32px] sm:text-[36px] md:text-[48px] font-bold tracking-tight text-[#03045e] mb-3 sm:mb-4"
          >
            Everything you need to{" "}
            <span className="text-[#141414]">stop overpaying</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[14px] sm:text-[15px] md:text-[16px] text-[#03045e]/70 max-w-xl mx-auto font-medium px-2"
          >
            From first input to actionable report — no integrations, no API keys, no engineering time required.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className="group relative bg-[#ebebeb]/85 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-[#48cae4]/35 p-5 sm:p-7 hover:border-[#141414]/40 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden"
            >
              {/* Badge */}
              <span className="absolute top-4 sm:top-5 right-4 sm:right-5 text-[10px] font-semibold uppercase tracking-wider text-[#141414] bg-[#141414]/8 px-2.5 py-1 rounded-full border border-[#141414]/15">
                {feature.badge}
              </span>

              {/* Icon */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#48cae4]/15 border border-[#48cae4]/30 flex items-center justify-center mb-5 group-hover:bg-[#141414]/10 group-hover:border-[#141414]/25 transition-all duration-200">
                <svg className="w-[18px] h-[18px] text-[#03045e]/45 group-hover:text-[#141414] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {feature.icon}
                </svg>
              </div>

              <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#03045e] mb-2 pr-12 sm:pr-0">{feature.title}</h3>
              <p className="text-[13px] sm:text-[14px] text-[#03045e] font-medium leading-relaxed">{feature.description}</p>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-6 right-6 h-px bg-[#141414]/25 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}