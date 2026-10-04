"""
Core Analyzer — orchestrates all 4 detectors in parallel and produces
actionable verdict classification, authenticity scoring, and forensics summary.
"""
import asyncio
import base64
from models.analysis import AnalysisResult, DebugImages, DetectorResult
from detectors.metadata import analyze_metadata
from detectors.ela import analyze_ela
from detectors.noise_variance import analyze_noise_variance
from detectors.ai_forensics import analyze_ai_forensics

# Base detector weights for general manipulation
WEIGHTS: dict[str, float] = {
    "Metadata":       0.15,
    "ELA":            0.30,
    "Noise Variance": 0.25,
    "AI Forensics":   0.30,
}


def _bytes_to_data_uri(image_bytes: bytes) -> str:
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"


def determine_diagnosis(
    results: list[DetectorResult]
) -> tuple[float, str, bool, str, float, str]:
    """
    Evaluates detector results and returns:
      (authenticity_score, verdict, is_ai_generated, category, confidence, summary)
    """
    result_map = {r.detector: r for r in results}
    meta_res   = result_map.get("Metadata")
    ela_res    = result_map.get("ELA")
    noise_res  = result_map.get("Noise Variance")
    ai_res     = result_map.get("AI Forensics")

    ai_score    = ai_res.score if ai_res else 0.0
    ela_score   = ela_res.score if ela_res else 0.0
    noise_score = noise_res.score if noise_res else 0.0
    meta_score  = meta_res.score if meta_res else 0.0

    ai_details = ai_res.details if ai_res else ""

    # 1. Document Tampering Detection
    is_doc_tampered = (
        ("Document tampering" in ai_details and ai_score >= 45.0)
        or (ela_score >= 60.0 and "[Document]" in ai_details)
    )

    # 2. AI-Generated Image Detection
    is_ai_detected = (
        not is_doc_tampered
        and (
            ("AI-Generated" in ai_details and ai_score >= 65.0)
            or (ai_score >= 78.0 and "AI generation detected" in ai_details)
        )
    )

    # 3. Manipulation / Splicing Detection
    manipulation_score = sum(
        r.score * WEIGHTS.get(r.detector, 0.25) for r in results
    )
    fail_count = sum(1 for r in results if r.result == "Fail")
    pass_count = sum(1 for r in results if r.result == "Pass")

    # Classification & Verdict
    if is_ai_detected:
        is_ai_generated = True
        verdict = "AI Generated"
        category = "ai_generated"
        # Authenticity of AI image is explicitly low
        authenticity_score = max(5.0, round(100.0 - max(ai_score, 80.0), 1))
        confidence = min(98.0, round(55.0 + (ai_score * 0.44), 1))
        summary = "Image exhibits synthetic signatures typical of generative AI models (unnatural spectral rolloff, uniform sensor noise, or smoothed micro-textures)."

    elif is_doc_tampered:
        is_ai_generated = False
        verdict = "Tampered Document"
        category = "document_tampered"
        max_doc_penalty = max(ai_score, ela_score, noise_score)
        authenticity_score = max(5.0, round(100.0 - max(max_doc_penalty, 72.0), 1))
        confidence = min(97.0, round(60.0 + (max_doc_penalty * 0.36), 1))
        summary = "Document indicates localized tampering (altered dates/numbers, pasted digital font with zero scanner noise, or whiteout patches)."

    elif ela_score >= 45.0 or noise_score >= 45.0 or ai_score >= 50.0 or fail_count >= 2:
        is_ai_generated = False
        verdict = "Clear Signs of Manipulation"
        category = "manipulated_image"
        max_manip = max(ela_score, noise_score, ai_score, manipulation_score)
        authenticity_score = max(5.0, round(100.0 - max_manip, 1))
        confidence = min(95.0, round(55.0 + (max_manip * 0.4), 1))
        summary = "Multiple forensic indicators detect digital splicing, copy-move duplication, or inconsistent compression error levels."

    elif manipulation_score >= 30.0 or fail_count >= 1:
        is_ai_generated = False
        verdict = "Possibly Edited"
        category = "manipulated_image"
        authenticity_score = round(100.0 - manipulation_score, 1)
        confidence = round(65.0 + (manipulation_score * 0.2), 1)
        summary = "Moderate forensic inconsistencies detected (re-compression or minor adjustments); conclusive tampering cannot be guaranteed."

    else:
        is_ai_generated = False
        verdict = "Likely Authentic"
        category = "authentic"
        authenticity_score = min(99.0, max(75.0, round(100.0 - manipulation_score, 1)))
        confidence = min(97.0, round(60.0 + (authenticity_score * 0.38), 1))
        summary = "No significant manipulation or synthetic patterns found. Image retains natural sensor noise, camera metadata, and consistent compression."

    return authenticity_score, verdict, is_ai_generated, category, confidence, summary


async def analyze_image(image_bytes: bytes) -> tuple[AnalysisResult, str]:
    """
    Runs all 4 forensic detectors in parallel, performs holistic diagnosis,
    and returns (AnalysisResult, verdict).
    """
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

    authenticity_score, verdict, is_ai_generated, category, confidence, summary = (
        determine_diagnosis(results)
    )

    result_obj = AnalysisResult(
        results=results,
        finalScore=authenticity_score,
        verdict=verdict,
        isAiGenerated=is_ai_generated,
        category=category,
        confidence=confidence,
        summary=summary,
        debugImages=DebugImages(
            ela=_bytes_to_data_uri(ela_image),
            noiseMap=_bytes_to_data_uri(noise_map),
        ),
    )

    return result_obj, verdict
