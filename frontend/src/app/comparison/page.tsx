"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ComparisonPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full flex flex-col justify-center">
        {/* Header Tag */}
        <div className="mb-6 text-center">
          <span className="inline-block px-3 py-1 bg-red-950/60 border border-red-800/80 text-red-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            The Contrast: Standard LLM vs. Physical Telemetry
          </span>
          <h1 className="text-2xl font-bold text-neutral-100">
            Generic AI Chatbot (Unconnected to Astrodynamics)
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Standard foundation models without live orbital mechanics solvers cannot compute trajectory covariances.
          </p>
        </div>

        {/* Unbranded Generic Chat Window */}
        <div className="bg-[#0c0c0c] border border-[#222] rounded-lg overflow-hidden shadow-2xl">
          {/* Window Title Bar */}
          <div className="bg-[#141414] px-4 py-2.5 border-b border-[#222] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#333]" />
              <span className="w-3 h-3 rounded-full bg-[#333]" />
              <span className="w-3 h-3 rounded-full bg-[#333]" />
              <span className="text-xs font-mono text-neutral-400 ml-2">Standard AI Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-400">
                Physics: Disconnected
              </span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-6 space-y-6">
            {/* User Prompt */}
            <div className="flex items-start gap-3 justify-end">
              <div className="bg-[#1f1f1f] text-neutral-100 px-4 py-3 rounded-lg max-w-lg text-sm border border-[#2a2a2a]">
                <p className="font-medium text-white">
                  Will asteroid 101955 Bennu hit Earth in the future? Should we be worried?
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-neutral-300 font-mono">
                YOU
              </div>
            </div>

            {/* Generic Chatbot Response */}
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs text-neutral-400 font-mono">
                AI
              </div>
              <div className="bg-[#111111] text-neutral-300 px-5 py-4 rounded-lg max-w-xl text-sm border border-[#262626] space-y-3 leading-relaxed">
                <p>
                  Asteroid <strong>101955 Bennu</strong> is classified as a potentially hazardous object and poses a significant risk to Earth. Some reports suggest that an impact could occur in the late 22nd century, causing massive devastation and global destruction equivalent to hundreds of nuclear weapons.
                </p>
                <p className="text-neutral-400">
                  Because orbital paths are chaotic and unpredictable, scientists cannot say for sure. An impact could happen at any time if its trajectory changes suddenly, so global space agencies remain on high alert.
                </p>
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-red-400/90 font-mono">
                  <span>⚠️ Unverified speculation</span>
                  <span>JPL Covariance: Missing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Diagnostic Banner */}
          <div className="bg-[#110e0e] border-t border-red-900/40 px-6 py-3 flex items-center justify-between text-xs font-mono">
            <div className="text-red-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>FAILURE MODE: Hallucinated certainty, zero mathematical Keplerian propagation.</span>
            </div>
            <Link
              href="/"
              className="text-neutral-400 hover:text-white underline underline-offset-4 text-xs font-sans"
            >
              Back to Command Center →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
