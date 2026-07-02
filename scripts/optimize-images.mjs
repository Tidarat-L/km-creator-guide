// Downscale + recompress all guide images in place (same filenames, so
// products.js keeps working). Fixes oversized 249MB deploy that Render
// couldn't publish completely. Resizes to max 1500px, re-encodes; only
// overwrites when the result is actually smaller.
import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = 'C:/Users/user/Project/km-creator-guide/dist/img';
const MAX = 1500;

function walk(dir){
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(png|jpe?g)$/i.test(name)) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let before = 0, after = 0, changed = 0, skipped = 0;

for (const f of files) {
  const origSize = statSync(f).size;
  before += origSize;
  try {
    const input = readFileSync(f);              // read once via fs (avoids Windows double-open lock)
    const meta = await sharp(input, { failOn: 'none' }).metadata();
    const big = Math.max(meta.width || 0, meta.height || 0);
    let pipe = sharp(input, { failOn: 'none' }).rotate();
    if (big > MAX) pipe = pipe.resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true });
    const ext = extname(f).toLowerCase();
    let buf;
    if (ext === '.png') {
      buf = await pipe.png({ compressionLevel: 9, effort: 10, palette: true, quality: 90 }).toBuffer();
    } else {
      buf = await pipe.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
    }
    if (buf.length < origSize) {
      writeFileSync(f, buf);
      after += buf.length;
      changed++;
    } else {
      after += origSize;
      skipped++;
    }
  } catch (e) {
    after += origSize; skipped++;
    console.warn('skip', f, e.message);
  }
}

const mb = n => (n / 1048576).toFixed(1) + ' MB';
console.log(`files: ${files.length} | recompressed: ${changed} | kept: ${skipped}`);
console.log(`total: ${mb(before)} -> ${mb(after)}  (saved ${mb(before - after)})`);
