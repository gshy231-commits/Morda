"use client";

import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Alex K.",
    role: "Day Trader",
    profit: "+$34,200",
    period: "3 months",
    text: "I was skeptical at first, but the results speak for themselves. Made more in 3 months than I did all last year trading manually.",
    gradient: "from-blue-500 to-purple-500",
    bgGradient: "from-blue-500/10 via-purple-500/5 to-transparent",
  },
  {
    name: "Sarah M.",
    role: "Software Engineer", 
    profit: "+$18,750",
    period: "6 weeks",
    text: "Finally, a trading bot that actually works. I just check my portfolio once a day and watch it grow. No stress, no FOMO.",
    gradient: "from-green-500 to-teal-500",
    bgGradient: "from-green-500/10 via-teal-500/5 to-transparent",
  },
  {
    name: "Michael R.",
    role: "Business Owner",
    profit: "+$52,400",
    period: "5 months",
    text: "The 87% win rate is real. I've tracked every trade. This is the best investment I've made for passive income.",
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-500/10 via-amber-500/5 to-transparent",
  },
  {
    name: "David L.",
    role: "Crypto Investor",
    profit: "+$28,900",
    period: "2 months",
    text: "Switched from another signal service. Night and day difference. TwinHeadSnake actually delivers on their promises.",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-500/10 via-rose-500/5 to-transparent",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section 
      className="py-32 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {}
      <div className="absolute inset-0 bg-[#050508]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ffaa00]/5 rounded-full blur-[150px]" />

      <div className="max-w-[1100px] mx-auto px-6 relative z-10">
        {}
        <div className="mb-20">
          <p className="text-[#ffaa00] text-sm font-medium tracking-widest uppercase mb-4">
            Real Results
          </p>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold">
            Traders are
            <br />
            <span className="text-[#00ffaa]">making bank</span>
          </h2>
        </div>

        {}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {}
          <div className="relative">
            {}
            <div className={`absolute -inset-8 bg-gradient-to-br ${testimonials[active].bgGradient} rounded-3xl opacity-50 blur-xl transition-all duration-500`} />
            
            <div className="relative">
              <div className="text-6xl text-[#00ffaa]/20 font-serif leading-none mb-4">&ldquo;</div>
              <p className="text-2xl md:text-3xl text-[#e0e0e5] leading-relaxed mb-8 -mt-8">
                {testimonials[active].text}
              </p>
              
              {}
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonials[active].gradient} flex items-center justify-center text-lg font-bold shadow-lg`}>
                  {testimonials[active].name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-semibold text-lg">{testimonials[active].name}</div>
                  <div className="text-[#6a6a7f] text-sm">{testimonials[active].role}</div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="text-right">
            <div className="text-[#5a5a6f] text-sm uppercase tracking-widest mb-2">Profit made</div>
            <div className="text-6xl md:text-8xl font-bold font-mono text-[#00ffaa] mb-2">
              {testimonials[active].profit}
            </div>
            <div className="text-[#6a6a7f]">in {testimonials[active].period}</div>
            
            {}
            <div className="inline-flex items-center gap-2 mt-6 text-[#00ffaa]/60 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified result
            </div>
          </div>
        </div>

        {}
        <div className="flex items-center gap-3 mb-20">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === active ? "w-12 bg-[#00ffaa]" : "w-6 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/5">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">4.9<span className="text-[#ffaa00]">/5</span></div>
            <div className="text-[#5a5a6f] text-sm">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#00ffaa]">247</div>
            <div className="text-[#5a5a6f] text-sm">Happy Traders</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white">$12.4M<span className="text-[#4488ff]">+</span></div>
            <div className="text-[#5a5a6f] text-sm">Total Profits</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white">12<span className="text-[#5a5a6f] text-lg ml-1">mo</span></div>
            <div className="text-[#5a5a6f] text-sm">Track Record</div>
          </div>
        </div>
      </div>
    </section>
  );
}
