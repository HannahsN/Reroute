/**
 * Reroute Cognitive Engine
 * Pipeline: RAW DATA → CLEANED METRICS → DERIVED STATES → COGNITIVE SCORE → ADAPTATION
 */

// ─── MODULE 1: Biometric Data Module ────────────────────────────────────────
export function getRawMetrics(entry) {
  if (!entry) return null;
  return {
    heart_rate_avg: entry.heart_rate_avg,
    heart_rate_variability: entry.heart_rate_variability,
    sleep_duration: entry.sleep_duration,
    sleep_quality: entry.sleep_quality,
    steps: entry.steps,
    stress_level: entry.stress_level,
  };
}

// ─── MODULE 2: Baseline Normalization Module ─────────────────────────────────
const BASELINES = {
  heart_rate_avg: { min: 45, max: 100, optimal: 60 },
  heart_rate_variability: { min: 10, max: 100, optimal: 65 },
  sleep_duration: { min: 4, max: 10, optimal: 8 },
  sleep_quality: { min: 0, max: 100, optimal: 85 },
  steps: { min: 0, max: 20000, optimal: 9000 },
  stress_level: { min: 1, max: 10, optimal: 2 },
};

export function normalizeMetrics(raw) {
  if (!raw) return null;
  const normalized = {};
  for (const [key, baseline] of Object.entries(BASELINES)) {
    const val = raw[key];
    if (val == null) { normalized[key] = null; continue; }
    const range = baseline.max - baseline.min;
    if (key === "stress_level" || key === "heart_rate_avg") {
      normalized[key] = Math.max(0, Math.min(1, (baseline.max - val) / range));
    } else {
      normalized[key] = Math.max(0, Math.min(1, (val - baseline.min) / range));
    }
  }
  return normalized;
}

// ─── MODULE 3: Derived State Engine ──────────────────────────────────────────
export function deriveCognitiveStates(raw, normalized) {
  if (!raw || !normalized) return null;
  const sleepScore = ((normalized.sleep_duration ?? 0.5) * 0.6 + (normalized.sleep_quality ?? 0.5) * 0.4) * 100;
  const stressN = raw.stress_level ? 1 - ((raw.stress_level - 1) / 9) : 0.5;
  const recoveryScore = ((normalized.heart_rate_variability ?? 0.5) * 0.5 + (normalized.heart_rate_avg ?? 0.5) * 0.3 + stressN * 0.2) * 100;
  const activityScore = (normalized.steps ?? 0.5) * 100;
  return {
    sleep: { score: sleepScore, state: sleepScore >= 75 ? "Restorative" : sleepScore >= 50 ? "Adequate" : "Depleted" },
    recovery: { score: recoveryScore, state: recoveryScore >= 70 ? "Recovered" : recoveryScore >= 45 ? "Moderate" : "Fatigued" },
    activity: { score: activityScore, state: activityScore >= 60 ? "Active" : activityScore >= 30 ? "Moderate" : "Sedentary" },
  };
}

// ─── MODULE 4: Cognitive Score Engine ────────────────────────────────────────
export function computeCognitiveScore(states) {
  if (!states) return 0;
  return Math.max(0, Math.min(100, Math.round(
    states.sleep.score * 0.4 + states.recovery.score * 0.4 + states.activity.score * 0.2
  )));
}

// ─── MODULE 5: Adaptation Engine ─────────────────────────────────────────────
export function getAdaptationProfile(score) {
  if (score >= 80) return {
    zone: "Peak", color: "emerald",
    tagline: "Your biology is aligned. Go deep.",
    sessionTypes: ["deep_focus", "active_recall", "creative_work"],
    maxDuration: 90, breakInterval: 50,
    recommendation: "Tackle your hardest material first. You have the capacity for high-load cognitive work.",
  };
  if (score >= 60) return {
    zone: "Engaged", color: "blue",
    tagline: "Solid readiness. Build and reinforce.",
    sessionTypes: ["active_recall", "practice_problems", "light_review"],
    maxDuration: 60, breakInterval: 35,
    recommendation: "Focus on consolidation and practice. Avoid brand-new complex topics.",
  };
  if (score >= 40) return {
    zone: "Moderate", color: "teal",
    tagline: "Conserve energy. Review familiar ground.",
    sessionTypes: ["light_review", "practice_problems"],
    maxDuration: 40, breakInterval: 25,
    recommendation: "Stick to familiar material. Short, structured sessions only.",
  };
  return {
    zone: "Recovery", color: "slate",
    tagline: "Your body needs rest. Protect it.",
    sessionTypes: ["rest"],
    maxDuration: 20, breakInterval: 15,
    recommendation: "Rest, hydrate, move gently. Brief passive review may help maintain progress.",
  };
}

export function getZoneColors(zone) {
  const map = {
    Peak: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", dot: "bg-emerald-400", glow: "shadow-emerald-500/20" },
    Engaged: { text: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30", dot: "bg-blue-400", glow: "shadow-blue-500/20" },
    Moderate: { text: "text-teal-400", bg: "bg-teal-400/10", border: "border-teal-400/30", dot: "bg-teal-400", glow: "shadow-teal-500/20" },
    Recovery: { text: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/30", dot: "bg-slate-400", glow: "shadow-slate-500/10" },
  };
  return map[zone] || map.Moderate;
}