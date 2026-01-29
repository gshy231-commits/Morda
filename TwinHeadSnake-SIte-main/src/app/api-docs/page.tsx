import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "API Documentation",
  description: "Integrate TwinHeadSnake's algorithmic trading signals into your infrastructure with our clean, well-documented REST API.",
  openGraph: {
    title: "API Documentation | TwinHeadSnake",
    description: "Integrate TwinHeadSnake's algorithmic trading signals into your infrastructure.",
  },
};

const endpoints = [
  {
    method: "GET",
    path: "/signals",
    description: "Retrieve current trading signals for all active pairs or a specific pair.",
    params: [
      { name: "pair", type: "string", required: false },
      { name: "timeframe", type: "string", required: false },
    ],
    response: `{
  "signals": [
    {
      "pair": "BTC/USDT",
      "timeframe": "1h",
      "signal": "BUY",
      "entry_price": 43250,
      "stop_loss": 42800,
      "take_profit_1": 44100
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/positions",
    description: "Retrieve current open positions and their status.",
    params: [{ name: "status", type: "string", required: false }],
    response: `{
  "positions": [
    {
      "id": "pos_12345",
      "pair": "BTC/USDT",
      "side": "LONG",
      "entry_price": 43250,
      "unrealized_pnl": 1240
    }
  ]
}`,
  },
  {
    method: "POST",
    path: "/webhook",
    description: "Configure webhook endpoints to receive real-time signal notifications.",
    params: [],
    requestBody: `{
  "url": "https:
  "events": ["signal.created", "position.updated"],
  "secret": "your-webhook-secret"
}`,
    response: `{
  "event": "signal.created",
  "data": {
    "pair": "BTC/USDT",
    "signal": "BUY",
    "price": 43250
  },
  "signature": "sha256=..."
}`,
  },
];

export default function ApiDocsPage() {
  return (
    <main>
      <Navbar currentPage="api" />

      {}
      <section className="pt-32 pb-20 bg-gradient-to-b from-[#050508] via-[#0a0a12] to-[#050508] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(68,136,255,0.03)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-[#4488ff]/10 border border-[#4488ff]/20 text-[#4488ff] text-sm font-medium mb-6">
              Developer Tools
            </span>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4488ff] to-[#00ffaa]">
                API Documentation
              </span>
            </h1>
            <p className="text-xl text-[#7a7a8f] max-w-3xl mx-auto leading-relaxed">
              Integrate TwinHeadSnake&apos;s algorithmic trading signals into your infrastructure with our clean, well-documented REST API.
            </p>
          </div>

          {}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: "bolt", title: "Real-time Data", desc: "Sub-second signal delivery via WebSocket and REST endpoints", color: "#00ffaa" },
              { icon: "code", title: "Clean Code", desc: "Well-documented endpoints with SDKs for Python, Node.js, and C#", color: "#4488ff" },
              { icon: "terminal", title: "Flexible Integration", desc: "Webhook support and customizable data formats for any infrastructure", color: "#aa66ff" },
            ].map((f, i) => (
              <div key={i} className="card p-8 text-center group">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                  style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}
                >
                  <svg className="w-8 h-8" fill="none" stroke={f.color} viewBox="0 0 24 24" strokeWidth="1.5">
                    {f.icon === "bolt" && <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />}
                    {f.icon === "code" && <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />}
                    {f.icon === "terminal" && <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-[#7a7a8f] text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="py-24 bg-[#0a0a12]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-3xl font-bold mb-8">API Overview</h2>

              {}
              <div className="card p-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00ffaa]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#00ffaa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  Authentication
                </h3>
                <p className="text-[#7a7a8f] mb-4">All API requests require an API key for authentication. Include your API key in the Authorization header.</p>
                <div className="code-block p-4 font-mono text-sm">
                  <span className="text-[#7a7a8f]">
                  <span className="text-[#00ffaa]">Authorization:</span> Bearer <span className="text-[#ffaa00]">YOUR_API_KEY</span>
                </div>
              </div>

              {}
              <div className="card p-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#4488ff]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#4488ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  Base URL
                </h3>
                <div className="code-block p-4 font-mono text-sm">
                  <span className="text-[#7a7a8f]">
                  <span className="text-[#00ffaa]">https:
                  <span className="text-[#7a7a8f]">
                  <span className="text-[#ffaa00]">https:
                </div>
              </div>

              {}
              <div className="card p-8">
                <h3 className="text-xl font-semibold mb-6">Rate Limits</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-white/5">
                    <h4 className="font-semibold text-[#00ffaa] mb-3">Standard Tier</h4>
                    <ul className="text-sm text-[#7a7a8f] space-y-2">
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00ffaa]" />100 requests per minute</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00ffaa]" />1000 requests per hour</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00ffaa]" />Real-time signals</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <h4 className="font-semibold text-[#4488ff] mb-3">Pro Tier</h4>
                    <ul className="text-sm text-[#7a7a8f] space-y-2">
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#4488ff]" />500 requests per minute</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#4488ff]" />Unlimited requests per hour</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#4488ff]" />WebSocket access</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="space-y-6">
              <div className="card p-8">
                <h3 className="text-xl font-semibold mb-6">Quick Start</h3>
                <div className="space-y-4">
                  {["Get your API key", "Make your first request", "Integrate into your system"].map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2a2a3a] to-[#1a1a2a] border border-white/10 flex items-center justify-center text-sm font-bold text-[#6a6a7f]">
                        {i + 1}
                      </div>
                      <span className="text-[#7a7a8f]">{step}</span>
                    </div>
                  ))}
                </div>
                {}
                <button 
                  disabled
                  className="relative flex items-center justify-center gap-2 w-full mt-8 py-3 px-6 rounded-xl bg-gradient-to-r from-[#1a1a2a] to-[#0f0f1a] text-[#6a6a7f] font-semibold border border-[#00ffaa]/20 cursor-not-allowed overflow-hidden"
                >
                  <Clock className="w-4 h-4 text-[#00ffaa]/60" />
                  <span>API Keys Coming Soon</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ffaa]/10 to-transparent animate-shimmer" />
                </button>
              </div>

              <div className="card p-8">
                <h3 className="text-xl font-semibold mb-6">Support</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#00ffaa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[#7a7a8f]">twinheadsnake@proton.me</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#00ffaa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-[#7a7a8f]">Discord Community</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#00ffaa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[#7a7a8f]">24/7 API Uptime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-24 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12">API Endpoints</h2>

          <div className="space-y-8">
            {endpoints.map((ep, i) => (
              <div key={i} className="card p-8">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${ep.method === "GET" ? "method-get" : "method-post"}`}>
                    {ep.method}
                  </span>
                  <h3 className="text-xl font-mono font-semibold">{ep.path}</h3>
                </div>
                <p className="text-[#7a7a8f] mb-8">{ep.description}</p>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4 text-[#00ffaa]">
                      {ep.requestBody ? "Request Body" : "Parameters"}
                    </h4>
                    {ep.requestBody ? (
                      <pre className="code-block p-4 text-sm overflow-x-auto">{ep.requestBody}</pre>
                    ) : ep.params.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 text-[#7a7a8f]">Parameter</th>
                            <th className="text-left py-3 text-[#7a7a8f]">Type</th>
                            <th className="text-left py-3 text-[#7a7a8f]">Required</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ep.params.map((p, j) => (
                            <tr key={j} className="border-b border-white/5">
                              <td className="py-3 font-mono text-[#00ffaa]">{p.name}</td>
                              <td className="py-3 text-[#7a7a8f]">{p.type}</td>
                              <td className="py-3 text-[#ffaa00]">{p.required ? "Required" : "Optional"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-[#7a7a8f] text-sm">No parameters required</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4 text-[#00ffaa]">Response</h4>
                    <pre className="code-block p-4 text-sm overflow-x-auto">{ep.response}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="py-24 bg-gradient-to-b from-[#050508] to-[#0a0a12]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#aa66ff]/10 border border-[#aa66ff]/20 text-[#aa66ff] text-sm font-medium mb-6">
              <Clock className="w-4 h-4" />
              Coming Soon
            </span>
            <h2 className="text-4xl font-bold mb-6">Client Libraries</h2>
            <p className="text-xl text-[#7a7a8f] max-w-2xl mx-auto">
              Official client libraries for popular programming languages
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Python", color: "#4488ff", install: "pip install twinheadsnake" },
              { name: "Node.js", color: "#00ffaa", install: "npm install @twinheadsnake/sdk" },
              { name: "C#", color: "#aa66ff", install: "dotnet add package TwinHeadSnake" },
            ].map((sdk, i) => (
              <div key={i} className="card p-10 text-center group relative overflow-hidden opacity-60">
                {}
                <div className="absolute inset-0 bg-[#0a0a12]/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <Clock className="w-4 h-4 text-[#6a6a7f]" />
                    <span className="text-[#6a6a7f] text-sm font-medium">Coming Soon</span>
                  </div>
                </div>
                
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
                  style={{ background: `${sdk.color}20`, border: `1px solid ${sdk.color}30` }}
                >
                  <span className="text-2xl font-bold" style={{ color: sdk.color }}>{sdk.name[0]}</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4">{sdk.name}</h3>
                <div className="code-block p-3 text-sm font-mono text-[#7a7a8f]">{sdk.install}</div>
              </div>
            ))}
          </div>

          {}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-white/5 border border-white/10">
              <Clock className="w-6 h-6 text-[#aa66ff]" />
              <div className="text-left">
                <div className="text-white font-semibold">SDKs in Development</div>
                <div className="text-sm text-[#6a6a7f]">Official libraries will be available at launch</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
