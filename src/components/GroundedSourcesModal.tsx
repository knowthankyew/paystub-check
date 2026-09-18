import React, { useEffect } from 'react';
import { X, Scale } from 'lucide-react';
import { STATE_WAGE_LAWS } from '../legal/stateWageLaws';
import { FLSA_BINDING_FEDERAL_SALARY_THRESHOLD } from '../legal/flsa';

interface GroundedSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedState: string;
}

export const GroundedSourcesModal: React.FC<GroundedSourcesModalProps> = ({
  isOpen,
  onClose,
  selectedState,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentState = STATE_WAGE_LAWS[selectedState] || STATE_WAGE_LAWS.CA;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Grounded Statutory Canon</span>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  2026 Verified
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official federal statutes and state labor codes enforced by PaystubCheck
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Active State Source */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                  {currentState.stateCode} ACTIVE JURISDICTION
                </span>
                <h3 className="font-bold text-slate-100">{currentState.stateName} Wage & Hour Protections</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                Min: ${currentState.minimumWageRate.toFixed(2)}/hr
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">{currentState.statuteRef}</p>
            <div className="text-xs text-slate-300 space-y-1.5 pt-1 border-t border-emerald-500/20">
              {currentState.specialRules.map((rule, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Federal Authorities */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Federal Statutory Baselines (FLSA)
            </h3>

            {/* FLSA Salary Basis & Overtime */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-200">
                  FLSA Exemption Salary Floor & Overtime Mandate
                </h4>
                <span className="text-xs font-mono text-teal-400">29 U.S.C. §§ 207, 213(a)(1)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Requires 1.5x regular rate for hours worked over 40/week for all non-exempt employees. Following the nationwide vacatur of the DOL 2024 rule (<em>Texas v. DOL</em>, Nov 2024; formally rescinded May 2026), the binding federal salary floor is <strong>${FLSA_BINDING_FEDERAL_SALARY_THRESHOLD.toLocaleString()}/year ($684/week)</strong>. Higher state thresholds (CA ${STATE_WAGE_LAWS.CA.exemptionSalaryThreshold?.toLocaleString()}/yr, WA ${STATE_WAGE_LAWS.WA.exemptionSalaryThreshold?.toLocaleString()}/yr, NY ${STATE_WAGE_LAWS.NY.exemptionSalaryThreshold?.toLocaleString()}/yr) supersede the federal floor.
              </p>
            </div>

            {/* Free and Clear Rule */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-200">
                  "Free and Clear" Wage Payment & Illegal Deductions
                </h4>
                <span className="text-xs font-mono text-teal-400">29 C.F.R. § 531.35</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Wages must be paid finally and unconditionally, "free and clear" of any kickbacks or unauthorized deductions. Deducting register shortages, equipment fees, or uniform laundry costs is unlawful whenever it cuts into minimum wage or overtime, and strictly barred outright in states like CA (Cal. Lab. Code § 221), NY (Lab. Law § 193), and MA (M.G.L. c. 149 § 150).
              </p>
            </div>

            {/* Liquidated Damages & Civil Remedies */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-200">
                  100% Mandatory Liquidated Damages & Attorney Fees
                </h4>
                <span className="text-xs font-mono text-teal-400">29 U.S.C. § 216(b)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Any employer violating minimum wage or overtime requirements is liable for 100% liquidated damages (double damages), mandatory reasonable attorney fees, and litigation costs. In Massachusetts, M.G.L. c. 149 §§ 148, 150 mandates automatic treble damages (3x).
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
