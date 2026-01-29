"use client";

import { useState } from "react";

const steps = [
  {
    num: "01",
    title: "Subscribe",
    desc: "Create account in 2 minutes. Pick your plan. Done.",
    color: "#00ffaa",
  },
  {
    num: "02", 
    title: "Connect",
    desc: "Link exchange with read-only API. Or just follow signals manually.",
    color: "#4488ff",
  },
  {
    num: "03",
    title: "Profit",
    desc: "Get real-time alerts. Execute. Watch portfolio grow.",
    color: "#ffaa00",
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section className="py-32 relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-[#030306]" />
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00ffaa]/10 to-transparent" />

      <div className="max-w-[1100px] mx-auto px-6 relative z-10">
        {}
        <div className="text-center mb-24">
          <p className="text-[#4488ff] text-sm font-medium tracking-widest uppercase mb-4">
            How It Works
          </p>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold">
            Three steps to
            <br />
            <span className="text-[#00ffaa]">passive income</span>
          </h2>
        </div>

        {}
        <div className="grid md:grid-cols-3 gap-4 md:gap-0 mb-24">
          {steps.map((step, i) => (
            <div
              key={i}
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
              className="relative group cursor-default"
            >
              {}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] right-0 h-px">
                  <div className="w-full h-full bg-white/10" />
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#00ffaa] transition-all duration-500"
                    style={{ width: activeStep !== null && activeStep > i ? "100%" : "0%" }}
                  />
                </div>
              )}

              {}
              <div className="relative py-8 md:pr-12">
                {}
                <div 
                  className={`text-8xl md:text-9xl font-bold font-mono leading-none transition-all duration-300 ${
                    activeStep === i ? "opacity-100" : "opacity-10"
                  }`}
                  style={{ color: activeStep === i ? step.color : "white" }}
                >
                  {step.num}
                </div>

                {}
                <div className="mt-4">
                  <h3 className={`text-2xl font-bold mb-2 transition-colors ${
                    activeStep === i ? "text-white" : "text-[#8a8a9f]"
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm leading-relaxed transition-colors ${
                    activeStep === i ? "text-[#9a9aaf]" : "text-[#5a5a6f]"
                  }`}>
                    {step.desc}
                  </p>
                </div>

                {}
                <div 
                  className={`absolute bottom-0 left-0 h-1 rounded-full transition-all duration-300 ${
                    activeStep === i ? "w-16" : "w-0"
                  }`}
                  style={{ background: step.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/5">
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold font-mono text-[#00ffaa] mb-2">5</div>
            <div className="text-[#5a5a6f] text-sm">minutes to start</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold font-mono text-white mb-2">0</div>
            <div className="text-[#5a5a6f] text-sm">coding required</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold font-mono text-[#4488ff] mb-2">24/7</div>
            <div className="text-[#5a5a6f] text-sm">automated</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold font-mono text-[#ffaa00] mb-2">7</div>
            <div className="text-[#5a5a6f] text-sm">days free trial</div>
          </div>
        </div>
      </div>
    </section>
  );
}
