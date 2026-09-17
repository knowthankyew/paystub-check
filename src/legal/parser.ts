import { LegalAnalysisResult, WageRedFlag, DeductionLineItem } from "./types";
import { FLSA_RULES, FLSA_BINDING_FEDERAL_SALARY_THRESHOLD } from "./flsa";
import { getStateWageRule } from "./stateWageLaws";

export function analyzePaystubText(text: string, stateCode: string = "CA"): LegalAnalysisResult {
  const cleanText = text || "";
  const lowerText = cleanText.toLowerCase();

  // 1. Detect Document Type
  let documentType: "Pay Stub" | "Offer Letter / Contract" | "Wage Statement" = "Pay Stub";
  if (/offer\s+letter|employment\s+agreement|salary\s+offer|compensation\s+package/i.test(cleanText)) {
    documentType = "Offer Letter / Contract";
  } else if (/wage\s+statement|pay\s+advice|direct\s+deposit\s+stub/i.test(cleanText)) {
    documentType = "Wage Statement";
  }

  // 2. Extract Numerical Figures
  let grossPay = 0;
  let netPay = 0;
  let hourlyRate = 0;
  let hoursWorked = 0;
  let overtimeHours = 0;
  let payFrequency: "Daily" | "Weekly" | "Bi-Weekly" | "Semi-Monthly" | "Monthly" | "Annual Salary" = "Bi-Weekly";

  // Detect Gross Pay (prioritize current pay period and avoid YTD totals)
  const currentGrossMatch = cleanText.match(/(?:current\s+gross|gross\s+(?:this\s+period|earnings)|regular\s+salary)\s*[:$]?\s*\$?\s*([\d,]+\.?\d*)/i);
  if (currentGrossMatch) {
    grossPay = parseFloat(currentGrossMatch[1].replace(/,/g, ""));
  } else {
    const lines = cleanText.split("\n");
    for (const line of lines) {
      if (/ytd|year\s+to\s+date/i.test(line) && !/current/i.test(line)) continue;
      const m = line.match(/(?:^|[^a-z])gross\s*(?:pay|amount|earnings)?\s*[:$]?\s*\$?\s*([\d,]+\.?\d*)/i);
      if (m) {
        grossPay = parseFloat(m[1].replace(/,/g, ""));
        break;
      }
    }
  }
  if (grossPay === 0) {
    const grossMatch = cleanText.match(/gross\s*(?:pay|amount|earnings)?\s*[:$]?\s*\$?\s*([\d,]+\.?\d*)/i);
    if (grossMatch) {
      grossPay = parseFloat(grossMatch[1].replace(/,/g, ""));
    }
  }

  // Detect Net Pay (avoid YTD columns)
  const currentNetMatch = cleanText.match(/(?:current\s+net|net\s+(?:this\s+period|pay\s+amount))\s*[:$]?\s*\$?\s*([\d,]+\.?\d*)/i);
  if (currentNetMatch) {
    netPay = parseFloat(currentNetMatch[1].replace(/,/g, ""));
  } else {
    const lines = cleanText.split("\n");
    for (const line of lines) {
      if (/ytd|year\s+to\s+date/i.test(line) && !/current/i.test(line)) continue;
      const m = line.match(/(?:^|[^a-z])net\s*(?:pay|check|amount|earnings)?\s*[:$]?\s*\$?\s*([\d,]+\.?\d*)/i);
      if (m) {
        netPay = parseFloat(m[1].replace(/,/g, ""));
        break;
      }
    }
  }
  if (netPay === 0) {
    const netMatch = cleanText.match(/net\s*(?:pay|check|amount|earnings)?\s*[:$]?\s*\$?\s*([\d,]+\.?\d*)/i);
    if (netMatch) {
      netPay = parseFloat(netMatch[1].replace(/,/g, ""));
    }
  }

  // Detect Hourly Rate
  const rateMatch = cleanText.match(/(?:hourly\s+rate|pay\s+rate|rate\s+per\s+hour)\s*[:$]?\s*\$?\s*([\d\.]+)/i);
  if (rateMatch) {
    hourlyRate = parseFloat(rateMatch[1]);
  }

  // Detect Hours Worked
  const hoursMatch = cleanText.match(/(?:regular\s+hours|total\s+hours|hours\s+worked)\s*[:$]?\s*([\d\.]+)/i);
  if (hoursMatch) {
    hoursWorked = parseFloat(hoursMatch[1]);
  }

  // Detect Overtime Hours
  const otHoursMatch = cleanText.match(/(?:overtime\s+hours|ot\s+hours)\s*[:$]?\s*([\d\.]+)/i);
  if (otHoursMatch) {
    overtimeHours = parseFloat(otHoursMatch[1]);
  }

  // Detect Pay Frequency & Annual Salary (including Semi-Monthly 24 periods)
  let calculatedAnnualSalary = 0;
  const salaryMatch = cleanText.match(/(\$?\s*[\d,]+(?:\.\d+)?)\s*(?:per\s+year|\/yr|annual|annually)/i);
  if (salaryMatch) {
    payFrequency = "Annual Salary";
    calculatedAnnualSalary = parseFloat(salaryMatch[1].replace(/[^\d\.]/g, ""));
  } else if (/semi-monthly|semi\s+monthly|twice\s+(?:a|per)\s+month/i.test(cleanText)) {
    payFrequency = "Semi-Monthly";
    if (grossPay > 0) calculatedAnnualSalary = grossPay * 24;
  } else if (/monthly/i.test(cleanText)) {
    payFrequency = "Monthly";
    if (grossPay > 0) calculatedAnnualSalary = grossPay * 12;
  } else if (/weekly/i.test(cleanText) && !/bi-weekly|biweekly/i.test(cleanText)) {
    payFrequency = "Weekly";
    if (grossPay > 0) calculatedAnnualSalary = grossPay * 52;
  } else if (/daily|per\s+day/i.test(cleanText)) {
    payFrequency = "Daily";
    if (grossPay > 0) calculatedAnnualSalary = grossPay * 260;
  } else {
    payFrequency = "Bi-Weekly";
    if (grossPay > 0) calculatedAnnualSalary = grossPay * 26;
  }

  // Fallback estimates if rate and hours are given
  if (grossPay === 0 && hourlyRate > 0 && hoursWorked > 0) {
    grossPay = Math.round(hourlyRate * hoursWorked * 100) / 100;
  }

  // 3. Extract Deductions List (skipping purely YTD lines)
  const deductionsList: DeductionLineItem[] = [];
  const lines = cleanText.split("\n");

  lines.forEach(line => {
    if (/ytd/i.test(line) && !/current/i.test(line)) return;
    const deductionMatch = line.match(/(fica|medicare|social\s+security|fed\s+tax|state\s+tax|sdi|pfl|uniform|shortage|tool|equipment|garnishment|insurance|health)\s*[:$]?\s*\$?(-?[\d,]+\.?\d*)/i);
    if (deductionMatch) {
      const name = deductionMatch[1].trim();
      const amt = Math.abs(parseFloat(deductionMatch[2].replace(/,/g, "")));
      const lowerName = name.toLowerCase();

      const isStatutoryTax = /fica|medicare|social|fed|state|sdi|pfl|tax/i.test(lowerName);
      const isIllegalDeduction = /uniform|shortage|tool|equipment/i.test(lowerName);

      deductionsList.push({
        name: name.toUpperCase(),
        amount: amt,
        isStatutoryTax,
        isIllegalDeduction,
        explanation: isIllegalDeduction
          ? "Potentially illegal deduction under 29 C.F.R. § 531.35 and state labor codes (e.g. Cal. Lab. Code § 221, NY Lab. Law § 193)."
          : undefined
      });
    }
  });

  // Classification Logic with State Exemption Threshold Priority
  const stateRule = getStateWageRule(stateCode);
  const applicableSalaryThreshold = stateRule.exemptionSalaryThreshold || FLSA_BINDING_FEDERAL_SALARY_THRESHOLD;
  const isExemptThresholdMet = calculatedAnnualSalary >= applicableSalaryThreshold;

  let classificationType: "Hourly Non-Exempt" | "Salaried Exempt" | "Salaried Non-Exempt (Misclassified)" | "Contractor / 1099" = "Hourly Non-Exempt";
  const isSalariedText = lowerText.includes("salaried") || lowerText.includes("salary");

  if (lowerText.includes("1099") || lowerText.includes("independent contractor")) {
    classificationType = "Contractor / 1099";
  } else if (isSalariedText) {
    if (!isExemptThresholdMet && (hoursWorked > 40 || lowerText.includes("overtime") || lowerText.includes("exempt"))) {
      classificationType = "Salaried Non-Exempt (Misclassified)";
    } else {
      classificationType = isExemptThresholdMet ? "Salaried Exempt" : "Salaried Non-Exempt (Misclassified)";
    }
  }

  // 4. Run Legal Rules Matching
  const redFlags: WageRedFlag[] = [];
  let hasOvertimeViolation = false;
  let hasIllegalShortageDeduction = false;
  let hasFicaMathMismatch = false;

  FLSA_RULES.forEach((rule) => {
    // If salary legitimately meets the applicable exemption threshold, do not falsely flag
    if (rule.id === "salaried_under_exemption_threshold" && isExemptThresholdMet) {
      return;
    }
    const match = cleanText.match(rule.pattern);
    if (match) {
      const quote = match[0].trim();
      redFlags.push({
        id: rule.id + "_" + Math.random().toString(36).substr(2, 5),
        quote: quote.length > 120 ? quote.substring(0, 117) + "..." : quote,
        title: rule.title,
        severity: rule.severity,
        statute: rule.statute,
        lawName: rule.lawName,
        explanation: rule.explanation,
        enforceability: rule.enforceability,
        workerAdvice: rule.workerAdvice
      });

      if (rule.id === "illegal_register_shortage_deduction" || rule.id === "illegal_uniform_equipment_deduction") {
        hasIllegalShortageDeduction = true;
      }
      if (rule.id === "missing_overtime_multiplier") {
        hasOvertimeViolation = true;
      }
    }
  });

  if (isSalariedText && !isExemptThresholdMet && (hoursWorked > 40 || lowerText.includes("overtime") || lowerText.includes("exempt"))) {
    const isStateOverride = stateRule.exemptionSalaryThreshold && stateRule.exemptionSalaryThreshold > FLSA_BINDING_FEDERAL_SALARY_THRESHOLD;
    const statuteCite = isStateOverride
      ? `${stateRule.stateName} Labor Code (${stateRule.statuteRef})`
      : "29 U.S.C. § 213(a)(1) & 29 C.F.R. Part 541";
    const lawTitle = isStateOverride
      ? `${stateRule.stateName} Statutory Salary Basis Mandate ($${applicableSalaryThreshold.toLocaleString()}/yr)`
      : `FLSA Salary Basis Floor ($${applicableSalaryThreshold.toLocaleString()}/yr)`;

    if (!redFlags.some(rf => rf.id.startsWith("salaried_under_threshold"))) {
      redFlags.push({
        id: "salaried_under_threshold",
        quote: `Calculated Annual Salary: $${calculatedAnnualSalary.toLocaleString()}`,
        title: `${stateRule.stateName} Salary Exemption Threshold Violation`,
        severity: "misclassification",
        statute: statuteCite,
        lawName: lawTitle,
        explanation: `Your calculated annual salary ($${calculatedAnnualSalary.toLocaleString()}) falls below the governing salary threshold for overtime exemption in ${stateRule.stateName} ($${applicableSalaryThreshold.toLocaleString()}/year). You cannot be classified as exempt from overtime pay regardless of title.`,
        enforceability: "High Misclassification Risk",
        workerAdvice: `You are statutorily non-exempt in ${stateRule.stateName} and entitled to 1.5x overtime pay for all hours worked over 40 in a workweek.`
      });
    }
  }

  // State-specific Daily Overtime Check
  // Only trigger if:
  // 1. Text explicitly states hours per day exceeding threshold (e.g. "10.0 Hours/Day"), OR
  // 2. Pay frequency is Daily and hours worked > threshold.
  // Avoid false-positive flags on multi-day periods (e.g. 80-hour bi-weekly period).
  const dailyHoursMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*(?:hrs?|hours?)\s*(?:\/|\s*per\s*)day/i)
    || cleanText.match(/(\d+(?:\.\d+)?)\s*hours?\s*(?:a|in\s+a)\s+day/i);
  let explicitDailyHours = 0;
  if (dailyHoursMatch) {
    explicitDailyHours = parseFloat(dailyHoursMatch[1]);
  }

  const hasDailyOvertimeViolation = stateRule.dailyOvertimeThreshold
    && ((explicitDailyHours > stateRule.dailyOvertimeThreshold) || (payFrequency === "Daily" && hoursWorked > stateRule.dailyOvertimeThreshold))
    && overtimeHours === 0;

  if (hasDailyOvertimeViolation) {
    redFlags.push({
      id: "state_daily_overtime_" + stateCode,
      quote: explicitDailyHours > 0
        ? `Hours Per Day: ${explicitDailyHours} hrs/day (Zero Daily Overtime Multiplier)`
        : `Hours Worked: ${hoursWorked} hrs (Zero Overtime Multiplier)`,
      title: `Missing Daily Overtime in ${stateRule.stateName}`,
      severity: "unlawful",
      statute: `${stateRule.stateName} Labor Code (${stateRule.statuteRef})`,
      lawName: `${stateRule.stateName} 8-Hour Daily Overtime Mandate`,
      explanation: `${stateRule.stateName} law mandates 1.5x overtime pay for all hours worked beyond ${stateRule.dailyOvertimeThreshold} in a single workday.`,
      enforceability: "Statutory Violation (Illegal)",
      workerAdvice: `In ${stateRule.stateName}, working over ${stateRule.dailyOvertimeThreshold} hours in a single workday triggers mandatory daily overtime pay.`
    });
    hasOvertimeViolation = true;
  }

  // FICA Verification Check (Social Security 6.2% & Medicare 1.45% = 7.65%)
  if (grossPay > 0 && deductionsList.length > 0) {
    const ficaItem = deductionsList.find(d => d.name.includes("FICA") || d.name.includes("SOCIAL") || d.name.includes("MEDICARE"));
    if (ficaItem) {
      const expectedFica = grossPay * 0.0765;
      const diff = Math.abs(ficaItem.amount - expectedFica);
      if (diff > 5.0 && ficaItem.amount < expectedFica * 0.5) {
        hasFicaMathMismatch = true;
        redFlags.push({
          id: "fica_math_mismatch",
          quote: `FICA Tax Deduction: $${ficaItem.amount.toFixed(2)} vs Expected 7.65%: $${expectedFica.toFixed(2)}`,
          title: "Statutory FICA Tax Calculation Discrepancy",
          severity: "caution",
          statute: "26 U.S.C. §§ 3101-3128 (Internal Revenue Code)",
          lawName: "Federal Insurance Contributions Act (FICA)",
          explanation: "Standard employee FICA withholding is 7.65% (6.2% Social Security + 1.45% Medicare). The deduction listed on this pay stub deviates significantly from standard statutory tax rates.",
          enforceability: "Verification Needed",
          workerAdvice: "Verify with payroll if tax withholdings are pre-tax or if an error occurred in payroll processing."
        });
      }
    }
  }

  // 5. Calculate Wage Compliance Score (0 to 100)
  let score = 100;
  redFlags.forEach(rf => {
    if (rf.severity === "unlawful") score -= 30;
    else if (rf.severity === "misclassification") score -= 20;
    else if (rf.severity === "caution") score -= 10;
  });

  if (hasIllegalShortageDeduction) score -= 15;
  if (hasOvertimeViolation) score -= 20;

  const complianceScore = Math.max(0, Math.min(100, Math.round(score)));

  // Executive Summary text
  let summary = `Analyzed ${documentType.toLowerCase()} for ${stateRule.stateName} jurisdiction (${classificationType}). `;
  if (redFlags.length === 0) {
    summary += `No statutory wage violations or unlawful deduction patterns were detected under FLSA or ${stateRule.stateName} laws.`;
  } else {
    summary += `Flagged ${redFlags.length} wage issue(s), including ${redFlags.filter(r => r.severity === "unlawful").length} statutory violation(s) under FLSA 29 U.S.C. § 207/213 or ${stateRule.stateName} statutes.`;
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
      applicableSalaryThreshold,
      hasOvertimeViolation,
      hasIllegalShortageDeduction,
      hasFicaMathMismatch
    },
    stateRuleInfo: stateRule,
    rawText: cleanText
  };
}
