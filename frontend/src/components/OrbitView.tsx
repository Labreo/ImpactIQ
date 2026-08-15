"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Points, PointMaterial } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { playTelemetryClick, playScrubberTick } from "@/utils/audioFx";
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
      <PointMaterial transparent color="#e2e8f0" size={0.45} sizeAttenuation depthWrite={false} opacity={0.85} />
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
      <PointMaterial transparent color="#94a3b8" size={0.35} sizeAttenuation depthWrite={false} opacity={0.5} />
    </Points>
  );
}

// Planetary Circular Orbit Trail Helper
function PlanetaryOrbitRing({ radiusAu, color = "#475569", dashed = true, lineWidth = 1.0 }: { radiusAu: number; color?: string; dashed?: boolean; lineWidth?: number }) {
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
      dashSize={0.35}
      gapSize={0.2}
      transparent
      opacity={dashed ? 0.5 : 0.85}
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
      <Sphere args={[0.62, 32, 32]}>
        <meshStandardMaterial
          map={texture}
          color="#fef08a"
          emissive="#fbbf24"
          emissiveIntensity={3.2}
          roughness={0.7}
        />
      </Sphere>

      <Sphere ref={coronaRef} args={[0.95, 32, 32]}>
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </Sphere>

      <pointLight position={[0, 0, 0]} intensity={5.5} color="#fffbeb" distance={120} />
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
      <PlanetaryOrbitRing radiusAu={0.387} color="#94a3b8" />
      <Sphere args={[0.16, 20, 20]} position={pos}>
        <meshStandardMaterial map={tex} color="#cbd5e1" roughness={0.7} emissive="#475569" emissiveIntensity={0.2} />
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
      <PlanetaryOrbitRing radiusAu={0.723} color="#eab308" />
      <Sphere args={[0.32, 24, 24]} position={pos}>
        <meshStandardMaterial map={tex} color="#fef08a" roughness={0.5} emissive="#ca8a04" emissiveIntensity={0.25} />
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
      <PlanetaryOrbitRing radiusAu={1.524} color="#ef4444" />
      <Sphere args={[0.24, 24, 24]} position={pos}>
        <meshStandardMaterial map={tex} color="#fca5a5" roughness={0.7} emissive="#b91c1c" emissiveIntensity={0.25} />
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
        <Sphere args={[0.42, 32, 32]}>
          <meshStandardMaterial map={earthTex} roughness={0.4} metalness={0.1} emissive="#1e3a8a" emissiveIntensity={0.15} />
        </Sphere>
        <Sphere ref={cloudsRef} args={[0.435, 32, 32]}>
          <meshStandardMaterial map={cloudsTex} transparent opacity={0.45} depthWrite={false} />
        </Sphere>
        <Sphere args={[0.455, 32, 32]}>
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.28} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
        </Sphere>
      </group>

      {/* Orbiting Moon */}
      <group ref={moonRef}>
        <Sphere args={[0.11, 20, 20]} position={[0.85, 0, 0]}>
          <meshStandardMaterial map={moonTex} roughness={0.8} color="#e2e8f0" emissive="#334155" emissiveIntensity={0.2} />
        </Sphere>
      </group>
    </group>
  );
}

// High-Contrast Illuminated 3D Asteroid & Holographic Target Beacon
function RealisticAsteroid({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const targetRingRef = useRef<THREE.Mesh>(null!);
  const tex = useMemo(() => getAsteroidTexture(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.38, 4);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      const w = pos.getZ(i);
      const noise = 1 + (pseudoRandom(i * 3) * 0.32);
      pos.setXYZ(i, u * noise, v * noise, w * noise);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame(({ clock }, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.8;
      meshRef.current.rotation.z += delta * 0.3;
    }
    if (targetRingRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.12;
      targetRingRef.current.scale.set(scale, scale, scale);
      targetRingRef.current.rotation.z += delta * 1.2;
    }
  });

  return (
    <group position={position}>
      {/* 3D Rocky Asteroid Body with Crisp High-Contrast Shading */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          map={tex}
          color="#ffffff"
          roughness={0.7}
          metalness={0.15}
          emissive="#57534e"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Holographic Target Reticle Bracket Ring */}
      <mesh ref={targetRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.62, 32]} />
        <meshBasicMaterial color="#fc3d21" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Target Marker Beacon */}
      <Sphere args={[0.08, 16, 16]} position={[0, 0.6, 0]}>
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
  return <Line points={curvePoints} color="#fc3d21" lineWidth={2.5} />;
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
            color="#38bdf8"
            lineWidth={1.2}
            transparent
            opacity={0.35}
          />
        );
      })}
    </group>
  );
}

// Close Encounter Vector Line connecting Earth and Asteroid
function EncounterVector({ astPos, earthPos, distanceAu }: { astPos: [number, number, number]; earthPos: [number, number, number]; distanceAu: number }) {
  if (distanceAu > 0.35) return null;
  const isCritical = distanceAu < 0.05;
  return (
    <Line
      points={[astPos, earthPos]}
      color={isCritical ? "#f43f5e" : "#f59e0b"}
      lineWidth={2.2}
      dashed
      dashSize={0.2}
      gapSize={0.1}
    />
  );
}

// Unrestricted Camera Director & Smooth Delta-Tracking System
function CameraDirector({
  cameraMode,
  astPos,
  earthPos,
  controlsRef,
}: {
  cameraMode: "overview" | "asteroid" | "earth" | "flyby";
  astPos: [number, number, number];
  earthPos: [number, number, number];
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();

  // 1. Set initial perspective ONLY when camera mode button is clicked
  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    if (cameraMode === "asteroid") {
      controls.target.set(astPos[0], astPos[1], astPos[2]);
      camera.position.set(astPos[0] + 1.8, astPos[1] - 2.2, astPos[2] + 1.8);
      controls.update();
    } else if (cameraMode === "earth") {
      controls.target.set(earthPos[0], earthPos[1], earthPos[2]);
      camera.position.set(earthPos[0] + 2.2, earthPos[1] - 2.8, earthPos[2] + 1.8);
      controls.update();
    } else if (cameraMode === "flyby") {
      const midX = (astPos[0] + earthPos[0]) / 2;
      const midY = (astPos[1] + earthPos[1]) / 2;
      const midZ = (astPos[2] + earthPos[2]) / 2;
      controls.target.set(midX, midY, midZ);
      camera.position.set(midX + 2.5, midY - 3.2, midZ + 2.5);
      controls.update();
    } else if (cameraMode === "overview") {
      controls.target.set(0, 0, 0);
      camera.position.set(0, -22, 26);
      controls.update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraMode]);

  // 2. Continuous tracking during active animation: shift both target and camera by delta
  // This completely preserves user's manual zoom distance, pinch zoom, and rotation angle!
  useFrame(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    if (cameraMode === "asteroid") {
      const targetVec = new THREE.Vector3(astPos[0], astPos[1], astPos[2]);
      const delta = targetVec.clone().sub(controls.target);
      if (delta.lengthSq() > 0.0000001) {
        camera.position.add(delta);
        controls.target.copy(targetVec);
        controls.update();
      }
    } else if (cameraMode === "earth") {
      const targetVec = new THREE.Vector3(earthPos[0], earthPos[1], earthPos[2]);
      const delta = targetVec.clone().sub(controls.target);
      if (delta.lengthSq() > 0.0000001) {
        camera.position.add(delta);
        controls.target.copy(targetVec);
        controls.update();
      }
    } else if (cameraMode === "flyby") {
      const targetVec = new THREE.Vector3(
        (astPos[0] + earthPos[0]) / 2,
        (astPos[1] + earthPos[1]) / 2,
        (astPos[2] + earthPos[2]) / 2
      );
      const delta = targetVec.clone().sub(controls.target);
      if (delta.lengthSq() > 0.0000001) {
        camera.position.add(delta);
        controls.target.copy(targetVec);
        controls.update();
      }
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
  controlsRef,
}: {
  orbitPath: OrbitPoint[];
  uncertaintyCloud?: OrbitPoint[][];
  progress: number;
  cameraMode: "overview" | "asteroid" | "earth" | "flyby";
  separationAu: number;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
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
      
      {/* High-Visibility Ambient & Directional Space Lighting */}
      <ambientLight intensity={1.1} color="#cbd5e1" />
      <directionalLight position={[10, 20, 15]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-10, -20, -10]} intensity={0.6} color="#94a3b8" />

      {/* Sun & Corona */}
      <RealisticSun />

      {/* Inner Planets */}
      <PlanetMercury progress={progress} />
      <PlanetVenus progress={progress} />

      {/* Earth Orbit & System */}
      <PlanetaryOrbitRing radiusAu={1.0} color="#10b981" dashed={false} lineWidth={2.0} />
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

      <CameraDirector
        cameraMode={cameraMode}
        astPos={astPos}
        earthPos={earthPos}
        controlsRef={controlsRef}
      />
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={1.5}
        minDistance={0.2}
        maxDistance={250}
        makeDefault
      />
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
        <circle cx={astX} cy={astY} r={6} fill="#f43f5e" />
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
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

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

  const sepColor = separationAu < 0.02 ? "#fc3d21" : separationAu < 0.08 ? "#f59e0b" : "#a3a3a3";

  // Exact Point of Closest Approach (TCA) Calculation
  const tcaData = useMemo(() => {
    if (!orbitPath || orbitPath.length === 0) return { progress: 0.5, distAu: 0 };
    let minDist = Infinity;
    let minIdx = 0;
    const n = orbitPath.length;
    for (let i = 0; i < n; i++) {
      const frac = i / (n - 1);
      const earthX = Math.cos(frac * Math.PI * 2);
      const earthY = Math.sin(frac * Math.PI * 2);
      const dx = orbitPath[i].x - earthX;
      const dy = orbitPath[i].y - earthY;
      const dz = orbitPath[i].z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < minDist) {
        minDist = dist;
        minIdx = i;
      }
    }
    return {
      progress: minIdx / (n - 1),
      distAu: minDist,
    };
  }, [orbitPath]);

  // Quick Manual Zoom Helpers
  const handleZoom = (factor: number) => {
    playTelemetryClick();
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object as THREE.PerspectiveCamera;
    if (camera) {
      camera.position.multiplyScalar(factor);
      controlsRef.current.update();
    }
  };  return (
    <div style={{ backgroundColor: "#000", border: "1px solid #1f1f1f" }}>
      {/* Top header bar */}
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: 12,
        padding: "12px 16px", borderBottom: "1px solid #1f1f1f",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="live-dot" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#a3a3a3", letterSpacing: "0.02em" }}>
            Heliocentric Orbit Simulation
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
            <span style={{ color: "#525252" }}>Earth–Asteroid: </span>
            <span style={{ color: sepColor, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {separationAu.toFixed(4)} AU
            </span>
            <span style={{ color: "#3d3d3d", marginLeft: 6 }}>
              ({(separationAu * 149.6).toFixed(1)}M km)
            </span>
          </div>

          <button
            onClick={() => setViewMode(viewMode === "3d" ? "2d" : "3d")}
            className="btn btn-ghost"
            style={{ fontSize: 11, padding: "4px 12px" }}
          >
            {viewMode === "3d" ? "2D Radar" : "3D View"}
          </button>
        </div>
      </div>

      {/* Main 3D Viewport */}
      <div style={{ position: "relative", width: "100%", height: 560, backgroundColor: "#020308", overflow: "hidden" }}>
        {viewMode === "3d" ? (
          <Canvas camera={{ position: [0, -22, 26], fov: 45 }}>
            <SpaceScene
              orbitPath={orbitPath}
              uncertaintyCloud={uncertaintyCloud}
              progress={progress}
              cameraMode={cameraMode}
              separationAu={separationAu}
              controlsRef={controlsRef}
            />
          </Canvas>
        ) : (
          <TwoDTacticalRadar orbitPath={orbitPath} progress={progress} />
        )}

        {/* Camera view buttons — top right */}
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 4, zIndex: 10 }}>
          {(["overview", "asteroid", "earth", "flyby"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { playTelemetryClick(); setCameraMode(mode); }}
              style={{
                padding: "5px 10px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                border: "1px solid",
                cursor: "pointer",
                transition: "all 0.15s",
                backgroundColor: cameraMode === mode ? "#fc3d21" : "rgba(0,0,0,0.7)",
                borderColor: cameraMode === mode ? "#fc3d21" : "#2a2a2a",
                color: cameraMode === mode ? "#fff" : "#525252",
              }}
            >
              {mode === "overview" ? "System" : mode === "asteroid" ? "Target" : mode === "earth" ? "Earth" : "Flyby"}
            </button>
          ))}
        </div>

        {/* Zoom buttons — bottom right */}
        <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: 4, zIndex: 10 }}>
          <button
            onClick={() => handleZoom(0.7)}
            style={{ width: 28, height: 28, border: "1px solid #2a2a2a", backgroundColor: "rgba(0,0,0,0.8)", color: "#a3a3a3", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Zoom In"
          >+</button>
          <button
            onClick={() => handleZoom(1.4)}
            style={{ width: 28, height: 28, border: "1px solid #2a2a2a", backgroundColor: "rgba(0,0,0,0.8)", color: "#a3a3a3", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Zoom Out"
          >−</button>
          <button
            onClick={() => { playTelemetryClick(); setCameraMode("overview"); }}
            style={{ padding: "0 10px", height: 28, border: "1px solid #2a2a2a", backgroundColor: "rgba(0,0,0,0.8)", color: "#a3a3a3", cursor: "pointer", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}
          >Reset</button>
        </div>

        {/* Legend — bottom left */}
        <div style={{
          position: "absolute", bottom: 12, left: 12,
          padding: "8px 12px",
          backgroundColor: "rgba(0,0,0,0.75)",
          border: "1px solid #1f1f1f",
          zIndex: 10,
        }}>
          {[
            { color: "#f59e0b", label: "Sun" },
            { color: "#22c55e", label: "Earth" },
            { color: "#fc3d21", label: "Asteroid" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#525252" }}>{label}</span>
            </div>
          ))}
          {uncertaintyCloud && uncertaintyCloud.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#555", flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#525252" }}>MC Cloud ({uncertaintyCloud.length})</span>
            </div>
          )}
          <div style={{ fontSize: 9, color: "#3d3d3d", marginTop: 4 }}>Scroll to zoom · drag to rotate</div>
        </div>
      </div>

      {/* Playback controls */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #1f1f1f", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        {/* Left — play/pause/TCA */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => { playTelemetryClick(); setIsPlaying(!isPlaying); }}
            className="btn btn-primary"
            style={{ padding: "6px 16px", fontSize: 11 }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={() => { playTelemetryClick(); setProgress(0); setIsPlaying(true); }}
            className="btn btn-ghost"
            style={{ fontSize: 11, padding: "6px 12px" }}
          >Reset</button>

          <button
            onClick={() => { playTelemetryClick(); setIsPlaying(false); setProgress(tcaData.progress); }}
            className="btn btn-ghost"
            style={{ fontSize: 11, padding: "6px 12px", borderColor: "#fc3d21", color: "#fc3d21" }}
            title="Jump to Point of Closest Approach"
          >
            TCA ({tcaData.distAu.toFixed(4)} AU)
          </button>
        </div>

        {/* Center — speed */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>Speed</span>
          {[0.5, 1, 5, 25].map((s) => (
            <button
              key={s}
              onClick={() => { playTelemetryClick(); setSpeed(s); }}
              style={{
                padding: "4px 10px", fontSize: 11, fontWeight: 600,
                border: "1px solid", cursor: "pointer", transition: "all 0.15s",
                backgroundColor: speed === s ? "#fc3d21" : "transparent",
                borderColor: speed === s ? "#fc3d21" : "#2a2a2a",
                color: speed === s ? "#fff" : "#525252",
              }}
            >{s}×</button>
          ))}
        </div>

        {/* Right — arc progress */}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#525252" }}>
          Arc: <span style={{ color: "#a3a3a3", fontWeight: 600 }}>{(progress * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Timeline scrubber */}
      <div style={{ padding: "12px 16px 16px", borderTop: "1px solid #1f1f1f", position: "relative" }}>
        {/* TCA marker */}
        <div
          style={{
            position: "absolute",
            left: `calc(16px + ${Math.max(3, Math.min(97, tcaData.progress * 100))}% * (100% - 32px) / 100)`,
            top: 6,
            transform: "translateX(-50%)",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => { playTelemetryClick(); setIsPlaying(false); setProgress(tcaData.progress); }}
        >
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 6px",
            backgroundColor: "#1c0a0a", border: "1px solid #fc3d21",
            color: "#fc3d21", textTransform: "uppercase", letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}>TCA</span>
          <div style={{ width: 1, height: 10, backgroundColor: "#fc3d21" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#fc3d21", marginTop: -1 }} />
        </div>

        <input
          type="range" min="0" max="1" step="0.001" value={progress}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setIsPlaying(false); setProgress(val); playScrubberTick(val);
          }}
          style={{ width: "100%", cursor: "pointer", accentColor: "#fc3d21", marginTop: 24 }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "#3d3d3d", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <span>Discovery Epoch</span>
          <span style={{ color: "#fc3d21", fontWeight: 600 }}>Closest Approach</span>
          <span>Post-Encounter</span>
        </div>
      </div>
    </div>
  );
}
