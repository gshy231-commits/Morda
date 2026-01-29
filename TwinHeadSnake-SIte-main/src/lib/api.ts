
const API_BASE_URL = process.env.NEXT_PUBLIC_DATA_API_URL || "https://api.twinheadsnake.com";






export interface RawSymbol {
  symbol: string;
  timeframe: string;
  candles_count: number;
  best_pnl: number;
  best_macd: {
    fast: number;
    slow: number;
    signal: number;
  };
  wins: number;
  losses: number;
  win_rate: number;
  profit_factor: number | null;
  has_entry_signal: boolean;
  signal_direction: "Long" | "Short" | null;
  last_price: number;
  last_macd: number;
  last_macd_signal: number;
  last_rsi: number;
  last_ema100: number;
  last_ema200: number;
  last_atr_percent: number;
  is_bullish: boolean;
  last_candle_time: string;
}


export interface RawDeal {
  direction: "Long" | "Short";
  entry_time: string;
  entry_price: number;
  exit_time: string;
  exit_price: number;
  pnl: number;
  macd_fast: number;
  macd_slow: number;
  macd_signal: number;
  entry_ema100: number;
  entry_ema200: number;
  entry_rsi: number;
  entry_atr: number;
  entry_macd: number;
  entry_macd_signal: number;
  exit_ema100: number;
  exit_ema200: number;
  exit_rsi: number;
  exit_atr: number;
  exit_macd: number;
  exit_macd_signal: number;
  entry_reason: string;
  exit_reason: string;
}


export interface RawCandle {
  utc: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema100: number;
  ema200: number;
  rsi: number;
  atr: number;
  is_bull_trend_ema: boolean;
  is_rsi_sell_zone: boolean;
}


export interface RawOpenPosition {
  symbol: string;
  direction: "Long" | "Short";
  entry_price: number;
  current_price: number;
  entry_time: string;
  unrealized_pnl: number;
}


export interface RawStats {
  last_month_pnl: number;
  last_month_avg_pnl: number;
  last_month_trades: number;
  last_month_wins: number;
  last_month_losses: number;
  last_month_win_rate: number;
  last_year_pnl: number;
  last_year_avg_pnl: number;
  last_year_trades: number;
  last_year_wins: number;
  last_year_losses: number;
  last_year_win_rate: number;
  last_year_avg_win_rate: number;
  last_year_avg_profit_factor: number;
  symbols_count: number;
  available_pairs: number;
  open_positions: number;
  unrealized_pnl: number;
}


export interface RawPortfolioPoint {
  label: string;
  value: number;
  pnl: number;
}


export interface DataApiResponse {
  symbols: RawSymbol[];
  open_positions: RawOpenPosition[];
  stats: RawStats;
  portfolio: Record<string, RawPortfolioPoint[]>;
  updated_at: string;
}

export interface DealsApiResponse {
  deals: Record<string, RawDeal[]>;
}

export interface CandlesApiResponse {
  candles: Record<string, RawCandle[]>;
}






export interface DashboardStats {
  lastMonthPnl: number;
  lastMonthAvgPnl: number;
  lastMonthTrades: number;
  lastMonthWins: number;
  lastMonthLosses: number;
  lastMonthWinRate: number;
  lastYearPnl: number;
  lastYearAvgPnl: number;
  lastYearTrades: number;
  lastYearWins: number;
  lastYearLosses: number;
  lastYearWinRate: number;
  lastYearAvgWinRate: number;
  lastYearAvgProfitFactor: number;
  symbolsCount: number;
  availablePairs: number;
  openPositions: number;
  unrealizedPnl: number;
}


export interface Position {
  symbol: string;
  direction: "Long" | "Short";
  entryPrice: number;
  currentPrice: number;
  entryTime: string;
  unrealizedPnl: number;
}


export interface TopCoin {
  symbol: string;
  timeframe: string;
  candlesCount: number;
  bestPnl: number;
  bestMacd: CoinMACD;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number | null;
  lastPrice?: number;
  hasEntrySignal?: boolean;
  signalDirection?: "Long" | "Short" | null;
}


export interface CoinMACD {
  fast: number;
  slow: number;
  signal: number;
}


export interface PortfolioDataPoint {
  label: string;
  value: number;
  pnl: number;
}

export type ChartTimeframe = "1M" | "3M" | "1Y" | "ALL";

export interface PortfolioData {
  "1M": PortfolioDataPoint[];
  "3M": PortfolioDataPoint[];
  "1Y": PortfolioDataPoint[];
  "ALL": PortfolioDataPoint[];
}


export interface SymbolInfo {
  symbol: string;
  timeframe: string;
  candlesCount: number;
  bestPnl: number;
  bestMacd: CoinMACD;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number | null;
  lastPrice?: number;
  hasEntrySignal?: boolean;
  signalDirection?: "Long" | "Short" | null;
}


export interface HomepageData {
  stats: DashboardStats;
  positions: Position[];
  topCoins: TopCoin[];
  portfolio: PortfolioData;
  allSymbols: SymbolInfo[];
  lastUpdated: string;
}






export async function fetchSymbolsData(): Promise<DataApiResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const res = await fetch(`${API_BASE_URL}/data`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      console.error(`API /data error: ${res.status} ${res.statusText}`);
      return null;
    }
    
    return await res.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("API /data request timeout");
    } else {
      console.error("Error fetching /data:", error);
    }
    return null;
  }
}


export async function fetchDealsData(): Promise<DealsApiResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const res = await fetch(`${API_BASE_URL}/deals`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      console.error(`API /deals error: ${res.status} ${res.statusText}`);
      return null;
    }
    
    return await res.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("API /deals request timeout");
    } else {
      console.error("Error fetching /deals:", error);
    }
    return null;
  }
}


export async function fetchCandlesData(): Promise<CandlesApiResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const res = await fetch(`${API_BASE_URL}/candles`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      console.error(`API /candles error: ${res.status} ${res.statusText}`);
      return null;
    }
    
    return await res.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("API /candles request timeout");
    } else {
      console.error("Error fetching /candles:", error);
    }
    return null;
  }
}


export async function fetchHomepageData(): Promise<HomepageData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const res = await fetch(`${API_BASE_URL}/homepage`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`);
      return null;
    }
    
    return await res.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("API request timeout");
    } else {
      console.error("Error fetching homepage data:", error);
    }
    return null;
  }
}






export function transformSymbolToTopCoin(raw: RawSymbol): TopCoin {
  return {
    symbol: raw.symbol,
    timeframe: raw.timeframe,
    candlesCount: raw.candles_count,
    bestPnl: raw.best_pnl,
    bestMacd: {
      fast: raw.best_macd.fast,
      slow: raw.best_macd.slow,
      signal: raw.best_macd.signal,
    },
    wins: raw.wins,
    losses: raw.losses,
    winRate: raw.win_rate,
    profitFactor: raw.profit_factor,
    lastPrice: raw.last_price,
    hasEntrySignal: raw.has_entry_signal,
    signalDirection: raw.signal_direction,
  };
}


export function transformSymbolToSymbolInfo(raw: RawSymbol): SymbolInfo {
  return {
    symbol: raw.symbol,
    timeframe: raw.timeframe,
    candlesCount: raw.candles_count,
    bestPnl: raw.best_pnl,
    bestMacd: {
      fast: raw.best_macd.fast,
      slow: raw.best_macd.slow,
      signal: raw.best_macd.signal,
    },
    wins: raw.wins,
    losses: raw.losses,
    winRate: raw.win_rate,
    profitFactor: raw.profit_factor,
    lastPrice: raw.last_price,
    hasEntrySignal: raw.has_entry_signal,
    signalDirection: raw.signal_direction,
  };
}


export function calculateStatsFromSymbols(symbols: RawSymbol[]): DashboardStats {
  const totalWins = symbols.reduce((sum, s) => sum + s.wins, 0);
  const totalLosses = symbols.reduce((sum, s) => sum + s.losses, 0);
  const totalTrades = totalWins + totalLosses;
  const avgWinRate = symbols.length > 0 
    ? symbols.reduce((sum, s) => sum + s.win_rate, 0) / symbols.length 
    : 0;
  const avgProfitFactor = symbols.filter(s => s.profit_factor !== null).length > 0
    ? symbols.filter(s => s.profit_factor !== null).reduce((sum, s) => sum + (s.profit_factor || 0), 0) / symbols.filter(s => s.profit_factor !== null).length
    : 0;
  const totalPnl = symbols.reduce((sum, s) => sum + s.best_pnl, 0);
  const openPositions = symbols.filter(s => s.has_entry_signal).length;

  return {
    lastMonthPnl: totalPnl * 0.015, 
    lastMonthAvgPnl: totalPnl * 0.015 / Math.max(1, symbols.length),
    lastMonthTrades: Math.round(totalTrades * 0.08),
    lastMonthWins: Math.round(totalWins * 0.08),
    lastMonthLosses: Math.round(totalLosses * 0.08),
    lastMonthWinRate: avgWinRate,
    lastYearPnl: totalPnl,
    lastYearAvgPnl: totalPnl / Math.max(1, symbols.length),
    lastYearTrades: totalTrades,
    lastYearWins: totalWins,
    lastYearLosses: totalLosses,
    lastYearWinRate: totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0,
    lastYearAvgWinRate: avgWinRate,
    lastYearAvgProfitFactor: avgProfitFactor,
    symbolsCount: symbols.length,
    availablePairs: symbols.length,
    openPositions: openPositions,
    unrealizedPnl: 0,
  };
}


export function generatePortfolioFromSymbols(symbols: RawSymbol[]): PortfolioData {
  
  const topSymbols = [...symbols].sort((a, b) => b.best_pnl - a.best_pnl).slice(0, 7);
  const totalPnl = topSymbols.reduce((sum, s) => sum + s.best_pnl, 0);
  const startValue = 7000; 
  const endValue = startValue * (1 + totalPnl / 100 / 7); 

  
  const months = ["Jan '25", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan '26"];
  const rawPortfolio: PortfolioDataPoint[] = months.map((label, i) => {
    const progress = i / (months.length - 1);
    
    const value = startValue * Math.pow(endValue / startValue, progress);
    const pnl = ((value / startValue) - 1) * 100;
    return { label, value: Math.round(value), pnl: Math.round(pnl) };
  });

  return {
    "1M": rawPortfolio.slice(-4),
    "3M": rawPortfolio.slice(-3),
    "1Y": rawPortfolio,
    "ALL": rawPortfolio,
  };
}


export function getPositionsFromSymbols(symbols: RawSymbol[]): Position[] {
  return symbols
    .filter(s => s.has_entry_signal && s.signal_direction)
    .map(s => ({
      symbol: s.symbol,
      direction: s.signal_direction as "Long" | "Short",
      entryPrice: s.last_price,
      currentPrice: s.last_price,
      entryTime: s.last_candle_time,
      unrealizedPnl: 0,
    }));
}


export function transformOpenPositions(rawPositions: RawOpenPosition[]): Position[] {
  return rawPositions.map(p => ({
    symbol: p.symbol,
    direction: p.direction,
    entryPrice: p.entry_price,
    currentPrice: p.current_price,
    entryTime: p.entry_time,
    unrealizedPnl: p.unrealized_pnl,
  }));
}


export function transformStats(rawStats: RawStats): DashboardStats {
  return {
    lastMonthPnl: rawStats.last_month_pnl,
    lastMonthAvgPnl: rawStats.last_month_avg_pnl,
    lastMonthTrades: rawStats.last_month_trades,
    lastMonthWins: rawStats.last_month_wins,
    lastMonthLosses: rawStats.last_month_losses,
    lastMonthWinRate: rawStats.last_month_win_rate,
    lastYearPnl: rawStats.last_year_pnl,
    lastYearAvgPnl: rawStats.last_year_avg_pnl,
    lastYearTrades: rawStats.last_year_trades,
    lastYearWins: rawStats.last_year_wins,
    lastYearLosses: rawStats.last_year_losses,
    lastYearWinRate: rawStats.last_year_win_rate,
    lastYearAvgWinRate: rawStats.last_year_avg_win_rate,
    lastYearAvgProfitFactor: rawStats.last_year_avg_profit_factor,
    symbolsCount: rawStats.symbols_count,
    availablePairs: rawStats.available_pairs,
    openPositions: rawStats.open_positions,
    unrealizedPnl: rawStats.unrealized_pnl,
  };
}


export function transformPortfolio(rawPortfolio: Record<string, RawPortfolioPoint[]>): PortfolioData {
  const transform = (points: RawPortfolioPoint[]): PortfolioDataPoint[] => 
    points.map(p => ({ label: p.label, value: p.value, pnl: p.pnl }));
  
  
  const data = rawPortfolio["240"] || [];
  const allData = transform(data);
  
  return {
    "1M": allData.slice(-2), 
    "3M": allData.slice(-4), 
    "1Y": allData,           
    "ALL": allData,          
  };
}






export function calcResult1k(bestPnl: number): number {
  return Math.round(1000 * (1 + bestPnl / 100));
}



export function calcResultCompound(bestPnl: number, trades: number): number {
  if (trades === 0) return 1000;
  
  
  const totalReturn = 1 + bestPnl / 100;
  
  
  const compoundFactor = Math.min(1.5, 1 + Math.log10(trades) * 0.2);
  return Math.round(1000 * Math.pow(totalReturn, compoundFactor));
}


export function formatSymbol(symbol: string): string {
  return symbol.replace(/USDT$/, "").replace(/^1000000/, "").replace(/^10000/, "").replace(/^1000/, "");
}





export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPrice(value: number): string {
  if (value >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (value >= 1) {
    return value.toFixed(4);
  }
  if (value >= 0.0001) {
    return value.toFixed(6);
  }
  return value.toPrecision(4);
}

export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}






export interface SSRData {
  homepageData: HomepageData;
  deals: Record<string, RawDeal[]>;
  candles: Record<string, RawCandle[]>;
}


export async function fetchAllDataSSR(): Promise<SSRData | null> {
  try {
    
    const [symbolsResult, dealsResult, candlesResult] = await Promise.all([
      fetchSymbolsData(),
      fetchDealsData(),
      fetchCandlesData(),
    ]);

    if (!symbolsResult || !symbolsResult.symbols) {
      console.error("SSR: Failed to fetch symbols data");
      return null;
    }

    const symbols = symbolsResult.symbols;
    
    
    const dealsSymbols = dealsResult?.deals ? Object.keys(dealsResult.deals) : [];
    
    
    const top7 = symbols
      .filter(s => dealsSymbols.includes(s.symbol))
      .sort((a, b) => b.best_pnl - a.best_pnl)
      .slice(0, 7);
    
    
    const topCoins = top7.map(transformSymbolToTopCoin);
    const allSymbols = symbols.map(transformSymbolToSymbolInfo);
    
    
    const stats = symbolsResult.stats 
      ? transformStats(symbolsResult.stats) 
      : {
          lastMonthPnl: 0, lastMonthAvgPnl: 0, lastMonthTrades: 0,
          lastMonthWins: 0, lastMonthLosses: 0, lastMonthWinRate: 0,
          lastYearPnl: 0, lastYearAvgPnl: 0, lastYearTrades: 0,
          lastYearWins: 0, lastYearLosses: 0, lastYearWinRate: 0,
          lastYearAvgWinRate: 0, lastYearAvgProfitFactor: 0,
          symbolsCount: symbols.length, availablePairs: symbols.length,
          openPositions: 0, unrealizedPnl: 0,
        };
    
    const positions = symbolsResult.open_positions 
      ? transformOpenPositions(symbolsResult.open_positions) 
      : [];
    
    const portfolio = symbolsResult.portfolio 
      ? transformPortfolio(symbolsResult.portfolio) 
      : { "1M": [], "3M": [], "1Y": [], "ALL": [] };

    const homepageData: HomepageData = {
      stats,
      positions,
      topCoins,
      portfolio,
      allSymbols,
      lastUpdated: symbolsResult.updated_at || new Date().toISOString(),
    };

    return {
      homepageData,
      deals: dealsResult?.deals || {},
      candles: candlesResult?.candles || {},
    };
  } catch (error) {
    console.error("SSR: Error fetching data:", error);
    return null;
  }
}
