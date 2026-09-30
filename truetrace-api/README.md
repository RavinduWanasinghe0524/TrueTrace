# TrueTrace API — Python Forensics Backend

<p align="center">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white" />
  <img alt="Python" src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas_M0-47A248?logo=mongodb&logoColor=white" />
  <img alt="OpenCV" src="https://img.shields.io/badge/OpenCV-4.9-5C3EE8?logo=opencv&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-Proprietary-red" />
</p>

<p align="center">
  <strong>AI-powered photo forensics backend by IronLogix.</strong><br/>
  Runs 4 independent forensic detectors in parallel on every uploaded image.
</p>

---

## Overview

**TrueTrace API** is the Python backend powering the TrueTrace web application. It accepts image uploads, runs four forensic detection algorithms concurrently, persists results to MongoDB Atlas, and returns a weighted authenticity verdict in seconds.

---

## Features

| Feature | Description |
|---|---|
| ⚡ Parallel Detection | All 4 detectors run via `asyncio.gather` — no sequential bottlenecks |
| 🔒 Privacy First | Images are processed in-memory only — never written to disk |
| 🍃 MongoDB Atlas | Free M0 cluster stores analysis history and powers live stats |
| 📊 Stats Endpoint | Live platform statistics for the frontend StatsBar component |
| 🌐 CORS Ready | Configurable origins for Vercel frontend integration |
| 🚀 Render Ready | `render.yaml` included for one-click free deployment |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.115 + Uvicorn |
| Language | Python 3.11 |
| Database | MongoDB Atlas (Motor async driver) |
| Image Processing | OpenCV 4.9 + Pillow + NumPy |
| EXIF Parsing | exifread + piexif |
| ML Runtime | ONNX Runtime 1.18 |
| Validation | Pydantic v2 |
| Deployment | Render.com (free tier) |

---

## Detection Pipeline

TrueTrace runs **four forensic detectors** in parallel on every uploaded image:

### 1. Metadata Analysis (`detectors/metadata.py`)
- Scans EXIF/IPTC data for editing software signatures (Photoshop, GIMP, Lightroom, etc.)
- Detects stripped camera fingerprints (make, model, exposure settings)
- Flags DateTime mismatches between capture and modification dates
- Identifies GPS coordinate anomalies

### 2. Error Level Analysis — ELA (`detectors/ela.py`)
- Re-compresses the image at a known quality level (90%)
- Measures per-block compression inconsistencies via pixel-level difference
- Computes coefficient of variation across blocks to detect spliced regions
- Outputs a visual ELA heatmap for the frontend

### 3. Noise Variance Detection (`detectors/noise_variance.py`)
- Applies the OpenCV Laplacian operator to estimate local noise per block
- Detects statistically abnormal blocks (outliers > 3σ from mean)
- Flags unusually low noise (possible AI-generated or heavily smoothed images)
- Outputs a JET-colourmap heatmap for the frontend

### 4. AI Forensics (`detectors/ai_forensics.py`)
- **Double JPEG detection**: DCT histogram autocorrelation for re-compression peaks
- **Copy-move detection**: Block-matching to find duplicated regions
- **Chromatic aberration**: Channel-level edge consistency analysis
- **Pixel statistics**: Histogram gap and spike anomaly detection

### Scoring Formula

```
manipulation_score = Σ (detector_score × weight)

Weights:
  Metadata       → 0.15
  ELA            → 0.30
  Noise Variance → 0.25
  AI Forensics   → 0.30

Consensus boost: ±8 if 3+ detectors agree (Fail or Pass)
authenticity_score = 100 − manipulation_score
```

| Score | Verdict |
|---|---|
| 70 – 100% | ✅ Likely Authentic |
| 40 – 69% | ⚠️ Possibly Edited |
| 0 – 39% | ❌ Clear Signs of Manipulation |

---

## Project Structure

```
truetrace-api/
├── main.py                  ← FastAPI app entry point + CORS
├── requirements.txt         ← All Python dependencies (pinned)
├── render.yaml              ← Render.com free deployment config
├── .env.example             ← Environment variable template
│
├── core/
│   ├── config.py            ← Settings loaded from .env (pydantic-settings)
│   └── analyzer.py          ← Orchestrates 4 detectors via asyncio.gather
│
├── db/
│   └── mongo.py             ← Motor async MongoDB client + indexes
│
├── models/
│   └── analysis.py          ← Pydantic models (matches frontend TypeScript types)
│
├── detectors/
│   ├── metadata.py          ← EXIF/metadata forensics
│   ├── ela.py               ← Error Level Analysis
│   ├── noise_variance.py    ← Noise distribution analysis (OpenCV)
│   └── ai_forensics.py      ← Multi-technique ML heuristics
│
├── routers/
│   └── analyze.py           ← POST /api/analyze + GET /api/stats
│
├── test_db.py               ← MongoDB connection test script
└── test_detectors.py        ← Detector smoke test script
```

---

## Getting Started

### Prerequisites

- Python **3.11** or later
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account (M0 cluster)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd truetrace-api

# 2. Create virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
copy .env.example .env    # Windows
cp .env.example .env      # macOS / Linux
# Edit .env and fill in your MongoDB URI
```

### Environment Variables

```env
# .env

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://truetrace-admin:YOUR_PASSWORD@truetrace-cluster.xxxxx.mongodb.net/truetrace?retryWrites=true&w=majority

# Upstash Redis (optional, for rate limiting)
UPSTASH_REDIS_URL=rediss://default:PASSWORD@host.upstash.io:6380

# CORS — comma-separated list of allowed frontend origins
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app

# App settings
APP_ENV=development
APP_VERSION=1.0.0
```

> **Note:** Passwords with special characters (e.g., `@`, `#`, `!`) are automatically URL-encoded — no manual escaping needed.

### Verify MongoDB Connection

```bash
.\venv\Scripts\python test_db.py   # Windows
python test_db.py                   # macOS / Linux
```

Expected output:
```
Connecting to MongoDB Atlas...
SUCCESS: Connected to MongoDB Atlas! ✅
Database is ready!
```

### Run the Development Server

```bash
.\venv\Scripts\uvicorn main:app --reload --port 8000
```

The API is now available at:

| URL | Description |
|---|---|
| `http://localhost:8000/docs` | Interactive Swagger UI |
| `http://localhost:8000/health` | Health check |
| `http://localhost:8000/api/analyze` | POST — analyze an image |
| `http://localhost:8000/api/stats` | GET — live platform stats |

---

## API Reference

### `POST /api/analyze`

Accepts a `multipart/form-data` upload with an `image` field.

**Request:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "image=@photo.jpg"
```

**Response:**
```json
{
  "results": [
    { "detector": "Metadata",       "result": "Pass",    "score": 15.0, "details": "..." },
    { "detector": "ELA",            "result": "Warning",  "score": 32.5, "details": "..." },
    { "detector": "Noise Variance", "result": "Pass",    "score": 18.0, "details": "..." },
    { "detector": "AI Forensics",   "result": "Pass",    "score": 22.0, "details": "..." }
  ],
  "finalScore": 76.4,
  "debugImages": {
    "ela": "data:image/jpeg;base64,...",
    "noiseMap": "data:image/jpeg;base64,..."
  }
}
```

**Supported formats:** JPEG, JPG, PNG (max 20 MB)

---

### `GET /api/stats`

Returns live platform statistics.

```json
{
  "totalAnalyses": 1247,
  "avgAuthenticityScore": 68.3,
  "manipulatedCount": 312,
  "authenticCount": 935
}
```

---

### `GET /health`

```json
{ "status": "ok", "version": "1.0.0", "env": "production" }
```

---

## Deployment (Render.com — Free)

1. Push `truetrace-api/` to a GitHub repository
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — no manual config needed
5. Add environment variables in the Render dashboard:
   - `MONGODB_URI`
   - `UPSTASH_REDIS_URL`
   - `ALLOWED_ORIGINS` (your Vercel frontend URL)
6. Click **Deploy**

Your API will be live at: `https://truetrace-api.onrender.com`

> **Free tier note:** Render free services spin down after 15 minutes of inactivity. First request after idle may take ~30 seconds (cold start).

---

## Frontend Integration

Update the Next.js frontend to call this backend instead of local API routes.

In `truetrace-web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

In production (`truetrace-web/.env.production`):
```env
NEXT_PUBLIC_API_URL=https://truetrace-api.onrender.com
```

---

## Running Tests

```bash
# Test MongoDB connection
python test_db.py

# Smoke test all 4 detectors
python test_detectors.py
```

---

## Roadmap

- [ ] Upstash Redis rate limiting (Phase 6)
- [ ] File hash deduplication cache (Phase 6)
- [ ] Shareable report links with `shareToken`
- [ ] Video manipulation detection
- [ ] Batch / bulk image processing
- [ ] Public API with API key auth

---

## License

This project is **proprietary** and confidential. All rights reserved by **IronLogix**.
Unauthorized use, reproduction, or distribution is strictly prohibited.

---

## About IronLogix

IronLogix builds AI-powered security and forensic tools for individuals and organizations who need to trust their digital media.

📧 [support@ironlogix.com](mailto:support@ironlogix.com)
