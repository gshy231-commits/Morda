"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import type { 
  HomepageData, 
  RawDeal,
  RawCandle,
} from "./api";
import { 
  fetchSymbolsData, 
  fetchDealsData, 
  fetchCandlesData,
  transformSymbolToTopCoin,
  transformSymbolToSymbolInfo,
  transformOpenPositions,
  transformStats,
  transformPortfolio,
} from "./api";


const CACHE_KEYS = {
  HOMEPAGE: "tws_homepage_data",
  DEALS: "tws_deals_data",
  CANDLES: "tws_candles_data",
  TIMESTAMP: "tws_cache_timestamp",
};


const CACHE_DURATION = 5 * 60 * 1000;


const emptyHomepageData: HomepageData = {
  stats: {
    lastMonthPnl: 0, lastMonthAvgPnl: 0, lastMonthTrades: 0,
    lastMonthWins: 0, lastMonthLosses: 0, lastMonthWinRate: 0,
    lastYearPnl: 0, lastYearAvgPnl: 0, lastYearTrades: 0,
    lastYearWins: 0, lastYearLosses: 0, lastYearWinRate: 0,
    lastYearAvgWinRate: 0, lastYearAvgProfitFactor: 0,
    symbolsCount: 0, availablePairs: 0, openPositions: 0, unrealizedPnl: 0,
  },
  positions: [],
  topCoins: [],
  portfolio: { "1M": [], "3M": [], "1Y": [], "ALL": [] },
  allSymbols: [],
  lastUpdated: "",
};

interface DataContextType {
  homepageData: HomepageData;
  deals: Record<string, RawDeal[]>;
  candles: Record<string, RawCandle[]>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isDataCached: boolean;
}

const DataContext = createContext<DataContextType | null>(null);


function getFromCache<T>(key: string): T | null {
  try {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setToCache(key: string, data: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    
  }
}

function isCacheValid(): boolean {
  try {
    const timestamp = sessionStorage.getItem(CACHE_KEYS.TIMESTAMP);
    if (!timestamp) return false;
    return Date.now() - parseInt(timestamp) < CACHE_DURATION;
  } catch {
    return false;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [homepageData, setHomepageData] = useState<HomepageData>(emptyHomepageData);
  const [deals, setDeals] = useState<Record<string, RawDeal[]>>({});
  const [candles, setCandles] = useState<Record<string, RawCandle[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataCached, setIsDataCached] = useState(false);
  const hasInitialized = useRef(false);

  const fetchData = useCallback(async (forceRefresh = false) => {
    
    if (!forceRefresh && isCacheValid()) {
      const cachedHomepage = getFromCache<HomepageData>(CACHE_KEYS.HOMEPAGE);
      const cachedDeals = getFromCache<Record<string, RawDeal[]>>(CACHE_KEYS.DEALS);
      const cachedCandles = getFromCache<Record<string, RawCandle[]>>(CACHE_KEYS.CANDLES);
      
      if (cachedHomepage && cachedDeals && cachedCandles) {
        setHomepageData(cachedHomepage);
        setDeals(cachedDeals);
        setCandles(cachedCandles);
        setIsLoading(false);
        setIsDataCached(true);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setIsDataCached(false);

    try {
      
      const [symbolsResult, dealsResult, candlesResult] = await Promise.all([
        fetchSymbolsData(),
        fetchDealsData(),
        fetchCandlesData(),
      ]);

      const dealsData = dealsResult?.deals || {};
      const candlesData = candlesResult?.candles || {};

      if (symbolsResult && symbolsResult.symbols) {
        const symbols = symbolsResult.symbols;
        const dealsSymbols = Object.keys(dealsData);
        
        const top7 = symbols
          .filter(s => dealsSymbols.includes(s.symbol))
          .sort((a, b) => b.best_pnl - a.best_pnl)
          .slice(0, 7);
        
        const topCoins = top7.map(transformSymbolToTopCoin);
        const allSymbols = symbols.map(transformSymbolToSymbolInfo);
        
        const stats = symbolsResult.stats 
          ? transformStats(symbolsResult.stats) 
          : emptyHomepageData.stats;
        
        const positions = symbolsResult.open_positions 
          ? transformOpenPositions(symbolsResult.open_positions) 
          : [];
        
        const portfolio = symbolsResult.portfolio 
          ? transformPortfolio(symbolsResult.portfolio) 
          : emptyHomepageData.portfolio;

        const newHomepageData: HomepageData = {
          stats,
          positions,
          topCoins,
          portfolio,
          allSymbols,
          lastUpdated: symbolsResult.updated_at || new Date().toISOString(),
        };

        
        setHomepageData(newHomepageData);
        setDeals(dealsData);
        setCandles(candlesData);

        
        setToCache(CACHE_KEYS.HOMEPAGE, newHomepageData);
        setToCache(CACHE_KEYS.DEALS, dealsData);
        setToCache(CACHE_KEYS.CANDLES, candlesData);
        setToCache(CACHE_KEYS.TIMESTAMP, Date.now().toString());
      } else {
        setError("Failed to fetch data from API");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    fetchData();
  }, [fetchData]);

  
  useEffect(() => {
    const interval = setInterval(() => fetchData(true), CACHE_DURATION);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <DataContext.Provider value={{ 
      homepageData, 
      deals, 
      candles, 
      isLoading, 
      error, 
      refetch: () => fetchData(true),
      isDataCached,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within DataProvider");
  }
  return context;
}


export function useGlobalStats() {
  const { homepageData } = useDataContext();
  return homepageData.stats;
}

export function useGlobalPositions() {
  const { homepageData } = useDataContext();
  return homepageData.positions;
}

export function useGlobalTopCoins() {
  const { homepageData } = useDataContext();
  return homepageData.topCoins;
}

export function useGlobalPortfolio(timeframe: "1M" | "3M" | "1Y" | "ALL" = "1Y") {
  const { homepageData } = useDataContext();
  return homepageData.portfolio[timeframe];
}

export function useGlobalSymbols() {
  const { homepageData } = useDataContext();
  return homepageData.allSymbols;
}
