"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Run your first audit, see where you stand. No card, no commitment.",
    features: [
      "Unlimited AI tools",
      "Single team audit",
      "Full savings report",
      "PDF export",
      "Shareable link",
      "AI summary",
    ],
    cta: "Start free audit",
    highlight: true,
  },
  {
    name: "Pro",
    price: "Custom",
    period: "",
    description: "For growing teams with complex AI stacks and multiple audits.",
    features: [
      "Everything in Starter",
      "Multiple team audits",
      "Historical tracking",
      "Priority support",
      "Custom recommendations",
      "Slack / email alerts",
    ],
    cta: "Get in touch",
    highlight: false,
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="py-16 sm:py-20 md:py-28 relative">
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#C5D0D8]/40 to-[#C5D0D8]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        <div ref={ref} className="text-center mb-12 sm:mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4A70B0] mb-4"
          >
            <span className="w-1.5 h-1.5 bg-[#4A70B0] rounded-full" />
            Pricing
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[28px] xs:text-[32px] sm:text-[36px] md:text-[48px] font-bold tracking-tight text-[#04080F] mb-3 sm:mb-4"
          >
            Free to start,{" "}
            <span className="text-[#4A70B0]">pay when it counts</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[14px] sm:text-[15px] md:text-[16px] text-[#04080F]/55 max-w-xl mx-auto font-light px-2"
          >
            One audit. Real insights. No subscription required to see your numbers.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 max-w-2xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
              className={`relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 border ${
                plan.highlight
                  ? "bg-gradient-to-br from-[#4A70B0] to-[#3E5F96] text-white border-transparent shadow-glow-xl"
                  : "bg-white/90 backdrop-blur-sm border-[#A8BDE0]/40 hover:border-[#4A70B0]/40"
              } hover:-translate-y-1 transition-all duration-200 flex flex-col`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] sm:text-[11px] font-semibold bg-[#04080F] text-white px-3.5 py-1 rounded-full shadow-md tracking-wide">
                    Recommended
                  </span>
                </div>
              )}

              <div className="mb-5 sm:mb-6">
                <h3 className={`text-[15px] sm:text-[16px] font-semibold mb-1 ${plan.highlight ? "text-white" : "text-[#04080F]"}`}>
                  {plan.name}
                </h3>
                <p className={`text-[13px] ${plan.highlight ? "text-white/65" : "text-[#04080F]/55"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6 sm:mb-7">
                <span className={`text-[32px] sm:text-[38px] font-bold tracking-tight ${plan.highlight ? "text-white" : "text-[#04080F]"}`}>
                  {plan.price}
                </span>
              </div>

              <ul className="space-y-2.5 mb-7 sm:mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <svg
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-white/70" : "text-[#4A70B0]"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className={`text-[13px] ${plan.highlight ? "text-white/75" : "text-[#04080F]/65"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#cta"
                className={`block text-center text-[13px] font-semibold tracking-wide px-5 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${
                  plan.highlight
                    ? "bg-white text-[#4A70B0] hover:shadow-lg active:translate-y-0"
                    : "bg-[#C5D0D8]/50 text-[#04080F]/70 hover:bg-[#4A70B0] hover:text-white border border-[#A8BDE0]/40"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-center text-[12px] sm:text-[13px] text-[#04080F]/50 mt-8"
        >
          Starter is free forever. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}