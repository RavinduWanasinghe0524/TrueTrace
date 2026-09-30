"""
Detector 1 — Metadata / EXIF Forensics
Inspects EXIF/IPTC data for signs of software editing,
GPS inconsistencies, or missing camera fingerprints.
"""
import io
import exifread
from models.analysis import DetectorResult

# Known editing software signatures in EXIF
EDITING_SOFTWARE = [
    "adobe", "photoshop", "lightroom", "gimp", "paint", "affinity",
    "pixelmator", "canva", "snapseed", "vsco", "facetune", "meitu",
    "picsart", "fotor", "pixlr", "luminar", "capture one", "darktable",
    "rawtherapee", "corel", "paintshop", "illustrator", "inkscape",
]

CAMERA_MAKE_TAGS = ["Image Make", "Image Model", "EXIF LensModel"]


def _check_software(tags: dict) -> tuple[bool, str]:
    """Returns (is_edited, software_name)"""
    for key in ["Image Software", "Image ProcessingSoftware"]:
        val = str(tags.get(key, "")).lower()
        if val:
            for sw in EDITING_SOFTWARE:
                if sw in val:
                    return True, str(tags.get(key, ""))
    return False, ""


def _check_missing_camera_data(tags: dict) -> list[str]:
    """Flags absence of typical camera metadata."""
    missing = []
    if not tags.get("Image Make"):
        missing.append("Camera make missing")
    if not tags.get("Image Model"):
        missing.append("Camera model missing")
    if not tags.get("EXIF DateTimeOriginal"):
        missing.append("Original capture date missing")
    if not tags.get("EXIF ExposureTime"):
        missing.append("Exposure settings missing")
    return missing


def _check_datetime_mismatch(tags: dict) -> bool:
    """Checks if DateTimeOriginal and DateTime differ (sign of re-save)."""
    orig = str(tags.get("EXIF DateTimeOriginal", ""))
    modified = str(tags.get("Image DateTime", ""))
    if orig and modified and orig != modified:
        return True
    return False


def _check_gps_anomaly(tags: dict) -> bool:
    """Flags GPS coords that are exactly 0,0 (often copy-paste artifacts)."""
    lat = str(tags.get("GPS GPSLatitude", ""))
    lon = str(tags.get("GPS GPSLongitude", ""))
    if lat == "[0, 0, 0]" and lon == "[0, 0, 0]":
        return True
    return False


async def analyze_metadata(image_bytes: bytes) -> DetectorResult:
    flags: list[str] = []
    score = 0.0  # manipulation probability (0=clean, 100=manipulated)

    try:
        stream = io.BytesIO(image_bytes)
        tags = exifread.process_file(stream, details=False)

        if not tags:
            # No EXIF at all — very suspicious for a "camera photo"
            flags.append("No EXIF metadata found — possible scrubbing")
            score += 40.0
        else:
            # 1. Editing software
            edited, software = _check_software(tags)
            if edited:
                flags.append(f"Editing software detected: {software}")
                score += 50.0

            # 2. Missing camera fingerprints
            missing = _check_missing_camera_data(tags)
            for m in missing:
                flags.append(m)
            score += min(30.0, len(missing) * 8.0)

            # 3. DateTime mismatch
            if _check_datetime_mismatch(tags):
                flags.append("Capture date differs from file modification date")
                score += 15.0

            # 4. GPS anomaly
            if _check_gps_anomaly(tags):
                flags.append("GPS coordinates are exactly 0,0 — possible artifact")
                score += 10.0

    except Exception as e:
        flags.append(f"Metadata parse error: {str(e)[:80]}")
        score += 20.0

    score = min(100.0, round(score, 2))

    if score >= 60:
        result = "Fail"
        details = "Strong metadata indicators of editing: " + "; ".join(flags)
    elif score >= 25:
        result = "Warning"
        details = "Some metadata anomalies detected: " + "; ".join(flags) if flags else "Minor metadata inconsistencies"
    else:
        result = "Pass"
        details = "Metadata appears consistent with an authentic camera photo"

    return DetectorResult(
        detector="Metadata",
        result=result,
        score=score,
        details=details,
    )
