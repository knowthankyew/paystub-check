# Contributing Statutory Wage Policies to Paystub-Check

Welcome! You can update or add state and municipal labor regulations to Paystub-Check without writing or modifying any TypeScript or React code.

## How to Add or Update a Jurisdiction

1. **Locate or Create the Policy File**:
   - Files are stored in `policies/jurisdictions/<STATE_CODE>.json` (e.g. `policies/jurisdictions/OR.json` for Oregon).
   - If adding a new state, copy `policies/templates/jurisdiction-template.json` to `policies/jurisdictions/<STATE_CODE>.json`.

2. **Update the Fields**:
   - `jurisdiction.code`: Two-letter state code (e.g., `"OR"`).
   - `jurisdiction.name`: Full jurisdiction name (e.g., `"Oregon"`).
   - `metadata.statuteRef`: Primary legal statutory authority (e.g., `"ORS 652 & 653"`).
   - `metadata.officialSourceUrl`: Official state Department of Labor / legislative webpage.
   - `standards.minimumWageRate`: Current hourly minimum wage in USD.
   - `standards.exemptionSalaryThreshold`: Annual salary threshold required for FLSA/state overtime exemption.
   - `standards.dailyOvertimeThreshold`: (Optional) Daily overtime threshold in hours (e.g., 8).
   - `standards.weeklyOvertimeThreshold`: Standard weekly overtime threshold (typically 40).
   - `standards.hasStateDisabilityTax`: `true` if mandatory state disability / paid leave deductions apply.
   - `standards.specialRules`: Array of human-readable statutory protections (mandatory wage notices, illegal shortage deductions, waiting time penalties).

3. **Validate Your Changes**:
   Run the policy validator locally:
   ```bash
   npm run validate:policies
   ```

4. **Submit a Pull Request**:
   Open a PR against the `main` branch with a title like `feat(policy): update Oregon minimum wage for 2026`.
   Our automated CI will validate the schema and run regressions.
