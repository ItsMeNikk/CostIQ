"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface EmailCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string, company?: string) => void | Promise<void>;
  defaultCompany?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function EmailCaptureModal({
  open,
  onClose,
  onSubmit,
  defaultCompany,
}: EmailCaptureModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <ModalShell onClose={onClose} onSubmit={onSubmit} defaultCompany={defaultCompany} />
      )}
    </AnimatePresence>
  );
}

function ModalShell({
  onClose,
  onSubmit,
  defaultCompany,
}: Omit<EmailCaptureModalProps, "open">) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(defaultCompany ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(submitting);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  // ESC to close + body scroll lock + initial focus
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submittingRef.current) onClose();
    };
    window.addEventListener("keydown", handleKey);

    const focusTimer = setTimeout(() => emailRef.current?.focus(), 80);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
      clearTimeout(focusTimer);
    };
  }, [onClose]);

  const isValid = EMAIL_RE.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await onSubmit(email.trim(), company.trim() || undefined);
      // Parent handles the close + success toast. No internal success state.
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Couldn't send right now. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#0D2137]/40 backdrop-blur-[6px] px-4 sm:px-6 py-6"
      aria-modal="true"
      role="dialog"
      aria-labelledby="email-capture-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.985 }}
        transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
        onMouseDown={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-white rounded-2xl border border-[#e2eaf4] shadow-[0_20px_60px_-15px_rgba(13,33,55,0.35)] overflow-hidden"
        style={{ fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif" }}
      >
        <div className="p-7 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[#7A9BBE] hover:text-[#0D2137] hover:bg-[#f4f8fc] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-11 h-11 rounded-xl bg-[#f4f8fc] border border-[#d8e4f0] flex items-center justify-center mb-5">
            <svg className="w-5 h-5 text-[#0D2137]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 id="email-capture-title" className="text-[20px] font-bold text-[#0D2137] tracking-tight leading-tight mb-2">
            Want the full audit report?
          </h2>
          <p className="text-[13px] text-[#5B7A99] leading-relaxed mb-6">
            Get a shareable PDF report, pricing breakdowns, optimization alerts, and future savings recommendations.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="email-capture-email" className="block text-[10px] font-bold text-[#5B7A99] uppercase tracking-[0.1em] mb-1.5">
                Work email
              </label>
              <input
                ref={emailRef}
                id="email-capture-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                placeholder="you@company.com"
                className="w-full text-[14px] text-[#0D2137] placeholder-[#94A3B8] bg-white border border-[#d8e4f0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#5B8DBE] focus:ring-2 focus:ring-[#5B8DBE]/25 transition-all disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="email-capture-company" className="block text-[10px] font-bold text-[#5B7A99] uppercase tracking-[0.1em] mb-1.5">
                Company / team <span className="text-[#94A3B8] font-medium normal-case tracking-normal">— optional</span>
              </label>
              <input
                id="email-capture-company"
                type="text"
                autoComplete="organization"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={submitting}
                placeholder="Acme Inc."
                className="w-full text-[14px] text-[#0D2137] placeholder-[#94A3B8] bg-white border border-[#d8e4f0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#5B8DBE] focus:ring-2 focus:ring-[#5B8DBE]/25 transition-all disabled:opacity-60"
              />
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  key="err"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  role="alert"
                  className="text-[12px] text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA] rounded-lg px-3 py-2"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={!isValid || submitting}
              whileHover={isValid && !submitting ? { y: -1 } : undefined}
              whileTap={isValid && !submitting ? { scale: 0.98 } : undefined}
              className="w-full flex items-center justify-center gap-2 mt-2 bg-[#0D2137] text-white rounded-xl py-3 text-[14px] font-semibold shadow-[0_2px_10px_rgba(13,33,55,0.2)] hover:shadow-[0_4px_18px_rgba(13,33,55,0.3)] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:shadow-none"
            >
              {submitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Sending…
                </>
              ) : (
                <>
                  Email my report
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="block mx-auto text-[12px] text-[#5B7A99] hover:text-[#0D2137] font-medium pt-1 transition-colors disabled:opacity-40"
            >
              Continue without saving
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#eef2f7] flex items-center justify-center gap-3 flex-wrap">
            {[
              {
                label: "Private & secure",
                path: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
              },
              {
                label: "No spam, ever",
                path: "M5 13l4 4L19 7",
              },
              {
                label: "Used by engineering teams",
                path: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
              },
            ].map((t) => (
              <span key={t.label} className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-[#7A9BBE]">
                <svg className="w-3 h-3 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={t.path} />
                </svg>
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
