import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp } from "lucide-react";
import ReadinessTrendChart from "../components/trends/ReadinessTrendChart";
import MetricCard from "../components/shared/MetricCard";
import { Heart, Activity, Moon, Brain } from "lucide-react";

export default function Trends() {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["biometricEntries"],
    queryFn: () => base44.entities.BiometricEntry.list("-date", 60),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["studySessions"],
    queryFn: () => base44.entities.StudySession.list("-date", 60),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  const avg = (arr, key) => {
    const valid = arr.filter(e => e[key] != null);
    if (!valid.length) return null;
    return Math.round(valid.reduce((s, e) => s + e[key], 0) / valid.length);
  };

  const last7 = entries.slice(0, 7);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-500/10">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trends & Insights</h1>
          <p className="text-slate-400 text-sm">Your biometric and study patterns over time</p>
        </div>
      </div>

      {/* 7-day averages */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">7-Day Averages</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard icon={Brain} label="Readiness" value={avg(last7, "readiness_score")} unit="/ 100" />
          <MetricCard icon={Heart} label="Resting HR" value={avg(last7, "heart_rate_avg")} unit="bpm" />
          <MetricCard icon={Activity} label="HRV" value={avg(last7, "heart_rate_variability")} unit="ms" />
          <MetricCard icon={Moon} label="Sleep" value={last7.length ? (last7.reduce((s, e) => s + (e.sleep_duration || 0), 0) / last7.length).toFixed(1) : null} unit="hrs" />
        </div>
      </div>

      {/* Readiness chart */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-sm">
        <h3 className="text-white font-semibold text-lg mb-4">Readiness Over Time</h3>
        <ReadinessTrendChart entries={entries} />
      </div>

      {/* Correlation insight */}
      {entries.length >= 3 && sessions.length >= 3 && (
        <div className="bg-slate-800/30 border border-blue-500/20 rounded-3xl p-6 backdrop-blur-sm">
          <h3 className="text-white font-semibold text-lg mb-2">Study-Readiness Correlation</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Over your last {sessions.length} sessions, your average effectiveness when readiness was above 60 was{" "}
            <span className="text-blue-400 font-semibold">
              {(() => {
                const highReady = sessions.filter(s => s.readiness_score_at_start >= 60 && s.effectiveness_rating);
                return highReady.length
                  ? (highReady.reduce((s, e) => s + e.effectiveness_rating, 0) / highReady.length).toFixed(1)
                  : "N/A";
              })()}
            </span>{" "}
            vs{" "}
            <span className="text-amber-400 font-semibold">
              {(() => {
                const lowReady = sessions.filter(s => s.readiness_score_at_start < 60 && s.readiness_score_at_start > 0 && s.effectiveness_rating);
                return lowReady.length
                  ? (lowReady.reduce((s, e) => s + e.effectiveness_rating, 0) / lowReady.length).toFixed(1)
                  : "N/A";
              })()}
            </span>{" "}
            when below 60. Studying aligned with your biology makes a difference.
          </p>
        </div>
      )}
    </div>
  );
}