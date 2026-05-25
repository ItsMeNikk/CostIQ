"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function LockedReportOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0D2137]/45 backdrop-blur-[8px] px-4 sm:px-6 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="locked-overlay-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
        className="relative w-full max-w-[460px] bg-white rounded-2xl border border-[#e2eaf4] shadow-[0_24px_72px_-18px_rgba(13,33,55,0.4)] overflow-hidden"
        style={{ fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif" }}
      >
        <div className="p-8 sm:p-9 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#f4f8fc] border border-[#d8e4f0] flex items-center justify-center mb-5">
            <svg className="w-5 h-5 text-[#0D2137]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 id="locked-overlay-title" className="text-[20px] sm:text-[22px] font-bold text-[#0D2137] tracking-tight leading-tight mb-2">
            This report is private
          </h2>
          <p className="text-[13px] sm:text-[14px] text-[#5B7A99] leading-relaxed max-w-[360px] mx-auto mb-6">
            Generate your own AI spend audit to unlock personalized optimization insights.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
            <Link
              href="/audit"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0D2137] text-white text-[13px] font-semibold shadow-[0_2px_10px_rgba(13,33,55,0.25)] hover:shadow-[0_4px_18px_rgba(13,33,55,0.35)] hover:bg-[#1a3a5c] transition-all duration-150"
            >
              Generate my audit
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/report/demo"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#3D5A73] text-[13px] font-semibold border border-[#c8d8e8] hover:bg-[#f4f8fc] hover:border-[#b0c4d8] shadow-sm transition-all duration-150"
            >
              View sample report
            </Link>
          </div>

          <div className="mt-7 pt-5 border-t border-[#eef2f7] flex items-center justify-center gap-2 text-[11px] text-[#94A3B8]">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Reports are scoped to their share link · No accounts required
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
