import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { IconChevronRight, IconShieldCheck } from "@/components/Icons";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-6 py-10 flex-1 space-y-12">
        {/* Header */}
        <div>
          <div className="section-label mb-3">System Architecture & Mathematical Foundations</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.8px", margin: 0, color: "#fff" }}>
            Scientific Methodology & Physics Engine
          </h1>
          <p style={{ fontSize: 14, color: "#737373", marginTop: 8, maxWidth: 780, lineHeight: 1.6 }}>
            ImpactIQ couples real-time astrodynamics data from NASA JPL with numerical orbital propagation, hydrodynamic impact consequence scaling, and IBM Granite AI synthesis.
          </p>
        </div>

        {/* 4-Step Technical Architecture Diagram */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {/* Step 1 */}
          <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", padding: "20px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#fc3d21", textTransform: "uppercase", marginBottom: 8 }}>
              01 · Telemetry Ingestion
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>
              JPL SBDB & Horizons
            </h3>
            <p style={{ fontSize: 12, color: "#a3a3a3", lineHeight: 1.6, margin: 0 }}>
              Retrieves authoritative osculating Keplerian orbital elements ($a, e, i, \Omega, \omega, M$), epoch, absolute magnitude ($H$), and 6-DOF covariance uncertainty matrices.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", padding: "20px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#fc3d21", textTransform: "uppercase", marginBottom: 8 }}>
              02 · Orbit Propagation
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>
              Keplerian + N-Body
            </h3>
            <p style={{ fontSize: 12, color: "#a3a3a3", lineHeight: 1.6, margin: 0 }}>
              Solves Kepler&apos;s transcendental equation via Newton-Raphson iteration ($M = E - e \sin E$), coupled with point-mass gravitational perturbations from 8 major solar system bodies.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", padding: "20px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#fc3d21", textTransform: "uppercase", marginBottom: 8 }}>
              03 · Risk & Consequence
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>
              Monte Carlo & Collins (2005)
            </h3>
            <p style={{ fontSize: 12, color: "#a3a3a3", lineHeight: 1.6, margin: 0 }}>
              Samples 1,000 to 5,000 stochastic orbital pathways to calculate empirical $P(i)$, Palermo and Torino scales, and π-scaling hydrodynamic crater/airburst damage radii.
            </p>
          </div>

          {/* Step 4 */}
          <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", padding: "20px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#fc3d21", textTransform: "uppercase", marginBottom: 8 }}>
              04 · Autonomous Directive
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>
              IBM Granite + Guardian
            </h3>
            <p style={{ fontSize: 12, color: "#a3a3a3", lineHeight: 1.6, margin: 0 }}>
              IBM Granite 3.3 8B Instruct structures domain-expert mission briefs, defended by an adversarial Guardian verification spine that flags ungrounded hallucinations.
            </p>
          </div>
        </div>

        {/* Detailed Mathematical Reference Sections */}
        <div className="space-y-8">
          {/* Section 1: Orbital Mechanics */}
          <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", padding: "24px" }}>
            <div className="section-label mb-2">Section 01 · Astrodynamics</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px", color: "#fff" }}>
              Two-Body Orbit Propagation & Kepler Solver
            </h2>
            <p style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.65, marginBottom: 16 }}>
              The position of an asteroid at any future mean anomaly M(t) = M_0 + n(t - t_0) with mean motion n = √(μ / a³) is determined by solving Kepler&apos;s transcendental equation for Eccentric Anomaly E:
            </p>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, padding: "10px 14px", backgroundColor: "#000", border: "1px solid #1f1f1f", color: "#fc3d21", marginBottom: 16 }}>
              f(E) = E - e · sin(E) - M = 0  ⟶  E[k+1] = E[k] - [E[k] - e · sin(E[k]) - M] / [1 - e · cos(E[k])]
            </div>
            <p style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.65 }}>
              The true anomaly ν is converted to heliocentric orbital plane Cartesian state coordinates (x_orb, y_orb), then rotated into standard J2000 ecliptic coordinates via Euler rotation matrix R_z(-Ω) R_x(-i) R_z(-ω).
            </p>
          </div>

          {/* Section 2: Hydrodynamic Consequence Scaling */}
          <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", padding: "24px" }}>
            <div className="section-label mb-2">Section 02 · Hydrodynamics</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px", color: "#fff" }}>
              Impact Consequence & Blast Scaling (Collins et al. 2005)
            </h2>
            <p style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.65, marginBottom: 16 }}>
              Kinetic energy yield (E_k = ½ m v_i²) determines whether an impactor undergoes explosive atmospheric disruption (airburst) or creates a transient ground crater. The transient crater diameter D_tc is calculated using π-group scaling:
            </p>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, padding: "10px 14px", backgroundColor: "#000", border: "1px solid #1f1f1f", color: "#fc3d21", marginBottom: 16 }}>
              D_tc = 1.161 · (ρ_i / ρ_t)^(1/3) · d^(0.78) · v_i^(0.44) · g^(-0.22) · sin^(1/3)(θ)
            </div>
            <p style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.65 }}>
              For atmospheric airbursts, the pancake disruption model calculates stagnation pressure ρ_atm(z) v² ≥ σ_yield, causing catastrophic fragmentation, generating thermal radiation pulses and blast wave overpressures (Δp ≥ 1 psi for window breakage, Δp ≥ 4 psi for structural collapse).
            </p>
          </div>

          {/* Section 3: IBM Granite & Guardian Falsification Spine */}
          <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", padding: "24px" }}>
            <div className="section-label mb-2">Section 03 · Verifiable AI Pipeline</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px", color: "#fff" }}>
              IBM Granite 3.3 8B Instruct & Guardian Falsification Spine
            </h2>
            <p style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.65, marginBottom: 16 }}>
              AI outputs in planetary defense must be rigorously grounded in physical telemetry. ImpactIQ implements a two-stage verification architecture:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              <div style={{ padding: "14px 16px", backgroundColor: "#000", border: "1px solid #1f1f1f" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fc3d21", textTransform: "uppercase", marginBottom: 4 }}>
                  Stage 1 · Deterministic Synthesis
                </div>
                <p style={{ fontSize: 12, color: "#737373", lineHeight: 1.5, margin: 0 }}>
                  Granite receives structured numerical context (exact miss distance AU, velocity km/s, Torino scale, Collins MT yield) and formats executive directives under strict schema bounds.
                </p>
              </div>

              <div style={{ padding: "14px 16px", backgroundColor: "#000", border: "1px solid #1f1f1f" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <IconShieldCheck className="w-3.5 h-3.5" />
                  Stage 2 · Adversarial Guardian Audit
                </div>
                <p style={{ fontSize: 12, color: "#737373", lineHeight: 1.5, margin: 0 }}>
                  A second independent Guardian evaluation pass verifies that claims do not contradict mathematical ground truth, flagging and intercepting unverified hallucinations before display.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sources & Attributions */}
        <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #1f1f1f", padding: "20px 24px" }}>
          <div className="section-label mb-2">Attributions & Open Science</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>
            Authoritative Space Agency Data Sources
          </h3>
          <ul style={{ fontSize: 13, color: "#737373", lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
            <li><strong>NASA Jet Propulsion Laboratory (JPL):</strong> Small-Body Database (SBDB) API &amp; Horizons Ephemeris System.</li>
            <li><strong>NASA CNEOS:</strong> Center for Near-Earth Object Studies Sentry Impact Monitoring Tables.</li>
            <li><strong>IAU Minor Planet Center (MPC):</strong> Optical and radar astrometry observation arcs.</li>
            <li><strong>IBM Research / watsonx:</strong> Granite 3.3 8B Instruct foundational reasoning model.</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <Link href="/" className="btn btn-primary" style={{ textDecoration: "none", fontSize: 13, padding: "12px 28px" }}>
            Launch Planetary Defense Command Center
            <IconChevronRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
