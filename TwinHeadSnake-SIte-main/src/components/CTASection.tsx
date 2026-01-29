"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ShaderBackground } from "./ui/ShaderBackground";

export default function CTASection() {
  
  const isMounted = useRef(typeof window !== "undefined");

  return (
    <section className="py-32 relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-[#050508]" />
      {isMounted.current && <ShaderBackground className="opacity-40" />}
      
      {}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/50 via-transparent to-[#050508]/50" />

      <div className="max-w-[900px] mx-auto px-6 relative z-10 text-center">
        {}
        <div className="inline-flex items-center gap-2 text-[#00ffaa] text-sm font-medium mb-8 px-4 py-2 rounded-full bg-[#00ffaa]/10 border border-[#00ffaa]/20">
          <span className="w-2 h-2 bg-[#00ffaa] rounded-full animate-pulse" />
          Now Available
        </div>

        {}
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Ready to stop{" "}
          <span className="text-[#6a6a7f]">losing</span>
          <br />
          and start{" "}
          <span className="text-[#00ffaa]">winning</span>?
        </h2>

        <p className="text-[#7a7a8f] text-xl mb-12 max-w-xl mx-auto">
          Join traders making consistent profits with algorithmic signals
        </p>

        {}
        <Link 
          href="/register"
          className="btn-primary inline-flex items-center justify-center gap-3 px-12 py-5 font-bold text-lg rounded-2xl mb-8"
        >
          <span className="text-xl">Start Trading Now</span>
          <ArrowRight size={22} />
        </Link>

        {}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
          <div className="flex -space-x-3">
            {["from-blue-500 to-purple-500", "from-green-500 to-teal-500", "from-orange-500 to-red-500", "from-pink-500 to-rose-500"].map((gradient, i) => (
              <div key={i} className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} border-2 border-[#050508] flex items-center justify-center text-xs font-bold`}>
                {["JD", "MK", "AS", "LR"][i]}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full bg-[#1a1a25] border-2 border-[#050508] flex items-center justify-center text-xs text-[#6a6a7f]">
              +247
            </div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-white font-medium">247+ active traders</div>
            <div className="text-[#5a5a6f] text-sm">Join our growing community</div>
          </div>
        </div>

        {}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#5a5a6f]">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#00ffaa]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Algorithmic signals
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#00ffaa]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Verified track record
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#00ffaa]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            24/7 automated trading
          </span>
        </div>
      </div>
    </section>
  );
}
