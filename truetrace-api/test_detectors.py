"""
Smoke test for all 4 forensic detectors.
Creates a synthetic test image and runs each detector.
Usage: .\venv\Scripts\python test_detectors.py
"""
import asyncio
import io
import sys
import numpy as np
from PIL import Image, ImageDraw

# Add project root to path
sys.path.insert(0, ".")

from detectors.metadata import analyze_metadata
from detectors.ela import analyze_ela
from detectors.noise_variance import analyze_noise_variance
from detectors.ai_forensics import analyze_ai_forensics


def make_test_image(width=300, height=300) -> bytes:
    """Creates a synthetic JPEG image for testing."""
    img = Image.new("RGB", (width, height), color=(120, 150, 180))
    draw = ImageDraw.Draw(img)
    # Add some shapes to make it interesting
    draw.rectangle([50, 50, 150, 150], fill=(200, 100, 80))
    draw.ellipse([160, 160, 260, 260], fill=(80, 180, 120))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


async def main():
    print("=" * 55)
    print("  TrueTrace — Detector Smoke Test")
    print("=" * 55)

    image_bytes = make_test_image()
    print(f"Test image: {len(image_bytes)//1024} KB synthetic JPEG\n")

    # ── Detector 1: Metadata ─────────────────────────────
    print("[1/4] Running Metadata detector...")
    result = await analyze_metadata(image_bytes)
    print(f"  Result : {result.result}")
    print(f"  Score  : {result.score}")
    print(f"  Details: {result.details[:80]}...")
    print()

    # ── Detector 2: ELA ──────────────────────────────────
    print("[2/4] Running ELA detector...")
    result, ela_img = await analyze_ela(image_bytes)
    print(f"  Result    : {result.result}")
    print(f"  Score     : {result.score}")
    print(f"  ELA image : {len(ela_img)//1024} KB")
    print(f"  Details   : {result.details[:80]}...")
    print()

    # ── Detector 3: Noise Variance ───────────────────────
    print("[3/4] Running Noise Variance detector...")
    result, noise_map = await analyze_noise_variance(image_bytes)
    print(f"  Result     : {result.result}")
    print(f"  Score      : {result.score}")
    print(f"  Noise map  : {len(noise_map)//1024} KB")
    print(f"  Details    : {result.details[:80]}...")
    print()

    # ── Detector 4: AI Forensics ─────────────────────────
    print("[4/4] Running AI Forensics detector...")
    result = await analyze_ai_forensics(image_bytes)
    print(f"  Result : {result.result}")
    print(f"  Score  : {result.score}")
    print(f"  Details: {result.details[:80]}...")
    print()

    print("=" * 55)
    print("  All 4 detectors passed smoke test! ✅")
    print("=" * 55)


asyncio.run(main())
