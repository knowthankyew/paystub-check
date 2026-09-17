import { LegalAnalysisResult, WageRedFlag, DeductionLineItem } from './types';
import { FLSA_RULES, FLSA_EXEMPTION_SALARY_THRESHOLD_2024 } from './flsa';
import { getStateWageRule } from './stateWageLaws';

export function analyzePaystubText(text: string, stateCode: string = 'CA'): LegalAnalysisResult {
  const cleanText = text || '';
  const lowerText = cleanText.toLowerCase();

  // 1. Detect Document Type
  let documentType: 'Pay Stub' | 'Offer Letter / Contract' | 'Wage Statement' = 'Pay Stub';
  if (/offer\s+letter|employment\s+agreement|salary\s+offer|compensation\s+package/i.test(cleanText)) {
    documentType = 'Offer Letter / Contract';
  } else if (/wage\s+statement|pay\s+advice|direct\s+deposit\s+stub/i.test(cleanText)) {
    documentType = 'Wage Statement';
  }

  // 2. Extract Numerical Figures
  let grossPay = 0;
  let netPay = 0;
  let hourlyRate = 0;
  let hoursWorked = 0;
  let overtimeHours = 0;
  let payFrequency: 'Weekly' | 'Bi-Weekly' | 'Semi-Monthly' | 'Monthly' | 'Annual Salary' = 'Bi-Weekly';

  // Detect Gross Pay
  const grossMatch = cleanText.match(/gross\s*(pay|amount|earnings)?\s*[:$]?\s*\$?\s*([\d,]+\.?\d*)/i);
  if (grossMatch) {
    grossPay = parseFloat(grossMatch[2].replace(/,/g, ''));
  }

  // Detect Net Pay
  const netMatch = cleanText.match(/net\s*(pay|check|amount|earnings)?\s*[:$]?\s*\$?\s*([\d,]+\.?\d*)/i);
  if (netMatch) {
    netPay = parseFloat(netMatch[2].replace(/,/g, ''));
  }

  // Detect Hourly Rate
  const rateMatch = cleanText.match(/(hourly\s+rate|pay\s+rate|rate\s+per\s+hour)\s*[:$]?\s*\$?\s*([\d\.]+)/i);
  if (rateMatch) {
    hourlyRate = parseFloat(rateMatch[2]);
  }

  // Detect Hours Worked
  const hoursMatch = cleanText.match(/(regular\s+hours|total\s+hours|hours\s+worked)\s*[:$]?\s*([\d\.]+)/i);
  if (hoursMatch) {
    hoursWorked = parseFloat(hoursMatch[2]);
  }

  // Detect Overtime Hours
  const otHoursMatch = cleanText.match(/(overtime\s+hours|ot\s+hours)\s*[:$]?\s*([\d\.]+)/i);
  if (otHoursMatch) {
    overtimeHours = parseFloat(otHoursMatch[2]);
  }

  // Detect Pay Frequency & Annual Salary
  let calculatedAnnualSalary = 0;
  const salaryMatch = cleanText.match(/(\$?\s*[\d,]+)\s*(per\s+year|\/yr|annual|annually)/i);
  if (salaryMatch) {
    payFrequency = 'Annual Salary';
    calculatedAnnualSalary = parseFloat(salaryMatch[1].replace(/[^\d\.]/g, ''));
  } else if (/semi-monthly|twice\s+a\s+month/i.test(lowerText)) {
    payFrequency = 'Semi-Monthly';
    if (grossPay > 0) calculatedAnnualSalary = grossPay * 24;
  } else if (/weekly/i.test(lowerText) && !/bi-weekly/i.test(lowerText)) {
    payFrequency = 'Weekly';
    if (grossPay > 0) calculatedAnnualSalary = grossPay * 52;
  } else if (/monthly/i.test(lowerText)) {
    payFrequency = 'Monthly';
    if (grossPay > 0) calculatedAnnualSalary = grossPay * 12;
  } else {
    // Bi-Weekly default
    payFrequency = 'Bi-Weekly';
    if (grossPay > 0) calculatedAnnualSalary = grossPay * 26;
  }

  // Fallback estimates if rate and hours are given
  if (grossPay === 0 && hourlyRate > 0 && hoursWorked > 0) {
    grossPay = Math.round(hourlyRate * hoursWorked * 100) / 100;
  }

  // 3. Extract Deductions List
  const deductionsList: DeductionLineItem[] = [];
  const lines = cleanText.split('\n');

  lines.forEach(line => {
    const deductionMatch = line.match(/(fica|medicare|social\s+security|fed\s+tax|state\s+tax|sdi|pfl|uniform|shortage|tool|equipment|garnishment|insurance|health)\s*[:$]?\s*\$?(-?[\d\.]+)/i);
    if (deductionMatch) {
      const name = deductionMatch[1].trim();
      const amt = Math.abs(parseFloat(deductionMatch[2]));
      const lowerName = name.toLowerCase();

      const isStatutoryTax = /fica|medicare|social|fed|state|sdi|pfl|tax/i.test(lowerName);
      const isIllegalDeduction = /uniform|shortage|tool|equipment/i.test(lowerName);

      deductionsList.push({
        name: name.toUpperCase(),
        amount: amt,
        isStatutoryTax,
        isIllegalDeduction,
        explanation: isIllegalDeduction ? 'Potentially illegal deduction under 29 C.F.R. § 531.35 if reducing wages below statutory minimums.' : undefined
      });
    }
  });

  // 4. Run Legal Rules Matching
  const redFlags: WageRedFlag[] = [];
  let hasOvertimeViolation = false;
  let hasIllegalShortageDeduction = false;
  let hasFicaMathMismatch = false;

  FLSA_RULES.forEach((rule) => {
    const match = cleanText.match(rule.pattern);
    if (match) {
      const quote = match[0].trim();
      redFlags.push({
        id: rule.id + '_' + Math.random().toString(36).substr(2, 5),
        quote: quote.length > 120 ? quote.substring(0, 117) + '...' : quote,
        title: rule.title,
        severity: rule.severity,
        statute: rule.statute,
        lawName: rule.lawName,
        explanation: rule.explanation,
        enforceability: rule.enforceability,
        workerAdvice: rule.workerAdvice
      });

      if (rule.id === 'illegal_register_shortage_deduction' || rule.id === 'illegal_uniform_equipment_deduction') {
        hasIllegalShortageDeduction = true;
      }
      if (rule.id === 'missing_overtime_multiplier') {
        hasOvertimeViolation = true;
      }
    }
  });

  // Classification Logic
  let classificationType: 'Hourly Non-Exempt' | 'Salaried Exempt' | 'Salaried Non-Exempt (Misclassified)' | 'Contractor / 1099' = 'Hourly Non-Exempt';
  const isExemptThresholdMet = calculatedAnnualSalary >= FLSA_EXEMPTION_SALARY_THRESHOLD_2024;

  if (lowerText.includes('1099') || lowerText.includes('independent contractor')) {
    classificationType = 'Contractor / 1099';
  } else if (lowerText.includes('salaried') || lowerText.includes('salary')) {
    if (!isExemptThresholdMet && (hoursWorked > 40 || lowerText.includes('overtime'))) {
      classificationType = 'Salaried Non-Exempt (Misclassified)';
      if (!redFlags.some(rf => rf.id.startsWith('salaried_under_exemption_threshold'))) {
        redFlags.push({
          id: 'salaried_under_threshold',
          quote: `Calculated Annual Salary: $${calculatedAnnualSalary.toLocaleString()}`,
          title: 'Salaried Exemption Threshold Violation',
          severity: 'misclassification',
          statute: '29 U.S.C. § 213(a)(1) & 29 C.F.R. Part 541',
          lawName: 'DOL FLSA Salary Basis Test ($43,888 / $844/wk)',
          explanation: `Your calculated annual salary ($${calculatedAnnualSalary.toLocaleString()}) falls below the federal FLSA exemption threshold ($43,888/year). You cannot be classified as exempt from overtime pay regardless of title.`,
          enforceability: 'High Misclassification Risk',
          workerAdvice: 'You are statutorily non-exempt under FLSA and entitled to 1.5x overtime pay for all hours worked over 40 in a workweek.'
        });
      }
    } else {
      classificationType = isExemptThresholdMet ? 'Salaried Exempt' : 'Salaried Non-Exempt (Misclassified)';
    }
  }

  // State-specific Overtime Check (e.g. California 8 hrs/day daily overtime)
  const stateRule = getStateWageRule(stateCode);
  if (stateRule.dailyOvertimeThreshold && hoursWorked > 8 && overtimeHours === 0) {
    redFlags.push({
      id: 'state_daily_overtime_' + stateCode,
      quote: `Hours Worked: ${hoursWorked} hrs (Zero Overtime Multiplier)`,
      title: `Missing Daily Overtime in ${stateRule.stateName}`,
      severity: 'unlawful',
      statute: `${stateRule.stateName} Labor Code (${stateRule.statuteRef})`,
      lawName: `${stateRule.stateName} 8-Hour Daily Overtime Mandate`,
      explanation: `${stateRule.stateName} law mandates 1.5x overtime pay for all hours worked beyond 8 in a single workday.`,
      enforceability: 'Statutory Violation (Illegal)',
      workerAdvice: `In ${stateRule.stateName}, working over 8 hours in a day triggers mandatory daily overtime pay.`
    });
    hasOvertimeViolation = true;
  }

  // FICA Verification Check (Social Security 6.2% & Medicare 1.45% = 7.65%)
  if (grossPay > 0 && deductionsList.length > 0) {
    const ficaItem = deductionsList.find(d => d.name.includes('FICA') || d.name.includes('SOCIAL') || d.name.includes('MEDICARE'));
    if (ficaItem) {
      const expectedFica = grossPay * 0.0765;
      const diff = Math.abs(ficaItem.amount - expectedFica);
      if (diff > 5.0 && ficaItem.amount < expectedFica * 0.5) {
        hasFicaMathMismatch = true;
        redFlags.push({
          id: 'fica_math_mismatch',
          quote: `FICA Tax Deduction: $${ficaItem.amount.toFixed(2)} vs Expected 7.65%: $${expectedFica.toFixed(2)}`,
          title: 'Statutory FICA Tax Calculation Discrepancy',
          severity: 'caution',
          statute: '26 U.S.C. §§ 3101-3128 (Internal Revenue Code)',
          lawName: 'Federal Insurance Contributions Act (FICA)',
          explanation: 'Standard employee FICA withholding is 7.65% (6.2% Social Security + 1.45% Medicare). The deduction listed on this pay stub deviates significantly from standard statutory tax rates.',
          enforceability: 'Verification Needed',
          workerAdvice: 'Verify with payroll if tax withholdings are pre-tax or if an error occurred in payroll processing.'
        });
      }
    }
  }

  // 5. Calculate Wage Compliance Score (0 to 100)
  let score = 100;
  redFlags.forEach(rf => {
    if (rf.severity === 'unlawful') score -= 30;
    else if (rf.severity === 'misclassification') score -= 20;
    else if (rf.severity === 'caution') score -= 10;
  });

  if (hasIllegalShortageDeduction) score -= 15;
  if (hasOvertimeViolation) score -= 20;

  const complianceScore = Math.max(0, Math.min(100, Math.round(score)));

  // Executive Summary text
  let summary = `Analyzed ${documentType.toLowerCase()} for ${stateRule.stateName} jurisdiction (${classificationType}). `;
  if (redFlags.length === 0) {
    summary += `No statutory wage violations or unlawful deduction patterns were detected under FLSA or ${stateRule.stateName} laws.`;
  } else {
    summary += `Flagged ${redFlags.length} wage issue(s), including ${redFlags.filter(r => r.severity === 'unlawful').length} statutory violation(s) under FLSA 29 U.S.C. § 207/213 or ${stateRule.stateName} statutes.`;
  }

  return {
    documentType,
    stateCode,
    complianceScore,
    summary,
    classificationType,
    extractedPay: {
      grossPay,
      netPay,
      hourlyRate: hourlyRate > 0 ? hourlyRate : undefined,
      hoursWorked: hoursWorked > 0 ? hoursWorked : undefined,
      overtimeHours: overtimeHours > 0 ? overtimeHours : undefined,
      payFrequency,
      calculatedAnnualSalary
    },
    redFlags,
    deductionsList,
    flsaCompliance: {
      isExemptThresholdMet,
      hasOvertimeViolation,
      hasIllegalShortageDeduction,
      hasFicaMathMismatch
    },
    stateRuleInfo: stateRule,
    rawText: cleanText
  };
}
