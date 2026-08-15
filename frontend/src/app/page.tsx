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
  { label: "99942 Apophis", des: "99942", type: "PHA · 2029 Close Pass" },
  { label: "101955 Bennu", des: "101955", type: "Apollo · OSIRIS-REx" },
  { label: "2010 FX9", des: "2010 FX9", type: "Aten · Sentry List" },
  { label: "29075 (1950 DA)", des: "29075", type: "Apollo · High Palermo" },
  { label: "433 Eros", des: "433", type: "Amor · 16.8km NEA" },
  { label: "2000 SG344", des: "2000 SG344", type: "Aten · Sentry" },
  { label: "2024 YR4", des: "2024 YR4", type: "Apollo · 2024 Passer" },
  { label: "1979 XB", des: "1979 XB", type: "Apollo · Sentry" },
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
  const [utcTime, setUtcTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    const timer = setTimeout(update, 0);
    const interval = setInterval(update, 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

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
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans pb-16 tech-grid-bg">
      {/* NASA Planetary Defense Operations Header Bar */}
      <header className="border-b border-slate-800 bg-[#060b18]/90 backdrop-blur-md px-6 py-3.5 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-[#0b3d91] border border-blue-400/40 flex items-center justify-center font-telemetry font-black text-white text-xs shadow-md">
            NASA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white uppercase">
                Impact<span className="text-cyan-400">IQ</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-telemetry font-bold">
                CNEOS ASTRODYNAMICS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-telemetry tracking-wide">
              Planetary Defense Coordination Office · JPL Small-Body System
            </p>
          </div>
        </div>

        {/* Center Live Telemetry Clock & DSN Status */}
        <div className="hidden lg:flex items-center gap-4 text-[10px] font-telemetry text-slate-400 border-x border-slate-800/80 px-5">
          <div>
            <span className="text-slate-500 block text-[9px]">MISSION TIME</span>
            <span className="text-cyan-300 font-bold">{utcTime || "SYNCHRONIZING..."}</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[9px]">DSN TRACKING</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              GOLDSTONE · CANBERRA · MADRID
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 text-xs font-telemetry">
          {/* Audio FX Toggle Button */}
          <button
            onClick={toggleMute}
            className={`px-2.5 py-1.5 rounded border transition font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 cursor-pointer ${
              !muted
                ? "bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-sm"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
            title="Toggle Mission Audio FX (Web Audio API Synthesizer)"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${!muted ? "bg-cyan-400 animate-ping" : "bg-slate-600"}`} />
            <span>{!muted ? "AUDIO: ON" : "AUDIO: OFF"}</span>
          </button>

          <button
            onClick={() => {
              playTelemetryClick();
              setShowComparison(!showComparison);
            }}
            className={`px-3 py-1.5 rounded border transition font-bold uppercase tracking-wider text-[10px] cursor-pointer ${
              showComparison
                ? "bg-[#0b3d91] text-white border-blue-400 shadow-md shadow-blue-900/40"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
            }`}
          >
            {showComparison ? "Hide Sentry Radar" : "Sentry Threat Radar"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Search & Control Console */}
        <div className="nasa-panel corner-bracket rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="space-y-0.5">
              <h1 className="text-lg font-bold text-white tracking-wide uppercase font-telemetry">
                {"//"} ASTRODYNAMICS &amp; EPHEMERIS INTERROGATION CONSOLE
              </h1>
              <p className="text-xs text-slate-400 font-telemetry">
                Direct live query access across all 1,300,000+ cataloged NASA/JPL near-Earth objects.
              </p>
            </div>
            <span className="text-[10px] font-telemetry px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800 font-bold uppercase">
              ORBIT PROPAGATION SOLVER: KEPLERIAN + N-BODY
            </span>
          </div>

          {/* Search Inputs & Historical Events */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            <div className="relative flex-1">
              <input
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition placeholder:text-slate-600 font-telemetry"
                placeholder="Query Asteroid Name, Designation, or SPICE ID (e.g. 101955, Apophis, 433, 2010 FX9, 29075, 2024 YR4)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => e.key === "Enter" && query.trim() && analyze(query.trim())}
              />
            </div>
            <button
              onClick={() => query.trim() && analyze(query.trim())}
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg disabled:opacity-50 transition shadow-lg shadow-cyan-950 text-xs uppercase tracking-wider font-telemetry whitespace-nowrap cursor-pointer"
            >
              {loading ? "Calculating..." : "Execute Orbit Run"}
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
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition font-telemetry cursor-pointer"
            >
              <option value="">Historical Calibration Events</option>
              <option value="historical:chelyabinsk">Chelyabinsk Meteor (2013, 20m Airburst)</option>
              <option value="historical:tunguska">Tunguska Airburst (1908, 15 MT)</option>
              <option value="historical:barringer">Barringer Crater (50,000 ya, Arizona)</option>
              <option value="historical:chicxulub">Chicxulub Impact (66 Ma, 10km Impactor)</option>
            </select>
          </div>

          {/* Interactive Mode Switches */}
          <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-slate-800/80 text-xs">
            <button
              onClick={() => toggleOutreach(!outreachMode)}
              className={`px-3 py-1.5 rounded border transition flex items-center gap-2 cursor-pointer font-telemetry font-bold text-[10px] uppercase tracking-wider ${
                outreachMode
                  ? "bg-amber-950 border-amber-500 text-amber-300 shadow-sm"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${outreachMode ? "bg-amber-400 animate-pulse" : "bg-slate-700"}`} />
              <span>Outreach Interpretation Mode</span>
              {outreachMode && <span className="text-[8px] bg-amber-900 px-1 py-0.5 rounded text-amber-200">ACTIVE</span>}
            </button>

            <button
              onClick={() => togglePerturbed(!perturbedMode)}
              className={`px-3 py-1.5 rounded border transition flex items-center gap-2 cursor-pointer font-telemetry font-bold text-[10px] uppercase tracking-wider ${
                perturbedMode
                  ? "bg-cyan-950 border-cyan-500 text-cyan-300 shadow-sm"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${perturbedMode ? "bg-cyan-400 animate-pulse" : "bg-slate-700"}`} />
              <span>N-Body Gravitational Perturbations</span>
              {perturbedMode && <span className="text-[8px] bg-cyan-900 px-1 py-0.5 rounded text-cyan-200">ACTIVE</span>}
            </button>
          </div>

          {/* Featured NASA Catalog Fast Picks */}
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-slate-500 uppercase tracking-widest font-bold text-[9px] font-telemetry">
                PRIMARY TARGET CATALOG:
              </span>
              {FEATURED_CATALOG.map((p) => (
                <button
                  key={p.des}
                  onClick={() => {
                    setQuery(p.des);
                    analyze(p.des);
                  }}
                  className={`px-2.5 py-1 rounded border transition text-[11px] font-telemetry cursor-pointer ${
                    activeDes === p.des
                      ? "bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-md shadow-cyan-950"
                      : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="font-bold">{p.label}</span>
                  <span className="text-[9px] text-slate-500 ml-1.5">({p.type})</span>
                </button>
              ))}
            </div>

            {sentryPicks.length > 0 && (
              <div className="flex gap-1.5 flex-wrap items-center pt-1">
                <span className="text-slate-500 uppercase tracking-widest font-bold text-[9px] font-telemetry">
                  LIVE SENTRY SURVEILLANCE PICKS:
                </span>
                {sentryPicks.map((s) => (
                  <button
                    key={s.des}
                    onClick={() => {
                      setQuery(s.des);
                      analyze(s.des);
                    }}
                    className="px-2 py-0.5 rounded border text-[10px] font-telemetry bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-400 hover:border-cyan-500/40 transition cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {neoPicks.length > 0 && (
              <div className="flex gap-1.5 flex-wrap items-center pt-1">
                <span className="text-slate-500 uppercase tracking-widest font-bold text-[9px] font-telemetry">
                  NASA NEOWS RECENT DISCOVERIES:
                </span>
                {neoPicks.map((n) => (
                  <button
                    key={n.des}
                    onClick={() => {
                      setQuery(n.des);
                      analyze(n.des);
                    }}
                    className="px-2 py-0.5 rounded border text-[10px] font-telemetry bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:border-slate-700 transition cursor-pointer"
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            )}
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
          <div className="nasa-panel corner-bracket rounded-xl p-10 text-center space-y-3 border border-slate-800">
            <div className="inline-block h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-200 text-xs font-telemetry font-bold uppercase tracking-wider">
              Querying NASA JPL SBDB & CAD API · Propagating Keplerian Orbit · Sampling Monte Carlo Ensembles · Running IBM Granite…
            </p>
            <p className="text-slate-500 text-[11px] font-telemetry">
              {outreachMode && "Formatting narrative for Outreach Protocol · "}
              {perturbedMode && "Integrating N-Body Gravitational Perturbations · "}
              Direct NASA telemetry stream in progress
            </p>
          </div>
        )}

        {/* Error Box */}
        {error && (
          <div className="rounded-lg border border-rose-800 bg-rose-950/60 p-4 text-rose-200 text-xs font-telemetry">
            <strong>TELEMETRY ERROR:</strong> {error}
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
              <div className="nasa-panel corner-bracket rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-telemetry font-bold">
                      NASA JPL SSD VERIFIED
                    </span>
                    <h2 className="text-xl font-black text-white font-telemetry">{d.full_name}</h2>
                  </div>
                  <p className="text-[11px] text-slate-400 font-telemetry mt-1">
                    DESIGNATION: <span className="text-white font-bold">{d.designation}</span> · NEXT CLOSE APPROACH:{" "}
                    <span className="text-cyan-300 font-bold">{d.close_approach.date}</span> (IN ~
                    {d.close_approach.years_until.toFixed(2)} YRS)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-telemetry">
                  <div className="bg-slate-950/90 px-3 py-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">NOMINAL DISTANCE</span>
                    <span className="text-white font-bold text-xs">{d.close_approach.jpl_dist_au.toFixed(5)} AU</span>
                  </div>
                  <div className="bg-slate-950/90 px-3 py-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">RELATIVE VELOCITY</span>
                    <span className="text-white font-bold text-xs">{d.close_approach.velocity_kms.toFixed(1)} km/s</span>
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
