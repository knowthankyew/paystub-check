import React, { useState } from 'react';
import { Download, FileText, Check, Printer, X } from 'lucide-react';
import { LegalAnalysisResult } from '../legal/types';

interface ExportModalProps {
  analysis: LegalAnalysisResult;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ analysis, onClose }) => {
  const [downloaded, setDownloaded] = useState(false);

  const generateMarkdownReport = (): string => {
    return `# PaystubCheck Reality Audit Report

**Date of Analysis**: ${new Date().toLocaleDateString()}
**Document Type**: ${analysis.documentType}
**State Jurisdiction**: ${analysis.stateRuleInfo.stateName} (${analysis.stateCode})
**Wage Compliance Score**: ${analysis.complianceScore} / 100
**Classification Type**: ${analysis.classificationType}
**Calculated Annual Salary**: $${analysis.extractedPay.calculatedAnnualSalary.toLocaleString()}

---

## Executive Summary
${analysis.summary}

---

## Flagged Wage Red Flags & Statutory Violations (${analysis.redFlags.length})
${analysis.redFlags.length === 0 ? '_No obvious statutory wage violations detected._' : ''}
${analysis.redFlags.map((rf, idx) => `
### ${idx + 1}. ${rf.title}
- **Quoted Line**: "${rf.quote}"
- **Statutory Authority**: ${rf.statute}
- **Legal Enforceability Status**: ${rf.enforceability}
- **Why It Violates Wage Laws**: ${rf.explanation}
- **Worker Action Strategy**: ${rf.workerAdvice}
`).join('\n')}

---

## State Wage & Hour Statutory Protections (${analysis.stateRuleInfo.stateName})
- **Statute Reference**: ${analysis.stateRuleInfo.statuteRef}
- **State Minimum Wage**: $${analysis.stateRuleInfo.minimumWageRate.toFixed(2)} / hr
- **Daily Overtime Threshold**: ${analysis.stateRuleInfo.dailyOvertimeThreshold ? `${analysis.stateRuleInfo.dailyOvertimeThreshold} hrs/day` : 'Standard 40-hr weekly rule'}
- **Statutory Damages / Penalties**: ${analysis.stateRuleInfo.statutoryDamagesMultiplier || (analysis.stateRuleInfo.waitingTimePenaltyDays ? `${analysis.stateRuleInfo.waitingTimePenaltyDays}-Day Waiting Time Penalty` : '100% Liquidated Double Damages')}

---

## FLSA Compliance Checklist
- **29 U.S.C. § 207 Overtime**: ${analysis.flsaCompliance.hasOvertimeViolation ? 'NON-COMPLIANT (Overtime multiplier missing)' : 'COMPLIANT'}
- **29 C.F.R. § 531.35 Deductions**: ${analysis.flsaCompliance.hasIllegalShortageDeduction ? 'NON-COMPLIANT (Unlawful till/uniform deduction found)' : 'COMPLIANT'}
- **29 U.S.C. § 213 Exemption Salary Threshold**: ${analysis.flsaCompliance.isExemptThresholdMet ? 'EXCEEDS $43,888/yr threshold' : 'BELOW $43,888/yr FLSA threshold'}

---
*Generated 100% locally with PaystubCheck (MIT Public Good - Knowthankyew Privacy Architecture).*
`;
  };

  const handleDownloadMarkdown = () => {
    const mdContent = generateMarkdownReport();
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `paystub_check_report_${analysis.stateCode}_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">Export Analysis Report</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Export your complete plain-English wage reality report, FLSA red flags, state wage laws, and deduction itemization locally.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleDownloadMarkdown}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-200">Download Markdown (.md)</div>
                <div className="text-[11px] text-slate-400">Clean markdown format for records</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400">Save File</span>
          </button>

          <button
            onClick={() => { window.print(); onClose(); }}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                <Printer className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-200">Print / Save PDF</div>
                <div className="text-[11px] text-slate-400">Use browser print dialog to print or export PDF</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-cyan-400">Print / PDF</span>
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
