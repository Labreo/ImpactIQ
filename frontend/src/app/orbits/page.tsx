"use client";
import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconChevronRight } from "@/components/Icons";
import { playTelemetryClick } from "@/utils/audioFx";

const OrbitView = dynamic(() => import("@/components/OrbitView"), { ssr: false });

interface OrbitalFamily {
  id: "apollo" | "aten" | "amor" | "atira";
  name: string;
  definition: string;
  crossingEarth: boolean;
  populationPercent: string;
  representativeExample: {
    name: string;
    des: string;
    semiMajorAxisAu: number;
    eccentricity: number;
    inclinationDeg: number;
    periodYears: number;
    hazardLevel: string;
  };
  samplePath: { x: number; y: number; z: number }[];
}

// Compute simple parametric Keplerian orbits for family representations
function generateSampleOrbit(a: number, e: number, incDeg: number, nPoints = 120) {
  const points: { x: number; y: number; z: number }[] = [];
  const incRad = (incDeg * Math.PI) / 180;
  for (let i = 0; i <= nPoints; i++) {
    const theta = (i / nPoints) * Math.PI * 2;
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
    const x0 = r * Math.cos(theta);
    const y0 = r * Math.sin(theta);
    // Rotate by inclination
    const x = x0;
    const y = y0 * Math.cos(incRad);
    const z = y0 * Math.sin(incRad);
    points.push({ x, y, z });
  }
  return points;
}

const FAMILIES: OrbitalFamily[] = [
  {
    id: "apollo",
    name: "Apollo Asteroid Family",
    definition: "Earth-crossing orbits with semi-major axes larger than Earth's (a > 1.0 AU) and perihelion q < 1.017 AU.",
    crossingEarth: true,
    populationPercent: "~55% of all known NEAs",
    representativeExample: {
      name: "101955 Bennu",
      des: "101955",
      semiMajorAxisAu: 1.126,
      eccentricity: 0.2037,
      inclinationDeg: 6.035,
      periodYears: 1.196,
      hazardLevel: "Potentially Hazardous Object (Sentry Listed)",
    },
    samplePath: generateSampleOrbit(1.126, 0.2037, 6.035),
  },
  {
    id: "aten",
    name: "Aten Asteroid Family",
    definition: "Earth-crossing orbits with semi-major axes smaller than Earth's (a < 1.0 AU) and aphelion Q > 0.983 AU.",
    crossingEarth: true,
    populationPercent: "~8% of all known NEAs",
    representativeExample: {
      name: "99942 Apophis",
      des: "99942",
      semiMajorAxisAu: 0.922,
      eccentricity: 0.1915,
      inclinationDeg: 3.331,
      periodYears: 0.886,
      hazardLevel: "Historic 2029 Close Pass (0.00025 AU)",
    },
    samplePath: generateSampleOrbit(0.922, 0.1915, 3.331),
  },
  {
    id: "amor",
    name: "Amor Asteroid Family",
    definition: "Earth-approaching orbits exterior to Earth's path (1.017 AU < q < 1.3 AU). Orbits do not cross Earth's trajectory currently.",
    crossingEarth: false,
    populationPercent: "~36% of all known NEAs",
    representativeExample: {
      name: "433 Eros",
      des: "433",
      semiMajorAxisAu: 1.458,
      eccentricity: 0.2227,
      inclinationDeg: 10.828,
      periodYears: 1.761,
      hazardLevel: "Non-Hazardous (Visited by NEAR Shoemaker)",
    },
    samplePath: generateSampleOrbit(1.458, 0.2227, 10.828),
  },
  {
    id: "atira",
    name: "Atira (Apohele) Family",
    definition: "Orbits entirely interior to Earth's orbit with aphelion distance Q < 0.983 AU. Extremely difficult to discover from ground telescopes due to solar glare.",
    crossingEarth: false,
    populationPercent: "<1% of all known NEAs (<40 known objects)",
    representativeExample: {
      name: "163693 Atira",
      des: "163693",
      semiMajorAxisAu: 0.741,
      eccentricity: 0.3222,
      inclinationDeg: 25.617,
      periodYears: 0.638,
      hazardLevel: "Interior Orbit (NEO Surveyor Priority)",
    },
    samplePath: generateSampleOrbit(0.741, 0.3222, 25.617),
  },
];

export default function OrbitsPage() {
  const [selectedFamilyId, setSelectedFamilyId] = useState<OrbitalFamily["id"]>("apollo");
  const selectedFamily = FAMILIES.find((f) => f.id === selectedFamilyId) || FAMILIES[0];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-6 py-10 flex-1 space-y-10">
        {/* Header */}
        <div>
          <div className="section-label mb-3">Astrodynamics & Orbital Classification</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.8px", margin: 0, color: "#fff" }}>
            Near-Earth Asteroid Orbital Families
          </h1>
          <p style={{ fontSize: 14, color: "#737373", marginTop: 8, maxWidth: 760, lineHeight: 1.6 }}>
            Near-Earth Asteroids (NEAs) are divided into four dynamic orbital classes based on their semi-major axis ($a$), perihelion distance ($q$), and aphelion distance ($Q$) relative to Earth&apos;s 1.000 AU heliocentric path.
          </p>
        </div>

        {/* Family Selector Tabs */}
        <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", padding: "16px 20px" }}>
          <div className="tab-bar mb-4">
            {FAMILIES.map((family) => (
              <button
                key={family.id}
                className={`tab-item ${selectedFamilyId === family.id ? "active" : ""}`}
                onClick={() => {
                  playTelemetryClick();
                  setSelectedFamilyId(family.id);
                }}
              >
                {family.name}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ fontSize: 13, color: "#a3a3a3", margin: 0, maxWidth: 700 }}>
              {selectedFamily.definition}
            </p>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                backgroundColor: selectedFamily.crossingEarth ? "#1c0a0a" : "#0d1b2a",
                border: `1px solid ${selectedFamily.crossingEarth ? "#fc3d21" : "#1d4ed8"}`,
                color: selectedFamily.crossingEarth ? "#fc3d21" : "#60a5fa",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {selectedFamily.crossingEarth ? "Earth-Crossing Orbit" : "Non-Crossing Orbit"}
            </span>
          </div>
        </div>

        {/* 3D Visualizer for Selected Orbital Family */}
        <div style={{ border: "1px solid #1f1f1f" }}>
          <div style={{ padding: "12px 16px", backgroundColor: "#0d0d0d", borderBottom: "1px solid #1f1f1f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
              Representative Trajectory: {selectedFamily.representativeExample.name}
            </span>
            <span style={{ fontSize: 11, color: "#525252", fontFamily: "var(--font-mono)" }}>
              {selectedFamily.populationPercent}
            </span>
          </div>
          <OrbitView orbitPath={selectedFamily.samplePath} />
        </div>

        {/* Orbital Elements & Physical Architecture Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <div className="stat-block">
            <div className="stat-label">Semi-Major Axis (a)</div>
            <div className="stat-value">{selectedFamily.representativeExample.semiMajorAxisAu.toFixed(3)} <span style={{ fontSize: 12, color: "#737373" }}>AU</span></div>
            <div className="stat-sub">Average distance from the Sun</div>
          </div>

          <div className="stat-block">
            <div className="stat-label">Orbital Eccentricity (e)</div>
            <div className="stat-value">{selectedFamily.representativeExample.eccentricity.toFixed(4)}</div>
            <div className="stat-sub">0 = Circular, &gt;0 = Elliptical</div>
          </div>

          <div className="stat-block">
            <div className="stat-label">Orbital Inclination (i)</div>
            <div className="stat-value">{selectedFamily.representativeExample.inclinationDeg.toFixed(2)}°</div>
            <div className="stat-sub">Tilt relative to Earth ecliptic plane</div>
          </div>

          <div className="stat-block">
            <div className="stat-label">Orbital Period (T)</div>
            <div className="stat-value">{selectedFamily.representativeExample.periodYears.toFixed(2)} <span style={{ fontSize: 12, color: "#737373" }}>Yrs</span></div>
            <div className="stat-sub">Kepler&apos;s Third Law: T = a^(3/2)</div>
          </div>
        </div>

        {/* Deep Dive Action Banner */}
        <div style={{ padding: "20px 24px", backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", borderLeft: "3px solid #fc3d21", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>
              Analyze {selectedFamily.representativeExample.name} in Full Astrodynamics Engine
            </h3>
            <p style={{ fontSize: 13, color: "#737373", margin: 0 }}>
              Run live Monte Carlo propagation, hydrodynamic consequence scaling, and IBM Granite AI synthesis.
            </p>
          </div>

          <Link
            href={`/?analyze=${encodeURIComponent(selectedFamily.representativeExample.des)}`}
            onClick={() => playTelemetryClick()}
            className="btn btn-primary"
            style={{ textDecoration: "none", fontSize: 12 }}
          >
            Launch Orbit Engine
            <IconChevronRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
