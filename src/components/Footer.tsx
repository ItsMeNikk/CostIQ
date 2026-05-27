"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

export default function Footer() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer className="bg-[#1E2A3A] pt-14 pb-10 w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 sm:gap-6"
        >
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4 -ml-1">
              <div className="w-8 h-8 rounded-xl bg-[#141414] flex items-center justify-center shadow-btn-primary">
                <span className="text-white font-bold text-sm tracking-tight">$</span>
              </div>
              <span className="font-semibold text-[15px] tracking-tight text-white">CostIQ</span>
            </Link>
            <p className="text-[13px] text-white/50 leading-relaxed max-w-xs font-light">
              AI spend auditing for engineering teams who want to stop guessing and start optimizing.
            </p>
          </div>

        </motion.div>

        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="text-[11px] text-white/30 tracking-wide">
            &copy; 2026 CostIQ, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
