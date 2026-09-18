import { describe, it, expect } from 'vitest';
import { generateDemandLetter } from '../../src/legal/demandLetter';
import { analyzePaystubText } from '../../src/legal/parser';
import { SAMPLE_PAYSTUBS } from '../../src/legal/samplePaystubs';

describe('Demand Letter Generator', () => {
  it('generates a formal notice of wage claim citing FLSA 29 U.S.C. § 216(b)', () => {
    const sample = SAMPLE_PAYSTUBS[0]; // Misclassified salaried assistant manager
    const analysis = analyzePaystubText(sample.text, 'CA');

    const letter = generateDemandLetter(
      {
        workerName: 'Alex Morgan',
        workerAddress: '123 Main St, Los Angeles, CA 90001',
        workerPhoneEmail: 'alex@example.com',
        employerName: 'Retail Corp',
        employerAddress: '456 Business Blvd, Los Angeles, CA 90012',
        jobTitle: 'Assistant Shift Leader',
        startDate: 'January 2026',
        endDate: 'Present',
        stateCode: 'CA',
        unpaidOvertimeAmount: '$4,250.00',
        unlawfulDeductionAmount: '$0.00',
        demandedRemedy: 'Full Back Pay + 100% Liquidated Damages',
      },
      analysis
    );

    expect(letter).toContain('FORMAL NOTICE OF WAGE CLAIM & DEMAND FOR STATUTORY REMEDY');
    expect(letter).toContain('29 U.S.C. § 216(b)');
    expect(letter).toContain('Alex Morgan');
    expect(letter).toContain('Retail Corp');
    expect(letter).toContain('$4,250.00');
    expect(letter).toContain('California');
  });

  it('includes Massachusetts treble damages citations when state is MA', () => {
    const sample = SAMPLE_PAYSTUBS[1]; // Illegal deductions
    const analysis = analyzePaystubText(sample.text, 'MA');

    const letter = generateDemandLetter(
      {
        workerName: 'Jordan Smith',
        workerAddress: '10 Beacon St, Boston, MA 02108',
        workerPhoneEmail: 'jordan@example.com',
        employerName: 'QuickBite Diner LLC',
        employerAddress: '20 Boylston St, Boston, MA 02116',
        jobTitle: 'Cashier / Line Server',
        startDate: 'August 2026',
        endDate: 'Present',
        stateCode: 'MA',
        unpaidOvertimeAmount: '$0.00',
        unlawfulDeductionAmount: '$125.00',
        demandedRemedy: 'Reimbursement of Illegal Deductions',
      },
      analysis
    );

    expect(letter).toContain('M.G.L. c. 149');
    expect(letter).toContain('Massachusetts');
  });
});
