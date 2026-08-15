"use client";
import { useState } from "react";
import ChatWidget from "./ChatWidget";
import { playTelemetryClick, playGuardianVerified, playGuardianAlert } from "@/utils/audioFx";

interface BriefData {
  title: string;
  bottom_line: string;
  if_it_happened: string;
  whats_next: string;
  guardian_ok: boolean;
  raw_model: string;
}

interface ProbeResultData {
  probe_type: string;
  tested_brief: { title: string; bottom_line: string; if_it_happened: string; whats_next: string };
  guardian_response: string;
  passed_audit: boolean;
  explanation: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AiBriefPanel({
  brief,
  asteroidContext,
}: {
  brief: BriefData;
  asteroidContext?: Record<string, unknown>;
}) {
  const [probeResult, setProbeResult] = useState<ProbeResultData | null>(null);
  const [probing, setProbing] = useState(false);

  const runProbe = async (probeType: "ground_truth" | "fabrication") => {
    playTelemetryClick();
    setProbing(true);
    setProbeResult(null);
    try {
      const res = await fetch(`${API}/api/probe/guardian`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ probe_type: probeType, context: asteroidContext || {} }),
      });
      const data = await res.json();
      setProbeResult(data);
      if (data.passed_audit) playGuardianVerified();
      else playGuardianAlert();
    } catch (err) {
      console.error("Probe error:", err);
    } finally {
      setProbing(false);
    }
  };

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
            color: "#525252", fontFamily: "var(--font-mono)",
          }}>
            {modelName}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase", padding: "3px 10px",
            backgroundColor: brief.guardian_ok ? "#052e16" : "#1c1407",
            border: `1px solid ${brief.guardian_ok ? "#166534" : "#92400e"}`,
            color: brief.guardian_ok ? "#22c55e" : "#f59e0b",
          }}>
            {brief.guardian_ok ? "✓ Verified" : "⚠ Review"}
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
      <div style={{ display: "flex", flexDirection: "column", gap: 1, border: "1px solid #1f1f1f", marginBottom: 16 }}>
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
            03 — Astrometric Radar Pass
          </div>
          <p style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.65, margin: 0 }}>
            {brief.whats_next || "Routine optical follow-up scheduled."}
          </p>
        </div>
      </div>

      {/* Guardian audit sandbox */}
      <div style={{ padding: "16px", backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#525252", marginBottom: 3 }}>
              Guardian Verification Probe
            </div>
            <div style={{ fontSize: 12, color: "#3d3d3d" }}>
              Test the AI output for factual grounding vs. fabrication
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => runProbe("ground_truth")}
            disabled={probing}
            style={{
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              border: "1px solid #166534",
              backgroundColor: "#052e16",
              color: "#22c55e",
              cursor: probing ? "not-allowed" : "pointer",
              opacity: probing ? 0.6 : 1,
              letterSpacing: "0.03em",
            }}
          >
            {probing ? "Running audit…" : "Audit Ground Truth"}
          </button>
          <button
            onClick={() => runProbe("fabrication")}
            disabled={probing}
            style={{
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              border: "1px solid #7f1d1d",
              backgroundColor: "#1c0a0a",
              color: "#f87171",
              cursor: probing ? "not-allowed" : "pointer",
              opacity: probing ? 0.6 : 1,
              letterSpacing: "0.03em",
            }}
          >
            {probing ? "Running…" : "Inject Fabrication Test"}
          </button>
        </div>

        {probeResult && (
          <div style={{
            marginTop: 12,
            padding: "12px",
            backgroundColor: probeResult.passed_audit ? "#052e16" : "#1c0a0a",
            border: `1px solid ${probeResult.passed_audit ? "#166534" : "#7f1d1d"}`,
            fontSize: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginBottom: 6, color: probeResult.passed_audit ? "#22c55e" : "#f87171", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11 }}>
              <span>{probeResult.guardian_response}</span>
              <span>{probeResult.passed_audit ? "VERIFIED" : "FLAGGED"}</span>
            </div>
            <p style={{ margin: 0, color: "#a3a3a3", lineHeight: 1.5 }}>{probeResult.explanation}</p>
          </div>
        )}
      </div>

      {/* Chat Q&A */}
      <ChatWidget contextData={{ ...brief, ...asteroidContext }} />
    </div>
  );
}
