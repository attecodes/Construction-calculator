// Generates the PWA icons as PNGs without any image libraries.
// Run: node scripts/gen-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const AMBER = [245, 165, 36, 255]; // --accent
const DARK = [31, 36, 45, 255]; // --panel

function crc32(buf) {
  let c,
    crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter: none
    rgba.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function renderIcon(size, fullBleed) {
  const px = Buffer.alloc(size * size * 4);
  const s = size / 512; // design coordinates are on a 512 grid

  const set = (x, y, [r, g, b, a]) => {
    const i = (y * size + x) * 4;
    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
    px[i + 3] = a;
  };

  // Background: full square for maskable, rounded square otherwise.
  const radius = fullBleed ? 0 : 96 * s;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let inside = true;
      if (radius > 0) {
        const dx = Math.max(radius - x, x - (size - 1 - radius), 0);
        const dy = Math.max(radius - y, y - (size - 1 - radius), 0);
        inside = dx * dx + dy * dy <= radius * radius;
      }
      if (inside) set(x, y, AMBER);
    }
  }

  const fillRect = (x0, y0, x1, y1, color) => {
    for (let y = Math.round(y0 * s); y < Math.round(y1 * s); y++)
      for (let x = Math.round(x0 * s); x < Math.round(x1 * s); x++)
        set(x, y, color);
  };

  const fillCircle = (cx, cy, r, color) => {
    cx *= s;
    cy *= s;
    r *= s;
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const dx = x - cx,
          dy = y - cy;
        if (dx * dx + dy * dy <= r * r) set(x, y, color);
      }
  };

  // Calculator display with an amber "tick mark" row like a tape measure.
  fillRect(96, 104, 416, 200, DARK);
  fillRect(120, 168, 136, 192, AMBER);
  fillRect(168, 152, 184, 192, AMBER);
  fillRect(216, 168, 232, 192, AMBER);
  fillRect(264, 136, 280, 192, AMBER);
  fillRect(312, 168, 328, 192, AMBER);
  fillRect(360, 152, 376, 192, AMBER);

  // Keypad: 3 x 2 round keys.
  for (const cy of [288, 392]) {
    for (const cx of [144, 256, 368]) fillCircle(cx, cy, 40, DARK);
  }

  return encodePNG(size, size, px);
}

mkdirSync("public", { recursive: true });
writeFileSync("public/icon-192.png", renderIcon(192, false));
writeFileSync("public/icon-512.png", renderIcon(512, false));
writeFileSync("public/icon-maskable-512.png", renderIcon(512, true));
writeFileSync("public/apple-touch-icon.png", renderIcon(180, true));
console.log("Icons written to public/");
