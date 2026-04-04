/**
 * OfflineGPT - Professional Icon Generator
 * Creates beautiful Gemini-style gradient icons
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 calculation
function crc32(buffer) {
  let crc = 0xFFFFFFFF;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  for (let i = 0; i < buffer.length; i++) {
    crc = table[(crc ^ buffer[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

// Smooth gradient interpolation
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Gemini gradient colors (blue → purple → red)
const gradientColors = [
  { r: 75, g: 144, b: 255 },   // #4b90ff Blue
  { r: 139, g: 164, b: 249 },  // #8ba4f9 Light purple
  { r: 255, g: 85, b: 70 },    // #ff5546 Red/Orange
];

// Brand teal color
const brandTeal = { r: 16, g: 163, b: 127 }; // #10a37f

// Create beautiful Gemini-style icon with sparkle pattern
function createGeminiIcon(width, height) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(2, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const rawData = [];
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte

    for (let x = 0; x < width; x++) {
      // Calculate angle from center for gradient
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.sqrt(cx * cx + cy * cy);

      // Diagonal gradient based on position
      const gradientT = (x / width * 0.6 + y / height * 0.4);

      // Interpolate through gradient colors
      let bgR, bgG, bgB;
      if (gradientT < 0.5) {
        const t = gradientT * 2;
        bgR = lerp(gradientColors[0].r, gradientColors[1].r, t);
        bgG = lerp(gradientColors[0].g, gradientColors[1].g, t);
        bgB = lerp(gradientColors[0].b, gradientColors[1].b, t);
      } else {
        const t = (gradientT - 0.5) * 2;
        bgR = lerp(gradientColors[1].r, gradientColors[2].r, t);
        bgG = lerp(gradientColors[1].g, gradientColors[2].g, t);
        bgB = lerp(gradientColors[1].b, gradientColors[2].b, t);
      }

      // Create a 4-point star/sparkle shape
      const starSize = Math.min(width, height) * 0.32;
      const angle = Math.atan2(dy, dx);

      // Star shape formula
      const starPoints = 4;
      const innerRadius = starSize * 0.25;
      const outerRadius = starSize;

      const angleOffset = Math.PI / 4; // Rotate 45 degrees
      const adjustedAngle = angle + angleOffset;
      const normalizedAngle = ((adjustedAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const segment = (normalizedAngle / (Math.PI * 2)) * starPoints * 2;
      const segmentPhase = segment % 1;

      // Calculate star radius at this angle
      const isOuter = Math.floor(segment) % 2 === 0;
      let starRadius;
      if (isOuter) {
        starRadius = lerp(outerRadius, innerRadius, segmentPhase);
      } else {
        starRadius = lerp(innerRadius, outerRadius, segmentPhase);
      }

      let r, g, b;

      // Inside star - white with subtle shading
      if (dist < starRadius * 0.9) {
        const shade = Math.floor(255 - (dist / starRadius) * 20);
        r = shade;
        g = shade;
        b = shade;
      } else if (dist < starRadius) {
        // Star edge - smooth transition
        const t = (dist - starRadius * 0.9) / (starRadius * 0.1);
        r = Math.floor(lerp(245, bgR, t));
        g = Math.floor(lerp(245, bgG, t));
        b = Math.floor(lerp(245, bgB, t));
      } else {
        // Background gradient
        r = Math.floor(bgR);
        g = Math.floor(bgG);
        b = Math.floor(bgB);
      }

      rawData.push(r, g, b);
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(rawData), { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Create splash screen with centered logo on black background
function createSplashScreen(width, height) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(2, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const rawData = [];
  const cx = width / 2;
  const cy = height / 2;

  // Pure black background
  const bgColor = { r: 0, g: 0, b: 0 };

  for (let y = 0; y < height; y++) {
    rawData.push(0);

    for (let x = 0; x < width; x++) {
      // Logo area in center
      const logoSize = Math.min(width, height) * 0.12;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Star shape for logo
      const starSize = logoSize;
      const angle = Math.atan2(dy, dx);
      const starPoints = 4;
      const innerRadius = starSize * 0.25;
      const outerRadius = starSize;

      const angleOffset = Math.PI / 4;
      const adjustedAngle = angle + angleOffset;
      const normalizedAngle = ((adjustedAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const segment = (normalizedAngle / (Math.PI * 2)) * starPoints * 2;
      const segmentPhase = segment % 1;

      const isOuter = Math.floor(segment) % 2 === 0;
      let starRadius;
      if (isOuter) {
        starRadius = lerp(outerRadius, innerRadius, segmentPhase);
      } else {
        starRadius = lerp(innerRadius, outerRadius, segmentPhase);
      }

      let r, g, b;

      if (dist < starRadius) {
        // Logo with gradient
        const gradientT = (x / width * 0.6 + y / height * 0.4);

        if (gradientT < 0.5) {
          const t = gradientT * 2;
          r = Math.floor(lerp(gradientColors[0].r, gradientColors[1].r, t));
          g = Math.floor(lerp(gradientColors[0].g, gradientColors[1].g, t));
          b = Math.floor(lerp(gradientColors[0].b, gradientColors[1].b, t));
        } else {
          const t = (gradientT - 0.5) * 2;
          r = Math.floor(lerp(gradientColors[1].r, gradientColors[2].r, t));
          g = Math.floor(lerp(gradientColors[1].g, gradientColors[2].g, t));
          b = Math.floor(lerp(gradientColors[1].b, gradientColors[2].b, t));
        }
      } else if (dist < starRadius + 8) {
        // Subtle glow
        const glowT = (dist - starRadius) / 8;
        r = Math.floor(lerp(gradientColors[1].r * 0.3, 0, glowT));
        g = Math.floor(lerp(gradientColors[1].g * 0.3, 0, glowT));
        b = Math.floor(lerp(gradientColors[1].b * 0.3, 0, glowT));
      } else {
        // Pure black background
        r = bgColor.r;
        g = bgColor.g;
        b = bgColor.b;
      }

      rawData.push(r, g, b);
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(rawData), { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Main
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

console.log('\n  OfflineGPT Icon Generator');
console.log('  ========================\n');
console.log('  Brand: Gemini-style gradient (Blue → Purple → Red)\n');

// Generate app icon (1024x1024)
console.log('  Creating icon.png...');
const icon = createGeminiIcon(1024, 1024);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon);
console.log('  Done!\n');

// Generate adaptive icon (1024x1024)
console.log('  Creating adaptive-icon.png...');
const adaptiveIcon = createGeminiIcon(1024, 1024);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptiveIcon);
console.log('  Done!\n');

// Generate splash screen (1284x2778)
console.log('  Creating splash.png...');
const splash = createSplashScreen(1284, 2778);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), splash);
console.log('  Done!\n');

console.log('  All icons created successfully!');
console.log('\n  Your app icons are ready in the assets/ folder\n');
