import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, CheckCircle2, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BiometricForm from "../components/biometrics/BiometricForm";
import ReadinessGauge from "../components/shared/ReadinessGauge";

export default function LogBiometrics() {
  const [savedScore, setSavedScore] = useState(null);
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["biometricEntries"],
    queryFn: () => base44.entities.BiometricEntry.list("-date", 30),
  });

  const todayEntry = entries.find(e => e.date === today);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BiometricEntry.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["biometricEntries"] });
      setSavedScore(data.readiness_score);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BiometricEntry.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["biometricEntries"] });
      setSavedScore(data.readiness_score);
    },
  });

  const handleSubmit = (formData) => {
    if (todayEntry) {
      updateMutation.mutate({ id: todayEntry.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Log Biometrics</h1>
            <p className="text-slate-400 text-sm">
              {todayEntry ? "Update today's readings" : "Enter today's Fitbit data"}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {savedScore !== null ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-10 backdrop-blur-sm text-center"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
            <p className="text-slate-400 text-sm uppercase tracking-wider mb-6">Your Cognitive Readiness</p>
            <div className="flex justify-center mb-6">
              <ReadinessGauge score={savedScore} size="lg" />
            </div>
            <button
              onClick={() => setSavedScore(null)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Edit readings
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 md:p-8 backdrop-blur-sm"
          >
            <BiometricForm
              onSubmit={handleSubmit}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              existingEntry={todayEntry}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}