"use client";
import ChatWidget from "./ChatWidget";
import { IconCheck, IconShieldAlert } from "./Icons";

interface BriefData {
  title: string;
  bottom_line: string;
  if_it_happened: string;
  whats_next: string;
  guardian_ok: boolean;
  raw_model: string;
}

export default function AiBriefPanel({
  brief,
  asteroidContext,
}: {
  brief: BriefData;
  asteroidContext?: Record<string, unknown>;
}) {
  const modelName = brief.raw_model
    ? brief.raw_model.split("/").pop()?.replace(/-\d{4}-\d{2}-\d{2}$/, "") || "IBM Granite"
    : "IBM Granite";

  return (
    <div>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div className="section-label">AI Analysis — IBM Granite</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
            textTransform: "uppercase", padding: "3px 8px",
            backgroundColor: "#0d0d0d", border: "1px solid #2a2a2a",
            color: "#737373", fontFamily: "var(--font-mono)",
          }}>
            {modelName}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase", padding: "3px 10px",
            backgroundColor: brief.guardian_ok ? "#052e16" : "#1c1407",
            border: `1px solid ${brief.guardian_ok ? "#166534" : "#92400e"}`,
            color: brief.guardian_ok ? "#22c55e" : "#f59e0b",
            display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            {brief.guardian_ok ? <IconCheck className="w-3 h-3" /> : <IconShieldAlert className="w-3 h-3" />}
            <span>{brief.guardian_ok ? "Verified" : "Review Required"}</span>
          </span>
        </div>
      </div>

      {/* Main headline */}
      <div style={{
        padding: "20px",
        backgroundColor: "#0d0d0d",
        border: "1px solid #1f1f1f",
        marginBottom: 16,
        borderLeft: "3px solid #fc3d21",
      }}>
        <div style={{ fontSize: 11, color: "#525252", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 8 }}>
          Mission Assessment
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px", lineHeight: 1.3, margin: 0, color: "#fff" }}>
          {brief.title}
        </h3>
      </div>

      {/* Analysis sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1, border: "1px solid #1f1f1f", marginBottom: 20 }}>
        {/* Orbit & hazard */}
        <div style={{ padding: "16px", backgroundColor: "#0d0d0d" }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#525252", marginBottom: 8 }}>
            01 — Orbit & Hazard Assessment
          </div>
          <p style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.65, margin: 0 }}>
            {brief.bottom_line || "No baseline anomaly detected."}
          </p>
        </div>

        <div style={{ height: 1, backgroundColor: "#1a1a1a" }} />

        {/* Consequence */}
        <div style={{ padding: "16px", backgroundColor: "#0d0d0d" }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#525252", marginBottom: 8 }}>
            02 — Atmosphere & Hydrodynamics
          </div>
          <p style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.65, margin: 0 }}>
            {brief.if_it_happened || "Theoretical consequence parameters calibrated."}
          </p>
        </div>

        <div style={{ height: 1, backgroundColor: "#1a1a1a" }} />

        {/* Observation plan */}
        <div style={{ padding: "16px", backgroundColor: "#0d0d0d" }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#525252", marginBottom: 8 }}>
            03 — Astrometric Radar & Tracking Plan
          </div>
          <p style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.65, margin: 0 }}>
            {brief.whats_next || "Routine optical follow-up scheduled."}
          </p>
        </div>
      </div>

      {/* Grounded Interactive Q&A Terminal */}
      <ChatWidget contextData={{ ...brief, ...asteroidContext }} />
    </div>
  );
}
