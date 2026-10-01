"""
Router — POST /api/analyze  |  GET /api/stats
"""
import logging
from datetime import datetime
from fastapi import APIRouter, File, UploadFile, HTTPException, Request, Response
from models.analysis import AnalysisResult, AnalysisDocument
from core.analyzer import analyze_image, _score_to_verdict
from core.rate_limiter import check_rate_limit, get_cached_result, cache_result
from db.mongo import get_analyses_collection

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["analyze"])

ALLOWED_TYPES   = {"image/jpeg", "image/jpg", "image/png"}
MAX_FILE_SIZE_MB = 20


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(request: Request, response: Response, image: UploadFile = File(...)):
    """
    Accepts a JPEG or PNG image, runs 4 forensic detectors in parallel,
    saves the result to MongoDB, and returns the analysis JSON.
    Includes IP-based rate limiting and file-hash result caching.
    """
    # ── 1. Rate limit check ───────────────────────────────────────────
    rate_headers = await check_rate_limit(request)
    for k, v in rate_headers.items():
        response.headers[k] = v

    # ── 2. Validate MIME type ─────────────────────────────────────────
    content_type = image.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{content_type}'. Upload a JPEG or PNG image.",
        )

    # ── 3. Read and size-check ────────────────────────────────────────
    image_bytes = await image.read()
    size_mb = len(image_bytes) / (1024 * 1024)

    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Maximum: {MAX_FILE_SIZE_MB} MB.",
        )

    # ── 4. Check result cache (skip re-processing same image) ─────────
    file_hash, cached = await get_cached_result(image_bytes)
    if cached:
        response.headers["X-Cache"] = "HIT"
        logger.info(f"Returning cached result for {image.filename}")
        return cached

    response.headers["X-Cache"] = "MISS"
    logger.info(f"Analyzing '{image.filename}' ({size_mb:.2f} MB)")

    # ── 5. Run the forensic pipeline ──────────────────────────────────
    try:
        result, verdict = await analyze_image(image_bytes)
    except Exception as e:
        logger.error(f"Analysis pipeline error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    # ── 6. Cache the result ───────────────────────────────────────────
    result_dict = result.model_dump()
    await cache_result(file_hash, result_dict)

    # ── 7. Persist to MongoDB ─────────────────────────────────────────
    try:
        doc = AnalysisDocument(
            fileHash=f"sha256:{file_hash}",
            fileName=image.filename or "unknown",
            fileSizeKB=round(len(image_bytes) / 1024, 2),
            mimeType=content_type,
            uploadedAt=datetime.utcnow(),
            finalScore=result.finalScore,
            verdict=verdict,
            results=result.results,
        )
        await get_analyses_collection().insert_one(doc.model_dump())
        logger.info(f"Saved → verdict='{verdict}' score={result.finalScore}")
    except Exception as e:
        logger.warning(f"MongoDB save failed (non-fatal): {e}")

    return result


@router.get("/stats")
async def get_stats():
    """Returns live platform statistics for the StatsBar component."""
    try:
        collection = get_analyses_collection()
        total = await collection.count_documents({})
        pipeline = [
            {"$group": {
                "_id": None,
                "avgScore":    {"$avg": "$finalScore"},
                "manipulated": {
                    "$sum": {"$cond": [{"$lt": ["$finalScore", 40]}, 1, 0]}
                },
            }}
        ]
        agg = await collection.aggregate(pipeline).to_list(1)
        avg_score   = round(agg[0]["avgScore"], 1) if agg else 0.0
        manipulated = agg[0]["manipulated"]         if agg else 0

        return {
            "totalAnalyses":        total,
            "avgAuthenticityScore": avg_score,
            "manipulatedCount":     manipulated,
            "authenticCount":       total - manipulated,
        }
    except Exception as e:
        logger.warning(f"Stats query failed: {e}")
        return {
            "totalAnalyses": 0, "avgAuthenticityScore": 0,
            "manipulatedCount": 0, "authenticCount": 0,
        }
