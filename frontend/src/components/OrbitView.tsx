"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Line } from "@react-three/drei";
import { useMemo } from "react";

interface OrbitPoint { x: number; y: number; z: number; }

const SCALE = 6; // AU → scene units

function AsteroidOrbit({ points }: { points: OrbitPoint[] }) {
  const pts = useMemo(
    () => points.map((p) => [p.x * SCALE, p.y * SCALE, p.z * SCALE] as [number,number,number]),
    [points]
  );
  return <Line points={pts} color="#60a5fa" lineWidth={1.5} />;
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
        {orbitPath.length > 0 && <AsteroidOrbit points={orbitPath} />}

        <OrbitControls enablePan={false} minDistance={5} maxDistance={40} />
      </Canvas>
    </div>
  );
}
