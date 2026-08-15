"use client";
import { useState } from "react";
import ChatWidget from "./ChatWidget";

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
    } catch (err) {
      console.error("Probe error:", err);
    } finally {
      setProbing(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-5">
      {/* Header with Model & Guardian Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
          <h3 className="text-xs uppercase tracking-widest text-slate-300 font-bold">
            IBM Granite Mission Brief & Guardian Trust Spine
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 font-telemetry text-slate-400">
            Model: {brief.raw_model || "IBM Granite-8B"}
          </span>
          <span
            className={`px-3 py-1 rounded-md font-medium text-xs uppercase tracking-wider ${
              brief.guardian_ok
                ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                : "bg-amber-950/80 border border-amber-500/40 text-amber-300"
            }`}
          >
            {brief.guardian_ok ? "Granite Guardian Verified [PASS]" : "Guardian Flagged [AUDIT]"}
          </span>
        </div>
      </div>

      {/* Main Narrative Headline */}
      <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
        {brief.title}
      </h2>

      {/* Structured Sections */}
      <div className="space-y-3.5 text-sm">
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4">
          <p className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold mb-1">
            Executive Summary & Trajectory Assessment
          </p>
          <p className="text-slate-200 leading-relaxed font-sans">{brief.bottom_line || "—"}</p>
        </div>

        <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 p-4">
          <p className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold mb-1">
            Physical Consequence & Atmosphere Interaction
          </p>
          <p className="text-slate-300 leading-relaxed font-sans">{brief.if_it_happened || "—"}</p>
        </div>

        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Radar Observation Schedule & Astrometric Arc
          </p>
          <p className="text-slate-300 leading-relaxed font-sans">{brief.whats_next || "—"}</p>
        </div>
      </div>

      {/* Falsification Probe Console (Judges / Trust Audit) */}
      <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
            Guardian Falsification Audit Console
          </span>
          <span className="text-[11px] text-slate-500 font-telemetry">Active Guardrail Verification Against Ungrounded Statements</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => runProbe("ground_truth")}
            disabled={probing}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-600/40 text-emerald-300 text-xs font-semibold uppercase tracking-wider transition"
          >
            {probing ? "Auditing..." : "Audit Telemetry (Ground Truth)"}
          </button>
          <button
            onClick={() => runProbe("fabrication")}
            disabled={probing}
            className="px-3.5 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 border border-rose-600/40 text-rose-300 text-xs font-semibold uppercase tracking-wider transition"
          >
            {probing ? "Testing..." : "Inject Ungrounded Claim (Falsification Test)"}
          </button>
        </div>

        {probeResult && (
          <div
            className={`p-3.5 rounded-lg text-xs font-telemetry border ${
              probeResult.passed_audit
                ? "bg-emerald-950/50 border-emerald-500/30 text-emerald-200"
                : "bg-rose-950/50 border-rose-500/30 text-rose-200"
            }`}
          >
            <div className="flex justify-between font-bold uppercase tracking-wider">
              <span>Probe Result: {probeResult.guardian_response}</span>
              <span>{probeResult.passed_audit ? "AUDIT PASS" : "INTERCEPTED & FLAGGED"}</span>
            </div>
            <p className="mt-1.5 text-slate-300 normal-case">{probeResult.explanation}</p>
          </div>
        )}
      </div>

      {/* Follow-up Interactive RAG Chat */}
      <ChatWidget contextData={{ ...brief, ...asteroidContext }} />
    </div>
  );
}
