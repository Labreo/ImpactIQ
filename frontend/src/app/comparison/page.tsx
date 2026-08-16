"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { playTelemetryClick } from "@/utils/audioFx";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  isStreaming?: boolean;
}

const PRESET_PROMPTS = [
  "Will asteroid 101955 Bennu hit Earth? Should we panic?",
  "Can Apophis destroy planet Earth in 2029?",
  "What is the exact collision probability of asteroid 1950 DA?",
];

export default function ComparisonPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      sender: "bot",
      text: "Hello! I am your AI assistant. Ask me anything about space, asteroid threats, or planetary science.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isTyping) return;

    playTelemetryClick();
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, sender: "user", text }]);
    setInput("");
    setIsTyping(true);

    // Generate a generic ungrounded/alarmist response
    setTimeout(() => {
      const botResponseText =
        "Asteroids like this are classified as potentially catastrophic Near-Earth threats! Some computational predictions suggest that an impact could occur in the late 22nd century, causing global shockwaves, continent-wide fires, and devastation equivalent to thousands of nuclear warheads. Because gravitational trajectories are chaotic and unpredictable, scientists cannot rule out an immediate sudden collision, and global planetary defense agencies remain on high alert.";

      const botMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, sender: "bot", text: "", isStreaming: true },
      ]);
      setIsTyping(false);

      // Stream text character by character for realistic live typing feel
      let charIndex = 0;
      const streamInterval = setInterval(() => {
        charIndex += 4;
        if (charIndex >= botResponseText.length) {
          clearInterval(streamInterval);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId
                ? { ...m, text: botResponseText, isStreaming: false }
                : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId
                ? { ...m, text: botResponseText.substring(0, charIndex) }
                : m
            )
          );
        }
      }, 20);
    }, 650);
  };

  const handleReset = () => {
    playTelemetryClick();
    setMessages([
      {
        id: "intro",
        sender: "bot",
        text: "Hello! I am your AI assistant. Ask me anything about space, asteroid threats, or planetary science.",
      },
    ]);
    setInput("");
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full flex flex-col justify-center">
        {/* Header Tag */}
        <div className="mb-4 text-center">
          <span className="inline-block px-3 py-1 bg-red-950/60 border border-red-800/80 text-red-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            The Contrast: Standard LLM vs. Physical Astrodynamics
          </span>
          <h1 className="text-2xl font-bold text-neutral-100">
            Generic AI Assistant (Unconnected to Orbital Math)
          </h1>
          <p className="text-neutral-500 text-xs mt-1">
            Type any question below to see how a standard chatbot guesses without live NASA JPL Keplerian mechanics.
          </p>
        </div>

        {/* Preset Prompt Chips for 1-Click Demo Recording */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <span className="text-xs font-mono text-neutral-500">Quick Prompt:</span>
          {PRESET_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(prompt);
                handleSend(prompt);
              }}
              className="px-3 py-1 bg-[#141414] hover:bg-[#222] border border-[#2a2a2a] rounded text-xs text-neutral-300 transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-400 font-mono ml-2"
            title="Reset Chat"
          >
            Reset Chat
          </button>
        </div>

        {/* Interactive Chat Window */}
        <div className="bg-[#0c0c0c] border border-[#222] rounded-lg overflow-hidden shadow-2xl flex flex-col h-[480px]">
          {/* Window Title Bar */}
          <div className="bg-[#141414] px-4 py-2.5 border-b border-[#222] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#333]" />
              <span className="w-3 h-3 rounded-full bg-[#333]" />
              <span className="w-3 h-3 rounded-full bg-[#333]" />
              <span className="text-xs font-mono text-neutral-400 ml-2">Standard AI Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-red-950/40 border border-red-900/60 text-red-400">
                Physics Solvers: Disconnected
              </span>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs text-neutral-400 font-mono flex-shrink-0">
                    AI
                  </div>
                )}

                <div
                  className={`px-4 py-3 rounded-lg max-w-xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#1f1f1f] text-neutral-100 border border-[#2a2a2a]"
                      : "bg-[#111111] text-neutral-300 border border-[#262626]"
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.isStreaming && (
                    <span className="inline-block w-1.5 h-4 bg-neutral-400 ml-1 animate-pulse align-middle" />
                  )}

                  {msg.sender === "bot" && msg.id !== "intro" && !msg.isStreaming && (
                    <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-red-400/90 font-mono">
                      <span>⚠️ Unverified Speculation</span>
                      <span>Covariance Matrix: NONE</span>
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-neutral-300 font-mono flex-shrink-0">
                    YOU
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 italic">
                <span className="w-2 h-2 rounded-full bg-neutral-500 animate-ping" />
                AI is generating response without physics grounding...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Area */}
          <div className="bg-[#141414] p-3 border-t border-[#222] flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question (e.g. Will asteroid Bennu destroy Earth?)..."
                className="flex-1 bg-black border border-[#2a2a2a] focus:border-red-500 rounded px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none font-sans"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="btn btn-primary px-5 py-2.5 text-xs font-mono uppercase tracking-wider disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-4 flex items-center justify-between text-xs font-mono text-neutral-500">
          <span>Failure Mode: Unconstrained probabilistic hallucination.</span>
          <Link
            href="/"
            className="text-neutral-400 hover:text-white underline underline-offset-4 text-xs font-sans"
          >
            Switch to ImpactIQ Grounded Physics →
          </Link>
        </div>
      </main>
    </div>
  );
}
