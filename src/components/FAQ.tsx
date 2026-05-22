"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { FAQ_PRICING_ANSWER, SALES_EMAIL } from "@/lib/marketing-copy";

const faqs = [
  {
    q: "How does the audit work?",
    a: "Tell us which AI tools your team uses, your current plans, and monthly spend. Our engine benchmarks everything against current pricing and generates a personalized report — no API access needed.",
  },
  {
    q: "What AI tools do you cover?",
    a: "All major consumer and developer AI tools: ChatGPT, Claude, Cursor, Copilot, Gemini, Midjourney, DALL-E, Replicate, Vercel AI, and more. Add custom tools and we'll include them in the analysis.",
  },
  {
    q: "Is my data kept private?",
    a: "Yes. We never require API access and don't store your prompts or conversations. We only process the plan and spend info you explicitly provide.",
  },
  {
    q: "How accurate are the savings estimates?",
    a: "Estimates are based on real, current pricing from each provider's public page. Most teams find their actual achievable savings fall within 10–15% of the projection.",
  },
  {
    q: "How is this different from a spreadsheet?",
    a: "A spreadsheet requires you to know what to look for. CostIQ identifies redundancies, plan mismatches, and pricing errors you didn't know existed — and gives ranked, actionable steps.",
  },
  {
    q: "Can I export or share the report?",
    a: "Every audit generates a shareable link and a PDF export. Share with your team, finance, or leadership — no account required.",
  },
  {
    q: "Is there a free plan?",
    a: FAQ_PRICING_ANSWER,
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#C5D0D8]/30 to-[#C5D0D8]" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        <div ref={ref} className="text-center mb-10 sm:mb-12 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4A70B0] mb-4"
          >
            <span className="w-1.5 h-1.5 bg-[#4A70B0] rounded-full" />
            FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[28px] xs:text-[32px] sm:text-[36px] md:text-[48px] font-bold tracking-tight text-[#04080F] mb-3 sm:mb-4"
          >
            Common questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[14px] sm:text-[15px] text-[#04080F]/60 font-light"
          >
            Anything else? Email us at{" "}
            <a href={`mailto:${SALES_EMAIL}`} className="text-[#4A70B0] hover:underline font-medium">
              {SALES_EMAIL}
            </a>
          </motion.p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-[#A8BDE0]/35 overflow-hidden hover:border-[#4A70B0]/40 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 sm:p-5.5 text-left gap-4"
              >
                <span className="text-[12px] sm:text-[13px] font-medium text-[#04080F] tracking-wide">{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#4A70B0]/10 flex items-center justify-center"
                >
                  <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#4A70B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                  </svg>
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 sm:px-5.5 pb-4 sm:pb-5.5 text-[12px] sm:text-[13px] text-[#04080F] font-medium leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}