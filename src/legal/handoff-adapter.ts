import { KtyHandoffPayload } from '@knowthankyew/privacy-telemetry';
import { LegalAnalysisResult, WageRedFlag, SeverityLevel } from './types';
import { getStateWageRule } from './stateWageLaws';

/**
 * Transforms an incoming KnowThankYew handoff payload into a fully-grounded
 * LegalAnalysisResult, bypassing manual document intake and dropzones.
 */
export function mapHandoffToPaystubAnalysis(
  payload: KtyHandoffPayload,
  stateCode = 'CA'
): LegalAnalysisResult {
  const redFlags: WageRedFlag[] = (payload.findings || []).map((f, idx) => {
    let severity: SeverityLevel = 'caution';
    let enforceability: 'Statutory Violation (Illegal)' | 'High Misclassification Risk' | 'Verification Needed' = 'Verification Needed';
    if (f.severity === 'CRITICAL') {
      severity = 'unlawful';
      enforceability = 'Statutory Violation (Illegal)';
    } else if (f.severity === 'WARNING') {
      severity = 'misclassification';
      enforceability = 'High Misclassification Risk';
    }

    const ruleKey = typeof f.ruleId === 'string' && f.ruleId.trim() ? f.ruleId.trim() : 'item';
    return {
      id: `handoff-wage-${ruleKey}-${idx}`,
      quote: f.matchedSnippet || f.title || 'Extracted statement finding',
      title: f.title || 'Unspecified Finding',
      severity,
      statute: f.statuteCode || 'Statutory Labor Standard',
      lawName: f.statuteTitle || 'Labor Code Compliance',
      explanation: f.explanation || 'Statutory review required under applicable wage laws.',
      enforceability,
      workerAdvice: f.recommendation || 'Consult your state labor commissioner or wage advocate.',
    };
  });

  const stateRuleInfo = getStateWageRule(stateCode);
  const unlawfulCount = redFlags.filter((r) => r.severity === 'unlawful').length;
  const rawScore = Number.isFinite(payload.riskScore) ? payload.riskScore : 0;
  const complianceScore = Math.max(0, Math.min(100, Math.round(100 - rawScore)));

  const hasOvertimeViolation = (payload.findings || []).some(
    (f) => (typeof f.ruleId === 'string' && f.ruleId.includes('OVERTIME')) || /\bovertime\b|\boff-the-clock\b|\bworking\s+off\s+the\s+clock\b/i.test(`${f.title || ''} ${f.matchedSnippet || ''}`)
  );
  const hasIllegalShortageDeduction = (payload.findings || []).some(
    (f) => (typeof f.ruleId === 'string' && f.ruleId.includes('DEDUCT')) || /\bshortage\b|\bcash\s+drawer\b|\btill\b|\buniform\s+deduction\b/i.test(`${f.title || ''} ${f.matchedSnippet || ''}`)
  );

  const hasMisclassificationFinding = (payload.findings || []).some(
    (f) => (typeof f.ruleId === 'string' && f.ruleId.includes('MISCLASS')) || /\bmisclassif|\bindependent\s+contractor\b|\b1099\b/i.test(`${f.title || ''} ${f.matchedSnippet || ''}`)
  );

  return {
    documentType: 'Offer Letter / Contract',
    stateCode,
    complianceScore,
    summary: `Live Reality Engine analysis for ${payload.domain || 'submitted document'}. Extracted ${redFlags.length} findings with ${unlawfulCount} potential wage theft or misclassification violations under FLSA and ${stateRuleInfo.stateName} labor standards.`,
    classificationType: hasMisclassificationFinding ? 'Salaried Non-Exempt (Misclassified)' : 'Hourly Non-Exempt',
    extractedPay: {
      grossPay: 0,
      netPay: 0,
      hourlyRate: stateRuleInfo.minimumWageRate,
      hoursWorked: 40,
      overtimeHours: 0,
      payFrequency: 'Bi-Weekly',
      calculatedAnnualSalary: stateRuleInfo.minimumWageRate * 2080,
    },
    redFlags,
    deductionsList: [],
    flsaCompliance: {
      isExemptThresholdMet: false,
      applicableSalaryThreshold: stateRuleInfo.exemptionSalaryThreshold || 35568, // FLSA baseline ($684/wk = $35,568/yr)
      hasOvertimeViolation,
      hasIllegalShortageDeduction,
      hasFicaMathMismatch: false,
    },
    stateRuleInfo,
    rawText: (payload.findings || []).map((f) => `[${f.title || 'Finding'}]: ${f.matchedSnippet || ''}`).join('\n\n'),
  };
}
