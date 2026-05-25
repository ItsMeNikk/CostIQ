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
      {/* Solid background */}
      <div className="absolute inset-0 bg-[#c8eaf2]" />
      <div className="absolute inset-0 grid-bg" />

      {/* Layered depth orbs — mouse parallax */}
      <div ref={orb1Ref} className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#0096c7]/10 rounded-full blur-[100px] animate-pulse sm:w-[250px] sm:h-[250px] sm:blur-[80px] transition-transform duration-1000 ease-out will-change-transform" style={{ animationDelay: "0s" }} />
      <div ref={orb2Ref} className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-[#48cae4]/15 rounded-full blur-[80px] animate-pulse sm:hidden transition-transform duration-1000 ease-out will-change-transform" style={{ animationDelay: "2s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[700px] aspect-square bg-[#0096c7]/5 rounded-full blur-[160px] sm:max-w-[400px] sm:blur-[100px]" />

      
      {/* Floating AI tool badges — desktop only */}
      {floatingIcons.map((icon) => (
        <motion.div
          key={icon.label}
          className="absolute hidden lg:flex items-center gap-2 px-4 py-2.5 bg-[#ebebeb]/80 backdrop-blur-xl rounded-2xl shadow-card border border-[#48cae4]/30"
          style={{ left: icon.x, top: icon.y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: [0, -14, 0] }}
          transition={{
            opacity: { delay: icon.delay, duration: 0.8 },
            scale: { delay: icon.delay, duration: 0.8 },
            y: { delay: icon.delay, duration: 10 + icon.delay, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <div className="w-5 h-5 rounded-md bg-[#141414]/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-[#141414]" viewBox="0 0 24 24" fill="currentColor">
              <path d={iconSvgPaths[icon.label]} />
            </svg>
          </div>
          <span className="text-[12px] font-semibold text-[#03045e]/65 tracking-wide">{icon.label}</span>
        </motion.div>
      ))}

      {/* Hero content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 pt-36 sm:pt-44 pb-20 sm:pb-36 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-1.5 bg-[#141414]/10 border border-[#141414]/20 rounded-full mb-8 sm:mb-10"
        >
          <span className="w-1.5 h-1.5 bg-[#141414] rounded-full animate-pulse" />
          <span className="text-[11px] sm:text-[12px] font-semibold tracking-wide text-[#141414]">
            Now in public beta — free for early teams
          </span>
        </motion.div>

        {/* Headline with depth glow */}
        <div className="relative inline-block mb-5 sm:mb-6">
          <div className="absolute inset-0 blur-[100px] opacity-[0.08] sm:blur-[80px]">
            <div className="w-full h-full bg-[#141414] rounded-full" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative text-[36px] xs:text-[44px] sm:text-[52px] md:text-[72px] lg:text-[80px] font-bold tracking-tight leading-[1.08] sm:leading-[1.05] text-[#03045e]"
          >
            Find hidden AI costs.
            <br />
            <span className="text-[#141414]">Save more.</span> Spend smarter.
          </motion.h1>
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[15px] sm:text-[16px] md:text-[19px] text-[#03045e]/75 max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-14 font-light px-2"
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-label group inline-flex items-center gap-3 sm:gap-3.5 px-7 sm:px-9 py-3.5 sm:py-4 rounded-[10px] text-white bg-[#0a0a12] hover:bg-[#14141f] transition-colors duration-200 w-full sm:w-auto justify-center"
          >
            <span>Audit my AI spend</span>
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

          {/* Secondary CTA */}
          <motion.a
            href="/report/demo"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-label group inline-flex items-center gap-3 sm:gap-3.5 px-7 sm:px-9 py-3.5 sm:py-4 rounded-[10px] text-[#03045e] bg-white hover:bg-[#f5f6f8] border border-[#03045e]/10 transition-colors duration-200 w-full sm:w-auto justify-center"
          >
            <svg
              className="w-4 h-4 text-[#03045e]/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>View sample report</span>
          </motion.a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-5 sm:gap-8"
        >
          {[
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.877a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />,
              text: "Trusted by 2,400+ teams",
              color: "#0466c8",
            },
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />,
              text: "100% private — no data stored",
              color: "#48cae4",
            },
            {
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
              text: "Audit ready in under 2 min",
              color: "#00b4d8",
            },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-[12px] sm:text-[13px] text-[#03045e]/55 font-medium">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke={item.color} strokeWidth={1.5}>
                {item.icon}
              </svg>
              {item.text}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dashboard preview */}
      <Dashboard />
    </section>
  );
}