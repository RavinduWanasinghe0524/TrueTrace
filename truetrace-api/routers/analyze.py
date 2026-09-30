"""
Router — POST /api/analyze
Accepts a multipart image upload, runs the forensic pipeline, saves to MongoDB.
"""
import hashlib
from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from models.analysis import AnalysisResult, AnalysisDocument
from core.analyzer import analyze_image, _score_to_verdict
from db.mongo import get_analyses_collection
from datetime import datetime

router = APIRouter(prefix="/api", tags=["analyze"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png"}
MAX_FILE_SIZE_MB = 20


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(request: Request, image: UploadFile = File(...)):
    # ── Validate file type ──────────────────────────────────
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {image.content_type}. Upload JPEG or PNG.",
        )

    # ── Read file bytes ─────────────────────────────────────
    image_bytes = await image.read()

    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max {MAX_FILE_SIZE_MB}MB.",
        )

    # ── Run forensic pipeline ───────────────────────────────
    result, verdict = await analyze_image(image_bytes)

    # ── Persist to MongoDB (fire & forget) ──────────────────
    file_hash = hashlib.sha256(image_bytes).hexdigest()
    doc = AnalysisDocument(
        fileHash=f"sha256:{file_hash}",
        fileName=image.filename or "unknown",
        fileSizeKB=round(len(image_bytes) / 1024, 2),
        mimeType=image.content_type,
        uploadedAt=datetime.utcnow(),
        finalScore=result.finalScore,
        verdict=verdict,
        results=result.results,
    )

    collection = get_analyses_collection()
    await collection.insert_one(doc.model_dump())

    return result
