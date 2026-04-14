import React from "react";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import { getZoneColors } from "../engine/cognitiveEngine";

export default function AdaptationZone({ profile, score }) {
  if (!profile) return null;
  const colors = getZoneColors(profile.zone);

  return (
    <div className={cn(
      "rounded-2xl border p-5 backdrop-blur-sm",
      colors.border, colors.bg
    )}>
      <div className="flex items-start gap-4">
        <div className={cn("p-2.5 rounded-xl", colors.bg, "border", colors.border)}>
          <Zap className={cn("w-5 h-5", colors.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className={cn("text-xs font-semibold uppercase tracking-widest", colors.text)}>
              {profile.zone} Zone
            </span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", colors.bg, colors.text, "border", colors.border)}>
              Score: {score}
            </span>
          </div>
          <p className="text-white font-semibold mt-1">{profile.tagline}</p>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">{profile.recommendation}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span>Max session: <span className="text-slate-300">{profile.maxDuration} min</span></span>
            <span>Break every: <span className="text-slate-300">{profile.breakInterval} min</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}