"use client";

import { useState } from "react";
import Logo from "./Logo";
import Link from "next/link";
import { SocialIcons } from "./ui/social-icons";
import { Copy, Check, Heart } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Pricing", href: "/#pricing" },
    { name: "API Docs", href: "/api-docs" },
    { name: "Positions", href: "/#positions" },
  ],
  company: [
    { name: "About", href: "/#about" },
    { name: "Contact", href: "mailto:twinheadsnake@proton.me" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ],
};

const SOL_WALLET = "8GtgLcg2vT29Peoa5E2hsrb7h6uR6DS7fW6rpS5UdyrK";

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const copyWallet = async () => {
    await navigator.clipboard.writeText(SOL_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="bg-[#030306] border-t border-white/5 relative overflow-hidden">
      {}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ffaa]/20 to-transparent" />
      
      <div className="max-w-[1400px] mx-auto px-4">
        {}
        <div className="py-16 grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ffaa] to-[#00cc88] flex items-center justify-center shadow-lg shadow-[#00ffaa]/20 p-2">
                <Logo className="w-full h-full text-black" />
              </div>
              <span className="font-bold text-white text-xl">TwinHeadSnake</span>
            </Link>
            <p className="text-[#6a6a7f] text-sm leading-relaxed mb-6 max-w-sm">
              Algorithmic crypto trading signals with an 87% win rate. Join thousands of traders making consistent profits.
            </p>
            
            {}
            <SocialIcons />
          </div>

          {}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[#6a6a7f] hover:text-[#00ffaa] text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[#6a6a7f] hover:text-[#00ffaa] text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-[#6a6a7f] hover:text-[#00ffaa] text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {}
        <div className="py-8 border-t border-white/5">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a12] to-[#050508] border border-white/5 p-6">
            {}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#9945FF]/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-[#14F195]/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Support the Project</h4>
                  <p className="text-[#6a6a7f] text-sm">Help us keep building amazing tools for traders</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 w-full sm:w-auto">
                  {}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 128 128" fill="none">
                    <defs>
                      <linearGradient id="solGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9945FF" />
                        <stop offset="100%" stopColor="#14F195" />
                      </linearGradient>
                    </defs>
                    <path d="M25.4 99.5c.8-.8 1.8-1.2 3-1.2h91.2c1.9 0 2.8 2.3 1.5 3.6l-17.6 17.6c-.8.8-1.8 1.2-3 1.2H9.3c-1.9 0-2.8-2.3-1.5-3.6l17.6-17.6z" fill="url(#solGradient)"/>
                    <path d="M25.4 8.5c.8-.8 1.9-1.2 3-1.2h91.2c1.9 0 2.8 2.3 1.5 3.6l-17.6 17.6c-.8.8-1.8 1.2-3 1.2H9.3c-1.9 0-2.8-2.3-1.5-3.6L25.4 8.5z" fill="url(#solGradient)"/>
                    <path d="M102.6 53.7c-.8-.8-1.8-1.2-3-1.2H8.4c-1.9 0-2.8 2.3-1.5 3.6l17.6 17.6c.8.8 1.8 1.2 3 1.2h91.2c1.9 0 2.8-2.3 1.5-3.6L102.6 53.7z" fill="url(#solGradient)"/>
                  </svg>
                  <span className="text-[#6a6a7f] text-xs font-mono truncate max-w-[180px] sm:max-w-[280px]">
                    {SOL_WALLET}
                  </span>
                </div>
                
                <button
                  onClick={copyWallet}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black font-semibold text-sm hover:opacity-90 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Address
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="py-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[#6a6a7f] text-xs">
            © 2025 TwinHeadSnake. All rights reserved.
          </div>
          
          {}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-[#6a6a7f]">
              <svg className="w-4 h-4 text-[#00ffaa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              SSL Secured
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6a6a7f]">
              <svg className="w-4 h-4 text-[#00ffaa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verified Results
            </div>
          </div>
          
          <div className="text-[#5a5a6f] text-[10px] text-center md:text-right max-w-md">
            Trading involves risk. Past performance doesn&apos;t guarantee future results.
          </div>
        </div>
      </div>
    </footer>
  );
}
