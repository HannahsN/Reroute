import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SessionForm from "../components/sessions/SessionForm";
import SessionList from "../components/sessions/SessionList";

export default function Sessions() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["studySessions"],
    queryFn: () => base44.entities.StudySession.list("-date", 50),
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["biometricEntries"],
    queryFn: () => base44.entities.BiometricEntry.list("-date", 1),
  });

  const todayEntry = entries.find(e => e.date === today);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.StudySession.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studySessions"] });
      setShowForm(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  const todaySessions = sessions.filter(s => s.date === today);
  const pastSessions = sessions.filter(s => s.date !== today);
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const avgEffectiveness = sessions.length
    ? (sessions.reduce((sum, s) => sum + (s.effectiveness_rating || 0), 0) / sessions.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10">
            <BookOpen className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Study Sessions</h1>
            <p className="text-slate-400 text-sm">Track and review your study activity</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-300"
        >
          {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Log Session
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{sessions.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Sessions</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{Math.round(totalMinutes / 60)}h</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Time</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{avgEffectiveness}</p>
          <p className="text-xs text-slate-400 mt-0.5">Avg Effectiveness</p>
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-sm">
              <SessionForm
                onSubmit={(data) => createMutation.mutate(data)}
                isSubmitting={createMutation.isPending}
                readinessScore={todayEntry?.readiness_score}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session list */}
      <div>
        {todaySessions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Today</h3>
            <SessionList sessions={todaySessions} />
          </div>
        )}
        {pastSessions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Previous</h3>
            <SessionList sessions={pastSessions} />
          </div>
        )}
        {sessions.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No study sessions yet. Log your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}