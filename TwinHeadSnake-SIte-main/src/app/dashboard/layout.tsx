"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030306] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#00ffaa] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#6a6a7f]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#030306] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#00ffaa] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#6a6a7f]">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#030306]">
      {}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a12] border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ffaa] to-[#00cc88] flex items-center justify-center p-1">
            <Logo className="w-full h-full text-black" />
          </div>
          <span className="font-bold">TwinHeadSnake</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <DashboardSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {}
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
