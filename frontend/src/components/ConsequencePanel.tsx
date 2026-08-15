"use client";

interface ConsequenceData {
  diameter_m: number;
  energy_mt: number;
  energy_hiroshima: number;
  airburst: boolean;
  airburst_altitude_km: number;
  crater_diameter_m: number;
  damage_category: string;
  damage_radius_km: number;
  impact_velocity_kms: number;
  disclaimer: string;
}

const CATEGORY_STYLES: Record<string, { badge: string; text: string }> = {
  negligible: { badge: "bg-slate-800 text-slate-300 border-slate-700", text: "text-slate-400" },
  local: { badge: "bg-amber-950/70 text-amber-300 border-amber-700/50", text: "text-amber-400" },
  regional: { badge: "bg-orange-950/70 text-orange-300 border-orange-700/50", text: "text-orange-400" },
  continental: { badge: "bg-rose-950/70 text-rose-300 border-rose-700/50", text: "text-rose-400" },
  global: { badge: "bg-red-950 text-red-400 border-red-600", text: "text-red-500 font-bold" },
};

export default function ConsequencePanel({ data }: { data: ConsequenceData }) {
  const catStyle = CATEGORY_STYLES[data.damage_category] ?? CATEGORY_STYLES["local"];

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <h3 className="text-xs uppercase tracking-widest text-slate-300 font-semibold">
            Physical Impact Consequence Modeling
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-telemetry">
          EIEP Pi-Scaling Methodology (Collins et al. 2005)
        </span>
      </div>

      {/* 4-Stat Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block font-medium">Estimated Diameter</span>
          <span className="text-xl font-bold text-white font-telemetry mt-0.5 block">
            {data.diameter_m.toFixed(0)} m
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {(data.diameter_m / 1000).toFixed(2)} km cross-section
          </span>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block font-medium">Kinetic Energy</span>
          <span className="text-xl font-bold text-amber-300 font-telemetry mt-0.5 block">
            {data.energy_mt < 1 ? data.energy_mt.toFixed(3) : data.energy_mt.toFixed(1)} MT
          </span>
          <span className="text-[11px] text-amber-500/80 mt-0.5 block">
            ≈ {data.energy_hiroshima.toLocaleString(undefined, { maximumFractionDigits: 0 })}× Hiroshima
          </span>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block font-medium">Mechanism</span>
          <span className="text-xl font-bold text-cyan-300 mt-0.5 block">
            {data.airburst ? "Atmospheric Airburst" : "Ground Impact"}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {data.airburst
              ? `Disruption at ~${data.airburst_altitude_km.toFixed(0)} km alt`
              : `Transient Crater ~${(data.crater_diameter_m / 1000).toFixed(1)} km`}
          </span>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block font-medium">Impact Velocity</span>
          <span className="text-xl font-bold text-white font-telemetry mt-0.5 block">
            {data.impact_velocity_kms.toFixed(1)} km/s
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {(data.impact_velocity_kms * 3600).toFixed(0)} km/h atmospheric entry
          </span>
        </div>
      </div>

      {/* Severity & Damage Radius Banner */}
      <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-lg border font-semibold text-xs uppercase tracking-wider ${catStyle.badge}`}>
            {data.damage_category} Severity
          </div>
          <div>
            <p className="text-xs text-slate-300">
              Blast Overpressure (1 psi window breakage radius):{" "}
              <strong className="text-white font-telemetry text-sm">~{data.damage_radius_km.toFixed(0)} km</strong>
            </p>
            <p className="text-[11px] text-slate-500">{data.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
