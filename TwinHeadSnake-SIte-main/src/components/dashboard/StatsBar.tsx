"use client";

import { useBybitTicker } from "@/lib/useBybitTickers";

interface StatsBarProps {
  symbol: string; 
}

export default function StatsBar({ symbol }: StatsBarProps) {
  const { ticker, loading } = useBybitTicker(symbol);
  
  
  const coinName = symbol.replace(/USDT$/i, "")
    .replace(/^1000000/i, "")
    .replace(/^10000/i, "")
    .replace(/^1000/i, "");

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return `${num.toFixed(2)}`;
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1) return `${price.toFixed(4)}`;
    return `${price.toFixed(6)}`;
  };

  if (loading || !ticker) {
    return (
      <div className="flex items-center gap-4 lg:gap-6 px-3 lg:px-4 py-2 lg:py-3 bg-white/[0.02] border-b border-white/5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-1.5 lg:gap-2">
            <div className="w-10 lg:w-12 h-3 bg-white/5 rounded animate-pulse" />
            <div className="w-12 lg:w-16 h-4 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    { 
      label: "Price", 
      value: formatPrice(ticker.lastPrice), 
      color: "white" 
    },
    { 
      label: "24h Change", 
      value: `${ticker.price24hPcnt >= 0 ? "+" : ""}${ticker.price24hPcnt.toFixed(2)}%`, 
      color: ticker.price24hPcnt >= 0 ? "#00ffaa" : "#ff4466" 
    },
    { 
      label: "24h High", 
      value: formatPrice(ticker.highPrice24h), 
      color: "#00ffaa" 
    },
    { 
      label: "24h Low", 
      value: formatPrice(ticker.lowPrice24h), 
      color: "#ff4466" 
    },
    { 
      label: "24h Volume", 
      value: `${ticker.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${coinName}`, 
      color: "white" 
    },
    { 
      label: "24h Turnover", 
      value: formatNumber(ticker.turnover24h), 
      color: "white" 
    },
  ];

  return (
    <div className="flex items-center gap-4 lg:gap-6 px-3 lg:px-4 py-2 lg:py-3 bg-white/[0.02] border-b border-white/5 overflow-x-auto no-scrollbar">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-1.5 lg:gap-2 whitespace-nowrap">
          <span className="text-[10px] lg:text-xs text-[#5a5a6f]">{stat.label}</span>
          <span className="text-xs lg:text-sm font-mono font-medium" style={{ color: stat.color }}>
            {stat.value}
          </span>
        </div>
      ))}
      
      <div className="flex items-center gap-1.5 ml-auto">
        <span className="w-1.5 h-1.5 bg-[#00ffaa] rounded-full animate-pulse" />
        <span className="text-[10px] lg:text-xs text-[#5a5a6f]">Live</span>
      </div>
    </div>
  );
}
