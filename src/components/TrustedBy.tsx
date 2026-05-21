"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const tools = [
  { name: "OpenAI", category: "LLMs" },
  { name: "Anthropic", category: "LLMs" },
  { name: "AWS Bedrock", category: "Cloud AI" },
  { name: "Google Vertex", category: "Cloud AI" },
  { name: "Azure OpenAI", category: "Cloud AI" },
  { name: "Hugging Face", category: "ML Platform" },
  { name: "Replicate", category: "Inference" },
  { name: "Cohere", category: "LLMs" },
  { name: "Mistral", category: "LLMs" },
  { name: "Vercel AI", category: "Developer Tools" },
  { name: "LangChain", category: "Developer Tools" },
  { name: "Scale AI", category: "Data Platform" },
];

export default function TrustedBy() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-12 sm:py-16 border-y border-[#A8BDE0]/25 bg-white/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.p
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center text-[11px] text-[#04080F]/40 mb-6 sm:mb-8 uppercase tracking-[0.18em] font-semibold"
        >
          Auditing spend across your entire AI stack
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3"
        >
          {tools.map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.04 }}
              className="group flex flex-col items-center gap-1 sm:gap-1.5 p-3 sm:p-4 bg-white/60 rounded-xl sm:rounded-2xl border border-[#A8BDE0]/30 hover:border-[#4A70B0]/35 hover:bg-white hover:shadow-card transition-all duration-200 cursor-default"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#A8BDE0]/15 flex items-center justify-center group-hover:bg-[#4A70B0]/10 transition-colors duration-200">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#04080F]/40 group-hover:text-[#4A70B0] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <span className="text-[11px] sm:text-[13px] font-semibold text-[#04080F] text-center">{tool.name}</span>
              <span className="text-[10px] sm:text-[11px] text-[#04080F]/60 hidden sm:block">{tool.category}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}