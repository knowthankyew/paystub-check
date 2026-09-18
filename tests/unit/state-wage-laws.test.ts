import { describe, it, expect } from 'vitest';
import { STATE_WAGE_LAWS } from '../../src/legal/stateWageLaws';

describe('State Wage Laws (2026 Statutory Benchmarks)', () => {
  describe('California (CA)', () => {
    const ca = STATE_WAGE_LAWS.CA;

    it('enforces 2026 California minimum wage of $16.90/hr', () => {
      expect(ca.minimumWageRate).toBe(16.90);
    });

    it('enforces 2026 California exempt salary threshold of $70,304/yr ($1,352/wk)', () => {
      expect(ca.exemptionSalaryThreshold).toBe(70304);
      // Under Cal. Lab. Code § 515(a): 2x min wage * 2080 hrs
      expect(ca.minimumWageRate * 2 * 2080).toBeCloseTo(70304, 0);
    });

    it('enforces 8-hour daily overtime and 12-hour double time rules', () => {
      expect(ca.dailyOvertimeThreshold).toBe(8);
      expect(ca.doubleTimeThreshold).toBe(12);
    });

    it('specifies 30-day waiting time penalty under Cal. Lab. Code § 203', () => {
      expect(ca.waitingTimePenaltyDays).toBe(30);
    });
  });

  describe('New York (NY)', () => {
    const ny = STATE_WAGE_LAWS.NY;

    it('enforces 2026 New York downstate minimum wage of $17.00/hr', () => {
      expect(ny.minimumWageRate).toBe(17.00);
    });

    it('enforces 2026 New York exempt salary threshold of $66,300/yr downstate ($1,275/wk)', () => {
      expect(ny.exemptionSalaryThreshold).toBe(66300);
      // Under 12 NYCRR § 142-2.14: 75x min wage * 52 weeks
      expect(ny.minimumWageRate * 75 * 52).toBe(66300);
    });

    it('references statutory liquidated damages under NY Lab. Law § 198', () => {
      expect(ny.statutoryDamagesMultiplier).toContain('100% Liquidated Damages');
    });
  });

  describe('Massachusetts (MA)', () => {
    const ma = STATE_WAGE_LAWS.MA;

    it('cites both M.G.L. c. 149 § 148 and § 150 for mandatory treble damages', () => {
      expect(ma.statuteRef).toContain('M.G.L. c. 149 §§ 148, 150');
      expect(ma.statutoryDamagesMultiplier).toBe('MANDATORY Treble Damages (3x)');
      expect(ma.specialRules.some((r) => r.includes('M.G.L. c. 149, § 150'))).toBe(true);
    });
  });

  describe('Washington (WA)', () => {
    const wa = STATE_WAGE_LAWS.WA;

    it('enforces 2026 Washington minimum wage of $17.13/hr', () => {
      expect(wa.minimumWageRate).toBe(17.13);
    });

    it('enforces 2026 Washington exempt salary threshold of $80,168.40/yr ($1,541.70/wk)', () => {
      expect(wa.exemptionSalaryThreshold).toBeCloseTo(80168.40, 2);
      // 2.25x min wage * 2080 hrs under WAC 296-128-545
      expect(wa.minimumWageRate * 2.25 * 2080).toBeCloseTo(80168.40, 2);
    });
  });
});
