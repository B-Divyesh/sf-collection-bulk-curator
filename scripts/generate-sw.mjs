import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const outputDirectory = resolve(process.argv[2] ?? 'dist');
const templatePath = resolve('public/sw.js');

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  }));
  return paths.flat();
}

function releaseId() {
  const configured = process.env.RELEASE_ID ?? process.env.GITHUB_SHA ?? process.env.BUILD_SOURCEVERSION;
  if (configured) return configured;
  try {
    return execFileSync('git', ['rev-parse', '--verify', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

const template = await readFile(templatePath, 'utf8');
if (!template.includes('__CACHE_VERSION__')) throw new Error('public/sw.js is missing its cache-version placeholder.');

const fingerprint = createHash('sha256');
fingerprint.update(template);
const artifactFiles = (await filesBelow(outputDirectory))
  .filter((path) => relative(outputDirectory, path).replaceAll('\\', '/') !== 'sw.js')
  .sort();
for (const path of artifactFiles) {
  fingerprint.update(relative(outputDirectory, path).replaceAll('\\', '/'));
  fingerprint.update(await readFile(path));
}
const artifactId = fingerprint.digest('hex').slice(0, 12);
const sourceId = releaseId().replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || artifactId;
const cacheVersion = `r${sourceId}-${artifactId}`;

await writeFile(join(outputDirectory, 'sw.js'), template.replace('__CACHE_VERSION__', cacheVersion));
console.log(`Generated dist/sw.js with cache ${cacheVersion}.`);
