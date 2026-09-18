import { describe, it, expect } from 'vitest';
import {
  FLSA_BINDING_FEDERAL_SALARY_THRESHOLD,
  FLSA_VACATED_2024_SALARY_THRESHOLD,
  FLSA_RULES,
} from '../../src/legal/flsa';

describe('FLSA Legal Thresholds & Rules', () => {
  it('enforces the binding federal salary threshold of $35,568/yr ($684/week)', () => {
    expect(FLSA_BINDING_FEDERAL_SALARY_THRESHOLD).toBe(35568);
    expect(FLSA_BINDING_FEDERAL_SALARY_THRESHOLD / 52).toBe(684);
  });

  it('documents the vacated 2024 salary threshold ($43,888/yr)', () => {
    expect(FLSA_VACATED_2024_SALARY_THRESHOLD).toBe(43888);
  });

  it('flags illegal cash drawer shortage deductions under 29 C.F.R. § 531.35', () => {
    const shortageRule = FLSA_RULES.find((r) => r.id === 'illegal_register_shortage_deduction');
    expect(shortageRule).toBeDefined();
    expect(shortageRule?.statute).toContain('29 C.F.R. § 531.35');
    expect(shortageRule?.severity).toBe('unlawful');

    const sampleText = 'Deduction: Register Shortage -$45.00';
    expect(shortageRule?.pattern.test(sampleText)).toBe(true);
  });

  it('flags mandatory uniform and tool deductions', () => {
    const uniformRule = FLSA_RULES.find((r) => r.id === 'illegal_uniform_equipment_deduction');
    expect(uniformRule).toBeDefined();
    expect(uniformRule?.statute).toContain('29 C.F.R. § 531.32');

    expect(uniformRule?.pattern.test('Uniform Fee: $25.00')).toBe(true);
    expect(uniformRule?.pattern.test('Tool Rental charge: $15.00')).toBe(true);
    expect(uniformRule?.pattern.test('Damaged property charge: $50.00')).toBe(true);
  });

  it('flags salaried exempt claims without overtime as potential misclassification', () => {
    const misclassRule = FLSA_RULES.find((r) => r.id === 'salaried_under_exemption_threshold');
    expect(misclassRule).toBeDefined();
    expect(misclassRule?.statute).toContain('29 U.S.C. § 213(a)(1)');
    expect(misclassRule?.severity).toBe('misclassification');

    expect(misclassRule?.pattern.test('Position: Salaried Exempt')).toBe(true);
    expect(misclassRule?.pattern.test('Exempt from overtime')).toBe(true);
  });

  it('flags straight-time overtime compensation as statutory violation under 29 U.S.C. § 207(a)(1)', () => {
    const otRule = FLSA_RULES.find((r) => r.id === 'missing_overtime_multiplier');
    expect(otRule).toBeDefined();
    expect(otRule?.statute).toContain('29 U.S.C. § 207(a)(1)');
    expect(otRule?.severity).toBe('unlawful');

    expect(otRule?.pattern.test('Overtime at straight time')).toBe(true);
    expect(otRule?.pattern.test('Flat rate overtime applied')).toBe(true);
  });
});
