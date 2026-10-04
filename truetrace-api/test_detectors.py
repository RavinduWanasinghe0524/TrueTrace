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

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from detectors.metadata import analyze_metadata
from detectors.ela import analyze_ela
from detectors.noise_variance import analyze_noise_variance
from detectors.ai_forensics import analyze_ai_forensics
from core.analyzer import analyze_image


def make_test_image(width=300, height=300) -> bytes:
    """Creates a synthetic JPEG image for testing."""
    img = Image.new("RGB", (width, height), color=(120, 150, 180))
    draw = ImageDraw.Draw(img)
    draw.rectangle([50, 50, 150, 150], fill=(200, 100, 80))
    draw.ellipse([160, 160, 260, 260], fill=(80, 180, 120))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


async def main():
    print("=" * 60)
    print("  TrueTrace - Detector & Pipeline Smoke Test")
    print("=" * 60)

    image_bytes = make_test_image()
    print(f"Test image: {len(image_bytes)//1024} KB synthetic JPEG\n")

    # Full analyzer run
    result, verdict = await analyze_image(image_bytes)

    print(f"Overall Verdict     : {verdict}")
    print(f"Category            : {result.category}")
    print(f"Is AI Generated     : {result.isAiGenerated}")
    print(f"Authenticity Score  : {result.finalScore}%")
    print(f"Confidence          : {result.confidence}%")
    print(f"Summary             : {result.summary}")
    print("-" * 60)

    for r in result.results:
        print(f"[{r.detector}] -> {r.result} (score: {r.score:.1f})")
        print(f"  Details: {r.details[:100]}...\n")

    print("=" * 60)
    print("  All detectors & pipeline passed smoke test successfully!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
