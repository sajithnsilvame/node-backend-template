#!/usr/bin/env node

'use strict';

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ─── ANSI Color Palette ────────────────────────────────────────────────────────
const c = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',

  black:   '\x1b[30m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',

  bgBlue:    '\x1b[44m',
  bgGreen:   '\x1b[42m',
  bgRed:     '\x1b[41m',
  bgYellow:  '\x1b[43m',
  bgMagenta: '\x1b[45m',
};

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

// ─── Helpers ──────────────────────────────────────────────────────────────────
const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });
const pad = (n, len = 2) => String(n).padStart(len, '0');
const hr = (char = '─', len = 60) => char.repeat(len);

function log(symbol, color, label, msg = '') {
  process.stdout.write(
    `  ${color}${symbol}${c.reset}  ${c.dim}[${now()}]${c.reset}  ${c.bold}${color}${label}${c.reset}${msg ? `  ${c.dim}${msg}${c.reset}` : ''}\n`
  );
}

function step(label, msg)    { log('›', c.cyan,    label, msg); }
function success(label, msg) { log('✔', c.green,   label, msg); }
function warn(label, msg)    { log('⚠', c.yellow,  label, msg); }
function fail(label, msg)    { log('✖', c.red,     label, msg); }
function info(label, msg)    { log('◈', c.magenta, label, msg); }

function spinner(label) {
  const frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  let i = 0;
  const iv = setInterval(() => {
    process.stdout.write(`\r  ${c.cyan}${frames[i % frames.length]}${c.reset}  ${c.bold}${c.cyan}${label}${c.reset}  `);
    i++;
  }, 80);
  return () => {
    clearInterval(iv);
    process.stdout.write('\r' + ' '.repeat(label.length + 12) + '\r');
  };
}

function execStep(cmd, label) {
  const stop = spinner(label);
  try {
    execSync(cmd, { stdio: 'pipe', cwd: path.join(__dirname, '..') });
    stop();
    return true;
  } catch (err) {
    stop();
    const errOut = (err.stderr || err.stdout || '').toString().trim();
    if (errOut) {
      process.stdout.write(`\n${c.dim}${errOut}${c.reset}\n`);
    }
    return false;
  }
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function getDirSize(dirPath) {
  let total = 0;
  if (!fs.existsSync(dirPath)) return '0 B';
  const walk = (p) => {
    for (const f of fs.readdirSync(p)) {
      const fp = path.join(p, f);
      const stat = fs.statSync(fp);
      if (stat.isDirectory()) walk(fp);
      else total += stat.size;
    }
  };
  walk(dirPath);
  if (total < 1024)        return `${total} B`;
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
  return `${(total / (1024 * 1024)).toFixed(2)} MB`;
}

function countFiles(dirPath, ext) {
  if (!fs.existsSync(dirPath)) return 0;
  let count = 0;
  const walk = (p) => {
    for (const f of fs.readdirSync(p)) {
      const fp = path.join(p, f);
      const stat = fs.statSync(fp);
      if (stat.isDirectory()) walk(fp);
      else if (!ext || f.endsWith(ext)) count++;
    }
  };
  walk(dirPath);
  return count;
}

// ─── Banner ───────────────────────────────────────────────────────────────────
function printBanner() {
  console.log();
  console.log(`  ${c.bgBlue}${c.bold}${c.white}                                                            ${c.reset}`);
  console.log(`  ${c.bgBlue}${c.bold}${c.white}    NODE MYSQL TEMPLATE  ·  Production Build                ${c.reset}`);
  console.log(`  ${c.bgBlue}${c.bold}${c.white}                                                            ${c.reset}`);
  console.log();
  info('Package',   `${pkg.name}  v${pkg.version}`);
  info('Author',    pkg.author || 'unknown');
  info('Build at',  new Date().toLocaleString());
  console.log();
  console.log(`  ${c.dim}${hr()}${c.reset}`);
  console.log();
}

function printSummary(steps, totalMs) {
  const distDir = path.join(__dirname, '../dist');
  console.log();
  console.log(`  ${c.dim}${hr()}${c.reset}`);
  console.log();

  const allPassed = steps.every(s => s.ok);

  if (allPassed) {
    console.log(`  ${c.bgGreen}${c.bold}${c.black}   BUILD SUCCESSFUL   ${c.reset}  ${c.dim}Completed in ${formatDuration(totalMs)}${c.reset}`);
  } else {
    console.log(`  ${c.bgRed}${c.bold}${c.white}   BUILD FAILED   ${c.reset}  ${c.dim}Some steps failed${c.reset}`);
  }

  console.log();
  console.log(`  ${c.bold}Steps:${c.reset}`);
  for (const s of steps) {
    const icon  = s.ok ? `${c.green}✔${c.reset}` : `${c.red}✖${c.reset}`;
    const label = s.ok ? `${c.green}${s.name}${c.reset}` : `${c.red}${s.name}${c.reset}`;
    const dur   = `${c.dim}${formatDuration(s.ms)}${c.reset}`;
    console.log(`    ${icon}  ${label}  ${dur}`);
  }

  if (allPassed && fs.existsSync(distDir)) {
    const jsFiles = countFiles(distDir, '.js');
    const size    = getDirSize(distDir);
    console.log();
    console.log(`  ${c.bold}Output:${c.reset}`);
    console.log(`    ${c.cyan}◈${c.reset}  ${c.dim}dist/${c.reset}  ${c.yellow}${jsFiles} JS files${c.reset}  ${c.dim}·${c.reset}  ${c.yellow}${size}${c.reset}`);
    console.log(`    ${c.cyan}◈${c.reset}  ${c.dim}Run with:${c.reset}  ${c.bold}node dist/app.js${c.reset}`);
  }

  console.log();
  console.log(`  ${c.dim}${hr()}${c.reset}`);
  console.log();
}

// ─── Main Build ───────────────────────────────────────────────────────────────
(function main() {
  printBanner();

  const steps = [];
  const totalStart = Date.now();

  // ── Step 1: Clean dist ────────────────────────────────────────────────────
  step('Cleaning',  'removing previous dist/ output...');
  const t1 = Date.now();
  const distDir = path.join(__dirname, '../dist');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  steps.push({ name: 'Clean dist/', ok: true, ms: Date.now() - t1 });
  success('Clean', 'dist/ removed');

  // ── Step 2: TypeScript compile ────────────────────────────────────────────
  step('Compiling', 'TypeScript → JavaScript  (tsc)...');
  const t2 = Date.now();
  const tscOk = execStep('npx tsc -p tsconfig.json', 'Compiling TypeScript');
  const tscMs = Date.now() - t2;
  steps.push({ name: 'TypeScript compile', ok: tscOk, ms: tscMs });

  if (tscOk) {
    success('TypeScript', `compiled in ${formatDuration(tscMs)}`);
  } else {
    fail('TypeScript', 'compilation failed — see errors above');
    printSummary(steps, Date.now() - totalStart);
    process.exit(1);
  }

  // ── Step 3: Copy assets ───────────────────────────────────────────────────
  step('Copying', 'assets & config files to dist/...');
  const t3 = Date.now();
  const assetsOk = execStep(
    'npx copyfiles -u 1 "src/assets/**/*" "src/config/*.js" dist/',
    'Copying assets'
  );
  const assetsMs = Date.now() - t3;
  steps.push({ name: 'Copy assets', ok: assetsOk, ms: assetsMs });

  if (assetsOk) {
    success('Assets', `copied in ${formatDuration(assetsMs)}`);
  } else {
    warn('Assets', 'copy step had warnings (non-fatal)');
    steps[steps.length - 1].ok = true; // non-fatal
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  printSummary(steps, Date.now() - totalStart);
})();
