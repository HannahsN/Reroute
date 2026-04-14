import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Plus, X, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const BUSINESS_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const VIEW_OPTIONS = [
  { label: "7 Days", value: "7" },
  { label: "Business", value: "5" },
  { label: "3 Days", value: "3" },
];

const BLOCK_STYLES = {
  study: { bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-300", dot: "bg-blue-400", label: "Study" },
  class: { bg: "bg-violet-500/20", border: "border-violet-500/40", text: "text-violet-300", dot: "bg-violet-400", label: "Class" },
  workout: { bg: "bg-teal-500/20", border: "border-teal-500/40", text: "text-teal-300", dot: "bg-teal-400", label: "Workout" },
  rest: { bg: "bg-slate-600/20", border: "border-slate-600/40", text: "text-slate-400", dot: "bg-slate-500", label: "Rest" },
  personal: { bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-300", dot: "bg-amber-400", label: "Personal" },
};

const DEFAULT_FORM = {
  title: "", day: "Monday", start_hour: 9, duration_hours: 1,
  block_type: "study", notes: "", recurring: true,
};

export default function WeeklyStructure() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [editId, setEditId] = useState(null);
  const [view, setView] = useState("7");

  const { data: blocks = [] } = useQuery({
    queryKey: ["scheduleBlocks"],
    queryFn: () => base44.entities.ScheduleBlock.list("day", 200),
  });

  const createBlock = useMutation({
    mutationFn: (data) => base44.entities.ScheduleBlock.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["scheduleBlocks"] }); resetForm(); },
  });

  const updateBlock = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScheduleBlock.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["scheduleBlocks"] }); resetForm(); },
  });

  const deleteBlock = useMutation({
    mutationFn: (id) => base44.entities.ScheduleBlock.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduleBlocks"] }),
  });

  const resetForm = () => { setShowForm(false); setForm(DEFAULT_FORM); setEditId(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, start_hour: Number(form.start_hour), duration_hours: Number(form.duration_hours) };
    if (editId) updateBlock.mutate({ id: editId, data });
    else createBlock.mutate(data);
  };

  const startEdit = (block) => {
    setForm({ title: block.title, day: block.day, start_hour: block.start_hour, duration_hours: block.duration_hours, block_type: block.block_type, notes: block.notes || "", recurring: block.recurring ?? true });
    setEditId(block.id);
    setShowForm(true);
  };

  const visibleDays = view === "5" ? BUSINESS_DAYS : view === "3" ? BUSINESS_DAYS.slice(0, 3) : ALL_DAYS;

  const blocksFor = (day) => blocks.filter(b => b.day === day).sort((a, b) => a.start_hour - b.start_hour);

  const formatHour = (h) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}${ampm}`;
  };

  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10">
            <CalendarDays className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Weekly Structure</h1>
            <p className="text-slate-400 text-sm">Design your recurring weekly schedule</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditId(null); setForm(DEFAULT_FORM); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4" /> Add Block
          </button>
        </div>
      </div>

      {/* Legend + View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {Object.entries(BLOCK_STYLES).map(([type, style]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={cn("w-2 h-2 rounded-full", style.dot)} />
              {style.label}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-sky-950/40 border border-sky-900/30 rounded-xl p-1">
          {VIEW_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setView(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                view === opt.value
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:text-sky-300"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-sky-950/20 border border-sky-900/30 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">{editId ? "Edit Block" : "Add Block"}</h3>
            <button onClick={resetForm} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Title</Label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Organic Chemistry" required className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Type</Label>
                <Select value={form.block_type} onValueChange={v => setForm(p => ({ ...p, block_type: v }))}>
                  <SelectTrigger className="bg-sky-950/50 border-sky-900/50 text-white h-10">
                   <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                   {Object.entries(BLOCK_STYLES).map(([v, s]) => (
                      <SelectItem key={v} value={v}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Day</Label>
                <Select value={form.day} onValueChange={v => setForm(p => ({ ...p, day: v }))}>
                  <SelectTrigger className="bg-sky-950/50 border-sky-900/50 text-white h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">Start Hour</Label>
                  <Select value={String(form.start_hour)} onValueChange={v => setForm(p => ({ ...p, start_hour: Number(v) }))}>
                    <SelectTrigger className="bg-sky-950/50 border-sky-900/50 text-white h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 17 }, (_, i) => i + 7).map(h => (
                        <SelectItem key={h} value={String(h)}>{formatHour(h)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">Duration (hrs)</Label>
                  <Select value={String(form.duration_hours)} onValueChange={v => setForm(p => ({ ...p, duration_hours: Number(v) }))}>
                    <SelectTrigger className="bg-sky-950/50 border-sky-900/50 text-white h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0.5, 1, 1.5, 2, 2.5, 3, 4].map(d => (
                        <SelectItem key={d} value={String(d)}>{d}h</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Notes (optional)</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes…" className="bg-sky-950/50 border-sky-900/50 text-white placeholder:text-slate-600 min-h-[60px] text-sm" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 h-10 text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-colors">
                {editId ? "Update" : "Add Block"}
              </button>
              <button type="button" onClick={resetForm} className="px-5 h-10 text-sm text-slate-400 hover:text-white bg-sky-950/50 border border-sky-900/30 rounded-xl transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Weekly grid */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${visibleDays.length}, minmax(130px, 1fr))` }}
        >
          {visibleDays.map(day => {
            const dayBlocks = blocksFor(day);
            return (
              <div key={day} className="bg-sky-950/20 border border-sky-900/30 rounded-2xl overflow-hidden">
                <div className="px-3 py-2.5 border-b border-sky-900/30 bg-sky-950/30 flex items-center justify-between">
                  <p className="text-xs font-semibold text-sky-300/80 uppercase tracking-widest">{day.slice(0, 3)}</p>
                  {dayBlocks.length > 0 && (
                    <span className="text-[10px] text-sky-700 font-medium">{dayBlocks.length}</span>
                  )}
                </div>
                <div className="p-1.5 space-y-1 min-h-[120px]">
                  {dayBlocks.length === 0 && (
                    <p className="text-[10px] text-sky-900/50 text-center py-8">—</p>
                  )}
                  {dayBlocks.map(block => {
                    const style = BLOCK_STYLES[block.block_type] || BLOCK_STYLES.study;
                    return (
                      <div
                        key={block.id}
                        onClick={() => startEdit(block)}
                        className="group relative flex items-start gap-2 px-2.5 py-2 rounded-xl cursor-pointer hover:bg-white/5 transition-all duration-150"
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1", style.dot)} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white leading-snug break-words">{block.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{formatHour(block.start_hour)}</p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); deleteBlock.mutate(block.id); }}
                          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all flex-shrink-0 mt-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}