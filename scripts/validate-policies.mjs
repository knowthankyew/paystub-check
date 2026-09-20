#!/usr/bin/env node
// ==============================================================================
// validate-policies.mjs - Automated Schema & Invariant Validator for Wage Policies
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const POLICIES_DIR = path.join(ROOT_DIR, 'policies', 'jurisdictions');
const SCHEMA_FILE = path.join(ROOT_DIR, 'policies', 'schemas', 'wage-policy.schema.json');

console.log('\n=== Validating Statutory Wage Policy Packs ===\n');

if (!fs.existsSync(SCHEMA_FILE)) {
  console.error(`❌ Schema file not found: ${SCHEMA_FILE}`);
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(SCHEMA_FILE, 'utf-8'));
const files = fs.readdirSync(POLICIES_DIR).filter(f => f.endsWith('.json'));

let errors = 0;
let validated = 0;

for (const file of files) {
  const filePath = path.join(POLICIES_DIR, file);
  process.stdout.write(`  Checking ${file.padEnd(20)} ... `);
  
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const policy = JSON.parse(raw);

    // Validate structure
    if (!policy.jurisdiction || !policy.jurisdiction.code || !policy.jurisdiction.name) {
      throw new Error('Missing jurisdiction.code or jurisdiction.name');
    }
    if (!policy.metadata || !policy.metadata.statuteRef) {
      throw new Error('Missing metadata.statuteRef');
    }
    if (policy.metadata.officialSourceUrl && !policy.metadata.officialSourceUrl.startsWith('http')) {
      throw new Error('officialSourceUrl must be a valid http/https URL');
    }
    if (!policy.standards) {
      throw new Error('Missing standards block');
    }
    if (typeof policy.standards.minimumWageRate !== 'number' || policy.standards.minimumWageRate <= 0) {
      throw new Error('standards.minimumWageRate must be a positive number');
    }
    if (typeof policy.standards.weeklyOvertimeThreshold !== 'number' || policy.standards.weeklyOvertimeThreshold <= 0) {
      throw new Error('standards.weeklyOvertimeThreshold must be a positive number');
    }
    if (typeof policy.standards.hasStateDisabilityTax !== 'boolean') {
      throw new Error('standards.hasStateDisabilityTax must be boolean');
    }
    if (!Array.isArray(policy.standards.specialRules) || policy.standards.specialRules.length === 0) {
      throw new Error('standards.specialRules must be a non-empty array of rule descriptions');
    }

    console.log('\x1b[32mPASS\x1b[0m');
    validated++;
  } catch (err) {
    console.log(`\x1b[31mFAIL: ${err.message}\x1b[0m`);
    errors++;
  }
}

console.log(`\nResults: ${validated} policy packs validated, ${errors} error(s).\n`);
if (errors > 0) {
  process.exit(1);
}
