"""
Detector 4 — AI Forensics
Multi-technique heuristic detection using:
  - DCT frequency domain analysis (double-JPEG compression)
  - Copy-move detection via block matching
  - Chromatic aberration consistency
  - Statistical pixel distribution analysis
"""
import io
import numpy as np
import cv2
from PIL import Image
from models.analysis import DetectorResult


# ── Technique 1: Double JPEG Detection (DCT analysis) ────────────────────────
def _detect_double_jpeg(image_bytes: bytes) -> tuple[float, str]:
    """
    Detects double JPEG compression — a hallmark of edited images.
    Authentic images saved once show clean DCT histograms.
    Re-saved/edited images show characteristic double-quantisation peaks.
    """
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("YCbCr")
    y_channel = np.array(pil_img)[:, :, 0].astype(np.float32)

    h, w = y_channel.shape
    # Process 8x8 DCT blocks (standard JPEG block size)
    dct_coeffs = []
    for i in range(0, h - 8, 8):
        for j in range(0, w - 8, 8):
            block = y_channel[i:i+8, j:j+8]
            dct_block = cv2.dct(block)
            # Collect AC coefficients (exclude DC at [0,0])
            dct_coeffs.extend(dct_block[1:, 1:].flatten().tolist())

    if not dct_coeffs:
        return 15.0, "DCT analysis inconclusive (image too small)"

    coeffs = np.array(dct_coeffs)
    # Double compression creates periodic peaks in histogram
    hist, _ = np.histogram(coeffs, bins=64, range=(-128, 128))

    # Measure periodicity via autocorrelation
    hist_norm = hist.astype(np.float32) - hist.mean()
    autocorr = np.correlate(hist_norm, hist_norm, mode='full')
    mid = len(autocorr) // 2
    # Look for secondary peaks in autocorrelation (8 bins apart = 1 JPEG block)
    secondary = autocorr[mid+6:mid+12].max() / (autocorr[mid] + 1e-6)

    score = min(100.0, float(secondary * 80))
    if score >= 50:
        return score, f"Double JPEG compression detected (periodicity: {secondary:.3f})"
    return score, f"Single compression profile (periodicity: {secondary:.3f})"


# ── Technique 2: Copy-Move Detection ────────────────────────────────────────
def _detect_copy_move(image_bytes: bytes) -> tuple[float, str]:
    """
    Detects copy-move forgery by finding identical or very similar blocks
    at different locations in the image.
    """
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("L")  # grayscale
    # Resize for performance
    max_dim = 400
    w, h = pil_img.size
    if max(w, h) > max_dim:
        scale = max_dim / max(w, h)
        pil_img = pil_img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    gray = np.array(pil_img, dtype=np.float32)
    h, w = gray.shape
    block_size = 16
    step = 8

    blocks: dict[tuple, list[tuple]] = {}
    for y in range(0, h - block_size, step):
        for x in range(0, w - block_size, step):
            block = gray[y:y+block_size, x:x+block_size]
            # Simple hash: quantised mean + variance signature
            key = (
                round(float(block.mean()), 0),
                round(float(block.std()), 0),
                round(float(block[0, 0]), 0),
                round(float(block[-1, -1]), 0),
            )
            blocks.setdefault(key, []).append((y, x))

    # Count suspicious duplicates (same block, different far-away location)
    duplicate_pairs = 0
    for positions in blocks.values():
        if len(positions) >= 2:
            for i in range(len(positions) - 1):
                y1, x1 = positions[i]
                y2, x2 = positions[i + 1]
                dist = ((y2 - y1) ** 2 + (x2 - x1) ** 2) ** 0.5
                if dist > block_size * 3:  # far apart = suspicious
                    duplicate_pairs += 1

    total_blocks = max(1, (h // step) * (w // step))
    ratio = duplicate_pairs / total_blocks

    score = min(100.0, ratio * 500)
    if score >= 50:
        return score, f"Possible copy-move detected ({duplicate_pairs} matching block pairs)"
    return score, f"No significant copy-move patterns ({duplicate_pairs} pairs)"


# ── Technique 3: Chromatic Aberration Consistency ────────────────────────────
def _check_chromatic_aberration(image_bytes: bytes) -> tuple[float, str]:
    """
    Real camera lenses produce chromatic aberration — slight colour fringing
    at high-contrast edges. Composited images often lack this naturally.
    """
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    arr = np.array(pil_img, dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    # Compute edge maps per channel
    r_edges = cv2.Sobel(r, cv2.CV_64F, 1, 1).var()
    g_edges = cv2.Sobel(g, cv2.CV_64F, 1, 1).var()
    b_edges = cv2.Sobel(b, cv2.CV_64F, 1, 1).var()

    total = r_edges + g_edges + b_edges + 1e-6
    r_ratio = r_edges / total
    g_ratio = g_edges / total
    b_ratio = b_edges / total

    # Natural aberration: channels should differ slightly but consistently
    # Perfect uniformity is suspicious (synthetic/heavily processed)
    channel_std = np.std([r_ratio, g_ratio, b_ratio])

    # Very low std = channels too similar = possible AI/synthetic image
    if channel_std < 0.005:
        score = 30.0
        msg = f"Chromatic aberration unusually uniform (std: {channel_std:.4f}) — possible synthetic origin"
    elif channel_std > 0.15:
        score = 20.0
        msg = f"Natural chromatic aberration present (std: {channel_std:.4f})"
    else:
        score = 10.0
        msg = f"Chromatic aberration within normal range (std: {channel_std:.4f})"

    return score, msg


# ── Technique 4: Pixel Statistics ────────────────────────────────────────────
def _check_pixel_statistics(image_bytes: bytes) -> tuple[float, str]:
    """
    Checks for statistical anomalies in pixel distribution.
    Edited images often have unusual histogram spikes or gaps.
    """
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("L")
    arr = np.array(pil_img).flatten()

    hist, _ = np.histogram(arr, bins=256, range=(0, 256))
    hist_norm = hist / (hist.sum() + 1e-6)

    # Count histogram gaps (0-count bins in mid-tones = sign of manipulation)
    mid_tone = hist[32:224]
    gap_count = int((mid_tone == 0).sum())
    spike_count = int((hist_norm > 0.05).sum())  # any bin >5% of pixels

    score = 0.0
    msgs = []

    if gap_count > 20:
        msgs.append(f"{gap_count} histogram gaps in mid-tones")
        score += min(35.0, gap_count * 1.2)

    if spike_count > 0:
        msgs.append(f"{spike_count} abnormal pixel concentration spikes")
        score += min(25.0, spike_count * 8)

    msg = "; ".join(msgs) if msgs else "Pixel histogram appears natural"
    return min(60.0, score), msg


# ── Main AI Forensics Detector ───────────────────────────────────────────────
async def analyze_ai_forensics(image_bytes: bytes) -> DetectorResult:
    flags: list[str] = []
    total_score = 0.0

    techniques = [
        ("Double JPEG", _detect_double_jpeg, 0.35),
        ("Copy-Move",   _detect_copy_move,   0.30),
        ("Chromatic",   _check_chromatic_aberration, 0.15),
        ("Pixel Stats", _check_pixel_statistics, 0.20),
    ]

    for name, fn, weight in techniques:
        try:
            score, msg = fn(image_bytes)
            flags.append(f"[{name}] {msg}")
            total_score += score * weight
        except Exception as e:
            flags.append(f"[{name}] Skipped: {str(e)[:60]}")

    total_score = min(100.0, round(total_score, 2))

    if total_score >= 60:
        result = "Fail"
        details = f"Multiple AI forensic signals detected (score: {total_score:.0f}). " + " | ".join(flags)
    elif total_score >= 25:
        result = "Warning"
        details = f"Some forensic anomalies (score: {total_score:.0f}). " + " | ".join(flags)
    else:
        result = "Pass"
        details = f"No significant forensic signals (score: {total_score:.0f}). Image appears authentic."

    return DetectorResult(
        detector="AI Forensics",
        result=result,
        score=total_score,
        details=details,
    )
