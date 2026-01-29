"use client";

import { useState, useRef, useEffect } from "react";
import { useBybitTickers, useBybitTicker } from "@/lib/useBybitTickers";

interface CoinSelectorProps {
  selectedCoin: string;
  selectedSymbol: string;
  onSelect: (coin: string, symbol: string) => void;
}

const COIN_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  BNB: "BNB",
  XRP: "Ripple",
  ADA: "Cardano",
  DOGE: "Dogecoin",
  AVAX: "Avalanche",
};

export default function CoinSelector({ selectedCoin, selectedSymbol, onSelect }: CoinSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { tickers, loading, supportedCoins } = useBybitTickers();
  const { ticker: selectedTicker, loading: selectedLoading } = useBybitTicker(selectedSymbol);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCoins = supportedCoins.filter(
    (coin) =>
      coin.toLowerCase().includes(search.toLowerCase()) ||
      COIN_NAMES[coin]?.toLowerCase().includes(search.toLowerCase())
  );

  const getCoinGradient = (symbol: string) => {
    const gradients: Record<string, string> = {
      BTC: "from-[#f7931a] to-[#ff6b00]",
      ETH: "from-[#627eea] to-[#3c3c3d]",
      SOL: "from-[#9945ff] to-[#14f195]",
      BNB: "from-[#f3ba2f] to-[#e8a500]",
      XRP: "from-[#23292f] to-[#00aae4]",
      ADA: "from-[#0033ad] to-[#00d4ff]",
      DOGE: "from-[#c2a633] to-[#ba9f33]",
      AVAX: "from-[#e84142] to-[#ff5c5c]",
    };
    return gradients[symbol] || "from-[#00ffaa] to-[#4488ff]";
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1) return `${price.toFixed(4)}`;
    return `${price.toFixed(6)}`;
  };

  
  const getDisplayName = (coin: string) => {
    return COIN_NAMES[coin] || coin;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-all duration-200 ${
          isOpen 
            ? "bg-white/10 border-[#00ffaa]/50 shadow-[0_0_20px_rgba(0,255,170,0.1)]" 
            : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
        }`}
      >
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${getCoinGradient(selectedCoin)} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
          {selectedCoin.slice(0, 2)}
        </div>
        <div className="text-left">
          <div className="font-bold text-sm sm:text-base">{selectedCoin}/USDT</div>
          <div className="text-[10px] sm:text-xs text-[#6a6a7f] hidden sm:block">{getDisplayName(selectedCoin)}</div>
        </div>
        <div className="ml-1 sm:ml-2 flex flex-col items-end">
          {(loading || selectedLoading) ? (
            <div className="w-12 sm:w-16 h-4 bg-white/10 rounded animate-pulse" />
          ) : selectedTicker ? (
            <>
              <div className="font-mono text-xs sm:text-sm">{formatPrice(selectedTicker.lastPrice)}</div>
              <div className={`text-[10px] sm:text-xs font-mono ${selectedTicker.price24hPcnt >= 0 ? "text-[#00ffaa]" : "text-[#ff4466]"}`}>
                {selectedTicker.price24hPcnt >= 0 ? "+" : ""}{selectedTicker.price24hPcnt.toFixed(2)}%
              </div>
            </>
          ) : (
            <div className="text-xs sm:text-sm text-[#6a6a7f]">—</div>
          )}
        </div>
        <svg
          className={`w-4 h-4 sm:w-5 sm:h-5 text-[#6a6a7f] transition-transform duration-200 ml-0.5 sm:ml-1 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div 
        className={`absolute top-full left-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-80 bg-[#0f0f18] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden transition-all duration-200 origin-top ${
          isOpen 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coins..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm placeholder-[#5a5a6f] focus:outline-none focus:border-[#00ffaa]/50 focus:bg-white/[0.07] transition-all"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {filteredCoins.length === 0 ? (
            <div className="p-8 text-center text-[#5a5a6f] text-sm">
              No coins found
            </div>
          ) : (
            filteredCoins.map((coin) => {
              const ticker = tickers.get(coin);
              const symbol = `${coin}USDT`;
              return (
                <button
                  key={coin}
                  onClick={() => {
                    onSelect(coin, symbol);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 ${
                    coin === selectedCoin 
                      ? "bg-[#00ffaa]/10" 
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getCoinGradient(coin)} flex items-center justify-center text-xs font-bold text-white shadow-md`}>
                    {coin.slice(0, 2)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{coin}/USDT</div>
                    <div className="text-xs text-[#6a6a7f]">{getDisplayName(coin)}</div>
                  </div>
                  <div className="text-right">
                    {ticker ? (
                      <>
                        <div className="font-mono text-sm">{formatPrice(ticker.lastPrice)}</div>
                        <div className={`text-xs font-mono ${ticker.price24hPcnt >= 0 ? "text-[#00ffaa]" : "text-[#ff4466]"}`}>
                          {ticker.price24hPcnt >= 0 ? "+" : ""}{ticker.price24hPcnt.toFixed(2)}%
                        </div>
                      </>
                    ) : (
                      <div className="w-16 h-4 bg-white/10 rounded animate-pulse" />
                    )}
                  </div>
                  {coin === selectedCoin && (
                    <svg className="w-5 h-5 text-[#00ffaa]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between text-xs text-[#5a5a6f]">
            <span>{supportedCoins.length} pairs available</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#00ffaa] rounded-full animate-pulse" />
              <span>Live from Bybit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
