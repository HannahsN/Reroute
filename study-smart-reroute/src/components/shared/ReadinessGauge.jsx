import React from "react";
import { cn } from "@/lib/utils";

function getReadinessColor(score) {
  if (score >= 80) return { ring: "text-emerald-400", bg: "bg-emerald-400/10", label: "Optimal" };
  if (score >= 60) return { ring: "text-blue-400", bg: "bg-blue-400/10", label: "Good" };
  if (score >= 40) return { ring: "text-amber-400", bg: "bg-amber-400/10", label: "Moderate" };
  if (score >= 20) return { ring: "text-orange-400", bg: "bg-orange-400/10", label: "Low" };
  return { ring: "text-red-400", bg: "bg-red-400/10", label: "Rest" };
}

export default function ReadinessGauge({ score = 0, size = "lg" }) {
  const { ring, bg, label } = getReadinessColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const sizes = {
    sm: { wrapper: "w-24 h-24", text: "text-xl", label: "text-[10px]" },
    md: { wrapper: "w-36 h-36", text: "text-3xl", label: "text-xs" },
    lg: { wrapper: "w-48 h-48", text: "text-5xl", label: "text-sm" },
  };

  const s = sizes[size] || sizes.lg;

  return (
    <div className={cn("relative flex items-center justify-center", s.wrapper)}>
      <div className={cn("absolute inset-0 rounded-full", bg)} />
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="5"
          className="text-slate-700/40" />
        <circle cx="60" cy="60" r="54" fill="none" strokeWidth="5"
          strokeLinecap="round"
          stroke="currentColor"
          className={cn(ring, "transition-all duration-1000 ease-out")}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="relative text-center">
        <span className={cn("font-bold text-white", s.text)}>{Math.round(score)}</span>
        <p className={cn("font-medium tracking-wide uppercase mt-0.5", ring, s.label)}>{label}</p>
      </div>
    </div>
  );
}