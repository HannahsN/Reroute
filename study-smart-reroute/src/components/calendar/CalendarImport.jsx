import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS_MAP = {
  0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday",
  4: "Thursday", 5: "Friday", 6: "Saturday"
};

function parseICS(text) {
  const events = [];
  const eventBlocks = text.split("BEGIN:VEVENT").slice(1);

  for (const block of eventBlocks) {
    const get = (key) => {
      const match = block.match(new RegExp(`${key}[^:]*:(.+)`, "i"));
      return match ? match[1].trim() : null;
    };

    const summary = get("SUMMARY");
    const dtstart = get("DTSTART");

    if (!summary || !dtstart) continue;

    // Parse date/time
    const dateStr = dtstart.replace(/T\d+Z?$/, "").replace(/-/g, "");
    if (dateStr.length < 8) continue;

    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6)) - 1;
    const day = parseInt(dateStr.slice(6, 8));
    const date = new Date(year, month, day);
    const dayName = DAYS_MAP[date.getDay()];

    // Parse start hour
    let startHour = 9;
    const timeMatch = dtstart.match(/T(\d{2})/);
    if (timeMatch) startHour = Math.min(23, Math.max(7, parseInt(timeMatch[1])));

    // Parse duration
    let durationHours = 1;
    const dtend = get("DTEND");
    if (dtend) {
      const endMatch = dtend.match(/T(\d{2})(\d{2})/);
      const startMatch = dtstart.match(/T(\d{2})(\d{2})/);
      if (endMatch && startMatch) {
        const endMins = parseInt(endMatch[1]) * 60 + parseInt(endMatch[2]);
        const startMins = parseInt(startMatch[1]) * 60 + parseInt(startMatch[2]);
        const diff = (endMins - startMins) / 60;
        if (diff > 0 && diff <= 8) durationHours = diff;
      }
    }

    // Guess block type from summary
    const lower = summary.toLowerCase();
    let block_type = "personal";
    if (/class|lecture|seminar|lab|course/.test(lower)) block_type = "class";
    else if (/study|review|homework|assignment|exam|quiz/.test(lower)) block_type = "study";
    else if (/gym|workout|run|yoga|sport|exercise|swim/.test(lower)) block_type = "workout";
    else if (/rest|sleep|break|nap/.test(lower)) block_type = "rest";

    events.push({ title: summary, day: dayName, start_hour: startHour, duration_hours: durationHours, block_type, recurring: false });
  }

  return events;
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));

  const events = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map(c => c.trim().replace(/"/g, ""));
    const row = {};
    headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });

    const subject = row["subject"] || row["summary"] || row["title"] || row["event name"] || "";
    const startStr = row["start date"] || row["start"] || row["date"] || "";
    const startTimeStr = row["start time"] || "";

    if (!subject || !startStr) continue;

    const date = new Date(startStr);
    if (isNaN(date.getTime())) continue;

    const dayName = DAYS_MAP[date.getDay()];
    let startHour = 9;
    if (startTimeStr) {
      const t = startTimeStr.match(/(\d+):(\d+)\s*(am|pm)?/i);
      if (t) {
        let h = parseInt(t[1]);
        if (t[3]?.toLowerCase() === "pm" && h < 12) h += 12;
        if (t[3]?.toLowerCase() === "am" && h === 12) h = 0;
        startHour = Math.min(23, Math.max(7, h));
      }
    }

    const lower = subject.toLowerCase();
    let block_type = "personal";
    if (/class|lecture|seminar|lab|course/.test(lower)) block_type = "class";
    else if (/study|review|homework|exam|quiz/.test(lower)) block_type = "study";
    else if (/gym|workout|run|yoga|exercise/.test(lower)) block_type = "workout";
    else if (/rest|sleep|break/.test(lower)) block_type = "rest";

    events.push({ title: subject, day: dayName, start_hour: startHour, duration_hours: 1, block_type, recurring: false });
  }

  return events;
}

export default function CalendarImport({ onClose }) {
  const qc = useQueryClient();
  const fileRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const importMutation = useMutation({
    mutationFn: (events) => base44.entities.ScheduleBlock.bulkCreate(events),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduleBlocks"] });
      setPreview(p => ({ ...p, imported: true }));
    },
  });

  const processFile = (file) => {
    setError(null);
    setPreview(null);
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["ics", "csv"].includes(ext)) {
      setError("Please upload a .ics or .csv file exported from Google Calendar.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const events = ext === "ics" ? parseICS(text) : parseCSV(text);
      if (!events.length) {
        setError("No events found in this file. Make sure it's a valid Google Calendar export.");
        return;
      }
      setPreview({ events, fileName: file.name, imported: false });
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const BLOCK_COLORS = {
    study: "bg-sky-500/20 text-sky-300",
    class: "bg-indigo-500/20 text-indigo-300",
    workout: "bg-teal-500/20 text-teal-300",
    rest: "bg-slate-500/20 text-slate-300",
    personal: "bg-amber-500/20 text-amber-300",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0a1628] border border-sky-900/40 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold text-lg">Import from Google Calendar</h2>
            <p className="text-slate-400 text-xs mt-0.5">Upload a .ics or .csv export</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* How-to */}
        <div className="flex gap-2 bg-sky-950/40 border border-sky-800/30 rounded-2xl p-3 mb-5">
          <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-sky-300/80 leading-relaxed">
            In Google Calendar: <strong>Settings → Import & Export → Export</strong>, then upload the downloaded <code>.ics</code> file below. Or export as <code>.csv</code> from Outlook/Apple Calendar.
          </p>
        </div>

        {!preview ? (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200",
                dragOver
                  ? "border-sky-400 bg-sky-500/10"
                  : "border-slate-700 hover:border-sky-600/50 hover:bg-sky-950/30"
              )}
            >
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
              <p className="text-sm text-slate-300 font-medium">Drop your file here</p>
              <p className="text-xs text-slate-500 mt-1">or click to browse — .ics or .csv</p>
              <input ref={fileRef} type="file" accept=".ics,.csv" className="hidden" onChange={handleFile} />
            </div>

            {error && (
              <div className="flex gap-2 mt-4 bg-rose-950/30 border border-rose-800/30 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300">{error}</p>
              </div>
            )}
          </>
        ) : preview.imported ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-10 h-10 text-teal-400 mx-auto mb-3" />
            <p className="text-white font-semibold">Import complete!</p>
            <p className="text-slate-400 text-sm mt-1">{preview.events.length} events added to your Weekly Structure</p>
            <button onClick={onClose} className="mt-5 px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-sky-400" />
              <p className="text-sm text-slate-300">{preview.fileName} — <span className="text-sky-400">{preview.events.length} events found</span></p>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1.5 mb-5 pr-1">
              {preview.events.map((ev, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0", BLOCK_COLORS[ev.block_type])}>
                    {ev.block_type}
                  </span>
                  <span className="text-xs text-white truncate flex-1">{ev.title}</span>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">{ev.day.slice(0,3)}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => importMutation.mutate(preview.events)}
                disabled={importMutation.isPending}
                className="flex-1 h-10 text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-colors disabled:opacity-60"
              >
                {importMutation.isPending ? "Importing…" : `Import ${preview.events.length} Events`}
              </button>
              <button onClick={() => setPreview(null)} className="px-4 h-10 text-sm text-slate-400 bg-slate-800/50 rounded-xl hover:text-white transition-colors">
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}