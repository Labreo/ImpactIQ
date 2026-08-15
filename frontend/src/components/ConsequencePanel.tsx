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
  negligible: { badge: "bg-slate-900 text-slate-400 border-slate-700", text: "text-slate-400" },
  local: { badge: "bg-amber-950/80 text-amber-300 border-amber-500/50", text: "text-amber-400" },
  regional: { badge: "bg-orange-950/80 text-orange-300 border-orange-500/50", text: "text-orange-400" },
  continental: { badge: "bg-rose-950/80 text-rose-300 border-rose-500/50", text: "text-rose-400" },
  global: { badge: "bg-red-950 text-red-400 border-red-500 font-bold", text: "text-red-500 font-bold" },
};

export default function ConsequencePanel({ data }: { data: ConsequenceData }) {
  const catStyle = CATEGORY_STYLES[data.damage_category] ?? CATEGORY_STYLES["local"];

  return (
    <div className="nasa-panel corner-bracket rounded-xl border border-slate-800 p-5 space-y-4 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-amber-400" />
          <h3 className="text-[11px] font-telemetry font-bold tracking-widest text-slate-300 uppercase">
            {"//"} SEC.03 {"//"} HYDRODYNAMIC IMPACT CONSEQUENCE SCALING
          </h3>
        </div>
        <span className="text-[9px] text-slate-500 font-telemetry">
          COLLINS ET AL. (2005) PI-SCALING ALGORITHM
        </span>
      </div>

      {/* 4-Stat Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950/90 rounded-lg p-3 border border-slate-800/80 font-telemetry">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">ESTIMATED DIAMETER</span>
          <span className="text-lg font-bold text-white mt-0.5 block">
            {data.diameter_m.toFixed(0)} m
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {(data.diameter_m / 1000).toFixed(2)} km cross-section
          </span>
        </div>

        <div className="bg-slate-950/90 rounded-lg p-3 border border-slate-800/80 font-telemetry">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">KINETIC ENERGY YIELD</span>
          <span className="text-lg font-bold text-amber-300 mt-0.5 block">
            {data.energy_mt < 1 ? data.energy_mt.toFixed(3) : data.energy_mt.toFixed(1)} MT
          </span>
          <span className="text-[10px] text-amber-500/80 mt-0.5 block">
            ≈ {data.energy_hiroshima.toLocaleString(undefined, { maximumFractionDigits: 0 })}× Hiroshima
          </span>
        </div>

        <div className="bg-slate-950/90 rounded-lg p-3 border border-slate-800/80 font-telemetry">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">ENTRY MECHANISM</span>
          <span className="text-lg font-bold text-cyan-300 mt-0.5 block">
            {data.airburst ? "Airburst" : "Crater Impact"}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {data.airburst
              ? `Disruption @ ~${data.airburst_altitude_km.toFixed(0)} km alt`
              : `Transient Crater ~${(data.crater_diameter_m / 1000).toFixed(1)} km`}
          </span>
        </div>

        <div className="bg-slate-950/90 rounded-lg p-3 border border-slate-800/80 font-telemetry">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">ENTRY VELOCITY</span>
          <span className="text-lg font-bold text-white mt-0.5 block">
            {data.impact_velocity_kms.toFixed(1)} km/s
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {(data.impact_velocity_kms * 3600).toFixed(0)} km/h velocity
          </span>
        </div>
      </div>

      {/* Severity & Damage Radius Banner */}
      <div className="bg-slate-950/90 rounded-lg p-3.5 border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-telemetry">
        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded border font-bold text-[10px] uppercase tracking-wider ${catStyle.badge}`}>
            {data.damage_category} SEVERITY
          </div>
          <div>
            <p className="text-xs text-slate-200">
              Blast Overpressure (1 psi window breakage radius):{" "}
              <strong className="text-cyan-400 text-sm">~{data.damage_radius_km.toFixed(0)} km</strong>
            </p>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">{data.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
