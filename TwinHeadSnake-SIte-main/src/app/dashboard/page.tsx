"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { usePositions } from "@/lib/usePositions";
import TradingChart from "@/components/dashboard/TradingChart";
import PositionsFeed from "@/components/dashboard/PositionsFeed";
import StatsBar from "@/components/dashboard/StatsBar";
import CoinSelector from "@/components/dashboard/CoinSelector";

const TIMEFRAMES = [
  { label: "15m", value: "15" },
  { label: "1H", value: "60" },
  { label: "4H", value: "240" },
  { label: "1D", value: "D" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("60");
  
  const { positions, isLoading, error } = usePositions({ 
    refreshInterval: 30000,
  });

  const handleSelectCoin = (coin: string, symbol?: string) => {
    setSelectedCoin(coin);
    setSelectedSymbol(symbol || `${coin}USDT`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] lg:h-screen">
      {}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 lg:px-6 py-3 lg:py-4 border-b border-white/5 gap-3 sm:gap-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <CoinSelector 
            selectedCoin={selectedCoin} 
            selectedSymbol={selectedSymbol}
            onSelect={handleSelectCoin} 
          />
          
          <div className="flex gap-1 p-1 rounded-lg bg-white/5">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  timeframe === tf.value
                    ? "bg-[#00ffaa] text-black"
                    : "text-[#6a6a7f] hover:text-white"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-[#6a6a7f] capitalize">{user?.plan} Plan</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ffaa] to-[#4488ff] flex items-center justify-center font-bold text-black">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </div>

      <StatsBar symbol={selectedSymbol} />

      {}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {}
        <div className="flex-1 relative min-h-[300px] lg:min-h-0">
          <TradingChart 
            positions={positions} 
            coin={selectedCoin}
            symbol={selectedSymbol}
            timeframe={timeframe}
          />
        </div>

        {}
        <div className="h-[40vh] lg:h-auto lg:w-[380px] border-t lg:border-t-0 lg:border-l border-white/5 bg-[#0a0a12] overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-[#00ffaa] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-[#6a6a7f]">
              {error}
            </div>
          ) : (
            <PositionsFeed 
              positions={positions} 
              onSelectCoin={handleSelectCoin}
            />
          )}
        </div>
      </div>
    </div>
  );
}
