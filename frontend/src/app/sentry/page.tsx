"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconSearch, IconChevronRight } from "@/components/Icons";
import { playTelemetryClick } from "@/utils/audioFx";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SentryRecord {
  designation: string;
  fullname: string;
  ip: number;
  energy_mt: number;
  torino_scale: number;
  palermo_scale: number;
  insight_score: number;
  insight_label: string;
  diameter_m?: number;
  years?: string;
}

export default function SentryPage() {
  const [data, setData] = useState<SentryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "high_palermo" | "high_energy" | "torino_active">("all");
  const [sortBy, setSortBy] = useState<"ip" | "palermo" | "energy" | "score">("palermo");

  useEffect(() => {
    fetch(`${API}/api/compare`)
      .then((res) => res.json())
      .then((items: SentryRecord[]) => {
        if (Array.isArray(items)) {
          setData(items);
        }
      })
      .catch((err) => console.error("Error loading Sentry data:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data
    .filter((item) => {
      const matchSearch =
        item.designation.toLowerCase().includes(search.toLowerCase()) ||
        (item.fullname && item.fullname.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;

      if (filterTab === "high_palermo") return item.palermo_scale >= -3.0;
      if (filterTab === "high_energy") return item.energy_mt >= 50;
      if (filterTab === "torino_active") return item.torino_scale > 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "ip") return b.ip - a.ip;
      if (sortBy === "palermo") return b.palermo_scale - a.palermo_scale;
      if (sortBy === "energy") return b.energy_mt - a.energy_mt;
      if (sortBy === "score") return b.insight_score - a.insight_score;
      return 0;
    });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-6 py-10 flex-1 space-y-10">
        {/* Header */}
        <div>
          <div className="section-label mb-3">JPL CNEOS Surveillance Watchlist</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.8px", margin: 0, color: "#fff" }}>
            Sentry Impact Risk Monitoring System
          </h1>
          <p style={{ fontSize: 14, color: "#737373", marginTop: 8, maxWidth: 760, lineHeight: 1.6 }}>
            Automated collision monitoring tables cross-referenced with NASA Jet Propulsion Laboratory (JPL) Center for Near-Earth Object Studies (CNEOS). Every object is continuously propagated across multiple potential impact epochs.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", padding: "18px 20px" }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            {/* Search Input */}
            <div style={{ position: "relative", minWidth: 280, flex: 1, maxWidth: 460 }}>
              <input
                className="input-field"
                placeholder="Filter by asteroid designation or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 34, fontSize: 13 }}
              />
              <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#525252" }}>
                <IconSearch className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#525252", textTransform: "uppercase", fontWeight: 600 }}>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="input-field"
                style={{ width: "auto", padding: "6px 12px", fontSize: 12, cursor: "pointer" }}
              >
                <option value="palermo">Palermo Scale (Descending)</option>
                <option value="ip">Impact Probability P(i)</option>
                <option value="energy">Kinetic Energy (MT)</option>
                <option value="score">ImpactIQ Index Score</option>
              </select>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="tab-bar">
            <button
              className={`tab-item ${filterTab === "all" ? "active" : ""}`}
              onClick={() => { playTelemetryClick(); setFilterTab("all"); }}
            >
              All Monitored ({data.length})
            </button>
            <button
              className={`tab-item ${filterTab === "high_palermo" ? "active" : ""}`}
              onClick={() => { playTelemetryClick(); setFilterTab("high_palermo"); }}
            >
              Higher Hazard (Palermo ≥ -3.0)
            </button>
            <button
              className={`tab-item ${filterTab === "high_energy" ? "active" : ""}`}
              onClick={() => { playTelemetryClick(); setFilterTab("high_energy"); }}
            >
              High Kinetic Yield (≥ 50 MT)
            </button>
            <button
              className={`tab-item ${filterTab === "torino_active" ? "active" : ""}`}
              onClick={() => { playTelemetryClick(); setFilterTab("torino_active"); }}
            >
              Torino Scale ≥ 1
            </button>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#525252", fontSize: 13 }}>
            Connecting to JPL CNEOS Sentry Telemetry Stream…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px", backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", textAlign: "center", color: "#737373", fontSize: 13 }}>
            No objects match the active filter criteria.
          </div>
        ) : (
          <div style={{ border: "1px solid #1f1f1f", overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Designation / Object</th>
                  <th>Impact Probability P(i)</th>
                  <th>Kinetic Yield</th>
                  <th>Torino Scale</th>
                  <th>Palermo Technical</th>
                  <th>ImpactIQ Index</th>
                  <th style={{ textAlign: "right" }}>Trajectory Engine</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((obj) => (
                  <tr key={obj.designation}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#fff", fontSize: 13 }}>
                        {obj.fullname || obj.designation}
                      </div>
                      <div style={{ fontSize: 10, color: "#525252", fontFamily: "var(--font-mono)" }}>
                        SPICE: {obj.designation}
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
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "2px 8px",
                          backgroundColor: obj.torino_scale > 0 ? "#1c1407" : "transparent",
                          border: obj.torino_scale > 0 ? "1px solid #92400e" : "1px solid transparent",
                          color: obj.torino_scale > 0 ? "#f59e0b" : "#525252",
                        }}
                      >
                        {obj.torino_scale}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: obj.palermo_scale > -2 ? "#fc3d21" : "#737373" }}>
                        {obj.palermo_scale.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 700, color: "#fff" }}>{obj.insight_score}</span>
                        <span style={{ fontSize: 10, color: "#525252", textTransform: "uppercase" }}>{obj.insight_label}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/?analyze=${encodeURIComponent(obj.designation)}`}
                        onClick={() => playTelemetryClick()}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "6px 14px",
                          backgroundColor: "transparent",
                          border: "1px solid #2a2a2a",
                          color: "#a3a3a3",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#fc3d21";
                          e.currentTarget.style.color = "#fc3d21";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#2a2a2a";
                          e.currentTarget.style.color = "#a3a3a3";
                        }}
                      >
                        Analyze
                        <IconChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Technical Hazard Scales Scientific Reference Guide */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
          {/* Palermo Technical Scale Box */}
          <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", padding: "20px" }}>
            <div className="section-label mb-2">Technical Hazard Reference</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>
              Palermo Technical Impact Hazard Scale ($P$)
            </h3>
            <p style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.6, marginBottom: 12 }}>
              Logarithmic scale comparing the detected impact risk against the expected historical background flux ($f_B = 0.03 \cdot E^{-0.8}$) of objects of equal or greater kinetic energy:
            </p>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, padding: "8px 12px", backgroundColor: "#000", border: "1px solid #1f1f1f", color: "#fc3d21", marginBottom: 12 }}>
              P = log₁₀ [ P_i / (f_B · Δt) ]
            </div>
            <ul style={{ fontSize: 12, color: "#737373", lineHeight: 1.7, paddingLeft: 16, margin: 0 }}>
              <li><strong>P &lt; -2:</strong> Events of no practical consequence.</li>
              <li><strong>-2 ≤ P ≤ 0:</strong> Events warranting careful astrometric observation.</li>
              <li><strong>P &gt; 0:</strong> Hazard exceeds normal background risk.</li>
            </ul>
          </div>

          {/* Torino Scale Box */}
          <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", padding: "20px" }}>
            <div className="section-label mb-2">Public Communication Scale</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>
              Torino Impact Hazard Scale (0–10)
            </h3>
            <p style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.6, marginBottom: 12 }}>
              Two-dimensional integer scale (0 to 10) combining impact probability and kinetic energy yield for public risk communication:
            </p>
            <ul style={{ fontSize: 12, color: "#737373", lineHeight: 1.7, paddingLeft: 16, margin: 0 }}>
              <li><strong>0 (White):</strong> Zero hazard / asteroid will burn up or miss.</li>
              <li><strong>1 (Green):</strong> Normal discovery with near-Earth pass.</li>
              <li><strong>2–4 (Yellow):</strong> Meriting attention by astronomers.</li>
              <li><strong>5–7 (Orange):</strong> Threatening encounter requiring response planning.</li>
              <li><strong>8–10 (Red):</strong> Certain collision capable of localized to global destruction.</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
