"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState(0);
  const [counter, setCounter] = useState(0);
  const hasCompleted = useRef(false);

  const handleComplete = useCallback(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    
    const counterInterval = setInterval(() => {
      setCounter((prev) => {
        if (prev >= 100) {
          clearInterval(counterInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2600),
      setTimeout(() => {
        setPhase(5);
        setTimeout(handleComplete, 600);
      }, 3200),
    ];

    return () => {
      clearInterval(counterInterval);
      timers.forEach(clearTimeout);
    };
  }, [handleComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#030306] overflow-hidden transition-all duration-700 ${
        phase >= 5 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-[#00ffaa]/20 to-transparent transition-all duration-1000"
            style={{
              top: `${20 + i * 15}%`,
              left: phase >= 1 ? "0%" : "-100%",
              right: phase >= 1 ? "0%" : "100%",
              transitionDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>

      {}
      <div className="relative h-full flex flex-col items-center justify-center px-8">
        
        {}
        <div className="relative overflow-hidden mb-8">
          <div
            className={`text-[12vw] md:text-[10vw] font-bold leading-none tracking-tighter transition-all duration-700 ${
              phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            <span className="text-white">STOP</span>
          </div>
        </div>

        <div className="relative overflow-hidden mb-8">
          <div
            className={`text-[12vw] md:text-[10vw] font-bold leading-none tracking-tighter transition-all duration-700 ${
              phase >= 2 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            <span className="text-[#6a6a7f]">GUESSING</span>
          </div>
        </div>

        <div className="relative overflow-hidden mb-8">
          <div
            className={`text-[12vw] md:text-[10vw] font-bold leading-none tracking-tighter transition-all duration-700 ${
              phase >= 3 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            <span className="text-white">START</span>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div
            className={`text-[12vw] md:text-[10vw] font-bold leading-none tracking-tighter transition-all duration-700 ${
              phase >= 4 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            <span className="text-[#00ffaa]">PROFITING</span>
            <span className="text-[#00ffaa]">.</span>
          </div>
        </div>

        {}
        <div
          className={`absolute bottom-12 right-12 transition-all duration-500 ${
            phase >= 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="text-8xl md:text-9xl font-bold font-mono text-[#00ffaa]/10">
            {counter.toString().padStart(3, "0")}
          </div>
        </div>

        {}
        <div className="absolute bottom-12 left-12 flex items-center gap-4">
          <div
            className={`h-px bg-[#00ffaa] transition-all duration-1000 ${
              phase >= 1 ? "w-24" : "w-0"
            }`}
          />
          <span
            className={`text-sm text-[#6a6a7f] uppercase tracking-widest transition-all duration-500 ${
              phase >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            TwinHeadSnake
          </span>
        </div>

        {}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {phase >= 2 && (
            <>
              <div
                className="absolute text-[#00ffaa]/5 text-6xl font-mono font-bold animate-float-slow"
                style={{ top: "15%", left: "10%" }}
              >
                +$47,832
              </div>
              <div
                className="absolute text-[#ffaa00]/5 text-5xl font-mono font-bold animate-float-slow"
                style={{ top: "25%", right: "15%", animationDelay: "0.5s" }}
              >
                +87%
              </div>
              <div
                className="absolute text-[#4488ff]/5 text-4xl font-mono font-bold animate-float-slow"
                style={{ bottom: "30%", left: "20%", animationDelay: "1s" }}
              >
                +$12.4M
              </div>
              <div
                className="absolute text-[#00ffaa]/5 text-5xl font-mono font-bold animate-float-slow"
                style={{ bottom: "20%", right: "25%", animationDelay: "1.5s" }}
              >
                24/7
              </div>
            </>
          )}
        </div>
      </div>

      {}
      <div
        className={`absolute inset-0 bg-[#00ffaa] transition-transform duration-700 ease-in-out origin-bottom ${
          phase >= 5 ? "scale-y-100" : "scale-y-0"
        }`}
      />

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.05; }
          50% { transform: translateY(-30px) rotate(3deg); opacity: 0.1; }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
