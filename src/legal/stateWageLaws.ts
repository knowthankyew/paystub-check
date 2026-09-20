import { StateWageRule } from "./types";
import { LOADED_STATE_WAGE_LAWS } from "./policy-loader";

export const STATE_WAGE_LAWS: Record<string, StateWageRule> = LOADED_STATE_WAGE_LAWS;

export const ALL_US_STATES = [
  { code: "CA", name: "California" },
  { code: "NY", name: "New York" },
  { code: "MA", name: "Massachusetts" },
  { code: "WA", name: "Washington" },
  { code: "CO", name: "Colorado" },
  { code: "TX", name: "Texas" },
  { code: "FL", name: "Florida" },
  { code: "IL", name: "Illinois" },
  { code: "PA", name: "Pennsylvania" },
  { code: "NJ", name: "New Jersey" },
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NM", name: "New Mexico" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" }
];

export function getStateWageRule(stateCode: string): StateWageRule {
  const code = stateCode.toUpperCase();
  if (STATE_WAGE_LAWS[code]) {
    return STATE_WAGE_LAWS[code];
  }
  return {
    ...STATE_WAGE_LAWS.DEFAULT,
    stateCode: code,
    stateName: ALL_US_STATES.find(s => s.code === code)?.name || code
  };
}
