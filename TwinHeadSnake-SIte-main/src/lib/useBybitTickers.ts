"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface TickerData {
  symbol: string;
  lastPrice: number;
  price24hPcnt: number;
  highPrice24h: number;
  lowPrice24h: number;
  volume24h: number;
  turnover24h: number;
}

const SUPPORTED_COINS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX"];
const WS_RECONNECT_DELAY = 5000;
const FALLBACK_FETCH_INTERVAL = 30000; 

export function useBybitTickers() {
  const [tickers, setTickers] = useState<Map<string, TickerData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsConnected = useRef(false);

  
  const fetchTickers = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(
        "https://api.bybit.com/v5/market/tickers?category=linear",
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.retCode === 0 && Array.isArray(data.result?.list)) {
        const tickerMap = new Map<string, TickerData>();
        
        for (const t of data.result.list) {
          const coinSymbol = t.symbol?.replace("USDT", "");
          if (coinSymbol && SUPPORTED_COINS.includes(coinSymbol)) {
            tickerMap.set(coinSymbol, {
              symbol: coinSymbol,
              lastPrice: parseFloat(t.lastPrice) || 0,
              price24hPcnt: (parseFloat(t.price24hPcnt) || 0) * 100,
              highPrice24h: parseFloat(t.highPrice24h) || 0,
              lowPrice24h: parseFloat(t.lowPrice24h) || 0,
              volume24h: parseFloat(t.volume24h) || 0,
              turnover24h: parseFloat(t.turnover24h) || 0,
            });
          }
        }

        setTickers(tickerMap);
        setError(null);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError("Failed to fetch tickers");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  
  useEffect(() => {
    let fallbackInterval: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;
      
      try {
        const ws = new WebSocket("wss://stream.bybit.com/v5/public/linear");
        wsRef.current = ws;

        ws.onopen = () => {
          wsConnected.current = true;
          const args = SUPPORTED_COINS.map((coin) => `tickers.${coin}USDT`);
          ws.send(JSON.stringify({ op: "subscribe", args }));
          setLoading(false);
          
          
          if (fallbackInterval) {
            clearInterval(fallbackInterval);
            fallbackInterval = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.topic && data.data) {
              const t = data.data;
              const coinSymbol = t.symbol?.replace("USDT", "");
              
              if (coinSymbol && SUPPORTED_COINS.includes(coinSymbol)) {
                setTickers((prev) => {
                  const newMap = new Map(prev);
                  const existing = newMap.get(coinSymbol);
                  
                  newMap.set(coinSymbol, {
                    symbol: coinSymbol,
                    lastPrice: parseFloat(t.lastPrice) || existing?.lastPrice || 0,
                    price24hPcnt: (parseFloat(t.price24hPcnt) * 100) || existing?.price24hPcnt || 0,
                    highPrice24h: parseFloat(t.highPrice24h) || existing?.highPrice24h || 0,
                    lowPrice24h: parseFloat(t.lowPrice24h) || existing?.lowPrice24h || 0,
                    volume24h: parseFloat(t.volume24h) || existing?.volume24h || 0,
                    turnover24h: parseFloat(t.turnover24h) || existing?.turnover24h || 0,
                  });
                  
                  return newMap;
                });
              }
            }
          } catch {
            
          }
        };

        ws.onerror = () => {
          wsConnected.current = false;
        };

        ws.onclose = () => {
          wsConnected.current = false;
          
          if (!fallbackInterval) {
            fetchTickers(); 
            fallbackInterval = setInterval(fetchTickers, FALLBACK_FETCH_INTERVAL);
          }
          
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, WS_RECONNECT_DELAY);
        };
      } catch {
        wsConnected.current = false;
        
        if (!fallbackInterval) {
          fetchTickers();
          fallbackInterval = setInterval(fetchTickers, FALLBACK_FETCH_INTERVAL);
        }
      }
    };

    
    fetchTickers();
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchTickers]);

  return { tickers, loading, error, supportedCoins: SUPPORTED_COINS };
}

export function useBybitTicker(symbol: string) {
  const [ticker, setTicker] = useState<TickerData | null>(null);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  
  const fullSymbol = symbol.endsWith("USDT") ? symbol : `${symbol}USDT`;

  useEffect(() => {
    let fallbackInterval: NodeJS.Timeout | null = null;

    const fetchTicker = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(
          `https:
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        const data = await response.json();

        if (data.retCode === 0 && data.result?.list?.[0]) {
          const t = data.result.list[0];
          setTicker({
            symbol: fullSymbol,
            lastPrice: parseFloat(t.lastPrice) || 0,
            price24hPcnt: (parseFloat(t.price24hPcnt) || 0) * 100,
            highPrice24h: parseFloat(t.highPrice24h) || 0,
            lowPrice24h: parseFloat(t.lowPrice24h) || 0,
            volume24h: parseFloat(t.volume24h) || 0,
            turnover24h: parseFloat(t.turnover24h) || 0,
          });
        }
      } catch {
        
      } finally {
        setLoading(false);
      }
    };

    
    const connectWS = () => {
      try {
        const ws = new WebSocket("wss://stream.bybit.com/v5/public/linear");
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify({
            op: "subscribe",
            args: [`tickers.${fullSymbol}`],
          }));
          if (fallbackInterval) {
            clearInterval(fallbackInterval);
            fallbackInterval = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.topic && data.data) {
              const t = data.data;
              setTicker((prev) => ({
                symbol: fullSymbol,
                lastPrice: parseFloat(t.lastPrice) || prev?.lastPrice || 0,
                price24hPcnt: (parseFloat(t.price24hPcnt) * 100) || prev?.price24hPcnt || 0,
                highPrice24h: parseFloat(t.highPrice24h) || prev?.highPrice24h || 0,
                lowPrice24h: parseFloat(t.lowPrice24h) || prev?.lowPrice24h || 0,
                volume24h: parseFloat(t.volume24h) || prev?.volume24h || 0,
                turnover24h: parseFloat(t.turnover24h) || prev?.turnover24h || 0,
              }));
            }
          } catch {
            
          }
        };

        ws.onclose = () => {
          if (!fallbackInterval) {
            fallbackInterval = setInterval(fetchTicker, FALLBACK_FETCH_INTERVAL);
          }
        };
      } catch {
        if (!fallbackInterval) {
          fallbackInterval = setInterval(fetchTicker, FALLBACK_FETCH_INTERVAL);
        }
      }
    };

    fetchTicker();
    connectWS();

    return () => {
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fullSymbol]);

  return { ticker, loading };
}
