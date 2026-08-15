"use client";
import { useState } from "react";
import { playTelemetryClick, playRadarPing } from "@/utils/audioFx";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const QUICK_QUESTIONS = [
  "When will radar astrometry confirm this trajectory?",
  "What is the estimated blast radius & damage category?",
  "How does this empirical probability compare with JPL Sentry?",
];

export default function ChatWidget({ contextData }: { contextData: Record<string, unknown> }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const ask = async (textToAsk: string) => {
    if (!textToAsk.trim() || loading) return;

    playTelemetryClick();
    const userMessage = textToAsk.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage, context: contextData }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply || "I do not have sufficient observation data in this telemetry arc to answer that.",
        },
      ]);
      playRadarPing(1100);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Telemetry link timeout while querying IBM Granite." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(query);
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-telemetry font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>Flight Interrogator Terminal</span>
        </span>
        <span className="text-[9px] text-slate-500 font-telemetry">Grounding: Observational Arc</span>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => ask(q)}
            disabled={loading}
            className="text-[10px] px-2.5 py-1 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 transition hover:border-cyan-500/40 disabled:opacity-50 text-left font-telemetry cursor-pointer"
          >
            &gt; {q}
          </button>
        ))}
      </div>

      {/* Conversation Thread */}
      {messages.length > 0 && (
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`text-xs px-3 py-2 rounded-lg max-w-[90%] leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#0b3d91] text-white border border-blue-400/30 font-telemetry"
                    : "bg-slate-950 border border-slate-800 text-slate-200 shadow-md font-sans"
                }`}
              >
                <span className="text-[9px] font-telemetry uppercase tracking-wider block opacity-70 mb-0.5">
                  {m.role === "user" ? "FLIGHT CONTROLLER QUERY" : "IBM GRANITE TELEMETRY"}
                </span>
                {m.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-2.5 text-xs text-cyan-500 font-telemetry font-bold">&gt;</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Transmit technical question (e.g. radar epoch, blast radius)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition placeholder:text-slate-600 font-sans"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-telemetry font-bold uppercase tracking-wider disabled:opacity-40 transition cursor-pointer"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
