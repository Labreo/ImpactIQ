"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  isStreaming?: boolean;
}

export default function GenericChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isGenerating) return;

    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, sender: "user", text }]);
    setInput("");
    setIsGenerating(true);

    setTimeout(() => {
      const botResponseText =
        "Asteroid 101955 Bennu is classified as one of the most hazardous known near-Earth objects. While exact trajectories in the distant future are difficult to predict with certainty, several computer models suggest an impact could occur in the late 22nd century.\n\nIf Bennu collides with Earth, the kinetic energy released would be catastrophic—equivalent to thousands of nuclear weapons detonating at once, causing massive blast waves, continent-wide fires, and atmospheric devastation. Because orbital paths are chaotic and unpredictable over centuries, space agencies remain on high alert.";

      const botMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, sender: "bot", text: "", isStreaming: true },
      ]);
      setIsGenerating(false);

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
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const promptSuggestion = "Will asteroid 101955 Bennu hit Earth in the future? Should we actually be worried?";

  return (
    <div className="flex h-screen w-screen bg-[#212121] text-[#ececec] font-sans antialiased overflow-hidden select-none">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#171717] border-r border-[#2f2f2f] flex flex-col justify-between hidden md:flex flex-shrink-0">
        {/* Top: New Chat & History */}
        <div className="p-3 flex flex-col gap-3">
          <button
            onClick={() => {
              setMessages([]);
              setInput("");
            }}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] rounded-lg border border-[#333] transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#9b9b9b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New chat</span>
            </div>
            <span className="text-xs text-[#707070]">⌘K</span>
          </button>

          <div className="mt-2">
            <div className="text-[11px] font-semibold text-[#8e8e8e] px-3 py-1 uppercase tracking-wider">
              Recent
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {[
                "Mars atmospheric composition",
                "Python script for telemetry parsing",
                "Orbital mechanics summary",
                "Keplerian elements explanation",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#b4b4b4] hover:bg-[#212121] rounded-lg cursor-pointer transition-colors truncate"
                >
                  <svg className="w-4 h-4 text-[#707070] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="truncate text-xs">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom User Profile */}
        <div className="p-3 border-t border-[#2f2f2f]">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#212121] cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#10a37f] text-white flex items-center justify-center text-xs font-semibold">
                U
              </div>
              <span className="text-xs font-medium text-[#ececec]">User Account</span>
            </div>
            <svg className="w-4 h-4 text-[#8e8e8e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>
        </div>
      </aside>

      {/* Main Chat Body */}
      <main className="flex-1 flex flex-col h-full bg-[#212121] overflow-hidden">
        {/* Top App Bar */}
        <header className="h-14 px-4 border-b border-[#2f2f2f] flex items-center justify-between flex-shrink-0 bg-[#212121]">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-[#2f2f2f] cursor-pointer">
              <span className="text-sm font-semibold text-[#ececec]">ChatGPT</span>
              <span className="text-xs text-[#8e8e8e]">4o</span>
              <svg className="w-3.5 h-3.5 text-[#8e8e8e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#8e8e8e]">
            <span>Temporary Chat</span>
            <div className="w-8 h-4 bg-[#3b3b3b] rounded-full relative cursor-pointer">
              <div className="w-3 h-3 bg-[#ececec] rounded-full absolute top-0.5 right-0.5" />
            </div>
          </div>
        </header>

        {/* Message Thread or Empty State */}
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col justify-center">
          {messages.length === 0 ? (
            <div className="max-w-xl mx-auto w-full text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-[#10a37f] text-white flex items-center justify-center text-xl font-bold mx-auto shadow-lg">
                ✦
              </div>
              <h2 className="text-2xl font-semibold text-[#ececec]">
                What can I help with today?
              </h2>

              <div className="grid grid-cols-2 gap-2 text-left pt-2">
                <button
                  onClick={() => {
                    setInput(promptSuggestion);
                    handleSend(promptSuggestion);
                  }}
                  className="p-3 bg-[#2a2a2a] hover:bg-[#333] border border-[#383838] rounded-xl text-xs text-[#d1d5db] transition-colors group"
                >
                  <div className="font-semibold text-white mb-1 group-hover:text-[#10a37f]">Asteroid Risk</div>
                  <div className="text-[#8e8e8e] truncate">Will asteroid Bennu hit Earth in the future?</div>
                </button>

                <button
                  onClick={() => {
                    setInput("Explain planetary orbital mechanics");
                    handleSend("Explain planetary orbital mechanics");
                  }}
                  className="p-3 bg-[#2a2a2a] hover:bg-[#333] border border-[#383838] rounded-xl text-xs text-[#d1d5db] transition-colors"
                >
                  <div className="font-semibold text-white mb-1">Explain Concept</div>
                  <div className="text-[#8e8e8e] truncate">Explain planetary orbital mechanics</div>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full space-y-6 my-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-[#10a37f] text-white flex items-center justify-center text-xs flex-shrink-0 font-bold mt-1">
                      ✦
                    </div>
                  )}

                  <div
                    className={`px-4 py-3 rounded-2xl max-w-2xl text-[14.5px] leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-[#2f2f2f] text-[#ececec]"
                        : "text-[#d1d5db] font-normal"
                    }`}
                  >
                    {msg.text}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-4 bg-[#ececec] ml-1 animate-pulse align-middle" />
                    )}
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex items-center gap-3 text-sm text-[#8e8e8e] pl-11">
                  <div className="w-2 h-2 rounded-full bg-[#8e8e8e] animate-ping" />
                  <span>Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Field */}
        <div className="p-4 bg-[#212121] flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-[#2f2f2f] rounded-2xl border border-[#3f3f3f] shadow-lg flex items-end px-3 py-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message ChatGPT..."
                className="w-full bg-transparent text-[#ececec] placeholder-[#8e8e8e] text-sm outline-none resize-none max-h-36 py-1.5 px-2"
                style={{ height: "auto" }}
              />

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isGenerating}
                className={`p-1.5 rounded-full mb-0.5 ml-2 transition-colors flex-shrink-0 ${
                  input.trim() && !isGenerating
                    ? "bg-white text-black hover:bg-[#e0e0e0]"
                    : "bg-[#424242] text-[#707070] cursor-not-allowed"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>

            <div className="text-center text-[11px] text-[#707070] mt-2">
              ChatGPT can make mistakes. Check important info.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
