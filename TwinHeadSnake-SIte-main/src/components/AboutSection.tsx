"use client";

import { useState } from "react";
import { useStats } from "@/lib/homepageContext";
import { UserX, Bot } from "lucide-react";

const comparisonData = [
  { human: "Buy high, sell low", bot: "Data-driven execution" },
  { human: "Miss opportunities sleeping", bot: "24/7 market coverage" },
  { human: "Panic sell during dips", bot: "Auto buy the dip" },
  { human: "FOMO into bad trades", bot: "Strict entry rules" },
];

const techStack = [
  { label: "Indicators", value: "16+", color: "#00ffaa" },
  { label: "Training Data", value: "5Y", color: "#4488ff" },
  { label: "Response", value: "<1s", color: "#ffaa00" },
  { label: "Uptime", value: "99.9%", color: "#aa66ff" },
];

export default function AboutSection() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const stats = useStats();

  return (
    <section id="about" className="py-32 relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-[#040408]" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#00ffaa]/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#4488ff]/5 rounded-full blur-[120px]" />

      <div className="max-w-[1100px] mx-auto px-6 relative z-10">
        {}
        <div className="mb-24">
          <p className="text-[#00ffaa] text-sm font-medium tracking-widest uppercase mb-4">
            The Technology
          </p>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8">
            Humans lose money
            <br />
            <span className="text-[#4a4a5f]">Algorithms don&apos;t</span>
          </h2>
          <p className="text-[#7a7a8f] text-xl max-w-2xl">
            While you sleep, panic, or hesitate — our bot executes with mathematical precision. No emotions. No FOMO. Just profits.
          </p>
        </div>

        {}
        <div className="mb-32 hidden md:block">
          {}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <UserX className="w-6 h-6 text-[#ff4466]" />
              <span className="text-[#ff4466] font-medium">Human Traders</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#00ffaa] font-medium">TwinHeadSnake</span>
              <Bot className="w-6 h-6 text-[#00ffaa]" />
            </div>
          </div>

          {}
          <div className="space-y-1">
            {comparisonData.map((row, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                className="group grid grid-cols-[1fr_auto_1fr] items-center py-5 border-b border-white/5 cursor-default transition-all"
              >
                {}
                <div className={`flex items-center gap-4 transition-all duration-300 ${
                  hoveredRow === i ? "opacity-40 -translate-x-2" : ""
                }`}>
                  <svg className="w-5 h-5 text-[#ff4466]/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#6a6a7f]">{row.human}</span>
                </div>

                {}
                <div className="w-32 mx-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent relative">
                  <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300 ${
                    hoveredRow === i 
                      ? "bg-[#00ffaa] scale-150 shadow-[0_0_20px_rgba(0,255,170,0.8)]" 
                      : "bg-[#2a2a3f]"
                  }`} />
                </div>

                {}
                <div className={`flex items-center justify-end gap-4 transition-all duration-300 ${
                  hoveredRow === i ? "translate-x-2" : ""
                }`}>
                  <span className={`transition-colors ${hoveredRow === i ? "text-white" : "text-[#9a9aaf]"}`}>
                    {row.bot}
                  </span>
                  <svg className={`w-5 h-5 flex-shrink-0 transition-colors ${hoveredRow === i ? "text-[#00ffaa]" : "text-[#00ffaa]/60"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {}
          <div className="flex items-center justify-between mt-12 pt-8">
            <div>
              <div className="text-4xl font-bold font-mono text-[#ff4466]/60">~20%</div>
              <div className="text-sm text-[#5a5a6f]">average win rate</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-px bg-gradient-to-r from-[#ff4466]/30 to-transparent" />
              <span className="text-[#3a3a4f] text-sm">vs</span>
              <div className="w-24 h-px bg-gradient-to-l from-[#00ffaa]/30 to-transparent" />
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold font-mono text-[#00ffaa]">{stats.lastYearAvgWinRate.toFixed(0)}%</div>
              <div className="text-sm text-[#00ffaa]/60">verified win rate</div>
            </div>
          </div>
        </div>

        {}
        <div className="mb-24 md:hidden">
          {}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <UserX className="w-5 h-5 text-[#ff4466]" />
              <span className="text-[#ff4466] font-medium text-sm">Human Traders</span>
            </div>
            <div className="space-y-3">
              {comparisonData.map((row, i) => (
                <div key={i} className="flex items-center gap-3 text-[#6a6a7f] text-sm">
                  <svg className="w-4 h-4 text-[#ff4466]/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>{row.human}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="text-3xl font-bold font-mono text-[#ff4466]/60">~20%</div>
              <div className="text-xs text-[#5a5a6f]">average win rate</div>
            </div>
          </div>

          {}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-[#3a3a4f] text-sm font-medium">VS</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-[#00ffaa]" />
              <span className="text-[#00ffaa] font-medium text-sm">TwinHeadSnake</span>
            </div>
            <div className="space-y-3">
              {comparisonData.map((row, i) => (
                <div key={i} className="flex items-center gap-3 text-[#9a9aaf] text-sm">
                  <svg className="w-4 h-4 text-[#00ffaa]/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{row.bot}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="text-4xl font-bold font-mono text-[#00ffaa]">{stats.lastYearAvgWinRate.toFixed(0)}%</div>
              <div className="text-xs text-[#00ffaa]/60">verified win rate</div>
            </div>
          </div>
        </div>

        {}
        <div className="relative">
          <p className="text-[#5a5a6f] text-sm uppercase tracking-widest mb-12">Powered by</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {techStack.map((tech, i) => (
              <div key={i} className="text-center group cursor-default">
                <div 
                  className="text-5xl md:text-6xl font-bold font-mono mb-2 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: tech.color }}
                >
                  {tech.value}
                </div>
                <div className="text-[#5a5a6f] text-sm">{tech.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
