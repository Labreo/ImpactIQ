import * as THREE from "three";

/**
 * High-Fidelity Procedural Space Texture Generators
 * Generates ultra-crisp textures locally on canvas with rich cratering, bump relief, and atmospheric layers.
 */

// Generate Photorealistic Earth Day Map with oceans, continental shelves, biomes, and ice caps
export function getEarthDayTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Deep ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, "#081d38");
  oceanGrad.addColorStop(0.5, "#0b2e59");
  oceanGrad.addColorStop(1, "#051329");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Continental landmasses
  ctx.fillStyle = "#1e4620";
  for (let i = 0; i < 320; i++) {
    const cx = ((Math.sin(i * 1.73) + 1) / 2) * width;
    const cy = ((Math.cos(i * 2.27) + 1) / 2) * (height * 0.74) + height * 0.13;
    const r = 35 + (Math.sin(i * 3.14) + 1) * 80;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Biome colors (tropical green, arid savanna, desert ochre)
    ctx.fillStyle = i % 4 === 0 ? "#785338" : i % 6 === 0 ? "#a68a56" : i % 2 === 0 ? "#23532a" : "#1b3f1e";
  }

  // Mountain chains & coastlines
  ctx.fillStyle = "#3e6b48";
  for (let i = 0; i < 450; i++) {
    const cx = ((Math.sin(i * 4.19) + 1) / 2) * width;
    const cy = ((Math.cos(i * 5.71) + 1) / 2) * (height * 0.68) + height * 0.16;
    ctx.fillRect(cx, cy, 22, 16);
  }

  // Polar ice caps with feathered translucent edge
  const iceGradNorth = ctx.createLinearGradient(0, 0, 0, height * 0.14);
  iceGradNorth.addColorStop(0, "rgba(240, 249, 255, 0.98)");
  iceGradNorth.addColorStop(0.8, "rgba(224, 242, 254, 0.7)");
  iceGradNorth.addColorStop(1, "rgba(224, 242, 254, 0)");
  ctx.fillStyle = iceGradNorth;
  ctx.fillRect(0, 0, width, height * 0.14);

  const iceGradSouth = ctx.createLinearGradient(0, height * 0.86, 0, height);
  iceGradSouth.addColorStop(0, "rgba(224, 242, 254, 0)");
  iceGradSouth.addColorStop(0.2, "rgba(224, 242, 254, 0.7)");
  iceGradSouth.addColorStop(1, "rgba(240, 249, 255, 0.98)");
  ctx.fillStyle = iceGradSouth;
  ctx.fillRect(0, height * 0.86, width, height * 0.14);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Generate Earth Rotating Clouds texture
export function getEarthCloudsTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < 180; i++) {
    const cx = (i / 180) * width + Math.sin(i * 0.4) * 50;
    const cy = ((Math.sin(i * 1.8) + 1) / 2) * height * 0.8 + height * 0.1;
    const r = Math.max(2, 20 + Math.cos(i * 0.8) * 18);

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    grad.addColorStop(0.5, "rgba(255, 255, 255, 0.4)");
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

  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(0, 0, width, height);

  // Lunar maria (dark basalt plains)
  ctx.fillStyle = "#475569";
  for (let i = 0; i < 35; i++) {
    const cx = ((Math.sin(i * 2.1) + 1) / 2) * width;
    const cy = ((Math.cos(i * 3.4) + 1) / 2) * height;
    ctx.beginPath();
    ctx.arc(cx, cy, 20 + Math.random() * 35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Craters with bright ejecta rays
  for (let i = 0; i < 110; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const r = 2.5 + Math.random() * 11;

    ctx.strokeStyle = "rgba(248, 250, 252, 0.6)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(30, 41, 59, 0.7)";
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

// Generate Ultra-Detailed Rocky Carbonaceous/Chondrite Asteroid Texture (Bennu/Apophis Style)
export function getAsteroidTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Dark charcoal carbonaceous basalt base
  ctx.fillStyle = "#3a3836";
  ctx.fillRect(0, 0, width, height);

  // Fine mineral grains and regolith micro-texture
  for (let i = 0; i < 15000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const shade = 45 + Math.floor(Math.random() * 95);
    const r = shade + Math.floor(Math.random() * 12);
    const g = shade;
    const b = shade - Math.floor(Math.random() * 8);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Major boulder fields and mineral clasts
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 6 + Math.random() * 24;

    // Boulder shadow side
    ctx.fillStyle = "rgba(15, 14, 13, 0.85)";
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, size, 0, Math.PI * 2);
    ctx.fill();

    // Boulder illuminated face
    ctx.fillStyle = "rgba(140, 135, 128, 0.9)";
    ctx.beginPath();
    ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  // Deep impact craters with prominent sunlit rims & cast shadows
  for (let i = 0; i < 65; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = 12 + Math.random() * 45;

    // Sunlit crater rim highlight
    ctx.strokeStyle = "rgba(220, 215, 205, 0.9)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(x - 2, y - 2, r, 0, Math.PI * 2);
    ctx.stroke();

    // Shadowed crater floor
    ctx.fillStyle = "rgba(12, 10, 9, 0.92)";
    ctx.beginPath();
    ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Generate Sun Photosphere & Solar Granulation Texture
export function getSunTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(512, 512, 20, 512, 512, 512);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.2, "#fef08a");
  grad.addColorStop(0.5, "#f59e0b");
  grad.addColorStop(0.85, "#ea580c");
  grad.addColorStop(1, "#9a3412");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Granular convective cells
  for (let i = 0; i < 3500; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle = "rgba(254, 215, 170, 0.35)";
    ctx.fillRect(x, y, 3, 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

// Generate Mars Surface Texture (Rust Iron Oxide & Polar Cap)
export function getMarsTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#852e12");
  grad.addColorStop(0.5, "#b94d1b");
  grad.addColorStop(1, "#69210c");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#4a1c0d";
  for (let i = 0; i < 90; i++) {
    const cx = ((Math.sin(i * 2.7) + 1) / 2) * width;
    const cy = ((Math.cos(i * 1.9) + 1) / 2) * (height * 0.7) + height * 0.15;
    const r = 25 + Math.random() * 40;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Polar ice cap
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.arc(width / 2, 12, 40, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

// Generate Venus Cloud Deck Texture
export function getVenusTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#d97706");
  grad.addColorStop(0.5, "#f59e0b");
  grad.addColorStop(1, "#b45309");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(254, 243, 199, 0.35)";
  for (let i = 0; i < 45; i++) {
    const y = (i / 45) * height;
    ctx.fillRect(0, y, width, 3 + Math.random() * 4);
  }

  return new THREE.CanvasTexture(canvas);
}

// Generate Mercury Gray Cratered Texture
export function getMercuryTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#64748b";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 70; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    ctx.fillStyle = "rgba(30, 41, 59, 0.6)";
    ctx.beginPath();
    ctx.arc(cx, cy, 3 + Math.random() * 10, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}
