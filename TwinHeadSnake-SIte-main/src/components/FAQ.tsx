"use client";

import { useState } from "react";
import { useStats } from "@/lib/homepageContext";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const stats = useStats();

  const faqs = [
    {
      q: "Is this a scam? How do I know the results are real?",
      a: "We understand the skepticism - the crypto space is full of fake promises. That's why we show live positions in real-time on our homepage. Every trade is verifiable. We also offer a 7-day free trial so you can test it risk-free.",
    },
    {
      q: "Do I need trading experience?",
      a: "Not at all. Our signals tell you exactly what to buy, when to buy, and when to sell. You can follow manually or connect your exchange for automated execution. Many of our most successful members started with zero trading knowledge.",
    },
    {
      q: "How much money do I need to start?",
      a: "You can start with as little as $500, though we recommend $2,000+ to see meaningful returns. Our signals work regardless of portfolio size - the percentage gains are the same whether you're trading $1K or $100K.",
    },
    {
      q: "What's the win rate really?",
      a: `Our verified 12-month track record shows a ${stats.lastYearAvgWinRate.toFixed(1)}% average win rate. This doesn't mean every trade wins - we have losing trades too. But our risk management ensures winners significantly outweigh losers over time.`,
    },
    {
      q: "How fast will I see results?",
      a: "Most traders see their first profitable signal within 24 hours of subscribing. Our bot monitors markets 24/7 and sends signals as soon as opportunities arise.",
    },
  ];

  return (
    <section className="py-20 bg-[#030306]">
      <div className="max-w-[800px] mx-auto px-4">
        {}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-[#aa66ff]/10 border border-[#aa66ff]/20 text-[#aa66ff] text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Got Questions?
          </h2>
          <p className="text-[#7a7a8f]">
            We&apos;ve got answers. If you don&apos;t see your question, hit us up at twinheadsnake@proton.me
          </p>
        </div>

        {}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`card overflow-hidden transition-all ${openIndex === i ? "border-[#00ffaa]/30" : ""}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 text-left flex items-center justify-between gap-4"
              >
                <span className="font-semibold">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-[#00ffaa] flex-shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={`overflow-hidden transition-all ${openIndex === i ? "max-h-96" : "max-h-0"}`}>
                <div className="px-6 pb-6 text-[#9a9aaf] text-sm leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
