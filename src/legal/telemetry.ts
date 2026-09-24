/**
 * PaystubCheck Telemetry Adapter
 * Powered by @knowthankyew/privacy-telemetry
 * 
 * Invariants:
 * 1. Default mode is 'memory_only' with MemoryExporter. Zero network egress.
 * 2. Raw document/wage bodies, employee names, or PII payloads are strictly forbidden from attributes.
 * 3. "Burn Local Data" purges all buffered spans and audit events, resetting telemetry.
 * 4. Honest privacy audit affordance: never reports "local-only" if an OTLP exporter is active.
 */

import {
  TelemetryManager as BaseTelemetryManager,
  MemoryExporter,
  TelemetryMode,
  EgressPolicy,
  TelemetryConfig,
  SpanRecord,
  SessionAuditEvent,
  PrivacyAuditReport,
  PrivacyClaims,
  DEFAULT_SAFE_ALLOWLIST_KEYS,
} from '@knowthankyew/privacy-telemetry';

export type {
  TelemetryMode,
  EgressPolicy,
  TelemetryConfig,
  SpanRecord,
  SessionAuditEvent,
  PrivacyAuditReport,
  PrivacyClaims,
};

export { MemoryExporter };

// Domain-specific operational attributes for PaystubCheck (sensitive wages/deductions strictly excluded)
export const PAYSTUB_ALLOWLIST_KEYS: ReadonlySet<string> = new Set([
  'state',
  'overtime_hours',
  'regular_hours',
  'redflag_count',
  'is_compliant',
  'parsed_line_count',
  'ocr_used',
  'has_overtime',
  'has_deductions',
]);

export const SAFE_ALLOWLIST_KEYS: ReadonlySet<string> = new Set([
  ...DEFAULT_SAFE_ALLOWLIST_KEYS,
  ...PAYSTUB_ALLOWLIST_KEYS,
]);

export function getPrivacyClaims(report: PrivacyAuditReport): PrivacyClaims {
  if (report.isLocalOnlyHonest) {
    return {
      isLocalOnlyHonest: true,
      isEnterpriseBuild: false,
      appTitleSuffix: '',
      badgeLabel: 'Zero Wage Data Network • Memory-Only',
      dropzoneNotice: '100% Client-Side Local Execution • Zero Network Transmission',
      disclaimerExecutionText:
        'All wage calculations execute 100% locally in your browser with zero remote network transmission.',
      footerTitle: '100% Local Air-Gapped Wage Statement & FLSA Audit Engine.',
      footerSubtext:
        'Zero Telemetry • Zero Remote Wage Data Egress • FLSA & State Wage Reality Engine',
      modalStatusTitle: '100% Local-First & Private (Memory-Only Telemetry)',
      modalStatusDescription:
        'All computation and telemetry spans remain buffered strictly in volatile memory. No outbound network calls are made. Telemetry purges immediately upon invoking "Burn Local Data".',
      otlpEndpoint: null,
    };
  }

  return {
    isLocalOnlyHonest: false,
    isEnterpriseBuild: true,
    appTitleSuffix: ' (Enterprise Build)',
    badgeLabel: `OTLP Active (${report.telemetryMode})`,
    dropzoneNotice: 'Local Paystub Parsing • OTLP Operational Metadata Active (Strictly Redacted)',
    disclaimerExecutionText: `Wage calculations execute in-browser. Scrubbed operational telemetry is exported to configured OTLP endpoint (${report.otlpEndpoint}). Employee names, wage slips, and pay figures are never transmitted.`,
    footerTitle: 'Enterprise Wage Statement & FLSA Audit Engine (OTLP Telemetry Active).',
    footerSubtext:
      'Enterprise Telemetry Mode • Operational Metadata Export Active • Paystubs Air-Gapped',
    modalStatusTitle: 'Enterprise OTLP Telemetry Active',
    modalStatusDescription: `Telemetry spans are exported to configured OTLP endpoint: ${report.otlpEndpoint}. Employee identifiers and salary details are redacted via strict allowlist.`,
    otlpEndpoint: report.otlpEndpoint,
  };
}

export class TelemetryManager extends BaseTelemetryManager {
  constructor(customConfig?: Partial<TelemetryConfig>) {
    super(
      { serviceName: 'paystub-check', ...customConfig },
      PAYSTUB_ALLOWLIST_KEYS
    );
  }

  public override getPrivacyClaims(): PrivacyClaims {
    return getPrivacyClaims(this.getPrivacyAuditReport());
  }
}

export const telemetry = new TelemetryManager();
