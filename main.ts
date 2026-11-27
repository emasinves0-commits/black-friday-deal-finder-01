// DealSleuth — a working black-friday-deal-finder-01 entry (Node 22, standard
// library only). The site is this directory's app/ folder: plain static files
// a browser opens at app/index.html (ES modules, CSS, no build step), its 32
// deals held in its own files — nothing it runs, styles or shows loads over
// the network, and each deal links out to its store. The program hands it
// in: it copies app/ and screenshots/ from beside this file to the output
// directory and writes dossier.json, the summary the judge reads (the
// screenshots, the first load's files and bytes, and the source), with the
// vendored make.fun library. Leave vendor/makefun-frontend.ts as it is: the
// scorer requires dossier.json to be byte for byte what its own copy writes.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 16 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);

// Verify the hand-in before reporting success: the dossier must exist and be
// non-empty, and every screenshot must be present and within the 256 KiB cap
// — a silent short hand-in is worse than a loud failure.
const dossier = readFileSync(join(out, 'dossier.json'), 'utf8');
if (dossier.length < 100) throw new Error('dossier.json is suspiciously small: ' + dossier.length + ' bytes');
const shots = readdirSync(join(out, 'screenshots')).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (shots.length < 3) throw new Error('expected at least 3 screenshots, found ' + shots.length);
for (const f of shots) {
  const bytes = statSync(join(out, 'screenshots', f)).size;
  if (bytes > 262144) throw new Error('screenshot over the 256 KiB cap: ' + f + ' (' + bytes + ' bytes)');
}
console.log(`DealSleuth hand-in OK: dossier.json ${dossier.length} bytes, ${shots.length} screenshots (${shots.join(', ')})`);

