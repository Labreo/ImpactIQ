"use client";

interface ConsequenceData {
  diameter_m: number; energy_mt: number; energy_hiroshima: number;
  airburst: boolean; airburst_altitude_km: number; crater_diameter_m: number;
  damage_category: string; damage_radius_km: number; impact_velocity_kms: number;
  disclaimer: string;
}

const CATEGORY_COLOR: Record<string, string> = {
  negligible: "text-zinc-400", local: "text-yellow-400",
  regional: "text-orange-400", continental: "text-red-400", global: "text-red-600",
};

export default function ConsequencePanel({ data }: { data: ConsequenceData }) {
  const catColor = CATEGORY_COLOR[data.damage_category] ?? "text-zinc-300";

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">
        Impact Consequence Estimate
        <span className="ml-2 text-zinc-600 normal-case">(hypothetical — EIEP methodology)</span>
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Diameter" value={`${data.diameter_m.toFixed(0)} m`} />
        <Stat label="Energy" value={`${data.energy_mt < 1 ? data.energy_mt.toFixed(3) : data.energy_mt.toFixed(1)} MT`}
          sub={`${data.energy_hiroshima.toFixed(0)}× Hiroshima`} />
        <Stat label="Type" value={data.airburst ? "Airburst" : "Ground Impact"}
          sub={data.airburst ? `at ~${data.airburst_altitude_km.toFixed(0)} km alt.` : `crater ~${(data.crater_diameter_m / 1000).toFixed(1)} km`} />
        <Stat label="Velocity" value={`${data.impact_velocity_kms.toFixed(1)} km/s`} />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1 rounded-lg bg-zinc-800 p-3">
          <p className="text-xs text-zinc-500 mb-0.5">Damage Category</p>
          <p className={`text-lg font-bold capitalize ${catColor}`}>{data.damage_category}</p>
          <p className="text-xs text-zinc-400">Blast radius ≈ {data.damage_radius_km.toFixed(0)} km</p>
        </div>
        <p className="text-xs text-zinc-600 max-w-xs">{data.disclaimer}</p>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
      <p className="text-base font-semibold text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-400">{sub}</p>}
    </div>
  );
}
