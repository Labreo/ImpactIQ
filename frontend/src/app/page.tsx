"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RiskDashboard from "@/components/RiskDashboard";
import ConsequencePanel from "@/components/ConsequencePanel";
import AiBriefPanel from "@/components/AiBriefPanel";
import CompareDashboard from "@/components/CompareDashboard";
import {
  playTelemetryClick,
  playRadarPing,
  playComputationSweep,
} from "@/utils/audioFx";

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
  { label: "99942 Apophis", des: "99942", type: "2029 Close Pass" },
  { label: "101955 Bennu", des: "101955", type: "OSIRIS-REx Target" },
  { label: "2010 FX9", des: "2010 FX9", type: "Sentry Listed" },
  { label: "29075 (1950 DA)", des: "29075", type: "High Palermo Score" },
  { label: "433 Eros", des: "433", type: "16.8 km Amor" },
  { label: "2000 SG344", des: "2000 SG344", type: "Sentry Monitored" },
  { label: "2024 YR4", des: "2024 YR4", type: "Apollo Passer" },
  { label: "1979 XB", des: "1979 XB", type: "Apollo Sentry" },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeDes, setActiveDes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<null | Record<string, unknown>>(null);
  const [sentryPicks, setSentryPicks] = useState<{ label: string; des: string }[]>([]);
  const [neoPicks, setNeoPicks] = useState<{ label: string; des: string }[]>([]);
  const [targetTab, setTargetTab] = useState<"featured" | "sentry" | "neows">("featured");
  const [outreachMode, setOutreachMode] = useState(false);
  const [perturbedMode, setPerturbedMode] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/sentry`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
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
        if (data?.near_earth_objects && Array.isArray(data.near_earth_objects)) {
          const top = (data.near_earth_objects as NeoWsApiItem[]).slice(0, 8).map((item) => {
            const desMatch = item.name.match(/\((.*?)\)/);
            const des = desMatch ? desMatch[1] : item.name;
            return { label: item.name, des };
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

  // Check URL query parameter on load (e.g. from /missions, /sentry, or /orbits)
  useEffect(() => {
    const analyzeParam = searchParams.get("analyze");
    if (analyzeParam && analyzeParam !== activeDes) {
      const timer = setTimeout(() => {
        setQuery(analyzeParam);
        analyze(analyzeParam);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, analyze, activeDes]);

  const toggleOutreach = (checked: boolean) => {
    playTelemetryClick();
    setOutreachMode(checked);
    if (activeDes) analyze(activeDes, checked, perturbedMode);
  };

  const togglePerturbed = (checked: boolean) => {
    playTelemetryClick();
    setPerturbedMode(checked);
    if (activeDes) analyze(activeDes, outreachMode, checked);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col" style={{ fontFamily: "var(--font-body, 'Inter', sans-serif)" }}>
      {/* ── Global Navigation Header (Clean & Identical Across All Pages) ── */}
      <Navbar />

      {/* ── Hero Search & Tactical Protocol Section ── */}
      <section style={{ backgroundColor: "#000", borderBottom: "1px solid #1f1f1f", padding: "36px 0 28px" }}>
        <div className="max-w-screen-xl mx-auto px-6">
          {/* Eyebrow */}
          <div className="section-label mb-4">
            Near-Earth Object Intelligence Platform
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: 6, color: "#fff" }}>
            Planetary Defense Analytics
          </h1>
          <p style={{ fontSize: 14, color: "#737373", marginBottom: 24, maxWidth: 640, lineHeight: 1.6 }}>
            Live orbital mechanics, Monte Carlo impact probability, and IBM Granite AI analysis across 1.3M+ catalogued near-Earth objects.
          </p>

          {/* Search bar row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 780, marginBottom: 20 }}>
            <div style={{ flex: "1 1 320px", position: "relative" }}>
              <input
                className="input-field"
                placeholder="Search asteroid name or designation — e.g. Apophis, 101955, 2024 YR4"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => e.key === "Enter" && query.trim() && analyze(query.trim())}
              />
            </div>
            <button
              onClick={() => query.trim() && analyze(query.trim())}
              disabled={loading || !query.trim()}
              className="btn btn-primary"
              style={{ whiteSpace: "nowrap", minWidth: 120 }}
            >
              {loading ? "Analyzing..." : "Analyze"}
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
              className="input-field"
              style={{ width: "auto", minWidth: 160, cursor: "pointer" }}
            >
              <option value="">Historical Events</option>
              <option value="historical:chelyabinsk">Chelyabinsk 2013 (20m airburst)</option>
              <option value="historical:tunguska">Tunguska 1908 (15 MT)</option>
              <option value="historical:barringer">Barringer Crater (Arizona)</option>
              <option value="historical:chicxulub">Chicxulub (66 Ma, 10km impactor)</option>
            </select>
          </div>

          {/* Target Tabs + Physics Protocol Switches */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: "1px solid #1f1f1f", paddingBottom: 10, marginBottom: 14 }}>
            {/* Category tabs */}
            <div className="tab-bar" style={{ borderBottom: "none", marginBottom: 0 }}>
              <button
                className={`tab-item ${targetTab === "featured" ? "active" : ""}`}
                onClick={() => { playTelemetryClick(); setTargetTab("featured"); }}
              >
                Featured Targets
              </button>
              <button
                className={`tab-item ${targetTab === "sentry" ? "active" : ""}`}
                onClick={() => { playTelemetryClick(); setTargetTab("sentry"); }}
              >
                Sentry Watchlist {sentryPicks.length > 0 && `(${sentryPicks.length})`}
              </button>
              <button
                className={`tab-item ${targetTab === "neows" ? "active" : ""}`}
                onClick={() => { playTelemetryClick(); setTargetTab("neows"); }}
              >
                Recent Passes {neoPicks.length > 0 && `(${neoPicks.length})`}
              </button>
            </div>

            {/* Tactical Protocol Switches */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => togglePerturbed(!perturbedMode)}
                className="btn btn-ghost"
                style={{
                  fontSize: 11,
                  padding: "5px 12px",
                  borderColor: perturbedMode ? "#fc3d21" : "#2a2a2a",
                  color: perturbedMode ? "#fc3d21" : "#737373",
                  backgroundColor: perturbedMode ? "rgba(252, 61, 33, 0.08)" : "transparent",
                }}
                title="Integrate point-mass gravitational perturbations from 8 solar system bodies"
              >
                N-Body Gravity: {perturbedMode ? "ON" : "OFF"}
              </button>

              <button
                onClick={() => toggleOutreach(!outreachMode)}
                className="btn btn-ghost"
                style={{
                  fontSize: 11,
                  padding: "5px 12px",
                  borderColor: outreachMode ? "#fc3d21" : "#2a2a2a",
                  color: outreachMode ? "#fc3d21" : "#737373",
                  backgroundColor: outreachMode ? "rgba(252, 61, 33, 0.08)" : "transparent",
                }}
                title="Format AI narrative for general public education"
              >
                Public Mode: {outreachMode ? "ON" : "OFF"}
              </button>

              <button
                onClick={() => {
                  playTelemetryClick();
                  setShowComparison(!showComparison);
                }}
                className="btn btn-ghost"
                style={{
                  fontSize: 11,
                  padding: "5px 12px",
                  borderColor: showComparison ? "#fc3d21" : "#2a2a2a",
                  color: showComparison ? "#fc3d21" : "#737373",
                  backgroundColor: showComparison ? "rgba(252, 61, 33, 0.08)" : "transparent",
                }}
                title="Toggle Sentry multi-target threat radar quick-table"
              >
                {showComparison ? "Hide Sentry Radar" : "Sentry Threat Radar"}
              </button>
            </div>
          </div>

          {/* Quick asteroid target pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {targetTab === "featured" &&
              FEATURED_CATALOG.map((p) => (
                <button
                  key={p.des}
                  onClick={() => {
                    setQuery(p.des);
                    analyze(p.des);
                  }}
                  style={{
                    background: activeDes === p.des ? "#141414" : "transparent",
                    border: `1px solid ${activeDes === p.des ? "#fc3d21" : "#2a2a2a"}`,
                    color: activeDes === p.des ? "#fff" : "#a3a3a3",
                    fontSize: 12,
                    padding: "5px 12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (activeDes !== p.des) e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    if (activeDes !== p.des) e.currentTarget.style.color = "#a3a3a3";
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{p.label}</span>
                  <span style={{ fontSize: 10, color: "#525252" }}>{p.type}</span>
                </button>
              ))}

            {targetTab === "sentry" &&
              sentryPicks.map((s) => (
                <button
                  key={s.des}
                  onClick={() => {
                    setQuery(s.des);
                    analyze(s.des);
                  }}
                  style={{
                    background: "transparent",
                    border: "1px solid #2a2a2a",
                    color: "#a3a3a3",
                    fontSize: 12,
                    padding: "5px 12px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = "#404040";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#a3a3a3";
                    e.currentTarget.style.borderColor = "#2a2a2a";
                  }}
                >
                  {s.label}
                </button>
              ))}

            {targetTab === "neows" &&
              neoPicks.map((n) => (
                <button
                  key={n.des}
                  onClick={() => {
                    setQuery(n.des);
                    analyze(n.des);
                  }}
                  style={{
                    background: "transparent",
                    border: "1px solid #2a2a2a",
                    color: "#a3a3a3",
                    fontSize: 12,
                    padding: "5px 12px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = "#404040";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#a3a3a3";
                    e.currentTarget.style.borderColor = "#2a2a2a";
                  }}
                >
                  {n.label}
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="max-w-screen-xl mx-auto px-6 py-8 space-y-8 flex-1">
        {/* Sentry radar table (toggled) */}
        {showComparison && (
          <CompareDashboard
            onSelect={(des) => {
              setQuery(des);
              analyze(des);
            }}
          />
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: "2px solid #2a2a2a",
                  borderTopColor: "#fc3d21",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <p style={{ fontSize: 13, color: "#525252", letterSpacing: "0.02em" }}>
                Querying JPL Small-Body Database · Propagating orbit · Running Monte Carlo · Consulting IBM Granite
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "14px 16px", borderLeft: "3px solid #ef4444", backgroundColor: "#0d0000", color: "#fca5a5", fontSize: 13 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* ── Results ── */}
        {data &&
          (() => {
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
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {/* Object title bar */}
                <div style={{ borderBottom: "1px solid #1f1f1f", paddingBottom: 20 }}>
                  <div className="section-label" style={{ marginBottom: 10 }}>
                    Active Target — {d.designation}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.6px", margin: 0, lineHeight: 1.1 }}>
                        {d.full_name}
                      </h2>
                      <p style={{ fontSize: 13, color: "#737373", marginTop: 6 }}>
                        Next close approach: <span style={{ color: "#a3a3a3", fontWeight: 500 }}>{d.close_approach.date}</span> ·{" "}
                        {d.close_approach.years_until.toFixed(1)} years from now
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div className="stat-block" style={{ minWidth: 110 }}>
                        <div className="stat-label">Miss Distance</div>
                        <div className="stat-value" style={{ fontSize: 18 }}>
                          {d.close_approach.jpl_dist_au.toFixed(4)}
                        </div>
                        <div className="stat-sub">AU</div>
                      </div>
                      <div className="stat-block" style={{ minWidth: 110 }}>
                        <div className="stat-label">Relative Velocity</div>
                        <div className="stat-value" style={{ fontSize: 18 }}>
                          {d.close_approach.velocity_kms.toFixed(1)}
                        </div>
                        <div className="stat-sub">km/s</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3D Orbit viewer — full width */}
                <div>
                  <div className="section-label" style={{ marginBottom: 12 }}>
                    Orbital Trajectory Simulation
                  </div>
                  <div style={{ border: "1px solid #1f1f1f" }}>
                    <OrbitView orbitPath={d.orbit_path} uncertaintyCloud={d.uncertainty_cloud} />
                  </div>
                </div>

                {/* Two-column analysis grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: 32, alignItems: "start" }}>
                  {/* Left column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    <ConsequencePanel data={d.consequence} />
                    <RiskDashboard risk={d.risk} mc={d.monte_carlo} />
                  </div>
                  {/* Right column */}
                  <div>
                    <AiBriefPanel brief={d.ai_brief} asteroidContext={d} />
                  </div>
                </div>
              </div>
            );
          })()}

        {/* Empty state — Sentry table */}
        {!loading && !error && !data && !showComparison && (
          <CompareDashboard
            onSelect={(des) => {
              setQuery(des);
              analyze(des);
            }}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <Footer />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white p-8">Loading Astrodynamics Console…</div>}>
      <HomeContent />
    </Suspense>
  );
}
