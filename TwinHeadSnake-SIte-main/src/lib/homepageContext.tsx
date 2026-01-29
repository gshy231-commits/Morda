"use client";

import { createContext, useContext, ReactNode } from "react";
import type { 
  DashboardStats, 
  Position, 
  TopCoin, 
  PortfolioDataPoint, 
  ChartTimeframe, 
  SymbolInfo,
  RawDeal,
  RawCandle,
} from "./api";
import { useDataContext } from "./dataContext";


export type { DashboardStats, Position, TopCoin, PortfolioDataPoint, ChartTimeframe, SymbolInfo };





export function useStats(): DashboardStats {
  const { homepageData } = useDataContext();
  return homepageData.stats;
}

export function usePositions(): Position[] {
  const { homepageData } = useDataContext();
  return homepageData.positions;
}

export function useTopCoins(): TopCoin[] {
  const { homepageData } = useDataContext();
  return homepageData.topCoins;
}

export function usePortfolioData(timeframe: ChartTimeframe = "1Y"): PortfolioDataPoint[] {
  const { homepageData } = useDataContext();
  return homepageData.portfolio[timeframe];
}

export function useAllSymbols(): SymbolInfo[] {
  const { homepageData } = useDataContext();
  return homepageData.allSymbols;
}

export function useHomepageData() {
  const { homepageData, deals, candles, isLoading, error, refetch } = useDataContext();
  return { 
    data: homepageData, 
    deals, 
    candles, 
    isLoading, 
    error, 
    refetch 
  };
}


export function useCoinDetails(symbol: string | null) {
  const { deals, candles, isLoading } = useDataContext();
  
  if (!symbol) {
    return { deals: [], candles: [], loading: false };
  }

  const coinDeals = deals[symbol] || [];
  const coinCandles = candles[symbol] || [];
  
  
  const loading = isLoading && coinDeals.length === 0 && coinCandles.length === 0;

  return { deals: coinDeals, candles: coinCandles, loading };
}






interface HomepageProviderProps {
  children: ReactNode;
  initialData?: unknown; 
}

export function HomepageProvider({ children }: HomepageProviderProps) {
  
  return <>{children}</>;
}
