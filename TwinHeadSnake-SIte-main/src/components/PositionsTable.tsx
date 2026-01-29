"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePositions, useStats } from "@/lib/homepageContext";
import { formatPrice, formatSymbol } from "@/lib/api";

export default function PositionsTable() {
  const positions = usePositions();
  const stats = useStats();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  
  const statsDisplay = [
    { label: "Year PnL", value: `+${stats.lastYearPnl.toFixed(0)}%`, color: "#00ffaa", highlight: true },
    { label: "Unrealized PnL", value: `+${stats.unrealizedPnl.toFixed(1)}%`, color: "#00ffaa", highlight: false },
    { label: "Win Rate", value: `${stats.lastYearWinRate.toFixed(1)}%`, color: "#00ffaa", highlight: false },
    { label: "Active Positions", value: `${stats.openPositions}`, color: "#ffffff", highlight: false },
  ];

  return (
    <section id="positions" className="py-32 relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-[#030306]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00ffaa]/5 rounded-full blur-[200px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#4488ff]/5 rounded-full blur-[150px]" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 bg-[#00ffaa] rounded-full animate-pulse" />
            <span className="text-[#00ffaa] text-sm font-medium tracking-widest uppercase">Live Positions</span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Watch Our Bot
            <br />
            <span className="profit-number">Print Money</span>
          </h2>
          <p className="text-[#7a7a8f] text-xl max-w-2xl">
            These are actual positions being traded right now
            <br />
            <span className="text-white font-medium">This could be your portfolio</span>
          </p>
        </div>

        {}
        <div className="flex flex-wrap gap-x-16 gap-y-6 mb-16 pb-16 border-b border-white/5">
          {statsDisplay.map((stat, i) => (
            <div key={i}>
              <div className="text-sm text-[#5a5a6f] uppercase tracking-wider mb-1">{stat.label}</div>
              <div 
                className={`text-4xl md:text-5xl font-bold font-mono ${stat.highlight ? "drop-shadow-[0_0_20px_rgba(0,255,170,0.5)]" : ""}`}
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="mb-16 hidden md:block">
          {}
          <div className="grid grid-cols-5 gap-4 pb-4 border-b border-white/10 text-xs text-[#00ffaa] uppercase tracking-wider">
            <div>Pair</div>
            <div>Side</div>
            <div>Entry</div>
            <div>Current</div>
            <div className="text-right">PnL</div>
          </div>

          {}
          <div className="divide-y divide-white/5">
            {positions.map((pos, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`grid grid-cols-5 gap-4 py-4 transition-all duration-300 cursor-default ${
                  hoveredRow === i ? "bg-[#00ffaa]/5 -mx-4 px-4 rounded-lg" : ""
                }`}
              >
                <div className="font-bold text-white">{formatSymbol(pos.symbol)}/USDT</div>
                <div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    pos.direction === "Long" 
                      ? "bg-[#00ffaa]/10 text-[#00ffaa]" 
                      : "bg-[#ff4466]/10 text-[#ff4466]"
                  }`}>
                    {pos.direction.toUpperCase()}
                  </span>
                </div>
                <div className="font-mono text-[#6a6a7f]">{formatPrice(pos.entryPrice)}</div>
                <div className="font-mono text-white">{formatPrice(pos.currentPrice)}</div>
                <div className={`font-mono font-bold text-right ${pos.unrealizedPnl >= 0 ? 'text-[#00ffaa]' : 'text-[#ff4466]'} ${hoveredRow === i ? "scale-110" : ""} transition-transform`}>
                  {pos.unrealizedPnl >= 0 ? '+' : ''}{pos.unrealizedPnl.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="mb-16 md:hidden space-y-3">
          {positions.map((pos, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-[rgba(15,15,21,0.9)] to-[rgba(10,10,15,0.95)] border border-white/[0.04] rounded-[14px] p-4"
            >
              {}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">{formatSymbol(pos.symbol)}/USDT</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    pos.direction === "Long" 
                      ? "bg-[#00ffaa]/10 text-[#00ffaa]" 
                      : "bg-[#ff4466]/10 text-[#ff4466]"
                  }`}>
                    {pos.direction.toUpperCase()}
                  </span>
                </div>
                <div className={`font-mono font-bold text-lg ${pos.unrealizedPnl >= 0 ? 'text-[#00ffaa]' : 'text-[#ff4466]'}`}>
                  {pos.unrealizedPnl >= 0 ? '+' : ''}{pos.unrealizedPnl.toFixed(2)}%
                </div>
              </div>
              {}
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-[#5a5a6f]">Entry: </span>
                  <span className="font-mono text-[#8a8a9f]">{formatPrice(pos.entryPrice)}</span>
                </div>
                <div>
                  <span className="text-[#5a5a6f]">Current: </span>
                  <span className="font-mono text-white">{formatPrice(pos.currentPrice)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 py-12 border-y border-white/5">
          <div className="text-center">
            <div className="text-5xl font-bold font-mono text-[#00ffaa] mb-2">{stats.lastYearWins}</div>
            <div className="text-[#5a5a6f] text-sm">Winning Trades</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold font-mono text-white mb-2">{stats.lastYearLosses}</div>
            <div className="text-[#5a5a6f] text-sm">Losing Trades</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold font-mono text-[#4488ff] mb-2">{stats.availablePairs}</div>
            <div className="text-[#5a5a6f] text-sm">Pairs on Bybit</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold font-mono text-[#aa66ff] mb-2">24/7</div>
            <div className="text-[#5a5a6f] text-sm">Active Trading</div>
          </div>
        </div>

        {}
        <div className="text-center">
          <p className="text-[#7a7a8f] text-lg mb-6">
            Tired of watching others make money? <span className="text-white font-medium">Get the same signals.</span>
          </p>
          <Link 
            href="/register"
            className="btn-primary inline-flex items-center justify-center gap-2 px-10 py-4 font-bold text-lg rounded-2xl"
          >
            <span>Start Trading</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
