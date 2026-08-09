"use client";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const TORINO_COLORS: Record<string, string> = {
  white: "#f9fafb", green: "#22c55e", yellow: "#eab308", orange: "#f97316", red: "#ef4444",
};

interface RiskData {
  torino_scale: number; torino_label: string; torino_color: string;
  palermo_scale: number; palermo_label: string;
  insight_score: number; insight_label: string; insight_note: string;
}
interface MCData {
  impact_probability: number; median_dist_au: number; min_dist_au: number;
  n_samples: number; sigma_source: string; uncertainty_note: string;
  dist_histogram: number[]; hist_bin_edges_au: number[];
}

export default function RiskDashboard({ risk, mc }: { risk: RiskData; mc: MCData }) {
  const tColor = TORINO_COLORS[risk.torino_color] ?? "#f9fafb";
  const histData = mc.dist_histogram.map((count, i) => ({
    dist: mc.hist_bin_edges_au[i].toFixed(3),
    count,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Torino */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-zinc-500">Torino Scale</span>
        <span className="text-6xl font-bold" style={{ color: tColor }}>{risk.torino_scale}</span>
        <span className="text-sm font-medium" style={{ color: tColor }}>{risk.torino_label}</span>
        <span className="text-xs text-zinc-500 text-center mt-1">Palermo: {risk.palermo_scale} — {risk.palermo_label}</span>
      </div>

      {/* Insight Score */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-zinc-500">Insight Score</span>
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
              data={[{ value: risk.insight_score }]} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={6} fill="#3b82f6" background={{ fill: "#27272a" }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <span className="text-2xl font-bold text-white -mt-4">{risk.insight_score}</span>
        <span className="text-sm text-blue-400">{risk.insight_label}</span>
        <span className="text-xs text-zinc-600 text-center">{risk.insight_note.slice(0, 80)}…</span>
      </div>

      {/* Monte Carlo */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-3">
        <span className="text-xs uppercase tracking-widest text-zinc-500">Monte Carlo ({mc.n_samples} samples)</span>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-400">P(impact)</span>
            <span className="text-white font-mono">{mc.impact_probability.toExponential(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Min dist</span>
            <span className="text-white font-mono">{mc.min_dist_au.toFixed(5)} AU</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Median dist</span>
            <span className="text-white font-mono">{mc.median_dist_au.toFixed(5)} AU</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Sigma source</span>
            <span className="text-zinc-300 text-xs">{mc.sigma_source}</span>
          </div>
        </div>
        {/* Histogram */}
        <div className="h-20 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="dist" hide />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "#18181b", border: "none", fontSize: 11 }}
                formatter={(v) => [v, "samples"]} labelFormatter={(l) => `~${l} AU`} />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {histData.map((_, i) => <Cell key={i} fill="#3b82f6" opacity={0.7 + i * 0.01} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
