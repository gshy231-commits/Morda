"use client";

import { usePositions } from "@/lib/usePositions";
import { useI18n } from "@/lib/i18n";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";

export default function SignalsPage() {
  const { t, locale } = useI18n();
  const { positions, isLoading, error } = usePositions({ 
    refreshInterval: 30000,
  });

  
  const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const profitableCount = positions.filter(p => p.unrealizedPnl > 0).length;
  const longCount = positions.filter(p => p.direction === "Long").length;
  const shortCount = positions.filter(p => p.direction === "Short").length;

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(4)}`;
    if (price >= 0.0001) return `$${price.toFixed(6)}`;
    return `$${price.toPrecision(4)}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const dateLocale = locale === 'ru' ? 'ru-RU' : locale === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(dateLocale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-[#00ffaa] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-[#6a6a7f]">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold mb-1">{t.dashboard.signals.title}</h1>
          <p className="text-sm text-[#6a6a7f]">{t.dashboard.signals.active}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#00ffaa] rounded-full animate-pulse" />
          <span className="text-sm text-[#6a6a7f]">Live</span>
        </div>
      </div>

      {}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-6 lg:mb-8">
        <div className="card p-3 lg:p-4">
          <div className="text-[#6a6a7f] text-xs lg:text-sm mb-1">{t.positions.livePositions}</div>
          <div className="text-xl lg:text-2xl font-bold">{positions.length}</div>
        </div>
        <div className="card p-3 lg:p-4">
          <div className="text-[#6a6a7f] text-xs lg:text-sm mb-1">{t.positions.pnl}</div>
          <div className={`text-xl lg:text-2xl font-bold font-mono ${totalPnl >= 0 ? "text-[#00ffaa]" : "text-[#ff4466]"}`}>
            {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(2)}%
          </div>
        </div>
        <div className="card p-3 lg:p-4">
          <div className="text-[#6a6a7f] text-xs lg:text-sm mb-1">{t.positions.long}</div>
          <div className="text-xl lg:text-2xl font-bold">
            <span className="text-[#00ffaa]">{profitableCount}</span>
            <span className="text-[#6a6a7f]">/{positions.length}</span>
          </div>
        </div>
        <div className="card p-3 lg:p-4">
          <div className="text-[#6a6a7f] text-xs lg:text-sm mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-[#00ffaa]" /> {t.positions.long}
          </div>
          <div className="text-xl lg:text-2xl font-bold text-[#00ffaa]">{longCount}</div>
        </div>
        <div className="card p-3 lg:p-4 col-span-2 sm:col-span-1">
          <div className="text-[#6a6a7f] text-xs lg:text-sm mb-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 text-[#ff4466]" /> {t.positions.short}
          </div>
          <div className="text-xl lg:text-2xl font-bold text-[#ff4466]">{shortCount}</div>
        </div>
      </div>

      {}
      <div className="lg:hidden space-y-3">
        {positions.length === 0 ? (
          <div className="card p-8 text-center text-[#6a6a7f]">
            {t.positions.noPositions}
          </div>
        ) : (
          positions.map((position) => {
            const priceChange = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100;
            const adjustedChange = position.direction === "Short" ? -priceChange : priceChange;
            
            return (
              <div key={position.id} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-black ${
                      position.direction === "Long" 
                        ? "bg-gradient-to-br from-[#00ffaa] to-[#00cc88]" 
                        : "bg-gradient-to-br from-[#ff4466] to-[#cc3355]"
                    }`}>
                      {position.coin.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold">{position.coin}</div>
                      <div className="text-xs text-[#5a5a6f]">{position.pair}</div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded font-medium ${
                    position.direction === "Long" 
                      ? "bg-[#00ffaa]/20 text-[#00ffaa]" 
                      : "bg-[#ff4466]/20 text-[#ff4466]"
                  }`}>
                    {position.direction === "Long" 
                      ? <ArrowUpRight className="w-3 h-3" />
                      : <ArrowDownRight className="w-3 h-3" />
                    }
                    {position.direction === "Long" ? t.positions.long : t.positions.short}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-[#6a6a7f] text-xs mb-1">{t.positions.entry}</div>
                    <div className="font-mono">{formatPrice(position.entryPrice)}</div>
                  </div>
                  <div>
                    <div className="text-[#6a6a7f] text-xs mb-1">{t.positions.current}</div>
                    <div className="font-mono">{formatPrice(position.currentPrice)}</div>
                  </div>
                  <div>
                    <div className="text-[#6a6a7f] text-xs mb-1">{t.positions.pnl}</div>
                    <div className={`font-mono ${adjustedChange >= 0 ? "text-[#00ffaa]" : "text-[#ff4466]"}`}>
                      {adjustedChange >= 0 ? "+" : ""}{adjustedChange.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[#6a6a7f] text-xs mb-1">{t.positions.pnl}</div>
                    <div className={`font-mono font-bold ${position.unrealizedPnl >= 0 ? "text-[#00ffaa]" : "text-[#ff4466]"}`}>
                      {position.unrealizedPnl >= 0 ? "+" : ""}{position.unrealizedPnl.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-[#6a6a7f]">
                  {t.positions.entry}: {formatDate(position.entryTime)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {}
      <div className="hidden lg:block card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 text-[#6a6a7f] text-sm">
              <th className="text-left p-4">{t.positions.coin}</th>
              <th className="text-left p-4">{t.positions.direction}</th>
              <th className="text-right p-4">{t.positions.entry}</th>
              <th className="text-right p-4">{t.positions.current}</th>
              <th className="text-right p-4">{t.positions.pnl}</th>
              <th className="text-right p-4">{t.positions.pnl}</th>
              <th className="text-right p-4">{t.positions.duration}</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#6a6a7f]">
                  {t.positions.noPositions}
                </td>
              </tr>
            ) : (
              positions.map((position) => {
                const priceChange = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100;
                const adjustedChange = position.direction === "Short" ? -priceChange : priceChange;
                
                return (
                  <tr key={position.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black ${
                          position.direction === "Long" 
                            ? "bg-gradient-to-br from-[#00ffaa] to-[#00cc88]" 
                            : "bg-gradient-to-br from-[#ff4466] to-[#cc3355]"
                        }`}>
                          {position.coin.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold">{position.coin}</div>
                          <div className="text-xs text-[#5a5a6f]">{position.pair}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded font-medium ${
                        position.direction === "Long" 
                          ? "bg-[#00ffaa]/20 text-[#00ffaa]" 
                          : "bg-[#ff4466]/20 text-[#ff4466]"
                      }`}>
                        {position.direction === "Long" 
                          ? <ArrowUpRight className="w-3 h-3" />
                          : <ArrowDownRight className="w-3 h-3" />
                        }
                        {position.direction === "Long" ? t.positions.long : t.positions.short}
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono">{formatPrice(position.entryPrice)}</td>
                    <td className="p-4 text-right font-mono">{formatPrice(position.currentPrice)}</td>
                    <td className="p-4 text-right">
                      <span className={`font-mono ${adjustedChange >= 0 ? "text-[#00ffaa]" : "text-[#ff4466]"}`}>
                        {adjustedChange >= 0 ? "+" : ""}{adjustedChange.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-mono font-bold ${position.unrealizedPnl >= 0 ? "text-[#00ffaa]" : "text-[#ff4466]"}`}>
                        {position.unrealizedPnl >= 0 ? "+" : ""}{position.unrealizedPnl.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm text-[#6a6a7f]">
                      {formatDate(position.entryTime)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
