"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    quote: "We were burning $12k/month on AI tools without realizing it. CostIQ showed us we could get the same output from cheaper tiers on half of them. Paid for itself in the first audit.",
    author: "Yuki Tanaka",
    role: "CTO",
    company: "Relay AI",
    team: "12-person team",
    savings: "$680/mo",
    initials: "YT",
    color: "#4A70B0",
  },
  {
    quote: "Our finance team kept asking where the AI budget was going. CostIQ gave them a report they could actually understand — and engineering concrete actions, not just a spreadsheet.",
    author: "Priya Sharma",
    role: "Head of Product",
    company: "Stackline",
    team: "25-person team",
    savings: "$1,240/mo",
    initials: "PS",
    color: "#8BB4DC",
  },
  {
    quote: "The recommendations are specific. 'Switch from Pro to Team plan' — not 'consider exploring alternatives.' That's the difference between a real tool and a generic advisory.",
    author: "Felix Wagner",
    role: "Lead Engineer",
    company: "Orbit Analytics",
    team: "8-person team",
    savings: "$340/mo",
    initials: "FW",
    color: "#A8BDE0",
  },
];

const stats = [
  { value: "2,400+", label: "Teams audited" },
  { value: "$4.2M+", label: "Monthly spend tracked" },
  { value: "38%", label: "Avg savings found" },
  { value: "< 2 min", label: "Time to first insight" },
];

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#C5D0D8]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#B8C4CE]/50 to-[#B8C4CE]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Stats row */}
        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16 md:mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center p-4 sm:p-5 bg-white/75 backdrop-blur-sm rounded-2xl border border-[#A8BDE0]/30 shadow-card"
            >
              <p className="text-[22px] sm:text-[28px] md:text-[34px] font-bold text-[#4A70B0] mb-0.5 tracking-tight">
                {stat.value}
              </p>
              <p className="text-[11px] sm:text-[12px] text-[#04080F]/50 font-medium tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonial cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.12 }}
              className="bg-white/85 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-[#A8BDE0]/35 hover:border-[#4A70B0]/40 hover:shadow-card-hover transition-all duration-200 flex flex-col"
            >
              {/* Stars + savings badge */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-3 h-3 text-[#4A70B0]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#4A70B0] bg-[#4A70B0]/8 px-2.5 py-1 rounded-full border border-[#4A70B0]/15">
                  {t.savings} saved/mo
                </span>
              </div>

              <blockquote className="text-[13px] sm:text-[14px] text-[#04080F] font-medium leading-relaxed mb-5 flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#A8BDE0]/20">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[12px] shadow-sm flex-shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#04080F]">{t.author}</p>
                  <p className="text-[11px] text-[#04080F]/50">
                    {t.role}, {t.company}
                  </p>
                  <p className="text-[10px] text-[#4A70B0]/60 font-medium">{t.team}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}