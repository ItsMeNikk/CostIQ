"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    label: "Add your stack",
    title: "Tell us about your AI setup",
    description: "Select the AI tools your team uses — ChatGPT, Claude, Cursor, Copilot, Gemini, and more. Enter your current plan, monthly spend, and team size. We estimate based on typical startup usage if exact numbers aren't available.",
    detail: "Covers all major AI tools",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
  },
  {
    number: "02",
    label: "Audit",
    title: "CostIQ analyzes your spend",
    description: "Our audit engine reviews your setup against current pricing across plans, identifies redundancies, flags overpriced tiers, and surfaces cheaper alternatives with equivalent or better capabilities for your use case.",
    detail: "Real data, not guesswork",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />,
  },
  {
    number: "03",
    label: "Get your report",
    title: "Receive a personalized audit",
    description: "Get a clean, shareable report with your optimization score, per-tool savings breakdown, monthly vs annual projections, and a plain-English AI summary of the biggest opportunities for your team.",
    detail: "Shareable in one click",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#B8C4CE]/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#C5D0D8]/60 to-[#C5D0D8]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div ref={ref} className="text-center mb-12 sm:mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4A70B0] mb-4"
          >
            <span className="w-1.5 h-1.5 bg-[#4A70B0] rounded-full" />
            How it works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[28px] xs:text-[32px] sm:text-[36px] md:text-[48px] font-bold tracking-tight text-[#04080F] mb-3 sm:mb-4"
          >
            From chaos to clarity in{" "}
            <span className="text-[#4A70B0]">minutes</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[14px] sm:text-[15px] md:text-[16px] text-[#04080F]/60 max-w-lg mx-auto font-light px-2"
          >
            Add your stack, get an audit. That's it. No API keys, no integration, no waiting.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-3 gap-5 sm:gap-4 md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.18 }}
              className="relative"
            >
              {/* Connector between steps */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-10 z-10 items-center right-[-1.5rem] w-[3rem]">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.18 }}
                    className="flex-1 h-px bg-gradient-to-r from-[#4A70B0]/50 to-[#8BB4DC]/30 origin-left"
                  />
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.7 + i * 0.18 }}
                    className="w-2 h-2 rounded-full bg-[#8BB4DC]/50"
                  />
                </div>
              )}

              <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-[#A8BDE0]/40 p-6 sm:p-7 md:p-8 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 group overflow-hidden">
                {/* Step badge */}
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A70B0]/10 to-[#8BB4DC]/10 border border-[#4A70B0]/15 flex items-center justify-center group-hover:border-[#4A70B0]/30 group-hover:from-[#4A70B0]/15 transition-all duration-200">
                    <svg className="w-5 h-5 text-[#4A70B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      {step.icon}
                    </svg>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-[#4A70B0] bg-[#4A70B0]/8 px-2 py-0.5 rounded-md border border-[#4A70B0]/15 w-fit">{step.number}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#04080F]/45">{step.label}</span>
                  </div>
                </div>

                <h3 className="text-[16px] sm:text-[18px] md:text-[20px] font-semibold text-[#04080F] mb-2.5 tracking-tight leading-tight">{step.title}</h3>
                <p className="text-[13px] sm:text-[14px] text-[#04080F]/55 leading-relaxed mb-5 font-light">{step.description}</p>

                <div className="flex items-center gap-2 mt-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4A70B0]/30" />
                  <span className="text-[12px] text-[#4A70B0] font-medium bg-[#4A70B0]/8 px-3 py-1.5 rounded-lg border border-[#4A70B0]/15">
                    {step.detail}
                  </span>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#4A70B0]/15 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-10 gap-y-3"
        >
          {[
            { icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", text: "100% private — no data stored" },
            { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", text: "Audit ready in under 2 minutes" },
            { icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.877a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z", text: "Trusted by 2,400+ teams" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-[12px] sm:text-[13px] text-[#04080F]/55 font-medium">
              <svg className="w-4 h-4 text-[#4A70B0] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}