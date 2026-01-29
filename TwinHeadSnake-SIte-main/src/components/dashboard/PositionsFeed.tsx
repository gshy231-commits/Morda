"use client";

import { Position } from "@/lib/usePositions";

interface PositionsFeedProps {
  positions: Position[];
  onSelectCoin: (coin: string, symbol: string) => void;
}

export default function PositionsFeed({ positions, onSelectCoin }: PositionsFeedProps) {
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return "< 1h ago";
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(4)}`;
    if (price >= 0.0001) return `$${price.toFixed(6)}`;
    return `$${price.toPrecision(4)}`;
  };

  const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);

  return (
    <div className="h-full flex flex-col">
      {}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00ffaa] rounded-full animate-pulse" />
            <span className="font-semibold">Open Positions</span>
          </div>
          <span className="text-xs text-[#6a6a7f]">{positions.length} active</span>
        </div>
        
        {}
        <div className="bg-white/[0.03] rounded-lg p-3">
          <div className="text-xs text-[#6a6a7f] mb-1">Total Unrealized P&L</div>
          <div className={`text-2xl font-bold font-mono ${totalPnl >= 0 ? "text-[#00ffaa]" : "text-[#ff4466]"}`}>
            {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(2)}%
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto">
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#6a6a7f] p-8">
            <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="text-sm font-medium mb-1">No open positions</div>
            <div className="text-xs text-center">Waiting for entry signals...</div>
          </div>
        ) : (
          positions.map((position) => (
            <div
              key={position.id}
              onClick={() => onSelectCoin(position.coin, position.symbol)}
              className="p-3 lg:p-4 border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors group"
            >
              {}
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black ${
                    position.direction === "Long" 
                      ? "bg-gradient-to-br from-[#00ffaa] to-[#00cc88]" 
                      : "bg-gradient-to-br from-[#ff4466] to-[#cc3355]"
                  }`}>
                    {position.coin.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{position.coin}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        position.direction === "Long" 
                          ? "bg-[#00ffaa]/20 text-[#00ffaa]" 
                          : "bg-[#ff4466]/20 text-[#ff4466]"
                      }`}>
                        {position.direction.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-[#5a5a6f]">{position.pair}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono font-bold ${position.unrealizedPnl >= 0 ? "text-[#00ffaa]" : "text-[#ff4466]"}`}>
                    {position.unrealizedPnl >= 0 ? "+" : ""}{position.unrealizedPnl.toFixed(2)}%
                  </div>
                  <div className="text-xs text-[#5a5a6f]">{formatTimeAgo(position.entryTime)}</div>
                </div>
              </div>

              {}
              <div className="bg-white/[0.02] rounded-lg p-2 lg:p-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-[#5a5a6f] text-xs mb-0.5">Entry Price</div>
                    <div className="font-mono font-medium">{formatPrice(position.entryPrice)}</div>
                  </div>
                  <div>
                    <div className="text-[#5a5a6f] text-xs mb-0.5">Current Price</div>
                    <div className={`font-mono font-medium ${
                      position.unrealizedPnl >= 0 ? "text-[#00ffaa]" : "text-[#ff4466]"
                    }`}>
                      {formatPrice(position.currentPrice)}
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
                <button 
                  className="w-full py-1.5 rounded-lg bg-white/5 text-white text-xs font-medium hover:bg-white/10 transition-colors"
                >
                  View on Chart →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {}
      <div className="p-4 border-t border-white/5 bg-gradient-to-r from-[#00ffaa]/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00ffaa]/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#00ffaa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Live Trading</div>
            <div className="text-xs text-[#6a6a7f]">Auto-updated every 30s</div>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#00ffaa] rounded-full animate-pulse" />
            <span className="text-xs text-[#00ffaa]">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
