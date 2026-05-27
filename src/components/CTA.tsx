"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SALES_EMAIL, STARTER_FOOTNOTE } from "@/lib/marketing-copy";

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="cta" className="py-20 sm:py-24 md:py-32 relative overflow-hidden">
      {/* Solid background */}
      <div className="absolute inset-0 bg-[#c8eaf2]" />
      <div className="absolute inset-0 grid-bg" />
            
      <div ref={ref} className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        {/* Floating accent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#141414]/10 rounded-full blur-3xl"
        />

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#141414] mb-6"
        >
          Start for free
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[30px] xs:text-[36px] sm:text-[40px] md:text-[64px] font-bold tracking-tight text-[#03045e] mb-5 sm:mb-6 leading-tight"
        >
          Ready to stop{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-[#023e8a]">overpaying</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute bottom-1 left-0 right-0 h-[8px] bg-[#48cae4]/40 rounded -z-0 origin-left"
            />
          </span>{" "}
          for AI?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[14px] sm:text-[15px] md:text-[16px] text-[#03045e]/70 mb-8 sm:mb-10 md:mb-12 max-w-xl mx-auto font-medium"
        >
          Join 2,400+ teams finding hidden costs in their AI stack. Start with Starter — no credit card required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          <motion.a
            href="/audit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-label group inline-flex items-center gap-3 bg-[#0a0a12] hover:bg-[#14141f] text-white pl-8 pr-7 py-4 rounded-[10px] transition-colors duration-200"
          >
            <span>Start free audit</span>
            <svg
              className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.a>
          {SALES_EMAIL ? (
            <motion.a
              href={`mailto:${SALES_EMAIL}?subject=CostIQ%20Pro`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-label group inline-flex items-center gap-3 px-8 py-4 rounded-[10px] text-[#03045e] bg-white hover:bg-[#f5f6f8] border border-[#03045e]/10 transition-colors duration-200"
            >
              <span>Talk to sales</span>
            </motion.a>
          ) : (
            <div className="relative group">
              <span className="btn-label group inline-flex items-center gap-3 px-8 py-4 rounded-[10px] text-[#03045e]/40 bg-white border border-[#03045e]/10 cursor-not-allowed opacity-50">
                <span>Talk to sales</span>
              </span>
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0D2137] px-2 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                Coming soon
              </span>
            </div>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-[12px] text-[#03045e]/45 tracking-wide"
        >
          {STARTER_FOOTNOTE}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 sm:mt-12 md:mt-14 flex items-center justify-center gap-6 sm:gap-8 flex-wrap"
        >
          {["No API keys required", "Private audit data", "PDF + shareable report"].map((badge) => (
            <div key={badge} className="flex items-center gap-1.5 text-[11px] text-[#03045e]/45 tracking-wide">
              <svg className="w-3.5 h-3.5 text-[#141414]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              {badge}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}