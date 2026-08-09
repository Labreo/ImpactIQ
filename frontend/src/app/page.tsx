"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import RiskDashboard from "@/components/RiskDashboard";
import ConsequencePanel from "@/components/ConsequencePanel";
import AiBriefPanel from "@/components/AiBriefPanel";

// Three.js must be loaded client-side only (no SSR)
const OrbitView = dynamic(() => import("@/components/OrbitView"), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const QUICK_PICKS = [
  { label: "2010 FX9",  des: "2010 FX9"  },
  { label: "Apophis",   des: "Apophis"   },
  { label: "Bennu",     des: "Bennu"     },
];

export default function Home() {
  const [query,   setQuery]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [data,    setData]    = useState<null | Record<string, unknown>>(null);

  async function analyze(designation: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(
        `${API}/api/analyze/${encodeURIComponent(designation)}?n_samples=300`,
        { signal: AbortSignal.timeout(180_000) }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { detail?: string }).detail ?? `HTTP ${res.status}`);
      }
      setData(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold">Impact<span className="text-blue-400">IQ</span></span>
          <span className="ml-3 text-xs text-zinc-500 uppercase tracking-widest">Asteroid Impact Risk Predictor</span>
        </div>
        <span className="text-xs text-zinc-600">IBM AI Builders Challenge · August 2026</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Search */}
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-white">Analyze an Asteroid</h1>
          <p className="text-zinc-400 text-sm">Enter a name or JPL designation. Powered by real NASA/JPL data + IBM Granite.</p>
          <div className="flex gap-3">
            <input
              className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Apophis, 2010 FX9, Bennu…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && query.trim() && analyze(query.trim())}
            />
            <button
              onClick={() => query.trim() && analyze(query.trim())}
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-sm font-medium transition"
            >
              {loading ? "Analyzing…" : "Analyze"}
            </button>
          </div>

          {/* Quick picks */}
          <div className="flex gap-2">
            {QUICK_PICKS.map((p) => (
              <button key={p.des}
                onClick={() => { setQuery(p.des); analyze(p.des); }}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-blue-500 hover:text-blue-400 disabled:opacity-40 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">
            <div className="inline-block h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-zinc-400 text-sm">Running Monte Carlo · Computing risk scores · Generating AI brief…</p>
            <p className="text-zinc-600 text-xs mt-1">~30–60 seconds</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-800 bg-red-900/20 p-5 text-red-300 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {data && (() => {
          const d = data as {
            full_name: string;
            close_approach: { date: string; jpl_dist_au: number; velocity_kms: number; years_until: number };
            risk: Parameters<typeof RiskDashboard>[0]["risk"];
            monte_carlo: Parameters<typeof RiskDashboard>[0]["mc"];
            consequence: Parameters<typeof ConsequencePanel>[0]["data"];
            ai_brief: Parameters<typeof AiBriefPanel>[0]["brief"];
            orbit_path: { x: number; y: number; z: number }[];
          };
          return (
            <div className="space-y-6">
              {/* Object header */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <h2 className="text-xl font-semibold text-white">{d.full_name}</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Next close approach: <span className="text-white">{d.close_approach.date}</span>
                  {" · "}dist <span className="text-white">{d.close_approach.jpl_dist_au.toFixed(5)} AU</span>
                  {" · "}<span className="text-white">{d.close_approach.velocity_kms.toFixed(1)} km/s</span>
                  {" · "}<span className="text-zinc-400">in ~{d.close_approach.years_until.toFixed(2)} yrs</span>
                </p>
              </div>

              {/* 3D orbit */}
              <OrbitView orbitPath={d.orbit_path} />

              {/* Risk dashboard */}
              <RiskDashboard risk={d.risk} mc={d.monte_carlo} />

              {/* Consequence */}
              <ConsequencePanel data={d.consequence} />

              {/* AI brief */}
              <AiBriefPanel brief={d.ai_brief} />
            </div>
          );
        })()}

        {/* Empty state */}
        {!loading && !error && !data && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-10 text-center space-y-2">
            <p className="text-zinc-500 text-sm">Select an asteroid above or type a designation to begin.</p>
            <p className="text-zinc-600 text-xs">Data from NASA NeoWs · JPL SBDB · JPL CAD · JPL Sentry</p>
          </div>
        )}
      </main>
    </div>
  );
}
