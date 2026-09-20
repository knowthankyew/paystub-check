import React from 'react';
import { X, Shield, Activity, Download, Flame, Database, Radio, CheckCircle, AlertTriangle } from 'lucide-react';
import { telemetry, PrivacyAuditReport, SessionAuditEvent } from '../legal/telemetry';

interface PrivacyAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBurnData: () => void;
}

export const PrivacyAuditModal: React.FC<PrivacyAuditModalProps> = ({
  isOpen,
  onClose,
  onBurnData,
}) => {
  if (!isOpen) return null;

  const report: PrivacyAuditReport = telemetry.getPrivacyAuditReport();
  const claims = telemetry.getPrivacyClaims();
  const auditLogs: readonly SessionAuditEvent[] = telemetry.getAuditLog();

  const handleDownloadAudit = () => {
    const jsonStr = telemetry.downloadSessionAuditJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paystub-check-session-audit-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                claims.isLocalOnlyHonest ? 'bg-emerald-600' : 'bg-amber-600'
              }`}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 id="privacy-modal-title" className="text-base font-bold text-slate-100">
                {claims.isEnterpriseBuild ? 'Enterprise Telemetry Verification' : 'Privacy & Telemetry Verification'}
              </h2>
              <p className="text-xs text-slate-400">
                Inspect real-time telemetry state, data retention, and session audit trails
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Real-time Status Card */}
          <div
            className={`p-4 rounded-xl border ${
              claims.isLocalOnlyHonest
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              {claims.isLocalOnlyHonest ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <strong className="text-emerald-400 font-semibold">{claims.modalStatusTitle}</strong>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <strong className="text-amber-400 font-semibold">{claims.modalStatusTitle}</strong>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {claims.modalStatusDescription}
            </p>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Observability</span>
              </div>
              <div className="font-mono text-xs font-semibold text-slate-200 uppercase">
                <code>{report.telemetryMode}</code>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                <Radio className="w-3.5 h-3.5" />
                <span>Network Egress</span>
              </div>
              <div className="font-mono text-xs font-semibold text-slate-200 uppercase">
                <code>{report.networkEgress}</code>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                <Database className="w-3.5 h-3.5" />
                <span>Buffered Spans</span>
              </div>
              <div className="text-xs font-semibold text-slate-200">
                {report.activeSpanCount} in memory
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Burn Storage</span>
              </div>
              <div className={`text-xs font-semibold ${report.burnEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                {report.burnEnabled ? 'Enabled (Purge)' : 'Disabled'}
              </div>
            </div>
          </div>

          {/* Session Audit Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  In-Memory Session Audit Trail ({auditLogs.length} events)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Append-only activity verification. Does not contain raw paystub texts or wage numbers.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadAudit}
                disabled={auditLogs.length === 0}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download session audit log as JSON"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download JSON</span>
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
              {auditLogs.length === 0 ? (
                <div className="p-4 text-center text-slate-500 font-sans text-xs">
                  No audit events recorded in this session yet.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="p-2">Time</th>
                      <th className="p-2">Action</th>
                      <th className="p-2">Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/50">
                        <td className="p-2 text-slate-400 whitespace-nowrap text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-2 text-slate-200 font-sans text-xs">{log.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/40">
          <button
            type="button"
            onClick={() => {
              onBurnData();
              onClose();
            }}
            className="flex items-center space-x-1.5 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 px-3.5 py-2 rounded-xl border border-rose-800/40 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Burn All Local Data & Telemetry</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
