"use client";

interface ConsequenceData {
  diameter_m: number;
  energy_mt: number;
  energy_hiroshima: number;
  airburst: boolean;
  airburst_altitude_km: number;
  crater_diameter_m: number;
  damage_category: string;
  damage_radius_km: number;
  impact_velocity_kms: number;
  disclaimer: string;
}

const SEVERITY_COLOR: Record<string, string> = {
  negligible:   "#525252",
  local:        "#f59e0b",
  regional:     "#f97316",
  continental:  "#ef4444",
  global:       "#fc3d21",
};

export default function ConsequencePanel({ data }: { data: ConsequenceData }) {
  const sevColor = SEVERITY_COLOR[data.damage_category] ?? "#f59e0b";

  return (
    <div>
      {/* Section label */}
      <div className="section-label" style={{ marginBottom: 16 }}>
        Impact Consequence Analysis
      </div>
      <p style={{ fontSize: 12, color: "#737373", marginBottom: 16 }}>
        Atmospheric entry dynamics, energy yield, and blast overpressure modeling
      </p>

      {/* Stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, border: "1px solid #1f1f1f", marginBottom: 16 }}>
        <div className="stat-block" style={{ border: "none", borderRight: "1px solid #1f1f1f", borderBottom: "1px solid #1f1f1f" }}>
          <div className="stat-label">Estimated Diameter</div>
          <div className="stat-value">{data.diameter_m.toFixed(0)} <span style={{ fontSize: 13, fontWeight: 400, color: "#737373" }}>m</span></div>
          <div className="stat-sub">{(data.diameter_m / 1000).toFixed(3)} km cross-section</div>
        </div>

        <div className="stat-block" style={{ border: "none", borderBottom: "1px solid #1f1f1f" }}>
          <div className="stat-label">Kinetic Energy Yield</div>
          <div className="stat-value" style={{ color: "#f59e0b" }}>
            {data.energy_mt < 1 ? data.energy_mt.toFixed(3) : data.energy_mt.toFixed(1)}{" "}
            <span style={{ fontSize: 13, fontWeight: 400, color: "#737373" }}>MT</span>
          </div>
          <div className="stat-sub">≈ {data.energy_hiroshima.toLocaleString(undefined, { maximumFractionDigits: 0 })}× Hiroshima</div>
        </div>

        <div className="stat-block" style={{ border: "none", borderRight: "1px solid #1f1f1f" }}>
          <div className="stat-label">Entry Mechanism</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{data.airburst ? "Airburst" : "Crater"}</div>
          <div className="stat-sub">
            {data.airburst
              ? `Disruption ~${data.airburst_altitude_km.toFixed(0)} km altitude`
              : `Transient crater ~${(data.crater_diameter_m / 1000).toFixed(1)} km`}
          </div>
        </div>

        <div className="stat-block" style={{ border: "none" }}>
          <div className="stat-label">Entry Velocity</div>
          <div className="stat-value">{data.impact_velocity_kms.toFixed(1)} <span style={{ fontSize: 13, fontWeight: 400, color: "#737373" }}>km/s</span></div>
          <div className="stat-sub">{(data.impact_velocity_kms * 3600).toFixed(0)} km/h</div>
        </div>
      </div>

      {/* Severity bar */}
      <div style={{
        padding: "14px 16px",
        backgroundColor: "#0d0d0d",
        border: "1px solid #1f1f1f",
        borderLeft: `3px solid ${sevColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#525252", marginBottom: 4 }}>
            Damage Category
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: sevColor, textTransform: "capitalize" }}>
            {data.damage_category}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#525252", marginBottom: 4 }}>
            Blast Overpressure Radius
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
            ~{data.damage_radius_km.toFixed(0)} km
          </div>
          <div style={{ fontSize: 10, color: "#525252" }}>1 psi window-breakage threshold</div>
        </div>
      </div>

      <p style={{ fontSize: 11, color: "#3d3d3d", marginTop: 10, lineHeight: 1.5 }}>{data.disclaimer}</p>
    </div>
  );
}
