import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import TodayOverview from "../components/dashboard/TodayOverview";
import StudyRecommendations from "../components/dashboard/StudyRecommendations";
import ReadinessTrendChart from "../components/trends/ReadinessTrendChart";
import PipelineVisualizer from "../components/dashboard/PipelineVisualizer";
import AdaptationZone from "../components/dashboard/AdaptationZone";
import TodayFocus from "../components/dashboard/TodayFocus";
import {
  getRawMetrics,
  normalizeMetrics,
  deriveCognitiveStates,
  computeCognitiveScore,
  getAdaptationProfile,
} from "../components/engine/cognitiveEngine";

export default function Dashboard() {
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["biometricEntries"],
    queryFn: () => base44.entities.BiometricEntry.list("-date", 30),
  });

  const todayEntry = entries.find(e => e.date === today);

  // Run full pipeline
  const raw = getRawMetrics(todayEntry);
  const normalized = normalizeMetrics(raw);
  const states = deriveCognitiveStates(raw, normalized);
  const score = todayEntry?.readiness_score ?? (states ? computeCognitiveScore(states) : null);
  const profile = score != null ? getAdaptationProfile(score) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}
        </h1>
        <p className="text-sky-400/70 text-sm mt-1">
          {format(new Date(), "EEEE, MMMM d")} — Here's your cognitive snapshot
        </p>
      </div>

      {/* Pipeline Visualizer */}
      <div className="bg-sky-950/20 border border-sky-900/30 rounded-3xl p-5 backdrop-blur-sm">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mb-3">
          Cognitive Pipeline — tap any stage to inspect
        </p>
        <PipelineVisualizer
          raw={raw}
          normalized={normalized}
          states={states}
          score={score}
          profile={profile}
        />
      </div>

      {/* Adaptation Zone */}
      {profile && <AdaptationZone profile={profile} score={score} />}

      {/* Main grid: biometrics + recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-sky-950/20 border border-sky-900/30 rounded-3xl p-6 backdrop-blur-sm">
            <TodayOverview entry={todayEntry} />
          </div>
        </div>
        <div className="lg:col-span-3">
          <StudyRecommendations readinessScore={score} />
        </div>
      </div>

      {/* Today's Focus */}
      <div className="bg-sky-950/20 border border-sky-900/30 rounded-3xl p-6 backdrop-blur-sm">
        <TodayFocus />
      </div>

      {/* Trend chart */}
      <div className="bg-sky-950/20 border border-sky-900/30 rounded-3xl p-6 backdrop-blur-sm">
        <h2 className="text-white font-semibold text-lg mb-4">Readiness Trends</h2>
        <ReadinessTrendChart entries={entries} />
      </div>
    </div>
  );
}