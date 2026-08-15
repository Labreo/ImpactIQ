"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Points, PointMaterial } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import {
  getEarthDayTexture,
  getEarthCloudsTexture,
  getMoonTexture,
  getMarsTexture,
  getVenusTexture,
  getMercuryTexture,
  getAsteroidTexture,
  getSunTexture,
} from "@/utils/spaceTextures";

interface OrbitPoint { x: number; y: number; z: number; }

const SCALE = 7.5; // AU → scene units

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) - 0.5;
}

// 3D Deep Space Starfield with 1500 stars
function DeepSpaceStarfield({ count = 1500 }) {
  const points = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = pseudoRandom(i + 1) * 180;
      pos[i + 1] = pseudoRandom(i + 2) * 180;
      pos[i + 2] = pseudoRandom(i + 3) * 180;
    }
    return pos;
  }, [count]);

  return (
    <Points positions={points} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#cbd5e1" size={0.4} sizeAttenuation depthWrite={false} opacity={0.8} />
    </Points>
  );
}

// Main Asteroid Belt Particles (2.2 AU to 3.2 AU)
function MainAsteroidBelt({ count = 800 }) {
  const points = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      const dist = (2.2 + Math.abs(pseudoRandom(i * 4)) * 1.0) * SCALE;
      const angle = ((pseudoRandom(i * 7) + 0.5) * 2) * Math.PI * 2;
      const zOffset = pseudoRandom(i * 11) * 0.8;

      pos[i] = Math.cos(angle) * dist;
      pos[i + 1] = Math.sin(angle) * dist;
      pos[i + 2] = zOffset;
    }
    return pos;
  }, [count]);

  return (
    <Points positions={points} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#94a3b8" size={0.3} sizeAttenuation depthWrite={false} opacity={0.4} />
    </Points>
  );
}

// Planetary Circular Orbit Trail Helper
function PlanetaryOrbitRing({ radiusAu, color = "#334155", dashed = true, lineWidth = 0.8 }: { radiusAu: number; color?: string; dashed?: boolean; lineWidth?: number }) {
  const pts = useMemo(() => {
    const radius = radiusAu * SCALE;
    const segs = 90;
    const points: [number, number, number][] = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      points.push([Math.cos(a) * radius, Math.sin(a) * radius, 0]);
    }
    return points;
  }, [radiusAu]);

  return (
    <Line
      points={pts}
      color={color}
      lineWidth={lineWidth}
      dashed={dashed}
      dashSize={0.3}
      gapSize={0.2}
      transparent
      opacity={dashed ? 0.4 : 0.75}
    />
  );
}

// Realistic 3D Sun with Solar Corona & Dynamic Omni Light
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
      <Sphere args={[0.58, 32, 32]}>
        <meshStandardMaterial
          map={texture}
          color="#fef08a"
          emissive="#fbbf24"
          emissiveIntensity={2.8}
          roughness={0.8}
        />
      </Sphere>

      <Sphere ref={coronaRef} args={[0.9, 32, 32]}>
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </Sphere>

      <pointLight position={[0, 0, 0]} intensity={4.5} color="#fff7ed" distance={100} />
    </group>
  );
}

// Planet Mercury
function PlanetMercury({ progress }: { progress: number }) {
  const tex = useMemo(() => getMercuryTexture(), []);
  const mercuryAngle = progress * Math.PI * 2 * 4.15;
  const radius = 0.387 * SCALE;
  const pos: [number, number, number] = [Math.cos(mercuryAngle) * radius, Math.sin(mercuryAngle) * radius, 0];

  return (
    <group>
      <PlanetaryOrbitRing radiusAu={0.387} color="#64748b" />
      <Sphere args={[0.13, 20, 20]} position={pos}>
        <meshStandardMaterial map={tex} roughness={0.8} />
      </Sphere>
    </group>
  );
}

// Planet Venus
function PlanetVenus({ progress }: { progress: number }) {
  const tex = useMemo(() => getVenusTexture(), []);
  const venusAngle = progress * Math.PI * 2 * 1.62;
  const radius = 0.723 * SCALE;
  const pos: [number, number, number] = [Math.cos(venusAngle) * radius, Math.sin(venusAngle) * radius, 0];

  return (
    <group>
      <PlanetaryOrbitRing radiusAu={0.723} color="#ca8a04" />
      <Sphere args={[0.28, 24, 24]} position={pos}>
        <meshStandardMaterial map={tex} roughness={0.6} />
      </Sphere>
    </group>
  );
}

// Planet Mars
function PlanetMars({ progress }: { progress: number }) {
  const tex = useMemo(() => getMarsTexture(), []);
  const marsAngle = progress * Math.PI * 2 * 0.53;
  const radius = 1.524 * SCALE;
  const pos: [number, number, number] = [Math.cos(marsAngle) * radius, Math.sin(marsAngle) * radius, 0];

  return (
    <group>
      <PlanetaryOrbitRing radiusAu={1.524} color="#dc2626" />
      <Sphere args={[0.2, 24, 24]} position={pos}>
        <meshStandardMaterial map={tex} roughness={0.8} />
      </Sphere>
    </group>
  );
}

// Realistic Earth-Moon System
function RealisticEarth({ position }: { position: [number, number, number] }) {
  const earthRef = useRef<THREE.Group>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const moonRef = useRef<THREE.Group>(null!);

  const earthTex = useMemo(() => getEarthDayTexture(), []);
  const cloudsTex = useMemo(() => getEarthCloudsTexture(), []);
  const moonTex = useMemo(() => getMoonTexture(), []);

  useFrame((_, delta) => {
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.12;
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.08;
    if (moonRef.current) moonRef.current.rotation.z += delta * 0.35;
  });

  return (
    <group position={position}>
      <group ref={earthRef}>
        <Sphere args={[0.36, 32, 32]}>
          <meshStandardMaterial map={earthTex} roughness={0.5} metalness={0.1} />
        </Sphere>
        <Sphere ref={cloudsRef} args={[0.375, 32, 32]}>
          <meshStandardMaterial map={cloudsTex} transparent opacity={0.4} depthWrite={false} />
        </Sphere>
        <Sphere args={[0.39, 32, 32]}>
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.25} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
        </Sphere>
      </group>

      {/* Orbiting Moon */}
      <group ref={moonRef}>
        <Sphere args={[0.09, 20, 20]} position={[0.75, 0, 0]}>
          <meshStandardMaterial map={moonTex} roughness={0.9} />
        </Sphere>
      </group>
    </group>
  );
}

// Procedural Irregular Rocky 3D Asteroid
function RealisticAsteroid({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const tex = useMemo(() => getAsteroidTexture(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.24, 4);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      const w = pos.getZ(i);
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
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial map={tex} color="#a8a29e" roughness={0.95} metalness={0.15} />
      </mesh>
      {/* Target Marker Beacon */}
      <Sphere args={[0.04, 12, 12]} position={[0, 0.38, 0]}>
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

// Close Encounter Vector Line connecting Earth and Asteroid
function EncounterVector({ astPos, earthPos, distanceAu }: { astPos: [number, number, number]; earthPos: [number, number, number]; distanceAu: number }) {
  if (distanceAu > 0.3) return null;
  const isCritical = distanceAu < 0.05;
  return (
    <Line
      points={[astPos, earthPos]}
      color={isCritical ? "#f43f5e" : "#f59e0b"}
      lineWidth={1.5}
      dashed
      dashSize={0.15}
      gapSize={0.1}
    />
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
  separationAu,
}: {
  orbitPath: OrbitPoint[];
  uncertaintyCloud?: OrbitPoint[][];
  progress: number;
  cameraMode: "overview" | "asteroid" | "earth" | "flyby";
  separationAu: number;
}) {
  const earthAngle = progress * Math.PI * 2;
  const earthPos: [number, number, number] = [
    Math.cos(earthAngle) * SCALE,
    Math.sin(earthAngle) * SCALE,
    0,
  ];

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

      {/* Inner Planets */}
      <PlanetMercury progress={progress} />
      <PlanetVenus progress={progress} />

      {/* Earth Orbit & System */}
      <PlanetaryOrbitRing radiusAu={1.0} color="#10b981" dashed={false} lineWidth={1.5} />
      <RealisticEarth position={earthPos} />

      {/* Mars */}
      <PlanetMars progress={progress} />

      {/* Main Asteroid Belt */}
      <MainAsteroidBelt />

      {/* Asteroid Orbit & Uncertainty Cloud */}
      {orbitPath.length > 0 && (
        <>
          <SplineTrajectory points={orbitPath} />
          {uncertaintyCloud && <UncertaintyCloudFilaments cloud={uncertaintyCloud} />}
          <RealisticAsteroid position={astPos} />
          <EncounterVector astPos={astPos} earthPos={earthPos} distanceAu={separationAu} />
        </>
      )}

      <CameraController cameraMode={cameraMode} astPos={astPos} earthPos={earthPos} />
      <OrbitControls enablePan={true} minDistance={3} maxDistance={70} makeDefault />
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
  const size = 340;
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
      <svg width={size} height={size} className="rounded-xl bg-[#060a14] border border-cyan-900/40">
        <circle cx={center} cy={center} r={35} fill="none" stroke="#1e293b" strokeDasharray="3,3" />
        <circle cx={center} cy={center} r={65} fill="none" stroke="#1e293b" strokeDasharray="3,3" />
        <circle cx={center} cy={center} r={scale2D} fill="none" stroke="#059669" strokeWidth={1.5} />
        <circle cx={center} cy={center} r={135} fill="none" stroke="#dc2626" strokeDasharray="3,3" />
        <line x1={center} y1={0} x2={center} y2={size} stroke="#0f172a" />
        <line x1={0} y1={center} x2={size} y2={center} stroke="#0f172a" />

        <circle cx={center} cy={center} r={9} fill="#fbbf24" />
        {orbitPath.length > 0 && <polyline points={astPtsStr} fill="none" stroke="#38bdf8" strokeWidth={1.5} />}
        <circle cx={earthX} cy={earthY} r={6} fill="#38bdf8" />
        <circle cx={astX} cy={astY} r={5} fill="#f43f5e" />
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

  const sepColor = separationAu < 0.02 ? "text-rose-400 font-bold animate-pulse" : separationAu < 0.08 ? "text-amber-400 font-bold" : "text-cyan-300";

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 p-5 space-y-4 shadow-2xl">
      {/* Top Telemetry & Viewport Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-xs uppercase tracking-widest text-slate-300 font-bold flex items-center gap-2">
            <span>Heliocentric Orbital Ephemeris & Uncertainty Volume</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              NASA JPL SPICE Model
            </span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="px-3 py-1 rounded-lg bg-slate-950/90 border border-slate-800 font-telemetry">
            <span className="text-slate-500 mr-1.5">Separation Distance:</span>
            <span className={sepColor}>{separationAu.toFixed(4)} AU</span>
            <span className="text-slate-400 text-[11px] ml-1">({(separationAu * 149.6).toFixed(1)}M km)</span>
          </div>

          <button
            onClick={() => setViewMode(viewMode === "3d" ? "2d" : "3d")}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs transition font-medium uppercase tracking-wider"
          >
            {viewMode === "3d" ? "2D Radar View" : "3D Spatial View"}
          </button>
        </div>
      </div>

      {/* Main 3D Viewport */}
      <div className="relative w-full h-96 rounded-xl overflow-hidden bg-[#02050e] border border-slate-800/80">
        {viewMode === "3d" ? (
          <Canvas camera={{ position: [0, -22, 26], fov: 45 }}>
            <SpaceScene
              orbitPath={orbitPath}
              uncertaintyCloud={uncertaintyCloud}
              progress={progress}
              cameraMode={cameraMode}
              separationAu={separationAu}
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
              className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition backdrop-blur-md ${
                cameraMode === mode
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {mode === "overview"
                ? "Heliocentric"
                : mode === "asteroid"
                ? "Track Asteroid"
                : mode === "earth"
                ? "Earth-Moon"
                : "Close Encounter"}
            </button>
          ))}
        </div>

        {/* Legend Overlay */}
        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-300 font-medium">Sun (Central Mass)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-medium">Earth (1.000 AU Orbit)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-300 font-medium">Asteroid Trajectory</span>
          </div>
          {uncertaintyCloud && uncertaintyCloud.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-cyan-300 font-medium">Monte Carlo Cloud ({uncertaintyCloud.length} paths)</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-[10px] text-slate-500 border-t border-slate-800/80 pt-1">
            <span>Inner Planets: Mercury, Venus, Mars, Asteroid Belt</span>
          </div>
        </div>
      </div>

      {/* Time-Scrubber & Simulation Speed Control Deck */}
      <div className="space-y-2.5 bg-slate-950/80 backdrop-blur-md p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-md shadow-blue-900/40 uppercase tracking-wider"
            >
              {isPlaying ? "PAUSE" : "PLAY"}
            </button>

            <button
              onClick={() => {
                setProgress(0);
                setIsPlaying(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition uppercase tracking-wider font-semibold"
            >
              RESET
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
                {s}X
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
          <div className="flex justify-between text-[11px] text-slate-500 font-telemetry pt-1 uppercase tracking-wider">
            <span>Discovery Epoch</span>
            <span className="text-cyan-400 font-semibold">Point of Closest Approach (TCA)</span>
            <span>Post-Encounter Arc</span>
          </div>
        </div>
      </div>
    </div>
  );
}
