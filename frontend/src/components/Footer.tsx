import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #1f1f1f", padding: "32px 0 40px", marginTop: 64, backgroundColor: "#000" }}>
      <div className="max-w-screen-xl mx-auto px-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 22, height: 22, backgroundColor: "#fc3d21", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>IQ</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
              ImpactIQ
            </span>
            <span style={{ fontSize: 12, color: "#525252" }}>
              — Autonomous Near-Earth Object Impact Intelligence Platform
            </span>
          </div>

          <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#525252" }}>
            <Link href="/" className="hover:text-white transition text-neutral-400 no-underline">Command Center</Link>
            <Link href="/missions" className="hover:text-white transition text-neutral-400 no-underline">Missions</Link>
            <Link href="/sentry" className="hover:text-white transition text-neutral-400 no-underline">Sentry Watch</Link>
            <Link href="/orbits" className="hover:text-white transition text-neutral-400 no-underline">Orbits</Link>
            <Link href="/about" className="hover:text-white transition text-neutral-400 no-underline">About & Physics</Link>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, fontSize: 11, color: "#3d3d3d", borderTop: "1px solid #141414", paddingTop: 16 }}>
          <span>Telemetry Sources: NASA JPL Small-Body Database (SBDB) · CNEOS Sentry · Horizons Ephemeris API</span>
          <span>Inference Engine: IBM Granite 3.3 8B Instruct · Guardian Falsification Spine</span>
        </div>
      </div>
    </footer>
  );
}
