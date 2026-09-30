"""
Detector 2 — Error Level Analysis (ELA)
Re-compresses the image at a known quality and measures compression
inconsistencies. Edited regions show different error levels than originals.
"""
import io
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
from models.analysis import DetectorResult


def _compute_ela(image_bytes: bytes, quality: int = 90) -> tuple[np.ndarray, np.ndarray]:
    """
    Returns (original_array, ela_array) where ela_array is the
    amplified difference between original and re-compressed image.
    """
    original = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Re-compress at known quality
    buffer = io.BytesIO()
    original.save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)
    recompressed = Image.open(buffer).convert("RGB")

    orig_arr = np.array(original, dtype=np.float32)
    recomp_arr = np.array(recompressed, dtype=np.float32)

    # Compute absolute difference and amplify
    ela_arr = np.abs(orig_arr - recomp_arr)
    return orig_arr, ela_arr


def _ela_score(ela_arr: np.ndarray) -> float:
    """
    Scores manipulation probability based on ELA statistics.
    Authentic images have low, uniform ELA. Edited areas spike.
    """
    # Overall mean error (higher = more inconsistency)
    mean_error = ela_arr.mean()

    # Split into blocks and compute per-block means
    h, w = ela_arr.shape[:2]
    block_size = max(16, min(h, w) // 16)
    block_means = []

    for y in range(0, h - block_size, block_size):
        for x in range(0, w - block_size, block_size):
            block = ela_arr[y:y+block_size, x:x+block_size]
            block_means.append(block.mean())

    if not block_means:
        return round(mean_error * 2, 2)

    block_means = np.array(block_means)
    mean_of_means = block_means.mean()
    std_of_means  = block_means.std()

    # High std = some blocks are very different from others = splicing
    coefficient_of_variation = std_of_means / (mean_of_means + 1e-6)

    # Normalize to 0–100 manipulation probability
    # Empirical: authentic images typically CV < 0.6, edited > 1.0
    score = min(100.0, coefficient_of_variation * 70.0 + mean_error * 0.5)
    return round(float(score), 2)


def _ela_to_image_bytes(ela_arr: np.ndarray) -> bytes:
    """Converts ELA array to a viewable JPEG with amplified contrast."""
    # Amplify for visibility
    amplified = ela_arr * 15
    amplified = np.clip(amplified, 0, 255).astype(np.uint8)
    ela_img = Image.fromarray(amplified)

    # Enhance contrast further
    ela_img = ImageEnhance.Contrast(ela_img).enhance(2.0)

    buf = io.BytesIO()
    ela_img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


async def analyze_ela(image_bytes: bytes) -> tuple[DetectorResult, bytes]:
    """Returns (DetectorResult, ela_image_bytes)."""
    try:
        orig_arr, ela_arr = _compute_ela(image_bytes, quality=90)
        score = _ela_score(ela_arr)
        ela_image_bytes = _ela_to_image_bytes(ela_arr)

        mean_err = float(ela_arr.mean())

        if score >= 60:
            result = "Fail"
            details = (
                f"High ELA inconsistency detected (score: {score:.0f}). "
                f"Mean pixel error: {mean_err:.1f}. "
                "Significant regions show abnormal compression artifacts — "
                "consistent with copy-paste, clone stamp, or composite editing."
            )
        elif score >= 25:
            result = "Warning"
            details = (
                f"Moderate ELA variance (score: {score:.0f}). "
                f"Mean pixel error: {mean_err:.1f}. "
                "Some regions differ in compression level — possible minor edits."
            )
        else:
            result = "Pass"
            details = (
                f"ELA is uniform across the image (score: {score:.0f}). "
                "Compression levels are consistent — no splicing detected."
            )

        return (
            DetectorResult(
                detector="ELA",
                result=result,
                score=score,
                details=details,
            ),
            ela_image_bytes,
        )

    except Exception as e:
        # Fallback: return a blank white ELA image
        blank = Image.new("RGB", (100, 100), color=(255, 255, 255))
        buf = io.BytesIO()
        blank.save(buf, format="JPEG")
        return (
            DetectorResult(
                detector="ELA",
                result="Warning",
                score=30.0,
                details=f"ELA could not complete: {str(e)[:80]}",
            ),
            buf.getvalue(),
        )
