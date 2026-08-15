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
        body: JSON.stringify({
          probe_type: probeType,
          context: asteroidContext || {},
        }),
      });
      const data = await res.json();
      setProbeResult(data);
      if (data.passed_audit) {
        playGuardianVerified();
      } else {
        playGuardianAlert();
      }
    } catch (err) {
      console.error("Probe error:", err);
    } finally {
      setProbing(false);
    }
  };

  return (
    <div className="nasa-panel corner-bracket rounded-xl p-5 space-y-4 shadow-2xl border border-slate-800">
      {/* Aerospace Telemetry Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-telemetry font-bold tracking-widest text-slate-300 uppercase">
            {"//"} SEC.02 {"//"} AUTONOMOUS AI FLIGHT DIRECTIVE
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-telemetry">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            ENGINE: {brief.raw_model ? brief.raw_model.split("/").pop() : "IBM Granite / watsonx"}
          </span>
          <span
            className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
              brief.guardian_ok
                ? "bg-emerald-950/90 border border-emerald-500/50 text-emerald-400"
                : "bg-amber-950/90 border border-amber-500/50 text-amber-400"
            }`}
          >
            {brief.guardian_ok ? "GUARDIAN: PASS" : "GUARDIAN: AUDIT"}
          </span>
        </div>
      </div>

      {/* Main Narrative Headline */}
      <div className="space-y-1">
        <span className="text-[9px] font-telemetry uppercase tracking-widest text-cyan-400 font-semibold block">
          OFFICIAL MISSION INTERPRETATION
        </span>
        <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
          {brief.title}
        </h2>
      </div>

      {/* Structured Telemetry Data Boxes */}
      <div className="space-y-3 text-xs">
        {/* Executive Summary */}
        <div className="rounded-lg bg-slate-950/80 border-l-2 border-l-cyan-500 border border-slate-800/80 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-telemetry text-slate-400 uppercase tracking-wider font-semibold">
            <span className="text-cyan-400">01. Orbit & Hazard Assessment</span>
            <span className="text-slate-500">TELEMETRY GROUNDED</span>
          </div>
          <p className="text-slate-200 leading-relaxed font-sans text-xs">{brief.bottom_line || "No baseline anomaly detected."}</p>
        </div>

        {/* Consequence Scenario */}
        <div className="rounded-lg bg-slate-950/80 border-l-2 border-l-amber-500 border border-slate-800/80 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-telemetry text-slate-400 uppercase tracking-wider font-semibold">
            <span className="text-amber-400">02. Atmosphere & Hydrodynamics</span>
            <span className="text-slate-500">COLLINS (2005) SCALED</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans text-xs">{brief.if_it_happened || "Theoretical consequence parameters calibrated."}</p>
        </div>

        {/* Astrometric Observation Plan */}
        <div className="rounded-lg bg-slate-950/80 border-l-2 border-l-blue-500 border border-slate-800/80 p-3.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-telemetry text-slate-400 uppercase tracking-wider font-semibold">
            <span className="text-blue-400">03. Astrometric Radar Pass</span>
            <span className="text-slate-500">DSN GOLDSTONE / ARECIBO ARC</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans text-xs">{brief.whats_next || "Routine optical follow-up scheduled."}</p>
        </div>
      </div>

      {/* Guardian Falsification Audit Sandbox */}
      <div className="rounded-lg bg-slate-950 border border-slate-800/90 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-slate-300 font-telemetry font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Guardian Falsification Probe</span>
          </span>
          <span className="text-[9px] text-slate-500 font-telemetry">Active Scientific Verification Spine</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => runProbe("ground_truth")}
            disabled={probing}
            className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 text-[10px] font-telemetry font-semibold uppercase tracking-wider transition cursor-pointer"
          >
            {probing ? "Probing..." : "Audit Ground Truth"}
          </button>
          <button
            onClick={() => runProbe("fabrication")}
            disabled={probing}
            className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 text-rose-300 text-[10px] font-telemetry font-semibold uppercase tracking-wider transition cursor-pointer"
          >
            {probing ? "Probing..." : "Inject Ungrounded Lie (Test)"}
          </button>
        </div>

        {probeResult && (
          <div
            className={`p-2.5 rounded text-[11px] font-telemetry border ${
              probeResult.passed_audit
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/60 border-rose-500/40 text-rose-200"
            }`}
          >
            <div className="flex justify-between font-bold uppercase tracking-wider">
              <span>Status: {probeResult.guardian_response}</span>
              <span>{probeResult.passed_audit ? "PASSED VERIFICATION" : "INTERCEPTED & FLAGGED"}</span>
            </div>
            <p className="mt-1 text-slate-300 normal-case font-sans text-xs">{probeResult.explanation}</p>
          </div>
        )}
      </div>

      {/* Grounded Flight Telemetry Chat */}
      <ChatWidget contextData={{ ...brief, ...asteroidContext }} />
    </div>
  );
}
