import React from 'react';
import { MapPin, Award, CheckCircle } from 'lucide-react';
import { StateWageRule } from '../legal/types';

interface StateWageCardProps {
  stateRule: StateWageRule;
}

export const StateWageCard: React.FC<StateWageCardProps> = ({ stateRule }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              {stateRule.stateName} State Wage & Hour Statutory Protections
            </h3>
            <p className="text-xs text-slate-400">
              Statutory authority: <span className="text-teal-400 font-mono">{stateRule.statuteRef}</span>
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30">
          {stateRule.stateCode} Jurisdiction Rules
        </span>
      </div>

      {/* Statutory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">State Minimum Wage</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            ${stateRule.minimumWageRate.toFixed(2)} / hr
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Statutory minimum hourly rate</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Exempt Salary Basis</div>
          <div className="text-lg font-bold text-amber-400 mt-1">
            ${stateRule.exemptionSalaryThreshold ? stateRule.exemptionSalaryThreshold.toLocaleString() : "35,568"}/yr
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Required to qualify for overtime exemption</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Daily Overtime Rule</div>
          <div className="text-lg font-bold text-slate-100 mt-1">
            {stateRule.dailyOvertimeThreshold ? `${stateRule.dailyOvertimeThreshold} Hours/Day` : 'No Daily OT'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stateRule.dailyOvertimeThreshold ? `1.5x after ${stateRule.dailyOvertimeThreshold} hours in a day` : 'Standard 40-hour weekly rule'}
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Statutory Penalties</div>
          <div className="text-sm font-bold text-cyan-400 mt-1">
            {stateRule.statutoryDamagesMultiplier || (stateRule.waitingTimePenaltyDays ? `${stateRule.waitingTimePenaltyDays}-Day Penalty` : '100% Liquidated')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Statutory damages for unpaid wages</p>
        </div>

      </div>

      {/* Special State Rules */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="font-semibold text-slate-200 text-xs flex items-center space-x-1.5">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Key {stateRule.stateName} Wage & Hour Mandates</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {stateRule.specialRules.map((rule, idx) => (
            <li key={idx} className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};
