"use client";
import { useState } from "react";

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
          text: data.reply || "I do not have sufficient observation data to answer that.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Network connection error while querying Granite." },
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
    <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
          Query Granite Follow-Up Console
        </span>
        <span className="text-[11px] text-slate-500 font-telemetry">Strict Astrodynamic Grounding</span>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => ask(q)}
            disabled={loading}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition hover:border-slate-700 disabled:opacity-50 text-left font-telemetry"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Conversation Thread */}
      {messages.length > 0 && (
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`text-xs px-4 py-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm font-sans"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a technical or physical follow-up question..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition placeholder:text-slate-600 font-sans"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider disabled:opacity-40 transition"
        >
          {loading ? "Querying..." : "Transmit"}
        </button>
      </form>
    </div>
  );
}
