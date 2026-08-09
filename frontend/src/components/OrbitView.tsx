"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Line } from "@react-three/drei";
import { useMemo, useRef } from "react";

interface OrbitPoint { x: number; y: number; z: number; }

const SCALE = 6; // AU → scene units

function AsteroidOrbit({ points }: { points: OrbitPoint[] }) {
  const pts = useMemo(
    () => points.map((p) => [p.x * SCALE, p.y * SCALE, p.z * SCALE] as [number,number,number]),
    [points]
  );
  return <Line points={pts} color="#60a5fa" lineWidth={1.5} />;
}

function AsteroidMover({ points }: { points: OrbitPoint[] }) {
  const meshRef = useRef<any>(null!);
  
  const pts = useMemo(
    () => points.map((p) => [p.x * SCALE, p.y * SCALE, p.z * SCALE] as [number,number,number]),
    [points]
  );
  
  useFrame(({ clock }) => {
    if (pts.length === 0 || !meshRef.current) return;
    const t = (clock.getElapsedTime() % 4) / 4; // 4 second loop
    const exactI = t * (pts.length - 1);
    const i = Math.floor(exactI);
    const nextI = Math.min(i + 1, pts.length - 1);
    const frac = exactI - i;
    
    meshRef.current.position.x = pts[i][0] + (pts[nextI][0] - pts[i][0]) * frac;
    meshRef.current.position.y = pts[i][1] + (pts[nextI][1] - pts[i][1]) * frac;
    meshRef.current.position.z = pts[i][2] + (pts[nextI][2] - pts[i][2]) * frac;
  });

  return (
    <Sphere ref={meshRef} args={[0.1, 12, 12]} position={[0,0,0]}>
      <meshStandardMaterial color="#ffffff" emissive="#60a5fa" emissiveIntensity={1} />
    </Sphere>
  );
}

function EarthOrbit() {
  const pts = useMemo(() => {
    const n = 120;
    return Array.from({ length: n + 1 }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return [Math.cos(a) * SCALE, Math.sin(a) * SCALE, 0] as [number,number,number];
    });
  }, []);
  return <Line points={pts} color="#22d3ee" lineWidth={1} dashed dashSize={0.15} gapSize={0.08} />;
}

export default function OrbitView({ orbitPath }: { orbitPath: OrbitPoint[] }) {
  return (
    <div className="w-full h-72 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
      <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#fde68a" />

        {/* Sun */}
        <Sphere args={[0.3, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={1} />
        </Sphere>

        {/* Earth marker on orbit */}
        <Sphere args={[0.12, 12, 12]} position={[SCALE, 0, 0]}>
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.5} />
        </Sphere>

        <EarthOrbit />
        {orbitPath.length > 0 && (
          <>
            <AsteroidOrbit points={orbitPath} />
            <AsteroidMover points={orbitPath} />
          </>
        )}

        <OrbitControls enablePan={false} minDistance={5} maxDistance={40} />
      </Canvas>
    </div>
  );
}
