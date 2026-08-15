"use client";
import { useState } from "react";
import { playTelemetryClick, playRadarPing } from "@/utils/audioFx";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const QUICK_QUESTIONS = [
  "When will radar astrometry confirm this trajectory?",
  "What is the estimated blast radius and damage category?",
  "How does this probability compare with JPL Sentry?",
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
        { role: "ai", text: data.reply || "Insufficient observation data to answer this query." },
      ]);
      playRadarPing(1100);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Connection timeout while querying IBM Granite." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #1f1f1f", backgroundColor: "#0d0d0d" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid #1f1f1f",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="live-dot" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#a3a3a3" }}>Ask IBM Granite</span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#3d3d3d" }}>
          Grounded on observational data
        </span>
      </div>

      {/* Suggested questions */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1f1f1f", display: "flex", flexWrap: "wrap", gap: 6 }}>
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => ask(q)}
            disabled={loading}
            style={{
              fontSize: 11,
              padding: "4px 10px",
              backgroundColor: "transparent",
              border: "1px solid #2a2a2a",
              color: "#525252",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#a3a3a3";
              e.currentTarget.style.borderColor = "#404040";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#525252";
              e.currentTarget.style.borderColor = "#2a2a2a";
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message thread */}
      {messages.length > 0 && (
        <div style={{ padding: "12px 16px", maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "88%",
                padding: "10px 14px",
                backgroundColor: m.role === "user" ? "#141414" : "#000",
                border: `1px solid ${m.role === "user" ? "#fc3d21" : "#2a2a2a"}`,
                borderLeft: m.role === "ai" ? "2px solid #fc3d21" : undefined,
              }}>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3d3d3d", marginBottom: 5 }}>
                  {m.role === "user" ? "You" : "IBM Granite"}
                </div>
                <p style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.6, margin: 0 }}>
                  {m.text}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex" }}>
              <div style={{ padding: "10px 14px", border: "1px solid #2a2a2a", borderLeft: "2px solid #fc3d21" }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: 4, height: 4, borderRadius: "50%",
                      backgroundColor: "#525252",
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); ask(query); }}
        style={{ padding: "12px 16px", display: "flex", gap: 8, borderTop: messages.length > 0 ? "1px solid #1f1f1f" : "none" }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a technical question about this object..."
          disabled={loading}
          className="input-field"
          style={{ flex: 1, padding: "8px 12px", fontSize: 12 }}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn btn-primary"
          style={{ padding: "8px 16px", minWidth: 64, fontSize: 12 }}
        >
          {loading ? "…" : "Ask"}
        </button>
      </form>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
