import React from "react";
import ReadinessGauge from "../shared/ReadinessGauge";
import MetricCard from "../shared/MetricCard";
import { Heart, Activity, Moon, Footprints, Brain, TrendingUp } from "lucide-react";

export default function TodayOverview({ entry }) {
  if (!entry) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
          <Brain className="w-7 h-7 text-slate-500" />
        </div>
        <h3 className="text-white font-semibold text-lg">No data for today</h3>
        <p className="text-slate-400 text-sm mt-1">Log your biometrics to get your readiness score</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-4">Cognitive Readiness</p>
        <ReadinessGauge score={entry.readiness_score || 0} size="lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricCard icon={Heart} label="Resting HR" value={entry.heart_rate_avg} unit="bpm" />
        <MetricCard icon={Activity} label="HRV" value={entry.heart_rate_variability} unit="ms" />
        <MetricCard icon={Moon} label="Sleep" value={entry.sleep_duration?.toFixed(1)} unit="hrs" />
        <MetricCard icon={TrendingUp} label="Sleep Quality" value={entry.sleep_quality} unit="/ 100" />
        <MetricCard icon={Footprints} label="Steps" value={entry.steps?.toLocaleString()} />
        <MetricCard icon={Brain} label="Stress" value={entry.stress_level} unit="/ 10" />
      </div>
    </div>
  );
}