import { StateWageRule } from "./types";
import caPolicy from "../../policies/jurisdictions/CA.json";
import nyPolicy from "../../policies/jurisdictions/NY.json";
import maPolicy from "../../policies/jurisdictions/MA.json";
import waPolicy from "../../policies/jurisdictions/WA.json";
import coPolicy from "../../policies/jurisdictions/CO.json";
import txPolicy from "../../policies/jurisdictions/TX.json";
import flPolicy from "../../policies/jurisdictions/FL.json";
import federalPolicy from "../../policies/jurisdictions/federal.json";

export interface WagePolicyPack {
  jurisdiction: {
    code: string;
    name: string;
    type: "federal" | "state" | "municipal";
  };
  metadata: {
    version: string;
    effectiveDate?: string;
    lastAudited?: string;
    statuteRef: string;
    officialSourceUrl?: string;
  };
  standards: {
    minimumWageRate: number;
    exemptionSalaryThreshold?: number;
    dailyOvertimeThreshold?: number;
    doubleTimeThreshold?: number;
    weeklyOvertimeThreshold: number;
    hasStateDisabilityTax: boolean;
    stateTaxName?: string;
    waitingTimePenaltyDays?: number;
    statutoryDamagesMultiplier?: string;
    specialRules: string[];
  };
}

function policyToRule(policy: WagePolicyPack): StateWageRule {
  return {
    stateCode: policy.jurisdiction.code,
    stateName: policy.jurisdiction.name,
    statuteRef: policy.metadata.statuteRef,
    minimumWageRate: policy.standards.minimumWageRate,
    exemptionSalaryThreshold: policy.standards.exemptionSalaryThreshold,
    dailyOvertimeThreshold: policy.standards.dailyOvertimeThreshold,
    doubleTimeThreshold: policy.standards.doubleTimeThreshold,
    weeklyOvertimeThreshold: policy.standards.weeklyOvertimeThreshold,
    hasStateDisabilityTax: policy.standards.hasStateDisabilityTax,
    stateTaxName: policy.standards.stateTaxName,
    waitingTimePenaltyDays: policy.standards.waitingTimePenaltyDays,
    statutoryDamagesMultiplier: policy.standards.statutoryDamagesMultiplier,
    specialRules: policy.standards.specialRules,
  };
}

const RAW_POLICIES: WagePolicyPack[] = [
  caPolicy as WagePolicyPack,
  nyPolicy as WagePolicyPack,
  maPolicy as WagePolicyPack,
  waPolicy as WagePolicyPack,
  coPolicy as WagePolicyPack,
  txPolicy as WagePolicyPack,
  flPolicy as WagePolicyPack,
];

export const LOADED_STATE_WAGE_LAWS: Record<string, StateWageRule> = {
  DEFAULT: policyToRule(federalPolicy as WagePolicyPack),
};

for (const policy of RAW_POLICIES) {
  LOADED_STATE_WAGE_LAWS[policy.jurisdiction.code] = policyToRule(policy);
}
