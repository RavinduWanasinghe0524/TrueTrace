"""
Detector 3 — Noise Variance Analysis
Analyses pixel-level noise distribution across image blocks.
(Implementation in Phase 4C)
"""
from models.analysis import DetectorResult


async def analyze_noise_variance(image_bytes: bytes) -> tuple[DetectorResult, bytes]:
    """Returns (result, noise_map_bytes)."""
    # TODO: implement in Phase 4C
    placeholder_map = image_bytes
    return (
        DetectorResult(
            detector="Noise Variance",
            result="Pass",
            score=20.0,
            details="Noise variance detector not yet implemented",
        ),
        placeholder_map,
    )
