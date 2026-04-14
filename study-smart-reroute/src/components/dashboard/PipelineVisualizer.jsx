import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Database, SlidersHorizontal, Brain, Cpu, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getZoneColors } from "../engine/cognitiveEngine";

const STAGES = [
  { id: "raw", label: "Raw Data", icon: Database, color: "text-slate-400" },
  { id: "cleaned", label: "Cleaned Metrics", icon: SlidersHorizontal, color: "text-blue-400" },
  { id: "derived", label: "Derived States", icon: Brain, color: "text-violet-400" },
  { id: "score", label: "Cognitive Score", icon: Cpu, color: "text-teal-400" },
  { id: "adapt", label: "Adaptation", icon: Zap, color: "text-emerald-400" },
];

export default function PipelineVisualizer({ raw, normalized, states, score, profile }) {
  const [active, setActive] = useState(null);

  const stageData = {
    raw: raw ? Object.entries(raw).filter(([, v]) => v != null).map(([k, v]) => ({
      label: k.replace(/_/g, " "),
      value: typeof v === "number" ? v.toFixed(1) : v,
    })) : [],
    cleaned: normalized ? Object.entries(normalized).filter(([, v]) => v != null).map(([k, v]) => ({
      label: k.replace(/_/g, " "),
      value: `${Math.round(v * 100)}%`,
    })) : [],
    derived: states ? [
      { label: "Sleep", value: `${states.sleep.state} (${Math.round(states.sleep.score)})` },
      { label: "Recovery", value: `${states.recovery.state} (${Math.round(states.recovery.score)})` },
      { label: "Activity", value: `${states.activity.state} (${Math.round(states.activity.score)})` },
    ] : [],
    score: [{ label: "Cognitive Score", value: score ?? "—" }, { label: "Zone", value: profile?.zone ?? "—" }],
    adapt: profile ? [
      { label: "Recommendation", value: profile.tagline },
      { label: "Max Session", value: `${profile.maxDuration} min` },
      { label: "Break Every", value: `${profile.breakInterval} min` },
    ] : [],
  };

  const zoneColors = profile ? getZoneColors(profile.zone) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STAGES.map((stage, i) => (
          <React.Fragment key={stage.id}>
            <button
              onClick={() => setActive(active === stage.id ? null : stage.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                "border backdrop-blur-sm",
                active === stage.id
                  ? "bg-slate-700/60 border-slate-500/50 text-white"
                  : "bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50 hover:text-white",
                stage.color
              )}
            >
              <stage.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{stage.label}</span>
            </button>
            {i < STAGES.length - 1 && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "rounded-2xl border p-4 backdrop-blur-sm",
              "bg-slate-800/40",
              active === "adapt" && zoneColors ? zoneColors.border : "border-slate-700/40"
            )}
          >
            {stageData[active].length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {stageData[active].map((item, i) => (
                  <div key={i} className="bg-slate-900/40 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm text-white font-medium mt-0.5 truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-2">No data available — log your biometrics first</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}