import { describe, it, expect, beforeEach } from 'vitest';
import { TelemetryManager } from '../../src/legal/telemetry';

describe('PaystubCheck TelemetryManager & Privacy Invariants', () => {
  let tm: TelemetryManager;

  beforeEach(() => {
    tm = new TelemetryManager({
      mode: 'memory_only',
      otlpEndpoint: null,
      burnEnabled: true,
      allowRawPayloads: false,
      auditDurable: false,
      networkEgress: 'deny',
    });
  });

  it('initializes in memory_only mode with zero network egress', () => {
    const report = tm.getPrivacyAuditReport();
    expect(report.telemetryMode).toBe('memory_only');
    expect(report.networkEgress).toBe('deny');
    expect(report.otlpEndpoint).toBeNull();
    expect(report.isLocalOnlyHonest).toBe(true);
    expect(report.activeSpanCount).toBe(0);
  });

  it('records spans in MemoryExporter and calculates duration', () => {
    const span = tm.startSpan('analyze_paystub', { state: 'CA' });
    span.end('OK', { duration_ms: 18 });

    const spans = tm.getMemorySpans();
    expect(spans).toHaveLength(1);
    expect(spans[0].name).toBe('analyze_paystub');
    expect(spans[0].status).toBe('OK');
    expect(spans[0].attributes.state).toBe('CA');
  });

  it('strictly redacts any attribute not registered in the safe allowlist', () => {
    const span = tm.startSpan('parse_paystub', {
      state: 'NY',
      employee_name: 'John Smith',
      ssn: '123-45-6789',
      paystub_text: 'Confidential Wage Slip for Acme Corp',
      matchedText: 'short 40 char snippet of wage data',
      gross_pay: 3500,
      net_pay: 2600,
    });
    span.end('OK');

    const spans = tm.getMemorySpans();
    expect(spans).toHaveLength(1);
    const attrs = spans[0].attributes;

    // Allowlisted keys pass through
    expect(attrs.state).toBe('NY');
    expect(attrs.gross_pay).toBe(3500);
    expect(attrs.net_pay).toBe(2600);

    // Non-allowlisted keys are strictly redacted by default
    expect(attrs.employee_name).toBe('[REDACTED_BY_DEFAULT_ALLOWLIST]');
    expect(attrs.ssn).toBe('[REDACTED_BY_DEFAULT_ALLOWLIST]');
    expect(attrs.paystub_text).toBe('[REDACTED_BY_DEFAULT_ALLOWLIST]');
    expect(attrs.matchedText).toBe('[REDACTED_BY_DEFAULT_ALLOWLIST]');
  });

  it('purges all in-memory spans and session audit logs upon burn()', () => {
    const span = tm.startSpan('parse_wage_statement', { state: 'CA' });
    span.end('OK');

    tm.recordAuditEvent('document_ingested', 'Ingested paystub', { state: 'CA' });

    expect(tm.getMemorySpans().length).toBe(1);
    expect(tm.getAuditLog().length).toBe(1);

    // Invoke Burn Local Data
    tm.burn();

    expect(tm.getMemorySpans().length).toBe(0);
    expect(tm.getAuditLog().length).toBe(0);

    // Subsequent span attempts remain no-op until restart
    const spanAfterBurn = tm.startSpan('post_burn_op', { count: 1 });
    spanAfterBurn.end('OK');
    expect(tm.getMemorySpans().length).toBe(0);
  });

  it('generates downloadable session audit JSON', () => {
    tm.recordAuditEvent('document_ingested', 'Paystub ingested', { state: 'TX' });
    tm.recordAuditEvent('rules_evaluated', 'Evaluated FLSA rules', { is_compliant: false });

    const jsonStr = tm.downloadSessionAuditJson();
    const parsed = JSON.parse(jsonStr);

    expect(parsed.service).toBe('paystub-check');
    expect(parsed.eventCount).toBe(2);
    expect(parsed.events[0].action).toBe('document_ingested');
    expect(parsed.events[1].action).toBe('rules_evaluated');
    expect(parsed.events[1].details.is_compliant).toBe(false);
  });

  it('honestly reports observability status when OTLP is active', () => {
    tm.updateConfig({
      mode: 'otlp',
      otlpEndpoint: 'https://otel.payroll-auditor.internal/v1/traces',
      networkEgress: 'allow_otlp',
    });

    const report = tm.getPrivacyAuditReport();
    expect(report.telemetryMode).toBe('otlp');
    expect(report.otlpEndpoint).toBe('https://otel.payroll-auditor.internal/v1/traces');
    expect(report.isLocalOnlyHonest).toBe(false);
  });

  it('provides single source of truth for consumer privacy claims', () => {
    // 1. Consumer defaults
    const consumerClaims = tm.getPrivacyClaims();
    expect(consumerClaims.isLocalOnlyHonest).toBe(true);
    expect(consumerClaims.isEnterpriseBuild).toBe(false);
    expect(consumerClaims.badgeLabel).toBe('Zero Wage Data Network • Memory-Only');
    expect(consumerClaims.dropzoneNotice).toContain('100% Client-Side Local Execution');
    expect(consumerClaims.disclaimerExecutionText).toContain('100% locally');
    expect(consumerClaims.footerTitle).toContain('100% Local Air-Gapped');

    // 2. Enterprise mode escalation
    tm.updateConfig({
      mode: 'otlp',
      otlpEndpoint: 'https://collector.corp.internal:4318/v1/traces',
      networkEgress: 'allow_otlp',
    });

    const enterpriseClaims = tm.getPrivacyClaims();
    expect(enterpriseClaims.isLocalOnlyHonest).toBe(false);
    expect(enterpriseClaims.isEnterpriseBuild).toBe(true);
    expect(enterpriseClaims.badgeLabel).toBe('OTLP Active (otlp)');
    expect(enterpriseClaims.appTitleSuffix).toBe(' (Enterprise Build)');
    expect(enterpriseClaims.dropzoneNotice).not.toContain('Zero Network');
    expect(enterpriseClaims.disclaimerExecutionText).not.toContain('zero remote network transmission');
    expect(enterpriseClaims.footerTitle).not.toContain('Air-Gapped');
  });
});
