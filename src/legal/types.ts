export type SeverityLevel = 'unlawful' | 'misclassification' | 'caution' | 'compliant';

export interface WageRedFlag {
  id: string;
  quote: string;
  title: string;
  severity: SeverityLevel;
  statute: string;
  lawName: string;
  explanation: string;
  enforceability: 'Statutory Violation (Illegal)' | 'High Misclassification Risk' | 'Verification Needed';
  workerAdvice: string;
}

export interface DeductionLineItem {
  name: string;
  amount: number;
  isStatutoryTax: boolean;
  isIllegalDeduction: boolean;
  explanation?: string;
}

export interface StateWageRule {
  stateCode: string;
  stateName: string;
  statuteRef: string;
  minimumWageRate: number;
  dailyOvertimeThreshold?: number; // e.g. 8 hrs in CA, NV, AK
  doubleTimeThreshold?: number; // e.g. 12 hrs in CA
  weeklyOvertimeThreshold: number; // 40 hrs standard
  hasStateDisabilityTax: boolean;
  stateTaxName?: string;
  waitingTimePenaltyDays?: number; // e.g. up to 30 days in CA § 203
  statutoryDamagesMultiplier?: string; // e.g. Treble damages in MA c. 149 § 148
  specialRules: string[];
}

export interface LegalAnalysisResult {
  documentType: 'Pay Stub' | 'Offer Letter / Contract' | 'Wage Statement';
  stateCode: string;
  complianceScore: number; // 0 - 100
  summary: string;
  classificationType: 'Hourly Non-Exempt' | 'Salaried Exempt' | 'Salaried Non-Exempt (Misclassified)' | 'Contractor / 1099';
  extractedPay: {
    grossPay: number;
    netPay: number;
    hourlyRate?: number;
    hoursWorked?: number;
    overtimeHours?: number;
    payFrequency: 'Weekly' | 'Bi-Weekly' | 'Semi-Monthly' | 'Monthly' | 'Annual Salary';
    calculatedAnnualSalary: number;
  };
  redFlags: WageRedFlag[];
  deductionsList: DeductionLineItem[];
  flsaCompliance: {
    isExemptThresholdMet: boolean;
    hasOvertimeViolation: boolean;
    hasIllegalShortageDeduction: boolean;
    hasFicaMathMismatch: boolean;
  };
  stateRuleInfo: StateWageRule;
  rawText: string;
}

export interface SamplePaystub {
  id: string;
  title: string;
  category: string;
  description: string;
  text: string;
}

export interface DemandLetterData {
  workerName: string;
  workerAddress: string;
  workerPhoneEmail: string;
  employerName: string;
  employerAddress: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  stateCode: string;
  unpaidOvertimeAmount: string;
  unlawfulDeductionAmount: string;
  demandedRemedy: 'Full Back Pay + 100% Liquidated Damages' | 'Reimbursement of Illegal Deductions' | 'Reclassification to Non-Exempt + Overtime';
}
