import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
await mkdir(dist, { recursive: true });
await copyFile(resolve(root, 'sw.js'), resolve(dist, 'sw.js'));
