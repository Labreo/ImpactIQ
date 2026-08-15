"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconChevronRight } from "@/components/Icons";
import { playTelemetryClick } from "@/utils/audioFx";

interface Mission {
  id: string;
  name: string;
  agency: string;
  target: string;
  targetDes: string;
  launchDate: string;
  status: "Completed" | "En Route" | "In Development" | "Extended Mission";
  objective: string;
  keyDiscovery: string;
  specs: {
    spacecraftMassKg: number;
    velocityKms?: number;
    deltaVResult?: string;
  };
}

const MISSIONS: Mission[] = [
  {
    id: "dart",
    name: "DART (Double Asteroid Redirection Test)",
    agency: "NASA / Johns Hopkins APL",
    target: "Dimorphos (Didymos B)",
    targetDes: "65803",
    launchDate: "Nov 24, 2021 (Impact: Sept 26, 2022)",
    status: "Completed",
    objective: "First full-scale planetary defense kinetic impactor demonstration.",
    keyDiscovery: "Successfully altered Dimorphos's 11h 55m orbital period by 33 minutes (exceeding minimum requirement by >400%), proving kinetic deflection efficacy with β ≈ 2.2 to 3.6 ejecta momentum multiplication.",
    specs: {
      spacecraftMassKg: 570,
      velocityKms: 6.14,
      deltaVResult: "2.7 mm/s orbital change",
    },
  },
  {
    id: "osiris-apex",
    name: "OSIRIS-APEX (Apophis Explorer)",
    agency: "NASA / University of Arizona",
    target: "99942 Apophis",
    targetDes: "99942",
    launchDate: "Sept 8, 2016 (Apophis Arrival: April 2029)",
    status: "En Route",
    objective: "Study tidal deformations and physical alterations on Apophis during its historic 2029 31,600 km Earth flyby.",
    keyDiscovery: "Previously returned 121.6g pristine carbonaceous sample from 101955 Bennu in Sept 2023. Spacecraft redirected into Apophis orbital rendezvous.",
    specs: {
      spacecraftMassKg: 880,
      velocityKms: 5.4,
      deltaVResult: "Post-sample redirection",
    },
  },
  {
    id: "hera",
    name: "Hera",
    agency: "ESA (European Space Agency)",
    target: "Didymos & Dimorphos",
    targetDes: "65803",
    launchDate: "Oct 7, 2024 (Rendezvous: Dec 2026)",
    status: "En Route",
    objective: "Perform detailed post-impact crater forensics, mass determination, and internal structure analysis of the DART impact site.",
    keyDiscovery: "Carrying Milani and Juventas CubeSats to conduct low-frequency radar sounding of asteroid interior.",
    specs: {
      spacecraftMassKg: 1128,
      velocityKms: 4.8,
      deltaVResult: "Dec 2026 orbital insertion",
    },
  },
  {
    id: "neo-surveyor",
    name: "NEO Surveyor",
    agency: "NASA Planetary Defense Coordination Office",
    target: "All Hazardous Near-Earth Objects",
    targetDes: "2010 FX9",
    launchDate: "Scheduled 2027/2028",
    status: "In Development",
    objective: "Space-based infrared telescope positioned at Sun-Earth L1 Lagrange point to discover >90% of potentially hazardous asteroids ≥140 meters.",
    keyDiscovery: "Dual-band thermal infrared sensors (4–5.2 µm and 6–10 µm) designed to detect dark, low-albedo asteroids that evade optical ground surveys.",
    specs: {
      spacecraftMassKg: 1300,
      velocityKms: 0,
      deltaVResult: "Sun-Earth L1 halo orbit",
    },
  },
  {
    id: "hayabusa2",
    name: "Hayabusa2# (Extended Mission)",
    agency: "JAXA (Japan Aerospace Exploration Agency)",
    target: "1998 KY26 & 2001 CC21",
    targetDes: "1998 KY26",
    launchDate: "Dec 3, 2014 (1998 KY26 Arrival: 2031)",
    status: "Extended Mission",
    objective: "Rendezvous with ultra-fast rotating 30-meter micro-asteroid 1998 KY26 (rotational period 10.7 minutes).",
    keyDiscovery: "Delivered 5.4g sample from primitive C-type asteroid Ryugu in Dec 2020. Spacecraft xenon ion engines continuing propulsion.",
    specs: {
      spacecraftMassKg: 600,
      velocityKms: 4.2,
      deltaVResult: "Ion propulsion cruise",
    },
  },
  {
    id: "lucy",
    name: "Lucy",
    agency: "NASA Goddard Space Flight Center",
    target: "Jupiter Trojan Asteroids",
    targetDes: "152830",
    launchDate: "Oct 16, 2021 (Tour: 2023–2033)",
    status: "En Route",
    objective: "Explore 8 primitive Trojan asteroids sharing Jupiter's orbit around the L4 and L5 Lagrange points.",
    keyDiscovery: "Discovered contact-binary moon Selam orbiting asteroid Dinkinesh in Nov 2023. Preparing for Donaldjohanson flyby in April 2025.",
    specs: {
      spacecraftMassKg: 1550,
      velocityKms: 7.2,
      deltaVResult: "12-year planetary tour",
    },
  },
];

export default function MissionsPage() {
  // Kinetic Impactor Deflection Calculator State
  const [asteroidDiameterM, setAsteroidDiameterM] = useState<number>(160);
  const [asteroidDensity, setAsteroidDensity] = useState<number>(2600); // kg/m^3 (stony S-type)
  const [impactorMassKg, setImpactorMassKg] = useState<number>(600); // DART scale
  const [impactVelocityKms, setImpactVelocityKms] = useState<number>(6.0); // km/s
  const [betaEnhancement, setBetaEnhancement] = useState<number>(2.5); // DART calibrated ejecta factor

  // Calculations
  const radiusM = asteroidDiameterM / 2;
  const volumeM3 = (4 / 3) * Math.PI * Math.pow(radiusM, 3);
  const asteroidMassKg = volumeM3 * asteroidDensity;

  // Kinetic deflection Delta-V (m/s) = beta * (m_sc * v_sc) / M_ast
  const impactorMomentum = impactorMassKg * (impactVelocityKms * 1000); // kg * m/s
  const totalMomentumDelivered = impactorMomentum * betaEnhancement;
  const deltaVMs = totalMomentumDelivered / asteroidMassKg;
  const deltaVMmS = deltaVMs * 1000; // mm/s

  // Required lead time to achieve Earth radius miss distance (6,371 km)
  const earthRadiusM = 6371000;
  const requiredSeconds = earthRadiusM / deltaVMs;
  const requiredYears = requiredSeconds / (365.25 * 86400);

  const getStatusColor = (status: Mission["status"]) => {
    switch (status) {
      case "Completed":
        return "#22c55e";
      case "En Route":
        return "#fc3d21";
      case "In Development":
        return "#f59e0b";
      case "Extended Mission":
        return "#00e5ff";
      default:
        return "#a3a3a3";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-6 py-10 flex-1 space-y-12">
        {/* Header */}
        <div>
          <div className="section-label mb-3">Planetary Defense Mission Fleet</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.8px", margin: 0, color: "#fff" }}>
            Active & Historic Asteroid Intercept Missions
          </h1>
          <p style={{ fontSize: 14, color: "#737373", marginTop: 8, maxWidth: 720, lineHeight: 1.6 }}>
            International robotic spacecraft missions dedicated to kinetic deflection validation, orbital reconnaissance, sample return, and space-based infrared threat detection.
          </p>
        </div>

        {/* Kinetic Impactor Deflection Simulator (Physics Engine) */}
        <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", padding: "24px", borderLeft: "3px solid #fc3d21" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#525252" }}>
                Interactive Defense Physics
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "4px 0 0", color: "#fff" }}>
                Kinetic Impactor Deflection Solver (DART Calibrated)
              </h2>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#525252", padding: "4px 8px", backgroundColor: "#000", border: "1px solid #2a2a2a" }}>
              Formula: Δv = β · (m_sc · v_rel) / M_ast
            </span>
          </div>

          <p style={{ fontSize: 13, color: "#a3a3a3", marginBottom: 20, lineHeight: 1.6 }}>
            Calculate the instantaneous velocity alteration ($\Delta v$) and minimum mission warning lead time required to deflect an asteroid away from Earth impact trajectory.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
            {/* Asteroid Diameter */}
            <div>
              <label style={{ fontSize: 11, color: "#525252", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Target Diameter ({asteroidDiameterM} m)
              </label>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={asteroidDiameterM}
                onChange={(e) => setAsteroidDiameterM(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#fc3d21", cursor: "pointer" }}
              />
              <div style={{ fontSize: 10, color: "#3d3d3d", marginTop: 4 }}>
                e.g. Dimorphos ~160m, Apophis ~340m
              </div>
            </div>

            {/* Impactor Mass */}
            <div>
              <label style={{ fontSize: 11, color: "#525252", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Spacecraft Mass ({impactorMassKg} kg)
              </label>
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={impactorMassKg}
                onChange={(e) => setImpactorMassKg(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#fc3d21", cursor: "pointer" }}
              />
              <div style={{ fontSize: 10, color: "#3d3d3d", marginTop: 4 }}>
                DART mass was 570 kg
              </div>
            </div>

            {/* Relative Impact Velocity */}
            <div>
              <label style={{ fontSize: 11, color: "#525252", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Impact Velocity ({impactVelocityKms} km/s)
              </label>
              <input
                type="range"
                min="2.0"
                max="15.0"
                step="0.5"
                value={impactVelocityKms}
                onChange={(e) => setImpactVelocityKms(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#fc3d21", cursor: "pointer" }}
              />
              <div style={{ fontSize: 10, color: "#3d3d3d", marginTop: 4 }}>
                Typical hypervelocity intercept: 5–10 km/s
              </div>
            </div>

            {/* Ejecta Momentum Factor Beta */}
            <div>
              <label style={{ fontSize: 11, color: "#525252", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Ejecta Multiplier β ({betaEnhancement}×)
              </label>
              <input
                type="range"
                min="1.0"
                max="4.0"
                step="0.1"
                value={betaEnhancement}
                onChange={(e) => setBetaEnhancement(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#fc3d21", cursor: "pointer" }}
              />
              <div style={{ fontSize: 10, color: "#3d3d3d", marginTop: 4 }}>
                DART measured β ≈ 2.2 to 3.6
              </div>
            </div>

            {/* Asteroid Density / Taxonomy */}
            <div>
              <label style={{ fontSize: 11, color: "#525252", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Asteroid Density ({asteroidDensity} kg/m³)
              </label>
              <select
                value={asteroidDensity}
                onChange={(e) => setAsteroidDensity(parseInt(e.target.value))}
                className="input-field"
                style={{ padding: "7px 10px", fontSize: 12, cursor: "pointer" }}
              >
                <option value="1380">Carbonaceous C-Type (1,380 kg/m³)</option>
                <option value="2600">Stony S-Type (2,600 kg/m³)</option>
                <option value="3200">Dense Chondritic (3,200 kg/m³)</option>
                <option value="7800">Metallic M-Type (7,800 kg/m³)</option>
              </select>
              <div style={{ fontSize: 10, color: "#3d3d3d", marginTop: 4 }}>
                Impacts total mass inertia
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 1, border: "1px solid #1f1f1f" }}>
            <div className="stat-block" style={{ border: "none" }}>
              <div className="stat-label">Asteroid Estimated Mass</div>
              <div className="stat-value" style={{ fontSize: 18 }}>
                {asteroidMassKg.toExponential(2)} <span style={{ fontSize: 11, fontWeight: 400, color: "#737373" }}>kg</span>
              </div>
              <div className="stat-sub">Assuming {asteroidDensity} kg/m³ density</div>
            </div>

            <div className="stat-block" style={{ border: "none" }}>
              <div className="stat-label">Achieved Deflection Δv</div>
              <div className="stat-value" style={{ fontSize: 18, color: "#fc3d21" }}>
                {deltaVMmS >= 1 ? deltaVMmS.toFixed(3) : deltaVMmS.toExponential(2)}{" "}
                <span style={{ fontSize: 11, fontWeight: 400, color: "#737373" }}>mm/s</span>
              </div>
              <div className="stat-sub">({(deltaVMs * 86400).toFixed(2)} meters / day drift)</div>
            </div>

            <div className="stat-block" style={{ border: "none" }}>
              <div className="stat-label">Lead Time for 1 R_Earth Miss</div>
              <div className="stat-value" style={{ fontSize: 18, color: requiredYears <= 10 ? "#22c55e" : "#f59e0b" }}>
                {requiredYears < 100 ? requiredYears.toFixed(1) : requiredYears.toExponential(1)}{" "}
                <span style={{ fontSize: 11, fontWeight: 400, color: "#737373" }}>Years</span>
              </div>
              <div className="stat-sub">To displace orbit by 6,371 km</div>
            </div>

            <div className="stat-block" style={{ border: "none", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div className="stat-label">Feasibility Assessment</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: requiredYears <= 10 ? "#22c55e" : requiredYears <= 30 ? "#f59e0b" : "#ef4444" }}>
                {requiredYears <= 10 ? "Tactically Feasible" : requiredYears <= 30 ? "Requires Long-Term Arc" : "Requires Multi-Impactor Fleet"}
              </div>
              <div className="stat-sub">Based on planetary defense lead time window</div>
            </div>
          </div>
        </div>

        {/* Mission Cards Grid */}
        <div className="space-y-6">
          <div className="section-label">Fleet Mission Profiles</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24 }}>
            {MISSIONS.map((m) => (
              <div
                key={m.id}
                style={{
                  backgroundColor: "#0d0d0d",
                  border: "1px solid #1f1f1f",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#404040")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1f1f1f")}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#525252", fontWeight: 600, textTransform: "uppercase" }}>
                      {m.agency}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        border: `1px solid ${getStatusColor(m.status)}`,
                        color: getStatusColor(m.status),
                      }}
                    >
                      {m.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px", color: "#fff" }}>
                    {m.name}
                  </h3>

                  <div style={{ fontSize: 12, color: "#fc3d21", fontWeight: 600, marginBottom: 12 }}>
                    Target: {m.target}
                  </div>

                  <p style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.6, marginBottom: 12 }}>
                    {m.objective}
                  </p>

                  <div style={{ padding: "10px 12px", backgroundColor: "#000", border: "1px solid #1f1f1f", fontSize: 12, color: "#737373", lineHeight: 1.5, marginBottom: 12 }}>
                    <strong style={{ color: "#fff" }}>Scientific Return: </strong>
                    {m.keyDiscovery}
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #1f1f1f", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 11, color: "#525252", fontFamily: "var(--font-mono)" }}>
                    Launch: {m.launchDate}
                  </div>

                  <Link
                    href={`/?analyze=${encodeURIComponent(m.targetDes)}`}
                    onClick={() => playTelemetryClick()}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#fc3d21",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Analyze Target Orbit
                    <IconChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
