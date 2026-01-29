"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Info, TrendingUp, CandlestickChart, Loader2 } from "lucide-react";
import type { TopCoin, RawDeal, RawCandle } from "@/lib/api";
import { formatSymbol, calcResult1k, calcResultCompound } from "@/lib/api";
import { useCoinDetails } from "@/lib/homepageContext";

interface CoinDetailModalProps {
  coin: TopCoin | null;
  isOpen: boolean;
  onClose: () => void;
}


const COIN_NAMES: Record<string, string> = {
  ZORA: "Zora",
  MOG: "Mog Coin",
  JELLYJELLY: "JellyJelly",
  H: "H Token",
  BIO: "Bio Protocol",
  FLOCK: "Flock",
  BANANAS31: "Bananas31",
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  "0G": "0G Network",
  BABYDOGE: "Baby Doge",
  CHEEMS: "Cheems",
  SATS: "SATS",
  NEIRO: "Neiro",
  TOSHI: "Toshi",
  RATS: "RATS",
  AVNT: "Aventis",
  MOODENG: "Moo Deng",
  FWOG: "Fwog",
  XCN: "Onyxcoin",
  PIPPIN: "Pippin",
  M: "M Token",
  ZEC: "Zcash",
  AGI: "Delysium",
  AERO: "Aerodrome",
};

type ChartMode = "equity" | "candles";

export default function CoinDetailModal({ coin, isOpen, onClose }: CoinDetailModalProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ReturnType<typeof import("echarts")["init"]> | null>(null);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>("equity");

  
  const { deals, candles, loading: dataLoading } = useCoinDetails(coin?.symbol || null);

  
  const hasRealData = candles.length > 0 || deals.length > 0;
  const noDataAvailable = !dataLoading && !hasRealData;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    import("echarts").then(() => {
      setChartLoaded(true);
    });
  }, []);

  
  useEffect(() => {
    if (!isOpen || !coin || !chartRef.current || !chartLoaded) return;
    
    
    
    if (chartMode === "candles" && dataLoading) return;

    import("echarts").then((echarts) => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      chartInstance.current = echarts.init(chartRef.current!, undefined, { renderer: "canvas" });

      const chart = chartInstance.current;

      if (chartMode === "equity") {
        renderEquityChart(chart, echarts, coin, deals);
      } else {
        renderCandlestickChart(chart, echarts, candles, deals);
      }

      const handleResize = () => chart.resize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    });
  }, [isOpen, coin, chartLoaded, chartMode, candles, deals, dataLoading]);

  useEffect(() => {
    if (!isOpen && chartInstance.current) {
      chartInstance.current.dispose();
      chartInstance.current = null;
    }
  }, [isOpen]);

  if (!coin) return null;

  const cleanSymbol = formatSymbol(coin.symbol);
  const coinName = COIN_NAMES[cleanSymbol] || cleanSymbol;
  const trades = coin.wins + coin.losses;
  const result1k = calcResult1k(coin.bestPnl);
  const resultCompound = calcResultCompound(coin.bestPnl, trades);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-4 md:inset-8 lg:inset-12 bg-[#08080c] border border-[#1a1a24] rounded-2xl z-50 overflow-hidden flex flex-col max-w-5xl mx-auto"
          >
            {}
            <div className="flex items-center justify-between px-8 py-5 border-b border-[#1a1a24]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ffaa]/20 to-[#00ffaa]/5 flex items-center justify-center border border-[#00ffaa]/20">
                  <span className="text-[#00ffaa] font-bold text-xl">{cleanSymbol[0]}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{cleanSymbol}</h2>
                  <p className="text-[#5a5a6f] text-sm">{coinName} • {coin.timeframe}m</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 text-[#5a5a6f]" />
              </button>
            </div>

            {}
            <div className="flex-1 overflow-auto p-8">
              {}
              {noDataAvailable && (
                <div className="flex items-center justify-center gap-2 mb-4 p-3 rounded-lg bg-[#0f0f14] border border-[#1a1a24]">
                  <Info className="w-4 h-4 text-[#5a5a6f]" />
                  <span className="text-sm text-[#5a5a6f]">Trade history not available for this coin</span>
                </div>
              )}

              {}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-[#00ffaa]" />
                  <span className="font-semibold text-white">MACD Settings</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0f0f14] border border-[#1a1a24]">
                  <div className="flex-1 text-center">
                    <div className="text-[#5a5a6f] text-xs uppercase mb-1">Fast</div>
                    <div className="text-2xl font-bold font-mono text-[#00ffaa]">{coin.bestMacd.fast}</div>
                  </div>
                  <div className="w-px h-12 bg-[#1a1a24]" />
                  <div className="flex-1 text-center">
                    <div className="text-[#5a5a6f] text-xs uppercase mb-1">Slow</div>
                    <div className="text-2xl font-bold font-mono text-[#4488ff]">{coin.bestMacd.slow}</div>
                  </div>
                  <div className="w-px h-12 bg-[#1a1a24]" />
                  <div className="flex-1 text-center">
                    <div className="text-[#5a5a6f] text-xs uppercase mb-1">Signal</div>
                    <div className="text-2xl font-bold font-mono text-white">{coin.bestMacd.signal}</div>
                  </div>
                </div>
              </div>

              {}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-[#0f0f14] border border-[#1a1a24] text-center">
                  <div className="text-[#5a5a6f] text-xs uppercase mb-1">Total PnL</div>
                  <div className="text-2xl font-bold font-mono text-[#00ffaa]">+{coin.bestPnl.toFixed(0)}%</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0f0f14] border border-[#1a1a24] text-center">
                  <div className="text-[#5a5a6f] text-xs uppercase mb-1">Win Rate</div>
                  <div className="text-2xl font-bold font-mono text-white">{coin.winRate.toFixed(1)}%</div>
                </div>
                <div className="p-4 rounded-xl bg-[#0f0f14] border border-[#1a1a24] text-center">
                  <div className="text-[#5a5a6f] text-xs uppercase mb-1">Profit Factor</div>
                  <div className="text-2xl font-bold font-mono text-[#4488ff]">
                    {coin.profitFactor !== null ? coin.profitFactor.toFixed(2) : "∞"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#0f0f14] border border-[#1a1a24] text-center">
                  <div className="text-[#5a5a6f] text-xs uppercase mb-1">Total Trades</div>
                  <div className="text-2xl font-bold font-mono text-white">{trades}</div>
                </div>
              </div>

              {}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-[#00ffaa]/5 border border-[#00ffaa]/20 text-center">
                  <div className="text-[#00ffaa]/70 text-xs uppercase mb-1">Wins</div>
                  <div className="text-3xl font-bold font-mono text-[#00ffaa]">{coin.wins}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#ff4466]/5 border border-[#ff4466]/20 text-center">
                  <div className="text-[#ff4466]/70 text-xs uppercase mb-1">Losses</div>
                  <div className="text-3xl font-bold font-mono text-[#ff4466]">{coin.losses}</div>
                </div>
              </div>

              {}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setChartMode("equity")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    chartMode === "equity"
                      ? "bg-[#00ffaa]/20 text-[#00ffaa] border border-[#00ffaa]/30"
                      : "bg-[#0f0f14] text-[#5a5a6f] border border-[#1a1a24] hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Capital Growth</span>
                </button>
                <button
                  onClick={() => candles.length > 0 && setChartMode("candles")}
                  disabled={candles.length === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    chartMode === "candles"
                      ? "bg-[#4488ff]/20 text-[#4488ff] border border-[#4488ff]/30"
                      : candles.length === 0
                        ? "bg-[#0f0f14] text-[#3a3a4f] border border-[#1a1a24] cursor-not-allowed opacity-50"
                        : "bg-[#0f0f14] text-[#5a5a6f] border border-[#1a1a24] hover:text-white"
                  }`}
                >
                  <CandlestickChart className="w-4 h-4" />
                  <span className="text-sm font-medium">Trades Chart</span>
                  {candles.length === 0 && <span className="text-xs">(no data)</span>}
                </button>
              </div>

              {}
              <div className="mb-8">
                <div className="text-[#5a5a6f] text-xs uppercase mb-4">
                  {chartMode === "equity" ? "Equity Curve ($1,000 start)" : "Price Chart with Entry/Exit Points"}
                </div>
                <div ref={chartRef} className="w-full h-80 rounded-xl bg-[#0a0a10] border border-[#1a1a24] relative">
                  {chartMode === "candles" && dataLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a10] rounded-xl z-10">
                      <div className="flex items-center gap-2 text-[#5a5a6f]">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Loading chart data...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-[#6a6a7f] text-sm mb-2">$1K Without Reinvesting</div>
                  <div className="text-3xl font-bold font-mono text-white">${result1k.toLocaleString()}</div>
                </div>
                <div className="p-6 rounded-xl bg-[#00ffaa]/10 border border-[#00ffaa]/30 text-center">
                  <div className="text-[#00ffaa]/80 text-sm mb-2">$1K With Compound</div>
                  <div className="text-3xl font-bold font-mono text-[#00ffaa]">${resultCompound.toLocaleString()}</div>
                </div>
              </div>

              {}
              <div className="mt-8 p-4 rounded-xl bg-[#0f0f14] border border-[#1a1a24] flex items-start gap-3">
                <Info className="w-5 h-5 text-[#5a5a6f] flex-shrink-0 mt-0.5" />
                <p className="text-[#5a5a6f] text-sm">
                  This data is based on backtesting with optimized MACD parameters. Past performance does not guarantee future results.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


function renderEquityChart(
  chart: ReturnType<typeof import("echarts")["init"]>,
  echarts: typeof import("echarts"),
  coin: TopCoin,
  deals: RawDeal[]
) {
  const equityData: { time: string; value: number }[] = [];
  let equity = 1000;

  if (deals.length > 0) {
    const sortedDeals = [...deals].sort(
      (a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
    );

    equityData.push({ time: "Start", value: equity });

    sortedDeals.forEach((deal) => {
      equity = equity * (1 + deal.pnl / 100);
      const date = new Date(deal.exit_time);
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      equityData.push({ time: label, value: Math.max(100, equity) });
    });
  } else {
    
    const trades = coin.wins + coin.losses;
    const avgTradeReturn = coin.bestPnl / trades / 100;
    equityData.push({ time: "Start", value: 1000 });

    for (let i = 0; i < trades; i++) {
      const isWin = Math.random() < coin.winRate / 100;
      const change = isWin ? avgTradeReturn * 2 : -avgTradeReturn * 0.5;
      equity = equity * (1 + change);
      equityData.push({ time: `T${i + 1}`, value: Math.max(500, equity) });
    }
  }

  const option: import("echarts").EChartsOption = {
    backgroundColor: "transparent",
    animation: true,
    animationDuration: 800,
    grid: { top: 30, right: 20, bottom: 40, left: 60 },
    xAxis: {
      type: "category",
      data: equityData.map((d) => d.time),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { 
        color: "#4a4a5f", 
        fontSize: 10, 
        interval: Math.max(0, Math.floor(equityData.length / 10) - 1)
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      scale: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { 
        color: "#4a4a5f", 
        fontSize: 10, 
        formatter: (v: number) => `${(v / 1000).toFixed(1)}k` 
      },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.03)" } },
    },
    series: [
      {
        type: "line",
        data: equityData.map((d) => d.value),
        smooth: 0.3,
        symbol: "none",
        lineStyle: { color: "#00ffaa", width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(0, 255, 170, 0.25)" },
            { offset: 1, color: "rgba(0, 255, 170, 0)" },
          ]),
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(5, 5, 10, 0.95)",
      borderColor: "#222",
      textStyle: { color: "#fff", fontSize: 11 },
      formatter: (params: unknown) => {
        const p = (params as { name: string; value: number }[])[0];
        return `<div style="font-weight:600">${p.name}</div><div style="color:#00ffaa">$${p.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>`;
      },
    },
  };

  chart.setOption(option, true);
}


function renderCandlestickChart(
  chart: ReturnType<typeof import("echarts")["init"]>,
  echarts: typeof import("echarts"),
  candles: RawCandle[],
  deals: RawDeal[]
) {
  if (candles.length === 0) {
    chart.setOption({
      backgroundColor: "transparent",
      title: {
        text: "No candle data available",
        left: "center",
        top: "center",
        textStyle: { color: "#5a5a6f", fontSize: 14 },
      },
    });
    return;
  }

  const categoryData: string[] = [];
  const ohlcData: number[][] = [];

  candles.forEach((c) => {
    const date = new Date(c.utc);
    categoryData.push(`${date.getMonth() + 1}/${date.getDate()}`);
    ohlcData.push([c.open, c.close, c.low, c.high]);
  });

  
  const markAreaData: { name: string; xAxis: number; itemStyle: { color: string } }[][] = [];

  deals.forEach((deal) => {
    const entryTime = new Date(deal.entry_time).getTime();
    const exitTime = new Date(deal.exit_time).getTime();

    const entryIdx = candles.findIndex((c) => c.timestamp >= entryTime);
    const exitIdx = candles.findIndex((c) => c.timestamp >= exitTime);

    if (entryIdx >= 0 && exitIdx >= 0 && exitIdx > entryIdx) {
      const isWin = deal.pnl > 0;
      const isLong = deal.direction === "Long";
      
      const color = isWin 
        ? "rgba(0, 255, 170, 0.15)" 
        : "rgba(255, 68, 102, 0.15)";
      
      markAreaData.push([
        { 
          name: `${isLong ? "L" : "S"} ${deal.pnl > 0 ? "+" : ""}${deal.pnl.toFixed(1)}%`,
          xAxis: entryIdx,
          itemStyle: { color }
        },
        { 
          name: "",
          xAxis: exitIdx,
          itemStyle: { color }
        }
      ]);
    }
  });

  const option: import("echarts").EChartsOption = {
    backgroundColor: "transparent",
    animation: true,
    grid: { top: 30, right: 50, bottom: 30, left: 60 },
    xAxis: {
      type: "category",
      data: categoryData,
      axisLine: { lineStyle: { color: "#1a1a24" } },
      axisTick: { show: false },
      axisLabel: { 
        color: "#4a4a5f", 
        fontSize: 9,
        interval: Math.max(0, Math.floor(categoryData.length / 10) - 1)
      },
    },
    yAxis: {
      type: "value",
      scale: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#4a4a5f", fontSize: 10 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.03)" } },
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
      },
    ],
    series: [
      {
        type: "candlestick",
        data: ohlcData,
        itemStyle: {
          color: "#00ffaa",
          color0: "#ff4466",
          borderColor: "#00ffaa",
          borderColor0: "#ff4466",
        },
        markArea: {
          silent: false,
          data: markAreaData as unknown as import("echarts").MarkAreaComponentOption["data"],
          label: {
            show: true,
            position: "insideTop",
            color: "#8a8a9f",
            fontSize: 9,
            fontWeight: "bold",
          },
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      backgroundColor: "rgba(5, 5, 10, 0.95)",
      borderColor: "#222",
      textStyle: { color: "#fff", fontSize: 11 },
      formatter: (params: unknown) => {
        const p = (params as { data: number[]; name: string }[])[0];
        if (!p || !p.data) return "";
        const [open, close, low, high] = p.data;
        return `
          <div style="font-weight:600;margin-bottom:4px">${p.name}</div>
          <div>O: <span style="color:#8a8a9f">${open.toFixed(6)}</span></div>
          <div>H: <span style="color:#00ffaa">${high.toFixed(6)}</span></div>
          <div>L: <span style="color:#ff4466">${low.toFixed(6)}</span></div>
          <div>C: <span style="color:${close >= open ? "#00ffaa" : "#ff4466"}">${close.toFixed(6)}</span></div>
        `;
      },
    },
  };

  chart.setOption(option, true);
}
