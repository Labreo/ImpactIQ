"use client";
import ChatWidget from "./ChatWidget";

interface BriefData {
  title: string; bottom_line: string; if_it_happened: string;
  whats_next: string; guardian_ok: boolean; raw_model: string;
}

export default function AiBriefPanel({ brief }: { brief: BriefData }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-widest text-zinc-500">AI Mission Brief</h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-600">{brief.raw_model}</span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${
            brief.guardian_ok ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"
          }`}>
            {brief.guardian_ok ? "Guardian ✓" : "Guardian ⚠"}
          </span>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-white mb-4">{brief.title}</h2>

      <div className="space-y-4 text-sm">
        <Section label="Bottom Line" text={brief.bottom_line} />
        <Section label="If It Happened" text={brief.if_it_happened} accent />
        <Section label="What Happens Next" text={brief.whats_next} />
      </div>

      <p className="mt-4 text-xs text-zinc-600 border-t border-zinc-800 pt-3">
        AI-generated brief. Grounded in the physics data above. Not an operational prediction.
      </p>
      
      {/* Ask a follow up question (RAG) */}
      <ChatWidget contextData={brief} />
    </div>
  );
}

function Section({ label, text, accent = false }: { label: string; text: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${accent ? "bg-zinc-800/60" : ""}`}>
      <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">{label}</p>
      <p className="text-zinc-300 leading-relaxed">{text || "—"}</p>
    </div>
  );
}
