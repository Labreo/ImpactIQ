"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import RiskDashboard from "@/components/RiskDashboard";
import ConsequencePanel from "@/components/ConsequencePanel";
import AiBriefPanel from "@/components/AiBriefPanel";
import CompareDashboard from "@/components/CompareDashboard";
import {
  setAudioMuted,
  playTelemetryClick,
  playRadarPing,
  playComputationSweep,
} from "@/utils/audioFx";

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

const FEATURED_CATALOG = [
  { label: "99942 Apophis", des: "99942", desc: "2029 Close Approach (370m)" },
  { label: "101955 Bennu", des: "101955", desc: "OSIRIS-REx Sample Target" },
  { label: "2010 FX9", des: "2010 FX9", desc: "Potentially Hazardous NEA" },
  { label: "29075 (1950 DA)", des: "29075", desc: "Highest Palermo Hazard" },
  { label: "433 Eros", des: "433", desc: "Massive 16.8km Near-Earth Asteroid" },
  { label: "2000 SG344", des: "2000 SG344", desc: "High Sentry Probability Target" },
  { label: "2024 YR4", des: "2024 YR4", desc: "Recent 2024 Earth Close Passer" },
  { label: "1979 XB", des: "1979 XB", desc: "Lost & Recovered Sentry NEA" },
];

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
          const top = (data.data as SentryApiItem[]).slice(0, 8).map((item) => ({
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
          const top = (data.near_earth_objects as NeoWsApiItem[]).slice(0, 8).map((item) => {
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
      playComputationSweep();
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
        const parsed = await res.json();
        setData(parsed);
        playRadarPing(980);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [outreachMode, perturbedMode]
  );

  const [muted, setMuted] = useState(false);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
    if (!next) {
      playTelemetryClick();
    }
  };

  const toggleOutreach = (checked: boolean) => {
    playTelemetryClick();
    setOutreachMode(checked);
    if (activeDes) {
      analyze(activeDes, checked, perturbedMode);
    }
  };

  const togglePerturbed = (checked: boolean) => {
    playTelemetryClick();
    setPerturbedMode(checked);
    if (activeDes) {
      analyze(activeDes, outreachMode, checked);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 font-sans pb-16">
      {/* Top Mission Control Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-2xl font-black tracking-tight text-white">
              Impact<span className="text-cyan-400">IQ</span>
            </span>
          </div>
          <span className="hidden md:inline text-xs text-slate-400 uppercase tracking-widest pl-3 border-l border-slate-800 font-telemetry">
            Planetary Defense Telemetry Engine
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-telemetry">
          {/* Audio FX Toggle Button */}
          <button
            onClick={toggleMute}
            className={`px-3 py-1.5 rounded-lg border transition font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5 ${
              !muted
                ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/40"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400"
            }`}
            title="Toggle Mission Audio FX (Web Audio API Synthesizer)"
          >
            <span className={`w-2 h-2 rounded-full ${!muted ? "bg-cyan-400 animate-ping" : "bg-slate-600"}`} />
            <span>{!muted ? "AUDIO: ENGAGED" : "AUDIO: MUTED"}</span>
          </button>

          <button
            onClick={() => {
              playTelemetryClick();
              setShowComparison(!showComparison);
            }}
            className={`px-3 py-1.5 rounded-lg border transition font-semibold uppercase tracking-wider text-[11px] ${
              showComparison
                ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/40"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
            }`}
          >
            {showComparison ? "Close Sentry Threat Radar" : "Sentry Multi-Object Threat Radar"}
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>NASA / JPL Feeds Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Search & Control Console */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white tracking-tight">Planetary Defense Telemetry & Ephemeris Analysis</h1>
              <span className="hidden sm:inline text-[11px] font-telemetry px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                LIVE QUERY: ALL 1.3M+ NASA JPL SMALL BODIES
              </span>
            </div>
            <p className="text-xs text-slate-400 font-telemetry">
              Direct telemetry from NASA Small-Body Database (SBDB), Close Approach Data (CAD), and Sentry Impact Monitoring.
            </p>
          </div>

          {/* Search Inputs & Historical Events */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <input
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition placeholder:text-slate-600 font-sans"
              placeholder="Search Any NASA Asteroid by Name or Number (e.g. 101955, Apophis, 433, Bennu, 1 Ceres, 2024 YR4)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && query.trim() && analyze(query.trim())}
            />
            <button
              onClick={() => query.trim() && analyze(query.trim())}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl disabled:opacity-50 transition shadow-lg shadow-cyan-950 text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer"
            >
              {loading ? "Computing Ephemeris..." : "Execute Analysis"}
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
              className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition font-telemetry cursor-pointer"
            >
              <option value="">Historical Benchmarks</option>
              <option value="historical:chelyabinsk">Chelyabinsk Meteor (2013, 20m Airburst)</option>
              <option value="historical:tunguska">Tunguska Airburst (1908, 15 MT)</option>
              <option value="historical:barringer">Barringer Meteor Crater (50,000 ya, Arizona)</option>
              <option value="historical:chicxulub">Chicxulub Extinction (66 Ma, 10km Impactor)</option>
            </select>
          </div>

          {/* Interactive Mode Switches (Live Trigger) */}
          <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-slate-800/80 text-xs">
            <button
              onClick={() => toggleOutreach(!outreachMode)}
              className={`px-3.5 py-2 rounded-xl border transition flex items-center gap-2.5 cursor-pointer font-semibold uppercase tracking-wider text-[11px] ${
                outreachMode
                  ? "bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-md shadow-amber-950"
                  : "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${outreachMode ? "bg-amber-400 animate-pulse" : "bg-slate-700"}`} />
              <span>Outreach Interpretation Mode</span>
              {outreachMode && <span className="text-[9px] bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-200">ACTIVE</span>}
            </button>

            <button
              onClick={() => togglePerturbed(!perturbedMode)}
              className={`px-3.5 py-2 rounded-xl border transition flex items-center gap-2.5 cursor-pointer font-semibold uppercase tracking-wider text-[11px] ${
                perturbedMode
                  ? "bg-cyan-950/80 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-950"
                  : "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${perturbedMode ? "bg-cyan-400 animate-pulse" : "bg-slate-700"}`} />
              <span>N-Body Gravitational Perturbations</span>
              {perturbedMode && <span className="text-[9px] bg-cyan-900/60 px-1.5 py-0.5 rounded text-cyan-200">ACTIVE</span>}
            </button>
          </div>

          {/* Featured NASA Catalog Fast Picks */}
          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] w-36 font-telemetry">
                Featured NASA Targets:
              </span>
              {FEATURED_CATALOG.map((p) => (
                <button
                  key={p.des}
                  onClick={() => {
                    setQuery(p.des);
                    analyze(p.des);
                  }}
                  className={`px-3 py-1 rounded-full border transition text-xs font-telemetry cursor-pointer ${
                    activeDes === p.des
                      ? "bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-md shadow-cyan-950"
                      : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                  title={p.desc}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Live JPL Sentry Monitored Feed */}
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px] w-36 font-telemetry">
                Live Sentry Radar:
              </span>
              {sentryPicks.length === 0 && <span className="text-slate-600 text-xs font-telemetry">Connecting to JPL Sentry API...</span>}
              {sentryPicks.map((p) => (
                <button
                  key={p.des}
                  onClick={() => {
                    setQuery(p.des);
                    analyze(p.des);
                  }}
                  className={`px-3 py-1 rounded-full border transition text-xs font-telemetry ${
                    activeDes === p.des
                      ? "bg-cyan-950 border-cyan-500 text-cyan-300 font-bold"
                      : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Live NeoWs Approaching Feed */}
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px] w-36 font-telemetry">
                Live NeoWs Feed:
              </span>
              {neoPicks.length === 0 && <span className="text-slate-600 text-xs font-telemetry">Connecting to NASA NeoWs API...</span>}
              {neoPicks.map((p) => (
                <button
                  key={p.des}
                  onClick={() => {
                    setQuery(p.des);
                    analyze(p.des);
                  }}
                  className={`px-3 py-1 rounded-full border transition text-xs font-telemetry ${
                    activeDes === p.des
                      ? "bg-cyan-950 border-cyan-500 text-cyan-300 font-bold"
                      : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Sentry Threat Radar Table Overlay */}
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
              Querying NASA JPL SBDB & CAD API · Propagating Keplerian Orbit · Sampling Monte Carlo Ensembles · Running IBM Granite…
            </p>
            <p className="text-slate-500 text-xs font-telemetry">
              {outreachMode && "Formatting narrative for Outreach Protocol · "}
              {perturbedMode && "Integrating N-Body Gravitational Perturbations · "}
              Direct NASA telemetry stream in progress
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
              <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-telemetry">
                      NASA JPL SSD VERIFIED
                    </span>
                    <h2 className="text-2xl font-black text-white">{d.full_name}</h2>
                  </div>
                  <p className="text-xs text-slate-400 font-telemetry mt-1.5">
                    Designation: <span className="text-white font-bold">{d.designation}</span> · Next Close Approach:{" "}
                    <span className="text-cyan-300 font-bold">{d.close_approach.date}</span> (in ~
                    {d.close_approach.years_until.toFixed(2)} years)
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-telemetry">
                  <div className="bg-slate-950/80 px-3.5 py-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Nominal Distance</span>
                    <span className="text-white font-bold">{d.close_approach.jpl_dist_au.toFixed(5)} AU</span>
                  </div>
                  <div className="bg-slate-950/80 px-3.5 py-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Relative Velocity</span>
                    <span className="text-white font-bold">{d.close_approach.velocity_kms.toFixed(1)} km/s</span>
                  </div>
                </div>
              </div>

              {/* DUAL-DECK COCKPIT: 3D Spatial Visualizer + Live IBM Granite AI Mission Intelligence */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Flight Deck: 3D Orbit Visualization with Time Scrubber (7 Columns) */}
                <div className="lg:col-span-7 space-y-6">
                  <OrbitView orbitPath={d.orbit_path} uncertaintyCloud={d.uncertainty_cloud} />
                  
                  {/* Physical Consequence Modeling */}
                  <ConsequencePanel data={d.consequence} />
                </div>

                {/* Right Flight Deck: IBM Granite Mission Brief, Guardian Audit, & Grounded Chat (5 Columns) */}
                <div className="lg:col-span-5 space-y-6">
                  <AiBriefPanel brief={d.ai_brief} asteroidContext={d} />
                </div>
              </div>

              {/* Full-Width Risk Scoring & Sentry Ground Truth Comparison Dashboard */}
              <RiskDashboard risk={d.risk} mc={d.monte_carlo} />
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
