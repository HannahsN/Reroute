import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {Math.round(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function ReadinessTrendChart({ entries }) {
  const data = (entries || [])
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-14)
    .map(e => ({
      date: format(new Date(e.date), "MMM d"),
      Readiness: e.readiness_score || 0,
      HRV: e.heart_rate_variability || 0,
      Sleep: (e.sleep_duration || 0) * 10,
    }));

  if (!data.length) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-sm">Log biometric data to see trends</p>
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <defs>
            <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="hrvGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="Readiness" stroke="#3b82f6" strokeWidth={2} fill="url(#readinessGrad)" />
          <Area type="monotone" dataKey="HRV" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#hrvGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}