import fs from 'fs';
import { PNG } from 'pngjs';

const img1 = PNG.sync.read(fs.readFileSync('reference/diff/orig-1440px-reduced.png'));
const img2 = PNG.sync.read(fs.readFileSync('reference/diff/dist-1440px-reduced.png'));

// Check what H1 text looks like
// Let's sample a few pixels of the text at y=485 across x=500 to 700
console.log('Comparing H1 row at y=485:');
for (let x = 500; x < 700; x += 10) {
  const i1 = (img1.width * 485 + x) << 2;
  const i2 = (img2.width * 485 + x) << 2;
  const c1 = `${img1.data[i1]},${img1.data[i1+1]},${img1.data[i1+2]}`;
  const c2 = `${img2.data[i2]},${img2.data[i2+1]},${img2.data[i2+2]}`;
  if (c1 !== c2) {
    console.log(`x=${x}: orig=[${c1}] dist=[${c2}]`);
  }
}
