import { SamplePaystub } from './types';

export const SAMPLE_PAYSTUBS: SamplePaystub[] = [
  {
    id: 'misclassified_salary',
    title: 'Salaried Misclassification — $40k Salary & Unpaid Overtime',
    category: 'Retail & Hospitality',
    description: 'Salary of $40,000/yr ($769/wk) falls below FLSA exemption threshold ($43,888/yr) while working 50 hrs/wk without overtime.',
    text: `APEX LOGISTICS LLC - EMPLOYEE WAGE STATEMENT
Employee: Alex Rivera | Job Title: Assistant Shift Leader
Pay Period: 09/01/2026 - 09/14/2026 (Bi-Weekly)
Pay Type: Salaried Exempt | Status: Exempt from Overtime

EARNINGS:
Regular Salary: $1,538.46 (Calculated Annual Salary: $40,000.00)
Regular Hours Worked: 100.0 Hours (50.0 Hours/Week)
Overtime Hours: 10.0 Hours (Paid at Straight Time Rate: $0.00 Extra)
Gross Pay: $1,538.46

DEDUCTIONS & TAXES:
FIT (Federal Income Tax): $150.00
FICA Social Security (6.2%): $95.38
FICA Medicare (1.45%): $22.31
Net Pay: $1,270.77

NOTICE: Employee is classified as Salaried Exempt under management discretion. No 1.5x overtime multiplier applied.`
  },
  {
    id: 'illegal_shortage_deduction',
    title: 'Illegal Uniform & Cash Register Shortage Deductions',
    category: 'Retail / Food Service',
    description: 'Pay stub deducting $75 uniform fee and $50 till shortage, reducing net pay below statutory minimum wage.',
    text: `METRO DINER & CAFÉ - STATEMENT OF EARNINGS & DEDUCTIONS
Employee: Jordan Lee | Position: Cashier / Line Server
Pay Period: Weekly | Hourly Rate: $12.00 / Hour
Hours Worked: 30.0 Hours
Gross Earnings: $360.00

STATUTORY & EMPLOYER DEDUCTIONS:
FIT Withholding: $32.00
FICA Taxes (7.65%): $27.54
UNIFORM DEDUCTION (Mandatory Logo Apron & Shirts): $75.00
REGISTER SHORTAGE DEDUCTION (Till Shortage 09/05): $50.00
Net Pay Amount: $175.46

STATEMENT NOTICE: Shortage deduction processed per till audit. Uniform fee billed per company handbook policy.`
  },
  {
    id: 'ca_daily_overtime',
    title: 'California Missing Daily Overtime & FICA Mismatch',
    category: 'Warehouse & Logistics',
    description: 'California worker working 10 hrs/day with zero daily 1.5x overtime multiplier and miscalculated FICA tax.',
    text: `CAL-FREIGHT DISTRIBUTION INC - PAY ADVICE
Employee: Sam Morgan | Jurisdiction: California (CA)
Pay Period: Bi-Weekly | Hourly Rate: $20.00 / Hour
Hours Worked: 80.0 Hours (10.0 Hours/Day across 8 workdays)
Overtime Hours: 0.0 Hours (Paid at Regular Rate)

EARNINGS:
Regular Earnings (80.0 hrs @ $20.00): $1,600.00
Overtime Earnings (0.0 hrs @ 1.5x): $0.00
Gross Earnings: $1,600.00

TAXES & DEDUCTIONS:
Federal Tax: $140.00
CA State Tax: $45.00
CA SDI (Disability): $17.60
FICA Tax Deduction: $40.00  (Discrepancy: FICA listed significantly under 7.65%)
Net Pay: $1,357.40`
  },
  {
    id: 'offer_letter_trap',
    title: 'Offer Letter Exemption Trap — Receptionist "Salaried Exempt"',
    category: 'Office & Clerical',
    description: 'Offer letter classifying an administrative receptionist as "Salaried Exempt" with mandatory unpaid weekend hours.',
    text: `OFFER OF EMPLOYMENT - PACIFIC BLUE MEDIA GROUP

Date: September 15, 2026
Dear Taylor Reed,

We are pleased to offer you the position of Front Desk Receptionist / Administrative Coordinator at Pacific Blue Media Group.

COMPENSATION & EXEMPTION TERMS:
1. Salary: $38,000 per year ($730.77 per week), paid on a semi-monthly basis.
2. Classification: You will be classified as a Salaried Exempt employee.
3. Hours of Work: Standard office hours are 8:30 AM to 5:30 PM, Monday through Friday. Additionally, you will be required to staff weekend promotional events (approx. 8–10 hours/month) without additional compensation.
4. Overtime: As a salaried exempt employee, you are not eligible for overtime compensation for hours worked beyond 40 per week.
5. Uniform & Badge: A mandatory $100 badge and uniform deposit will be deducted from your first paycheck.

We look forward to welcoming you to our team.`
  }
];
