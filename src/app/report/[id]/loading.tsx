"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const STAGES = [
  "Analyzing your AI stack…",
  "Benchmarking provider pricing…",
  "Finding duplicate subscriptions…",
  "Calculating optimization opportunities…",
  "Generating your personalized summary…",
];

function getStoredData() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("costiq_audit");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function ReportLoading() {
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const data = getStoredData();
    void data;
  }, []);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStageIdx((i) => (i + 1) % STAGES.length);
    }, 1500);
    return () => clearInterval(stageInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return 90;
        return p + Math.random() * 8 + 3;
      });
    }, 200);
    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#b8e4ee] relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0096c7]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#48cae4]/15 rounded-full blur-[80px]" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-md w-full">
        {/* Pulsing logo */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-2xl bg-[#141414] flex items-center justify-center shadow-[0_8px_40px_rgba(4,102,200,0.3)]"
        >
          <span className="text-white font-bold text-2xl">$</span>
        </motion.div>

        {/* Headline */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[22px] sm:text-[26px] font-bold text-[#03045e] tracking-tight mb-2"
          >
            Generating your audit report
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[14px] text-[#03045e]/55"
          >
            This usually takes under 30 seconds
          </motion.p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="w-full h-1.5 bg-[#03045e]/15 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#141414] rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Staged messages */}
        <div className="h-6 flex items-center justify-center">
          <motion.p
            key={stageIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-[14px] font-medium text-[#03045e]/65"
          >
            {STAGES[stageIdx]}
          </motion.p>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {STAGES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: i === stageIdx ? 1.3 : 1,
                opacity: i <= stageIdx ? 1 : 0.3,
              }}
              transition={{ duration: 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-[#141414]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}