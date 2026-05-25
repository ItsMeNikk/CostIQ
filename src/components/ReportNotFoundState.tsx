"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ReportNotFoundState() {
  return (
    <div className="min-h-screen w-full bg-[#EEF3F8] flex items-center justify-center px-4 py-10" style={{ fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-[480px] bg-white rounded-2xl border border-[#d8e4f0] p-10 sm:p-12 text-center shadow-[0_1px_4px_rgba(0,0,0,0.05),0_2px_12px_rgba(0,0,0,0.04)]"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#f4f8fc] border border-[#d8e4f0] flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-[#5B8DBE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-1.5 1.5M10.172 13.828a4 4 0 005.656 0l1.5-1.5M3 3l18 18" />
          </svg>
        </div>

        <h1 className="text-[22px] sm:text-[24px] font-bold text-[#0D2137] tracking-tight mb-2">
          Report not found
        </h1>
        <p className="text-[13px] sm:text-[14px] text-[#5B7A99] leading-relaxed max-w-[360px] mx-auto mb-7">
          This audit doesn&apos;t exist or its share link has expired. Run your own to see real optimization recommendations.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
          <Link
            href="/audit"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0D2137] text-white text-[13px] font-semibold shadow-[0_2px_10px_rgba(13,33,55,0.25)] hover:shadow-[0_4px_18px_rgba(13,33,55,0.35)] hover:bg-[#1a3a5c] transition-all duration-150"
          >
            Start an audit
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#3D5A73] text-[13px] font-semibold border border-[#c8d8e8] hover:bg-[#f4f8fc] hover:border-[#b0c4d8] shadow-sm transition-all duration-150"
          >
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
