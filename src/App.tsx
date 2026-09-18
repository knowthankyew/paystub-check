import { useState } from 'react';
import { Header } from './components/Header';
import { PaystubInput } from './components/PaystubInput';
import { ComplianceSummary } from './components/ComplianceSummary';
import { RedFlagsList } from './components/RedFlagsList';
import { PayBreakdown } from './components/PayBreakdown';
import { StateWageCard } from './components/StateWageCard';
import { DemandLetterGenerator } from './components/DemandLetterGenerator';
import { ExportModal } from './components/ExportModal';
import { GroundedSourcesModal } from './components/GroundedSourcesModal';
import { analyzePaystubText } from './legal/parser';
import { SamplePaystub, LegalAnalysisResult } from './legal/types';
import { SAMPLE_PAYSTUBS } from './legal/samplePaystubs';
import { DollarSign, Download, Lock } from 'lucide-react';

export function App() {
  const [inputText, setInputText] = useState<string>(SAMPLE_PAYSTUBS[0].text);
  const [selectedState, setSelectedState] = useState<string>('CA');
  const [analysisResult, setAnalysisResult] = useState<LegalAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'redflags' | 'breakdown' | 'statewage' | 'demand'>('overview');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showSourcesModal, setShowSourcesModal] = useState<boolean>(false);

  // Trigger Legal Analysis
  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    const result = analyzePaystubText(inputText, selectedState);
    setAnalysisResult(result);
    setActiveTab('overview');
  };

  // Handle Preset Loading
  const handleSelectSample = (sample: SamplePaystub) => {
    setInputText(sample.text);
    const result = analyzePaystubText(sample.text, selectedState);
    setAnalysisResult(result);
    setActiveTab('overview');
  };

  // State Change update
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    if (inputText.trim()) {
      const result = analyzePaystubText(inputText, newState);
      setAnalysisResult(result);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setInputText('');
  };

  const handleBurnData = () => {
    setAnalysisResult(null);
    setInputText('');
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Header Navigation */}
      <Header
        onSelectSample={handleSelectSample}
        onReset={handleReset}
        onOpenSources={() => setShowSourcesModal(true)}
        onBurnData={handleBurnData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Input Section */}
        <section>
          <PaystubInput
            inputText={inputText}
            setInputText={setInputText}
            selectedState={selectedState}
            setSelectedState={handleStateChange}
            onAnalyze={handleAnalyze}
          />
        </section>

        {/* Results Section */}
        {analysisResult && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Nav Tabs Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  Overview & Reality Rating
                </button>

                <button
                  onClick={() => setActiveTab('redflags')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                    activeTab === 'redflags'
                      ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span>Red Flags</span>
                  {analysisResult.redFlags.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-950/40 text-[10px]">
                      {analysisResult.redFlags.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('breakdown')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'breakdown'
                      ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  Pay & Deductions Audit
                </button>

                <button
                  onClick={() => setActiveTab('statewage')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'statewage'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {analysisResult.stateRuleInfo.stateName} Wage Laws
                </button>

                <button
                  onClick={() => setActiveTab('demand')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'demand'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  Draft Demand Letter
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center space-x-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 px-3.5 py-2 rounded-xl border border-slate-800 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>

            {/* Tab Views */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <ComplianceSummary result={analysisResult} />
                <RedFlagsList redFlags={analysisResult.redFlags} />
                <PayBreakdown analysis={analysisResult} />
              </div>
            )}

            {activeTab === 'redflags' && (
              <RedFlagsList redFlags={analysisResult.redFlags} />
            )}

            {activeTab === 'breakdown' && (
              <PayBreakdown analysis={analysisResult} />
            )}

            {activeTab === 'statewage' && (
              <StateWageCard stateRule={analysisResult.stateRuleInfo} />
            )}

            {activeTab === 'demand' && (
              <DemandLetterGenerator analysis={analysisResult} />
            )}

          </section>
        )}

      </main>

      {/* Export Modal */}
      {showExportModal && analysisResult && (
        <ExportModal analysis={analysisResult} onClose={() => setShowExportModal(false)} />
      )}

      {/* Grounded Sources Modal */}
      <GroundedSourcesModal
        isOpen={showSourcesModal}
        onClose={() => setShowSourcesModal(false)}
        selectedState={selectedState}
      />

      {/* Footer with UPL Disclaimer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 leading-relaxed text-center sm:text-left">
            <strong className="text-slate-300 font-semibold">Legal Disclaimer:</strong> PaystubCheck is an automated informational and educational tool built as a local-first public good. It is not an attorney, law firm, or substitute for professional legal counsel. Use of this application does not establish an attorney-client relationship. Generated dispute letters, tax checks, and wage breakdowns are self-help reference templates.
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-300">PaystubCheck</span>
              <span>— Free Public Good (MIT License)</span>
            </div>

            <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
              <span className="flex items-center space-x-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>100% Client-Side Execution</span>
              </span>
              <span>•</span>
              <span>Zero Network Telemetry</span>
              <span>•</span>
              <span>FLSA 29 U.S.C. § 201</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
