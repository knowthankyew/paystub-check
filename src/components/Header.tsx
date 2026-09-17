import React from 'react';
import { DollarSign, Lock, FileText, ChevronDown } from 'lucide-react';
import { SAMPLE_PAYSTUBS } from '../legal/samplePaystubs';
import { SamplePaystub } from '../legal/types';

interface HeaderProps {
  onSelectSample: (sample: SamplePaystub) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSelectSample, onReset }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Slogan */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <DollarSign className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                PaystubCheck
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                MIT Public Good
              </span>
            </div>
            <p className="text-xs text-slate-400">
              FLSA overtime, withholding math & state wage law reality check
            </p>
          </div>
        </div>

        {/* Badges & Sample Presets Dropdown */}
        <div className="flex items-center flex-wrap justify-center gap-3">
          
          {/* Privacy Pill */}
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-slate-950/80 px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-inner">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">100% Offline & Private</span>
          </div>

          {/* Preset Paystubs Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 rounded-lg border border-slate-700 transition-all shadow-sm">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Load Sample Pay Stub</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute right-0 mt-1 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Test Preset
              </div>
              {SAMPLE_PAYSTUBS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors group/item"
                >
                  <div className="text-xs font-semibold text-slate-200 group-hover/item:text-emerald-400">
                    {sample.title}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">
                    {sample.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
