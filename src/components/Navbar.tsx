"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full max-w-[100vw] transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-2xl border-b border-[#A8BDE0]/30 shadow-soft-md"
          : "bg-white/60 backdrop-blur-md"
      }`}
    >
      <nav className="max-w-5xl mx-auto px-5 sm:px-8 h-[60px] sm:h-[68px] flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group -ml-1">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#4A70B0] to-[#3E5F96] flex items-center justify-center shadow-btn-primary group-hover:shadow-btn-primary-hover group-hover:scale-105 transition-all duration-200"
          >
            <span className="text-white font-bold text-xs sm:text-sm tracking-tight">$</span>
          </div>
          <span className="font-semibold text-[14px] sm:text-[15px] tracking-tight text-[#04080F]">CostIQ</span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-7 lg:gap-9">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-[12px] sm:text-[13px] font-medium text-[#04080F]/55 tracking-wide hover:text-[#4A70B0] transition-colors duration-200 relative after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[1px] after:bg-[#4A70B0] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href="/audit"
            className="text-[12px] sm:text-[13px] font-semibold tracking-wide bg-gradient-to-br from-[#4A70B0] to-[#3E5F96] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-btn-primary hover:shadow-btn-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Get started free
          </a>
        </div>

        {/* Mobile menu button — touch friendly */}
        <button
          className="md:hidden p-2.5 -mr-2.5"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <motion.span
              animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 9 : 0 }}
              className="h-[2px] bg-[#04080F] block origin-center rounded-full"
            />
            <motion.span
              animate={{ opacity: mobileOpen ? 0 : 1, scaleX: mobileOpen ? 0 : 1 }}
              className="h-[2px] bg-[#04080F] block rounded-full"
            />
            <motion.span
              animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -9 : 0 }}
              className="h-[2px] bg-[#04080F] block origin-center rounded-full"
            />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-[#A8BDE0]/30 overflow-hidden"
          >
            <div className="px-5 py-5 flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[14px] font-medium text-[#04080F]/60 hover:text-[#4A70B0] transition-colors py-3 block"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 mt-3 border-t border-[#A8BDE0]/30">
                <a
                  href="/audit"
                  onClick={() => setMobileOpen(false)}
                  className="text-[14px] font-semibold bg-gradient-to-br from-[#4A70B0] to-[#3E5F96] text-white px-5 py-3 rounded-xl block text-center shadow-btn-primary"
                >
                  Get started free
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}