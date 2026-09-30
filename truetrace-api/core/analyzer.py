"""
Core Analyzer — orchestrates all 4 detectors in parallel.
Mirrors the logic in truetrace-web/lib/analyzer.ts
"""
import asyncio
import base64
from models.analysis import AnalysisResult, DebugImages, DetectorResult
from detectors.metadata import analyze_metadata
from detectors.ela import analyze_ela
from detectors.noise_variance import analyze_noise_variance
from detectors.ai_forensics import analyze_ai_forensics

# Weights matching the original TypeScript implementation
WEIGHTS: dict[str, float] = {
    "Metadata":       0.15,
    "ELA":            0.30,
    "Noise Variance": 0.25,
    "AI Forensics":   0.30,
}


def _score_to_verdict(authenticity_score: float) -> str:
    if authenticity_score >= 70:
        return "Likely Authentic"
    elif authenticity_score >= 40:
        return "Possibly Edited"
    else:
        return "Clear Signs of Manipulation"


def _bytes_to_data_uri(image_bytes: bytes) -> str:
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"


async def analyze_image(image_bytes: bytes) -> tuple[AnalysisResult, str]:
    """
    Runs all 4 detectors in parallel and returns:
      (AnalysisResult, verdict_string)
    """
    # Run all detectors concurrently
    metadata_result, (ela_result, ela_image), (noise_result, noise_map), ai_result = (
        await asyncio.gather(
            analyze_metadata(image_bytes),
            analyze_ela(image_bytes),
            analyze_noise_variance(image_bytes),
            analyze_ai_forensics(image_bytes),
        )
    )

    results: list[DetectorResult] = [
        metadata_result,
        ela_result,
        noise_result,
        ai_result,
    ]

    # Weighted manipulation score (0 = clean, 100 = manipulated)
    manipulation_score = sum(
        r.score * WEIGHTS.get(r.detector, 0) for r in results
    )

    # Consensus boost: ±8 if 3+ detectors agree
    fail_count = sum(1 for r in results if r.result == "Fail")
    pass_count = sum(1 for r in results if r.result == "Pass")

    if fail_count >= 3:
        manipulation_score += 8
    elif pass_count >= 3:
        manipulation_score -= 8

    manipulation_score = max(0.0, min(100.0, round(manipulation_score, 2)))

    # Authenticity score: flip so high = authentic
    authenticity_score = round(100.0 - manipulation_score, 2)
    verdict = _score_to_verdict(authenticity_score)

    return (
        AnalysisResult(
            results=results,
            finalScore=authenticity_score,
            debugImages=DebugImages(
                ela=_bytes_to_data_uri(ela_image),
                noiseMap=_bytes_to_data_uri(noise_map),
            ),
        ),
        verdict,
    )
