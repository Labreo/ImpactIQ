"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Points, PointMaterial } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";

interface OrbitPoint { x: number; y: number; z: number; }

const SCALE = 7.5; // AU → scene units

// 3D Starfield
function Starfield({ count = 800 }) {
  const points = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 120;
      pos[i + 1] = (Math.random() - 0.5) * 120;
      pos[i + 2] = (Math.random() - 0.5) * 120;
    }
    return pos;
  }, [count]);

  return (
    <Points positions={points} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#94a3b8" size={0.35} sizeAttenuation depthWrite={false} opacity={0.6} />
    </Points>
  );
}

// Nominal Asteroid Orbit Path
function AsteroidOrbit({ points }: { points: OrbitPoint[] }) {
  const pts = useMemo(
    () => points.map((p) => [p.x * SCALE, p.y * SCALE, p.z * SCALE] as [number, number, number]),
    [points]
  );
  if (pts.length < 2) return null;
  return <Line points={pts} color="#38bdf8" lineWidth={2} />;
}

// Monte Carlo Uncertainty Cloud (Bundle of sampled trajectory lines)
function UncertaintyCloud({ cloud }: { cloud: OrbitPoint[][] }) {
  if (!cloud || cloud.length === 0) return null;
  return (
    <>
      {cloud.map((path, idx) => {
        const pts = path.map((p) => [p.x * SCALE, p.y * SCALE, p.z * SCALE] as [number, number, number]);
        if (pts.length < 2) return null;
        return (
          <Line
            key={idx}
            points={pts}
            color="#00f3ff"
            lineWidth={0.7}
            transparent
            opacity={0.22}
          />
        );
      })}
    </>
  );
}

// Earth Orbit circle
function EarthOrbit() {
  const pts = useMemo(() => {
    const n = 150;
    return Array.from({ length: n + 1 }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [Math.cos(a) * SCALE, Math.sin(a) * SCALE, 0] as [number, number, number];
    });
  }, []);
  return <Line points={pts} color="#059669" lineWidth={1.2} dashed dashSize={0.2} gapSize={0.1} />;
}

// Asteroid & Earth Animated Positions linked to Scrub Progress
function PlanetaryScene({
  orbitPath,
  uncertaintyCloud,
  progress,
}: {
  orbitPath: OrbitPoint[];
  uncertaintyCloud?: OrbitPoint[][];
  progress: number; // 0 to 1
}) {
  const astMeshRef = useRef<any>(null!);
  const earthMeshRef = useRef<any>(null!);

  const astPts = useMemo(
    () => orbitPath.map((p) => [p.x * SCALE, p.y * SCALE, p.z * SCALE] as [number, number, number]),
    [orbitPath]
  );

  // Position Asteroid based on scrub progress
  useEffect(() => {
    if (astPts.length === 0 || !astMeshRef.current) return;
    const exactI = progress * (astPts.length - 1);
    const i = Math.floor(exactI);
    const nextI = Math.min(i + 1, astPts.length - 1);
    const frac = exactI - i;

    astMeshRef.current.position.x = astPts[i][0] + (astPts[nextI][0] - astPts[i][0]) * frac;
    astMeshRef.current.position.y = astPts[i][1] + (astPts[nextI][1] - astPts[i][1]) * frac;
    astMeshRef.current.position.z = astPts[i][2] + (astPts[nextI][2] - astPts[i][2]) * frac;
  }, [progress, astPts]);

  // Position Earth along its 1 AU circle
  useEffect(() => {
    if (!earthMeshRef.current) return;
    const earthAngle = progress * Math.PI * 2;
    earthMeshRef.current.position.x = Math.cos(earthAngle) * SCALE;
    earthMeshRef.current.position.y = Math.sin(earthAngle) * SCALE;
    earthMeshRef.current.position.z = 0;
  }, [progress]);

  return (
    <>
      <Starfield />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={3.5} color="#fbbf24" distance={80} />

      {/* Sun with Corona */}
      <Sphere args={[0.45, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={2.5} />
      </Sphere>

      {/* Earth marker */}
      <Sphere ref={earthMeshRef} args={[0.2, 24, 24]} position={[SCALE, 0, 0]}>
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
      </Sphere>

      <EarthOrbit />

      {/* Asteroid Orbit & Uncertainty Cloud */}
      {orbitPath.length > 0 && (
        <>
          <AsteroidOrbit points={orbitPath} />
          {uncertaintyCloud && <UncertaintyCloud cloud={uncertaintyCloud} />}
          <Sphere ref={astMeshRef} args={[0.16, 20, 20]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#ffffff" emissive="#f43f5e" emissiveIntensity={1.4} />
          </Sphere>
        </>
      )}

      <OrbitControls enablePan={false} minDistance={5} maxDistance={50} makeDefault />
    </>
  );
}

// 2D SVG Twin Fallback Component
function TwoDOrbitFallback({
  orbitPath,
  progress,
}: {
  orbitPath: OrbitPoint[];
  progress: number;
}) {
  const size = 320;
  const center = size / 2;
  const scale2D = 90; // AU -> SVG pixels

  const earthX = center + Math.cos(progress * Math.PI * 2) * scale2D;
  const earthY = center + Math.sin(progress * Math.PI * 2) * scale2D;

  const astPtsStr = orbitPath
    .map((p) => `${center + p.x * scale2D},${center + p.y * scale2D}`)
    .join(" ");

  let astX = center;
  let astY = center;
  if (orbitPath.length > 0) {
    const idx = Math.min(Math.floor(progress * (orbitPath.length - 1)), orbitPath.length - 1);
    astX = center + orbitPath[idx].x * scale2D;
    astY = center + orbitPath[idx].y * scale2D;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <svg width={size} height={size} className="rounded-xl bg-slate-950/80 border border-slate-800">
        {/* Sun */}
        <circle cx={center} cy={center} r={8} fill="#fbbf24" filter="drop-shadow(0 0 8px #fbbf24)" />
        {/* Earth Orbit */}
        <circle cx={center} cy={center} r={scale2D} fill="none" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4,4" />
        {/* Asteroid Orbit */}
        {orbitPath.length > 0 && <polyline points={astPtsStr} fill="none" stroke="#38bdf8" strokeWidth={1.5} />}
        {/* Earth */}
        <circle cx={earthX} cy={earthY} r={5} fill="#38bdf8" />
        {/* Asteroid */}
        <circle cx={astX} cy={astY} r={4.5} fill="#f43f5e" filter="drop-shadow(0 0 6px #f43f5e)" />
      </svg>
    </div>
  );
}

export default function OrbitView({
  orbitPath = [],
  uncertaintyCloud = [],
}: {
  orbitPath: OrbitPoint[];
  uncertaintyCloud?: OrbitPoint[][];
}) {
  const [progress, setProgress] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");

  // Auto-play time scrubber
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev + 0.0035 > 1 ? 0 : prev + 0.0035));
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Compute live separation between Earth and Asteroid at scrubbed progress
  const separationAu = useMemo(() => {
    if (!orbitPath || orbitPath.length === 0) return 0;
    const idx = Math.min(Math.floor(progress * (orbitPath.length - 1)), orbitPath.length - 1);
    const ast = orbitPath[idx];
    const earthX = Math.cos(progress * Math.PI * 2);
    const earthY = Math.sin(progress * Math.PI * 2);
    const dx = ast.x - earthX;
    const dy = ast.y - earthY;
    const dz = ast.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }, [progress, orbitPath]);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 p-5 space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Heliocentric Orbit Propagation & Uncertainty Cloud
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400 font-telemetry">
            Live Separation: <strong className="text-cyan-300">{separationAu.toFixed(4)} AU</strong> ({(separationAu * 149.6).toFixed(1)}M km)
          </span>
          <button
            onClick={() => setViewMode(viewMode === "3d" ? "2d" : "3d")}
            className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
          >
            {viewMode === "3d" ? "Switch to 2D Twin" : "Switch to 3D WebGL"}
          </button>
        </div>
      </div>

      {/* Viewport (3D or 2D) */}
      <div className="relative w-full h-80 rounded-xl overflow-hidden bg-slate-950 border border-slate-900">
        {viewMode === "3d" ? (
          <Canvas camera={{ position: [0, -18, 22], fov: 45 }}>
            <PlanetaryScene orbitPath={orbitPath} uncertaintyCloud={uncertaintyCloud} progress={progress} />
          </Canvas>
        ) : (
          <TwoDOrbitFallback orbitPath={orbitPath} progress={progress} />
        )}

        {/* Legend overlay */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-[11px] space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-300">Sun (Origin)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Earth (1.0 AU Track)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-300">Asteroid Trajectory</span>
          </div>
          {uncertaintyCloud && uncertaintyCloud.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-cyan-300">Monte Carlo Cloud ({uncertaintyCloud.length} paths)</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Time-Scrubber Control Bar */}
      <div className="flex items-center gap-4 bg-slate-900/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-800">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition flex items-center gap-1.5"
        >
          {isPlaying ? (
            <>
              <span>⏸</span> Pause
            </>
          ) : (
            <>
              <span>▶</span> Play
            </>
          )}
        </button>

        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between text-[11px] text-slate-400 font-telemetry">
            <span>Discovery Epoch</span>
            <span className="text-cyan-400 font-semibold">T-Scrub: {(progress * 100).toFixed(0)}% Orbital Arc</span>
            <span>Close Approach (TCA)</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.002"
            value={progress}
            onChange={(e) => {
              setIsPlaying(false);
              setProgress(parseFloat(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <button
          onClick={() => {
            setProgress(0);
            setIsPlaying(true);
          }}
          className="text-xs text-slate-400 hover:text-white px-2 py-1 transition"
          title="Reset to Epoch"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
}
