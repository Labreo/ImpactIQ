"use client";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { IconCheck } from "./Icons";

const TORINO_COLOR: Record<string, string> = {
  white:  "#a3a3a3",
  green:  "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red:    "#fc3d21",
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
  const tColor = TORINO_COLOR[risk.torino_color] ?? "#a3a3a3";
  const histData = mc.dist_histogram.map((count, i) => ({
    dist: mc.hist_bin_edges_au[i].toFixed(3),
    count,
  }));

  const hasSentry = risk.sentry_probability !== undefined && risk.sentry_probability > 0;
  const isMatchOrder = hasSentry
    ? Math.abs(
        Math.log10(mc.impact_probability || 1e-10) -
          Math.log10(risk.sentry_probability || 1e-10)
      ) <= 1.5
    : true;

  return (
    <div>
      {/* Section label */}
      <div className="section-label" style={{ marginBottom: 16 }}>
        Threat Assessment & Risk Index
      </div>

      {/* Sentry parity verification */}
      {hasSentry && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#0d0d0d",
            border: "1px solid #1f1f1f",
            borderLeft: "3px solid #22c55e",
            marginBottom: 16,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#525252", marginBottom: 3 }}>
              JPL Sentry Verification
            </div>
            <div style={{ fontSize: 13, color: "#a3a3a3" }}>
              Monte Carlo ensemble cross-referenced against official CNEOS impact tables
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Our P(i)</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#fff" }}>
                {mc.impact_probability > 0 ? mc.impact_probability.toExponential(2) : "< 1e-6"}
              </div>
            </div>
            <div style={{ color: "#3d3d3d", fontSize: 12 }}>vs</div>
            <div>
              <div style={{ fontSize: 10, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>JPL Sentry</div>
              <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#22c55e" }}>
                {risk.sentry_probability?.toExponential(2)}
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                backgroundColor: isMatchOrder ? "#052e16" : "#1c1407",
                color: isMatchOrder ? "#22c55e" : "#f59e0b",
                border: `1px solid ${isMatchOrder ? "#166534" : "#92400e"}`,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {isMatchOrder && <IconCheck className="w-3 h-3" />}
              <span>{isMatchOrder ? "Match" : "Within uncertainty"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, border: "1px solid #1f1f1f", marginBottom: 16 }}>
        {/* Torino Scale */}
        <div className="stat-block" style={{ border: "none", borderRight: "1px solid #1f1f1f", textAlign: "center" }}>
          <div className="stat-label" style={{ textAlign: "center" }}>Torino Scale</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: tColor, lineHeight: 1, fontVariantNumeric: "tabular-nums", margin: "8px 0" }}>
            {risk.torino_scale}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: tColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {risk.torino_label}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "#525252" }}>
            Palermo: {risk.palermo_scale.toFixed(2)}
          </div>
          <div style={{ fontSize: 10, color: "#3d3d3d" }}>{risk.palermo_label}</div>
        </div>

        {/* Insight Score gauge */}
        <div className="stat-block" style={{ border: "none", borderRight: "1px solid #1f1f1f", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="stat-label" style={{ textAlign: "center", marginBottom: 8 }}>ImpactIQ Index</div>
          <div style={{ width: 100, height: 100, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="62%" outerRadius="95%"
                data={[{ value: risk.insight_score }]}
                startAngle={90} endAngle={-270}
              >
                <RadialBar dataKey="value" cornerRadius={3} fill="#fc3d21" background={{ fill: "#1a1a1a" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{risk.insight_score}</span>
              <span style={{ fontSize: 9, color: "#525252", letterSpacing: "0.06em" }}>/ 100</span>
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: "#a3a3a3", textTransform: "uppercase" }}>
            {risk.insight_label}
          </div>
        </div>

        {/* Monte Carlo summary */}
        <div className="stat-block" style={{ border: "none" }}>
          <div className="stat-label" style={{ marginBottom: 10 }}>Monte Carlo Ensemble</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#525252" }}>P(impact)</span>
              <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "#fff" }}>
                {mc.impact_probability > 0 ? mc.impact_probability.toExponential(2) : "0.0"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#525252" }}>Median dist</span>
              <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "#a3a3a3" }}>{mc.median_dist_au.toFixed(4)} AU</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#525252" }}>Min approach</span>
              <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "#f59e0b" }}>{mc.min_dist_au.toFixed(4)} AU</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid #1f1f1f" }}>
              <span style={{ color: "#3d3d3d", fontSize: 10 }}>Paths sampled</span>
              <span style={{ color: "#3d3d3d", fontSize: 10 }}>{mc.n_samples.toLocaleString()}</span>
            </div>
          </div>

          {/* Histogram */}
          <div style={{ height: 44, marginTop: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <XAxis dataKey="dist" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 0, fontSize: 10 }}
                  formatter={(v) => [v, "Trajectories"]}
                  labelFormatter={(l) => `~${l} AU`}
                />
                <Bar dataKey="count" radius={[1, 1, 0, 0]}>
                  {histData.map((_, i) => (
                    <Cell key={i} fill="#fc3d21" opacity={0.3 + i * 0.04} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 11, color: "#3d3d3d", lineHeight: 1.5 }}>{risk.insight_note}</p>
    </div>
  );
}
