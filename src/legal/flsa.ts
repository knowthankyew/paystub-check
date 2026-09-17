export interface FLSARule {
  id: string;
  pattern: RegExp;
  title: string;
  severity: 'unlawful' | 'misclassification' | 'caution';
  statute: string;
  lawName: string;
  explanation: string;
  enforceability: 'Statutory Violation (Illegal)' | 'High Misclassification Risk' | 'Verification Needed';
  workerAdvice: string;
}

export const FLSA_EXEMPTION_SALARY_THRESHOLD_2024 = 43888; // $844/week (DOL 2024 rule)
export const FLSA_EXEMPTION_SALARY_THRESHOLD_2025 = 58656; // $1,128/week

export const FLSA_RULES: FLSARule[] = [
  {
    id: 'illegal_register_shortage_deduction',
    pattern: /(shortage\s+deduction)|(cash\s+drawer\s+(short|deduct))|(register\s+shortage)|(till\s+shortage)/i,
    title: 'Illegal Cash Register Shortage Deduction',
    severity: 'unlawful',
    statute: '29 C.F.R. § 531.35 & FLSA Minimum Wage Provisions',
    lawName: 'FLSA Free and Clear Wage Rule (29 C.F.R. § 531.35)',
    explanation: 'Under federal law, employers cannot deduct cash register shortages or till missing funds from employee pay if the deduction reduces net earnings below minimum wage or cuts into earned overtime pay.',
    enforceability: 'Statutory Violation (Illegal)',
    workerAdvice: 'Employer deductions for till shortages are illegal if your effective pay drops below minimum wage or if overtime is impacted. Request full reimbursement.'
  },
  {
    id: 'illegal_uniform_equipment_deduction',
    pattern: /(uniform\s+(fee|cost|charge|deduction))|(tool\s+(rental|charge|fee))|(equipment\s+deduction)|(damaged\s+property\s+charge)/i,
    title: 'Unlawful Uniform or Equipment Cost Deduction',
    severity: 'unlawful',
    statute: '29 C.F.R. § 531.32 & § 531.35',
    lawName: 'DOL Field Operations Handbook Chapter 30c01',
    explanation: 'Required uniforms, safety equipment, or job tools are considered primarily for the benefit of the employer. Deducting their cost from employee wages is illegal whenever it reduces pay below statutory minimum wage or overtime minimums.',
    enforceability: 'Statutory Violation (Illegal)',
    workerAdvice: 'Employers must provide required uniforms or tools free of charge if deducting them reduces your hourly earnings below minimum wage.'
  },
  {
    id: 'salaried_under_exemption_threshold',
    pattern: /(salaried\s+exempt)|(exempt\s+from\s+overtime)|(no\s+overtime\s+paid\s+for\s+salary)/i,
    title: 'Potential FLSA Misclassification Below Exemption Threshold',
    severity: 'misclassification',
    statute: '29 U.S.C. § 213(a)(1) & 29 C.F.R. Part 541',
    lawName: 'FLSA Executive/Admin Exemption Salary Basis Rule',
    explanation: 'Simply paying an employee a "salary" does NOT make them exempt from overtime. To be exempt from 1.5x overtime pay under FLSA, an employee must earn at least $844/week ($43,888/yr) AND perform bona fide executive, administrative, or professional duties.',
    enforceability: 'High Misclassification Risk',
    workerAdvice: 'If your annual salary is under $43,888 ($844/wk) or your primary duties are non-management, you are statutorily non-exempt and entitled to 1.5x overtime for all hours worked over 40/week.'
  },
  {
    id: 'missing_overtime_multiplier',
    pattern: /(overtime\s+at\s+straight\s+time)|(flat\自行\rate\s+overtime)|(no\s+1\.5x\s+rate)/i,
    title: 'Unlawful Straight-Time Overtime Compensation',
    severity: 'unlawful',
    statute: '29 U.S.C. § 207(a)(1)',
    lawName: 'FLSA Mandatory 1.5x Overtime Multiplier',
    explanation: 'Non-exempt employees MUST be paid at least 1.5 times their regular hourly rate for all hours worked in excess of 40 in a workweek. Paying straight-time or flat rates for overtime hours violates federal law.',
    enforceability: 'Statutory Violation (Illegal)',
    workerAdvice: 'Demand recalculation of all overtime hours at 1.5 times your regular rate of pay plus liquidated damages.'
  },
  {
    id: 'unexplained_mandatory_fee',
    pattern: /(administrative\s+fee\s+deduction)|(processing\s+fee)|(service\s+charge\s+deduction)/i,
    title: 'Questionable Administrative Fee Deduction',
    severity: 'caution',
    statute: '29 C.F.R. § 531.35',
    lawName: 'FLSA Free and Clear Payment Mandate',
    explanation: 'Employers cannot impose discretionary administrative or processing fees on worker paychecks unless explicitly authorized by statute or voluntary written agreement.',
    enforceability: 'Verification Needed',
    workerAdvice: 'Request written itemization and statutory authority from payroll for any arbitrary administrative fee deductions.'
  }
];
