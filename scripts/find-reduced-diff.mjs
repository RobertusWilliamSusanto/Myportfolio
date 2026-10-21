import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const img1 = PNG.sync.read(fs.readFileSync('reference/diff/orig-1440px-reduced.png'));
const img2 = PNG.sync.read(fs.readFileSync('reference/diff/dist-1440px-reduced.png'));
const diff = new PNG({ width: img1.width, height: img1.height });
pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, { threshold: 0.1 });
fs.writeFileSync('reference/diff/diff-1440-reduced.png', PNG.sync.write(diff));

let minX = img1.width, maxX = 0, minY = img1.height, maxY = 0;
let diffCount = 0;
for (let y = 0; y < img1.height; y++) {
  for (let x = 0; x < img1.width; x++) {
    const idx = (img1.width * y + x) << 2;
    if (diff.data[idx] === 255 && diff.data[idx+1] === 0 && diff.data[idx+2] === 0) {
      diffCount++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log('Total diff pixels:', diffCount, 'Percentage:', (diffCount / (img1.width * img1.height) * 100).toFixed(4) + '%');
console.log('Diff bounding box: x=[' + minX + ', ' + maxX + '], y=[' + minY + ', ' + maxY + ']');

// Also check the first 5 distinct Y regions where diffs occur
let regions = [];
for (let y = 0; y < img1.height; y++) {
  let countInRow = 0;
  for (let x = 0; x < img1.width; x++) {
    const idx = (img1.width * y + x) << 2;
    if (diff.data[idx] === 255 && diff.data[idx+1] === 0 && diff.data[idx+2] === 0) {
      countInRow++;
    }
  }
  if (countInRow > 20) {
    if (regions.length === 0 || y - regions[regions.length - 1].endY > 30) {
      regions.push({ startY: y, endY: y, maxCount: countInRow });
    } else {
      regions[regions.length - 1].endY = y;
      if (countInRow > regions[regions.length - 1].maxCount) regions[regions.length - 1].maxCount = countInRow;
    }
  }
}
console.log('Differing Y regions:', regions.slice(0, 10));
