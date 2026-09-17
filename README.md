# PaystubCheck 💵

> 100% local-first legal reality check for pay stubs, offer letters, and wage statements under the **Fair Labor Standards Act (FLSA, 29 U.S.C. § 201 et seq.)** and 50-state wage-and-hour laws.

[![MIT License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Offline%20%26%20Air--Gapped-teal.svg)](#100-local-first--zero-telemetry-architecture)
[![Ethos](https://img.shields.io/badge/Ethos-knowthankyew%20Public%20Good-cyan.svg)](#knowthankyew-ethos)

---

## 📹 Interactive Demo

![PaystubCheck Functionality Demo](demo.gif)

*Watch `demo.mp4` recorded via Playwright to see PaystubCheck audit a salaried misclassification pay stub below FLSA exemption thresholds ($43,888/yr), cross-reference Massachusetts mandatory treble damages (M.G.L. c. 149 § 148), and generate a formal statutory wage claim demand letter.*

---

## 💡 What is PaystubCheck?

**PaystubCheck** is an offline, privacy-first wage reality check tool designed to empower workers, contractors, and job applicants against unlawful deductions, misclassifications, and unpaid overtime.

Paste a pay stub, offer letter, or upload a photo/scan of a physical pay advice to receive:
1. **Wage & Hour Reality Rating (0–100)**: Visual gauge evaluating payroll lawfulness and statutory compliance.
2. **FLSA Overtime & Exemption Audit**: Identifies misclassified "salaried exempt" employees paid below governing statutory salary thresholds (including California $66,560/yr, Washington $67,725/yr, New York $62,400/yr, and the binding federal FLSA floor of $35,568/yr under **29 U.S.C. § 213(a)(1)**) who are statutorily entitled to 1.5x overtime.
3. **Unlawful Deductions Check**: Flags illegal deductions for cash register shortages, uniform charges, tool fees, or damaged equipment under **29 C.F.R. § 531.35** ("Free and Clear" payment rule).
4. **50-State Wage & Hour Protections**: Dynamic statutory guidance based on state jurisdiction—including 8-hour daily overtime rules (CA, NV, AK), waiting time penalties (e.g. California Lab. Code § 203), and mandatory treble damages (Massachusetts M.G.L. c. 149 § 148).
5. **Statutory Wage Demand Letter Generator**: Prefills a formal wage claim demand letter citing **29 U.S.C. § 216(b)** (100% liquidated double damages + mandatory attorney fees) with 1-click copying and print-to-PDF formatting.
6. **Client-Side WASM OCR**: Embedded offline Tesseract.js engine for scanning physical pay stub images without sending data to remote servers.

---

## 🔒 100% Local-First & Zero-Telemetry Architecture

Built in accordance with the **knowthankyew** public-good standard:
- **Air-Gapped Operation**: 100% client-side execution in the browser.
- **Zero Third-Party Requests**: WebAssembly OCR binaries (`/public/ocr/`), UI fonts, and icons are bundled locally; zero calls to external CDNs, analytics, or remote LLM endpoints.
- **In-Memory Privacy**: No pay stubs, social security numbers, or worker addresses are saved to remote servers or local storage.

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18+) & npm

### Running Locally

```bash
# Clone repository
git clone https://github.com/knowthankyew/paystub-check.git
cd paystub-check

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Building Production Bundle

```bash
npm run build
```

---

## 🎬 Playwright Video Recording Script

Generate a clean Playwright browser demo video (`demo.mp4` and `demo.gif`) automatically:

```bash
# Execute automated Playwright recording script
npm run record:demo
```

---

## ⚖️ Educational Legal Disclaimer

> **Legal Disclaimer**: PaystubCheck is an automated informational and educational tool built as a local-first public good. It is not an attorney, law firm, or substitute for professional legal counsel. Use of this application does not establish an attorney-client relationship. Generated dispute letters, tax checks, and wage breakdowns are self-help reference templates intended for worker education. Labor laws vary by jurisdiction and factual circumstance.

---

## 📄 License

Licensed under the open-source [MIT License](LICENSE) — free public good software for worker empowerment.
