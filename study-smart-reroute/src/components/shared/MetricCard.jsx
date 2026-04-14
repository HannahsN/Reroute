import React from "react";
import { cn } from "@/lib/utils";

export default function MetricCard({ icon: Icon, label, value, unit, trend, className }) {
  return (
    <div className={cn(
      "bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm",
      "hover:border-slate-600/50 transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-slate-700/50">
          {Icon && <Icon className="w-4 h-4 text-slate-300" />}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trend > 0 ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"
          )}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold text-white">{value ?? "—"}</span>
          {unit && <span className="text-sm text-slate-400">{unit}</span>}
        </div>
      </div>
    </div>
  );
}