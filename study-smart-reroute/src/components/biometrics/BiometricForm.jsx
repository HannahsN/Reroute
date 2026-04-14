import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Heart, Activity, Moon, Footprints, Brain, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function calculateReadiness({ heart_rate_avg, heart_rate_variability, sleep_duration, sleep_quality, steps, stress_level }) {
  let score = 50;
  
  // HRV (higher is better, typical 20-100ms)
  if (heart_rate_variability) {
    if (heart_rate_variability >= 60) score += 15;
    else if (heart_rate_variability >= 40) score += 8;
    else if (heart_rate_variability < 25) score -= 10;
  }
  
  // Resting HR (lower is better, typical 50-90)
  if (heart_rate_avg) {
    if (heart_rate_avg <= 60) score += 10;
    else if (heart_rate_avg <= 72) score += 5;
    else if (heart_rate_avg > 85) score -= 10;
  }
  
  // Sleep duration (7-9 hrs optimal)
  if (sleep_duration) {
    if (sleep_duration >= 7 && sleep_duration <= 9) score += 12;
    else if (sleep_duration >= 6) score += 5;
    else score -= 12;
  }
  
  // Sleep quality
  if (sleep_quality) {
    score += ((sleep_quality - 50) / 50) * 10;
  }
  
  // Steps (moderate activity is good)
  if (steps) {
    if (steps >= 5000 && steps <= 12000) score += 5;
    else if (steps > 15000) score -= 3;
  }
  
  // Stress (lower is better)
  if (stress_level) {
    score -= (stress_level - 3) * 3;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

const fields = [
  { key: "heart_rate_avg", label: "Resting Heart Rate", icon: Heart, unit: "bpm", placeholder: "68", type: "number" },
  { key: "heart_rate_variability", label: "Heart Rate Variability", icon: Activity, unit: "ms", placeholder: "45", type: "number" },
  { key: "sleep_duration", label: "Sleep Duration", icon: Moon, unit: "hours", placeholder: "7.5", type: "number", step: "0.5" },
  { key: "sleep_quality", label: "Sleep Quality", icon: Moon, unit: "/ 100", placeholder: "75", type: "range", min: 0, max: 100 },
  { key: "steps", label: "Steps Today", icon: Footprints, unit: "steps", placeholder: "8000", type: "number" },
  { key: "stress_level", label: "Stress Level", icon: Brain, unit: "/ 10", placeholder: "4", type: "range", min: 1, max: 10 },
];

export default function BiometricForm({ onSubmit, isSubmitting, existingEntry }) {
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    heart_rate_avg: existingEntry?.heart_rate_avg || "",
    heart_rate_variability: existingEntry?.heart_rate_variability || "",
    sleep_duration: existingEntry?.sleep_duration || "",
    sleep_quality: existingEntry?.sleep_quality || 70,
    steps: existingEntry?.steps || "",
    stress_level: existingEntry?.stress_level || 4,
  });

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericForm = { ...form };
    fields.forEach(f => {
      if (numericForm[f.key] !== "" && numericForm[f.key] !== undefined) {
        numericForm[f.key] = Number(numericForm[f.key]);
      }
    });
    numericForm.readiness_score = calculateReadiness(numericForm);
    numericForm.source = "manual";
    onSubmit(numericForm);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fields.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.key} className={cn(
              "bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5",
              "hover:border-slate-600/50 transition-all duration-300"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-slate-700/50">
                  <Icon className="w-3.5 h-3.5 text-slate-300" />
                </div>
                <Label className="text-sm text-slate-300 font-medium">{f.label}</Label>
              </div>
              {f.type === "range" ? (
                <div className="space-y-2">
                  <Slider
                    value={[Number(form[f.key]) || f.min]}
                    min={f.min}
                    max={f.max}
                    step={1}
                    onValueChange={([v]) => handleChange(f.key, v)}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{f.min}</span>
                    <span className="text-white font-semibold text-sm">{form[f.key]}{f.unit ? ` ${f.unit}` : ''}</span>
                    <span>{f.max}</span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    type="number"
                    step={f.step || "1"}
                    value={form[f.key]}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 pr-14 h-11"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">{f.unit}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Calculate Readiness & Save
          </span>
        )}
      </Button>
    </form>
  );
}