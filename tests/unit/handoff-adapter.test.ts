import { describe, it, expect } from 'vitest';
import { mapHandoffToPaystubAnalysis } from '../../src/legal/handoff-adapter';
import { KtyHandoffPayload } from '@knowthankyew/privacy-telemetry';

describe('PaystubCheck Handoff Adapter', () => {
  const samplePayload: KtyHandoffPayload = {
    protocolVersion: '1.0.0',
    origin: 'extension',
    destinationTool: 'paystub-check',
    domain: 'gig-workplace.example.com',
    scanTimestamp: '2026-11-10T19:00:00Z',
    riskScore: 70,
    summary: 'Detected 2 wage theft / misclassification clauses',
    findings: [
      {
        ruleId: 'FLSA-MISCLASS-01',
        title: 'Independent Contractor Misclassification Clause',
        statuteCode: '29 U.S.C. § 206',
        statuteTitle: 'Fair Labor Standards Act § 6',
        severity: 'CRITICAL',
        category: 'ARBITRATION',
        matchedSnippet: 'Worker agrees they are an independent contractor with zero overtime entitlement.',
        explanation: 'Behavioral and financial control dictates employee status regardless of agreement text.',
        recommendation: 'Evaluate against Department of Labor economic reality test.',
      },
      {
        ruleId: 'WAGE-DEDUCT-01',
        title: 'Unlawful Till Shortage Deduction',
        statuteCode: 'Cal. Lab. Code § 221',
        statuteTitle: 'California Labor Code § 221',
        severity: 'WARNING',
        category: 'UNILATERAL_CHANGE',
        matchedSnippet: 'Cash shortages will be deducted directly from worker gross pay.',
        explanation: 'Employers cannot pass ordinary business losses or cash shortages onto employees.',
        recommendation: 'Demand reimbursement and cite waiting-time penalties under § 203.',
      },
    ],
  };

  it('maps handoff payload into a grounded LegalAnalysisResult', () => {
    const result = mapHandoffToPaystubAnalysis(samplePayload, 'CA');

    expect(result.documentType).toBe('Offer Letter / Contract');
    expect(result.stateCode).toBe('CA');
    expect(result.complianceScore).toBe(30); // 100 - 70
    expect(result.redFlags).toHaveLength(2);

    const misclassFlag = result.redFlags[0];
    expect(misclassFlag.severity).toBe('unlawful');
    expect(misclassFlag.statute).toBe('29 U.S.C. § 206');
    expect(misclassFlag.enforceability).toBe('Statutory Violation (Illegal)');

    expect(result.classificationType).toBe('Salaried Non-Exempt (Misclassified)');
    expect(result.flsaCompliance.hasIllegalShortageDeduction).toBe(true);
    expect(result.stateRuleInfo.stateCode).toBe('CA');
  });

  it('handles clean handoff payloads with high compliance scores', () => {
    const cleanPayload: KtyHandoffPayload = {
      protocolVersion: '1.0.0',
      origin: 'extension',
      destinationTool: 'paystub-check',
      domain: 'fair-employer.example.com',
      scanTimestamp: '2026-11-10T19:00:00Z',
      riskScore: 0,
      summary: 'Clean wage statement terms',
      findings: [],
    };

    const result = mapHandoffToPaystubAnalysis(cleanPayload, 'NY');
    expect(result.complianceScore).toBe(100);
    expect(result.redFlags).toHaveLength(0);
    expect(result.classificationType).toBe('Hourly Non-Exempt');
    expect(result.stateRuleInfo.stateCode).toBe('NY');
  });

  it('handles edge case with missing riskScore and unknown state fallback safely', () => {
    const edgePayload: KtyHandoffPayload = {
      protocolVersion: '1.0.0',
      origin: 'extension',
      destinationTool: 'paystub-check',
      domain: '<script>alert("xss")</script>.example.com',
      scanTimestamp: 'invalid-date',
      riskScore: 0,
      summary: '',
      findings: [
        {
          ruleId: undefined as unknown as string,
          title: 'Unspecified Wage Notice',
          statuteCode: '',
          statuteTitle: '',
          severity: 'INFO',
          category: 'ARBITRATION',
          matchedSnippet: '',
          explanation: '',
          recommendation: '',
        },
      ],
    };

    const result = mapHandoffToPaystubAnalysis(edgePayload, 'UNKNOWN');
    expect(result.complianceScore).toBe(100);
    expect(result.redFlags).toHaveLength(1);
    expect(result.stateRuleInfo).toBeDefined();
  });
});
