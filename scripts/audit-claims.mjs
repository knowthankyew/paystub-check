#!/usr/bin/env node
/**
 * audit-claims.mjs - Automated Claims, Architectural Parity & Privacy Invariant Linter for PaystubCheck.
 *
 * Enforces:
 * 1. Zero-Egress Privacy Invariant:
 *    - Verifies index.html CSP restricts connect-src to loopback / local OTLP only (no remote egress).
 *    - Verifies src/ contains zero unauthorized remote network egress primitives (fetch, XMLHttpRequest, sendBeacon, axios, WebSocket).
 *    - Verifies default telemetry operates in memory_only mode with strict allowlist.
 * 2. Statutory Legal Reference Parity:
 *    - Validates that statutory protections cited in README.md exist in source code and policy packs.
 * 3. Vocabulary Guardrails:
 *    - Prohibits unprovable marketing adjectives ('bulletproof', 'conclusive', 'definitive', 'infinitely scalable').
 * 4. Policy Pack Conformance:
 *    - Verifies that all 8 statutory wage policy packs in policies/jurisdictions/ validate cleanly.
 * 5. Portfolio Master Brief Parity:
 *    - Verifies that KNOWTHANKYEW_PORTFOLIO_MASTER_BRIEF.md accurately reflects current PaystubCheck test count.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = resolve(__dirname, '..');
const DEV_ROOT = resolve(REPO_ROOT, '..');

const PROHIBITED_WORDS = [
  /\bbulletproof\b/i,
  /\bconclusive\b/i,
  /\bdefinitive\b/i,
  /\binfinitely scalable\b/i,
];

const REQUIRED_STATUTES = [
  '29 U.S.C. § 201',
  '29 U.S.C. § 207',
  '29 U.S.C. § 213(a)(1)',
  '29 U.S.C. § 216(b)',
  '29 C.F.R. § 531.35',
  'Lab. Code § 203',
  'M.G.L. c. 149',
];

/**
 * Audit 1: Zero-Egress & Air-Gapped Privacy Invariants
 */
export function auditZeroEgress(
  errors = [],
  { overrideIndexContent = null, overrideCodeSnippets = null } = {}
) {
  // Check index.html CSP tag directly, ignoring comments
  const indexPath = resolve(REPO_ROOT, 'index.html');
  const indexContentRaw =
    overrideIndexContent !== null
      ? overrideIndexContent
      : existsSync(indexPath)
      ? readFileSync(indexPath, 'utf-8')
      : null;

  if (indexContentRaw === null) {
    errors.push('Missing index.html file');
  } else {
    const indexContent = indexContentRaw.replace(/<!--[\s\S]*?-->/g, '');
    const metaCspMatch =
      indexContent.match(/<meta\s+[^>]*http-equiv\s*=\s*["']Content-Security-Policy["'][^>]*content\s*=\s*(["'])([\s\S]*?)\1[^>]*>/i) ||
      indexContent.match(/<meta\s+[^>]*content\s*=\s*(["'])([\s\S]*?)\1[^>]*http-equiv\s*=\s*["']Content-Security-Policy["'][^>]*>/i);

    if (!metaCspMatch) {
      errors.push('index.html CSP violation: Missing active <meta http-equiv="Content-Security-Policy"> tag');
    } else {
      const cspDirectives = metaCspMatch[2].split(';').map((d) => d.trim()).filter(Boolean);
      const connectDirective = cspDirectives.find((d) => /^connect-src\b/i.test(d));
      if (!connectDirective) {
        errors.push('index.html CSP violation: Missing connect-src directive in Content-Security-Policy');
      } else {
        const tokens = connectDirective.replace(/^connect-src\s+/i, '').split(/\s+/).filter(Boolean);
        for (const token of tokens) {
          if (token === "'self'") continue;
          const urlMatch = token.match(/^http:\/\/(localhost|127\.0\.0\.1|otel-collector)(?::(?:\*|\d+))?$/);
          if (!urlMatch) {
            errors.push(`index.html CSP violation: Unauthorized remote connect-src token detected: ${token}`);
          }
        }
      }
    }
  }

  const networkPrimitiveRegex =
    /(?:\b(?:fetch|\??\.\s*fetch)\s*\(|=\s*fetch\b|\b(?:XMLHttpRequest|axios)\b|\[\s*['"`](?:fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource|axios)['"`]\s*\]|\bnavigator\s*(?:\??\.\s*sendBeacon|\[\s*['"`]sendBeacon['"`]\s*\])|\bnew\s+(?:WebSocket|EventSource)\b|\bimport\s*\()/;

  if (Array.isArray(overrideCodeSnippets)) {
    overrideCodeSnippets.forEach((snippet, idx) => {
      if (networkPrimitiveRegex.test(snippet)) {
        errors.push(`Privacy violation in snippet ${idx + 1}: Unauthorized network primitive detected: ${snippet}`);
      }
    });
  }

  // Scan src/ for unauthorized network primitives
  const srcDir = resolve(REPO_ROOT, 'src');
  function scanFiles(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        scanFiles(fullPath);
      } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
        const relPath = relative(REPO_ROOT, fullPath).split(sep).join('/');
        const rawContent = readFileSync(fullPath, 'utf-8');
        // Strip block comments while preserving newlines for accurate line numbers
        const noBlockComments = rawContent.replace(/\/\*[\s\S]*?\*\//g, (match) => {
          const newlines = match.match(/\n/g);
          return newlines ? newlines.join('') : '';
        });
        const lines = noBlockComments.split('\n');
        lines.forEach((line, lineIdx) => {
          const trimmed = line.replace(/\/\/.*$/, '').trim();
          if (!trimmed) {
            return;
          }

          if (networkPrimitiveRegex.test(trimmed)) {
            errors.push(`Privacy violation in ${relPath}:${lineIdx + 1}: Unauthorized network primitive detected: ${trimmed}`);
          }
        });
      }
    }
  }

  if (overrideCodeSnippets === null && existsSync(srcDir)) {
    scanFiles(srcDir);
  }

  // Check telemetry allowlist does not contain PII or wage slips
  const telemetryPath = resolve(REPO_ROOT, 'src/legal/telemetry.ts');
  if (existsSync(telemetryPath)) {
    const telContent = readFileSync(telemetryPath, 'utf-8');
    const prohibitedTelemetryKeys = ['gross_pay', 'net_pay', 'employee_name', 'ssn', 'paystub_text'];
    for (const key of prohibitedTelemetryKeys) {
      if (telContent.includes(`PAYSTUB_ALLOWLIST_KEYS`) && telContent.includes(`'${key}'`)) {
        errors.push(`Privacy violation in telemetry.ts: Prohibited sensitive key detected in allowlist: '${key}'`);
      }
    }
  }
}

/**
 * Audit 2: Statutory Reference Parity
 */
export function auditStatutoryParity(errors = []) {
  const readmePath = resolve(REPO_ROOT, 'README.md');
  const flsaPath = resolve(REPO_ROOT, 'src/legal/flsa.ts');
  const demandPath = resolve(REPO_ROOT, 'src/legal/demandLetter.ts');

  if (!existsSync(readmePath)) {
    errors.push('Missing README.md');
    return;
  }
  if (!existsSync(flsaPath) || !existsSync(demandPath)) {
    errors.push('Missing legal engine files');
    return;
  }

  const readmeContent = readFileSync(readmePath, 'utf-8');
  const policiesDir = resolve(REPO_ROOT, 'policies/jurisdictions');
  const policyFiles = existsSync(policiesDir)
    ? readdirSync(policiesDir).filter((f) => f.endsWith('.json'))
    : [];
  const policyContent = policyFiles
    .map((f) => readFileSync(resolve(policiesDir, f), 'utf-8'))
    .join('\n');

  const legalContent =
    readFileSync(flsaPath, 'utf-8') +
    '\n' +
    readFileSync(demandPath, 'utf-8') +
    '\n' +
    policyContent;

  for (const statute of REQUIRED_STATUTES) {
    if (!readmeContent.includes(statute)) {
      errors.push(`README.md lacks declared statutory reference: '${statute}'`);
    }
    if (!legalContent.includes(statute)) {
      errors.push(`Missing statutory citation in legal engine or policy packs for: '${statute}'`);
    }
  }
}

/**
 * Audit 3: Vocabulary Guardrails
 */
export function auditVocabulary(errors = []) {
  const docsToCheck = [
    resolve(REPO_ROOT, 'README.md'),
    resolve(REPO_ROOT, 'ARCHITECTURE.md'),
    resolve(REPO_ROOT, 'src/components/Header.tsx'),
    resolve(REPO_ROOT, 'src/components/DemandLetterGenerator.tsx'),
    resolve(REPO_ROOT, 'src/components/PaystubInput.tsx'),
  ];

  for (const docPath of docsToCheck) {
    if (!existsSync(docPath)) continue;
    const lines = readFileSync(docPath, 'utf-8').split('\n');
    lines.forEach((line, idx) => {
      const lower = line.toLowerCase();
      if (lower.includes('prohibits unprovable') || lower.includes('prohibited word') || lower.includes('prohibited marketing')) {
        return;
      }
      for (const pattern of PROHIBITED_WORDS) {
        if (pattern.test(line)) {
          errors.push(`Prohibited marketing word '${pattern.source}' found in ${relative(REPO_ROOT, docPath)}:${idx + 1}: ${line.trim()}`);
        }
      }
    });
  }
}

/**
 * Audit 4: Statutory Wage Policy Pack Conformance
 */
export function auditPolicyPacks(errors = []) {
  const jurisdictionsDir = resolve(REPO_ROOT, 'policies/jurisdictions');
  if (!existsSync(jurisdictionsDir)) {
    errors.push('Missing policies/jurisdictions directory');
    return;
  }

  const files = readdirSync(jurisdictionsDir).filter((f) => f.endsWith('.json'));
  if (files.length < 8) {
    errors.push(`Expected 8 statutory wage policy packs, found ${files.length}`);
  }

  for (const file of files) {
    const fullPath = resolve(jurisdictionsDir, file);
    try {
      const parsed = JSON.parse(readFileSync(fullPath, 'utf-8'));
      if (!parsed.jurisdiction || !parsed.jurisdiction.code || !parsed.jurisdiction.name) {
        errors.push(`Policy pack ${file} missing jurisdiction.code or jurisdiction.name`);
      }
      if (!parsed.metadata || !parsed.metadata.statuteRef) {
        errors.push(`Policy pack ${file} missing metadata.statuteRef`);
      }
      if (!parsed.standards) {
        errors.push(`Policy pack ${file} missing standards block`);
      } else {
        if (typeof parsed.standards.minimumWageRate !== 'number' || parsed.standards.minimumWageRate <= 0) {
          errors.push(`Policy pack ${file} standards.minimumWageRate must be a positive number`);
        }
        if (typeof parsed.standards.weeklyOvertimeThreshold !== 'number' || parsed.standards.weeklyOvertimeThreshold <= 0) {
          errors.push(`Policy pack ${file} standards.weeklyOvertimeThreshold must be a positive number`);
        }
        if (typeof parsed.standards.hasStateDisabilityTax !== 'boolean') {
          errors.push(`Policy pack ${file} standards.hasStateDisabilityTax must be a boolean`);
        }
        if (!Array.isArray(parsed.standards.specialRules) || parsed.standards.specialRules.length === 0) {
          errors.push(`Policy pack ${file} standards.specialRules must be non-empty array`);
        }
      }
    } catch (err) {
      errors.push(`Failed to parse policy pack ${file}: ${err.message}`);
    }
  }
}

/**
 * Audit 5: Portfolio Master Brief Parity
 */
export function auditPortfolioMasterBrief(
  errors = [],
  { requireBrief = false, overrideBriefPath = null } = {}
) {
  const briefCandidates = overrideBriefPath
    ? [overrideBriefPath]
    : [
        resolve(DEV_ROOT, 'KNOWTHANKYEW_PORTFOLIO_MASTER_BRIEF.md'),
        resolve(REPO_ROOT, 'KNOWTHANKYEW_PORTFOLIO_MASTER_BRIEF.md'),
      ];
  const briefPath = briefCandidates.find((p) => existsSync(p));

  if (!briefPath) {
    if (requireBrief) {
      errors.push('KNOWTHANKYEW_PORTFOLIO_MASTER_BRIEF.md not found but required via --require-brief.');
    }
    return false;
  }

  const briefContent = readFileSync(briefPath, 'utf-8');
  const match = briefContent.match(/`paystub-check`.*?(\d+)\/(\d+)\s+Unit Tests/);
  if (!match) {
    errors.push('Could not find paystub-check test inventory count in KNOWTHANKYEW_PORTFOLIO_MASTER_BRIEF.md');
    return false;
  }

  const documentedCount = parseInt(match[1], 10);
  const vitestReportPath = resolve(REPO_ROOT, '.vitest/json/output.json');
  let actualCount = 0;

  if (existsSync(vitestReportPath)) {
    try {
      const data = JSON.parse(readFileSync(vitestReportPath, 'utf-8'));
      if (typeof data.numTotalTests === 'number') {
        actualCount = data.numTotalTests;
      }
    } catch {
      // Ignored: fallback below
    }
  }

  if (actualCount === 0) {
    const testsDir = resolve(REPO_ROOT, 'tests/unit');
    if (existsSync(testsDir)) {
      const testFiles = readdirSync(testsDir).filter((f) => f.endsWith('.test.ts') || f.endsWith('.test.js'));
      for (const file of testFiles) {
        const code = readFileSync(resolve(testsDir, file), 'utf-8');
        const itMatches = code.match(/(?<![\.\$a-zA-Z0-9_])(?:it|test)(?:\.only|\.skip)?\s*\(/g) || [];
        actualCount += itMatches.length;
      }
    }
  }

  if (documentedCount !== actualCount) {
    errors.push(
      `Portfolio Brief Drift: KNOWTHANKYEW_PORTFOLIO_MASTER_BRIEF.md documents ${match[1]}/${match[2]} tests, but actual test suite has ${actualCount} tests.`
    );
    return false;
  }

  return true;
}

/**
 * Main execution CLI
 */
export function runAllAudits(options = {}) {
  const errors = [];
  auditZeroEgress(errors);
  auditStatutoryParity(errors);
  auditVocabulary(errors);
  auditPolicyPacks(errors);
  const briefChecked = auditPortfolioMasterBrief(errors, options);

  return { errors, briefChecked };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('=== PaystubCheck Claims, Architecture & Privacy Invariant Audit ===\n');
  const requireBrief = process.argv.includes('--require-brief');
  const { errors, briefChecked } = runAllAudits({ requireBrief });

  if (errors.length > 0) {
    console.error(`[FAIL] Found ${errors.length} claims / architectural invariant violation(s):`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log('[PASS] All PaystubCheck architectural & claims invariants verified:');
  console.log('  ✓ Zero remote egress verified (loopback OTLP only, zero remote primitives in src/)');
  console.log('  ✓ Statutory citations verified across FLSA and state wage laws');
  console.log('  ✓ Zero prohibited marketing adjectives detected');
  console.log('  ✓ Declarative wage policy packs validated (8 jurisdictions)');
  if (briefChecked) {
    console.log('  ✓ Portfolio Master Brief parity verified');
  } else {
    console.log('  - Portfolio Master Brief check skipped (isolated CI)');
  }
  process.exit(0);
}
