"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CompareObject {
  designation: string;
  fullname: string;
  ip: number;
  energy_mt: number;
  torino_scale: number;
  palermo_scale: number;
  insight_score: number;
  insight_label: string;
}

export default function CompareDashboard({ onSelect }: { onSelect: (des: string) => void }) {
  const [data, setData] = useState<CompareObject[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/compare`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-slate-500 text-xs font-telemetry glass-panel rounded-2xl">Retrieving JPL Sentry Multi-Object Threat Matrix...</div>;
  if (!data || data.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-200">
          JPL Sentry Monitored Threat Matrix (Priority Triage)
        </h3>
        <span className="text-[11px] font-telemetry text-slate-500">Autonomous Astrodynamic Ranking</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-wider font-telemetry">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-lg">Designation</th>
              <th className="px-4 py-3 font-semibold">Impact Probability P(i)</th>
              <th className="px-4 py-3 font-semibold">Kinetic Yield (MT)</th>
              <th className="px-4 py-3 font-semibold">Torino</th>
              <th className="px-4 py-3 font-semibold">ImpactIQ Index</th>
              <th className="px-4 py-3 font-semibold rounded-tr-lg">Ephemeris</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-telemetry">
            {data.map((obj) => (
              <tr key={obj.designation} className="hover:bg-slate-900/50 transition">
                <td className="px-4 py-3 font-bold text-white font-sans">{obj.fullname || obj.designation}</td>
                <td className="px-4 py-3 text-cyan-300 font-bold">{obj.ip.toExponential(2)}</td>
                <td className="px-4 py-3 text-amber-300">{obj.energy_mt.toFixed(1)} MT</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded font-bold ${obj.torino_scale > 0 ? "bg-amber-950/80 text-amber-300 border border-amber-500/40" : "text-slate-400"}`}>
                    {obj.torino_scale}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{obj.insight_score}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{obj.insight_label}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => onSelect(obj.designation)}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-cyan-950/80 text-cyan-300 hover:bg-cyan-900 border border-cyan-600/40 uppercase tracking-wider transition"
                  >
                    Analyze Ephemeris
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
