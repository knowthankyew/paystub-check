export interface FLSARule {
  id: string;
  pattern: RegExp;
  title: string;
  severity: "unlawful" | "misclassification" | "caution";
  statute: string;
  lawName: string;
  explanation: string;
  enforceability: "Statutory Violation (Illegal)" | "High Misclassification Risk" | "Verification Needed";
  workerAdvice: string;
}

// Binding federal FLSA salary threshold ($684/week or $35,568/year).
// Note: The DOL 2024 rule ($43,888/yr) was struck down and vacated nationwide by the
// U.S. District Court in State of Texas v. DOL (Nov 15, 2024). State thresholds (e.g. CA, NY, WA)
// provide higher protections and supersede the federal floor.
export const FLSA_BINDING_FEDERAL_SALARY_THRESHOLD = 35568; // $684/week ($35,568/year)
export const FLSA_VACATED_2024_SALARY_THRESHOLD = 43888; // $844/week (Vacated nationwide by federal court)

export const FLSA_RULES: FLSARule[] = [
  {
    id: "illegal_register_shortage_deduction",
    pattern: /(shortage\s+deduction)|(cash\s+drawer\s+(short|deduct))|(register\s+shortage)|(till\s+shortage)/i,
    title: "Illegal Cash Register Shortage Deduction",
    severity: "unlawful",
    statute: "29 C.F.R. § 531.35 & State Labor Codes (e.g. Cal. Lab. Code § 221, NY Lab. Law § 193)",
    lawName: "FLSA Free and Clear Wage Rule & State Anti-Deduction Bans",
    explanation: "Under 29 C.F.R. § 531.35, employers cannot deduct cash register shortages or missing funds if the deduction cuts into statutory minimum wage or overtime. Furthermore, in states like California, New York, and Massachusetts, employer deductions for till shortages or breakage are strictly illegal across the board regardless of wage rate.",
    enforceability: "Statutory Violation (Illegal)",
    workerAdvice: "Employer deductions for register shortages are prohibited if your effective pay drops below minimum wage or overtime, and strictly banned under state labor laws in CA, NY, and MA. Request full reimbursement."
  },
  {
    id: "illegal_uniform_equipment_deduction",
    pattern: /(uniform\s+(fee|cost|charge|deduction|deposit))|(tool\s+(rental|charge|fee))|(equipment\s+deduction)|(damaged\s+property\s+charge)|(badge\s+(?:and\s+uniform\s+)?deposit)/i,
    title: "Unlawful Uniform or Equipment Cost Deduction",
    severity: "unlawful",
    statute: "29 C.F.R. § 531.32, § 531.35, & State Wage Statutes",
    lawName: "DOL Field Operations Handbook Chapter 30c01 & State Rules",
    explanation: "Required uniforms, safety gear, or job tools are considered primarily for the employer benefit. Deducting their cost is illegal whenever it reduces pay below statutory minimums, and state labor codes (e.g. CA, NY, MA) prohibit mandatory payroll deductions for employer-required uniforms and equipment.",
    enforceability: "Statutory Violation (Illegal)",
    workerAdvice: "Employers must provide required uniforms and job tools free of charge if deducting them reduces your hourly earnings below minimum wage or violates state law."
  },
  {
    id: "salaried_under_exemption_threshold",
    pattern: /(salaried\s+exempt)|(exempt\s+from\s+overtime)|(no\s+overtime\s+paid\s+for\s+salary)/i,
    title: "Potential Salary Misclassification Below Exemption Threshold",
    severity: "misclassification",
    statute: "29 U.S.C. § 213(a)(1), 29 C.F.R. Part 541, & State Overtime Statutes",
    lawName: "FLSA Executive/Admin Exemption Salary Basis Rule",
    explanation: "Simply paying an employee a salary does NOT make them exempt from overtime. To be exempt, an employee must earn at least the governing statutory threshold (binding federal floor is $684/wk or $35,568/yr following the nationwide vacatur of the 2024 rule, with higher state thresholds like CA $70,304, WA $80,168, or NY $66,300 downstate taking precedence) AND perform bona fide executive, administrative, or professional duties.",
    enforceability: "High Misclassification Risk",
    workerAdvice: "If your salary falls below the applicable state or federal exemption threshold, or if your primary duties are non-managerial, you are statutorily non-exempt and entitled to 1.5x overtime for all hours worked over 40 in a workweek."
  },
  {
    id: "missing_overtime_multiplier",
    pattern: /(overtime\s+at\s+straight\s+time)|(flat\s+rate\s+overtime)|(no\s+1\.5x\s+rate)/i,
    title: "Unlawful Straight-Time Overtime Compensation",
    severity: "unlawful",
    statute: "29 U.S.C. § 207(a)(1)",
    lawName: "FLSA Mandatory 1.5x Overtime Multiplier",
    explanation: "Non-exempt employees MUST be paid at least 1.5 times their regular hourly rate for all hours worked in excess of 40 in a workweek. Paying straight-time or flat rates for overtime hours violates federal law.",
    enforceability: "Statutory Violation (Illegal)",
    workerAdvice: "Demand recalculation of all overtime hours at 1.5 times your regular rate of pay plus liquidated damages under 29 U.S.C. § 216(b)."
  },
  {
    id: "unexplained_mandatory_fee",
    pattern: /(administrative\s+fee\s+deduction)|(processing\s+fee)|(service\s+charge\s+deduction)/i,
    title: "Questionable Administrative Fee Deduction",
    severity: "caution",
    statute: "29 C.F.R. § 531.35",
    lawName: "FLSA Free and Clear Payment Mandate",
    explanation: "Employers cannot impose discretionary administrative or processing fees on worker paychecks unless explicitly authorized by statute or voluntary written agreement.",
    enforceability: "Verification Needed",
    workerAdvice: "Request written itemization and statutory authority from payroll for any arbitrary administrative fee deductions."
  }
];
