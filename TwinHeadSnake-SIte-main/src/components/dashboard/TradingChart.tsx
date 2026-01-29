"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import { Position } from "@/lib/usePositions";
import { TrendingUp, X, ChevronDown, Check, GripHorizontal } from "lucide-react";
import type { Time, IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData } from "lightweight-charts";

interface TradingChartProps {
  positions: Position[];
  coin: string;
  symbol?: string;
  timeframe?: string;
}

interface IndicatorSettings {
  ema: { enabled: boolean; periods: number[] };
  sma: { enabled: boolean; periods: number[] };
  rsi: { enabled: boolean; period: number; height: number };
  macd: { enabled: boolean; fast: number; slow: number; signal: number; height: number };
  bollinger: { enabled: boolean; period: number; stdDev: number };
  volume: { enabled: boolean };
}

const DEFAULT_INDICATORS: IndicatorSettings = {
  ema: { enabled: false, periods: [9, 21] },
  sma: { enabled: false, periods: [50, 200] },
  rsi: { enabled: false, period: 14, height: 120 },
  macd: { enabled: false, fast: 12, slow: 26, signal: 9, height: 120 },
  bollinger: { enabled: false, period: 20, stdDev: 2 },
  volume: { enabled: true },
};

const COLORS = {
  ema9: "#f7931a", ema21: "#627eea",
  sma50: "#00d4aa", sma200: "#e84142",
  rsi: "#f7931a", rsiOverbought: "#ff4466", rsiOversold: "#00ffaa",
  macdLine: "#2962ff", macdSignal: "#ff6d00",
  macdHistUp: "#26a69a", macdHistDown: "#ef5350",
  bbUpper: "#2962ff", bbMiddle: "#787b86", bbLower: "#2962ff",
  volumeUp: "rgba(0, 255, 170, 0.5)", volumeDown: "rgba(255, 68, 102, 0.5)",
};


function calculateEMA(data: number[], period: number): number[] {
  if (data.length < period) return data.map(() => NaN);
  const k = 2 / (period + 1);
  const ema: number[] = [];
  let prev = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) ema.push(NaN);
    else if (i === period - 1) ema.push(prev);
    else { prev = data[i] * k + prev * (1 - k); ema.push(prev); }
  }
  return ema;
}

function calculateSMA(data: number[], period: number): number[] {
  return data.map((_, i) => i < period - 1 ? NaN : data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period);
}

function calculateRSI(closes: number[], period: number): number[] {
  if (closes.length < period + 1) return closes.map(() => NaN);
  const rsi: number[] = [NaN];
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0, loss = change < 0 ? -change : 0;
    if (i < period) { avgGain += gain; avgLoss += loss; rsi.push(NaN); }
    else if (i === period) {
      avgGain = (avgGain + gain) / period; avgLoss = (avgLoss + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }
  return rsi;
}

function calculateMACD(closes: number[], fast: number, slow: number, sig: number) {
  const emaF = calculateEMA(closes, fast), emaS = calculateEMA(closes, slow);
  const macdLine = emaF.map((f, i) => isNaN(f) || isNaN(emaS[i]) ? NaN : f - emaS[i]);
  const validStart = macdLine.findIndex(v => !isNaN(v));
  const signal: number[] = new Array(closes.length).fill(NaN);
  if (validStart >= 0) {
    const validMacd = macdLine.filter(v => !isNaN(v));
    if (validMacd.length >= sig) {
      const sigEma = calculateEMA(validMacd, sig);
      let idx = 0;
      for (let i = validStart; i < closes.length; i++) {
        if (!isNaN(macdLine[i]) && idx < sigEma.length) signal[i] = sigEma[idx++];
      }
    }
  }
  return { macd: macdLine, signal, histogram: macdLine.map((m, i) => isNaN(m) || isNaN(signal[i]) ? NaN : m - signal[i]) };
}

function calculateBB(closes: number[], period: number, stdDev: number) {
  const middle = calculateSMA(closes, period);
  return {
    middle,
    upper: middle.map((m, i) => {
      if (isNaN(m) || i < period - 1) return NaN;
      const slice = closes.slice(i - period + 1, i + 1);
      const std = Math.sqrt(slice.reduce((s, v) => s + (v - m) ** 2, 0) / period);
      return m + stdDev * std;
    }),
    lower: middle.map((m, i) => {
      if (isNaN(m) || i < period - 1) return NaN;
      const slice = closes.slice(i - period + 1, i + 1);
      const std = Math.sqrt(slice.reduce((s, v) => s + (v - m) ** 2, 0) / period);
      return m - stdDev * std;
    }),
  };
}


function TradingChartComponent({ positions, coin, symbol, timeframe = "60" }: TradingChartProps) {
  const apiSymbol = symbol ? symbol.replace(/USDT$/i, "") : coin;
  
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const indicatorSeriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map());
  const entryLineRef = useRef<ReturnType<ISeriesApi<"Candlestick">["createPriceLine"]> | null>(null);
  
  
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiOverboughtRef = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiOversoldRef = useRef<ISeriesApi<"Line"> | null>(null);
  
  
  const macdContainerRef = useRef<HTMLDivElement>(null);
  const macdChartRef = useRef<IChartApi | null>(null);
  const macdLineRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdSignalRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdHistRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  
  
  const isLoadingMoreRef = useRef(false);
  const oldestLoadedTimeRef = useRef<number | null>(null);
  const allCandlesRef = useRef<CandlestickData<Time>[]>([]);
  const volumeDataRef = useRef<{ time: Time; value: number; color: string }[]>([]);
  
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartReady, setChartReady] = useState(false);
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
  const [indicators, setIndicators] = useState<IndicatorSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chart-indicators-v2');
      return saved ? { ...DEFAULT_INDICATORS, ...JSON.parse(saved) } : DEFAULT_INDICATORS;
    }
    return DEFAULT_INDICATORS;
  });
  
  
  const [resizingPanel, setResizingPanel] = useState<'rsi' | 'macd' | null>(null);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);

  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chart-indicators-v2', JSON.stringify(indicators));
    }
  }, [indicators]);

  
  const fetchKlines = useCallback(async (sym: string, interval: string, end?: number) => {
    let url = `https:
    if (end) url += `&end=${end}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    if (data.retCode !== 0) throw new Error(data.retMsg);
    
    const candles: CandlestickData<Time>[] = [];
    const volumes: { time: Time; value: number; color: string }[] = [];
    for (const k of data.result.list.reverse()) {
      const open = parseFloat(k[1]), close = parseFloat(k[4]), time = (parseInt(k[0]) / 1000) as Time;
      candles.push({ time, open, high: parseFloat(k[2]), low: parseFloat(k[3]), close });
      volumes.push({ time, value: parseFloat(k[5]), color: close >= open ? COLORS.volumeUp : COLORS.volumeDown });
    }
    return { candles, volumes };
  }, []);

  
  const findPositionForCoin = useCallback((coinSymbol: string) => {
    return positions.find(p => p.symbol.replace(/USDT$/i, "").toUpperCase() === coinSymbol.toUpperCase());
  }, [positions]);

  
  const updatePositionMarkers = useCallback((position: Position | undefined) => {
    if (!candleSeriesRef.current) return;
    if (entryLineRef.current) {
      try { candleSeriesRef.current.removePriceLine(entryLineRef.current); } catch {}
      entryLineRef.current = null;
    }
    if (!position) return;
    const isLong = position.direction.toLowerCase() === "long";
    entryLineRef.current = candleSeriesRef.current.createPriceLine({
      price: position.entryPrice,
      color: isLong ? "#00ffaa" : "#ff4466",
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: `Entry ${isLong ? "LONG" : "SHORT"}`,
    });
  }, []);


  
  const updateOverlayIndicators = useCallback(async () => {
    if (!chartRef.current || allCandlesRef.current.length === 0) return;
    const { LineSeries } = await import("lightweight-charts");
    const chart = chartRef.current;
    const closes = allCandlesRef.current.map(c => c.close);
    const times = allCandlesRef.current.map(c => c.time);
    
    
    indicatorSeriesRef.current.forEach(s => { try { chart.removeSeries(s); } catch {} });
    indicatorSeriesRef.current.clear();
    
    
    if (indicators.ema.enabled) {
      for (const p of indicators.ema.periods) {
        const d = calculateEMA(closes, p);
        const s = chart.addSeries(LineSeries, { 
          color: p === 9 ? COLORS.ema9 : COLORS.ema21, 
          lineWidth: 1, 
          priceLineVisible: false, 
          lastValueVisible: true,
          title: `EMA ${p}`,
        });
        s.setData(d.map((v, i) => ({ time: times[i], value: v })).filter(x => !isNaN(x.value)) as LineData<Time>[]);
        indicatorSeriesRef.current.set(`ema${p}`, s);
      }
    }
    
    
    if (indicators.sma.enabled) {
      for (const p of indicators.sma.periods) {
        const d = calculateSMA(closes, p);
        const s = chart.addSeries(LineSeries, { 
          color: p === 50 ? COLORS.sma50 : COLORS.sma200, 
          lineWidth: 1, 
          priceLineVisible: false, 
          lastValueVisible: true,
          title: `SMA ${p}`,
        });
        s.setData(d.map((v, i) => ({ time: times[i], value: v })).filter(x => !isNaN(x.value)) as LineData<Time>[]);
        indicatorSeriesRef.current.set(`sma${p}`, s);
      }
    }
    
    
    if (indicators.bollinger.enabled) {
      const bb = calculateBB(closes, indicators.bollinger.period, indicators.bollinger.stdDev);
      const upper = chart.addSeries(LineSeries, { color: COLORS.bbUpper, lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
      const mid = chart.addSeries(LineSeries, { color: COLORS.bbMiddle, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      const lower = chart.addSeries(LineSeries, { color: COLORS.bbLower, lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
      upper.setData(bb.upper.map((v, i) => ({ time: times[i], value: v })).filter(x => !isNaN(x.value)) as LineData<Time>[]);
      mid.setData(bb.middle.map((v, i) => ({ time: times[i], value: v })).filter(x => !isNaN(x.value)) as LineData<Time>[]);
      lower.setData(bb.lower.map((v, i) => ({ time: times[i], value: v })).filter(x => !isNaN(x.value)) as LineData<Time>[]);
      indicatorSeriesRef.current.set('bbU', upper);
      indicatorSeriesRef.current.set('bbM', mid);
      indicatorSeriesRef.current.set('bbL', lower);
    }
    
    
    volumeSeriesRef.current?.applyOptions({ visible: indicators.volume.enabled });
  }, [indicators.ema, indicators.sma, indicators.bollinger, indicators.volume]);

  
  const updateRSIPanel = useCallback(async () => {
    
    if (!indicators.rsi.enabled) {
      if (rsiChartRef.current) { rsiChartRef.current.remove(); rsiChartRef.current = null; }
      rsiSeriesRef.current = null;
      rsiOverboughtRef.current = null;
      rsiOversoldRef.current = null;
      return;
    }
    
    if (!rsiContainerRef.current || allCandlesRef.current.length === 0) return;
    
    const { createChart, LineSeries } = await import("lightweight-charts");
    const closes = allCandlesRef.current.map(c => c.close);
    const times = allCandlesRef.current.map(c => c.time);
    const rsiData = calculateRSI(closes, indicators.rsi.period);
    
    
    if (!rsiChartRef.current) {
      rsiChartRef.current = createChart(rsiContainerRef.current, {
        layout: { background: { color: "#0a0a12" }, textColor: "#6a6a7f" },
        grid: { vertLines: { color: "rgba(255,255,255,0.03)" }, horzLines: { color: "rgba(255,255,255,0.03)" } },
        rightPriceScale: { 
          borderColor: "rgba(255,255,255,0.1)", 
          scaleMargins: { top: 0.05, bottom: 0.05 },
          autoScale: false,
        },
        timeScale: { visible: false, rightOffset: 0 },
        crosshair: { mode: 1, horzLine: { visible: true, labelVisible: true } },
        width: rsiContainerRef.current.clientWidth,
        height: indicators.rsi.height,
      });
      
      
      rsiSeriesRef.current = rsiChartRef.current.addSeries(LineSeries, { 
        color: COLORS.rsi, 
        lineWidth: 2, 
        priceLineVisible: true,
        lastValueVisible: true,
        priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
      });
      
      
      rsiOverboughtRef.current = rsiChartRef.current.addSeries(LineSeries, {
        color: COLORS.rsiOverbought,
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      
      
      rsiOversoldRef.current = rsiChartRef.current.addSeries(LineSeries, {
        color: COLORS.rsiOversold,
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      
      
      rsiChartRef.current.priceScale('right').applyOptions({ autoScale: false });
    }
    
    
    const validRsi = rsiData.map((v, i) => ({ time: times[i], value: v })).filter(x => !isNaN(x.value)) as LineData<Time>[];
    rsiSeriesRef.current?.setData(validRsi);
    
    
    if (times.length > 0) {
      const firstTime = times[0];
      const lastTime = times[times.length - 1];
      rsiOverboughtRef.current?.setData([{ time: firstTime, value: 70 }, { time: lastTime, value: 70 }]);
      rsiOversoldRef.current?.setData([{ time: firstTime, value: 30 }, { time: lastTime, value: 30 }]);
    }
    
    
    if (chartRef.current && rsiChartRef.current) {
      const range = chartRef.current.timeScale().getVisibleLogicalRange();
      if (range) rsiChartRef.current.timeScale().setVisibleLogicalRange(range);
    }
    
    
    rsiChartRef.current?.applyOptions({ height: indicators.rsi.height });
  }, [indicators.rsi]);


  
  const updateMACDPanel = useCallback(async () => {
    if (!indicators.macd.enabled) {
      if (macdChartRef.current) { macdChartRef.current.remove(); macdChartRef.current = null; }
      macdLineRef.current = null;
      macdSignalRef.current = null;
      macdHistRef.current = null;
      return;
    }
    
    if (!macdContainerRef.current || allCandlesRef.current.length === 0) return;
    
    const { createChart, LineSeries, HistogramSeries } = await import("lightweight-charts");
    const closes = allCandlesRef.current.map(c => c.close);
    const times = allCandlesRef.current.map(c => c.time);
    const { macd, signal, histogram } = calculateMACD(closes, indicators.macd.fast, indicators.macd.slow, indicators.macd.signal);
    
    
    if (!macdChartRef.current) {
      macdChartRef.current = createChart(macdContainerRef.current, {
        layout: { background: { color: "#0a0a12" }, textColor: "#6a6a7f" },
        grid: { vertLines: { color: "rgba(255,255,255,0.03)" }, horzLines: { color: "rgba(255,255,255,0.03)" } },
        rightPriceScale: { 
          borderColor: "rgba(255,255,255,0.1)", 
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: { visible: false, rightOffset: 0 },
        crosshair: { mode: 1, horzLine: { visible: true, labelVisible: true } },
        width: macdContainerRef.current.clientWidth,
        height: indicators.macd.height,
      });
      
      
      macdHistRef.current = macdChartRef.current.addSeries(HistogramSeries, { 
        priceLineVisible: false,
        lastValueVisible: false,
        priceFormat: { type: 'price', precision: 6, minMove: 0.000001 },
      });
      
      
      macdLineRef.current = macdChartRef.current.addSeries(LineSeries, { 
        color: COLORS.macdLine, 
        lineWidth: 2, 
        priceLineVisible: true,
        lastValueVisible: true,
        title: 'MACD',
        priceFormat: { type: 'price', precision: 6, minMove: 0.000001 },
      });
      
      
      macdSignalRef.current = macdChartRef.current.addSeries(LineSeries, { 
        color: COLORS.macdSignal, 
        lineWidth: 2, 
        priceLineVisible: false,
        lastValueVisible: true,
        title: 'Signal',
        priceFormat: { type: 'price', precision: 6, minMove: 0.000001 },
      });
    }
    
    
    macdHistRef.current?.setData(
      histogram.map((v, i) => ({ time: times[i], value: v, color: v >= 0 ? COLORS.macdHistUp : COLORS.macdHistDown }))
        .filter(x => !isNaN(x.value)) as HistogramData<Time>[]
    );
    macdLineRef.current?.setData(
      macd.map((v, i) => ({ time: times[i], value: v })).filter(x => !isNaN(x.value)) as LineData<Time>[]
    );
    macdSignalRef.current?.setData(
      signal.map((v, i) => ({ time: times[i], value: v })).filter(x => !isNaN(x.value)) as LineData<Time>[]
    );
    
    
    if (chartRef.current && macdChartRef.current) {
      const range = chartRef.current.timeScale().getVisibleLogicalRange();
      if (range) macdChartRef.current.timeScale().setVisibleLogicalRange(range);
    }
    
    
    macdChartRef.current?.applyOptions({ height: indicators.macd.height });
  }, [indicators.macd]);

  
  const loadMoreData = useCallback(async () => {
    if (isLoadingMoreRef.current || !oldestLoadedTimeRef.current || !candleSeriesRef.current) return;
    isLoadingMoreRef.current = true;
    
    try {
      const { candles, volumes } = await fetchKlines(apiSymbol, timeframe, oldestLoadedTimeRef.current * 1000 - 1);
      if (candles.length > 0 && candleSeriesRef.current && volumeSeriesRef.current) {
        
        allCandlesRef.current = [...candles, ...allCandlesRef.current];
        volumeDataRef.current = [...volumes, ...volumeDataRef.current];
        oldestLoadedTimeRef.current = candles[0].time as number;
        
        
        candleSeriesRef.current.setData(allCandlesRef.current);
        volumeSeriesRef.current.setData(volumeDataRef.current);
        
        
        await updateOverlayIndicators();
        await updateRSIPanel();
        await updateMACDPanel();
      }
    } catch (e) {
      console.error("Load more error:", e);
    } finally {
      isLoadingMoreRef.current = false;
    }
  }, [apiSymbol, timeframe, fetchKlines, updateOverlayIndicators, updateRSIPanel, updateMACDPanel]);


  
  useEffect(() => {
    if (!chartContainerRef.current) return;
    let mounted = true;

    const initChart = async () => {
      const { createChart, CandlestickSeries, HistogramSeries } = await import("lightweight-charts");
      if (!mounted || !chartContainerRef.current) return;
      
      if (chartRef.current) chartRef.current.remove();

      const chart = createChart(chartContainerRef.current, {
        layout: { background: { color: "#0a0a12" }, textColor: "#6a6a7f" },
        grid: { vertLines: { color: "rgba(255,255,255,0.03)" }, horzLines: { color: "rgba(255,255,255,0.03)" } },
        crosshair: { mode: 0, vertLine: { color: "rgba(0,255,170,0.3)", labelBackgroundColor: "#00ffaa" }, horzLine: { color: "rgba(0,255,170,0.3)", labelBackgroundColor: "#00ffaa" } },
        rightPriceScale: { borderColor: "rgba(255,255,255,0.1)", scaleMargins: { top: 0.1, bottom: 0.2 } },
        timeScale: { borderColor: "rgba(255,255,255,0.1)", timeVisible: true, secondsVisible: false },
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#00ffaa", downColor: "#ff4466",
        borderUpColor: "#00ffaa", borderDownColor: "#ff4466",
        wickUpColor: "#00ffaa", wickDownColor: "#ff4466",
        priceFormat: { type: "price", precision: 6, minMove: 0.000001 },
      });
      
      const volumeSeries = chart.addSeries(HistogramSeries, { 
        priceFormat: { type: "volume" }, 
        priceScaleId: "volume",
      });
      chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });

      chartRef.current = chart;
      candleSeriesRef.current = candleSeries;
      volumeSeriesRef.current = volumeSeries;

      
      chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (range && range.from < 20) loadMoreData();
        
        if (range) {
          rsiChartRef.current?.timeScale().setVisibleLogicalRange(range);
          macdChartRef.current?.timeScale().setVisibleLogicalRange(range);
        }
      });

      if (mounted) setChartReady(true);
    };

    initChart();

    
    const handleResize = () => {
      if (!chartContainerRef.current || !chartRef.current) return;
      const width = chartContainerRef.current.clientWidth;
      const height = chartContainerRef.current.clientHeight;
      chartRef.current.applyOptions({ width, height });
      rsiChartRef.current?.applyOptions({ width });
      macdChartRef.current?.applyOptions({ width });
    };
    
    window.addEventListener("resize", handleResize);
    const ro = new ResizeObserver(handleResize);
    if (chartContainerRef.current) ro.observe(chartContainerRef.current);

    return () => {
      mounted = false;
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
      indicatorSeriesRef.current.clear();
      rsiChartRef.current?.remove();
      macdChartRef.current?.remove();
      chartRef.current?.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      rsiChartRef.current = null;
      macdChartRef.current = null;
      setChartReady(false);
    };
  }, [loadMoreData]);

  
  useEffect(() => {
    if (!chartReady) return;
    let mounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { candles, volumes } = await fetchKlines(apiSymbol, timeframe);
        if (!mounted || !candleSeriesRef.current || !volumeSeriesRef.current) return;
        
        allCandlesRef.current = candles;
        volumeDataRef.current = volumes;
        oldestLoadedTimeRef.current = candles[0]?.time as number;
        
        candleSeriesRef.current.setData(candles);
        volumeSeriesRef.current.setData(volumes);
        chartRef.current?.timeScale().fitContent();
        
        
        await updateOverlayIndicators();
        await updateRSIPanel();
        await updateMACDPanel();
        
        
        updatePositionMarkers(findPositionForCoin(apiSymbol));
        
        setIsLoading(false);
      } catch (e) {
        if (mounted) { setError("Failed to load chart"); setIsLoading(false); }
      }
    };
    
    loadData();
    return () => { mounted = false; };
  }, [chartReady, apiSymbol, timeframe, fetchKlines, updateOverlayIndicators, updateRSIPanel, updateMACDPanel, findPositionForCoin, updatePositionMarkers]);

  
  useEffect(() => {
    if (chartReady) updatePositionMarkers(findPositionForCoin(apiSymbol));
  }, [chartReady, positions, apiSymbol, findPositionForCoin, updatePositionMarkers]);

  
  useEffect(() => {
    if (chartReady && allCandlesRef.current.length > 0) {
      updateOverlayIndicators();
      updateRSIPanel();
      updateMACDPanel();
    }
  }, [chartReady, indicators, updateOverlayIndicators, updateRSIPanel, updateMACDPanel]);


  
  const handleResizeStart = (panel: 'rsi' | 'macd', e: React.MouseEvent) => {
    e.preventDefault();
    setResizingPanel(panel);
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = panel === 'rsi' ? indicators.rsi.height : indicators.macd.height;
  };

  useEffect(() => {
    if (!resizingPanel) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const delta = resizeStartY.current - e.clientY;
      const newHeight = Math.max(80, Math.min(300, resizeStartHeight.current + delta));
      
      setIndicators(prev => ({
        ...prev,
        [resizingPanel]: { ...prev[resizingPanel], height: newHeight }
      }));
    };
    
    const handleMouseUp = () => setResizingPanel(null);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingPanel]);

  const toggleIndicator = (key: keyof IndicatorSettings) => {
    setIndicators(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));
  };

  const activeCount = Object.values(indicators).filter(i => i.enabled).length;

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0a12]">
      {}
      <div className="absolute top-2 left-2 z-20">
        <div className="relative">
          <button
            onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs text-[#6a6a7f] hover:text-white transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Indicators</span>
            {activeCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded bg-[#00ffaa]/20 text-[#00ffaa] text-[10px] font-medium">{activeCount}</span>}
            <ChevronDown className={`w-3 h-3 transition-transform ${showIndicatorMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showIndicatorMenu && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[#0f0f15] border border-white/10 rounded-lg shadow-xl overflow-hidden">
              <div className="p-2 border-b border-white/5"><span className="text-[10px] uppercase tracking-wider text-[#6a6a7f]">Overlay</span></div>
              <div className="p-1">
                {[
                  { key: 'ema' as const, label: 'EMA (9, 21)', colors: [COLORS.ema9, COLORS.ema21] },
                  { key: 'sma' as const, label: 'SMA (50, 200)', colors: [COLORS.sma50, COLORS.sma200] },
                  { key: 'bollinger' as const, label: 'Bollinger Bands', colors: [COLORS.bbUpper] },
                  { key: 'volume' as const, label: 'Volume', colors: ['#00ffaa', '#ff4466'] },
                ].map(({ key, label, colors }) => (
                  <button key={key} onClick={() => toggleIndicator(key)} className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-white/5 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 rounded" style={{ background: colors.length > 1 ? `linear-gradient(90deg, ${colors[0]}, ${colors[1]})` : colors[0] }} />
                      <span className="text-sm text-white">{label}</span>
                    </div>
                    {indicators[key].enabled && <Check className="w-4 h-4 text-[#00ffaa]" />}
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-white/5"><span className="text-[10px] uppercase tracking-wider text-[#6a6a7f]">Panels</span></div>
              <div className="p-1">
                {[
                  { key: 'rsi' as const, label: 'RSI (14)', color: COLORS.rsi },
                  { key: 'macd' as const, label: 'MACD (12, 26, 9)', colors: [COLORS.macdLine, COLORS.macdSignal] },
                ].map(({ key, label, color, colors }) => (
                  <button key={key} onClick={() => toggleIndicator(key)} className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-white/5 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 rounded" style={{ background: colors ? `linear-gradient(90deg, ${colors[0]}, ${colors[1]})` : color }} />
                      <span className="text-sm text-white">{label}</span>
                    </div>
                    {indicators[key].enabled && <Check className="w-4 h-4 text-[#00ffaa]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {showIndicatorMenu && <div className="fixed inset-0 z-10" onClick={() => setShowIndicatorMenu(false)} />}

      {}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {}
        <div ref={chartContainerRef} className="flex-1 min-h-[150px]" />
        
        {}
        {indicators.rsi.enabled && (
          <div className="flex-shrink-0 border-t border-white/10 relative">
            {}
            <div 
              className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize flex items-center justify-center hover:bg-white/5 group z-10"
              onMouseDown={(e) => handleResizeStart('rsi', e)}
            >
              <GripHorizontal className="w-4 h-4 text-[#3a3a4f] group-hover:text-[#6a6a7f]" />
            </div>
            <div className="flex items-center justify-between px-2 py-1 bg-[#0a0a12] mt-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#6a6a7f]">RSI ({indicators.rsi.period})</span>
                <span className="text-[10px] text-[#f7931a]">●</span>
              </div>
              <button onClick={() => toggleIndicator('rsi')} className="p-0.5 hover:bg-white/10 rounded">
                <X className="w-3 h-3 text-[#6a6a7f]" />
              </button>
            </div>
            <div ref={rsiContainerRef} style={{ height: indicators.rsi.height }} />
          </div>
        )}
        
        {}
        {indicators.macd.enabled && (
          <div className="flex-shrink-0 border-t border-white/10 relative">
            {}
            <div 
              className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize flex items-center justify-center hover:bg-white/5 group z-10"
              onMouseDown={(e) => handleResizeStart('macd', e)}
            >
              <GripHorizontal className="w-4 h-4 text-[#3a3a4f] group-hover:text-[#6a6a7f]" />
            </div>
            <div className="flex items-center justify-between px-2 py-1 bg-[#0a0a12] mt-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#6a6a7f]">MACD ({indicators.macd.fast}, {indicators.macd.slow}, {indicators.macd.signal})</span>
                <span className="text-[10px] text-[#2962ff]">● MACD</span>
                <span className="text-[10px] text-[#ff6d00]">● Signal</span>
              </div>
              <button onClick={() => toggleIndicator('macd')} className="p-0.5 hover:bg-white/10 rounded">
                <X className="w-3 h-3 text-[#6a6a7f]" />
              </button>
            </div>
            <div ref={macdContainerRef} style={{ height: indicators.macd.height }} />
          </div>
        )}
      </div>

      {}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a12]/80 z-30">
          <div className="w-8 h-8 border-2 border-[#00ffaa] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {error && <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a12]/80 z-30 text-[#ff4466]">{error}</div>}
    </div>
  );
}

export default memo(TradingChartComponent);
