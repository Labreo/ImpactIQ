"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { IconVolumeOn, IconVolumeOff } from "./Icons";
import { setAudioMuted, playTelemetryClick } from "@/utils/audioFx";

const NAV_LINKS = [
  { href: "/", label: "Command Center" },
  { href: "/missions", label: "Missions" },
  { href: "/sentry", label: "Sentry Watch" },
  { href: "/orbits", label: "Orbits" },
  { href: "/about", label: "About & Physics" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [utcTime, setUtcTime] = useState<string>("");
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    const timer = setTimeout(update, 0);
    const interval = setInterval(update, 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
    if (!next) playTelemetryClick();
  };

  return (
    <header style={{ backgroundColor: "#000", borderBottom: "1px solid #1f1f1f" }} className="sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <Image
              src="/logo.png"
              alt="ImpactIQ"
              width={28}
              height={28}
              className="rounded-sm object-cover"
              priority
            />
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px", color: "#fff" }}>ImpactIQ</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => playTelemetryClick()}
                  style={{
                    fontSize: 13,
                    color: isActive ? "#ffffff" : "#737373",
                    fontWeight: isActive ? 600 : 400,
                    padding: "16px 0",
                    textDecoration: "none",
                    borderBottom: isActive ? "2px solid #fc3d21" : "2px solid transparent",
                    marginBottom: -1,
                    transition: "color 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#737373"; }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side status & audio */}
        <div className="flex items-center gap-4">
          {/* Live UTC telemetry clock */}
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#737373", letterSpacing: "0.03em" }}>
              {utcTime || "SYNCHRONIZING"}
            </span>
          </div>

          {/* Clean audio toggle with SVG icons */}
          <button
            onClick={toggleMute}
            style={{
              background: "none",
              border: "1px solid #2a2a2a",
              cursor: "pointer",
              padding: "6px 8px",
              color: muted ? "#525252" : "#fc3d21",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
            title={muted ? "Unmute Audio FX" : "Mute Audio FX"}
          >
            {muted ? <IconVolumeOff className="w-3.5 h-3.5" /> : <IconVolumeOn className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
