<!-- diagram-meta
  last-validated: 2026-10-26
  validated-commit: 7ff28fe
  covers: [src/**]
  generated-by: manual
-->

# Architecture & Invariants Specification: Paystub Check Reality Engine

> Client-side paystub auditor, wage theft detection engine, FLSA overtime calculator, and statutory wage demand generator.

---

## 1. Executive Summary

`paystub-check` is a client-side reality engine in the `knowthankyew` portfolio built to protect workers from wage theft and improper payroll deductions. Operating under zero-egress local processing, it extracts paystub earnings and itemized deductions (via text, PDF, or local image OCR), tests pay against the Fair Labor Standards Act (29 U.S.C. § 201) and state Wage Theft Prevention Acts (e.g. CA Labor Code § 226, NYLL § 195), and synthesizes statutory unpaid wage demand letters.

---

## 2. System Architecture & Component Interactions

### A. Execution Sandbox & Trust Boundary

```mermaid
flowchart LR
    subgraph ClientEnvironment["Client Browser Sandbox (Air-Gapped)"]
        User["👤 Worker / Employee"]

        subgraph Ingestion["1. Ingestion Layer"]
            PaystubInput["📄 Paystub Upload / Paste<br/><i>(Text, PDF, Image)</i>"]
            LocalOCR["📷 Local OCR Engine<br/><code>src/legal/ocr.ts</code>"]
            Parser["✂️ Paystub Parser<br/><code>src/legal/parser.ts</code>"]
        end

        subgraph CoreEngine["2. Local Evaluation Core"]
            FLSAEngine["⏱️ FLSA & Overtime Engine<br/><code>src/legal/flsa.ts</code>"]
            StateEngine["🏛️ State Wage Laws<br/><code>src/legal/stateWageLaws.ts</code>"]
            PolicyPack["📦 @knowthankyew/policy-packs/wage<br/><i>(FLSA, CA § 226, NYLL § 195)</i>"]
            DemandGen["📜 Wage Demand Generator<br/><code>src/legal/demandLetter.ts</code>"]
        end

        subgraph Presentation["3. React 19 UI & Controls"]
            Dashboard["📊 Earnings & Deduction Breakdown"]
            Alerts["⚠️ Violation Alert Grid"]
            DemandStudio["📝 Wage Demand Letter Studio"]
            PrivacyModal["🛡️ Privacy Audit Modal"]
            BurnCtrl["🔥 Hard Burn Controller"]
        end

        subgraph TelemetryStore["4. Volatile Telemetry"]
            TelemBuffer["🧠 In-Memory Circular Buffer<br/><i>(Zero Network Egress)</i>"]
        end
    end

    %% Ingestion flow
    User -->|"Uploads Paystub"| PaystubInput
    PaystubInput --> LocalOCR
    LocalOCR --> Parser
    PaystubInput --> Parser

    Parser -->|"Normalized Hours, Earnings & Deductions"| FLSAEngine & StateEngine
    PolicyPack -.->|"Statutory Wage Baselines"| FLSAEngine & StateEngine

    FLSAEngine & StateEngine -->|"Underpayment & Deduction Violations"| Dashboard & Alerts
    FLSAEngine & StateEngine -->|"Statutory Citations & Damages"| DemandGen
    DemandGen --> DemandStudio

    Dashboard & Alerts -->|"Review Violations"| User
    DemandStudio -->|"Download Formal Wage Demand"| User

    %% Telemetry & Burn
    Parser & FLSAEngine -.->|"Allowlisted Spans"| TelemBuffer
    TelemBuffer -.->|"Inspect Real-Time Events"| PrivacyModal
    BurnCtrl -->|"Purges Memory & DOM State"| TelemBuffer
    BurnCtrl -->|"Wipes Paystub State"| Parser & Dashboard

    classDef client fill:#0f172a,stroke:#64748b,stroke-width:1px,color:#f8fafc;
    classDef comp fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef pkg fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#f8fafc;
    classDef burn fill:#78350f,stroke:#f59e0b,stroke-width:2px,color:#f8fafc;

    class PaystubInput,LocalOCR,Parser,FLSAEngine,StateEngine,DemandGen,Dashboard,Alerts,DemandStudio,PrivacyModal comp;
    class PolicyPack pkg;
    class TelemBuffer,BurnCtrl burn;
```

### B. Wage Audit & Demand Notice Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Worker as Worker / User
    participant UI as React UI (App.tsx)
    participant Parser as Paystub Parser & OCR
    participant Legal as FLSA & State Wage Engine
    participant Wage as Policy Packs (Wage)
    participant Demand as Demand Letter Generator
    participant Telem as Telemetry Buffer

    Worker->>UI: Upload paystub image/PDF or enter hours & deductions
    UI->>Parser: parsePaystub(fileOrText)
    Parser->>Parser: Extract gross pay, net pay, hours, tax & deduction items
    UI->>Legal: auditWages(earnings, deductions, jurisdiction)
    Legal->>Wage: Query minimum wage, overtime threshold & permitted deductions
    Wage-->>Legal: Statutory thresholds (FLSA 1.5x, state deduction bans)
    Legal->>Legal: Verify regular rate of pay, overtime multiplier & unlawful deductions
    Legal-->>UI: Return audit violations (underpayment, missing pay, penalties)
    UI->>Telem: Record scan metric (deduction_count, duration_ms)
    UI-->>Worker: Display Breakdown Dashboard & Statutory Violations

    Worker->>UI: Select "Generate Unpaid Wage Demand Letter"
    UI->>Demand: buildDemandLetter(violations, employerName, totalOwed)
    Demand-->>UI: Formatted demand letter with statutory penalty citations (e.g. CA Labor Code § 203)
    UI-->>Worker: Render editable demand letter

    Worker->>UI: Click "Burn Local Data"
    UI->>Telem: Purge circular buffer
    UI->>Parser: Dereference paystub numbers, employer name & wage data
    UI-->>Worker: Clean amnesiac reset
```

---

## 3. Core Architectural Invariants

| # | Invariant | Enforcement & Guarantee |
|:--|:----------|:------------------------|
| 1 | **Zero Document Egress** | Paystubs, SSNs, employer names, and compensation numbers never leave the local browser sandbox. |
| 2 | **Volatile Memory Telemetry** | Operational events are held strictly in an in-memory ring buffer for the local privacy modal; zero network export in consumer builds. |
| 3 | **Strict Key Allowlists** | Telemetry sanitizes properties against `SAFE_ALLOWLIST_KEYS`; gross pay amounts, employer identifiers, and worker names are redacted. |
| 4 | **Compile-Time Dead Code Shims** | Enterprise network telemetry exporter code is excised at compile time for public consumer builds. |
| 5 | **Amnesiac State Purge (Hard Burn)** | Complete memory purge removing all wage figures, deduction tables, and canvas buffers. |

---

## 4. Directory Structure

```
paystub-check/
├── docs/
│   ├── ARCHITECTURE.md          # Architecture, data flow & invariant specification
│   └── PRIVACY_TELEMETRY_SCHEMA.md # Telemetry contract specification
├── src/
│   ├── App.tsx                  # Root application view & workflow orchestration
│   ├── main.tsx                 # Entrypoint
│   ├── index.css                # Tailwind CSS v4 styling
│   ├── components/              # UI components (Dropzone, Dashboard, Alerts, DemandStudio, PrivacyModal)
│   └── legal/
│       ├── parser.ts            # Paystub line-item extraction & OCR parser
│       ├── flsa.ts              # FLSA overtime & minimum wage calculation
│       ├── stateWageLaws.ts     # State wage theft prevention rules
│       ├── policy-loader.ts     # Ingestion of @knowthankyew/policy-packs/wage
│       ├── demandLetter.ts      # Statutory unpaid wage demand generator
│       ├── ocr.ts               # Local OCR engine for scanned paystubs
│       ├── samplePaystubs.ts    # Synthetic test paystubs
│       ├── telemetry.ts         # In-memory privacy telemetry controller
│       └── types.ts             # TypeScript domain definitions
├── tests/                       # Vitest unit test suites
└── vite.config.ts               # Air-gapped bundler configuration
```
