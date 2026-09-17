import { StateWageRule } from './types';

export const STATE_WAGE_LAWS: Record<string, StateWageRule> = {
  CA: {
    stateCode: 'CA',
    stateName: 'California',
    statuteRef: 'Cal. Lab. Code § 510, § 226, & Industrial Welfare Commission Orders',
    minimumWageRate: 16.00,
    dailyOvertimeThreshold: 8, // 1.5x after 8 hrs
    doubleTimeThreshold: 12, // 2.0x after 12 hrs
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: true,
    stateTaxName: 'CA SDI (State Disability Insurance)',
    waitingTimePenaltyDays: 30, // Cal. Lab. Code § 203 waiting time penalty up to 30 days full wages
    specialRules: [
      'California mandates 1.5x overtime after 8 hours in a single workday, and 2.0x double time after 12 hours.',
      '7th Consecutive Workday Rule: 1.5x for first 8 hours on 7th consecutive day of workweek, 2.0x thereafter.',
      'Cal. Lab. Code § 226 mandates itemized pay stubs with gross/net pay, total hours, rates, and employer address.',
      'Waiting Time Penalties: Failure to pay all wages due upon termination triggers up to 30 days of full daily wage penalties under § 203.'
    ]
  },
  NY: {
    stateCode: 'NY',
    stateName: 'New York',
    statuteRef: 'N.Y. Lab. Law § 190 et seq. & § 195 (Wage Theft Prevention Act)',
    minimumWageRate: 16.00, // NYC, Long Island, Westchester ($15.00 Rest of State)
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: true,
    stateTaxName: 'NY DBL / PFL (Paid Family Leave)',
    statutoryDamagesMultiplier: '100% Liquidated Damages + Interest',
    specialRules: [
      'New York Wage Theft Prevention Act (§ 195) mandates written wage notices upon hire and detailed pay stub itemization.',
      'Spread of Hours Rule: Extra 1 hour of pay at minimum wage if workday exceeds 10 hours from start to finish.',
      '100% statutory liquidated damages plus 9% prejudgment interest for willful unpaid wages under N.Y. Lab. Law § 198.'
    ]
  },
  MA: {
    stateCode: 'MA',
    stateName: 'Massachusetts',
    statuteRef: 'M.G.L. c. 149 § 148 (Weekly Wage Act) & c. 151 § 1A',
    minimumWageRate: 15.00,
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: true,
    stateTaxName: 'MA PFML (Paid Family and Medical Leave)',
    statutoryDamagesMultiplier: 'MANDATORY Treble Damages (3x)',
    specialRules: [
      'M.G.L. c. 149 § 148 STRICTLY MANDATES automatic mandatory TREBLE DAMAGES (3x) for any late or unpaid wages.',
      'Prevailing workers recover mandatory 100% reasonable attorney fees and litigation costs under Massachusetts law.',
      'Employees must be paid within 6 or 7 days of the end of the pay period depending on pay frequency.'
    ]
  },
  WA: {
    stateCode: 'WA',
    stateName: 'Washington',
    statuteRef: 'RCW 49.46 (Minimum Wage Act) & RCW 49.52',
    minimumWageRate: 16.28,
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: true,
    stateTaxName: 'WA PFML & WA Cares Fund',
    statutoryDamagesMultiplier: 'Double Damages (2x)',
    specialRules: [
      'Washington has one of the highest state minimum wages in the nation ($16.28/hr in 2024).',
      'RCW 49.52.070 authorizes double damages (2x) for willful failure to pay earned wages.',
      'Exempt salary thresholds in WA are tied to multiples of state minimum wage ($67,724.80/yr in 2024).'
    ]
  },
  TX: {
    stateCode: 'TX',
    stateName: 'Texas',
    statuteRef: 'Tex. Lab. Code § 61.001 et seq. (Texas Payday Law)',
    minimumWageRate: 7.25,
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: false,
    specialRules: [
      'Texas follows federal FLSA minimum wage ($7.25/hr) and weekly overtime rules (40 hrs/wk).',
      'Texas Payday Law governs wage claims through the Texas Workforce Commission (TWC).',
      'Deductions require prior written authorization signed by the employee.'
    ]
  },
  FL: {
    stateCode: 'FL',
    stateName: 'Florida',
    statuteRef: 'Fla. Stat. § 448.110 & Fla. Const. Art. X, § 24',
    minimumWageRate: 13.00, // Indexing to $15.00 by 2026
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: false,
    specialRules: [
      'Florida constitutional minimum wage increases by $1.00 each September until reaching $15.00/hr in 2026.',
      'Must serve 15-day written notice to employer prior to filing statutory minimum wage lawsuit under Fla. Stat. § 448.110.'
    ]
  },
  DEFAULT: {
    stateCode: 'US',
    stateName: 'General US Federal Standard',
    statuteRef: 'Fair Labor Standards Act (29 U.S.C. § 201 et seq.)',
    minimumWageRate: 7.25,
    weeklyOvertimeThreshold: 40,
    hasStateDisabilityTax: false,
    specialRules: [
      'Federal FLSA mandates minimum wage of $7.25/hr and 1.5x overtime for hours worked beyond 40/week.',
      'Prevailing workers recover 100% back pay, 100% liquidated double damages, and attorney fees under 29 U.S.C. § 216(b).'
    ]
  }
};

export const ALL_US_STATES = [
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'WA', name: 'Washington' },
  { code: 'TX', name: 'Texas' },
  { code: 'FL', name: 'Florida' },
  { code: 'IL', name: 'Illinois' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'CO', name: 'Colorado' },
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' }
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
