import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { cn } from "@/lib/utils";
// 1. Added MessageSquare to the imports
import { LayoutDashboard, Activity, BookOpen, TrendingUp, CalendarDays, Menu, X, MessageSquare } from "lucide-react";

// 2. Added the Chatbot to your navigation items
const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Biometrics", icon: Activity, page: "LogBiometrics" },
  { name: "Sessions", icon: BookOpen, page: "Sessions" },
  { name: "Trends", icon: TrendingUp, page: "Trends" },
  { name: "Weekly Structure", icon: CalendarDays, page: "WeeklyStructure" },
  { name: "Chatbot", icon: MessageSquare, page: "Chatbot" },
];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#060f1e] text-white">
      <style>{`
        :root { --background: 217 50% 8%; --foreground: 210 40% 98%; }
        body { background: #060f1e; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 9999px; }
      `}</style>

      {/* Sky-blue animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Main sky glow — top centre */}
        <div className="absolute top-[-15%] left-[50%] -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-3xl opacity-[0.12] animate-pulse"
          style={{ background: "radial-gradient(ellipse, #38bdf8 0%, #0ea5e9 30%, #0369a1 70%, transparent 100%)", animationDuration: "10s" }} />
        {/* Horizon glow — bottom */}
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[400px] rounded-full blur-3xl opacity-[0.07] animate-pulse"
          style={{ background: "radial-gradient(ellipse, #7dd3fc 0%, #0284c7 50%, transparent 100%)", animationDuration: "14s", animationDelay: "3s" }} />
        {/* Subtle right cloud */}
        <div className="absolute top-[30%] right-[5%] w-[350px] h-[350px] rounded-full blur-3xl opacity-[0.05] animate-pulse"
          style={{ background: "radial-gradient(circle, #bae6fd 0%, #38bdf8 60%, transparent 100%)", animationDuration: "18s", animationDelay: "6s" }} />
        {/* Fine grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(125,211,252,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,0.4) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-sky-900/30 bg-[#060f1e]/90 backdrop-blur-xl fixed inset-y-0 left-0 z-30">
          {/* Logo */}
          <div className="px-6 py-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text text-transparent">Reroute</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 pl-[42px]">Biometric Study Engine</p>
          </div>

          <nav className="flex-1 px-3 space-y-1 mt-4">
            {navItems.map(item => {
              const active = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                      : "text-slate-400 hover:text-sky-200 hover:bg-sky-900/20"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-sky-900/30">
            <div className="px-3 py-2 rounded-xl bg-sky-950/30 border border-sky-900/20 text-center">
              <p className="text-[10px] text-sky-600 uppercase tracking-widest">Data Source</p>
              <p className="text-xs text-sky-300/80 font-medium mt-0.5">Manual Input</p>
              <p className="text-[10px] text-sky-700 mt-0.5">Fitbit API coming soon</p>
            </div>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold">Reroute</span>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-400">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileOpen && (
            <nav className="px-3 pb-3 space-y-1">
              {navItems.map(item => {
                const active = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                      active ? "bg-blue-500/10 text-blue-400" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Main content */}
        <main className="flex-1 md:ml-64 pt-16 md:pt-0">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}