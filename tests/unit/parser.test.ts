import { describe, it, expect } from 'vitest';
import { analyzePaystubText } from '../../src/legal/parser';
import { SAMPLE_PAYSTUBS } from '../../src/legal/samplePaystubs';

describe('Paystub Parser & Reality Engine', () => {
  it('identifies salaried misclassification below California statutory threshold ($70,304/yr)', () => {
    const sample = SAMPLE_PAYSTUBS[0]; // $40,000/yr salary
    const result = analyzePaystubText(sample.text, 'CA');

    expect(result.documentType).toBe('Wage Statement');
    expect(result.flsaCompliance.isExemptThresholdMet).toBe(false);
    expect(result.flsaCompliance.applicableSalaryThreshold).toBe(70304);
    expect(result.redFlags.some((rf) => rf.id.startsWith('salaried_under_exemption_threshold'))).toBe(true);
    expect(result.complianceScore).toBeLessThan(70);
  });

  it('detects unlawful deductions for register shortages and uniforms', () => {
    const sample = SAMPLE_PAYSTUBS[1]; // Cash drawer shortage & uniform rental
    const result = analyzePaystubText(sample.text, 'CA');

    expect(result.deductionsList.length).toBeGreaterThan(0);
    expect(result.redFlags.some((rf) => rf.id.startsWith('illegal_register_shortage_deduction'))).toBe(true);
    expect(result.redFlags.some((rf) => rf.id.startsWith('illegal_uniform_equipment_deduction'))).toBe(true);
  });

  it('detects California daily overtime violation and FICA mismatch', () => {
    const sample = SAMPLE_PAYSTUBS[2]; // 10 hrs/day with zero overtime in CA
    const result = analyzePaystubText(sample.text, 'CA');

    expect(result.flsaCompliance.hasOvertimeViolation).toBe(true);
    expect(result.flsaCompliance.hasFicaMathMismatch).toBe(true);
    expect(result.redFlags.some((rf) => rf.id.includes('state_daily_overtime'))).toBe(true);
  });

  it('detects offer letter exemption trap and illegal badge deposit', () => {
    const sample = SAMPLE_PAYSTUBS[3]; // Receptionist offer letter
    const result = analyzePaystubText(sample.text, 'CA');

    expect(result.documentType).toBe('Offer Letter / Contract');
    expect(result.flsaCompliance.isExemptThresholdMet).toBe(false);
    expect(result.redFlags.some((rf) => rf.id.startsWith('illegal_uniform_equipment_deduction'))).toBe(true);
  });

  it('rates a fully compliant wage statement with high compliance score', () => {
    const compliantText = `
REGULAR HOURLY WAGE STATEMENT
Employee: Pat Taylor | Position: Staff Accountant
Pay Period: 09/01/2026 - 09/14/2026 (Bi-Weekly)
Pay Type: Hourly Non-Exempt | Hourly Rate: $35.00 / Hour
Regular Hours Worked: 80.0 Hours ($2,800.00)
Overtime Hours Worked: 5.0 Hours @ 1.5x ($262.50)
Gross Pay: $3,062.50
FIT Withholding: $320.00
FICA Social Security (6.2%): $189.88
FICA Medicare (1.45%): $44.41
CA SDI (1.1%): $33.69
CA State Tax: $110.00
Net Pay: $2,364.52
    `;
    const result = analyzePaystubText(compliantText, 'CA');

    expect(result.redFlags.filter((rf) => rf.severity === 'unlawful').length).toBe(0);
    expect(result.complianceScore).toBeGreaterThanOrEqual(85);
  });
});
