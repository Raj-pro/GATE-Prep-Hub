#!/usr/bin/env node
/**
 * upload-pdfs.js
 * One-time script: uploads all PDFs from "gate book - Copy/" to Supabase Storage.
 *
 * Prerequisites:
 *   1. Add SUPABASE_SERVICE_KEY to your .env  (Settings → API → service_role)
 *   2. Create a public bucket named "gate-pdfs" in Supabase dashboard
 *      Storage → New bucket → name: gate-pdfs → Public: ON
 *   3. Run: node upload-pdfs.js
 *
 * Safe to re-run — x-upsert:true overwrites existing files.
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

/* ── Load .env ── */
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌  .env file not found');
  process.exit(1);
}

const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eq = trimmed.indexOf('=');
  if (eq === -1) return;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
  env[key] = val;
});

const SUPABASE_URL  = env.SUPABASE_URL;
const SERVICE_KEY   = env.SUPABASE_SERVICE_KEY;
const BUCKET        = 'gate-pdfs';
const LOCAL_DIR     = path.join(__dirname, 'gate book - Copy');

if (!SUPABASE_URL) {
  console.error('❌  SUPABASE_URL missing from .env');
  process.exit(1);
}
if (!SERVICE_KEY) {
  console.error('❌  SUPABASE_SERVICE_KEY missing from .env');
  console.error('    Go to Supabase → Settings → API → service_role and paste it in.');
  process.exit(1);
}
if (!fs.existsSync(LOCAL_DIR)) {
  console.error(`❌  Folder not found: ${LOCAL_DIR}`);
  process.exit(1);
}

/* ── Walk directory for PDFs ── */
function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(fullPath));
    } else if (entry.name.toLowerCase().endsWith('.pdf')) {
      results.push(fullPath);
    }
  }
  return results;
}

/* ── Upload one file via HTTPS ── */
function uploadFile(localPath) {
  const relativePath = path.relative(LOCAL_DIR, localPath);
  const storagePath  = relativePath.split(path.sep).join('/');
  const encodedPath  = storagePath.split('/').map(encodeURIComponent).join('/');

  const target = new URL(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodedPath}`);
  const fileBuffer = fs.readFileSync(localPath);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: target.hostname,
        path:     target.pathname,
        method:   'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type':  'application/pdf',
          'Content-Length': fileBuffer.length,
          'x-upsert':      'true',
        },
      },
      res => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(storagePath);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });
}

/* ── Main ── */
(async () => {
  const pdfs = walk(LOCAL_DIR);
  console.log(`\nFound ${pdfs.length} PDFs in "gate book - Copy/"`);
  console.log(`Uploading to: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/\n`);

  let done = 0, failed = 0;

  for (const pdf of pdfs) {
    const short = path.relative(LOCAL_DIR, pdf);
    const label = short.length > 60 ? '…' + short.slice(-59) : short;
    process.stdout.write(`  [${done + failed + 1}/${pdfs.length}] ${label} `);
    try {
      await uploadFile(pdf);
      process.stdout.write('✅\n');
      done++;
    } catch (err) {
      process.stdout.write(`❌  ${err.message}\n`);
      failed++;
    }
  }

  console.log(`\n──────────────────────────────`);
  console.log(`Uploaded: ${done}  |  Failed: ${failed}`);
  if (failed > 0) {
    console.log('Re-run the script — failed uploads can be retried safely.');
    process.exit(1);
  } else {
    console.log('All PDFs are now live on Supabase Storage. 🎉');
  }
})();
