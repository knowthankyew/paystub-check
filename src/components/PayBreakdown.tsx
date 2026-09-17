import React from 'react';
import { DollarSign, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { LegalAnalysisResult } from '../legal/types';

interface PayBreakdownProps {
  analysis: LegalAnalysisResult;
}

export const PayBreakdown: React.FC<PayBreakdownProps> = ({ analysis }) => {
  const { extractedPay, deductionsList, flsaCompliance } = analysis;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Pay & Deductions Reality Audit
          </h3>
          <p className="text-xs text-slate-400">
            Itemized breakdown of earnings, statutory taxes, and line-item payroll deductions
          </p>
        </div>
      </div>

      {/* Numerical Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Gross Pay</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            ${extractedPay.grossPay > 0 ? extractedPay.grossPay.toFixed(2) : 'Unspecified'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Frequency: {extractedPay.payFrequency}</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Regular Rate of Pay</div>
          <div className="text-lg font-bold text-slate-100 mt-1">
            {extractedPay.hourlyRate ? `$${extractedPay.hourlyRate.toFixed(2)}/hr` : 'Salary Basis'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Hours: {extractedPay.hoursWorked || 'N/A'}</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Overtime Hours</div>
          <div className={`text-lg font-bold mt-1 ${flsaCompliance.hasOvertimeViolation ? 'text-red-400' : 'text-slate-100'}`}>
            {extractedPay.overtimeHours ? `${extractedPay.overtimeHours} hrs` : '0 hrs'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {flsaCompliance.hasOvertimeViolation ? '⚠️ Missing 1.5x Pay' : '1.5x Multiplier'}
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Net Take-Home Pay</div>
          <div className="text-lg font-bold text-teal-400 mt-1">
            ${extractedPay.netPay > 0 ? extractedPay.netPay.toFixed(2) : 'Unspecified'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">After all withholdings</div>
        </div>

      </div>

      {/* Deductions Itemized Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Detected Payroll Deductions & Withholdings
        </h4>

        {deductionsList.length === 0 ? (
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 italic">
            No specific line-item deductions were parsed from the input text.
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
            {deductionsList.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  {item.isIllegalDeduction ? (
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  ) : item.isStatutoryTax ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  ) : (
                    <DollarSign className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    {item.explanation && (
                      <p className="text-[11px] text-red-400 mt-0.5">{item.explanation}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-mono font-bold ${item.isIllegalDeduction ? 'text-red-400' : 'text-slate-200'}`}>
                    -${item.amount.toFixed(2)}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {item.isIllegalDeduction ? 'Unlawful Charge' : item.isStatutoryTax ? 'Statutory Tax' : 'Deduction'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
