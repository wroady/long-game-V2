// Generates PWA icons from an inline SVG using sharp.
// Run with: npm run icons
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

// The "long game" mark: a sage ascending line chart with a clay endpoint,
// on the dark forest-green background from the app's design system.
const mark = `
  <line x1="96" y1="404" x2="416" y2="404" stroke="#344039" stroke-width="14" stroke-linecap="round"/>
  <polyline points="96,352 192,300 280,332 416,168"
            fill="none" stroke="#7C9473" stroke-width="26"
            stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="416" cy="168" r="30" fill="#C76B4A"/>
`;

const svg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#1C2620"/>
  ${inner}
</svg>`;

// Standard icon: mark sits with comfortable padding.
const standardSvg = svg(mark);
// Maskable icon: keep the mark inside the inner 80% safe zone (scale 0.8, centered).
const maskableSvg = svg(`<g transform="translate(51.2,51.2) scale(0.8)">${mark}</g>`);

const targets = [
  { file: 'icon-192.png', size: 192, src: standardSvg },
  { file: 'icon-512.png', size: 512, src: standardSvg },
  { file: 'icon-maskable-512.png', size: 512, src: maskableSvg },
  { file: 'apple-touch-icon.png', size: 180, src: standardSvg },
];

for (const { file, size, src } of targets) {
  await sharp(Buffer.from(src)).resize(size, size).png().toFile(resolve(publicDir, file));
  console.log('wrote', file, `(${size}x${size})`);
}
