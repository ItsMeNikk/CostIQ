"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const tools = [
  { name: "OpenAI", category: "LLMs", svgPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-5 5 5h-4v4h-2z", color: "#10A37F" },
  { name: "Anthropic", category: "LLMs", svgPath: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", color: "#D4A27F" },
  { name: "AWS Bedrock", category: "Cloud AI", svgPath: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5", color: "#FF9900" },
  { name: "Google Vertex", category: "Cloud AI", svgPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z", color: "#4285F4" },
  { name: "Azure OpenAI", category: "Cloud AI", svgPath: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5", color: "#0078D4" },
  { name: "Hugging Face", category: "ML Platform", svgPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z", color: "#FFD21E" },
  { name: "Replicate", category: "Inference", svgPath: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", color: "#6B91C4" },
  { name: "Cohere", category: "LLMs", svgPath: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3m0 0L5 14.5", color: "#E05252" },
  { name: "Mistral", category: "LLMs", svgPath: "M3.75 18L9 11.25l4.306 4.307a2.25 2.25 0 010-3.142l4.306-4.306L12 6l-8.25 12z", color: "#EB323B" },
  { name: "Vercel AI", category: "Developer Tools", svgPath: "M12 2L2 12l10 10 10-10L12 2zm0 4l6 6-6 6-6-6 6-6z", color: "#000000" },
  { name: "LangChain", category: "Developer Tools", svgPath: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", color: "#6B91C4" },
  { name: "Scale AI", category: "Data Platform", svgPath: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4", color: "#141414" },
];

export default function TrustedBy() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-12 sm:py-16 border-y border-[#48cae4]/25 bg-[#ebebeb]/50 backdrop-blur-sm overflow-hidden w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.p
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center text-[11px] text-[#03045e]/40 mb-6 sm:mb-8 uppercase tracking-[0.18em] font-semibold"
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
              className="group flex flex-col items-center gap-1 sm:gap-1.5 p-3 sm:p-4 bg-[#ebebeb]/60 rounded-xl sm:rounded-2xl border border-[#48cae4]/30 hover:borde14141466c8]/35 hover:bg-[#ebebeb] hover:shadow-card transition-all duration-200 cursor-default"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200" style={{ backgroundColor: `${tool.color}18` }}>
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke={tool.color} strokeWidth={1.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tool.svgPath} />
                </svg>
              </div>
              <span className="text-[11px] sm:text-[13px] font-semibold text-[#03045e] text-center">{tool.name}</span>
              <span className="text-[10px] sm:text-[11px] text-[#03045e]/60 hidden sm:block">{tool.category}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}