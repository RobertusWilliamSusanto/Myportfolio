import fs from 'fs';
import { PNG } from 'pngjs';

const ref = PNG.sync.read(fs.readFileSync('reference/ref-768px-reduced.png'));
const dist = PNG.sync.read(fs.readFileSync('reference/diff/dist-768px-reduced.png'));

// Let's find the first 5 rows that differ
let differentRows = [];
for (let y = 0; y < ref.height; y++) {
  let diffInRow = 0;
  let firstX = -1;
  for (let x = 0; x < ref.width; x++) {
    const idx = (ref.width * y + x) << 2;
    const dr = Math.abs(ref.data[idx] - dist.data[idx]);
    const dg = Math.abs(ref.data[idx+1] - dist.data[idx+1]);
    const db = Math.abs(ref.data[idx+2] - dist.data[idx+2]);
    if (dr > 20 || dg > 20 || db > 20) {
      diffInRow++;
      if (firstX === -1) firstX = x;
    }
  }
  if (diffInRow > 50) {
    differentRows.push({ y, diffInRow, firstX });
    if (differentRows.length >= 10) break;
  }
}

console.log('First differing rows:', differentRows);
const sample = differentRows[0];
if (sample) {
  const y = sample.y;
  const x = sample.firstX;
  const idx = (ref.width * y + x) << 2;
  console.log(`At x=${x}, y=${y}:`);
  console.log(`Ref RGBA:  ${ref.data[idx]}, ${ref.data[idx+1]}, ${ref.data[idx+2]}, ${ref.data[idx+3]}`);
  console.log(`Dist RGBA: ${dist.data[idx]}, ${dist.data[idx+1]}, ${dist.data[idx+2]}, ${dist.data[idx+3]}`);
}
