"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CompareObject {
  designation: string;
  fullname: string;
  ip: number;
  energy_mt: number;
  torino_scale: number;
  palermo_scale: number;
  insight_score: number;
  insight_label: string;
}

export default function CompareDashboard({ onSelect }: { onSelect: (des: string) => void }) {
  const [data, setData] = useState<CompareObject[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/compare`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div style={{ padding: "24px 0", color: "#525252", fontSize: 12, textAlign: "center" }}>
        Loading Sentry impact monitoring data…
      </div>
    );

  if (!data || data.length === 0) return null;

  return (
    <div>
      {/* Section label */}
      <div className="section-label" style={{ marginBottom: 16 }}>
        Sentry Threat Monitoring Table
      </div>
      <p style={{ fontSize: 12, color: "#525252", marginBottom: 16 }}>
        Top near-Earth objects from JPL Sentry impact monitoring system — click any row to load full analysis.
      </p>

      <div style={{ border: "1px solid #1f1f1f", overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Object</th>
              <th>Impact P(i)</th>
              <th>Energy yield</th>
              <th>Torino</th>
              <th>Palermo</th>
              <th>ImpactIQ Index</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((obj) => (
              <tr
                key={obj.designation}
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(obj.designation)}
              >
                <td>
                  <div style={{ fontWeight: 600, color: "#ffffff", fontSize: 13 }}>
                    {obj.fullname || obj.designation}
                  </div>
                  <div style={{ fontSize: 10, color: "#3d3d3d", fontFamily: "var(--font-mono)", marginTop: 1 }}>
                    {obj.designation}
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: "var(--font-mono)", color: obj.ip > 1e-4 ? "#f59e0b" : "#a3a3a3", fontWeight: 600 }}>
                    {obj.ip.toExponential(2)}
                  </span>
                </td>
                <td>
                  <span style={{ color: "#a3a3a3" }}>
                    {obj.energy_mt.toFixed(1)} MT
                  </span>
                </td>
                <td>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: obj.torino_scale > 0 ? "#f59e0b" : "#3d3d3d",
                  }}>
                    {obj.torino_scale}
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#525252" }}>
                    {obj.palermo_scale.toFixed(2)}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, color: "#fff" }}>{obj.insight_score}</span>
                    <span style={{ fontSize: 10, color: "#3d3d3d", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {obj.insight_label}
                    </span>
                  </div>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelect(obj.designation); }}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "5px 12px",
                      backgroundColor: "transparent",
                      border: "1px solid #2a2a2a",
                      color: "#525252",
                      cursor: "pointer",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#fc3d21";
                      e.currentTarget.style.color = "#fc3d21";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#2a2a2a";
                      e.currentTarget.style.color = "#525252";
                    }}
                  >
                    Analyze
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
