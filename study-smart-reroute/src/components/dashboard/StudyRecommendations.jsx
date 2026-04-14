import React from "react";
import RecommendationCard from "../shared/RecommendationCard";

function generateRecommendations(score) {
  if (!score && score !== 0) return [];
  
  if (score >= 80) {
    return [
      { type: "deep_focus", title: "Deep Focus Session", description: "Your readiness is optimal. Tackle your most challenging material — complex problem sets, dense readings, or new concepts.", duration: 90, intensity: "High" },
      { type: "active_recall", title: "Active Recall Drills", description: "Test yourself on recently learned material. Your cognitive state supports strong encoding right now.", duration: 45, intensity: "High" },
      { type: "creative_work", title: "Creative Project Work", description: "Use your peak state for creative thinking, writing, or project development.", duration: 60, intensity: "Medium" },
    ];
  }
  if (score >= 60) {
    return [
      { type: "active_recall", title: "Spaced Repetition Review", description: "Good readiness for consolidation. Review flashcards and practice active recall on familiar topics.", duration: 45, intensity: "Medium" },
      { type: "practice_problems", title: "Practice Problems", description: "Work through moderate-difficulty problems to reinforce understanding.", duration: 60, intensity: "Medium" },
      { type: "light_review", title: "Organized Note Review", description: "Reorganize and summarize notes from recent sessions to strengthen connections.", duration: 30, intensity: "Low" },
    ];
  }
  if (score >= 40) {
    return [
      { type: "light_review", title: "Light Review Session", description: "Moderate readiness. Stick to familiar material — re-read notes, watch review videos, or do light practice.", duration: 30, intensity: "Low" },
      { type: "practice_problems", title: "Easy Problem Sets", description: "Work through straightforward problems to maintain momentum without overexertion.", duration: 25, intensity: "Low" },
      { type: "creative_work", title: "Study Planning", description: "Use this time to organize your study schedule and prepare materials for high-readiness sessions.", duration: 20, intensity: "Low" },
    ];
  }
  return [
    { type: "rest", title: "Recovery Recommended", description: "Your biometrics suggest fatigue. Rest now to perform better later. Consider a short walk or meditation.", duration: 20, intensity: "Minimal" },
    { type: "light_review", title: "Passive Listening", description: "If you must study, listen to podcasts or lectures passively. No active problem-solving today.", duration: 30, intensity: "Minimal" },
  ];
}

export default function StudyRecommendations({ readinessScore }) {
  const recommendations = generateRecommendations(readinessScore);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-white font-semibold text-lg">Recommended Sessions</h2>
        <p className="text-slate-400 text-sm mt-0.5">Based on your current cognitive readiness</p>
      </div>
      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <RecommendationCard key={i} {...rec} />
        ))}
      </div>
    </div>
  );
}