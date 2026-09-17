import React, { useState } from 'react';
import { FileSignature, Copy, Check, Printer, AlertCircle } from 'lucide-react';
import { LegalAnalysisResult, DemandLetterData } from '../legal/types';
import { generateDemandLetter } from '../legal/demandLetter';

interface DemandLetterGeneratorProps {
  analysis: LegalAnalysisResult;
}

export const DemandLetterGenerator: React.FC<DemandLetterGeneratorProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<DemandLetterData>({
    workerName: '',
    workerAddress: '',
    workerPhoneEmail: '',
    employerName: '',
    employerAddress: '',
    jobTitle: '',
    startDate: '',
    endDate: 'Present',
    stateCode: analysis.stateCode,
    unpaidOvertimeAmount: '',
    unlawfulDeductionAmount: '',
    demandedRemedy: 'Full Back Pay + 100% Liquidated Damages'
  });

  const letterText = generateDemandLetter(formData, analysis);

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Escape HTML entities to prevent script injection in print window context
      const safeText = letterText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Formal Statutory Wage Claim Demand Notice</title>
            <style>
              body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 1in; color: #000; }
              pre { font-family: inherit; white-space: pre-wrap; word-wrap: break-word; }
            </style>
          </head>
          <body>
            <pre>${safeText}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Educational UPL Legal Disclaimer Banner */}
      <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-xl flex items-start space-x-3 text-xs text-amber-200">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-400 block mb-0.5">Educational Self-Help Template Notice</span>
          PaystubCheck is an automated educational tool built as a local-first public good. It is not an attorney, law firm, or substitute for legal counsel. This wage claim demand letter is a self-help document template. Please review and verify all details and applicable state/federal labor laws independently before sending.
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <FileSignature className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Statutory Wage Dispute Demand Letter Generator
            </h3>
            <p className="text-xs text-slate-400">
              Draft formal demand notice citing FLSA 29 U.S.C. § 216(b) & {analysis.stateRuleInfo.stateName} Laws
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Copied!' : 'Copy Letter'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3.5 py-2 rounded-lg transition-colors font-bold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Input Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        {/* Worker Info */}
        <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] text-teal-400">
            Worker Information
          </div>
          
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Your Full Name</label>
            <input
              type="text"
              placeholder="e.g. Alex Rivera"
              value={formData.workerName}
              onChange={(e) => setFormData({ ...formData, workerName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Street Address, City, State ZIP</label>
            <input
              type="text"
              placeholder="e.g. 742 Evergreen Terr, Springfield, IL 62704"
              value={formData.workerAddress}
              onChange={(e) => setFormData({ ...formData, workerAddress: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Phone Number & Email</label>
            <input
              type="text"
              placeholder="e.g. (555) 019-2831 / alex@example.com"
              value={formData.workerPhoneEmail}
              onChange={(e) => setFormData({ ...formData, workerPhoneEmail: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Employer Info */}
        <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] text-cyan-400">
            Employer / Payroll Department Information
          </div>
          
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Employer Company Name</label>
            <input
              type="text"
              placeholder="e.g. Apex Logistics LLC"
              value={formData.employerName}
              onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Employer Address</label>
            <input
              type="text"
              placeholder="e.g. 500 Corporate Blvd, Chicago, IL 60601"
              value={formData.employerAddress}
              onChange={(e) => setFormData({ ...formData, employerAddress: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Assistant Shift Leader"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Start / End Dates</label>
              <input
                type="text"
                placeholder="e.g. Jan 2024 to Present"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Claim Amounts & Demanded Remedy */}
        <div className="md:col-span-2 space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] text-emerald-400">
            Wage Claim Amounts & Demanded Statutory Remedy
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Unpaid Overtime Amount</label>
              <input
                type="text"
                placeholder="e.g. $2,450.00 or 'To Be Audited'"
                value={formData.unpaidOvertimeAmount}
                onChange={(e) => setFormData({ ...formData, unpaidOvertimeAmount: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Illegal Deductions Refund</label>
              <input
                type="text"
                placeholder="e.g. $125.00 (Uniform & Shortage)"
                value={formData.unlawfulDeductionAmount}
                onChange={(e) => setFormData({ ...formData, unlawfulDeductionAmount: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Demanded Remedy</label>
              <select
                value={formData.demandedRemedy}
                onChange={(e) => setFormData({ ...formData, demandedRemedy: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Full Back Pay + 100% Liquidated Damages">Demand: Full Back Pay + 100% Liquidated Double Damages</option>
                <option value="Reimbursement of Illegal Deductions">Demand: Full Reimbursement of Unlawful Deductions</option>
                <option value="Reclassification to Non-Exempt + Overtime">Demand: Reclassification to Non-Exempt + Back Overtime</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Live Letter Preview */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Generated Statutory Demand Letter Preview
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto selection:bg-teal-500 selection:text-slate-950">
          {letterText}
        </div>
      </div>

    </div>
  );
};
