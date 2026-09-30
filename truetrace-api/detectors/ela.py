"""
Detector 2 — Error Level Analysis (ELA)
Re-compresses the image and measures compression-level inconsistencies.
(Implementation in Phase 4B)
"""
from models.analysis import DetectorResult


async def analyze_ela(image_bytes: bytes) -> tuple[DetectorResult, bytes]:
    """Returns (result, ela_image_bytes)."""
    # TODO: implement in Phase 4B
    placeholder_image = image_bytes  # return original as placeholder
    return (
        DetectorResult(
            detector="ELA",
            result="Pass",
            score=20.0,
            details="ELA detector not yet implemented",
        ),
        placeholder_image,
    )
