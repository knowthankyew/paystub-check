import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Loader2, MapPin } from 'lucide-react';
import { ALL_US_STATES } from '../legal/stateWageLaws';
import { performClientSideOCR, OCRProgress } from '../legal/ocr';

interface PaystubInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  onAnalyze: () => void;
}

export const PaystubInput: React.FC<PaystubInputProps> = ({
  inputText,
  setInputText,
  selectedState,
  setSelectedState,
  onAnalyze
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<OCRProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
      setOcrLoading(true);
      setOcrStatus({ status: 'Starting client-side WASM OCR...', progress: 0.1 });
      try {
        const text = await performClientSideOCR(file, (p) => setOcrStatus(p));
        if (text && text.trim().length > 0) {
          setInputText(text);
        } else {
          alert('Could not extract legible text from image. Please try another image scan or paste pay stub text manually.');
        }
      } catch (err) {
        alert('OCR error: ' + (err instanceof Error ? err.message : 'Failed to scan image.'));
      } finally {
        setOcrLoading(false);
        setOcrStatus(null);
      }
    } else if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) setInputText(content);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a text file (.txt, .md) or image photo (.png, .jpg, .webp) of your pay stub or offer letter.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-5">
      
      {/* Selector Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* State Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>US State Jurisdiction (Wage Laws & Minimum Wage)</span>
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-teal-500 transition-colors"
          >
            {ALL_US_STATES.map((st) => (
              <option key={st.code} value={st.code}>
                {st.name} ({st.code})
              </option>
            ))}
          </select>
        </div>

        {/* Info Pill */}
        <div className="flex items-center text-xs text-slate-400 bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
          <span>Analyzes FLSA 29 U.S.C. § 207 overtime, § 213(a)(1) salary thresholds, 29 C.F.R. § 531.35 deductions, and state rules.</span>
        </div>

      </div>

      {/* Main Text Area & Drop Zone */}
      <div className="relative">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative rounded-xl transition-all border-2 ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-950/20'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950'
          }`}
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste pay stub text, offer letter, or wage statement here... Or drag & drop a file / photo of your pay stub!"
            rows={9}
            className="w-full bg-transparent text-slate-100 text-sm p-4 focus:outline-none resize-y placeholder-slate-500 font-mono leading-relaxed"
          />

          {/* OCR Progress Banner */}
          {ocrLoading && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <div className="text-sm font-medium text-slate-200">{ocrStatus?.status || 'Processing image...'}</div>
              <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${Math.round((ocrStatus?.progress || 0) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">100% Client-Side WebAssembly Tesseract OCR</p>
            </div>
          )}

          {/* Floating Actions */}
          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,text/*,.txt,.md"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              title="Upload text file or photo of pay stub"
            >
              <Upload className="w-3.5 h-3.5 text-teal-400" />
              <span>Upload Photo / File</span>
            </button>

            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-slate-400 hidden sm:block">
          All analysis runs 100% locally in your web browser. Zero server uploads.
        </p>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={!inputText.trim()}
          className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
            inputText.trim()
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 hover:shadow-emerald-500/25 hover:scale-[1.02] cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Analyze Pay Stub Reality Check</span>
        </button>
      </div>

    </div>
  );
};
