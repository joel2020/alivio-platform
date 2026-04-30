import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const sourceFiles = [
  'src/pages/marketing/HomePage.tsx',
  'src/components/marketing/MarketingNav.tsx',
  'src/components/marketing/MarketingFooter.tsx',
  'src/components/marketing/sections/HeroSection.tsx',
  'src/components/marketing/sections/FeatureShowcaseSection.tsx',
  'src/components/marketing/sections/FinalCTASection.tsx',
  'src/lib/demoBooking.ts',
  'src/lib/siteVersion.ts',
];

const requiredMarkers = [
  'Alivio Search Partners',
  'Hire Critical Healthcare & Technical Talent',
  'Active Search Intelligence',
  'Book an Intro Call',
];

const source = (
  await Promise.all(sourceFiles.map((file) => readFile(path.join(repoRoot, file), 'utf8')))
).join('\n');

const missingMarkers = requiredMarkers.filter((marker) => !source.includes(marker));

if (missingMarkers.length > 0) {
  console.error('Homepage source smoke test failed. Missing markers:');
  for (const marker of missingMarkers) {
    console.error(`- ${marker}`);
  }
  process.exit(1);
}

console.log('Homepage source smoke test passed.');
