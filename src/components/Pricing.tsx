"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SALES_EMAIL, STARTER_FOOTNOTE, STARTER_SPEND_LIMIT } from "@/lib/marketing-copy";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: `Run your first audit for teams with ${STARTER_SPEND_LIMIT}. No card, no commitment.`,
    features: [
      "Unlimited AI tools",
      "Single team audit",
      "Full savings report",
      "PDF export",
      "Shareable link",
      "AI summary",
    ],
    cta: "Start free audit",
    href: "/audit",
    highlight: true,
  },
  {
    name: "Pro",
    price: "Custom",
    period: "",
    description: "Custom pricing for teams above the Starter spend limit or needing multiple audits.",
    features: [
      "Everything in Starter",
      "Multiple team audits",
      "Historical tracking",
      "Priority support",
      "Custom recommendations",
      "Slack / email alerts",
    ],
    cta: "Get in touch",
    href: `mailto:${SALES_EMAIL}?subject=CostIQ%20Pro`,
    highlight: false,
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
{/* Solid background */}
      <div className="absolute inset-0 bg-white" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        <div ref={ref} className="text-center mb-12 sm:mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#141414] mb-4"
          >
            <span className="w-1.5 h-1.5 bg-[#141414] rounded-full" />
            Pricing
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[28px] xs:text-[32px] sm:text-[36px] md:text-[48px] font-bold tracking-tight text-[#03045e] mb-3 sm:mb-4"
          >
            Free to start,{" "}
            <span className="text-[#141414]">pay when it counts</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[14px] sm:text-[15px] md:text-[16px] text-[#03045e]/70 max-w-xl mx-auto font-medium px-2"
          >
            One audit. Real insights. No subscription needed to see your numbers.
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
                  ? "bg-[#141414] text-white border-transparent shadow-lg"
                  : "bg-[#ebebeb]/90 backdrop-blur-sm border-[#48cae4]/40 hover:borde14141466c8]/40"
              } hover:-translate-y-1 transition-all duration-200 flex flex-col`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] sm:text-[11px] font-semibold bg-[#03045e] text-white px-3.5 py-1 rounded-full shadow-md tracking-wide">
                    Recommended
                  </span>
                </div>
              )}

              <div className="mb-5 sm:mb-6">
                <h3 className={`text-[15px] sm:text-[16px] font-semibold mb-1 ${plan.highlight ? "text-white" : "text-[#03045e]"}`}>
                  {plan.name}
                </h3>
                <p className={`text-[13px] ${plan.highlight ? "text-white/65" : "text-[#03045e]/55"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6 sm:mb-7">
                <span className={`text-[32px] sm:text-[38px] font-bold tracking-tight ${plan.highlight ? "text-white" : "text-[#03045e]"}`}>
                  {plan.price}
                </span>
              </div>

              <ul className="space-y-2.5 mb-7 sm:mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <svg
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-white/70" : "text-[#141414]"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className={`text-[13px] ${plan.highlight ? "text-white/75" : "text-[#03045e]/65"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`btn-label-xs block text-center px-5 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${
                  plan.highlight
                    ? "bg-white text-[#141414] hover:shadow-lg active:translate-y-0"
                    : "bg-[#90e0ef]/50 text-[#03045e]/70 hover:bg-[#141414] hover:text-white border border-[#48cae4]/40"
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
          className="text-center text-[12px] sm:text-[13px] text-[#03045e]/50 mt-8"
        >
          {STARTER_FOOTNOTE}
        </motion.p>
      </div>
    </section>
  );
}