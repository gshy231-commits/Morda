"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_DATA_API_URL || "https://api.twinheadsnake.com";

export interface Position {
  id: string;
  symbol: string;
  coin: string;
  pair: string;
  direction: "Long" | "Short";
  entryPrice: number;
  currentPrice: number;
  entryTime: string;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
}

interface RawPosition {
  symbol: string;
  direction: "Long" | "Short";
  entry_price: number;
  current_price: number;
  entry_time: string;
  unrealized_pnl: number;
}

interface UsePositionsOptions {
  refreshInterval?: number; 
}

interface UsePositionsReturn {
  positions: Position[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function formatSymbol(symbol: string): string {
  return symbol
    .replace(/USDT$/, "")
    .replace(/^1000000/, "")
    .replace(/^10000/, "")
    .replace(/^1000/, "");
}

function transformPosition(raw: RawPosition, index: number): Position {
  const coin = formatSymbol(raw.symbol);
  const pnlPercent = raw.entry_price > 0 
    ? ((raw.current_price - raw.entry_price) / raw.entry_price) * 100 
    : 0;
  
  
  const adjustedPnlPercent = raw.direction === "Short" ? -pnlPercent : pnlPercent;
  
  return {
    id: `pos_${index}_${raw.symbol}`,
    symbol: raw.symbol,
    coin,
    pair: raw.symbol,
    direction: raw.direction,
    entryPrice: raw.entry_price,
    currentPrice: raw.current_price,
    entryTime: raw.entry_time,
    unrealizedPnl: raw.unrealized_pnl,
    unrealizedPnlPercent: adjustedPnlPercent,
  };
}

export function usePositions(options: UsePositionsOptions = {}): UsePositionsReturn {
  const { refreshInterval = 30000 } = options;

  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${API_URL}/data`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.open_positions && Array.isArray(data.open_positions)) {
        const transformed = data.open_positions.map(transformPosition);
        setPositions(transformed);
        setError(null);
      } else {
        setPositions([]);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.error("Positions fetch timeout");
        setError("Request timeout");
      } else {
        console.error("Positions fetch error:", err);
        setError("Failed to load positions");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchPositions, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPositions, refreshInterval]);

  return { positions, isLoading, error, refetch: fetchPositions };
}
