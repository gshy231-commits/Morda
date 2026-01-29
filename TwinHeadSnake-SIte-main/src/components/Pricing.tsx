"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Check, Star, Zap, Crown, ArrowRight, Gift } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

const plans = [
  {
    name: "Starter",
    price: 599,
    yearlyPrice: 479,
    desc: "Perfect for beginners",
    icon: <Zap className="w-8 h-8" />,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    features: [
      "10 trading pairs",
      "Telegram signals",
      "Basic analytics",
      "Email support",
      "Daily reports",
    ],
    popular: false,
    trial: 7,
  },
  {
    name: "Pro",
    price: 999,
    yearlyPrice: 799,
    desc: "Most popular choice",
    icon: <Star className="w-8 h-8" />,
    iconBg: "bg-[#00ffaa]/20",
    iconColor: "text-[#00ffaa]",
    features: [
      "200 best trading pairs",
      "Priority Telegram signals",
      "Detailed analytics",
      "API access",
      "Priority support",
      "Webhook integration",
    ],
    popular: true,
    trial: null,
  },
  {
    name: "Unlimited",
    price: 2499,
    yearlyPrice: 1999,
    desc: "For serious traders",
    icon: <Crown className="w-8 h-8" />,
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    features: [
      "All trading pairs (no limits)",
      "VIP Telegram signals",
      "Dedicated account manager",
      "Custom indicators",
      "Unlimited API access",
      "24/7 priority support",
    ],
    popular: false,
    trial: null,
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(1);
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsYearly(checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: ["#00ffaa", "#4488ff", "#aa66ff", "#00dd99"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <section id="pricing" className="py-16 relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-[#070710]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00ffaa]/5 rounded-full blur-[150px]" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {}
        <div className="text-center mb-16">
          <p className="text-[#00ffaa] text-sm font-medium tracking-widest uppercase mb-4">
            Pricing
          </p>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Choose Your <span className="profit-number">Profit Plan</span>
          </h2>
          <p className="text-[#7a7a8f] text-xl max-w-xl mx-auto mb-10">
            Professional trading signals delivered to your Telegram
          </p>

          {}
          <div className="inline-flex items-center gap-4 p-2 rounded-full bg-white/5 border border-white/10">
            <span className={`px-4 py-2 text-sm font-medium transition-colors ${!isYearly ? "text-white" : "text-[#6a6a7f]"}`}>
              Monthly
            </span>
            <Switch
              ref={switchRef}
              checked={isYearly}
              onCheckedChange={handleToggle}
            />
            <span className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${isYearly ? "text-white" : "text-[#6a6a7f]"}`}>
              Yearly
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#00ffaa]/20 text-[#00ffaa]">
                -20%
              </span>
            </span>
          </div>
        </div>

        {}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ 
                y: plan.popular ? -20 : 0, 
                opacity: 1,
                scale: plan.popular ? 1.05 : 1,
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              onMouseEnter={() => setHoveredPlan(i)}
              onMouseLeave={() => setHoveredPlan(1)}
              className="relative"
            >
              {}
              {plan.popular && (
                <div className="absolute -inset-1 bg-gradient-to-r from-[#00ffaa] via-[#00dd99] to-[#00ffaa] rounded-3xl blur-lg opacity-30 animate-pulse" />
              )}
              
              <div
                className={`relative h-full rounded-3xl border overflow-hidden transition-all duration-300 ${
                  plan.popular
                    ? "border-[#00ffaa]/50 bg-[#0a0a12]"
                    : hoveredPlan === i
                    ? "border-white/20 bg-[#0a0a12]"
                    : "border-white/10 bg-[#0a0a12]/80"
                }`}
              >
                {}
                {plan.popular && (
                  <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#00ffaa] rounded-bl-2xl rounded-tr-3xl flex items-center gap-1">
                    <Star className="w-4 h-4 text-black fill-black" />
                    <span className="text-black text-xs font-bold">POPULAR</span>
                  </div>
                )}

                {}
                {plan.trial && (
                  <div className="absolute top-0 left-0 px-4 py-1.5 bg-[#4488ff] rounded-br-2xl rounded-tl-3xl flex items-center gap-1">
                    <Gift className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-bold">{plan.trial}-DAY FREE TRIAL</span>
                  </div>
                )}
                
                {}
                <div className="p-8 flex flex-col h-full">
                  {}
                  <div className="mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${plan.iconBg} flex items-center justify-center mb-4`}>
                      <div className={plan.iconColor}>{plan.icon}</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-sm text-[#6a6a7f]">{plan.desc}</p>
                  </div>
                  
                  {}
                  <div className="mb-8">
                    <div className="flex items-end gap-1 blur-md select-none">
                      <span className="text-[#6a6a7f] text-lg">$</span>
                      <NumberFlow
                        value={isYearly ? plan.yearlyPrice : plan.price}
                        format={{ useGrouping: false }}
                        className={`text-4xl font-bold font-mono ${plan.popular ? "text-[#00ffaa]" : "text-white"}`}
                        transformTiming={{ duration: 500, easing: "ease-out" }}
                      />
                      <span className="text-[#6a6a7f] mb-1">/mo</span>
                    </div>
                    {isYearly && (
                      <div className="text-sm text-[#6a6a7f] mt-2 blur-md select-none">
                        <span className="line-through">${plan.price}</span>
                        <span className="text-[#00ffaa] ml-2">
                          Save ${(plan.price - plan.yearlyPrice) * 12}/year
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {}
                  <div className="space-y-4 mb-8 flex-1">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#00ffaa]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-[#00ffaa]" />
                        </div>
                        <span className="text-sm text-[#c0c0cf]">{f}</span>
                      </div>
                    ))}
                  </div>
                  
                  {}
                  <Link 
                    href="/register"
                    className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold transition-all ${
                      plan.popular 
                        ? "btn-primary" 
                        : "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <span>{plan.trial ? "Start Free Trial" : "Get Started"}</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-12 h-12 rounded-full bg-[#00ffaa]/10 flex items-center justify-center">
              <Check className="w-6 h-6 text-[#00ffaa]" />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold">30-Day Money Back Guarantee</div>
              <div className="text-sm text-[#6a6a7f]">Not satisfied? Get a full refund, no questions asked</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
