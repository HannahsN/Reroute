import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2, Plus } from "lucide-react";
import { format } from "date-fns";

const sessionTypes = [
  { value: "deep_focus", label: "Deep Focus" },
  { value: "active_recall", label: "Active Recall" },
  { value: "light_review", label: "Light Review" },
  { value: "practice_problems", label: "Practice Problems" },
  { value: "creative_work", label: "Creative Work" },
  { value: "rest", label: "Rest / Recovery" },
];

export default function SessionForm({ onSubmit, isSubmitting, readinessScore }) {
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    subject: "",
    session_type: "",
    duration_minutes: "",
    effectiveness_rating: 3,
    notes: "",
    readiness_score_at_start: readinessScore || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      duration_minutes: Number(form.duration_minutes),
      effectiveness_rating: Number(form.effectiveness_rating),
    });
    setForm(prev => ({ ...prev, subject: "", session_type: "", duration_minutes: "", notes: "", effectiveness_rating: 3 }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-slate-300">Subject</Label>
          <Input
            value={form.subject}
            onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="e.g. Organic Chemistry"
            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 h-11"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-slate-300">Session Type</Label>
          <Select value={form.session_type} onValueChange={(v) => setForm(prev => ({ ...prev, session_type: v }))}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-11">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {sessionTypes.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-slate-300">Duration (minutes)</Label>
          <Input
            type="number"
            value={form.duration_minutes}
            onChange={(e) => setForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
            placeholder="45"
            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 h-11"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-slate-300">Effectiveness ({form.effectiveness_rating}/5)</Label>
          <Slider
            value={[form.effectiveness_rating]}
            min={1} max={5} step={1}
            onValueChange={([v]) => setForm(prev => ({ ...prev, effectiveness_rating: v }))}
            className="py-3"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-slate-300">Notes (optional)</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="How did the session go?"
          className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 min-h-[80px]"
        />
      </div>
      <Button
        type="submit"
        disabled={isSubmitting || !form.subject || !form.session_type}
        className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Log Session</span>
        )}
      </Button>
    </form>
  );
}