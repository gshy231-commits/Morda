"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, Trophy, DollarSign, Target, BarChart3, ChevronRight } from "lucide-react";
import { useTopCoins } from "@/lib/homepageContext";
import { formatCurrency, formatSymbol, calcResult1k, calcResultCompound } from "@/lib/api";
import type { TopCoin } from "@/lib/api";
import CoinDetailModal from "./CoinDetailModal";


const COIN_INFO: Record<string, { name: string; color: string }> = {
  BTC: { name: "Bitcoin", color: "#F7931A" },
  ETH: { name: "Ethereum", color: "#627EEA" },
  SOL: { name: "Solana", color: "#00FFA3" },
  BNB: { name: "BNB", color: "#F3BA2F" },
  XRP: { name: "XRP", color: "#23292F" },
  AVAX: { name: "Avalanche", color: "#E84142" },
  LINK: { name: "Chainlink", color: "#375BD2" },
  DOT: { name: "Polkadot", color: "#E6007A" },
  ADA: { name: "Cardano", color: "#0033AD" },
  MATIC: { name: "Polygon", color: "#8247E5" },
  DOGE: { name: "Dogecoin", color: "#C2A633" },
  ATOM: { name: "Cosmos", color: "#2E3148" },
  UNI: { name: "Uniswap", color: "#FF007A" },
  MOG: { name: "Mog Coin", color: "#FF6B35" },
  NEIRO: { name: "Neiro", color: "#00D4AA" },
  ALGO: { name: "Algorand", color: "#000000" },
  SATS: { name: "1000SATS", color: "#F7931A" },
  AERO: { name: "Aerodrome", color: "#0052FF" },
  RATS: { name: "RATS", color: "#FF4444" },
  AGI: { name: "Delysium", color: "#7B68EE" },
  ZORA: { name: "Zora", color: "#00AAFF" },
  JELLYJELLY: { name: "JellyJelly", color: "#FF69B4" },
  H: { name: "H Token", color: "#9966FF" },
  BIO: { name: "Bio Protocol", color: "#00CC88" },
  FLOCK: { name: "Flock", color: "#FF8800" },
  BANANAS31: { name: "Bananas31", color: "#FFD700" },
  XCN: { name: "Onyxcoin", color: "#00D4FF" },
  MOODENG: { name: "Moo Deng", color: "#FF69B4" },
  PIPPIN: { name: "Pippin", color: "#7B68EE" },
  M: { name: "M Token", color: "#00FFAA" },
  ZEC: { name: "Zcash", color: "#F4B728" },
};

const getCoinInfo = (symbol: string) => {
  const cleanSymbol = formatSymbol(symbol);
  return COIN_INFO[cleanSymbol] || { name: cleanSymbol, color: "#6a6a7f" };
};


const generateSparklineData = (pnl: number): number[] => {
  const points = 8;
  const data: number[] = [];
  let value = 100;
  const targetGrowth = pnl / 100;
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const noise = (Math.random() - 0.5) * 8;
    value = 100 + (targetGrowth * 100 * progress) + noise;
    data.push(Math.max(50, value));
  }
  return data;
};

export default function TopCoinsTable() {
  const topCoins = useTopCoins();
  const [selectedCoin, setSelectedCoin] = useState<TopCoin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleCoinClick = (coin: TopCoin) => {
    setSelectedCoin(coin);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCoin(null);
  };

  
  const totals = useMemo(() => {
    if (topCoins.length === 0) {
      return { totalTrades: 0, avgWinRate: 0, totalInvested: 0, totalResult: 0, totalCompound: 0, portfolioGrowth: 0, compoundGrowth: 0 };
    }
    const totalTrades = topCoins.reduce((sum, c) => sum + c.wins + c.losses, 0);
    const avgWinRate = Math.round(topCoins.reduce((sum, c) => sum + c.winRate, 0) / topCoins.length);
    const totalInvested = topCoins.length * 1000;
    const totalResult = topCoins.reduce((sum, c) => sum + calcResult1k(c.bestPnl), 0);
    const totalCompound = topCoins.reduce((sum, c) => sum + calcResultCompound(c.bestPnl, c.wins + c.losses), 0);
    const portfolioGrowth = totalInvested > 0 ? Math.round(((totalResult - totalInvested) / totalInvested) * 100) : 0;
    const compoundGrowth = totalInvested > 0 ? Math.round(((totalCompound - totalInvested) / totalInvested) * 100) : 0;
    return { totalTrades, avgWinRate, totalInvested, totalResult, totalCompound, portfolioGrowth, compoundGrowth };
  }, [topCoins]);

  
  if (topCoins.length === 0) {
    return null;
  }

  
  const renderSparkline = (data: number[], isProfit: boolean) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 16;
      return `${x},${y}`;
    }).join(' ');

    const color = isProfit ? "#00ffaa" : "#ff4466";

    return (
      <motion.svg 
        width="60" 
        height="20" 
        viewBox="0 0 60 20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.1 : 0.3 }}
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </motion.svg>
    );
  };

  const containerVariants = {
    visible: { transition: { staggerChildren: 0.02 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <section id="top-coins" className="py-24 relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030306] via-[#050510] to-[#030306]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00ffaa]/5 rounded-full blur-[200px]" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-[#00ffaa]" />
            <span className="text-[#00ffaa] text-sm font-medium tracking-widest uppercase">Top Performers</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Best Coins of{" "}
            <span className="bg-gradient-to-r from-[#00ffaa] to-[#4488ff] bg-clip-text text-transparent">2025</span>
          </h2>
          <p className="text-[#7a7a8f] text-lg max-w-2xl">
            What if you invested <span className="text-white font-semibold">$1,000</span> in each of our top performing coins one year ago?
          </p>
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="flex items-center justify-center gap-2 text-[#6a6a7f] text-sm mb-2">
              <BarChart3 className="w-4 h-4" />
              Total Trades
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono text-white">{totals.totalTrades.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="flex items-center justify-center gap-2 text-[#6a6a7f] text-sm mb-2">
              <Target className="w-4 h-4" />
              Avg Win Rate
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono text-[#00ffaa]">{totals.avgWinRate}%</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="flex items-center justify-center gap-2 text-[#6a6a7f] text-sm mb-2">
              <DollarSign className="w-4 h-4" />
              Investment
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono text-white">{formatCurrency(totals.totalInvested)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#00ffaa]/10 border border-[#00ffaa]/20 text-center">
            <div className="flex items-center justify-center gap-2 text-[#00ffaa]/70 text-sm mb-2">
              <TrendingUp className="w-4 h-4" />
              Portfolio Value
            </div>
            <div className="text-2xl md:text-3xl font-bold font-mono text-[#00ffaa]">{formatCurrency(totals.totalResult)}</div>
          </div>
        </div>

        {}
        <div className="hidden md:block rounded-2xl border border-white/10 overflow-hidden bg-[#0a0a12]/80 backdrop-blur-xl mb-8">
          {}
          <div className="grid grid-cols-8 gap-4 px-6 py-4 bg-white/5 border-b border-white/10 text-sm text-[#6a6a7f] uppercase tracking-wider font-medium">
            <div className="col-span-2">Coin</div>
            <div className="text-center">Trades</div>
            <div className="text-center">Win Rate</div>
            <div className="text-center">P.Factor</div>
            <div className="text-center">Yearly PnL</div>
            <div className="text-right">$1K Result</div>
            <div className="text-right">Compound</div>
          </div>

          {}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="divide-y divide-white/5">
            {topCoins.map((coin, i) => {
              const cleanSymbol = formatSymbol(coin.symbol);
              const info = getCoinInfo(coin.symbol);
              const trades = coin.wins + coin.losses;
              const result1k = calcResult1k(coin.bestPnl);
              const resultCompound = calcResultCompound(coin.bestPnl, trades);
              const rankColor = i < 3 ? "#00ffaa" : "#4488ff";
              const sparklineData = generateSparklineData(coin.bestPnl);

              return (
                <motion.div
                  key={coin.symbol}
                  variants={rowVariants}
                  onClick={() => handleCoinClick(coin)}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`grid grid-cols-8 gap-4 px-6 py-4 cursor-pointer transition-all duration-200 group ${
                    hoveredRow === i ? "bg-[#00ffaa]/5" : "hover:bg-white/[0.02]"
                  }`}
                >
                  {}
                  <div className="col-span-2 flex items-center gap-4">
                    <div 
                      className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                      style={{ background: `${rankColor}15`, color: rankColor, border: `1px solid ${rankColor}30` }}
                    >
                      {i + 1}
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                      style={{ background: `${info.color}20`, color: info.color }}
                    >
                      {cleanSymbol[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-base">{cleanSymbol}</div>
                      <div className="text-sm text-[#6a6a7f]">{info.name}</div>
                    </div>
                  </div>

                  {}
                  <div className="flex items-center justify-center">
                    <span className="font-mono text-base text-[#9a9aaf]">{trades}</span>
                  </div>

                  {}
                  <div className="flex items-center justify-center">
                    <span className="font-mono text-base text-[#00ffaa] font-semibold">{coin.winRate.toFixed(1)}%</span>
                  </div>

                  {}
                  <div className="flex items-center justify-center">
                    <span className="font-mono text-base text-[#4488ff]">
                      {coin.profitFactor !== null ? coin.profitFactor.toFixed(2) : "∞"}
                    </span>
                  </div>

                  {}
                  <div className="flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-[#00ffaa]/10 text-[#00ffaa] font-mono font-semibold text-base">
                      +{coin.bestPnl.toFixed(0)}%
                    </span>
                  </div>

                  {}
                  <div className="flex items-center justify-end">
                    <span className="font-mono font-semibold text-white text-base">{formatCurrency(result1k)}</span>
                  </div>

                  {}
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-mono font-bold text-[#4488ff] text-base">{formatCurrency(resultCompound)}</span>
                    <ChevronRight className={`w-5 h-5 text-[#6a6a7f] transition-all ${hoveredRow === i ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {}
        <div className="md:hidden space-y-3 mb-8">
          {topCoins.map((coin, i) => {
            const cleanSymbol = formatSymbol(coin.symbol);
            const info = getCoinInfo(coin.symbol);
            const result1k = calcResult1k(coin.bestPnl);
            const rankColor = i < 3 ? "#00ffaa" : "#4488ff";
            
            return (
              <div
                key={coin.symbol}
                onClick={() => handleCoinClick(coin)}
                className="p-4 rounded-2xl bg-[#0a0a12]/80 border border-white/10 active:bg-[#00ffaa]/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                      style={{ background: `${rankColor}15`, color: rankColor, border: `1px solid ${rankColor}30` }}
                    >
                      {i + 1}
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                      style={{ background: `${info.color}20`, color: info.color }}
                    >
                      {cleanSymbol[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{cleanSymbol}</div>
                      <div className="text-sm text-[#6a6a7f]">{info.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-2.5 py-1 rounded-lg bg-[#00ffaa]/10 text-[#00ffaa] font-mono font-semibold inline-block">
                      +{coin.bestPnl.toFixed(0)}%
                    </div>
                    <div className="font-mono font-semibold text-white mt-1">
                      {formatCurrency(result1k)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {}
        <div className="rounded-2xl border border-[#00ffaa]/20 bg-gradient-to-r from-[#00ffaa]/5 via-transparent to-[#4488ff]/5 p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="text-[#00ffaa] text-sm font-medium uppercase tracking-widest mb-2">Portfolio Summary</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                If you invested <span className="text-[#00ffaa]">{formatCurrency(totals.totalInvested)}</span>
              </h3>
              <p className="text-[#7a7a8f]">
                Splitting $1,000 across each of our top {topCoins.length} coins with our signals over the past year
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-sm text-[#6a6a7f] mb-1">Without Reinvesting</div>
                <div className="text-2xl md:text-3xl font-bold font-mono text-white">{formatCurrency(totals.totalResult)}</div>
                <div className="text-sm text-[#00ffaa]">+{totals.portfolioGrowth}%</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-[#00ffaa]/10 border border-[#00ffaa]/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#00ffaa]/5 to-transparent" />
                <div className="relative">
                  <div className="text-sm text-[#00ffaa]/80 mb-1">With Compound</div>
                  <div className="text-2xl md:text-3xl font-bold font-mono text-[#00ffaa]">{formatCurrency(totals.totalCompound)}</div>
                  <div className="text-sm text-[#00ffaa] font-semibold">+{totals.compoundGrowth}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[#5a5a6f] text-sm mt-6">
          * Past performance does not guarantee future results. Calculations based on historical signal data.
        </p>
      </div>

      {}
      <CoinDetailModal coin={selectedCoin} isOpen={isModalOpen} onClose={closeModal} />
    </section>
  );
}
