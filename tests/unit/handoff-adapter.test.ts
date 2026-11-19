import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  KtyHandoffPayload,
  KTY_HANDOFF_SESSION_KEY,
  validateHandoffPayload,
} from '@knowthankyew/privacy-telemetry';
import { useKTYHandoff } from '@knowthankyew/privacy-telemetry/react';
import { mapHandoffToPaystubAnalysis } from '../../src/legal/handoff-adapter';
import { runHandoffBurnInFreshRealm } from './realm-worker.mjs';

const reactHarness = vi.hoisted(() => {
  const states: unknown[] = [];
  let stateIndex = 0;
  let pendingEffects: Array<() => void | (() => void)> = [];
  let cleanups: Array<() => void> = [];

  return {
    reset() {
      for (const cleanup of cleanups) cleanup();
      states.length = 0;
      stateIndex = 0;
      pendingEffects = [];
      cleanups = [];
    },
    renderHook<T>(hookFn: () => T): T {
      stateIndex = 0;
      pendingEffects = [];
      let result = hookFn();
      if (pendingEffects.length > 0) {
        const effects = pendingEffects;
        pendingEffects = [];
        for (const eff of effects) {
          const cleanup = eff();
          if (typeof cleanup === 'function') cleanups.push(cleanup);
        }
        stateIndex = 0;
        result = hookFn();
      }
      return result;
    },
    useState<T>(initial: T | (() => T)): [T, (next: T | ((prev: T) => T)) => void] {
      const idx = stateIndex++;
      if (!(idx in states)) {
        states[idx] = typeof initial === 'function' ? (initial as () => T)() : initial;
      }
      const setState = (next: T | ((prev: T) => T)) => {
        const prev = states[idx] as T;
        states[idx] = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      };
      return [states[idx] as T, setState];
    },
    useEffect(fn: () => void | (() => void)) {
      pendingEffects.push(fn);
    },
    useCallback<T extends (...args: never[]) => unknown>(fn: T): T {
      return fn;
    },
  };
});

vi.mock('react', () => ({
  useState: reactHarness.useState,
  useEffect: reactHarness.useEffect,
  useCallback: reactHarness.useCallback,
}));

function createValidPaystubPayload(overrides: Partial<KtyHandoffPayload> = {}): KtyHandoffPayload {
  return {
    version: '1.0',
    originApp: 'knowthankyew-extension',
    domain: 'employer-onboarding.example.com',
    scanTimestamp: '2026-11-10T12:00:00.000Z',
    riskScore: 45,
    summary: { critical: 1, warning: 0, info: 0 },
    findings: [
      {
        ruleId: 'KTY-ARBITRATION-001',
        title: 'Mandatory Arbitration Waiver',
        category: 'ARBITRATION',
        severity: 'CRITICAL',
        statuteCode: '9 U.S.C. § 1 / FAA § 1',
        statuteTitle: 'Employment Dispute Arbitration',
        matchedSnippet: 'All wage and hour claims must be submitted exclusively to binding arbitration.',
        explanation: 'Forces individual arbitration of statutory wage claims.',
        recommendation: 'Review arbitrability exemptions and state wage enforcement rights.',
      },
    ],
    primaryLegalLink: null,
    targetTool: 'paystub-check',
    ...overrides,
  };
}

function stubHandoffGlobals(initialPayload?: KtyHandoffPayload) {
  const store = new Map<string, string>();
  if (initialPayload) {
    store.set(KTY_HANDOFF_SESSION_KEY, JSON.stringify(initialPayload));
  }
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
  });
  vi.stubGlobal('window', {
    location: { origin: 'https://app.knowthankyew.org', search: '?kty_handoff=1', pathname: '/' },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    history: { replaceState: vi.fn() },
  });
}

describe('PaystubCheck Cross-Engine Handoff Adapter', () => {
  beforeEach(() => {
    reactHarness.reset();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    reactHarness.reset();
    vi.unstubAllGlobals();
  });

  it('validates fixture against KtyHandoffPayload and leaves unextracted pay fields null and classification Undetermined', () => {
    const payload = createValidPaystubPayload();
    expect(validateHandoffPayload(payload)).toBe(true);

    const result = mapHandoffToPaystubAnalysis(payload, 'MA');

    expect(result.stateCode).toBe('MA');
    expect(result.stateRuleInfo.stateName).toBe('Massachusetts');
    expect(result.documentType).toBe('Undetermined');
    expect(result.classificationType).toBe('Undetermined');
    expect(result.complianceScore).toBe(55);
    expect(result.extractedPay.grossPay).toBeNull();
    expect(result.extractedPay.netPay).toBeNull();
    expect(result.extractedPay.hourlyRate).toBeNull();
    expect(result.extractedPay.hoursWorked).toBeNull();
    expect(result.extractedPay.overtimeHours).toBeNull();
    expect(result.extractedPay.payFrequency).toBe('Unknown');
    expect(result.extractedPay.calculatedAnnualSalary).toBeNull();
    expect(result.flsaCompliance.isExemptThresholdMet).toBeNull();
    expect(result.flsaCompliance.hasOvertimeViolation).toBe(false);
    expect(result.redFlags).toHaveLength(1);
    expect(result.redFlags[0].severity).toBe('unlawful');
  });

  it('defaults stateCode to DEFAULT and distinguishes Contractor / 1099 misclassification cleanly', () => {
    const payload = createValidPaystubPayload({
      riskScore: 70,
      summary: { critical: 1, warning: 0, info: 0 },
      findings: [
        {
          ruleId: 'KTY-1099-MISCLASS-001',
          title: 'Unlawful 1099 Independent Contractor Classification',
          category: 'UNILATERAL_CHANGE',
          severity: 'CRITICAL',
          statuteCode: '29 U.S.C. § 203(e), (g) / 29 C.F.R. Part 795',
          statuteTitle: 'FLSA Economic Realities Worker Classification',
          matchedSnippet: 'Worker is treated as an independent contractor 1099 with fixed shift schedules.',
          explanation: 'Controlling hours and duties under a 1099 label indicates potential FLSA misclassification.',
          recommendation: 'Audit worker duties under federal economic realities and state ABC tests.',
        },
      ],
    });
    expect(validateHandoffPayload(payload)).toBe(true);

    const result = mapHandoffToPaystubAnalysis(payload);
    expect(result.stateCode).toBe('DEFAULT');
    expect(result.classificationType).toBe('Contractor / 1099');
    expect(result.extractedPay.hourlyRate).toBeNull();
    expect(result.extractedPay.calculatedAnnualSalary).toBeNull();
    expect(result.flsaCompliance.isExemptThresholdMet).toBeNull();
  });

  it('accepts matching targetTool via useKTYHandoff("paystub-check") and leaves mismatched targetTool returning null', () => {
    const matchingPayload = createValidPaystubPayload({ targetTool: 'paystub-check' });
    expect(validateHandoffPayload(matchingPayload)).toBe(true);
    stubHandoffGlobals(matchingPayload);

    const matched = reactHarness.renderHook(() => useKTYHandoff('paystub-check'));
    expect(matched.isHandoffActive).toBe(true);
    expect(matched.payload?.domain).toBe('employer-onboarding.example.com');

    reactHarness.reset();
    const unilateralPayload = createValidPaystubPayload({
      targetTool: 'paystub-check',
      findings: [
        {
          ruleId: 'KTY-UNILATERAL-001',
          title: 'Unilateral Salary Modification',
          category: 'UNILATERAL_CHANGE',
          severity: 'CRITICAL',
          statuteCode: 'FLSA',
          statuteTitle: 'Wage Agreement',
          matchedSnippet: 'Employer may change your salary for work performed on company premises at any time.',
          explanation: 'Permits unilateral reduction of compensation.',
          recommendation: 'Verify state advance-notice wage rules.',
        },
      ],
    });
    expect(validateHandoffPayload(unilateralPayload)).toBe(true);
    stubHandoffGlobals(unilateralPayload);
    const unilateralHook = reactHarness.renderHook(() => useKTYHandoff('paystub-check'));
    expect(unilateralHook.isHandoffActive).toBe(true);
    expect(unilateralHook.payload?.findings[0]?.category).toBe('UNILATERAL_CHANGE');

    reactHarness.reset();
    const otherToolPayload = createValidPaystubPayload({ targetTool: 'bill-of-rights-bot' });
    expect(validateHandoffPayload(otherToolPayload)).toBe(true);
    stubHandoffGlobals(otherToolPayload);

    const mismatched = reactHarness.renderHook(() => useKTYHandoff('paystub-check'));
    expect(mismatched.payload).toBeNull();
    expect(mismatched.isHandoffActive).toBe(false);
  });

  it('keeps generic "salaried non-exempt" text and NONEXEMPT rule IDs as Undetermined unless explicit misclassification is stated', () => {
    const genericNonExemptPayload = createValidPaystubPayload({
      findings: [
        {
          ruleId: 'KTY-WAGE-NONEXEMPT-001',
          title: 'Salaried Non-Exempt Classification Notice',
          category: 'UNILATERAL_CHANGE',
          severity: 'WARNING',
          statuteCode: '29 U.S.C. § 207',
          statuteTitle: 'FLSA Overtime Standard',
          matchedSnippet: 'You are salaried non-exempt and eligible for overtime pay after 40 hours.',
          explanation: 'Standard non-exempt classification notice requires overtime eligibility check.',
          recommendation: 'Confirm overtime hours are paid at 1.5x.',
        },
      ],
    });
    expect(validateHandoffPayload(genericNonExemptPayload)).toBe(true);
    const genericResult = mapHandoffToPaystubAnalysis(genericNonExemptPayload, 'NY');
    expect(genericResult.classificationType).toBe('Undetermined');

    const explicitMisclassPayload = createValidPaystubPayload({
      findings: [
        {
          ruleId: 'KTY-SALARY-EXEMPT-001',
          title: 'Employee Misclassified as Salaried Exempt',
          category: 'UNILATERAL_CHANGE',
          severity: 'CRITICAL',
          statuteCode: '29 U.S.C. § 213(a)(1)',
          statuteTitle: 'FLSA White-Collar Salary Basis Test',
          matchedSnippet: 'Worker is misclassified as exempt while paid below the exemption threshold.',
          explanation: 'Paying below statutory salary threshold invalidates exempt status.',
          recommendation: 'Demand back overtime wages.',
        },
      ],
    });
    expect(validateHandoffPayload(explicitMisclassPayload)).toBe(true);
    const explicitResult = mapHandoffToPaystubAnalysis(explicitMisclassPayload, 'NY');
    expect(explicitResult.classificationType).toBe('Salaried Non-Exempt (Misclassified)');
  });

  it('receives post-mount KTY_HANDOFF_PAYLOAD postMessage events for ARBITRATION and UNILATERAL_CHANGE payloads', () => {
    const categories: Array<'ARBITRATION' | 'UNILATERAL_CHANGE'> = [
      'ARBITRATION',
      'UNILATERAL_CHANGE',
    ];

    for (const category of categories) {
      reactHarness.reset();
      const store = new Map<string, string>();
      const listeners = new Map<string, Set<(event: unknown) => void>>();

      vi.stubGlobal('sessionStorage', {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => { store.set(k, v); },
        removeItem: (k: string) => { store.delete(k); },
      });
      vi.stubGlobal('window', {
        location: { origin: 'https://app.knowthankyew.org', search: '?kty_handoff=1', pathname: '/' },
        addEventListener: (type: string, cb: (event: unknown) => void) => {
          if (!listeners.has(type)) listeners.set(type, new Set());
          listeners.get(type)!.add(cb);
        },
        removeEventListener: (type: string, cb: (event: unknown) => void) => {
          listeners.get(type)?.delete(cb);
        },
        history: { replaceState: vi.fn() },
      });

      const beforeMount = reactHarness.renderHook(() => useKTYHandoff('paystub-check'));
      expect(beforeMount.isHandoffActive).toBe(false);
      expect(listeners.get('message')?.size).toBe(1);

      const base = createValidPaystubPayload();
      const payload = createValidPaystubPayload({
        findings: [{ ...base.findings[0], category }],
      });
      expect(validateHandoffPayload(payload)).toBe(true);

      for (const handler of listeners.get('message') ?? []) {
        handler({
          origin: 'https://app.knowthankyew.org',
          source: globalThis.window,
          data: { type: 'KTY_HANDOFF_PAYLOAD', payload },
        });
      }

      const afterPost = reactHarness.renderHook(() => useKTYHandoff('paystub-check'));
      expect(afterPost.isHandoffActive).toBe(true);
      expect(afterPost.payload?.targetTool).toBe('paystub-check');
      expect(afterPost.payload?.findings[0]?.category).toBe(category);
      expect(store.get(KTY_HANDOFF_SESSION_KEY)).toBe(JSON.stringify(payload));
    }
  });

  it('ignores queued KTY_HANDOFF_PAYLOAD postMessage events after Hard Burn (TelemetryManager.burn or KTY_HARD_BURN_DOM)', async () => {
    const queuedPayload = createValidPaystubPayload();
    expect(validateHandoffPayload(queuedPayload)).toBe(true);
    const payloadJson = JSON.stringify(queuedPayload);

    for (const burnMode of ['manager_burn', 'dom_message'] as const) {
      await runHandoffBurnInFreshRealm(burnMode, payloadJson);
    }
  });
});
