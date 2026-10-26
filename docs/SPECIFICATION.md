# PaystubCheck Architecture Specification

**PaystubCheck** is a 100% local-first, privacy-respecting ("knowthankyew" style) web application licensed under the MIT License as a Public Good. It provides workers, contractors, and job applicants with instant, plain-English legal checks of pay stubs, offer letters, and wage statements under the **Fair Labor Standards Act (FLSA, 29 U.S.C. § 201 et seq.)** and 50-state wage-and-hour laws.

---

## 1. Core Principles & Privacy Model

- **100% Local Client-Side Execution**: All natural language processing, wage math calculations, image OCR, state law matching, and report generation occur strictly inside the user's web browser.
- **Zero External Network Requests**: No telemetry, no remote APIs, no user data collection, no analytics, no cloud storage.
- **Public Good**: Free, open-source software (MIT License) designed for worker empowerment.

---

## 2. Technical Stack & Architecture

```
                        ┌──────────────────────────────────────────────┐
                        │           PaystubCheck React SPA             │
                        └──────────────────────┬───────────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
  ┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
  │   Client-Side OCR       │     │    FLSA Legal Engine    │     │ State Wage Law DB       │
  │ (Tesseract.js WASM/JS)  │     │ (29 USC & 29 CFR § 531) │     │ (50 US States + DC)     │
  └────────────┬────────────┘     └────────────┬────────────┘     └────────────┬────────────┘
               │                               │                               │
               └───────────────────────────────┼───────────────────────────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────────────┐
                        │   Wage Claim Demand Letter & PDF/MD Export   │
                        └──────────────────────────────────────────────┘
```

- **Framework**: Vite + React 18 + TypeScript.
- **Styling**: Tailwind CSS + Custom CSS (dark mode glassmorphism, responsive visual design).
- **Icons**: Lucide React icons (embedded SVG).
- **OCR Engine**: Tesseract.js (WASM / Web Worker client-side text recognition using bundled local assets in `/public/ocr/`).
- **Exporting**: Local Markdown exporter & print-optimized PDF renderer.

---

## 3. Component Architecture

### 3.1 Legal Rules & Wage Engine (`src/legal/`)

1. **`flsa.ts`**:
   - **29 U.S.C. § 213(a)(1) (FLSA Exemption Salary Thresholds)**: Salary basis tests for Executive, Administrative, Professional, Computer, and Outside Sales exemptions (binding federal FLSA baseline $35,568 / $684/wk following nationwide vacatur of 2024 rule, plus higher state mandates like CA $70,304, WA $71,261, NY $66,300 downstate). Flags salaried non-exempt employees paid under threshold without overtime.
   - **29 C.F.R. § 531.35 (Unlawful Deductions & Kickbacks)**: Flags illegal deductions for cash register shortages, stolen items, uniform costs, tool fees, or damaged equipment if they reduce net pay below minimum wage or cut into overtime.
   - **26 U.S.C. §§ 3101-3128 (Statutory Taxes & FICA)**: Verifies FICA Social Security (6.2% up to wage cap), Medicare (1.45% + 0.9% Additional Medicare tax), and state statutory disability/family leave deductions (CA SDI, NY DBL/PFL, MA PFML, NJ FLI, WA PFML).
   - **29 U.S.C. § 207 (Overtime Math)**: Regular rate of pay math rules and 1.5x overtime requirements after 40 hours/week.

2. **`stateWageLaws.ts`**:
   - Structured dataset for 50 US States + DC detailing state minimum wage rates, daily overtime rules (CA, NV, AK require 1.5x after 8 hrs/day; CA 2x after 12 hrs/day), state-mandated pay stub disclosure requirements, waiting time penalties (e.g. CA Lab. Code § 203), and statutory damages (e.g. MA M.G.L. c. 149 § 148 treble damages).

3. **`parser.ts`**:
   - Regular expression pattern matchers & keyword distance analyzers to score overall Wage Compliance (0–100), extract active pay terms, and flag enforceable vs. illegal terms.

4. **`ocr.ts`**:
   - Client-side Tesseract OCR integration using local `/ocr/` WASM assets.

5. **`demandLetter.ts`**:
   - Legal wage dispute notice builder pre-populating statutory citations, worker details, employer info, and specific wage claim demands.

### 3.2 User Interface Components (`src/components/`)

- **`Header.tsx`**: Navigation, offline status, MIT License indicator, sample preset loader.
- **`PaystubInput.tsx`**: Drag-and-drop text & image upload zone with OCR status indicators.
- **`ComplianceSummary.tsx`**: Compliance score visualizer, total red flags counter, and statutory compliance status.
- **`RedFlagsList.tsx`**: Interactive cards detailing illegal deductions, statutory citations, and worker action steps.
- **`PayBreakdown.tsx`**: Plain-English breakdown of gross pay, regular rate of pay, overtime, taxes, and net pay.
- **`StateWageCard.tsx`**: State-specific legal rights based on selected US state.
- **`DemandLetterGenerator.tsx`**: Dynamic demand letter creator with copy/print capabilities and UPL disclaimer.
- **`ExportModal.tsx`**: Exporting analysis reports to Markdown or PDF.

---

## 4. Git & Release Workflow

1. Initial commit contains `ARCHITECTURE.md` (Commit Message: `ARCHITECTURE`).
2. Full codebase implementation with 100% offline verification.
3. Automated Playwright demo recording script (`scripts/record-demo.js` & `scripts/record-demo.sh`).
4. MIT License declaration in `LICENSE` and UI footer.
