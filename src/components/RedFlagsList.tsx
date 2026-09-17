import React from 'react';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, ShieldOff, Lightbulb, Gavel } from 'lucide-react';
import { WageRedFlag } from '../legal/types';

interface RedFlagsListProps {
  redFlags: WageRedFlag[];
}

export const RedFlagsList: React.FC<RedFlagsListProps> = ({ redFlags }) => {
  if (redFlags.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-200">No Unlawful Wage Issues Detected</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          The text provided does not contain obvious statutory violations under federal FLSA provisions (29 U.S.C. § 207/213) or state wage laws.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30">
            <ShieldOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Red Flags & Unlawful Wage Practices
            </h3>
            <p className="text-xs text-slate-400">
              Flagged for potential statutory unenforceability under DOL rules and labor statutes
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
          {redFlags.length} Issue(s) Flagged
        </span>
      </div>

      <div className="space-y-4">
        {redFlags.map((flag) => {
          let badgeBg = 'bg-red-500/10 text-red-400 border-red-500/30';
          let icon = <AlertOctagon className="w-4 h-4 text-red-400" />;

          if (flag.severity === 'misclassification') {
            badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
          } else if (flag.severity === 'caution') {
            badgeBg = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            icon = <Info className="w-4 h-4 text-yellow-400" />;
          }

          return (
            <div
              key={flag.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition-colors"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  {icon}
                  <h4 className="text-sm font-bold text-slate-100">{flag.title}</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${badgeBg}`}>
                    {flag.enforceability}
                  </span>
                </div>
              </div>

              {/* Quoted Text */}
              <div className="bg-slate-900 border-l-4 border-rose-500 p-3 rounded-r-lg text-xs font-mono text-slate-300 italic">
                "{flag.quote}"
              </div>

              {/* Statute Reference */}
              <div className="flex items-center space-x-1.5 text-xs text-teal-400 font-medium">
                <Gavel className="w-3.5 h-3.5 text-teal-400" />
                <span>Statutory Authority: {flag.statute}</span>
              </div>

              {/* Explanation & Advice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-200 block mb-1">Why This Violates Wage Laws:</span>
                  <p className="text-slate-400 leading-relaxed">{flag.explanation}</p>
                </div>
                <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/20">
                  <span className="font-semibold text-emerald-400 block mb-1 flex items-center space-x-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Worker Action Strategy:</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed">{flag.workerAdvice}</p>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
