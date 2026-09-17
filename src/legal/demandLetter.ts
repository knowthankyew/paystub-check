import { DemandLetterData, LegalAnalysisResult } from "./types";

export function generateDemandLetter(
  data: DemandLetterData,
  analysis: LegalAnalysisResult
): string {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const stateRule = analysis.stateRuleInfo;
  const unlawfulFlags = analysis.redFlags.filter(rf => rf.severity === "unlawful" || rf.severity === "misclassification");

  let statutoryReferences = `- Federal Fair Labor Standards Act (FLSA), 29 U.S.C. § 201 et seq.
- 29 U.S.C. § 207 Mandatory 1.5x Overtime Compensation
- 29 C.F.R. § 531.35 Free and Clear Wage Payment Mandate
- ${stateRule.stateName} Statutory Authorities (${stateRule.statuteRef})`;

  if (analysis.flsaCompliance.hasOvertimeViolation) {
    statutoryReferences += `\n- 29 U.S.C. § 207(a)(1) Unpaid Overtime Compensation.`;
  }
  if (analysis.flsaCompliance.hasIllegalShortageDeduction) {
    statutoryReferences += `\n- 29 C.F.R. § 531.35 & State Labor Code Prohibitions on Cash Register Shortages / Uniform Deductions.`;
  }
  if (!analysis.flsaCompliance.isExemptThresholdMet) {
    const isStateOverride = stateRule.exemptionSalaryThreshold && stateRule.exemptionSalaryThreshold > 35568;
    if (isStateOverride) {
      statutoryReferences += `\n- ${stateRule.stateName} Statutory Salary Exemption Threshold ($${analysis.flsaCompliance.applicableSalaryThreshold.toLocaleString()}/yr under ${stateRule.statuteRef}).`;
    } else {
      statutoryReferences += `\n- 29 U.S.C. § 213(a)(1) FLSA Salary Exemption Threshold ($${analysis.flsaCompliance.applicableSalaryThreshold.toLocaleString()}/yr).`;
    }
  }
  if (stateRule.waitingTimePenaltyDays) {
    statutoryReferences += `\n- ${stateRule.stateName} Waiting Time Penalty Provisions (Up to ${stateRule.waitingTimePenaltyDays} Days Full Wages under ${stateRule.statuteRef}).`;
  }

  let flaggedIssuesSection = "";
  if (unlawfulFlags.length > 0) {
    flaggedIssuesSection = `\nSTATUTORY WAGE VIOLATIONS DETECTED:
Please take notice that an audit of wage statements / employment records indicates the following violations of federal and state law:
${unlawfulFlags.map((flag, idx) => `${idx + 1}. Issue: ${flag.title}
   Quoted Line: "${flag.quote}"
   Legal Authority: ${flag.statute}
   Details: ${flag.explanation}`).join("\n\n")}
`;
  }

  return `FORMAL NOTICE OF WAGE CLAIM & DEMAND FOR STATUTORY REMEDY
SENT VIA CERTIFIED MAIL / WRITTEN DEMAND

Date: ${currentDate}

FROM:
${data.workerName || "[Your Full Name]"}
${data.workerAddress || "[Your Street Address, City, State ZIP]"}
Phone/Email: ${data.workerPhoneEmail || "[Your Contact Info]"}

TO:
Payroll Manager / Human Resources / Legal Counsel
${data.employerName || "[Employer Company Name]"}
${data.employerAddress || "[Employer Address, City, State ZIP]"}

RE: Statutory Demand for Unpaid Wages, Liquidated Damages, and Wage Reclassification
Worker Name: ${data.workerName || "[Your Name]"}
Job Title: ${data.jobTitle || "[Your Job Title]"}
Period of Employment: ${data.startDate || "[Start Date]"} to ${data.endDate || "Present"}
Workplace State Jurisdiction: ${stateRule.stateName} (${analysis.stateCode})

Dear Payroll Manager / HR Director,

I am writing to formally request immediate correction and full payment of unpaid earned wages, improper payroll deductions, and overtime compensation owed under the Fair Labor Standards Act (FLSA, 29 U.S.C. § 201 et seq.) and ${stateRule.stateName} labor statutes (${stateRule.statuteRef}).

STATEMENT OF WAGE CLAIM & DISCREPANCIES:
During my employment as ${data.jobTitle || "an employee"}, I have been subjected to improper payroll practices resulting in unpaid wages and unlawful deductions.

Unpaid Overtime Amount Demanded: ${data.unpaidOvertimeAmount || "[Amount or \"To Be Calculated\"]"}
Unlawful Deductions Reimbursement: ${data.unlawfulDeductionAmount || "[Amount or \"To Be Calculated\"]"}

APPLICABLE STATUTORY PROTECTIONS:
This demand is grounded in the following federal and state statutory provisions:
${statutoryReferences}
${flaggedIssuesSection}
STATUTORY REMEDY & DEMAND:
Pursuant to federal law (29 U.S.C. § 216(b)) and ${stateRule.stateName} labor statutes, I hereby demand the following remedy within fourteen (14) calendar days of receipt of this notice:

DEMANDED REMEDY: ${data.demandedRemedy || "Full Back Pay + 100% Liquidated Damages"}

Please be advised that under 29 U.S.C. § 216(b) of the FLSA, employers who fail to pay mandatory minimum wages or overtime are statutorily liable for 100% liquidated damages (double damages), as well as mandatory 100% reasonable attorney fees and court costs. In states like Massachusetts (M.G.L. c. 149 § 148), state law mandates automatic treble damages (3x).

Please contact me at the phone number or email address provided above within 14 days to confirm payment arrangements.

Sincerely,


__________________________________________
${data.workerName || "[Your Printed Name]"}
`;
}
