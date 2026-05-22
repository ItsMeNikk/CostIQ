"use client";

import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import Dashboard from "./Dashboard";
import { HERO_TRUST_LINE } from "@/lib/marketing-copy";

const floatingIcons = [
  { label: "OpenAI", x: "10%", y: "22%", delay: 0 },
  { label: "Anthropic", x: "85%", y: "18%", delay: 0.7 },
  { label: "AWS", x: "8%", y: "68%", delay: 1.4 },
  { label: "Azure", x: "88%", y: "62%", delay: 2.1 },
  { label: "Vercel", x: "15%", y: "84%", delay: 0.4 },
  { label: "Google Cloud", x: "80%", y: "80%", delay: 1.1 },
];

const iconSvgPaths: Record<string, string> = {
  OpenAI: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  Anthropic: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z",
  AWS: "M17.73 10.27c-.08-.25-.35-.39-.6-.31-3.41 1.01-7.64.54-10.65-1.33-.28-.17-.64-.11-.81.14-.17.25-.11.61.14.78 2.74 1.7 6.54 2.14 9.64 1.15.3-.1.49-.39.41-.68-.06-.25-.2-.42-.38-.56-.17-.14-.38-.21-.58-.23-.21-.02-.42 0-.63.05-.2.05-.39.13-.56.25zm-9.47 4.24c-.3 0-.55-.24-.55-.54s.25-.55.55-.55.55.24.55.54-.25.55-.55.55zm5.74-2.44c-.22 0-.4-.18-.4-.4s.18-.4.4-.4.4.18.4.4-.18.4-.4.4zm0-1.58c-.22 0-.4-.18-.4-.4s.18-.4.4-.4.4.18.4.4-.18.4-.4.4zm-.39.79c-.22 0-.4-.18-.4-.4s.18-.4.4-.4.4.18.4.4-.18.4-.4.4z",
  Azure: "M12 2L2 12l10 10 10-10L12 2zm0 3.41L18.59 12 12 18.59 5.41 12 12 5.41z",
  Vercel: "M12 2L2 12l10 10 10-10L12 2zm0 4l6 6-6 6-6-6 6-6z",
  "Google Cloud": "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
};

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!sectionRef.current || !glowRef.current || !orb1Ref.current || !orb2Ref.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

      glowRef.current.style.transform = `translate(calc(-50% + ${x * 20}px), calc(-50% + ${y * 15}px))`;
      orb1Ref.current.style.transform = `translate(${x * -12}px, ${y * -8}px)`;
      orb2Ref.current.style.transform = `translate(${x * 10}px, ${y * 8}px)`;
    };

    const el = sectionRef.current;
    if (el) el.addEventListener("mousemove", handleMouse);
    return () => {
      if (el) el.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden">
      {/* Rich layered gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#B8C4CE] via-[#C0CACE] to-[#B8C4CE]" />
      <div className="absolute inset-0 grid-bg" />

      {/* Layered depth orbs — mouse parallax */}
      <div ref={orb1Ref} className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#4A70B0]/10 rounded-full blur-[100px] animate-pulse sm:w-[250px] sm:h-[250px] sm:blur-[80px] transition-transform duration-1000 ease-out will-change-transform" style={{ animationDelay: "0s" }} />
      <div ref={orb2Ref} className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-[#8BB4DC]/15 rounded-full blur-[80px] animate-pulse sm:hidden transition-transform duration-1000 ease-out will-change-transform" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[900px] h-[600px] bg-gradient-to-b from-[#8BB4DC]/15 via-[#A8BDE0]/10 to-transparent rounded-[0_0_100%_100%] sm:max-w-[600px] sm:h-[400px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[700px] aspect-square bg-[#4A70B0]/5 rounded-full blur-[160px] sm:max-w-[400px] sm:blur-[100px]" />

      {/* Animated gradient glow behind headline */}
      <div
        ref={glowRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none will-change-transform"
        style={{ transition: "transform 0.8s ease-out" }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(74,112,176,0.12) 0%, rgba(74,112,176,0.05) 40%, transparent 70%)",
            animation: "glowPulse 4s ease-in-out infinite",
          }}
        />
      </div>

      {/* Floating AI tool badges — desktop only */}
      {floatingIcons.map((icon) => (
        <motion.div
          key={icon.label}
          className="absolute hidden lg:flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-card border border-[#A8BDE0]/30"
          style={{ left: icon.x, top: icon.y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: [0, -14, 0] }}
          transition={{
            opacity: { delay: icon.delay, duration: 0.8 },
            scale: { delay: icon.delay, duration: 0.8 },
            y: { delay: icon.delay, duration: 10 + icon.delay, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#4A70B0]/20 to-[#8BB4DC]/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-[#4A70B0]" viewBox="0 0 24 24" fill="currentColor">
              <path d={iconSvgPaths[icon.label]} />
            </svg>
          </div>
          <span className="text-[12px] font-semibold text-[#04080F]/65 tracking-wide">{icon.label}</span>
        </motion.div>
      ))}

      {/* Hero content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 pt-36 sm:pt-44 pb-20 sm:pb-36 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-1.5 bg-[#4A70B0]/10 border border-[#4A70B0]/20 rounded-full mb-8 sm:mb-10"
        >
          <span className="w-1.5 h-1.5 bg-[#4A70B0] rounded-full animate-pulse" />
          <span className="text-[11px] sm:text-[12px] font-semibold tracking-wide text-[#4A70B0]">
            Now in public beta — free for early teams
          </span>
        </motion.div>

        {/* Headline with depth glow */}
        <div className="relative inline-block mb-5 sm:mb-6">
          <div className="absolute inset-0 blur-[100px] opacity-[0.08] sm:blur-[80px]">
            <div className="w-full h-full bg-[#4A70B0] rounded-full" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative text-[36px] xs:text-[44px] sm:text-[52px] md:text-[72px] lg:text-[80px] font-bold tracking-tight leading-[1.08] sm:leading-[1.05] text-[#04080F]"
          >
            Find hidden AI costs.
            <br />
            <span className="text-[#4A70B0]">Save more.</span> Spend smarter.
          </motion.h1>
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[15px] sm:text-[16px] md:text-[19px] text-[#04080F]/55 max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-14 font-light px-2"
        >
          CostIQ analyzes your AI subscriptions and cloud credits to uncover
          overspending and smarter alternatives — in minutes, not months.
        </motion.p>

        {/* CTA buttons — premium style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 px-2"
        >
          {/* Primary CTA */}
          <motion.a
            href="/audit"
            whileHover={{ y: -3, scale: 1.025 }}
            whileTap={{ scale: 0.975 }}
            className="group relative inline-flex items-center gap-3 sm:gap-3.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-semibold text-[14px] sm:text-[15px] tracking-[-0.01em] text-white overflow-hidden w-full sm:w-auto justify-center"
            style={{
              background: "linear-gradient(135deg, #3E5F96 0%, #4A70B0 50%, #507DBC 100%)",
              boxShadow: "0 4px 16px rgba(74,112,176,0.35), 0 2px 4px rgba(74,112,176,0.2), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.07] to-transparent" />
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <span className="relative z-10">Audit my AI spend</span>
            <div className="relative z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </motion.a>

          {/* Secondary CTA */}
          <motion.a
            href="#dashboard"
            whileHover={{ y: -3, scale: 1.025 }}
            whileTap={{ scale: 0.975 }}
            className="group relative inline-flex items-center gap-3 sm:gap-3.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-medium text-[14px] sm:text-[15px] tracking-[-0.01em] overflow-hidden w-full sm:w-auto justify-center"
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "1.5px solid rgba(168,189,224,0.55)",
              color: "#04080F",
              boxShadow: "0 2px 8px rgba(4,8,15,0.06), 0 1px 2px rgba(4,8,15,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: "rgba(74,112,176,0.04)" }} />
            <div className="absolute inset-0 rounded-2xl border border-[#4A70B0]/0 group-hover:border-[#4A70B0]/40 transition-colors duration-200" />
            <div className="relative z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl" style={{ background: "rgba(74,112,176,0.1)" }}>
              <svg className="w-3.5 h-3.5" style={{ color: "#4A70B0" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="relative z-10 font-medium">View sample report</span>
          </motion.a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-14 sm:mt-20 flex flex-col items-center gap-4 sm:gap-5"
        >
          {/* Avatar + text row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            {/* Avatar group */}
            <div className="flex items-center">
              {[
                { color: "#4A70B0", initials: "SC" },
                { color: "#8BB4DC", initials: "MT" },
                { color: "#A8BDE0", initials: "PP" },
                { color: "#6B91C4", initials: "JK" },
                { color: "#3E5F96", initials: "AL" },
              ].map((avatar, i) => (
                <div
                  key={i}
                  className="relative flex items-center justify-center rounded-full border-[2px] border-white shadow-sm overflow-hidden"
                  style={{
                    width: "36px",
                    height: "36px",
                    marginLeft: i === 0 ? "0" : "-10px",
                    zIndex: 5 - i,
                    backgroundColor: avatar.color,
                  }}
                >
                  <span className="text-white font-bold text-[10px] sm:text-[11px]">{avatar.initials}</span>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-full" />
                </div>
              ))}
            </div>

            {/* Separator */}
            <div className="hidden sm:block w-px h-6 bg-[#A8BDE0]/50" />

            {/* Text */}
            <p className="text-[13px] sm:text-[14px] text-[#04080F]/75 font-medium leading-tight text-center sm:text-left">
              <span className="font-bold text-[#04080F]">2,400+</span> engineering teams already auditing smarter
            </p>
          </div>

          {/* Supporting detail */}
          <p className="text-[11px] sm:text-[12px] text-[#04080F]/45 tracking-wide text-center px-4">
            {HERO_TRUST_LINE}
          </p>
        </motion.div>
      </div>

      {/* Dashboard preview */}
      <Dashboard />
    </section>
  );
}