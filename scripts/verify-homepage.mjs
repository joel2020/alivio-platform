import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const homepageMarkers = [
  'Hire Critical Healthcare & Technical Talent',
  'Active Search Intelligence',
  'Alivio Search Partners',
  'Book an Intro Call',
  'Healthcare Leadership Search',
  'Technical & AI Hiring',
  'Candidate Pipeline Intelligence',
];

const routeFile = 'src/App.tsx';
const homepageFile = 'src/pages/marketing/HomePage.tsx';

async function readRepoFile(filePath) {
  return readFile(path.join(repoRoot, filePath), 'utf8');
}

function normalizeSource(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&nbsp;', ' ')
    .replace(/\s+/g, ' ');
}

function resolveImport(fromFile, importPath) {
  if (!importPath.startsWith('.')) return null;

  const fromDir = path.dirname(fromFile);
  const basePath = path.normalize(path.join(fromDir, importPath));
  const candidates = [
    basePath,
    `${basePath}.tsx`,
    `${basePath}.ts`,
    `${basePath}.jsx`,
    `${basePath}.js`,
    path.join(basePath, 'index.tsx'),
    path.join(basePath, 'index.ts'),
  ];

  return candidates.find((candidate) => candidate.startsWith('src/')) ?? null;
}

async function collectSourceGraph(entryFile, seen = new Set()) {
  const normalizedEntry = path.normalize(entryFile).replaceAll(path.sep, '/');
  if (seen.has(normalizedEntry)) return '';
  seen.add(normalizedEntry);

  let source;
  try {
    source = await readRepoFile(normalizedEntry);
  } catch {
    return '';
  }

  const imports = [...source.matchAll(/import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g)]
    .map((match) => resolveImport(normalizedEntry, match[1]))
    .filter(Boolean);

  const importedSource = await Promise.all(imports.map((file) => collectSourceGraph(file, seen)));
  return [source, ...importedSource].join('\n');
}

function verifyRootRoute(appSource) {
  const importPattern = /import\s+HomePage\s+from\s+['"]\.\/pages\/marketing\/HomePage['"];?/;
  const rootRoutePattern = /<Route\s+path=["']\/["']\s+element=\{<HomePage\s*\/>\}\s*\/>/;

  const failures = [];
  if (!importPattern.test(appSource)) {
    failures.push(`${routeFile} must import HomePage from ./pages/marketing/HomePage.`);
  }
  if (!rootRoutePattern.test(appSource)) {
    failures.push(`${routeFile} must render <HomePage /> for the root route path="/".`);
  }
  return failures;
}

export async function verifyHomepage({ silent = false } = {}) {
  const homepageSource = normalizeSource(await collectSourceGraph(homepageFile));
  const appSource = await readRepoFile(routeFile);

  const missingMarkers = homepageMarkers.filter((marker) => !homepageSource.includes(marker));
  const failures = [
    ...missingMarkers.map((marker) => `${homepageFile} source graph is missing homepage marker: "${marker}".`),
    ...verifyRootRoute(appSource),
  ];

  if (failures.length > 0) {
    if (!silent) {
      console.error('Homepage verification failed:');
      for (const failure of failures) console.error(`- ${failure}`);
    }
    return { ok: false, failures };
  }

  if (!silent) {
    console.log('Homepage verification passed.');
    console.log(`Verified ${homepageMarkers.length} homepage markers and root route wiring.`);
  }
  return { ok: true, failures: [] };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await verifyHomepage();
  if (!result.ok) process.exit(1);
}
