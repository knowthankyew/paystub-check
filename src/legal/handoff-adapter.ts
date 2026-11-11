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
  const redFlags: WageRedFlag[] = payload.findings.map((f, idx) => {
    let severity: SeverityLevel = 'caution';
    let enforceability: 'Statutory Violation (Illegal)' | 'High Misclassification Risk' | 'Verification Needed' = 'Verification Needed';
    if (f.severity === 'CRITICAL') {
      severity = 'unlawful';
      enforceability = 'Statutory Violation (Illegal)';
    } else if (f.severity === 'WARNING') {
      severity = 'misclassification';
      enforceability = 'High Misclassification Risk';
    }

    return {
      id: `handoff-wage-${f.ruleId || idx + 1}`,
      quote: f.matchedSnippet || f.title,
      title: f.title,
      severity,
      statute: f.statuteCode,
      lawName: f.statuteTitle,
      explanation: f.explanation,
      enforceability,
      workerAdvice: f.recommendation,
    };
  });

  const stateRuleInfo = getStateWageRule(stateCode);
  const unlawfulCount = redFlags.filter((r) => r.severity === 'unlawful').length;
  const complianceScore = Math.max(0, Math.min(100, Math.round(100 - (payload.riskScore || 0))));

  const hasOvertimeViolation = payload.findings.some(
    (f) => f.ruleId?.includes('OVERTIME') || /overtime|off-the-clock|working\s+off\s+the\s+clock/i.test(`${f.title} ${f.matchedSnippet}`)
  );
  const hasIllegalShortageDeduction = payload.findings.some(
    (f) => f.ruleId?.includes('DEDUCT') || /shortage|cash\s+drawer|till|uniform\s+deduction/i.test(`${f.title} ${f.matchedSnippet}`)
  );

  return {
    documentType: 'Offer Letter / Contract',
    stateCode,
    complianceScore,
    summary: `Live Reality Engine analysis for ${payload.domain}. Extracted ${payload.findings.length} findings with ${unlawfulCount} potential wage theft or misclassification violations under FLSA and ${stateRuleInfo.stateName} labor standards.`,
    classificationType: unlawfulCount > 0 ? 'Salaried Non-Exempt (Misclassified)' : 'Hourly Non-Exempt',
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
      isExemptThresholdMet: true,
      applicableSalaryThreshold: stateRuleInfo.exemptionSalaryThreshold || 35568,
      hasOvertimeViolation,
      hasIllegalShortageDeduction,
      hasFicaMathMismatch: false,
    },
    stateRuleInfo,
    rawText: payload.findings.map((f) => `[${f.title}]: ${f.matchedSnippet}`).join('\n\n'),
  };
}
