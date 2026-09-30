"""
Detector 3 — Noise Variance Analysis
Analyses pixel-level noise distribution across image blocks.
Cloned or composited regions exhibit statistically abnormal noise patterns.
Uses OpenCV for Laplacian-based noise estimation per block.
"""
import io
import numpy as np
import cv2
from PIL import Image
from models.analysis import DetectorResult


def _image_to_gray_array(image_bytes: bytes) -> np.ndarray:
    """Converts image bytes to a grayscale OpenCV array."""
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    arr = np.array(pil_img)
    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
    return gray


def _estimate_block_noise(gray: np.ndarray, block_size: int = 32) -> np.ndarray:
    """
    Estimates local noise variance per block using the Laplacian method.
    High variance = sharp/noisy, Low variance = smooth/blurred.
    Returns a 2D array of per-block noise variances.
    """
    h, w = gray.shape
    rows = h // block_size
    cols = w // block_size
    noise_map = np.zeros((rows, cols), dtype=np.float32)

    laplacian = cv2.Laplacian(gray, cv2.CV_64F)

    for r in range(rows):
        for c in range(cols):
            y0, y1 = r * block_size, (r + 1) * block_size
            x0, x1 = c * block_size, (c + 1) * block_size
            block = laplacian[y0:y1, x0:x1]
            noise_map[r, c] = float(block.var())

    return noise_map


def _noise_score(noise_map: np.ndarray) -> tuple[float, list[str]]:
    """
    Scores manipulation probability from noise variance map.
    Authentic images have relatively uniform noise patterns.
    """
    flags: list[str] = []
    flat = noise_map.flatten()

    mean_noise = float(flat.mean())
    std_noise  = float(flat.std())
    cv = std_noise / (mean_noise + 1e-6)

    # Detect outlier blocks (>3 std from mean)
    threshold = mean_noise + 3 * std_noise
    outlier_count = int((flat > threshold).sum())
    outlier_ratio = outlier_count / max(len(flat), 1)

    score = 0.0

    if cv > 1.5:
        flags.append(f"High noise coefficient of variation ({cv:.2f})")
        score += min(40.0, cv * 20)

    if outlier_ratio > 0.05:
        flags.append(f"{outlier_count} blocks ({outlier_ratio*100:.1f}%) show abnormal noise")
        score += min(40.0, outlier_ratio * 400)

    # Very low noise everywhere = possibly AI-generated or heavily processed
    if mean_noise < 5.0:
        flags.append(f"Unusually low noise level (mean: {mean_noise:.1f}) — may be AI-generated or heavily smoothed")
        score += 20.0

    return min(100.0, round(score, 2)), flags


def _noise_map_to_image(noise_map: np.ndarray, original_size: tuple[int, int]) -> bytes:
    """Renders the noise variance map as a heatmap JPEG."""
    # Normalize to 0–255
    nm = noise_map.copy()
    nm_min, nm_max = nm.min(), nm.max()
    if nm_max > nm_min:
        nm = (nm - nm_min) / (nm_max - nm_min) * 255
    nm = nm.astype(np.uint8)

    # Apply colour map (JET = blue→green→red, red = high noise = suspicious)
    coloured = cv2.applyColorMap(nm, cv2.COLORMAP_JET)

    # Resize to original dimensions for display
    coloured_resized = cv2.resize(
        coloured, (original_size[0], original_size[1]),
        interpolation=cv2.INTER_NEAREST,
    )
    coloured_rgb = cv2.cvtColor(coloured_resized, cv2.COLOR_BGR2RGB)

    pil_out = Image.fromarray(coloured_rgb)
    buf = io.BytesIO()
    pil_out.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


async def analyze_noise_variance(image_bytes: bytes) -> tuple[DetectorResult, bytes]:
    """Returns (DetectorResult, noise_map_image_bytes)."""
    try:
        gray = _image_to_gray_array(image_bytes)
        h, w = gray.shape
        block_size = max(16, min(h, w) // 24)

        noise_map = _estimate_block_noise(gray, block_size=block_size)
        score, flags = _noise_score(noise_map)
        noise_map_bytes = _noise_map_to_image(noise_map, (w, h))

        if score >= 60:
            result = "Fail"
            details = (
                f"Abnormal noise distribution detected (score: {score:.0f}). "
                + "; ".join(flags) + ". "
                "Inconsistent noise patterns across blocks are a strong indicator "
                "of region cloning, splicing, or compositing."
            )
        elif score >= 25:
            result = "Warning"
            details = (
                f"Moderate noise irregularities (score: {score:.0f}). "
                + ("; ".join(flags) + ". " if flags else "")
                + "Some blocks show different noise characteristics — possible light editing."
            )
        else:
            result = "Pass"
            details = (
                f"Noise distribution is uniform across image blocks (score: {score:.0f}). "
                "No evidence of splicing or region cloning."
            )

        return (
            DetectorResult(
                detector="Noise Variance",
                result=result,
                score=score,
                details=details,
            ),
            noise_map_bytes,
        )

    except Exception as e:
        blank = Image.new("RGB", (100, 100), color=(20, 20, 40))
        buf = io.BytesIO()
        blank.save(buf, format="JPEG")
        return (
            DetectorResult(
                detector="Noise Variance",
                result="Warning",
                score=25.0,
                details=f"Noise analysis could not complete: {str(e)[:80]}",
            ),
            buf.getvalue(),
        )
