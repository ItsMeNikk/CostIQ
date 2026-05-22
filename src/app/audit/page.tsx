"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const TOTAL_STEPS = 4;

const TEAM_SIZES = [
  { value: "1-5", label: "1–5" },
  { value: "6-15", label: "6–15" },
  { value: "16-50", label: "16–50" },
  { value: "51-200", label: "51–200" },
  { value: "200+", label: "200+" },
];

const ROLES = [
  "Software Engineer",
  "Engineering Manager",
  "CTO / VP Engineering",
  "Product Manager",
  "Founder / CEO",
  "Designer",
  "Data Scientist",
  "DevOps / Platform",
  "Other",
];

const USE_CASES = [
  { value: "code-generation", label: "Code generation", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  { value: "writing-content", label: "Writing & content", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  { value: "research", label: "Research & analysis", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { value: "customer-support", label: "Customer support", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { value: "data-processing", label: "Data processing", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" },
];

const SPEND_RANGES = [
  { value: "0-100", label: "$0–$100", sub: "Just getting started" },
  { value: "100-500", label: "$100–$500", sub: "Small team" },
  { value: "500-2k", label: "$500–$2K", sub: "Growing team" },
  { value: "2k-10k", label: "$2K–$10K", sub: "Scaling" },
  { value: "10k+", label: "$10K+", sub: "Enterprise" },
];

const AI_TOOLS: {
  value: string;
  label: string;
  category: string;
  svgPath: string;
  color: string;
}[] = [
  { value: "chatgpt", label: "ChatGPT", category: "LLM", svgPath: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", color: "#10A37F" },
  { value: "claude", label: "Claude", category: "LLM", svgPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c.83 0 1.5.67 1.5 1.5 0 .38-.14.72-.38 1.02L12 9l-1.12 1.52C10.58 7.22 10.5 7.38 10.5 7.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5c0-.38-.14-.72-.38-1.02L12 4l1.12-1.52C13.42 2.78 13.5 2.62 13.5 2.5c0-.83-.67-1.5-1.5-1.5z", color: "#D4A27F" },
  { value: "cursor", label: "Cursor", category: "IDE", svgPath: "M5.25 4.5l14.25 14.25M5.25 18.75L18.75 4.5", color: "#1a1a1a" },
  { value: "copilot", label: "GitHub Copilot", category: "Code", svgPath: "M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.44L12 11.54 5.1 7.62 12 4.18zM4 16.27V9.09l7 3.5v6.86l-7-3.18zm9 3.18V12.59l7-3.5v7.18l-7 3.18z", color: "#24292F" },
  { value: "gemini", label: "Gemini", category: "LLM", svgPath: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", color: "#8E75B2" },
  { value: "openai-api", label: "OpenAI API", category: "API", svgPath: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", color: "#10A37F" },
  { value: "anthropic-api", label: "Anthropic API", category: "API", svgPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c.83 0 1.5.67 1.5 1.5 0 .38-.14.72-.38 1.02L12 9l-1.12 1.52C10.58 7.22 10.5 7.38 10.5 7.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5c0-.38-.14-.72-.38-1.02L12 4l1.12-1.52C13.42 2.78 13.5 2.62 13.5 2.5c0-.83-.67-1.5-1.5-1.5z", color: "#D4A27F" },
  { value: "azure-openai", label: "Azure OpenAI", category: "Cloud AI", svgPath: "M3.75 13.5l10.5-7.5H3.75v7.5zm13.5 0l-10.5 7.5h10.5v-7.5z", color: "#0078D4" },
  { value: "aws-bedrock", label: "AWS Bedrock", category: "Cloud AI", svgPath: "M3.75 13.5l10.5-7.5H3.75v7.5zm13.5 0l-10.5 7.5h10.5v-7.5z", color: "#FF9900" },
  { value: "midjourney", label: "Midjourney", category: "Image", svgPath: "M12 2l-2.4 7.2H2l6 4.8-2.4 7.2L12 17l6.4 4.2L16 14l6-4.8h-7.6L12 2z", color: "#6B6B6B" },
  { value: "replicate", label: "Replicate", category: "Inference", svgPath: "M12 2L2 7v10l10 5 10-5V7L12 2zm0 3l5 2.5L12 10l-5-2.5L12 5z", color: "#6B91C4" },
];

function AiToolIcon({ svgPath, color }: { svgPath: string; color: string }) {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d={svgPath} />
    </svg>
  );
}

const TOOL_PLANS: Record<string, string[]> = {
  chatgpt: ["Free", "Plus ($20/mo)", "Team ($25/seat/mo)", "Enterprise"],
  claude: ["Free", "Pro ($20/mo)", "Team ($25/seat/mo)", "Max ($100/mo)", "Enterprise"],
  cursor: ["Free", "Pro ($20/mo)", "Team ($25/seat/mo)", "Enterprise"],
  copilot: ["Individual ($10/mo)", "Business ($19/seat/mo)", "Enterprise"],
  gemini: ["Free", "Advanced ($19.99/mo)", "Ultra (custom)"],
  "openai-api": ["Pay-as-you-go", "Pro ($250/mo)", "Scale (custom)", "Enterprise"],
  "anthropic-api": ["Pay-as-you-go", "Pro ($100/mo)", "Enterprise"],
  "azure-openai": ["Pay-as-you-go", "Standard", "Enterprise"],
  "aws-bedrock": ["Pay-as-you-go", "Pro", "Enterprise"],
  midjourney: ["Standard ($10/mo)", "Pro ($30/mo)", "Mega ($60/mo)", "Enterprise"],
  replicate: ["Pay-as-you-go", "Pro", "Enterprise"],
};

const BUDGET_RANGES = [
  { min: 0, max: 100, label: "Under $100/mo" },
  { min: 100, max: 300, label: "$100–300/mo" },
  { min: 300, max: 500, label: "$300–500/mo" },
  { min: 500, max: 1000, label: "$500–1,000/mo" },
  { min: 1000, max: 3000, label: "$1,000–3,000/mo" },
  { min: 3000, max: 10000, label: "$3,000–10,000/mo" },
  { min: 10000, max: 9999999, label: "$10,000+/mo" },
];

const BILLING_CYCLES = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual (save ~20%)" },
];

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="sticky top-0 z-50 w-full max-w-[100vw] overflow-x-hidden bg-white/80 backdrop-blur-xl border-b border-[#A8BDE0]/25">
      <div className="mx-auto w-full max-w-2xl min-w-0 px-4 sm:px-6 py-5">
        {/* Back + Logo */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#4A70B0] to-[#3E5F96] flex items-center justify-center shadow-btn-primary">
              <span className="text-white font-bold text-xs">$</span>
            </div>
            <span className="text-[14px] font-semibold text-[#04080F] group-hover:text-[#4A70B0] transition-colors">CostIQ</span>
          </Link>
          <span className="text-[12px] text-[#04080F]/40 font-medium">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>

        {/* Progress */}
        <div className="relative overflow-hidden">
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} className="flex-1 h-2 rounded-full overflow-hidden bg-[#A8BDE0]/25">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#4A70B0] to-[#507DBC]"
                  initial={{ width: "0%" }}
                  animate={{ width: i < step - 1 ? "100%" : i === step - 1 ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            ))}
          </div>
          <motion.div
            className="absolute -bottom-1 left-0 h-2.5 rounded-full bg-gradient-to-r from-[#4A70B0] to-[#507DBC] shadow-[0_0_8px_rgba(74,112,176,0.4)]"
            initial={{ width: `${((1 - 1) / TOTAL_STEPS) * 100}%` }}
            animate={{ width: `${((step - 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}

function StepWrapper({ children, stepKey }: { children: React.ReactNode; stepKey: number }) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="min-w-0"
    >
      {children}
    </motion.div>
  );
}

function SelectableCard({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full min-w-0 text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
        selected
          ? "border-[#4A70B0] bg-[#4A70B0]/12 shadow-[0_0_0_2px_rgba(74,112,176,0.15),0_4px_16px_rgba(74,112,176,0.12)]"
          : "border-[#A8BDE0]/35 bg-white hover:border-[#4A70B0]/40 hover:bg-white hover:shadow-card"
      } ${className}`}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#4A70B0] flex items-center justify-center"
        >
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </motion.div>
      )}
      {children}
    </motion.button>
  );
}

function PrimaryButton({
  onClick,
  children,
  disabled = false,
  loading = false,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled ? {} : { y: -2, scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`relative w-full py-4 rounded-2xl font-semibold text-[14px] tracking-wide transition-all duration-200 overflow-hidden ${
        disabled
          ? "bg-[#C5D0D8]/60 text-[#04080F]/35 cursor-not-allowed border border-[#A8BDE0]/50"
          : "bg-gradient-to-b from-[#4A70B0] to-[#3E5F96] text-white shadow-[0_4px_16px_rgba(74,112,176,0.3),0_0_0_1px_rgba(74,112,176,0.2)] hover:shadow-[0_6px_24px_rgba(74,112,176,0.4),0_0_0_1px_rgba(74,112,176,0.3)]"
      }`}
    >
      {!disabled && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent" />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
          />
        ) : null}
        {children}
      </span>
    </motion.button>
  );
}

function SecondaryButton({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="w-full py-4 rounded-2xl font-medium text-[14px] tracking-wide border-2 border-[#A8BDE0]/40 bg-white/70 hover:bg-white hover:border-[#4A70B0]/40 text-[#04080F] transition-all duration-200"
    >
      {children}
    </motion.button>
  );
}

export default function AuditPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Step 1 — Team Info
  const [companyName, setCompanyName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [role, setRole] = useState("");
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [spendRange, setSpendRange] = useState("");

  // Step 2 — AI Tools
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customTools, setCustomTools] = useState("");

  // Step 3 — Plans & Spend
  const [budgetRange, setBudgetRange] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [toolPlans, setToolPlans] = useState<Record<string, string>>({});
  const [toolSeats, setToolSeats] = useState<Record<string, number>>({});
  const [toolSpend, setToolSpend] = useState<Record<string, string>>({});

  // Step 4 — Review
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Computed
  const canAdvanceStep1 = companyName.trim() && teamSize && role && selectedUseCases.length > 0 && spendRange;
  const canAdvanceStep2 = selectedTools.length > 0;
  const canAdvanceStep3 = budgetRange !== null;

  const stepTitles = [
    { label: "AI Audit Setup", title: "Set up your AI spend audit", sub: "Tell us about your team and current AI usage — takes under 2 minutes." },
    { label: "AI Tools", title: "Which AI tools do you use?", sub: "We benchmark your current plans against alternatives to find where you're paying too much." },
    { label: "Plans & Spend", title: "Review your current setup", sub: "We benchmark your plans against alternatives to find where you're overpaying." },
    { label: "Review", title: "Your audit is ready", sub: "Here's what we'll analyze — confirm and hit generate." },
  ];

  const selectedBudget = BUDGET_RANGES[budgetRange ?? 0];
  const estSavingsLow = selectedBudget ? Math.round((selectedBudget.min * 0.25)) : 0;
  const estSavingsHigh = selectedBudget ? Math.round((selectedBudget.max * 0.4)) : 0;
  const optScore = selectedTools.length > 4 ? 54 : selectedTools.length > 2 ? 62 : 71;

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 2200);
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 16 : -16 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -16 : 16 }),
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#B8C4CE] relative isolate">
      {/* Background — clipped to viewport */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-[#A8B8C4] via-[#B0BEC8] to-[#A8B8C4]" />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -top-24 -right-24 h-[min(500px,80vw)] w-[min(500px,80vw)] rounded-full bg-[#8BB4DC]/12 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-[min(400px,70vw)] w-[min(400px,70vw)] rounded-full bg-[#4A70B0]/8 blur-3xl" />
      </div>

      <ProgressBar step={step} />

      <div className="relative w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 min-w-0">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-card border border-[#A8BDE0]/30 px-5 sm:px-8 py-8 sm:py-10 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="min-w-0"
            >
            {/* Step 1 — AI Audit Setup */}
            {step === 1 && (
              <StepWrapper stepKey={1}>
                <div className="mb-8">
                  <h1 className="text-[26px] sm:text-[30px] font-bold text-[#04080F] tracking-tight mb-2">
                    {stepTitles[0].title}
                  </h1>
                  <p className="text-[13px] sm:text-[14px] text-[#04080F] font-normal leading-relaxed">
                    {stepTitles[0].sub}
                  </p>
                </div>

                <div className="space-y-6">

                  {/* Company name */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#04080F]/60 tracking-wide mb-2 uppercase">
                      Company or team name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Relay AI, Stackline, Orbit Analytics"
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#A8BDE0]/40 bg-white text-[14px] text-[#04080F] placeholder:text-[#04080F]/30 transition-all duration-200 focus:outline-none focus:border-[#4A70B0] focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,112,176,0.18),0_4px_20px_rgba(74,112,176,0.08)]"
                    />
                  </div>

                  {/* Team size */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#04080F]/60 tracking-wide mb-2 uppercase">
                      Team size
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {TEAM_SIZES.map((size) => (
                        <motion.button
                          key={size.value}
                          onClick={() => setTeamSize(size.value)}
                          whileHover={teamSize !== size.value ? { y: -2, scale: 1.02 } : {}}
                          whileTap={{ scale: 0.97 }}
                          className={`relative py-3 rounded-2xl border-2 font-semibold text-[13px] transition-all duration-200 ${
                            teamSize === size.value
                              ? "border-[#4A70B0] bg-gradient-to-b from-[#4A70B0] to-[#3E5F96] text-white shadow-[0_4px_14px_rgba(74,112,176,0.35),0_0_0_1px_rgba(74,112,176,0.3)]"
                              : "border-[#A8BDE0]/35 bg-white text-[#04080F] hover:border-[#4A70B0]/50 hover:shadow-[0_4px_12px_rgba(74,112,176,0.1)] hover:bg-white"
                          }`}
                        >
                          {size.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#04080F]/60 tracking-wide mb-2 uppercase">
                      Your role
                    </label>
                    <div className="relative">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#A8BDE0]/40 bg-white text-[14px] text-[#04080F] appearance-none cursor-pointer pr-10 transition-all duration-200 focus:outline-none focus:border-[#4A70B0] focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,112,176,0.18),0_4px_20px_rgba(74,112,176,0.08)]"
                      >
                        <option value="" disabled className="text-[#04080F]/30">
                          Select your role
                        </option>
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#04080F]/35 pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Estimated Monthly AI Spend */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#04080F]/60 tracking-wide mb-2 uppercase">
                      Estimated monthly AI spend
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {SPEND_RANGES.map((range) => (
                        <motion.button
                          key={range.value}
                          onClick={() => setSpendRange(range.value)}
                          whileHover={spendRange !== range.value ? { y: -2, scale: 1.02 } : {}}
                          whileTap={{ scale: 0.97 }}
                          className={`relative text-left p-3 rounded-2xl border-2 transition-all duration-200 ${
                            spendRange === range.value
                              ? "border-[#4A70B0] bg-[#4A70B0]/10 shadow-[0_0_0_2px_rgba(74,112,176,0.2),0_4px_14px_rgba(74,112,176,0.15)]"
                              : "border-[#A8BDE0]/35 bg-white hover:border-[#4A70B0]/40 hover:shadow-[0_4px_12px_rgba(74,112,176,0.08)]"
                          }`}
                        >
                          {spendRange === range.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#4A70B0] flex items-center justify-center"
                            >
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </motion.div>
                          )}
                          <span className={`text-[12px] font-bold block mb-0.5 ${
                            spendRange === range.value ? "text-[#4A70B0]" : "text-[#04080F]"
                          }`}>
                            {range.label}
                          </span>
                          <span className="text-[10px] text-[#04080F]/40">{range.sub}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* AI Use Cases — Multi-select */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#04080F]/60 tracking-wide mb-2 uppercase">
                      How your team uses AI
                      <span className="ml-1 normal-case font-normal text-[#04080F]/35">(select all that apply)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {USE_CASES.map((uc) => {
                        const isSelected = selectedUseCases.includes(uc.value);
                        return (
                          <motion.button
                            key={uc.value}
                            onClick={() => {
                              setSelectedUseCases((prev) =>
                                prev.includes(uc.value)
                                  ? prev.filter((v) => v !== uc.value)
                                  : [...prev, uc.value]
                              );
                            }}
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative text-left p-3.5 rounded-2xl border-2 transition-all duration-200 ${
                              isSelected
                                ? "border-[#4A70B0] bg-[#4A70B0]/10 shadow-[0_0_0_2px_rgba(74,112,176,0.18),0_4px_14px_rgba(74,112,176,0.12)]"
                                : "border-[#A8BDE0]/35 bg-white hover:border-[#4A70B0]/40 hover:shadow-[0_4px_12px_rgba(74,112,176,0.08)]"
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#4A70B0] flex items-center justify-center"
                              >
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </motion.div>
                            )}
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                                isSelected ? "bg-[#4A70B0]/15" : "bg-[#A8BDE0]/15"
                              }`}>
                                <svg className={`w-3.5 h-3.5 transition-colors duration-200 ${isSelected ? "text-[#4A70B0]" : "text-[#4A70B0]/60"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d={uc.icon} />
                                </svg>
                              </div>
                              <span className={`text-[13px] font-medium transition-colors duration-200 ${
                                isSelected ? "text-[#4A70B0]" : "text-[#04080F]"
                              }`}>
                                {uc.label}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                    {selectedUseCases.length > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] text-[#4A70B0]/70 mt-2 font-medium"
                      >
                        {selectedUseCases.length} use case{selectedUseCases.length > 1 ? "s" : ""} selected
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <motion.div
                    animate={canAdvanceStep1 ? { scale: [0.98, 1.02, 1] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <PrimaryButton onClick={goNext} disabled={!canAdvanceStep1}>
                      Start My Audit
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </PrimaryButton>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: canAdvanceStep1 ? 1 : 0.4 }}
                    transition={{ duration: 0.3 }}
                    className="text-center text-[11px] text-[#04080F]/40 mt-3 tracking-wide"
                  >
                    No credit card required
                    <span className="mx-2 text-[#04080F]/25">•</span>
                    Audit takes under 2 minutes
                  </motion.p>
                </div>
              </StepWrapper>
            )}

            {/* Step 2 — AI Tools */}
            {step === 2 && (
              <StepWrapper stepKey={2}>
                <div className="mb-8">
                  <h1 className="text-[26px] sm:text-[30px] font-bold text-[#04080F] tracking-tight mb-2">
                    {stepTitles[1].title}
                  </h1>
                  <p className="text-[13px] sm:text-[14px] text-[#04080F] font-normal leading-relaxed">
                    {stepTitles[1].sub}
                  </p>
                </div>

                <div className="mb-5 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[#04080F]/50 tracking-wide">
                    {selectedTools.length} selected
                  </span>
                  {selectedTools.length > 0 && (
                    <button
                      onClick={() => setSelectedTools([])}
                      className="text-[11px] text-[#4A70B0] font-medium hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6 min-w-0 overflow-hidden">
                  {AI_TOOLS.map((tool) => {
                    const isSelected = selectedTools.includes(tool.value);
                    return (
                      <motion.button
                        key={tool.value}
                        onClick={() => toggleTool(tool.value)}
                        whileHover={isSelected ? {} : { y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className={`relative text-left p-3.5 rounded-2xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-[#4A70B0] bg-[#4A70B0]/12 shadow-[0_0_0_2px_rgba(74,112,176,0.25),0_4px_16px_rgba(74,112,176,0.15)]"
                            : "border-[#A8BDE0]/35 bg-white/70 hover:border-[#4A70B0]/40 hover:bg-white hover:shadow-[0_4px_12px_rgba(74,112,176,0.08)]"
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#4A70B0] flex items-center justify-center shadow-[0_2px_6px_rgba(74,112,176,0.35)]"
                          >
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </motion.div>
                        )}
                        <div className="w-8 h-8 rounded-xl mb-2.5 flex items-center justify-center" style={{ backgroundColor: `${tool.color}18` }}>
                          <AiToolIcon svgPath={tool.svgPath} color={tool.color} />
                        </div>
                        <p className="text-[13px] font-semibold text-[#04080F] mb-0.5">{tool.label}</p>
                        <p className="text-[10px] text-[#04080F]/35 font-medium">{tool.category}</p>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Other tools */}
                <div className="mb-8">
                  <label className="block text-[12px] font-semibold text-[#04080F]/60 tracking-wide mb-2 uppercase">
                    Other tools (optional)
                  </label>
                  <input
                    type="text"
                    value={customTools}
                    onChange={(e) => setCustomTools(e.target.value)}
                    placeholder="e.g. Jasper, Perplexity, Runway..."
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#A8BDE0]/40 bg-white text-[14px] text-[#04080F] placeholder:text-[#04080F]/30 focus:outline-none focus:border-[#4A70B0] focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,112,176,0.15)] transition-all duration-200"
                  />
                </div>

                <div className="flex gap-3">
                  <SecondaryButton onClick={goBack}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                    Back
                  </SecondaryButton>
                  <PrimaryButton onClick={goNext} disabled={!canAdvanceStep2}>
                    Continue
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </PrimaryButton>
                </div>
              </StepWrapper>
            )}

            {/* Step 3 — Plans & Spend */}
            {step === 3 && (
              <StepWrapper stepKey={3}>
                <div className="mb-7">
                  <h1 className="text-[26px] sm:text-[30px] font-bold text-[#04080F] tracking-tight mb-2">
                    {stepTitles[2].title}
                  </h1>
                  <p className="text-[13px] sm:text-[14px] text-[#04080F] font-medium leading-relaxed">
                    {stepTitles[2].sub}
                  </p>
                  <p className="text-[12px] text-[#04080F]/50 mt-1.5 leading-relaxed">
                    We use your current plans, billing cycle, and team size to benchmark your setup against cheaper alternatives.
                  </p>
                </div>

                <div className="space-y-6">

                  {/* Per-tool plans — now the primary section */}
                  {selectedTools.length > 0 && (
                    <div>
                      <label className="block text-[12px] font-semibold text-[#04080F]/60 tracking-wide mb-3 uppercase">
                        Current plans
                      </label>
                      <div className="space-y-2.5">
                        {selectedTools.map((toolKey) => {
                          const tool = AI_TOOLS.find((t) => t.value === toolKey);
                          if (!tool) return null;
                          const plans = TOOL_PLANS[toolKey] || [];
                          return (
                            <div key={toolKey} className="flex items-center gap-3 p-3.5 bg-white/70 rounded-2xl border border-[#A8BDE0]/30 hover:border-[#4A70B0]/25 transition-colors">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tool.color}18` }}>
                                <AiToolIcon svgPath={tool.svgPath} color={tool.color} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-[#04080F] mb-1.5">{tool.label}</p>
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-1 min-w-0">
                                    <select
                                      value={toolPlans[toolKey] || ""}
                                      onChange={(e) => setToolPlans((p) => ({ ...p, [toolKey]: e.target.value }))}
                                      className="w-full text-[12px] text-[#04080F]/70 bg-[#C5D0D8]/20 border border-[#A8BDE0]/30 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-[#4A70B0] focus:shadow-[0_0_0_2px_rgba(74,112,176,0.15)] transition-all"
                                    >
                                      <option value="">Select plan</option>
                                      {plans.map((plan) => (
                                        <option key={plan} value={plan}>{plan}</option>
                                      ))}
                                      <option value="not-sure">Not sure</option>
                                    </select>
                                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#04080F]/35 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                  <div className="relative w-20 flex-shrink-0">
                                    <select
                                      value={toolSpend[toolKey] || ""}
                                      onChange={(e) => setToolSpend((p) => ({ ...p, [toolKey]: e.target.value }))}
                                      className="w-full text-[12px] text-[#04080F]/70 bg-[#C5D0D8]/20 border border-[#A8BDE0]/30 rounded-lg px-2 py-2 pr-6 appearance-none cursor-pointer focus:outline-none focus:border-[#4A70B0] focus:shadow-[0_0_0_2px_rgba(74,112,176,0.15)] transition-all text-center"
                                    >
                                      <option value="">$/mo</option>
                                      <option value="0-20">$0–20</option>
                                      <option value="20-100">$20–100</option>
                                      <option value="100-500">$100–500</option>
                                      <option value="500+">$500+</option>
                                    </select>
                                    <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#04080F]/35 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Billing cycle */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#04080F]/60 tracking-wide mb-3 uppercase">
                      Billing cycle
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {BILLING_CYCLES.map((cycle) => (
                        <motion.button
                          key={cycle.value}
                          onClick={() => setBillingCycle(cycle.value)}
                          whileHover={billingCycle !== cycle.value ? { y: -2, scale: 1.01 } : {}}
                          whileTap={{ scale: 0.98 }}
                          className={`relative py-3.5 rounded-2xl border-2 font-semibold text-[13px] transition-all duration-200 ${
                            billingCycle === cycle.value
                              ? "border-[#4A70B0] bg-gradient-to-b from-[#4A70B0] to-[#3E5F96] text-white shadow-[0_4px_14px_rgba(74,112,176,0.35),0_0_0_1px_rgba(74,112,176,0.3)] scale-[1.01]"
                              : "border-[#A8BDE0]/35 bg-white text-[#04080F] hover:border-[#4A70B0]/50 hover:shadow-[0_4px_12px_rgba(74,112,176,0.1)]"
                          }`}
                        >
                          {cycle.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Total monthly budget */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#04080F]/60 tracking-wide mb-3 uppercase">
                      Total monthly AI budget
                      <span className="ml-1 normal-case font-normal text-[#04080F]/35">(rough estimate)</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {BUDGET_RANGES.map((range, i) => (
                        <motion.button
                          key={i}
                          onClick={() => setBudgetRange(budgetRange === i ? null : i)}
                          whileHover={budgetRange !== i ? { y: -2, scale: 1.01 } : {}}
                          whileTap={{ scale: 0.98 }}
                          className={`relative py-3 px-3 rounded-2xl border-2 font-semibold text-[12px] transition-all duration-200 ${
                            budgetRange === i
                              ? "border-[#4A70B0] bg-[#4A70B0]/10 text-[#4A70B0] shadow-[0_0_0_2px_rgba(74,112,176,0.2),0_4px_14px_rgba(74,112,176,0.15)] scale-[1.01]"
                              : "border-[#A8BDE0]/35 bg-white text-[#04080F]/70 hover:border-[#4A70B0]/40 hover:shadow-[0_4px_12px_rgba(74,112,176,0.08)]"
                          }`}
                        >
                          {budgetRange === i && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#4A70B0] flex items-center justify-center"
                            >
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </motion.div>
                          )}
                          <span className="block text-center leading-tight">{range.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <PrimaryButton onClick={goNext} disabled={!canAdvanceStep3}>
                    Generate Audit Report
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </PrimaryButton>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: canAdvanceStep3 ? 1 : 0.4 }}
                    transition={{ duration: 0.3 }}
                    className="text-center text-[11px] text-[#04080F]/40 mt-3 tracking-wide"
                  >
                    No credit card required
                    <span className="mx-2 text-[#04080F]/25">•</span>
                    Audit takes under 2 minutes
                  </motion.p>
                </div>
              </StepWrapper>
            )}

            {/* Step 4 — Review & Submit */}
            {step === 4 && (
              <StepWrapper stepKey={4}>
                {!submitted ? (
                  <>
                    <div className="mb-8">
                      <h1 className="text-[26px] sm:text-[30px] font-bold text-[#04080F] tracking-tight mb-2">
                        {stepTitles[3].title}
                      </h1>
                      <p className="text-[13px] sm:text-[14px] text-[#04080F] font-normal leading-relaxed">
                        {stepTitles[3].sub}
                      </p>
                    </div>

                    {/* Summary cards */}
                    <div className="space-y-3 mb-6">
                      {/* Est. score */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#A8BDE0]/35 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[12px] font-semibold text-[#04080F]/50 uppercase tracking-wide">Optimization score</p>
                          <span className="text-[11px] text-[#4A70B0] font-semibold bg-[#4A70B0]/8 px-2.5 py-1 rounded-full border border-[#4A70B0]/15">
                            Estimated
                          </span>
                        </div>
                        <div className="flex items-end gap-3">
                          <motion.span
                            key={optScore}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[36px] font-bold text-[#4A70B0] tracking-tight leading-none"
                          >
                            {optScore}
                          </motion.span>
                          <span className="text-[13px] text-[#04080F]/40 mb-1.5">/ 100</span>
                        </div>
                        <div className="mt-2.5 h-1.5 bg-[#A8BDE0]/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${optScore}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="h-full rounded-full bg-gradient-to-r from-[#4A70B0] to-[#8BB4DC]"
                          />
                        </div>
                        <p className="text-[11px] text-[#04080F]/35 mt-2">
                          Based on {selectedTools.length} tools and {selectedBudget?.label}
                        </p>
                      </div>

                      {/* Est. savings */}
                      <div className="bg-gradient-to-br from-[#4A70B0]/8 to-[#8BB4DC]/8 rounded-2xl border border-[#4A70B0]/20 p-5">
                        <p className="text-[12px] font-semibold text-[#4A70B0]/70 uppercase tracking-wide mb-2">
                          Estimated monthly savings
                        </p>
                        <p className="text-[26px] font-bold text-[#4A70B0] tracking-tight">
                          ${estSavingsLow.toLocaleString()}–${estSavingsHigh.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-[#4A70B0]/55 mt-1">Based on typical optimization opportunities for {selectedBudget?.label}</p>
                      </div>

                      {/* Review summary */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#A8BDE0]/35 p-5 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-xl bg-[#4A70B0]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-[#4A70B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[12px] text-[#04080F]/50 mb-0.5">Company</p>
                            <p className="text-[13px] font-semibold text-[#04080F]">{companyName}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-xl bg-[#8BB4DC]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-[#8BB4DC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[12px] text-[#04080F]/50 mb-0.5">Tools selected</p>
                            <p className="text-[13px] font-semibold text-[#04080F]">
                              {selectedTools.map((t) => AI_TOOLS.find((a) => a.value === t)?.label).filter(Boolean).join(", ")}
                              {customTools ? `, ${customTools}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-xl bg-[#A8BDE0]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-[#6B91C4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[12px] text-[#04080F]/50 mb-0.5">Budget</p>
                            <p className="text-[13px] font-semibold text-[#04080F]">
                              {selectedBudget?.label} · {billingCycle === "annual" ? "Annual" : "Monthly"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* What's included */}
                      <div className="bg-[#C5D0D8]/20 rounded-2xl border border-[#A8BDE0]/25 p-4">
                        <p className="text-[11px] font-semibold text-[#04080F]/50 uppercase tracking-wide mb-3">Your audit will include</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Per-tool savings breakdown",
                            "Plan optimization suggestions",
                            "Team spend attribution",
                            "AI-generated plain-English summary",
                            "Shareable PDF report",
                            "Actionable recommendations",
                          ].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-[#4A70B0] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              <span className="text-[11px] text-[#04080F]/55">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <SecondaryButton onClick={goBack}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                        Back
                      </SecondaryButton>
                      <PrimaryButton onClick={handleSubmit} disabled={submitting} loading={submitting}>
                        {submitting ? "Analyzing your spend…" : "Generate Audit Report"}
                        {!submitting && (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        )}
                      </PrimaryButton>
                    </div>
                  </>
                ) : (
                  /* Success state */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4A70B0] to-[#3E5F96] flex items-center justify-center mx-auto mb-6 shadow-glow-xl"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </motion.div>

                    <h2 className="text-[24px] sm:text-[28px] font-bold text-[#04080F] mb-3">
                      Audit report generating…
                    </h2>
                    <p className="text-[14px] sm:text-[15px] text-[#04080F]/55 font-light max-w-sm mx-auto mb-8">
                      We're analyzing your {selectedTools.length} tools and generating your personalized report. This usually takes under 30 seconds.
                    </p>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#A8BDE0]/35 p-6 max-w-sm mx-auto">
                      <div className="space-y-3">
                        {[
                          { label: "Benchmarking plans", done: true },
                          { label: "Finding redundancies", done: true },
                          { label: "Calculating savings", done: true },
                          { label: "Generating summary", done: false },
                        ].map((item, i) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.15 }}
                            className="flex items-center gap-3"
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? "bg-[#4A70B0]/10" : "bg-[#A8BDE0]/20"}`}>
                              {item.done ? (
                                <svg className="w-3 h-3 text-[#4A70B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              ) : (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-3 h-3 border-2 border-[#A8BDE0]/50 border-t-[#A8BDE0] rounded-full"
                                />
                              )}
                            </div>
                            <span className={`text-[13px] ${item.done ? "text-[#04080F]/55" : "text-[#04080F]/35"}`}>{item.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </StepWrapper>
            )}
          </motion.div>
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}