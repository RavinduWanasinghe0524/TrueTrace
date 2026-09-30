"""
Detector 1 — Metadata / EXIF Forensics
Checks for editing software signatures, stripped camera data, and GPS anomalies.
(Implementation in Phase 4A)
"""
from models.analysis import DetectorResult


async def analyze_metadata(image_bytes: bytes) -> DetectorResult:
    # TODO: implement in Phase 4A
    return DetectorResult(
        detector="Metadata",
        result="Pass",
        score=20.0,
        details="Metadata detector not yet implemented",
    )
