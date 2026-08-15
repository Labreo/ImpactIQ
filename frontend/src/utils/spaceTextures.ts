import * as THREE from "three";

/**
 * Procedural Space Texture Generators
 * Generates high-res textures locally on canvas — 100% reliable, zero network latency, no external assets needed.
 */

// Generate photorealistic Earth Day Map with oceans, landmasses, deserts, and ice caps
export function getEarthDayTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Deep ocean base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, "#0b2545");
  oceanGrad.addColorStop(0.5, "#0d3b66");
  oceanGrad.addColorStop(1, "#051923");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Procedural continental shapes
  ctx.fillStyle = "#1e4d2b"; // forest green
  for (let i = 0; i < 240; i++) {
    const cx = ((Math.sin(i * 1.7) + 1) / 2) * width;
    const cy = ((Math.cos(i * 2.3) + 1) / 2) * (height * 0.75) + height * 0.12;
    const r = 40 + (Math.sin(i * 3.1) + 1) * 70;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Desert / arid accents
    ctx.fillStyle = i % 3 === 0 ? "#7f5539" : i % 5 === 0 ? "#b08968" : "#2d6a4f";
  }

  // Mountain ridges & coasts
  ctx.fillStyle = "#588157";
  for (let i = 0; i < 350; i++) {
    const cx = ((Math.sin(i * 4.1) + 1) / 2) * width;
    const cy = ((Math.cos(i * 5.7) + 1) / 2) * (height * 0.65) + height * 0.18;
    ctx.fillRect(cx, cy, 25, 18);
  }

  // Polar ice caps (North & South)
  const iceGradNorth = ctx.createLinearGradient(0, 0, 0, height * 0.12);
  iceGradNorth.addColorStop(0, "rgba(240, 249, 255, 0.95)");
  iceGradNorth.addColorStop(1, "rgba(240, 249, 255, 0)");
  ctx.fillStyle = iceGradNorth;
  ctx.fillRect(0, 0, width, height * 0.12);

  const iceGradSouth = ctx.createLinearGradient(0, height * 0.88, 0, height);
  iceGradSouth.addColorStop(0, "rgba(240, 249, 255, 0)");
  iceGradSouth.addColorStop(1, "rgba(240, 249, 255, 0.95)");
  ctx.fillStyle = iceGradSouth;
  ctx.fillRect(0, height * 0.88, width, height * 0.12);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Generate Earth Night Map with golden city lights
export function getEarthNightTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#020408";
  ctx.fillRect(0, 0, width, height);

  // Clusters of golden urban city lights
  ctx.fillStyle = "#fef08a";
  for (let i = 0; i < 180; i++) {
    const cx = ((Math.sin(i * 1.7) + 1) / 2) * width;
    const cy = ((Math.cos(i * 2.3) + 1) / 2) * (height * 0.7) + height * 0.15;
    const count = 15 + Math.floor(Math.random() * 20);

    for (let j = 0; j < count; j++) {
      const px = cx + (Math.random() - 0.5) * 50;
      const py = cy + (Math.random() - 0.5) * 35;
      const alpha = 0.3 + Math.random() * 0.7;
      ctx.fillStyle = `rgba(254, 215, 170, ${alpha})`;
      ctx.fillRect(px, py, 1.5, 1.5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

// Generate Earth Rotating Clouds texture with transparency
export function getEarthCloudsTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, width, height);

  // Swirling weather systems
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  for (let i = 0; i < 120; i++) {
    const cx = (i / 120) * width + Math.sin(i * 0.5) * 40;
    const cy = ((Math.sin(i * 1.8) + 1) / 2) * height * 0.8 + height * 0.1;
    const r = 25 + Math.cos(i * 0.7) * 20;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.7)");
    grad.addColorStop(0.6, "rgba(255, 255, 255, 0.35)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

// Generate Moon Cratered Surface Texture
export function getMoonTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#8c8c8e";
  ctx.fillRect(0, 0, width, height);

  // Dark lunar maria
  ctx.fillStyle = "#555558";
  for (let i = 0; i < 25; i++) {
    const cx = ((Math.sin(i * 2.1) + 1) / 2) * width;
    const cy = ((Math.cos(i * 3.4) + 1) / 2) * height;
    ctx.beginPath();
    ctx.arc(cx, cy, 25 + Math.random() * 30, 0, Math.PI * 2);
    ctx.fill();
  }

  // Impact craters
  for (let i = 0; i < 90; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const r = 3 + Math.random() * 10;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(30, 30, 32, 0.6)";
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// Generate Rocky Asteroid Carbonaceous Texture
export function getAsteroidTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Dark basalt base
  ctx.fillStyle = "#262626";
  ctx.fillRect(0, 0, width, height);

  // Rocky noise & grit
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const shade = 20 + Math.floor(Math.random() * 50);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Craters and jagged ridges
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = 8 + Math.random() * 25;

    ctx.strokeStyle = "rgba(100, 100, 100, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(15, 15, 15, 0.7)";
    ctx.beginPath();
    ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Generate Sun Photosphere & Flare Shimmer Texture
export function getSunTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 256);
  grad.addColorStop(0, "#fffbeb");
  grad.addColorStop(0.3, "#fde047");
  grad.addColorStop(0.7, "#f59e0b");
  grad.addColorStop(1, "#ea580c");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Granulation noise
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle = "rgba(251, 146, 60, 0.4)";
    ctx.fillRect(x, y, 3, 3);
  }

  return new THREE.CanvasTexture(canvas);
}
