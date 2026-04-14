import React from "react";
import { cn } from "@/lib/utils";
import { Clock, Zap, BookOpen, Brain, Lightbulb, Coffee } from "lucide-react";

const typeConfig = {
  deep_focus: { icon: Brain, color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
  active_recall: { icon: Zap, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  light_review: { icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  practice_problems: { icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  creative_work: { icon: Lightbulb, color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20" },
  rest: { icon: Coffee, color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/20" },
};

export default function RecommendationCard({ type, title, description, duration, intensity, className }) {
  const config = typeConfig[type] || typeConfig.light_review;
  const Icon = config.icon;

  return (
    <div className={cn(
      "bg-slate-800/50 border rounded-2xl p-6 backdrop-blur-sm",
      config.border,
      "hover:bg-slate-800/70 transition-all duration-300",
      className
    )}>
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-xl", config.bg)}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base">{title}</h3>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">{description}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{duration} min</span>
            </div>
            {intensity && (
              <div className={cn("text-xs font-medium px-2 py-0.5 rounded-full", config.bg, config.color)}>
                {intensity} intensity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}