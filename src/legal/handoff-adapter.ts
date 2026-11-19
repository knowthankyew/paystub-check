import { KtyHandoffPayload } from '@knowthankyew/privacy-telemetry';
import { LegalAnalysisResult, WageRedFlag, SeverityLevel } from './types';
import { getStateWageRule } from './stateWageLaws';

/**
 * Transforms an incoming KnowThankYew handoff payload into a LegalAnalysisResult
 * without fabricating unextracted pay figures, document categories, or legal classifications.
 */
export function mapHandoffToPaystubAnalysis(
  payload: KtyHandoffPayload,
  stateCode = 'DEFAULT'
): LegalAnalysisResult {
  const resolvedStateCode = stateCode.trim() || 'DEFAULT';
  const findings = Array.isArray(payload.findings) ? payload.findings : [];

  const redFlags: WageRedFlag[] = findings.map((f, idx) => {
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

  const stateRuleInfo = getStateWageRule(resolvedStateCode);
  const unlawfulCount = redFlags.filter((r) => r.severity === 'unlawful').length;
  const rawScore = Number.isFinite(payload.riskScore) ? payload.riskScore : 0;
  const complianceScore = Math.max(0, Math.min(100, Math.round(100 - rawScore)));

  const hasOvertimeViolation = findings.some(
    (f) =>
      (typeof f.ruleId === 'string' && f.ruleId.includes('OVERTIME')) ||
      /\bovertime\b|\boff-the-clock\b|\bworking\s+off\s+the\s+clock\b/i.test(`${f.title || ''} ${f.matchedSnippet || ''}`)
  );
  const hasIllegalShortageDeduction = findings.some(
    (f) =>
      (typeof f.ruleId === 'string' && f.ruleId.includes('DEDUCT')) ||
      /\bshortage\b|\bcash\s+drawer\b|\btill\b|\buniform\s+deduction\b/i.test(`${f.title || ''} ${f.matchedSnippet || ''}`)
  );

  const hasContractorMisclassification = findings.some(
    (f) =>
      (typeof f.ruleId === 'string' && (f.ruleId.includes('1099') || f.ruleId.includes('CONTRACTOR'))) ||
      /\bindependent\s+contractor\b|\b1099\b|\bmisclassif\w*\s+as\s+(?:an?\s+)?contractor\b/i.test(
        `${f.title || ''} ${f.matchedSnippet || ''}`
      )
  );
  const hasSalariedMisclassification = findings.some((f) => {
    const normalizedRuleId = typeof f.ruleId === 'string' ? f.ruleId.toUpperCase() : '';
    const hasMisclassRule =
      /(?:^|[_-])(?:SALARY|SALARIED)[_-](?:EXEMPT|MISCLASS)/.test(normalizedRuleId) ||
      /(?:^|[_-])EXEMPT(?:ION)?[_-]THRESHOLD/.test(normalizedRuleId);
    const text = `${f.title || ''} ${f.matchedSnippet || ''}`;
    const hasExplicitSalariedMisclass =
      /\bsalaried\b[^.\n]{0,40}\bmisclassif|\bmisclassif\w*\s+as\s+(?:salaried|exempt)\b|\bbelow\s+(?:the\s+)?(?:salary|exemption)\s+threshold\b|\bsalary\s+basis\s+(?:violation|fail|below|under)\b/i.test(
        text
      );
    return hasMisclassRule || hasExplicitSalariedMisclass;
  });

  let classificationType: LegalAnalysisResult['classificationType'] = 'Undetermined';
  if (hasContractorMisclassification && !hasSalariedMisclassification) {
    classificationType = 'Contractor / 1099';
  } else if (hasSalariedMisclassification && !hasContractorMisclassification) {
    classificationType = 'Salaried Non-Exempt (Misclassified)';
  }

  let documentType: LegalAnalysisResult['documentType'] = 'Undetermined';
  const combinedText = findings.map((f) => `${f.title || ''} ${f.matchedSnippet || ''}`).join(' ');
  if (/\boffer\s+letter\b|\bemployment\s+(?:agreement|contract)\b/i.test(combinedText)) {
    documentType = 'Offer Letter / Contract';
  } else if (/\bpay\s*stub\b|\bwage\s+statement\b|\bpay\s+period\b/i.test(combinedText)) {
    documentType = 'Wage Statement';
  }

  return {
    documentType,
    stateCode: resolvedStateCode,
    complianceScore,
    summary: `Live Reality Engine analysis for ${payload.domain || 'submitted document'}. Extracted ${redFlags.length} finding(s) with ${unlawfulCount} potential statutory violation(s) under FLSA and ${stateRuleInfo.stateName} labor standards. Pay figures were not extracted from web handoff findings.`,
    classificationType,
    extractedPay: {
      grossPay: null,
      netPay: null,
      hourlyRate: null,
      hoursWorked: null,
      overtimeHours: null,
      payFrequency: 'Unknown',
      calculatedAnnualSalary: null,
    },
    redFlags,
    deductionsList: [],
    flsaCompliance: {
      isExemptThresholdMet: null,
      applicableSalaryThreshold: stateRuleInfo.exemptionSalaryThreshold || 35568,
      hasOvertimeViolation,
      hasIllegalShortageDeduction,
      hasFicaMathMismatch: false,
    },
    stateRuleInfo,
    rawText: findings.map((f) => `[${f.title}]: ${f.matchedSnippet}`).join('\n\n'),
  };
}
