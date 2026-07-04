# TrueTrace — AI-Powered Photo Forensics

<p align="center">
  <img src="public/favicon.ico" alt="TrueTrace Logo" width="64" />
</p>

<p align="center">
  <strong>Detect photo manipulation with confidence.</strong><br/>
  Free · Private · Fast
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss" />
  <img alt="License" src="https://img.shields.io/badge/License-Proprietary-red" />
</p>

---

## Overview

**TrueTrace** is an AI-powered photo forensics web application built by **IronLogix**. It helps users determine whether a photo is authentic or has been digitally altered — no accounts, no fees, no data stored.

Upload any JPEG or PNG image and TrueTrace runs four independent detection algorithms in parallel, then returns a weighted confidence verdict in seconds.

---

## Features

| Feature | Description |
|---|---|
| 🆓 Completely Free | No signup, no subscription, no hidden fees |
| ⚡ Fast Analysis | Results in 3–10 seconds |
| 🔒 Privacy First | Photos are analyzed in-memory and never stored |
| 🎯 Confidence Score | Weighted 0–100% verdict across four detectors |
| 📊 Rich Visualizations | Radar chart, confidence meter, analysis timeline |
| 🎨 Aurora UI | Glassmorphism dark-mode interface with smooth animations |
| 📱 Responsive | Works seamlessly on desktop and mobile |

---

## How It Works

### Detection Pipeline

TrueTrace runs **four forensic detectors** in parallel on every uploaded image:

1. **Metadata Analysis** (`lib/detectors/metadata.ts`)  
   Inspects EXIF/IPTC data for signs of software editing, GPS inconsistencies, or missing camera fingerprints.

2. **Error Level Analysis — ELA** (`lib/detectors/ela.ts`)  
   Re-compresses the image at a known quality level and measures compression-level inconsistencies. Edited regions typically show different error levels than the original.

3. **Noise Variance Detection** (`lib/detectors/noise-variance.ts`)  
   Analyses pixel-level noise distribution across image blocks. Cloned or composited regions exhibit statistically abnormal noise patterns.

4. **AI Forensics** (`lib/detectors/ai-forensics.ts`)  
   Applies machine-learning heuristics to detect sophisticated manipulations such as content-aware fill, deepfake artefacts, and frequency-domain anomalies.

### Verdict Scale

| Score | Verdict |
|---|---|
| 70 – 100 % | ✅ Likely authentic |
| 40 – 69 % | ⚠️ Possibly edited |
| 0 – 39 % | ❌ Clear signs of manipulation |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 3 |
| Animations | Framer Motion 12 |
| Image Processing | Sharp 0.34 |
| Metadata Parsing | exif-parser |
| Document Support | pdf-lib + pdfjs-dist |
| Language | TypeScript 5 |

---

## Project Structure

```
truetrace-web/
├── app/
│   ├── api/analyze/          # POST endpoint — runs the detection pipeline
│   ├── page.tsx              # Root page (upload → analyze → results flow)
│   ├── layout.tsx            # Root layout & global metadata
│   └── globals.css           # Design tokens, aurora background, utility classes
│
├── components/
│   ├── Navbar.tsx            # Sticky navigation bar
│   ├── Hero.tsx              # Landing hero section
│   ├── StatsBar.tsx          # Live accuracy / photos-analyzed stats
│   ├── FileUpload.tsx        # Drag-and-drop image upload interface
│   ├── LoadingScreen.tsx     # Animated analysis progress overlay
│   ├── AnalysisResults.tsx   # Full results breakdown
│   ├── ConfidenceMeter.tsx   # Animated score gauge
│   ├── RadarChart.tsx        # Per-detector radar visualization
│   ├── AnalysisTimeline.tsx  # Step-by-step detection timeline
│   ├── BeforeAfterSlider.tsx # Original vs. ELA image comparison
│   ├── DebugVisualization.tsx# Developer-facing raw signal view
│   ├── HowItWorks.tsx        # Explainer section
│   ├── Examples.tsx          # Sample image walkthroughs
│   ├── Privacy.tsx           # Privacy policy section
│   ├── FAQ.tsx               # Frequently asked questions
│   └── ParticleBackground.tsx# Ambient particle canvas effect
│
├── lib/
│   ├── analyzer.ts           # Orchestrates all detectors & computes final score
│   ├── document-converter.ts # Converts PDF pages to images for analysis
│   ├── types.ts              # Shared TypeScript types
│   └── detectors/
│       ├── metadata.ts       # EXIF / metadata forensics
│       ├── ela.ts            # Error Level Analysis
│       ├── noise-variance.ts # Noise distribution analysis
│       └── ai-forensics.ts   # ML-based heuristic detection
│
├── types/                    # Global type declarations (e.g. exif-parser.d.ts)
└── public/                   # Static assets (favicon, images)
```

---

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **npm** (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd truetrace-web

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production bundle |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Privacy & Security

- Images are processed **in-memory only** — no file is written to disk or stored in a database.
- **No user accounts** or personal data are collected.
- Analysis runs server-side via a short-lived API call; the image buffer is garbage-collected immediately after.
- All traffic is served over **HTTPS**.

---

## Extending TrueTrace

### Adding a New Detector

1. Create `lib/detectors/<your-detector>.ts` and export a function that accepts a `Buffer` and returns `{ score: number; flags: string[] }`.
2. Import and call it inside `lib/analyzer.ts` alongside the existing detectors.
3. Add an appropriate weight to the scoring formula in `analyzer.ts`.
4. Optionally surface the result in `AnalysisResults.tsx`.

---

## Roadmap

- [ ] Video manipulation detection
- [ ] Batch / bulk image processing
- [ ] Public API with rate limiting
- [ ] Shareable report links
- [ ] Mobile app (iOS & Android)
- [ ] Advanced PDF forensics

---

## License

This project is **proprietary** and confidential. All rights reserved by **IronLogix**.  
Unauthorized use, reproduction, or distribution is strictly prohibited.

---

## About IronLogix

IronLogix builds AI-powered security and forensic tools for individuals and organizations who need to trust their digital media.

📧 [support@ironlogix.com](mailto:support@ironlogix.com)

---

> **Disclaimer:** TrueTrace is a forensic aid, not a legal certification. For official or court-admissible forensic analysis, consult a certified digital forensics professional.
