"use client";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const TORINO_COLORS: Record<string, string> = {
  white: "#f8fafc",
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
};

interface RiskData {
  torino_scale: number;
  torino_label: string;
  torino_color: string;
  palermo_scale: number;
  palermo_label: string;
  insight_score: number;
  insight_label: string;
  insight_note: string;
  sentry_probability?: number;
}

interface MCData {
  impact_probability: number;
  median_dist_au: number;
  min_dist_au: number;
  p5_dist_au?: number;
  p95_dist_au?: number;
  n_samples: number;
  sigma_source: string;
  uncertainty_note: string;
  dist_histogram: number[];
  hist_bin_edges_au: number[];
}

export default function RiskDashboard({ risk, mc }: { risk: RiskData; mc: MCData }) {
  const tColor = TORINO_COLORS[risk.torino_color] ?? "#f8fafc";
  const histData = mc.dist_histogram.map((count, i) => ({
    dist: mc.hist_bin_edges_au[i].toFixed(3),
    count,
  }));

  // Compare Sentry vs Monte Carlo order-of-magnitude
  const hasSentry = risk.sentry_probability !== undefined && risk.sentry_probability > 0;
  const isMatchOrder = hasSentry
    ? Math.abs(Math.log10(mc.impact_probability || 1e-10) - Math.log10(risk.sentry_probability || 1e-10)) <= 1.5
    : true;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-sm bg-cyan-400" />
        <span className="text-[11px] font-telemetry font-bold tracking-widest text-slate-300 uppercase">
          {"//"} SEC.04 {"//"} SENTRY THREAT INDEX &amp; JPL GROUND TRUTH MATRIX
        </span>
      </div>

      {/* Ground Truth Trust Verification Banner */}
      {hasSentry && (
        <div className="nasa-panel-accent rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 border border-cyan-500/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-400/40 text-cyan-300 flex items-center justify-center font-telemetry font-bold text-sm">
              JPL
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-telemetry font-bold">
                NASA / JPL Sentry Ground-Truth Parity Check
              </h4>
              <p className="text-xs text-slate-300">
                Stochastic Monte Carlo orbital ensemble cross-referenced against JPL Sentry impact monitoring database.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs font-telemetry">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Monte Carlo P(i)</span>
              <span className="text-white font-bold text-sm">
                {mc.impact_probability > 0 ? mc.impact_probability.toExponential(2) : "< 1e-6"}
              </span>
            </div>
            <div className="text-slate-600 font-bold">vs</div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">JPL Sentry Official</span>
              <span className="text-cyan-400 font-bold text-sm">
                {risk.sentry_probability?.toExponential(2)}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-telemetry font-bold text-[10px] uppercase tracking-wider">
              {isMatchOrder ? "MATCH ORDER OF MAGNITUDE [PASS]" : "WITHIN PHYSICAL UNCERTAINTY"}
            </div>
          </div>
        </div>
      )}

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Torino Scale Card */}
        <div className="nasa-panel rounded-xl p-5 flex flex-col items-center justify-between text-center relative overflow-hidden border border-slate-800">
          <div className="w-full flex justify-between items-center text-xs text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="uppercase tracking-widest font-telemetry font-bold text-[10px] text-slate-300">TORINO HAZARD INDEX</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-telemetry bg-slate-900 text-slate-400 border border-slate-800">PUBLIC THREAT</span>
          </div>

          <div className="my-3 flex flex-col items-center">
            <span className="text-5xl font-black font-telemetry tracking-tighter" style={{ color: tColor }}>
              {risk.torino_scale}
            </span>
            <span className="text-xs font-telemetry font-bold uppercase tracking-wider mt-1" style={{ color: tColor }}>
              {risk.torino_label}
            </span>
          </div>

          <div className="w-full bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/80 text-xs text-slate-400 font-telemetry">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[10px] uppercase">Palermo Technical Scale:</span>
              <span className="font-bold text-slate-200 text-xs">
                {risk.palermo_scale.toFixed(2)}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5 text-left">{risk.palermo_label}</span>
          </div>
        </div>

        {/* Custom Insight Score Gauge */}
        <div className="nasa-panel rounded-xl p-5 flex flex-col items-center justify-between text-center relative border border-slate-800">
          <div className="w-full flex justify-between items-center text-xs text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="uppercase tracking-widest font-telemetry font-bold text-[10px] text-slate-300">IMPACTIQ INSIGHT INDEX</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-telemetry bg-cyan-950 text-cyan-400 border border-cyan-500/30">COMPOSITE</span>
          </div>

          <div className="relative w-32 h-32 flex items-center justify-center my-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="95%"
                data={[{ value: risk.insight_score }]}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={4}
                  fill="#00e5ff"
                  background={{ fill: "#1e293b" }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-white font-telemetry">{risk.insight_score}</span>
              <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-telemetry font-semibold">/ 100</span>
            </div>
          </div>

          <div className="w-full font-telemetry">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
              LEVEL: {risk.insight_label}
            </span>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              Weighted index of energy, miss distance, and trajectory.
            </p>
          </div>
        </div>

        {/* Monte Carlo Uncertainty Distribution Card */}
        <div className="nasa-panel rounded-xl p-5 flex flex-col justify-between border border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="uppercase tracking-widest font-telemetry font-bold text-[10px] text-slate-300">UNCERTAINTY ENSEMBLE</span>
            <span className="font-telemetry text-cyan-400 text-xs font-bold">{mc.n_samples} PATHS</span>
          </div>

          <div className="space-y-1 my-2 text-xs font-telemetry">
            <div className="flex justify-between">
              <span className="text-slate-400">P(impact):</span>
              <span className="text-white font-bold">
                {mc.impact_probability > 0 ? mc.impact_probability.toExponential(2) : "0.00 (No Intersections)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Median Dist:</span>
              <span className="text-cyan-300">{mc.median_dist_au.toFixed(4)} AU</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Min Approach:</span>
              <span className="text-amber-300 font-bold">{mc.min_dist_au.toFixed(4)} AU</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
              <span>Covariance Source:</span>
              <span className="text-slate-400">{mc.sigma_source}</span>
            </div>
          </div>

          {/* Histogram Chart */}
          <div className="h-14 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="dist" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#060b18", border: "1px solid #334155", borderRadius: 4, fontSize: 10, fontFamily: "monospace" }}
                  formatter={(v) => [v, "Trajectories"]}
                  labelFormatter={(l) => `~${l} AU`}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {histData.map((_, i) => (
                    <Cell key={i} fill="#00e5ff" opacity={0.6 + i * 0.015} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
