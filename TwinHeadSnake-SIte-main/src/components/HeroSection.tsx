"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import PortfolioChart from "./PortfolioChart";
import { BackgroundGradientAnimation } from "./ui/background-gradient-animation";
import { useStats } from "@/lib/homepageContext";
import { formatNumber } from "@/lib/api";
import { useI18n } from "@/lib/i18n";


function useCountUp(end: number, duration: number = 1500, delay: number = 300) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const animationFrame = useRef<number | undefined>(undefined);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTime.current) startTime.current = timestamp;
        const progress = Math.min((timestamp - startTime.current) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * end));

        if (progress < 1) {
          animationFrame.current = requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };
      animationFrame.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [end, duration, delay]);

  return count;
}

export default function HeroSection() {
  const stats = useStats();
  
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const isMounted = useRef(false);

  
  const animatedPortfolioGrowth = useCountUp(Math.round(stats.lastYearAvgPnl), 1500, 200);
  const animatedWinRate = useCountUp(Math.round(stats.lastYearAvgWinRate), 1200, 300);
  const animatedProfitFactor = useCountUp(Math.round(stats.lastYearAvgProfitFactor * 10), 1400, 400);
  const animatedTrades = useCountUp(stats.lastYearTrades, 1200, 500);

  
  const timeDisplay = useMemo(() => lastUpdate || "--:--:--", [lastUpdate]);

  useEffect(() => {
    isMounted.current = true;
    const updateTime = () => {
      const now = new Date();
      const hours = now.getUTCHours().toString().padStart(2, '0');
      const minutes = now.getUTCMinutes().toString().padStart(2, '0');
      const seconds = now.getUTCSeconds().toString().padStart(2, '0');
      setLastUpdate(`${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    return () => {
      isMounted.current = false;
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <section id="home" className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {}
      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(3, 3, 6)"
        gradientBackgroundEnd="rgb(5, 5, 8)"
        firstColor="255, 100, 0"
        secondColor="68, 100, 255"
        thirdColor="140, 80, 255"
        fourthColor="255, 140, 50"
        fifthColor="100, 60, 200"
        pointerColor="255, 120, 0"
        size="70%"
        blendingValue="hard-light"
        interactive={true}
        containerClassName="opacity-30"
      />
      
      {}
      <div 
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 20%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      
      {}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050508] to-transparent z-[1]" />
      
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="w-2 h-2 bg-[#00ffaa] rounded-full animate-pulse" />
          <span className="text-[#00ffaa]/80 text-sm tracking-widest uppercase">Live Trading</span>
          <span className="text-[#3a3a4f] text-sm font-mono">{timeDisplay} GMT</span>
        </div>

        {}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="text-[#6a6a7f]">Stop Guessing</span>
            <br />
            <span className="bg-gradient-to-r from-[#00ffaa] via-[#00ddaa] to-[#4488ff] bg-clip-text text-transparent">
              Start Profiting
            </span>
          </h1>
          <p className="text-[#6a6a7f] text-xl md:text-2xl max-w-2xl mx-auto font-light">
            Algorithmic signals with 12 months verified track record
          </p>
        </div>

        {}
        <div className="text-center mb-20">
          <div className="text-[#5a5a6f] text-sm uppercase tracking-widest mb-3">Average Coin Growth (1 Year)</div>
          <div className="text-6xl md:text-8xl lg:text-9xl font-bold font-mono tabular-nums bg-gradient-to-r from-[#00ffaa] to-[#00dd99] bg-clip-text text-transparent">
            +{formatNumber(animatedPortfolioGrowth)}%
          </div>
          <div className="flex items-center justify-center gap-8 mt-6 text-sm">
            <span className="text-[#00ffaa] tabular-nums">{stats.lastYearAvgWinRate.toFixed(1)}% win rate</span>
            <span className="text-[#3a3a4f]">•</span>
            <span className="text-[#8a8a9f]">{formatNumber(stats.lastYearTrades)} trades</span>
            <span className="text-[#3a3a4f]">•</span>
            <span className="text-[#8a8a9f]">{stats.openPositions} open positions</span>
          </div>
          <p className="text-[#4a4a5f] text-xs mt-4 max-w-md mx-auto">
            Average performance across {stats.symbolsCount} tracked coins over 12 months
          </p>
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mb-20 max-w-4xl mx-auto">
          {}
          <div className="text-center group cursor-default transition-transform duration-300 hover:scale-110">
            <div className="text-4xl md:text-5xl font-bold font-mono tabular-nums bg-gradient-to-r from-[#00ffaa] via-[#00ff88] to-[#00ffaa] bg-clip-text text-transparent mb-1">
              {animatedWinRate}%
            </div>
            <div className="text-[#00ffaa]/60 text-sm uppercase tracking-wider">Win Rate</div>
          </div>
          
          {}
          <div className="text-center group cursor-default transition-transform duration-300 hover:scale-110">
            <div className="text-4xl md:text-5xl font-bold font-mono tabular-nums text-[#4488ff] mb-1">
              {(animatedProfitFactor / 10).toFixed(1)}x
            </div>
            <div className="text-[#4488ff]/60 text-sm uppercase tracking-wider">Profit Factor</div>
          </div>
          
          {}
          <div className="text-center group cursor-default transition-transform duration-300 hover:scale-110">
            <div className="text-4xl md:text-5xl font-bold font-mono tabular-nums text-white mb-1">
              {formatNumber(animatedTrades)}
            </div>
            <div className="text-white/60 text-sm uppercase tracking-wider">Total Trades</div>
          </div>
          
          {}
          <div className="text-center group cursor-default transition-transform duration-300 hover:scale-110">
            <div className="text-4xl md:text-5xl font-bold font-mono tabular-nums text-[#aa66ff] mb-1">
              {stats.availablePairs}
            </div>
            <div className="text-[#aa66ff]/60 text-sm uppercase tracking-wider">Pairs Analyzed</div>
          </div>
        </div>

        {}
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          
          {}
          <div className="lg:col-span-3">
            <PortfolioChart />
          </div>

          {}
          <div className="lg:col-span-2 space-y-10">
            
            {}
            <div>
              <div className="text-[#5a5a6f] text-xs uppercase tracking-widest mb-4">This Month</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-[#00ffaa] font-mono font-bold text-2xl">+{stats.lastMonthPnl.toFixed(1)}%</div>
                  <div className="text-[#5a5a6f] text-xs">Monthly PnL</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-white font-mono font-bold text-2xl">{stats.lastMonthTrades}</div>
                  <div className="text-[#5a5a6f] text-xs">Trades</div>
                </div>
              </div>
            </div>

            {}
            <div>
              <div className="text-[#5a5a6f] text-xs uppercase tracking-widest mb-4">Why Traders Choose Us</div>
              <div className="space-y-3">
                {[
                  "No emotions, pure algorithmic precision",
                  "24/7 automated trading",
                  "Verified track record",
                  "Built-in risk management",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[#9a9aaf]">
                    <svg className="w-4 h-4 text-[#00ffaa]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {}
            <div className="pt-4">
              <Link 
                href="/register"
                className="btn-primary flex items-center justify-center gap-2 w-full py-4 px-8 font-bold rounded-2xl text-lg"
              >
                <span>Get Started</span>
                <ArrowRight size={20} />
              </Link>
              <p className="text-center text-[#5a5a6f] text-sm mt-3">
                Free to start • No credit card required
              </p>
              
              {}
              <div className="flex items-center justify-center gap-3 mt-6">
                <span className="text-white text-xs font-medium">Join our community:</span>
                <a
                  href="https://t.me/twinheadsnake"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-pulse flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-[#00ffaa]/40 text-[#00ffaa] hover:text-[#00ffaa] hover:border-[#00ffaa]/60 hover:bg-[#00ffaa]/10 transition-all"
                  aria-label="Telegram"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                <a
                  href="https://discord.gg/Wuuy6j7nYZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-pulse flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-[#00ffaa]/40 text-[#00ffaa] hover:text-[#00ffaa] hover:border-[#00ffaa]/60 hover:bg-[#00ffaa]/10 transition-all"
                  aria-label="Discord"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
