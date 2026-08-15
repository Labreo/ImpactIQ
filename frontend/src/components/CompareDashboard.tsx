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

  if (loading) return <div className="p-6 text-slate-500 text-xs font-telemetry nasa-panel rounded-xl">Retrieving JPL Sentry Multi-Object Threat Matrix...</div>;
  if (!data || data.length === 0) return null;

  return (
    <div className="nasa-panel corner-bracket rounded-xl border border-slate-800 p-5 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-cyan-400" />
          <h3 className="text-[11px] font-telemetry font-bold uppercase tracking-widest text-slate-200">
            {"//"} SEC.05 {"//"} DEEP SPACE SURVEILLANCE &amp; SENTRY THREAT RADAR
          </h3>
        </div>
        <span className="text-[9px] font-telemetry text-slate-500">MONITORED POPULATION</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/90 text-slate-400 text-[9px] uppercase tracking-wider font-telemetry">
            <tr>
              <th className="px-3.5 py-2.5 font-bold">Designation</th>
              <th className="px-3.5 py-2.5 font-bold">Impact Prob P(i)</th>
              <th className="px-3.5 py-2.5 font-bold">Kinetic Yield</th>
              <th className="px-3.5 py-2.5 font-bold">Torino</th>
              <th className="px-3.5 py-2.5 font-bold">Insight Score</th>
              <th className="px-3.5 py-2.5 font-bold text-right">Trajectory</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-telemetry">
            {data.map((obj) => (
              <tr key={obj.designation} className="hover:bg-slate-900/60 transition">
                <td className="px-3.5 py-2.5 font-bold text-white font-sans">{obj.fullname || obj.designation}</td>
                <td className="px-3.5 py-2.5 text-cyan-300 font-bold">{obj.ip.toExponential(2)}</td>
                <td className="px-3.5 py-2.5 text-amber-300">{obj.energy_mt.toFixed(1)} MT</td>
                <td className="px-3.5 py-2.5">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${obj.torino_scale > 0 ? "bg-amber-950/80 text-amber-300 border border-amber-500/40" : "text-slate-400"}`}>
                    {obj.torino_scale}
                  </span>
                </td>
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{obj.insight_score}</span>
                    <span className="text-[9px] text-slate-500 uppercase">{obj.insight_label}</span>
                  </div>
                </td>
                <td className="px-3.5 py-2.5 text-right">
                  <button 
                    onClick={() => onSelect(obj.designation)}
                    className="text-[10px] font-telemetry font-bold px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 uppercase tracking-wider transition cursor-pointer"
                  >
                    Load Ephemeris
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
