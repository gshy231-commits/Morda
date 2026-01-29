"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { useSearchParams } from "next/navigation";
import { User, Shield, Bell, Crown, Check, Star, Zap, Clock } from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "subscription", label: "Subscription", icon: Crown },
];

const plans = [
  {
    name: "Starter",
    desc: "Perfect for beginners",
    icon: <Zap className="w-6 h-6" />,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    features: [
      "10 trading pairs",
      "Telegram signals",
      "Basic analytics",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Pro",
    desc: "Most popular choice",
    icon: <Star className="w-6 h-6" />,
    iconBg: "bg-[#00ffaa]/20",
    iconColor: "text-[#00ffaa]",
    features: [
      "200 best trading pairs",
      "Priority Telegram signals",
      "Detailed analytics",
      "API access",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Unlimited",
    desc: "For serious traders",
    icon: <Crown className="w-6 h-6" />,
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    features: [
      "All trading pairs",
      "VIP Telegram signals",
      "Dedicated manager",
      "Custom indicators",
      "24/7 support",
    ],
    popular: false,
  },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <h1 className="text-xl lg:text-2xl font-bold mb-1">Settings</h1>
      <p className="text-sm text-[#6a6a7f] mb-6 lg:mb-8">Manage your account and preferences</p>

      {}
      <div className="flex gap-2 mb-6 lg:mb-8 p-1 rounded-xl bg-white/5 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#00ffaa] text-black"
                : "text-[#6a6a7f] hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-[#6a6a7f] mb-2">Display Name</label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ffaa]/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-[#6a6a7f] mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#6a6a7f] cursor-not-allowed"
                />
              </div>
            </div>
            <button className="btn-primary px-6 py-3 mt-6">Save Changes</button>
          </div>
        </div>
      )}

      {}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-[#6a6a7f] mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ffaa]/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-[#6a6a7f] mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ffaa]/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-[#6a6a7f] mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#00ffaa]/50 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <button className="px-6 py-3 mt-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              Update Password
            </button>
          </div>
        </div>
      )}

      {}
      {activeTab === "notifications" && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { label: "New signal alerts", desc: "Get notified when a new trading signal is generated" },
              { label: "Take profit alerts", desc: "Notifications when TP targets are hit" },
              { label: "Stop loss alerts", desc: "Notifications when stop loss is triggered" },
              { label: "Weekly reports", desc: "Receive weekly performance summaries" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-[#6a6a7f]">{item.desc}</div>
                </div>
                <div className="w-12 h-7 rounded-full bg-[#00ffaa] relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-5 h-5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {activeTab === "subscription" && (
        <div className="space-y-6">
          {}
          <div className="card p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h2 className="text-lg font-semibold">Current Plan</h2>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ffaa]/20 text-[#00ffaa] text-sm font-medium w-fit">
                <div className="w-2 h-2 rounded-full bg-[#00ffaa] animate-pulse" />
                Active
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#00ffaa]/10 to-[#4488ff]/10 border border-[#00ffaa]/20">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-lg lg:text-xl font-bold">Starter Plan</div>
                <div className="text-xs lg:text-sm text-[#6a6a7f]">Your current subscription</div>
              </div>
            </div>
          </div>

          {}
          <div>
            <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan, i) => (
                <div
                  key={i}
                  className={`relative rounded-2xl border overflow-hidden transition-all ${
                    plan.popular
                      ? "border-[#00ffaa]/50 bg-[#0a0a12]"
                      : "border-white/10 bg-[#0a0a12]/80 hover:border-white/20"
                  }`}
                >
                  {}
                  {plan.popular && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-[#00ffaa] rounded-bl-xl flex items-center gap-1">
                      <Star className="w-3 h-3 text-black fill-black" />
                      <span className="text-black text-xs font-bold">POPULAR</span>
                    </div>
                  )}

                  <div className="p-4 lg:p-5">
                    {}
                    <div className="mb-4">
                      <div className={`w-10 h-10 rounded-xl ${plan.iconBg} flex items-center justify-center mb-3`}>
                        <div className={plan.iconColor}>{plan.icon}</div>
                      </div>
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      <p className="text-xs text-[#6a6a7f]">{plan.desc}</p>
                    </div>

                    {}
                    <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-[#6a6a7f]">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Price coming soon</span>
                      </div>
                    </div>

                    {}
                    <div className="space-y-2 mb-4">
                      {plan.features.map((f, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-[#00ffaa]/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-2.5 h-2.5 text-[#00ffaa]" />
                          </div>
                          <span className="text-xs text-[#a0a0af]">{f}</span>
                        </div>
                      ))}
                    </div>

                    {}
                    <button
                      disabled
                      className="w-full py-3 rounded-xl font-medium text-sm bg-white/5 text-[#6a6a7f] border border-white/10 cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4488ff]/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-[#4488ff]" />
              </div>
              <div>
                <div className="font-medium text-sm lg:text-base">Subscription plans in development</div>
                <div className="text-xs lg:text-sm text-[#6a6a7f]">We&apos;re working on bringing you flexible pricing options. Stay tuned!</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
