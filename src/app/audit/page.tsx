"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { validateAllTools, type ToolValidation } from "@/lib/audit-validation";
import { generateReportId, generateShareToken, rememberOwnerToken, reportStorageKey } from "@/lib/share-token";

/* ═══════════════════════════════════════════════════════════════════
   DATA MODEL
═══════════════════════════════════════════════════════════════════ */

interface ToolConfig {
  plan: string;
  monthlySpend: number | null;
  seats: number | null;
}

interface AuditFormData {
  companyName: string;
  teamSize: string;
  role: string;
  selectedUseCases: string[];
  spendRange: string;
  selectedTools: string[];
  customTools: string[];
  billingCycle: string;
  toolConfigs: Record<string, ToolConfig>;
  step: number;
}

const DEFAULT_FORM: AuditFormData = {
  companyName: "",
  teamSize: "",
  role: "",
  selectedUseCases: [],
  spendRange: "",
  selectedTools: [],
  customTools: [],
  billingCycle: "monthly",
  toolConfigs: {},
  step: 1,
};

/* ═══════════════════════════════════════════════════════════════════
   TOOL DEFINITIONS — required 8 tools + extras
═══════════════════════════════════════════════════════════════════ */

const TOOL_DEFS: {
  value: string;
  label: string;
  category: string;
  svgPath: string;
  color: string;
}[] = [
  { value: "cursor",      label: "Cursor",           category: "IDE / AI",        svgPath: "M5.25 4.5l14.25 14.25M5.25 18.75L18.75 4.5",              color: "#1a1a1a" },
  { value: "copilot",     label: "GitHub Copilot",   category: "Code Completion", svgPath: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", color: "#24292F" },
  { value: "claude",      label: "Claude",           category: "LLM / Chat",       svgPath: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", color: "#C97E4A" },
  { value: "chatgpt",     label: "ChatGPT",          category: "LLM / Chat",       svgPath: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", color: "#10A37F" },
  { value: "anthropic-api", label: "Anthropic API",  category: "API Access",       svgPath: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",                color: "#C97E4A" },
  { value: "openai-api",  label: "OpenAI API",        category: "API Access",       svgPath: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",                color: "#10A37F" },
  { value: "gemini",      label: "Gemini",            category: "LLM / Chat",       svgPath: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5m0 0L2.25 12.105a2.25 2.25 0 00-.659 1.591v5.286m10.5-1.504L19.75 14.5m0 0L16.5 12.105a2.25 2.25 0 00-.659-1.591V6.5m0 0L14.75 9.5", color: "#8E75B2" },
  { value: "windsurf",    label: "Windsurf",          category: "IDE / AI",        svgPath: "M13 10V3L4 14h7v7l9-11h-7z",                             color: "#6B6B6B" },
  { value: "midjourney",  label: "Midjourney",        category: "Image Gen",        svgPath: "M12 2l-2.4 7.2H2l6 4.8-2.4 7.2L12 17l6.4 4.2L16 14l6-4.8h-7.6L12 2z", color: "#9B59B6" },
  { value: "v0",          label: "v0 / Vercel AI",    category: "UI Generation",    svgPath: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z", color: "#1A1A1A" },
];

/* ═══════════════════════════════════════════════════════════════════
   PLAN OPTIONS PER TOOL
═══════════════════════════════════════════════════════════════════ */

const TOOL_PLANS: Record<string, { value: string; label: string; price: string }[]> = {
  cursor: [
    { value: "hobby",     label: "Hobby",           price: "$0/mo" },
    { value: "pro",       label: "Pro",             price: "$20/mo" },
    { value: "business",  label: "Business",         price: "$30/user/mo" },
    { value: "enterprise", label: "Enterprise",      price: "Custom" },
  ],
  copilot: [
    { value: "individual", label: "Individual",      price: "$10/mo" },
    { value: "business",  label: "Business",         price: "$19/user/mo" },
    { value: "enterprise", label: "Enterprise",      price: "Custom" },
  ],
  claude: [
    { value: "free",      label: "Free",             price: "$0/mo" },
    { value: "pro",       label: "Pro",              price: "$20/mo" },
    { value: "max",       label: "Max",              price: "$100/mo" },
    { value: "team",      label: "Team",            price: "$25/user/mo" },
    { value: "enterprise", label: "Enterprise",      price: "Custom" },
    { value: "api",       label: "API Direct",      price: "Pay-as-you-go" },
  ],
  chatgpt: [
    { value: "free",     label: "Free",             price: "$0/mo" },
    { value: "plus",      label: "Plus",             price: "$20/mo" },
    { value: "team",      label: "Team",            price: "$25/user/mo" },
    { value: "enterprise", label: "Enterprise",      price: "Custom" },
    { value: "api",       label: "API Direct",      price: "Pay-as-you-go" },
  ],
  "anthropic-api": [
    { value: "api",       label: "API Direct",      price: "Pay-as-you-go" },
    { value: "pro",       label: "Pro Plan",         price: "$100/mo" },
    { value: "enterprise", label: "Enterprise",       price: "Custom" },
  ],
  "openai-api": [
    { value: "payg",      label: "Pay-as-you-go",   price: "Usage-based" },
    { value: "pro",       label: "Pro",             price: "$250/mo" },
    { value: "scale",     label: "Scale",           price: "Custom" },
    { value: "enterprise", label: "Enterprise",      price: "Custom" },
  ],
  gemini: [
    { value: "free",     label: "Free",             price: "$0/mo" },
    { value: "pro",      label: "Pro",              price: "$19.99/mo" },
    { value: "ultra",    label: "Ultra",            price: "Custom" },
    { value: "api",      label: "API",              price: "Usage-based" },
  ],
  windsurf: [
    { value: "free",     label: "Free",             price: "$0/mo" },
    { value: "pro",      label: "Pro",              price: "$20/mo" },
    { value: "team",     label: "Team",             price: "$25/user/mo" },
    { value: "enterprise", label: "Enterprise",      price: "Custom" },
  ],
  midjourney: [
    { value: "standard",  label: "Standard",         price: "$10/mo" },
    { value: "pro",      label: "Pro",              price: "$30/mo" },
    { value: "mega",     label: "Mega",             price: "$60/mo" },
    { value: "enterprise", label: "Enterprise",      price: "Custom" },
  ],
  v0: [
    { value: "free",     label: "Free",             price: "$0/mo" },
    { value: "pro",      label: "Pro",              price: "$20/mo" },
    { value: "team",     label: "Team",             price: "$30/user/mo" },
    { value: "enterprise", label: "Enterprise",      price: "Custom" },
  ],
};

const SPEND_BUCKETS = [
  { value: 10,  label: "$0–10" },
  { value: 30,  label: "$10–30" },
  { value: 75,  label: "$30–75" },
  { value: 150, label: "$75–150" },
  { value: 300, label: "$150–300" },
  { value: 500, label: "$300–500" },
  { value: 1000, label: "$500–1K" },
  { value: 2000, label: "$1K–2K" },
  { value: 5000, label: "$2K–5K" },
  { value: 99999, label: "$5K+" },
];

/* ═══════════════════════════════════════════════════════════════════
   META CONSTANTS
═══════════════════════════════════════════════════════════════════ */

const TEAM_SIZES = [
  { value: "1-5",   label: "1–5" },
  { value: "6-15",  label: "6–15" },
  { value: "16-50", label: "16–50" },
  { value: "51-200", label: "51–200" },
  { value: "200+", label: "200+" },
];

const ROLES = [
  "Software Engineer", "Engineering Manager", "CTO / VP Engineering",
  "Product Manager", "Founder / CEO", "Designer", "Data Scientist",
  "DevOps / Platform", "Other",
];

const USE_CASES = [
  { value: "code-generation",   label: "Code generation",        icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  { value: "writing-content",   label: "Writing & content",      icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  { value: "research",          label: "Research & analysis",    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { value: "customer-support",  label: "Customer support",        icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { value: "data-processing",  label: "Data processing",         icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" },
];

const SPEND_RANGES = [
  { value: "0-100",  label: "$0–$100",  sub: "Getting started" },
  { value: "100-500", label: "$100–$500", sub: "Small team" },
  { value: "500-2k",  label: "$500–$2K", sub: "Growing" },
  { value: "2k-10k",  label: "$2K–$10K", sub: "Scaling" },
  { value: "10k+",   label: "$10K+",   sub: "Enterprise" },
];

/* ═══════════════════════════════════════════════════════════════════
   STORAGE HELPERS
═══════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "costiq_onboarding";

function loadForm(): AuditFormData {
  if (typeof window === "undefined") return DEFAULT_FORM;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AuditFormData>;
      return { ...DEFAULT_FORM, ...parsed };
    }
  } catch {}
  return DEFAULT_FORM;
}

function saveForm(form: AuditFormData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  } catch {}
}

function clearForm() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════════════════════════════════ */

function ToolIcon({ path, color, size = 16 }: { path: string; color: string; size?: number }) {
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function ProgressBar({ step }: { step: number }) {
  const TOTAL = 3;
  return (
    <div className="sticky top-0 z-50 w-full bg-white/95 border-b border-[#d8e4f0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-[#0D2137] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">$</span>
            </div>
            <span className="text-[14px] font-bold text-[#0D2137] tracking-tight">CostIQ</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#94A3B8]">Step {step}</span>
              <span className="text-[#CBD5E1]">·</span>
              <span className="text-[11px] text-[#94A3B8]">{TOTAL} total</span>
            </div>
          </div>
        </div>
        <div className="h-1.5 bg-[#EEF3F8] rounded-full overflow-hidden flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-full rounded-full overflow-hidden bg-[#EEF3F8]">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ backgroundColor: i <= step ? "#0D2137" : "transparent" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BtnPrimary({ onClick, disabled, loading, children }: {
  onClick?: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick} disabled={disabled || loading}
      whileHover={disabled ? {} : { y: -1 }}
      whileTap={disabled ? {} : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={`relative w-full btn-label flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-6 rounded-xl font-semibold overflow-hidden transition-shadow duration-200 ${
        disabled
          ? "bg-[#EEF3F8] text-[#94A3B8] border border-[#d8e4f0] cursor-not-allowed"
          : "bg-[#0D2137] text-white shadow-[0_1px_2px_rgba(13,33,55,0.18),0_4px_14px_rgba(13,33,55,0.22),inset_0_1px_0_rgba(255,255,255,0.09)] hover:shadow-[0_2px_4px_rgba(13,33,55,0.2),0_10px_28px_rgba(13,33,55,0.34),inset_0_1px_0_rgba(255,255,255,0.14)]"
      }`}
    >
      {!disabled && (
        <span aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      )}
      {loading && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="relative w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />}
      <span className="relative inline-flex items-center gap-2.5">{children}</span>
    </motion.button>
  );
}

function BtnSecondary({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <motion.button onClick={onClick}
      whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className="w-full btn-label flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-6 rounded-xl bg-white text-[#3D5A73] border border-[#d8e4f0] hover:border-[#0D2137]/35 hover:text-[#0D2137] hover:bg-[#f4f8fc] shadow-[0_1px_2px_rgba(13,33,55,0.04)] hover:shadow-[0_2px_8px_rgba(13,33,55,0.08)] transition-all duration-200 font-semibold"
    >
      {children}
    </motion.button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-[#5B7A99] uppercase tracking-[0.1em] mb-2.5">{children}</p>
  );
}

/* ── Premium custom select ─────────────────────────────────────── */

function CustomSelect({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`relative w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border bg-white text-left text-[14px] overflow-hidden ${
          open
            ? "border-[#5B8DBE]/45"
            : "border-[#E5EDF5] hover:border-[#94B0CC]/55"
        }`}
        style={{
          boxShadow: open
            ? "0 0 0 4px rgba(91,141,190,0.12), 0 1px 3px rgba(13,33,55,0.05), 0 6px 16px -6px rgba(91,141,190,0.2)"
            : "0 1px 2px rgba(13,33,55,0.03), 0 2px 6px -2px rgba(91,141,190,0.06)",
          transition: "box-shadow 280ms cubic-bezier(0.16, 1, 0.3, 1), border-color 220ms ease-out",
        }}
      >
        <span className={`truncate ${value ? "text-[#0D2137] font-medium" : "text-[#94A3B8]"}`}>
          {value || placeholder || "Select..."}
        </span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="w-4 h-4 text-[#5B7A99] flex-shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="listbox"
            style={{
              boxShadow:
                "0 4px 16px -4px rgba(13,33,55,0.12), 0 18px 44px -12px rgba(13,33,55,0.18), 0 0 0 1px rgba(13,33,55,0.04), inset 0 1px 0 rgba(255,255,255,0.85)",
              transformOrigin: "top center",
            }}
            className="absolute z-40 left-0 right-0 mt-2 rounded-xl border border-white/70 bg-white/85 backdrop-blur-xl overflow-hidden"
          >
            <div className="max-h-72 overflow-y-auto p-1.5">
              {options.map((opt) => {
                const isSel = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    onClick={() => { onChange(opt); setOpen(false); }}
                    className={`group w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left text-[13px] font-medium transition-colors duration-150 ${
                      isSel
                        ? "bg-[#0D2137] text-white"
                        : "text-[#3D5A73] hover:bg-[#F0F5FA] hover:text-[#0D2137]"
                    }`}
                    style={
                      isSel
                        ? { boxShadow: "0 1px 3px rgba(13,33,55,0.22), inset 0 1px 0 rgba(255,255,255,0.08)" }
                        : undefined
                    }
                  >
                    <span className="truncate">{opt}</span>
                    {isSel && (
                      <svg className="w-3.5 h-3.5 text-white/90 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Per-tool configuration card ──────────────────────────────── */

function ToolConfigCard({
  tool, config, validation, onChange,
}: {
  tool: typeof TOOL_DEFS[number];
  config: ToolConfig;
  validation: ToolValidation;
  onChange: (updated: ToolConfig) => void;
}) {
  const plans = TOOL_PLANS[tool.value] || [];
  const [expanded, setExpanded] = useState(!validation.valid || !!config.plan);
  const missing = validation.missing;
  const isMissing = (field: "plan" | "spend" | "seats") => missing.includes(field);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-[#d8e4f0] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-[#f4f8fc] transition-colors duration-150"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tool.color}15` }}>
          <ToolIcon path={tool.svgPath} color={tool.color} size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#0D2137]">{tool.label}</p>
          <p className="text-[11px] text-[#94A3B8]">{tool.category}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {config.plan && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#f4f8fc] text-[#5B7A99] border border-[#d8e4f0]">
              {plans.find((p) => p.value === config.plan)?.label || config.plan}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2 py-1 rounded-lg border ${
              validation.valid
                ? "bg-[#10A37F]/10 text-[#10A37F] border-[#10A37F]/20"
                : "bg-[#F59E0B]/10 text-[#92400E] border-[#F59E0B]/25"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                validation.valid ? "bg-[#10A37F]" : "bg-[#F59E0B]"
              }`}
            />
            {validation.valid ? "Complete" : "Needs setup"}
          </span>
          <motion.svg
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4 text-[#94A3B8] flex-shrink-0"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </button>

      {/* Config body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className={`px-4 pb-4 pt-1 grid grid-cols-1 gap-3 ${validation.requiresSeats ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              {/* Plan */}
              <div>
                <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.08em] mb-1.5">
                  Plan
                  {isMissing("plan") && <span className="ml-1 text-[#92400E] font-medium normal-case tracking-normal">· Required</span>}
                </p>
                <div className="relative">
                  <select
                    value={config.plan}
                    onChange={(e) => onChange({ ...config, plan: e.target.value })}
                    className="w-full text-[12px] font-medium text-[#0D2137] bg-[#f4f8fc] border border-[#d8e4f0] rounded-lg px-3 py-2.5 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-[#0D2137] focus:ring-[2px] focus:ring-[#0D2137]/10 transition-all"
                  >
                    <option value="">Select plan</option>
                    {plans.map((p) => <option key={p.value} value={p.value}>{p.label} · {p.price}</option>)}
                    <option value="not-sure">Not sure</option>
                  </select>
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Monthly spend */}
              <div>
                <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.08em] mb-1.5">
                  Monthly spend
                  {isMissing("spend") && <span className="ml-1 text-[#92400E] font-medium normal-case tracking-normal">· Required</span>}
                </p>
                <div className="relative">
                  <select
                    value={config.monthlySpend ?? ""}
                    onChange={(e) => onChange({ ...config, monthlySpend: e.target.value ? Number(e.target.value) : null })}
                    className="w-full text-[12px] font-medium text-[#0D2137] bg-[#f4f8fc] border border-[#d8e4f0] rounded-lg px-3 py-2.5 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-[#0D2137] focus:ring-[2px] focus:ring-[#0D2137]/10 transition-all"
                  >
                    <option value="">Select range</option>
                    {SPEND_BUCKETS.map((b) => <option key={b.value} value={b.value}>{b.label}/mo</option>)}
                  </select>
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Seats — only when per-user plan */}
              {validation.requiresSeats && (
                <div>
                  <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.08em] mb-1.5">
                    Seats / users
                    {isMissing("seats") && <span className="ml-1 text-[#92400E] font-medium normal-case tracking-normal">· Required</span>}
                  </p>
                  <div className="relative">
                    <select
                      value={config.seats ?? ""}
                      onChange={(e) => onChange({ ...config, seats: e.target.value ? Number(e.target.value) : null })}
                      className="w-full text-[12px] font-medium text-[#0D2137] bg-[#f4f8fc] border border-[#d8e4f0] rounded-lg px-3 py-2.5 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-[#0D2137] focus:ring-[2px] focus:ring-[#0D2137]/10 transition-all"
                    >
                      <option value="">Select</option>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n} seat{n !== 1 ? "s" : ""}</option>
                      ))}
                      <option value="25">25+</option>
                      <option value="50">50+</option>
                      <option value="100">100+</option>
                    </select>
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Summary row */}
            {config.plan && config.monthlySpend && (
              <div className="px-4 pb-4">
                <div className="bg-[#f4f8fc] rounded-lg px-3.5 py-2.5 flex items-center gap-3 border border-[#d8e4f0]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10A37F] flex-shrink-0" />
                  <span className="text-[11px] text-[#5B7A99]">
                    {tool.label} · {plans.find((p) => p.value === config.plan)?.label} ·{" "}
                    ~{SPEND_BUCKETS.find((b) => b.value === config.monthlySpend)?.label}/mo
                    {validation.requiresSeats && config.seats ? ` · ${config.seats} seats` : ""}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Review summary row ──────────────────────────────────────────── */

function ReviewRow({ iconPath, label, value, color }: {
  iconPath: string; label: string; value: string; color: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#f0f4f8] last:border-0">
      <div className="w-7 h-7 rounded-lg bg-[#f4f8fc] flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.08em]">{label}</p>
        <p className="text-[13px] font-semibold text-[#0D2137] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */

export default function AuditPage() {
  const router = useRouter();

  // ── Transient UI state ────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);

  // ── Load saved form state ────────────────────────────────────────
  const [form, setForm] = useState<AuditFormData>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadForm();
    // SSR-safe hydration from localStorage; setState in effect is required.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(saved);
    setLoaded(true);
  }, []);

  const update = useCallback((patch: Partial<AuditFormData>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      saveForm(next);
      return next;
    });
  }, []);

  const updateToolConfig = useCallback((toolKey: string, updated: ToolConfig) => {
    setForm((prev) => {
      const next = {
        ...prev,
        toolConfigs: { ...prev.toolConfigs, [toolKey]: updated },
      };
      saveForm(next);
      return next;
    });
  }, []);

  // ── Computed ─────────────────────────────────────────────────────
  const TOTAL_STEPS = 3;
  const step = form.step;

  const canAdvance1 = form.companyName.trim() && form.teamSize && form.role && form.selectedUseCases.length > 0 && form.spendRange;
  const canAdvance2 = form.selectedTools.length > 0;

  const toolValidation = validateAllTools(form.selectedTools, form.toolConfigs);
  const canSubmit = form.selectedTools.length > 0 && toolValidation.allValid;

  const configuredCount = form.selectedTools.filter((t) => toolValidation.perTool[t]?.valid).length;
  const totalSpend = Object.values(form.toolConfigs).reduce((sum, c) => sum + (c.monthlySpend ?? 0), 0);
  const optScore = Math.min(92, 50 + configuredCount * 4 + (form.billingCycle === "annual" ? 5 : 0));

  const goNext = () => {
    if (step === 1 && !canAdvance1) return;
    if (step === 2 && !canAdvance2) return;
    update({ step: Math.min(step + 1, TOTAL_STEPS) });
  };
  const goBack = () => update({ step: Math.max(step - 1, 1) });

  const toggleTool = (tool: string) => {
    const isAdding = !form.selectedTools.includes(tool);
    update({
      selectedTools: isAdding
        ? [...form.selectedTools, tool]
        : form.selectedTools.filter((t) => t !== tool),
    });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const reportId = generateReportId();
    const shareToken = generateShareToken();
    const toolDataList = form.selectedTools.map((toolKey) => {
      const def = TOOL_DEFS.find((t) => t.value === toolKey);
      const cfg = form.toolConfigs[toolKey] || { plan: "", monthlySpend: null, seats: null };
      const v = toolValidation.perTool[toolKey];
      const planMeta = TOOL_PLANS[toolKey]?.find((p) => p.value === cfg.plan);
      return {
        key: toolKey,
        label: def?.label || toolKey,
        category: def?.category || "",
        color: def?.color || "#5B8DBE",
        plan: cfg.plan,
        planLabel: planMeta?.label || cfg.plan,
        monthlySpend: cfg.monthlySpend,
        seats: v?.requiresSeats ? cfg.seats : 1,
      };
    });

    const auditData = {
      id: reportId,
      shareToken,
      companyName: form.companyName,
      teamSize: form.teamSize,
      role: form.role,
      selectedUseCases: form.selectedUseCases,
      spendRange: form.spendRange,
      selectedTools: form.selectedTools,
      customTools: form.customTools,
      billingCycle: form.billingCycle,
      toolData: toolDataList,
      configuredCount,
      totalSpend,
      submittedAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem(reportStorageKey(reportId), JSON.stringify(auditData));
      rememberOwnerToken(reportId, shareToken);
      sessionStorage.removeItem("costiq_audit");
    } catch {}

    fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: reportId,
        shareToken,
        companyName: form.companyName,
        teamSize: form.teamSize,
        role: form.role,
        billingCycle: form.billingCycle,
        totalMonthlySpend: totalSpend,
        data: auditData,
      }),
      keepalive: true,
    }).catch(() => {});

    clearForm();
    setSubmitting(true);
    setTimeout(() => router.push(`/report/${reportId}?share=${shareToken}`), 2500);
  };

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-[#EEF3F8]">
      <ProgressBar step={step} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="bg-white rounded-2xl border border-[#d8e4f0] shadow-[0_1px_4px_rgba(0,0,0,0.05),0_2px_12px_rgba(0,0,0,0.04)] px-5 sm:px-8 py-8 sm:py-10 overflow-hidden">

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="min-w-0"
            >

              {/* ══════════════ STEP 1: Team Info ══════════════ */}
              {step === 1 && (
                <div>
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-6 rounded-full bg-[#10A37F]" />
                      <h1 className="text-[24px] sm:text-[28px] font-bold text-[#0D2137] tracking-tight leading-tight">
                        Set up your audit
                      </h1>
                    </div>
                    <p className="text-[13px] sm:text-[14px] text-[#5B7A99] ml-4 leading-relaxed">
                      Tell us about your team and AI usage — we&apos;ll analyze where you&apos;re overspending.
                    </p>
                  </div>

                  <div className="space-y-6">

                    {/* Company */}
                    <div>
                      <FieldLabel>Company or team name</FieldLabel>
                      <input
                        type="text"
                        value={form.companyName}
                        onChange={(e) => update({ companyName: e.target.value })}
                        placeholder="e.g. Relay AI, Stackline, Orbit Analytics"
                        className="w-full px-4 py-3 rounded-xl border border-[#c8d8e8] bg-[#f4f8fc] text-[14px] text-[#0D2137] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0D2137] focus:ring-[2px] focus:ring-[#0D2137]/10 transition-all"
                      />
                    </div>

                    {/* Team size */}
                    <div>
                      <FieldLabel>Team size</FieldLabel>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {TEAM_SIZES.map((s) => (
                          <motion.button key={s.value} onClick={() => update({ teamSize: s.value })}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`btn-label-sm py-3 rounded-xl border transition-colors duration-150 ${
                              form.teamSize === s.value
                                ? "border-[#0D2137] bg-[#0D2137] text-white shadow-[0_1px_3px_rgba(13,33,55,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]"
                                : "border-[#d8e4f0] bg-white text-[#5B7A99] hover:border-[#0D2137]/35 hover:text-[#0D2137] hover:bg-[#f4f8fc]"
                            }`}
                          >
                            {s.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <FieldLabel>Your role</FieldLabel>
                      <CustomSelect
                        value={form.role}
                        onChange={(v) => update({ role: v })}
                        options={ROLES}
                        placeholder="Select your role"
                      />
                    </div>

                    {/* Monthly spend */}
                    <div>
                      <FieldLabel>Estimated monthly AI spend</FieldLabel>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {SPEND_RANGES.map((r) => {
                          const sel = form.spendRange === r.value;
                          return (
                            <motion.button key={r.value} onClick={() => update({ spendRange: r.value })}
                              animate={{ y: sel ? -2 : 0, scale: 1 }}
                              whileHover={{ y: sel ? -3 : -1.5, scale: 1.012 }}
                              whileTap={{ scale: 0.975 }}
                              transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.55 }}
                              className={`relative text-left px-3 py-3 rounded-2xl border overflow-hidden ${
                                sel
                                  ? "border-[#5B8DBE]/35"
                                  : "border-[#E5EDF5] hover:border-[#94B0CC]/55"
                              }`}
                              style={{
                                backgroundColor: "#ffffff",
                                boxShadow: sel
                                  ? "0 1px 2px rgba(13,33,55,0.04), 0 8px 20px -6px rgba(91,141,190,0.26), 0 22px 46px -18px rgba(13,33,55,0.18)"
                                  : "0 1px 2px rgba(13,33,55,0.03), 0 2px 6px -2px rgba(91,141,190,0.06)",
                                transition: "box-shadow 520ms cubic-bezier(0.16, 1, 0.3, 1), border-color 320ms ease-out",
                              }}
                            >
                              <AnimatePresence>
                                {sel && (
                                  <motion.span
                                    key="glow"
                                    aria-hidden
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                                    className="absolute -top-5 -left-5 w-24 h-24 rounded-full pointer-events-none"
                                    style={{
                                      background: "radial-gradient(circle, rgba(13,33,55,0.1) 0%, rgba(13,33,55,0.04) 35%, transparent 70%)",
                                      filter: "blur(20px)",
                                    }}
                                  />
                                )}
                              </AnimatePresence>

                              <span
                                aria-hidden
                                className="absolute inset-x-0 top-0 h-2/3 pointer-events-none"
                                style={{
                                  opacity: sel ? 1 : 0,
                                  background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)",
                                  transition: "opacity 520ms cubic-bezier(0.16, 1, 0.3, 1)",
                                }}
                              />

                              <span className={`relative btn-label-sm block mb-0.5 transition-colors ${sel ? "text-[#0D2137] font-semibold" : "text-[#3D5A73]"}`}>{r.label}</span>
                              <span className={`relative text-[10px] transition-colors ${sel ? "text-[#5B7A99]" : "text-[#94A3B8]"}`}>{r.sub}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Use cases */}
                    <div>
                      <FieldLabel>How your team uses AI</FieldLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {USE_CASES.map((uc) => {
                          const sel = form.selectedUseCases.includes(uc.value);
                          return (
                            <motion.button key={uc.value}
                              onClick={() => update({
                                selectedUseCases: sel
                                  ? form.selectedUseCases.filter((v) => v !== uc.value)
                                  : [...form.selectedUseCases, uc.value],
                              })}
                              whileHover={sel ? {} : { y: -1 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ type: "spring", stiffness: 420, damping: 28 }}
                              className={`relative text-left p-3.5 rounded-xl border overflow-hidden transition-colors duration-200 ${
                                sel
                                  ? "border-[#0D2137] bg-white shadow-[0_1px_3px_rgba(13,33,55,0.08),0_6px_18px_-6px_rgba(13,33,55,0.18)]"
                                  : "border-[#d8e4f0] bg-white hover:border-[#0D2137]/30 shadow-[0_1px_2px_rgba(13,33,55,0.03)]"
                              }`}
                            >
                              <div className="relative flex items-center gap-3">
                                <motion.div
                                  initial={false}
                                  animate={{ backgroundColor: sel ? "#0D2137" : "#f4f8fc" }}
                                  transition={{ duration: 0.2 }}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${sel ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" : ""}`}
                                >
                                  <svg className={`w-4 h-4 transition-colors duration-200 ${sel ? "text-white" : "text-[#5B7A99]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={uc.icon} />
                                  </svg>
                                </motion.div>
                                <span className={`btn-label-xs transition-colors ${sel ? "text-[#0D2137] font-semibold" : "text-[#3D5A73]"}`}>{uc.label}</span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                      {form.selectedUseCases.length > 0 && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] text-[#5B7A99] mt-2 font-medium">
                          {form.selectedUseCases.length} use case{form.selectedUseCases.length !== 1 ? "s" : ""} selected
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8">
                    <BtnPrimary onClick={goNext} disabled={!canAdvance1}>
                      Start My Audit
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </BtnPrimary>
                    <p className="text-center text-[11px] text-[#94A3B8] mt-3">
                      Free forever · No credit card · Takes under 2 min
                    </p>
                  </div>
                </div>
              )}

              {/* ══════════════ STEP 2: Select Tools ══════════════ */}
              {step === 2 && (
                <div>
                  <div className="mb-7">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-6 rounded-full bg-[#0D2137]" />
                      <h1 className="text-[24px] sm:text-[28px] font-bold text-[#0D2137] tracking-tight leading-tight">
                        Select your AI tools
                      </h1>
                    </div>
                    <p className="text-[13px] sm:text-[14px] text-[#5B7A99] ml-4 leading-relaxed">
                      Pick every tool your team pays for — we&apos;ll benchmark each one.
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-[#5B7A99] uppercase tracking-[0.08em]">
                      {form.selectedTools.length} tool{form.selectedTools.length !== 1 ? "s" : ""} selected
                    </span>
                    {form.selectedTools.length > 0 && (
                      <button onClick={() => update({ selectedTools: [] })} className="text-[11px] font-semibold text-[#94A3B8] hover:text-[#5B7A99] transition-colors">
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                    {TOOL_DEFS.map((tool) => {
                      const sel = form.selectedTools.includes(tool.value);
                      return (
                        <motion.button key={tool.value}
                          onClick={() => toggleTool(tool.value)}
                          animate={{ y: sel ? -2 : 0, scale: 1 }}
                          whileHover={{ y: sel ? -3 : -1.5, scale: 1.012 }}
                          whileTap={{ scale: 0.975 }}
                          transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.55 }}
                          className={`relative text-left p-3.5 rounded-2xl border overflow-hidden ${
                            sel
                              ? "border-[#5B8DBE]/35"
                              : "border-[#E5EDF5] hover:border-[#94B0CC]/55"
                          }`}
                          style={{
                            backgroundColor: "#ffffff",
                            boxShadow: sel
                              ? `0 1px 2px rgba(13,33,55,0.04), 0 8px 20px -6px rgba(91,141,190,0.28), 0 22px 46px -18px ${tool.color}3D`
                              : "0 1px 2px rgba(13,33,55,0.03), 0 2px 6px -2px rgba(91,141,190,0.06)",
                            transition: "box-shadow 520ms cubic-bezier(0.16, 1, 0.3, 1), border-color 320ms ease-out",
                          }}
                        >
                          <AnimatePresence>
                            {sel && (
                              <motion.span
                                key="glow"
                                aria-hidden
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                                className="absolute -top-6 -left-6 w-28 h-28 rounded-full pointer-events-none"
                                style={{
                                  background: `radial-gradient(circle, ${tool.color}26 0%, ${tool.color}0F 35%, transparent 70%)`,
                                  filter: "blur(20px)",
                                }}
                              />
                            )}
                          </AnimatePresence>

                          <span
                            aria-hidden
                            className="absolute inset-x-0 top-0 h-2/3 pointer-events-none"
                            style={{
                              opacity: sel ? 1 : 0,
                              background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)",
                              transition: "opacity 520ms cubic-bezier(0.16, 1, 0.3, 1)",
                            }}
                          />

                          <motion.div
                            animate={{ scale: sel ? 1.05 : 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.5 }}
                            className="relative w-9 h-9 rounded-xl mb-3 flex items-center justify-center"
                            style={{
                              backgroundColor: `${tool.color}17`,
                              boxShadow: sel
                                ? `0 0 0 1px ${tool.color}2A, 0 3px 10px -2px ${tool.color}30, inset 0 1px 0 rgba(255,255,255,0.55)`
                                : "inset 0 1px 0 rgba(255,255,255,0.3)",
                              transition: "box-shadow 420ms cubic-bezier(0.16, 1, 0.3, 1)",
                            }}
                          >
                            <ToolIcon path={tool.svgPath} color={tool.color} size={16} />
                          </motion.div>
                          <p className="relative text-[12px] font-bold text-[#0D2137] mb-0.5 leading-tight">{tool.label}</p>
                          <p className="relative text-[10px] text-[#94A3B8]">{tool.category}</p>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Custom tools */}
                  <div className="mb-8">
                    <FieldLabel>Other tools (optional)</FieldLabel>
                    <input
                      type="text"
                      value={form.customTools.join(", ")}
                      onChange={(e) => update({
                        customTools: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                      })}
                      placeholder="e.g. Jasper, Perplexity, Runway, Vercel AI..."
                      className="w-full px-4 py-3 rounded-xl border border-[#c8d8e8] bg-[#f4f8fc] text-[14px] text-[#0D2137] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0D2137] focus:ring-[2px] focus:ring-[#0D2137]/10 transition-all"
                    />
                    <p className="text-[10px] text-[#94A3B8] mt-1.5">Comma-separated</p>
                  </div>

                  <div className="flex gap-3">
                    <BtnSecondary onClick={goBack}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                      Back
                    </BtnSecondary>
                    <BtnPrimary onClick={goNext} disabled={!canAdvance2}>
                      Configure tools
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </BtnPrimary>
                  </div>
                </div>
              )}

              {/* ══════════════ STEP 3: Configure & Review ══════════════ */}
              {step === 3 && (
                <div>
                  <div className="mb-7">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-6 rounded-full bg-[#10A37F]" />
                      <h1 className="text-[24px] sm:text-[28px] font-bold text-[#0D2137] tracking-tight leading-tight">
                        Configure your tools
                      </h1>
                    </div>
                    <p className="text-[13px] sm:text-[14px] text-[#5B7A99] ml-4 leading-relaxed">
                      Set up each tool so we can generate accurate recommendations.
                    </p>
                  </div>

                  {/* Tool config cards */}
                  <div className="space-y-2 mb-6">
                    <FieldLabel>Tool configuration</FieldLabel>
                    <AnimatePresence>
                      {form.selectedTools.map((toolKey) => {
                        const tool = TOOL_DEFS.find((t) => t.value === toolKey);
                        if (!tool) return null;
                        const validation = toolValidation.perTool[toolKey] ?? {
                          valid: false,
                          missing: ["plan", "spend"],
                          requiresSeats: false,
                        };
                        return (
                          <ToolConfigCard
                            key={toolKey}
                            tool={tool}
                            config={form.toolConfigs[toolKey] || { plan: "", monthlySpend: null, seats: null }}
                            validation={validation}
                            onChange={(updated) => updateToolConfig(toolKey, updated)}
                          />
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Billing cycle */}
                  <div className="mb-6">
                    <FieldLabel>Billing cycle</FieldLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "monthly", label: "Monthly" },
                        { value: "annual",  label: "Annual", sub: "Save ~20%" },
                      ].map((b) => (
                        <motion.button key={b.value}
                          onClick={() => update({ billingCycle: b.value })}
                          whileHover={form.billingCycle !== b.value ? { y: -2, scale: 1.01 } : {}}
                          whileTap={{ scale: 0.98 }}
                          className={`btn-label-sm py-3.5 rounded-xl border transition-all duration-150 ${
                            form.billingCycle === b.value
                              ? "border-[#0D2137] bg-[#0D2137] text-white scale-[1.01]"
                              : "border-[#c8d8e8] bg-white text-[#3D5A73] hover:border-[#b0c4d8]"
                          }`}
                        >
                          {b.label}{b.sub ? ` · ${b.sub}` : ""}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Audit summary */}
                  <div className="bg-[#f4f8fc] rounded-xl border border-[#d8e4f0] p-5 mb-6">
                    <p className="text-[11px] font-bold text-[#5B7A99] uppercase tracking-[0.1em] mb-4">Audit summary</p>

                    <div className="space-y-0">
                      <ReviewRow
                        iconPath="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        label="Company" value={form.companyName || "—"} color="#5B8DBE"
                      />
                      <ReviewRow
                        iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        label="Tools selected" value={`${form.selectedTools.length} tools · ${configuredCount} configured`} color="#5B8DBE"
                      />
                      <ReviewRow
                        iconPath="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        label="Billing" value={form.billingCycle === "annual" ? "Annual" : "Monthly"} color="#10A37F"
                      />
                      <ReviewRow
                        iconPath="M13 10V3L4 14h7v7l9-11h-7z"
                        label="Est. score" value={`${optScore}/100 — ${toolValidation.allValid ? "ready to audit" : `${toolValidation.incompleteCount} tool${toolValidation.incompleteCount !== 1 ? "s" : ""} need${toolValidation.incompleteCount === 1 ? "s" : ""} config`}`} color="#C97E4A"
                      />
                    </div>
                  </div>

                  {/* What's included */}
                  <div className="bg-[#f4f8fc] rounded-xl border border-[#d8e4f0] p-5 mb-6">
                    <p className="text-[11px] font-bold text-[#5B7A99] uppercase tracking-[0.1em] mb-3">Your audit will include</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Per-tool savings breakdown",
                        "Plan optimization suggestions",
                        "AI-generated plain-English summary",
                        "Actionable recommendations",
                        "Shareable PDF report",
                        "Team spend attribution",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <svg className="w-3 h-3 text-[#10A37F] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span className="text-[11px] text-[#3D5A73]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <BtnSecondary onClick={goBack}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                      Back
                    </BtnSecondary>
                    <BtnPrimary onClick={handleSubmit} disabled={!canSubmit} loading={submitting}>
                      Generate Audit Report
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </BtnPrimary>
                  </div>
                  {!canSubmit && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-3 max-w-md mx-auto text-center"
                    >
                      <p className="text-[12px] text-[#5B7A99] leading-relaxed">
                        <svg className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5 text-[#5B8DBE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {form.selectedTools.length === 0
                          ? "Select at least one tool to continue."
                          : "Complete all selected tool configurations to generate accurate optimization recommendations."}
                      </p>
                      {form.selectedTools.length > 0 && toolValidation.incompleteCount > 0 && (
                        <p className="text-[11px] text-[#94A3B8] mt-1">
                          {toolValidation.incompleteCount} tool{toolValidation.incompleteCount !== 1 ? "s" : ""} still need{toolValidation.incompleteCount === 1 ? "s" : ""} setup
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}