"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Dashboard", href: "#dashboard" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
    { label: "Cookie policy", href: "#" },
  ],
};

export default function Footer() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer className="bg-[#1E2A3A] pt-16 pb-10 w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2.5 mb-4 -ml-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4A70B0] to-[#3E5F96] flex items-center justify-center shadow-btn-primary">
                <span className="text-white font-bold text-sm tracking-tight">$</span>
              </div>
              <span className="font-semibold text-[15px] tracking-tight text-white">CostIQ</span>
            </a>
            <p className="text-[13px] text-white/50 leading-relaxed max-w-xs mb-6 font-light">
              AI spend auditing for engineering teams who want to stop guessing and start optimizing.
            </p>
            <div className="flex items-center gap-2.5">
              {[
                {
                  label: "X (Twitter)",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />,
                },
                {
                  label: "LinkedIn",
                  icon: <path d="M16 8a6 6 0 016 6v7.5h-4.5V8a2.25 2.25 0 10-4.5 0v7.5h-4.5V14a2.25 2.25 0 114.5 0v3.25" fill="none" stroke="currentColor" strokeWidth={1.5} />,
                },
                {
                  label: "GitHub",
                  icon: <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" />,
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg bg-white/8 border border-white/12 flex items-center justify-center text-white/35 hover:text-[#8BB4DC] hover:border-[#8BB4DC]/30 hover:bg-white/12 transition-colors duration-200"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13px] text-white/45 hover:text-[#8BB4DC] transition-colors duration-200 tracking-wide"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="pt-7 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3"
        >
          <p className="text-[11px] text-white/30 tracking-wide">
            &copy; 2025 CostIQ, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4A70B0] animate-pulse" />
            <span className="text-[11px] text-white/30 tracking-wide">All systems operational</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}