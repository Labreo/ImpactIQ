"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Points, PointMaterial } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import {
  getEarthDayTexture,
  getEarthCloudsTexture,
  getMoonTexture,
  getAsteroidTexture,
  getSunTexture,
} from "@/utils/spaceTextures";

interface OrbitPoint { x: number; y: number; z: number; }

const SCALE = 7.5; // AU → scene units

// Pure deterministic pseudo-random generator
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) - 0.5;
}

// 3D Deep Space Starfield with multi-colored stars
function DeepSpaceStarfield({ count = 1200 }) {
  const points = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = pseudoRandom(i + 1) * 160;
      pos[i + 1] = pseudoRandom(i + 2) * 160;
      pos[i + 2] = pseudoRandom(i + 3) * 160;
    }
    return pos;
  }, [count]);

  return (
    <Points positions={points} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#e2e8f0" size={0.4} sizeAttenuation depthWrite={false} opacity={0.75} />
    </Points>
  );
}

// Holographic Concentric Distance Rings (0.5 AU, 1.0 AU, 1.5 AU, 2.5 AU)
function HolographicGrid() {
  const rings = [0.5, 1.0, 1.5, 2.5];
  return (
    <group>
      {rings.map((au) => {
        const radius = au * SCALE;
        const pts: [number, number, number][] = [];
        const segs = 90;
        for (let i = 0; i <= segs; i++) {
          const a = (i / segs) * Math.PI * 2;
          pts.push([Math.cos(a) * radius, Math.sin(a) * radius, 0]);
        }
        const isEarth = au === 1.0;
        return (
          <Line
            key={au}
            points={pts}
            color={isEarth ? "#10b981" : "#334155"}
            lineWidth={isEarth ? 1.5 : 0.6}
            dashed={!isEarth}
            dashSize={0.3}
            gapSize={0.2}
            transparent
            opacity={isEarth ? 0.8 : 0.35}
          />
        );
      })}
    </group>
  );
}

// Realistic 3D Sun with Solar Corona & dynamic light
function RealisticSun() {
  const coronaRef = useRef<THREE.Mesh>(null!);
  const texture = useMemo(() => getSunTexture(), []);

  useFrame(({ clock }) => {
    if (coronaRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
      coronaRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Sun Photosphere Core */}
      <Sphere args={[0.55, 32, 32]}>
        <meshStandardMaterial
          map={texture}
          color="#fef08a"
          emissive="#fbbf24"
          emissiveIntensity={2.8}
          roughness={0.8}
        />
      </Sphere>

      {/* Pulsing Corona Atmosphere Glow */}
      <Sphere ref={coronaRef} args={[0.85, 32, 32]}>
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Dynamic Omni Light */}
      <pointLight position={[0, 0, 0]} intensity={4.5} color="#fff7ed" distance={90} />
    </group>
  );
}

// Realistic 3D Earth System (Earth Globe, Rotating Cloud Layer, Rayleigh Atmosphere, & Orbiting Moon)
function RealisticEarth({ position }: { position: [number, number, number] }) {
  const earthRef = useRef<THREE.Group>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const moonRef = useRef<THREE.Group>(null!);

  const earthTex = useMemo(() => getEarthDayTexture(), []);
  const cloudsTex = useMemo(() => getEarthCloudsTexture(), []);
  const moonTex = useMemo(() => getMoonTexture(), []);

  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.15;
    }
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.08;
    }
    if (moonRef.current) {
      moonRef.current.rotation.z += delta * 0.4;
    }
  });

  return (
    <group position={position}>
      {/* Earth Body */}
      <group ref={earthRef}>
        <Sphere args={[0.36, 32, 32]}>
          <meshStandardMaterial
            map={earthTex}
            roughness={0.5}
            metalness={0.1}
          />
        </Sphere>

        {/* Cloud Layer */}
        <Sphere ref={cloudsRef} args={[0.375, 32, 32]}>
          <meshStandardMaterial
            map={cloudsTex}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </Sphere>

        {/* Blue Rayleigh Atmosphere Rim */}
        <Sphere args={[0.39, 32, 32]}>
          <meshBasicMaterial
            color="#60a5fa"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </Sphere>
      </group>

      {/* Orbiting 3D Moon */}
      <group ref={moonRef}>
        <Sphere args={[0.09, 20, 20]} position={[0.75, 0, 0]}>
          <meshStandardMaterial map={moonTex} roughness={0.9} />
        </Sphere>
      </group>
    </group>
  );
}

// Procedural Irregular Rocky 3D Asteroid (Bennu / Apophis Style)
function RealisticAsteroid({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const tex = useMemo(() => getAsteroidTexture(), []);

  // Generate deformed rocky geometry
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.24, 4);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      const w = pos.getZ(i);
      // Pseudo-noise displacement for ridges and craters
      const noise = 1 + (pseudoRandom(i * 3) * 0.28);
      pos.setXYZ(i, u * noise, v * noise, w * noise);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.6;
      meshRef.current.rotation.y += delta * 0.9;
      meshRef.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Rocky Asteroid Mesh */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          map={tex ?? undefined}
          color="#a8a29e"
          roughness={0.95}
          metalness={0.15}
        />
      </mesh>
      {/* Target Marker Beacon */}
      <Sphere args={[0.05, 12, 12]} position={[0, 0.4, 0]}>
        <meshBasicMaterial color="#f43f5e" />
      </Sphere>
    </group>
  );
}

// Smooth Spline Asteroid Trajectory
function SplineTrajectory({ points }: { points: OrbitPoint[] }) {
  const curvePoints = useMemo(() => {
    if (points.length < 3) return [];
    const vectors = points.map((p) => new THREE.Vector3(p.x * SCALE, p.y * SCALE, p.z * SCALE));
    const curve = new THREE.CatmullRomCurve3(vectors, true);
    return curve.getPoints(180).map((v) => [v.x, v.y, v.z] as [number, number, number]);
  }, [points]);

  if (curvePoints.length < 2) return null;
  return <Line points={curvePoints} color="#38bdf8" lineWidth={2.2} />;
}

// Monte Carlo Uncertainty Filament Cloud
function UncertaintyCloudFilaments({ cloud }: { cloud: OrbitPoint[][] }) {
  if (!cloud || cloud.length === 0) return null;
  return (
    <group>
      {cloud.map((path, idx) => {
        if (path.length < 3) return null;
        const vectors = path.map((p) => new THREE.Vector3(p.x * SCALE, p.y * SCALE, p.z * SCALE));
        const curve = new THREE.CatmullRomCurve3(vectors, true);
        const pts = curve.getPoints(80).map((v) => [v.x, v.y, v.z] as [number, number, number]);
        return (
          <Line
            key={idx}
            points={pts}
            color="#00f3ff"
            lineWidth={0.9}
            transparent
            opacity={0.25}
          />
        );
      })}
    </group>
  );
}

// Camera Director System
function CameraController({
  cameraMode,
  astPos,
  earthPos,
}: {
  cameraMode: "overview" | "asteroid" | "earth" | "flyby";
  astPos: [number, number, number];
  earthPos: [number, number, number];
}) {
  const { camera } = useThree();

  useFrame(() => {
    if (cameraMode === "asteroid") {
      camera.lookAt(astPos[0], astPos[1], astPos[2]);
    } else if (cameraMode === "earth") {
      camera.lookAt(earthPos[0], earthPos[1], earthPos[2]);
    } else if (cameraMode === "flyby") {
      const midX = (astPos[0] + earthPos[0]) / 2;
      const midY = (astPos[1] + earthPos[1]) / 2;
      const midZ = (astPos[2] + earthPos[2]) / 2;
      camera.lookAt(midX, midY, midZ);
    }
  });

  return null;
}

// Main 3D Space Scene
function SpaceScene({
  orbitPath,
  uncertaintyCloud,
  progress,
  cameraMode,
}: {
  orbitPath: OrbitPoint[];
  uncertaintyCloud?: OrbitPoint[][];
  progress: number;
  cameraMode: "overview" | "asteroid" | "earth" | "flyby";
}) {
  // Compute Earth Position on 1 AU circle
  const earthAngle = progress * Math.PI * 2;
  const earthPos: [number, number, number] = [
    Math.cos(earthAngle) * SCALE,
    Math.sin(earthAngle) * SCALE,
    0,
  ];

  // Compute Asteroid Position along Spline
  const astPos: [number, number, number] = useMemo(() => {
    if (!orbitPath || orbitPath.length === 0) return [0, 0, 0];
    const exactI = progress * (orbitPath.length - 1);
    const i = Math.floor(exactI);
    const nextI = Math.min(i + 1, orbitPath.length - 1);
    const frac = exactI - i;

    return [
      (orbitPath[i].x + (orbitPath[nextI].x - orbitPath[i].x) * frac) * SCALE,
      (orbitPath[i].y + (orbitPath[nextI].y - orbitPath[i].y) * frac) * SCALE,
      (orbitPath[i].z + (orbitPath[nextI].z - orbitPath[i].z) * frac) * SCALE,
    ];
  }, [orbitPath, progress]);

  return (
    <>
      <DeepSpaceStarfield />
      <ambientLight intensity={0.25} />

      {/* Sun & Corona */}
      <RealisticSun />

      {/* Holographic Grid */}
      <HolographicGrid />

      {/* Earth-Moon System */}
      <RealisticEarth position={earthPos} />

      {/* Asteroid Orbit & Uncertainty Cloud */}
      {orbitPath.length > 0 && (
        <>
          <SplineTrajectory points={orbitPath} />
          {uncertaintyCloud && <UncertaintyCloudFilaments cloud={uncertaintyCloud} />}
          <RealisticAsteroid position={astPos} />
        </>
      )}

      <CameraController cameraMode={cameraMode} astPos={astPos} earthPos={earthPos} />
      <OrbitControls enablePan={true} minDistance={3} maxDistance={60} makeDefault />
    </>
  );
}

// 2D Tactical Radar Twin Fallback
function TwoDTacticalRadar({
  orbitPath,
  progress,
}: {
  orbitPath: OrbitPoint[];
  progress: number;
}) {
  const size = 320;
  const center = size / 2;
  const scale2D = 90;

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
      <svg width={size} height={size} className="rounded-xl bg-slate-950/90 border border-cyan-900/40">
        {/* Radar concentric rings */}
        <circle cx={center} cy={center} r={45} fill="none" stroke="#1e293b" strokeDasharray="3,3" />
        <circle cx={center} cy={center} r={scale2D} fill="none" stroke="#059669" strokeWidth={1.5} strokeDasharray="4,4" />
        <circle cx={center} cy={center} r={135} fill="none" stroke="#1e293b" strokeDasharray="3,3" />
        <line x1={center} y1={0} x2={center} y2={size} stroke="#0f172a" />
        <line x1={0} y1={center} x2={size} y2={center} stroke="#0f172a" />

        {/* Sun */}
        <circle cx={center} cy={center} r={9} fill="#fbbf24" filter="drop-shadow(0 0 10px #fbbf24)" />

        {/* Asteroid Orbit */}
        {orbitPath.length > 0 && <polyline points={astPtsStr} fill="none" stroke="#38bdf8" strokeWidth={1.5} />}

        {/* Earth */}
        <circle cx={earthX} cy={earthY} r={6} fill="#38bdf8" filter="drop-shadow(0 0 5px #38bdf8)" />

        {/* Asteroid */}
        <circle cx={astX} cy={astY} r={5} fill="#f43f5e" filter="drop-shadow(0 0 8px #f43f5e)" />
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
  const [speed, setSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [cameraMode, setCameraMode] = useState<"overview" | "asteroid" | "earth" | "flyby">("overview");

  // Auto-play scrubber with speed multiplier
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const step = 0.002 * speed;
        return prev + step > 1 ? 0 : prev + step;
      });
    }, 25);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  // Compute live separation between Earth and Asteroid
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

  // Danger color for close approach
  const sepColor = separationAu < 0.02 ? "text-rose-400 font-bold animate-pulse" : separationAu < 0.08 ? "text-amber-400 font-bold" : "text-cyan-300";

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 p-5 space-y-4 shadow-2xl">
      {/* Top Telemetry & Viewport Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-xs uppercase tracking-widest text-slate-300 font-bold flex items-center gap-2">
            <span>3D Interactive Astrodynamics Engine</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              WebGL 2.0 PBR
            </span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="px-3 py-1 rounded-lg bg-slate-950/90 border border-slate-800 font-telemetry">
            <span className="text-slate-500 mr-1.5">Live Distance:</span>
            <span className={sepColor}>{separationAu.toFixed(4)} AU</span>
            <span className="text-slate-400 text-[11px] ml-1">({(separationAu * 149.6).toFixed(1)}M km)</span>
          </div>

          <button
            onClick={() => setViewMode(viewMode === "3d" ? "2d" : "3d")}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs transition font-medium"
          >
            {viewMode === "3d" ? "Switch to 2D Radar" : "Switch to 3D Space"}
          </button>
        </div>
      </div>

      {/* Main 3D Viewport */}
      <div className="relative w-full h-96 rounded-xl overflow-hidden bg-[#030712] border border-slate-800/80">
        {viewMode === "3d" ? (
          <Canvas camera={{ position: [0, -22, 26], fov: 45 }}>
            <SpaceScene
              orbitPath={orbitPath}
              uncertaintyCloud={uncertaintyCloud}
              progress={progress}
              cameraMode={cameraMode}
            />
          </Canvas>
        ) : (
          <TwoDTacticalRadar orbitPath={orbitPath} progress={progress} />
        )}

        {/* Camera Director Selection Overlay */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 z-10">
          {(["overview", "asteroid", "earth", "flyby"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setCameraMode(mode)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition backdrop-blur-md ${
                cameraMode === mode
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {mode === "overview"
                ? "Overview"
                : mode === "asteroid"
                ? "Track Asteroid"
                : mode === "earth"
                ? "Track Earth"
                : "Flyby Encounter"}
            </button>
          ))}
        </div>

        {/* Legend Overlay */}
        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
            <span className="text-slate-300 font-medium">Sun (Photosphere Core)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
            <span className="text-slate-300 font-medium">Earth (1.0 AU Orbit + Moon)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />
            <span className="text-slate-300 font-medium">Asteroid (Tumbling 3D Mesh)</span>
          </div>
          {uncertaintyCloud && uncertaintyCloud.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              <span className="text-cyan-300 font-medium">Monte Carlo Cloud ({uncertaintyCloud.length} paths)</span>
            </div>
          )}
        </div>
      </div>

      {/* Time-Scrubber & Simulation Speed Control Deck */}
      <div className="space-y-2.5 bg-slate-950/80 backdrop-blur-md p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-blue-900/40"
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

            <button
              onClick={() => {
                setProgress(0);
                setIsPlaying(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition"
              title="Rewind to Epoch"
            >
              ↺ Reset
            </button>
          </div>

          {/* Speed Multiplier Pills */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 px-2 font-semibold">Speed:</span>
            {[0.5, 1, 5, 25].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 rounded text-xs font-telemetry font-bold transition ${
                  speed === s
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Status Telemetry */}
          <div className="text-xs font-telemetry text-slate-400">
            Orbital Arc: <strong className="text-cyan-400 font-bold">{(progress * 100).toFixed(1)}%</strong>
          </div>
        </div>

        {/* Time Slider */}
        <div className="pt-1">
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={progress}
            onChange={(e) => {
              setIsPlaying(false);
              setProgress(parseFloat(e.target.value));
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-telemetry pt-1">
            <span>Discovery Epoch</span>
            <span className="text-cyan-400 font-semibold">Closest Approach (TCA)</span>
            <span>Post-Flyby Ephemeris</span>
          </div>
        </div>
      </div>
    </div>
  );
}
