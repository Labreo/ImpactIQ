import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ChatWidget({ contextData }: { contextData: any }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{role: "user"|"ai", text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage = query.trim();
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage, context: contextData })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.reply || "Sorry, I couldn't generate a response." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "Network error occurred while asking." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-zinc-700/50">
      <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`text-sm px-3 py-2 rounded-lg max-w-[85%] ${
              m.role === "user" ? "bg-blue-600/30 text-blue-200" : "bg-zinc-800 text-zinc-300"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition placeholder:text-zinc-500"
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition"
        >
          {loading ? "..." : "Ask"}
        </button>
      </form>
    </div>
  );
}
