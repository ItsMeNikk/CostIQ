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
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#d8eef4]" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        <div ref={ref} className="text-center mb-10 sm:mb-12 md:mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#141414]/55 mb-4"
          >
            <span className="w-1.5 h-1.5 bg-[#141414]/40 rounded-full" />
            FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[28px] xs:text-[32px] sm:text-[36px] md:text-[48px] font-bold tracking-tight text-[#141414] mb-3 sm:mb-4"
          >
            Common questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[14px] sm:text-[15px] text-[#141414]/55 font-normal"
          >
            Anything else? Email us at{" "}
            <a href={`mailto:${SALES_EMAIL}`} className="text-[#141414] hover:underline font-medium">
              {SALES_EMAIL}
            </a>
          </motion.p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.12 + i * 0.05 }}
                className="rounded-[12px] bg-[#f5f5f5] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-[18px] text-left cursor-pointer hover:bg-[#efefef] transition-colors duration-200"
                >
                  <span className="text-[14px] sm:text-[15px] font-bold text-[#141414] leading-snug pr-2">
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e8e8e8] flex items-center justify-center"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-[#5c5c5c]"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 4L6 8L10 4" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 pt-0 border-t border-[#141414]/6">
                        <p className="text-[13px] sm:text-[14px] text-[#141414]/65 font-normal leading-[1.7]">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
