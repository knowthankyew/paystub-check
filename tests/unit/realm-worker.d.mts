export declare function runTelemetryInFreshRealm(scenarioBody: string): Promise<void>;
export declare function runHandoffBurnInFreshRealm(
  burnMode: 'manager_burn' | 'dom_message',
  payloadJson: string
): Promise<void>;
