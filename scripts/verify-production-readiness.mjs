import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { homepageMarkers, verifyHomepage } from './verify-homepage.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bookingUrl = 'https://cal.com/alivio/intro-call30';

const requiredEnv = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_ENABLE_CLIENT_SHORTLIST_PORTAL',
];

const fakeClientLogoTerms = [
  'Mayo',
  'Mayo Clinic',
  'HCA',
  'Google',
  'OpenAI',
  'Cleveland Clinic',
  'Kaiser',
];

const publicMarketingRoots = [
  'src/pages/marketing',
  'src/components/marketing',
  'src/lib/demoBooking.ts',
  'src/pages/marketing/HomePage.tsx',
  'public',
  'index.html',
];

async function readRepoFile(filePath) {
  return readFile(path.join(repoRoot, filePath), 'utf8');
}

async function fileExists(filePath) {
  try {
    await readRepoFile(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(targetPath) {
  const absolutePath = path.join(repoRoot, targetPath);
  const entries = await readdir(absolutePath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(targetPath, entry.name).replaceAll(path.sep, '/');
    if (entry.isDirectory()) {
      files.push(...await listFiles(relativePath));
    } else if (/\.(tsx?|jsx?|html|svg|txt|json|md)$/.test(entry.name)) {
      files.push(relativePath);
    }
  }

  return files;
}

async function collectFiles(paths) {
  const files = new Set();
  for (const targetPath of paths) {
    if (await fileExists(targetPath)) {
      files.add(targetPath);
    } else {
      for (const file of await listFiles(targetPath)) files.add(file);
    }
  }
  return [...files];
}

function failIf(condition, failures, message) {
  if (condition) failures.push(message);
}

async function verifyEnvExample(failures) {
  const envExample = await readRepoFile('.env.example');

  for (const envName of requiredEnv) {
    failIf(
      !new RegExp(`^${envName}=`, 'm').test(envExample),
      failures,
      `.env.example must document ${envName}.`,
    );
  }

  failIf(
    !/^VITE_ENABLE_CLIENT_SHORTLIST_PORTAL=false$/m.test(envExample),
    failures,
    '.env.example must default VITE_ENABLE_CLIENT_SHORTLIST_PORTAL=false.',
  );
}

async function verifyBookingUrl(failures) {
  const files = await collectFiles(['src', 'public', 'index.html']);
  const matches = [];

  for (const file of files) {
    const source = await readRepoFile(file);
    if (source.includes(bookingUrl)) matches.push(file);
  }

  failIf(matches.length === 0, failures, `Source must include the Cal.com booking URL: ${bookingUrl}`);
}

async function verifyPublicMarketingBranding(failures) {
  const files = await collectFiles(publicMarketingRoots);

  for (const file of files) {
    const source = await readRepoFile(file);
    if (source.includes('Alivio Platform')) {
      failures.push(`${file} is public-facing marketing source and must not brand the homepage as "Alivio Platform".`);
    }

    for (const term of fakeClientLogoTerms) {
      if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(source)) {
        failures.push(`${file} contains possible unverified public client-logo text: "${term}".`);
      }
    }
  }
}

async function verifyVercelSpaRouting(failures) {
  const vercelConfig = JSON.parse(await readRepoFile('vercel.json'));
  const redirects = vercelConfig.redirects ?? [];
  const rewrites = vercelConfig.rewrites ?? [];

  const rootRedirect = redirects.find((redirect) => redirect.source === '/' && redirect.destination !== '/');
  const hasIndexRewrite = rewrites.some((rewrite) => rewrite.destination === '/index.html');

  failIf(Boolean(rootRedirect), failures, 'vercel.json must not redirect "/" away from the Vite app.');
  failIf(!hasIndexRewrite, failures, 'vercel.json must rewrite SPA routes to /index.html.');
}

async function verifyPackageScripts(failures) {
  const packageJson = JSON.parse(await readRepoFile('package.json'));
  const scripts = packageJson.scripts ?? {};

  for (const scriptName of ['typecheck', 'build', 'verify:homepage', 'verify:production']) {
    failIf(!scripts[scriptName], failures, `package.json must define npm run ${scriptName}.`);
  }
}

const homepageResult = await verifyHomepage({ silent: true });
const failures = [...homepageResult.failures];

await verifyEnvExample(failures);
await verifyBookingUrl(failures);
await verifyPublicMarketingBranding(failures);
await verifyVercelSpaRouting(failures);
await verifyPackageScripts(failures);

if (failures.length > 0) {
  console.error('Production readiness verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Production readiness verification passed.');
console.log(`Verified homepage markers: ${homepageMarkers.join(', ')}`);
