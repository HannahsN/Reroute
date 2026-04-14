import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Clock, Star, Brain, Zap, BookOpen, Lightbulb, Coffee } from "lucide-react";

const typeIcons = {
  deep_focus: Brain,
  active_recall: Zap,
  light_review: BookOpen,
  practice_problems: Lightbulb,
  creative_work: Lightbulb,
  rest: Coffee,
};

const typeColors = {
  deep_focus: "text-violet-400 bg-violet-400/10",
  active_recall: "text-blue-400 bg-blue-400/10",
  light_review: "text-emerald-400 bg-emerald-400/10",
  practice_problems: "text-amber-400 bg-amber-400/10",
  creative_work: "text-pink-400 bg-pink-400/10",
  rest: "text-slate-400 bg-slate-400/10",
};

export default function SessionList({ sessions }) {
  if (!sessions?.length) {
    return (
      <div className="text-center py-12 text-slate-500">
        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No sessions logged yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const Icon = typeIcons[session.session_type] || BookOpen;
        const colors = typeColors[session.session_type] || typeColors.light_review;
        return (
          <div
            key={session.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all duration-300"
          >
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg", colors.split(" ")[1])}>
                <Icon className={cn("w-4 h-4", colors.split(" ")[0])} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white font-medium text-sm">{session.subject}</h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {session.session_type?.replace(/_/g, " ")} • {format(new Date(session.date), "MMM d")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {session.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.duration_minutes}m
                      </span>
                    )}
                    {session.effectiveness_rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" />
                        {session.effectiveness_rating}/5
                      </span>
                    )}
                  </div>
                </div>
                {session.notes && (
                  <p className="text-slate-400 text-xs mt-2 line-clamp-2">{session.notes}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}