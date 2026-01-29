"use client";

import { Wallet } from "lucide-react";

export default function PortfolioPage() {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-[#4488ff]/20 flex items-center justify-center mx-auto mb-4 lg:mb-6">
          <Wallet className="w-8 h-8 lg:w-10 lg:h-10 text-[#4488ff]" />
        </div>
        <h2 className="text-xl lg:text-2xl font-bold mb-2">Coming Soon</h2>
        <p className="text-sm text-[#6a6a7f] mb-6">
          Portfolio tracking will be available in a future update
        </p>
      </div>
    </div>
  );
}
