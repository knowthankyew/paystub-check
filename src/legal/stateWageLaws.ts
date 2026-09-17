import { StateWageRule } from "./types";
import { FLSA_BINDING_FEDERAL_SALARY_THRESHOLD } from "./flsa";

export const STATE_WAGE_LAWS: Record<string, StateWageRule> = {
  CA: {
    stateCode: "CA",
    stateName: "California",
    statuteRef: "Cal. Lab. Code § 510, § 515, § 226, & IWC Orders",
    minimumWageRate: 16.00,
    exemptionSalaryThreshold: 66560, // 2x California minimum wage ($16 * 2 * 2080 hrs)
    dailyOvertimeThreshold: 8, // 1.5x after 8 hrs in a single workday
    doubleTimeThreshold: 12, // 2.0x after 12 hrs in a single workday
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: true,
    stateTaxName: "CA SDI (State Disability Insurance)",
    waitingTimePenaltyDays: 30, // Cal. Lab. Code § 203 waiting time penalty up to 30 days full wages
    specialRules: [
      "Cal. Lab. Code § 515(a) mandates a salary of at least $66,560/yr ($1,280/wk) to be exempt from overtime. Paying under this threshold means the worker is non-exempt regardless of job title.",
      "California mandates 1.5x overtime after 8 hours in a single workday, and 2.0x double time after 12 hours.",
      "7th Consecutive Workday Rule: 1.5x for first 8 hours on 7th consecutive day of workweek, 2.0x thereafter.",
      "Cal. Lab. Code § 221 & Kerr's Catering ban all deductions for cash register shortages or breakage, even if authorized in writing.",
      "Cal. Lab. Code § 226 mandates itemized pay stubs with gross/net pay, total hours, rates, and employer address.",
      "Waiting Time Penalties: Failure to pay all wages due upon termination triggers up to 30 days of full daily wage penalties under § 203."
    ]
  },
  NY: {
    stateCode: "NY",
    stateName: "New York",
    statuteRef: "N.Y. Lab. Law § 190 et seq., § 195, & 12 NYCRR § 142-2.14",
    minimumWageRate: 16.00, // NYC, Long Island, Westchester ($15.00 Rest of State)
    exemptionSalaryThreshold: 62400, // $1,200/wk for NYC/LI/Westchester; $58,500 rest of NY
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: true,
    stateTaxName: "NY DBL / PFL (Paid Family Leave)",
    statutoryDamagesMultiplier: "100% Liquidated Damages + Interest",
    specialRules: [
      "12 NYCRR § 142-2.14 requires an exempt salary of at least $62,400/yr ($1,200/wk) in NYC/Long Island/Westchester ($58,500 upstate).",
      "N.Y. Lab. Law § 193 strictly bans deductions for cash shortages, till shortages, or business expenses.",
      "New York Wage Theft Prevention Act (§ 195) mandates written wage notices upon hire and detailed pay stub itemization.",
      "Spread of Hours Rule: Extra 1 hour of pay at minimum wage if workday exceeds 10 hours from start to finish.",
      "100% statutory liquidated damages plus 9% prejudgment interest for willful unpaid wages under N.Y. Lab. Law § 198."
    ]
  },
  MA: {
    stateCode: "MA",
    stateName: "Massachusetts",
    statuteRef: "M.G.L. c. 149 § 148 (Weekly Wage Act) & c. 151 § 1A",
    minimumWageRate: 15.00,
    exemptionSalaryThreshold: FLSA_BINDING_FEDERAL_SALARY_THRESHOLD,
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: true,
    stateTaxName: "MA PFML (Paid Family and Medical Leave)",
    statutoryDamagesMultiplier: "MANDATORY Treble Damages (3x)",
    specialRules: [
      "M.G.L. c. 149 § 148 STRICTLY MANDATES automatic mandatory TREBLE DAMAGES (3x) for any late or unpaid wages.",
      "Prevailing workers recover mandatory 100% reasonable attorney fees and litigation costs under Massachusetts law.",
      "M.G.L. c. 149 § 150 & Camara v. AG strictly ban deductions for damages or shortages as impermissible self-help.",
      "Employees must be paid within 6 or 7 days of the end of the pay period depending on pay frequency."
    ]
  },
  WA: {
    stateCode: "WA",
    stateName: "Washington",
    statuteRef: "RCW 49.46 (Minimum Wage Act), RCW 49.52, & WAC 296-128-545",
    minimumWageRate: 16.28,
    exemptionSalaryThreshold: 67725, // 2x state minimum wage ($67,724.80/yr)
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: true,
    stateTaxName: "WA PFML & WA Cares Fund",
    statutoryDamagesMultiplier: "Double Damages (2x)",
    specialRules: [
      "Washington has one of the highest state minimum wages in the nation ($16.28/hr in 2024).",
      "Exempt salary thresholds in WA are tied to multiples of state minimum wage ($67,724.80/yr in 2024).",
      "RCW 49.52.070 authorizes double damages (2x) for willful failure to pay earned wages."
    ]
  },
  CO: {
    stateCode: "CO",
    stateName: "Colorado",
    statuteRef: "Colo. Rev. Stat. § 8-4-101 et seq. & COMPS Order #39",
    minimumWageRate: 14.42,
    exemptionSalaryThreshold: 55000, // COMPS Order #39 salary threshold ($55,000/yr or $1,057.69/wk)
    dailyOvertimeThreshold: 12, // 1.5x after 12 hrs in a workday
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: true,
    stateTaxName: "CO FAMLI (Family and Medical Leave Insurance)",
    statutoryDamagesMultiplier: "Penalties up to 3x Unpaid Wages",
    specialRules: [
      "COMPS Order #39 mandates an annual exempt salary of at least $55,000 ($1,057.69/wk).",
      "Colorado requires 1.5x overtime after 12 hours worked in a single workday or 12 consecutive hours.",
      "Deductions for cash shortages or property damage are strictly restricted under C.R.S. § 8-4-105."
    ]
  },
  TX: {
    stateCode: "TX",
    stateName: "Texas",
    statuteRef: "Tex. Lab. Code § 61.001 et seq. (Texas Payday Law)",
    minimumWageRate: 7.25,
    exemptionSalaryThreshold: FLSA_BINDING_FEDERAL_SALARY_THRESHOLD,
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: false,
    specialRules: [
      "Texas follows federal FLSA minimum wage ($7.25/hr) and weekly overtime rules (40 hrs/wk).",
      "Texas Payday Law governs wage claims through the Texas Workforce Commission (TWC).",
      "Deductions require prior written authorization signed by the employee."
    ]
  },
  FL: {
    stateCode: "FL",
    stateName: "Florida",
    statuteRef: "Fla. Stat. § 448.110 & Fla. Const. Art. X, § 24",
    minimumWageRate: 13.00, // Indexing to $15.00 by 2026
    exemptionSalaryThreshold: FLSA_BINDING_FEDERAL_SALARY_THRESHOLD,
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: false,
    specialRules: [
      "Florida constitutional minimum wage increases by $1.00 each September until reaching $15.00/hr in 2026.",
      "Must serve 15-day written notice to employer prior to filing statutory minimum wage lawsuit under Fla. Stat. § 448.110."
    ]
  },
  DEFAULT: {
    stateCode: "US",
    stateName: "General US Federal Standard",
    statuteRef: "Fair Labor Standards Act (29 U.S.C. § 201 et seq.)",
    minimumWageRate: 7.25,
    exemptionSalaryThreshold: FLSA_BINDING_FEDERAL_SALARY_THRESHOLD,
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: false,
    specialRules: [
      "Federal FLSA mandates minimum wage of $7.25/hr and 1.5x overtime for hours worked beyond 40/week.",
      "Federal binding salary basis threshold is $35,568/yr ($684/wk) following the nationwide vacatur of the 2024 rule.",
      "Prevailing workers recover 100% back pay, 100% liquidated double damages, and attorney fees under 29 U.S.C. § 216(b)."
    ]
  }
};

export const ALL_US_STATES = [
  { code: "CA", name: "California" },
  { code: "NY", name: "New York" },
  { code: "MA", name: "Massachusetts" },
  { code: "WA", name: "Washington" },
  { code: "CO", name: "Colorado" },
  { code: "TX", name: "Texas" },
  { code: "FL", name: "Florida" },
  { code: "IL", name: "Illinois" },
  { code: "PA", name: "Pennsylvania" },
  { code: "NJ", name: "New Jersey" },
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NM", name: "New Mexico" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" }
];

export function getStateWageRule(stateCode: string): StateWageRule {
  const code = stateCode.toUpperCase();
  if (STATE_WAGE_LAWS[code]) {
    return STATE_WAGE_LAWS[code];
  }
  return {
    ...STATE_WAGE_LAWS.DEFAULT,
    stateCode: code,
    stateName: ALL_US_STATES.find(s => s.code === code)?.name || code
  };
}
