#!/usr/bin/env node
/**
 * Expands translations.json into per-locale JSON files for Vite's glob import.
 * Non-en locales are merged with English (delta applied on top of en).
 *
 * Run: node web/scripts/generate-locales.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(__dirname, '../src/lib/locales');
const srcPath = resolve(__dirname, '../src/lib/translations.json');

const data = JSON.parse(readFileSync(srcPath, 'utf-8'));
const en = data.en;

// Write en.json
writeFileSync(resolve(localesDir, 'en.json'), JSON.stringify(en, null, 2) + '\n');

let count = 1;

for (const [locale, delta] of Object.entries(data)) {
  if (locale === 'en' || locale === '_meta') continue;

  // Merge: start with English, overlay locale-specific translations
  const merged = { ...en, ...delta };

  // Only keep keys that exist in the delta (locale files don't need untranslated keys
  // because t() falls back to en automatically)
  writeFileSync(
    resolve(localesDir, `${locale}.json`),
    JSON.stringify(delta, null, 2) + '\n'
  );
  count++;
}

console.log(`Generated ${count} locale files from translations.json`);
