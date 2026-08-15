"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import RiskDashboard from "@/components/RiskDashboard";
import ConsequencePanel from "@/components/ConsequencePanel";
import AiBriefPanel from "@/components/AiBriefPanel";
import CompareDashboard from "@/components/CompareDashboard";

// Dynamic import for Three.js 3D Viewport (client side only)
const OrbitView = dynamic(() => import("@/components/OrbitView"), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface SentryApiItem {
  fullname?: string;
  des: string;
}

interface NeoWsApiItem {
  name: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeDes, setActiveDes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<null | Record<string, unknown>>(null);
  const [sentryPicks, setSentryPicks] = useState<{ label: string; des: string }[]>([]);
  const [neoPicks, setNeoPicks] = useState<{ label: string; des: string }[]>([]);
  const [outreachMode, setOutreachMode] = useState(false);
  const [perturbedMode, setPerturbedMode] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/sentry`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data && Array.isArray(data.data)) {
          const top = (data.data as SentryApiItem[]).slice(0, 5).map((item) => ({
            label: item.fullname || item.des,
            des: item.des,
          }));
          setSentryPicks(top);
        }
      })
      .catch((err) => console.error("Failed to fetch Sentry list:", err));

    fetch(`${API}/api/neo/browse`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.near_earth_objects && Array.isArray(data.near_earth_objects)) {
          const top = (data.near_earth_objects as NeoWsApiItem[]).slice(0, 5).map((item) => {
            const desMatch = item.name.match(/\((.*?)\)/);
            const des = desMatch ? desMatch[1] : item.name;
            return {
              label: item.name,
              des: des,
            };
          });
          setNeoPicks(top);
        }
      })
      .catch((err) => console.error("Failed to fetch NeoWs list:", err));
  }, []);

  const analyze = useCallback(
    async (designation: string, customOutreach = outreachMode, customPerturbed = perturbedMode) => {
      if (!designation.trim()) return;
      setLoading(true);
      setError(null);
      setActiveDes(designation);

      try {
        let url = `${API}/api/analyze/${encodeURIComponent(designation)}`;
        const params = [];
        if (customOutreach) params.push("outreach=true");
        if (customPerturbed) params.push("perturbed=true");
        if (params.length > 0) url += "?" + params.join("&");

        const res = await fetch(url, { signal: AbortSignal.timeout(180_000) });
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
    },
    [outreachMode, perturbedMode]
  );

  // Instant response when toggling Kid-Friendly Outreach Mode
  const toggleOutreach = (checked: boolean) => {
    setOutreachMode(checked);
    if (activeDes) {
      analyze(activeDes, checked, perturbedMode);
    }
  };

  // Instant response when toggling High-Fidelity N-Body Perturbation Mode
  const togglePerturbed = (checked: boolean) => {
    setPerturbedMode(checked);
    if (activeDes) {
      analyze(activeDes, outreachMode, checked);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans pb-16">
      {/* Top Mission Control Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-2xl font-black tracking-tight text-white">
              Impact<span className="text-cyan-400">IQ</span>
            </span>
          </div>
          <span className="hidden md:inline text-xs text-slate-400 uppercase tracking-widest pl-3 border-l border-slate-800">
            Asteroid Impact Risk Predictor
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-telemetry">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 font-medium ${
              showComparison
                ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/40"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
            }`}
          >
            <span>📊</span> {showComparison ? "Close Threat Table" : "Compare Sentry Threats"}
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>NASA / JPL Feeds Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Search & Control Console */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Planetary Defense Telemetry & Analysis</h1>
            <p className="text-xs text-slate-400">
              Query real NASA NeoWs, SBDB, and Sentry databases. Propagate Keplerian trajectories, run Monte Carlo simulations, and translate raw mechanics with IBM Granite.
            </p>
          </div>

          {/* Search Inputs & Historical Events */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <input
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition placeholder:text-slate-600 font-sans"
              placeholder="Enter Asteroid Name or JPL ID (e.g. 2010 FX9, Apophis, Bennu)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && query.trim() && analyze(query.trim())}
            />
            <button
              onClick={() => query.trim() && analyze(query.trim())}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl disabled:opacity-50 transition shadow-lg shadow-cyan-950 text-sm whitespace-nowrap"
            >
              {loading ? "Analyzing..." : "Analyze Asteroid"}
            </button>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  setQuery(e.target.value);
                  analyze(e.target.value);
                  e.target.value = "";
                }
              }}
              disabled={loading}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition"
            >
              <option value="">Historical Events</option>
              <option value="historical:chelyabinsk">Chelyabinsk Meteor (2013, 20m)</option>
              <option value="historical:tunguska">Tunguska Airburst (1908, 15 MT)</option>
              <option value="historical:barringer">Barringer Crater (50,000 ya, Arizona)</option>
              <option value="historical:chicxulub">Chicxulub Extinction (66 Ma, 10km)</option>
            </select>
          </div>

          {/* Interactive Mode Switches (Live Trigger) */}
          <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-slate-800/80 text-xs">
            <button
              onClick={() => toggleOutreach(!outreachMode)}
              className={`px-3.5 py-2 rounded-xl border transition flex items-center gap-2.5 cursor-pointer font-medium ${
                outreachMode
                  ? "bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-md shadow-amber-950"
                  : "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${outreachMode ? "bg-amber-400 animate-pulse" : "bg-slate-700"}`} />
              <span>👶 Kid-Friendly / Outreach Mode</span>
              {outreachMode && <span className="text-[10px] bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-200">ACTIVE</span>}
            </button>

            <button
              onClick={() => togglePerturbed(!perturbedMode)}
              className={`px-3.5 py-2 rounded-xl border transition flex items-center gap-2.5 cursor-pointer font-medium ${
                perturbedMode
                  ? "bg-cyan-950/80 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-950"
                  : "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${perturbedMode ? "bg-cyan-400 animate-pulse" : "bg-slate-700"}`} />
              <span>🔬 3-Body Perturbation (High Fidelity)</span>
              {perturbedMode && <span className="text-[10px] bg-cyan-900/60 px-1.5 py-0.5 rounded text-cyan-200">ACTIVE</span>}
            </button>
          </div>

          {/* Sentry & NeoWs Quick Pick Chips */}
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px] w-28">
                JPL Sentry List:
              </span>
              {sentryPicks.length === 0 && <span className="text-slate-600 text-xs">Loading live Sentry feed...</span>}
              {sentryPicks.map((p) => (
                <button
                  key={p.des}
                  onClick={() => {
                    setQuery(p.des);
                    analyze(p.des);
                  }}
                  className={`px-3 py-1 rounded-full border transition text-xs ${
                    activeDes === p.des
                      ? "bg-cyan-950 border-cyan-500 text-cyan-300 font-bold"
                      : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px] w-28">
                NeoWs Approaching:
              </span>
              {neoPicks.length === 0 && <span className="text-slate-600 text-xs">Loading NeoWs browse...</span>}
              {neoPicks.map((p) => (
                <button
                  key={p.des}
                  onClick={() => {
                    setQuery(p.des);
                    analyze(p.des);
                  }}
                  className={`px-3 py-1 rounded-full border transition text-xs ${
                    activeDes === p.des
                      ? "bg-cyan-950 border-cyan-500 text-cyan-300 font-bold"
                      : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible Comparison Dashboard */}
        {showComparison && (
          <div className="space-y-2">
            <CompareDashboard
              onSelect={(des) => {
                setQuery(des);
                analyze(des);
              }}
            />
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="glass-panel rounded-2xl p-12 text-center space-y-3 border border-slate-800">
            <div className="inline-block h-9 w-9 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-200 text-sm font-medium">
              Propagating Keplerian Orbit · Sampling Monte Carlo Ensembles · Running IBM Granite…
            </p>
            <p className="text-slate-500 text-xs font-telemetry">
              {outreachMode && "Formatting narrative for Kid-Friendly Outreach · "}
              {perturbedMode && "Integrating 3-body N-body gravitational perturbations · "}
              Live astrodynamic simulation in progress
            </p>
          </div>
        )}

        {/* Error Box */}
        {error && (
          <div className="rounded-xl border border-rose-800 bg-rose-950/40 p-4 text-rose-200 text-sm">
            <strong>Execution Error:</strong> {error}
          </div>
        )}

        {/* Live Analysis Results */}
        {data && (() => {
          const d = data as {
            designation: string;
            full_name: string;
            close_approach: { date: string; jpl_dist_au: number; velocity_kms: number; years_until: number };
            risk: Parameters<typeof RiskDashboard>[0]["risk"];
            monte_carlo: Parameters<typeof RiskDashboard>[0]["mc"];
            consequence: Parameters<typeof ConsequencePanel>[0]["data"];
            ai_brief: Parameters<typeof AiBriefPanel>[0]["brief"];
            orbit_path: { x: number; y: number; z: number }[];
            uncertainty_cloud?: { x: number; y: number; z: number }[][];
          };
          return (
            <div className="space-y-6">
              {/* Telemetry Object Banner */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">{d.full_name}</h2>
                  <p className="text-xs text-slate-400 font-telemetry mt-1">
                    Designation: <span className="text-white font-bold">{d.designation}</span> · Next Close Approach:{" "}
                    <span className="text-cyan-300 font-bold">{d.close_approach.date}</span> (in ~
                    {d.close_approach.years_until.toFixed(2)} years)
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-telemetry">
                  <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Nominal Distance</span>
                    <span className="text-white font-bold">{d.close_approach.jpl_dist_au.toFixed(5)} AU</span>
                  </div>
                  <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Relative Velocity</span>
                    <span className="text-white font-bold">{d.close_approach.velocity_kms.toFixed(1)} km/s</span>
                  </div>
                </div>
              </div>

              {/* 3D Orbit Visualization with Time Scrubber & Uncertainty Cloud */}
              <OrbitView orbitPath={d.orbit_path} uncertaintyCloud={d.uncertainty_cloud} />

              {/* Risk Scoring & Sentry Ground Truth Dashboard */}
              <RiskDashboard risk={d.risk} mc={d.monte_carlo} />

              {/* Physical Consequence Modeling */}
              <ConsequencePanel data={d.consequence} />

              {/* IBM Granite AI Mission Brief & Falsification Console */}
              <AiBriefPanel brief={d.ai_brief} asteroidContext={d} />
            </div>
          );
        })()}

        {/* Empty State / Comparison View */}
        {!loading && !error && !data && !showComparison && (
          <div className="space-y-6">
            <CompareDashboard
              onSelect={(des) => {
                setQuery(des);
                analyze(des);
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
