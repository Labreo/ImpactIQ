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

  if (loading) return <div className="p-5 text-zinc-500 text-sm">Loading Comparison Data...</div>;
  if (!data || data.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Top Threats: Sentry Object Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium rounded-tl-lg">Object</th>
              <th className="px-4 py-3 font-medium">Impact Prob</th>
              <th className="px-4 py-3 font-medium">Energy (Mt)</th>
              <th className="px-4 py-3 font-medium">Torino</th>
              <th className="px-4 py-3 font-medium">Insight Score</th>
              <th className="px-4 py-3 font-medium rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {data.map((obj) => (
              <tr key={obj.designation} className="hover:bg-zinc-800/30 transition">
                <td className="px-4 py-3 font-medium text-white">{obj.fullname || obj.designation}</td>
                <td className="px-4 py-3 font-mono text-xs">{obj.ip.toExponential(2)}</td>
                <td className="px-4 py-3 font-mono text-xs">{obj.energy_mt.toFixed(1)}</td>
                <td className="px-4 py-3">{obj.torino_scale}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-400">{obj.insight_score}</span>
                    <span className="text-xs text-zinc-500">{obj.insight_label}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => onSelect(obj.designation)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition"
                  >
                    Analyze
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
