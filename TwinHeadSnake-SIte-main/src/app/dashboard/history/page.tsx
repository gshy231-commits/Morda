"use client";

import { Clock } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-xl lg:text-2xl font-bold mb-1">Trade History</h1>
      <p className="text-sm text-[#6a6a7f] mb-6 lg:mb-8">Review your past trading signals</p>

      {}
      <div className="card p-8 lg:p-12 text-center">
        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-[#4488ff]/10 flex items-center justify-center mx-auto mb-4 lg:mb-6">
          <Clock className="w-7 h-7 lg:w-8 lg:h-8 text-[#4488ff]" />
        </div>
        <h2 className="text-lg lg:text-xl font-bold mb-2">Coming Soon</h2>
        <p className="text-sm text-[#6a6a7f] max-w-md mx-auto">
          Trade history will be available once we implement closed positions tracking. 
          For now, check your open positions on the main dashboard.
        </p>
      </div>
    </div>
  );
}
