"""
TrueTrace 1000 Test Cases Benchmark Suite
Evaluates forensic detection performance across 4 critical categories:
  1. AI-Generated Images (250 cases) — Diffusion rolloff, GAN artifacts, synthetic noise
  2. Tampered Documents (250 cases) — Altered numbers/dates, pasted digital font, whiteout boxes
  3. Manipulated / Changed Images (250 cases) — Copy-move cloning, foreign splicing, double JPEG
  4. Authentic Images & Documents (250 cases) — Real sensor PRNU noise, natural spectra, scanned paper

Usage:
  python tests/test_benchmark_1000.py --cases 1000
  python tests/test_benchmark_1000.py --cases 100   # Quick run
"""
import asyncio
import io
import sys
import os
import time
import json
import argparse
import random
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFilter

# Add root directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from core.analyzer import analyze_image


# ==============================================================================
# 1. TEST CASE GENERATORS
# ==============================================================================

def make_authentic_image(seed: int, size: int = 256) -> bytes:
    """Simulates an authentic photograph with natural 1/f spectrum and sensor PRNU noise."""
    rng = np.random.RandomState(seed)
    
    # 1/f natural noise background
    fx = np.fft.fftfreq(size).reshape(1, -1)
    fy = np.fft.fftfreq(size).reshape(-1, 1)
    f = np.sqrt(fx**2 + fy**2)
    f[0, 0] = 1.0
    power_law = 1.0 / (f ** 1.35)
    power_law[0, 0] = 0.0

    channels = []
    base_color = rng.randint(60, 190, size=3)
    for c in range(3):
        white = rng.randn(size, size)
        pink = np.real(np.fft.ifft2(np.fft.fft2(white) * power_law))
        pink = (pink - pink.min()) / (pink.max() - pink.min() + 1e-6)
        ch = np.clip(base_color[c] + pink * 60.0, 0, 255)
        # Add realistic sensor shot noise (dependent on pixel brightness)
        sensor_noise = rng.normal(0, 3.5, (size, size))
        ch = np.clip(ch + sensor_noise, 0, 255).astype(np.uint8)
        channels.append(ch)

    rgb = np.stack(channels, axis=-1)
    img = Image.fromarray(rgb)
    draw = ImageDraw.Draw(img)
    # Add natural soft shapes
    x1, y1 = rng.randint(20, 80), rng.randint(20, 80)
    x2, y2 = x1 + rng.randint(40, 100), y1 + rng.randint(40, 100)
    draw.ellipse([x1, y1, x2, y2], fill=tuple(rng.randint(50, 210, size=3).tolist()))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=int(rng.randint(85, 95)))
    return buf.getvalue()


def make_authentic_document(seed: int, size: int = 256) -> bytes:
    """Simulates an authentic scanned document with paper texture, ink bleed, and scanner grain."""
    rng = np.random.RandomState(seed)
    # Off-white paper background (225-245)
    paper_base = rng.randint(230, 245)
    paper = rng.normal(paper_base, 3.0, (size, size)).clip(200, 255).astype(np.uint8)
    img = Image.fromarray(paper).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Scanned text lines
    line_y = 30
    while line_y < size - 30:
        line_len = rng.randint(100, size - 40)
        draw.line([(30, line_y), (30 + line_len, line_y)], fill=(40, 40, 45), width=2)
        # Simulate word dashes
        for x in range(35, 30 + line_len, rng.randint(18, 35)):
            draw.line([(x, line_y - 2), (x, line_y + 2)], fill=(45, 45, 50), width=1)
        line_y += rng.randint(16, 24)

    # Natural scanner optical blur and bleed
    img = img.filter(ImageFilter.GaussianBlur(radius=0.6))

    # Add scanner sensor grain across entire image
    arr = np.array(img, dtype=np.float32)
    scanner_grain = rng.normal(0, 2.5, arr.shape)
    arr = np.clip(arr + scanner_grain, 0, 255).astype(np.uint8)
    img = Image.fromarray(arr)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=int(rng.randint(88, 94)))
    return buf.getvalue()


def make_ai_generated_image(seed: int, size: int = 256) -> bytes:
    """
    Simulates AI-generated imagery (Stable Diffusion, Midjourney, DALL-E, GANs):
      - Smooth spectral rolloff (attenuated high-frequency band)
      - Periodic GAN grid artifacts
      - Over-smoothed local textures with zero sensor noise
      - High uniform saturation
    """
    rng = np.random.RandomState(seed)
    mode = seed % 3

    if mode == 0:
        # Diffusion model simulation: Low-pass filtered latent with super-smooth rolloff
        arr = rng.uniform(80, 220, (size, size, 3)).astype(np.float32)
        # Heavy Gaussian smoothing typical of diffusion latent decoders
        smoothed = cv2.GaussianBlur(arr, (9, 9), 0)
        # Artificial uniform low noise
        noise = rng.normal(0, 0.4, smoothed.shape)
        final = np.clip(smoothed + noise, 0, 255).astype(np.uint8)
        img = Image.fromarray(final)
        draw = ImageDraw.Draw(img)
        # Sharp high-contrast edges over smooth background
        draw.polygon([(40, 40), (120, 50), (90, 140)], fill=(240, 80, 190))
        draw.rectangle([140, 100, 210, 180], fill=(40, 210, 240))

    elif mode == 1:
        # GAN simulation: Periodic lattice / checkerboard artifacts
        img = Image.new("RGB", (size, size), color=(rng.randint(100, 180), rng.randint(120, 200), rng.randint(130, 210)))
        draw = ImageDraw.Draw(img)
        draw.ellipse([50, 50, 200, 200], fill=(220, 140, 90))
        arr = np.array(img, dtype=np.float32)

        # Inject periodic mid-frequency GAN grid (checkerboard pattern)
        grid_freq = 16
        y_grid, x_grid = np.ogrid[:size, :size]
        gan_pattern = np.sin(2 * np.pi * x_grid / grid_freq) * np.sin(2 * np.pi * y_grid / grid_freq) * 7.0
        for c in range(3):
            arr[:, :, c] += gan_pattern
        final = np.clip(arr, 0, 255).astype(np.uint8)
        img = Image.fromarray(final)

    else:
        # High saturation / flat skin AI portrait
        hsv = np.zeros((size, size, 3), dtype=np.uint8)
        hsv[:, :, 0] = rng.randint(10, 160)       # Hue
        hsv[:, :, 1] = rng.randint(185, 240)      # High uniform saturation
        hsv[:, :, 2] = rng.randint(150, 230)      # Value
        bgr = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        bgr = cv2.GaussianBlur(bgr, (7, 7), 0)
        img = Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(img)
        draw.ellipse([60, 40, 190, 210], fill=(255, 190, 170))

    buf = io.BytesIO()
    # AI generators typically export PNG or high quality single JPEG
    img.save(buf, format="JPEG", quality=95)
    return buf.getvalue()


def make_tampered_document(seed: int, size: int = 256) -> bytes:
    """
    Simulates document tampering:
      - Sharp digital text pasted onto scanned noisy background (zero noise, sharp aliasing)
      - Whiteout boxes concealing original text
      - Mismatched compression or pasted stamps
    """
    rng = np.random.RandomState(seed)
    mode = seed % 3

    # Start with base authentic scanned document
    doc_bytes = make_authentic_document(seed, size)
    doc_img = Image.open(io.BytesIO(doc_bytes)).convert("RGB")
    draw = ImageDraw.Draw(doc_img)

    if mode == 0:
        # Whiteout box: pure flat white rectangle concealing text/numbers
        wx = rng.randint(60, 140)
        wy = rng.randint(50, 160)
        draw.rectangle([wx, wy, wx + 65, wy + 25], fill=(255, 255, 255))
        # Draw altered digital number with razor-sharp edges and NO paper grain
        draw.text((wx + 8, wy + 6), "$9,450.00", fill=(10, 10, 10))

    elif mode == 1:
        # Digital font insertion without scanner noise
        x, y = rng.randint(50, 120), rng.randint(40, 180)
        # Erase with near-flat patch
        draw.rectangle([x, y, x + 80, y + 20], fill=(245, 245, 245))
        draw.line([(x + 2, y + 10), (x + 75, y + 10)], fill=(0, 0, 0), width=3)
        draw.line([(x + 20, y + 4), (x + 20, y + 16)], fill=(0, 0, 0), width=3)

    else:
        # Pasted digital colored stamp / signature with mismatched noise
        sx, sy = rng.randint(60, 150), rng.randint(70, 170)
        draw.rectangle([sx, sy, sx + 50, sy + 35], outline=(180, 20, 20), width=3)
        draw.text((sx + 6, sy + 8), "PAID", fill=(200, 15, 15))

    buf = io.BytesIO()
    # Re-save as JPEG (creates re-compression and edge discontinuity)
    doc_img.save(buf, format="JPEG", quality=82)
    return buf.getvalue()


def make_manipulated_image(seed: int, size: int = 256) -> bytes:
    """
    Simulates photo manipulation:
      - Copy-move cloning (duplicated regions across image)
      - Foreign object splicing with mismatched noise
      - Double JPEG recompression
    """
    rng = np.random.RandomState(seed)
    mode = seed % 3

    # Base authentic image
    base_bytes = make_authentic_image(seed, size)
    base_img = Image.open(io.BytesIO(base_bytes)).convert("RGB")

    if mode == 0:
        # Copy-move cloning: copy a 40x40 block from (x1, y1) to (x2, y2)
        x1, y1 = 30, 30
        x2, y2 = 150, 150
        block = base_img.crop((x1, y1, x1 + 45, y1 + 45))
        base_img.paste(block, (x2, y2))

    elif mode == 1:
        # Foreign spliced block with different noise profile and color
        sx, sy = rng.randint(60, 130), rng.randint(60, 130)
        foreign = Image.new("RGB", (50, 50), color=tuple(rng.randint(30, 240, size=3).tolist()))
        f_draw = ImageDraw.Draw(foreign)
        f_draw.ellipse([5, 5, 45, 45], fill=(255, 230, 40))
        base_img.paste(foreign, (sx, sy))

    else:
        # Localized blur tampering (airbrushing / smudge)
        bx, by = rng.randint(40, 140), rng.randint(40, 140)
        crop_box = base_img.crop((bx, by, bx + 60, by + 60))
        blurred_crop = crop_box.filter(ImageFilter.GaussianBlur(radius=4.0))
        base_img.paste(blurred_crop, (bx, by))

    buf = io.BytesIO()
    # Re-save with distinct quality factor (double JPEG artifact)
    base_img.save(buf, format="JPEG", quality=int(rng.choice([65, 75, 92])))
    return buf.getvalue()


# ==============================================================================
# 2. BENCHMARK RUNNER & METRICS
# ==============================================================================

async def evaluate_single_case(case_id: int, category: str, image_bytes: bytes) -> dict:
    """Runs a single test case through the TrueTrace forensic analyzer."""
    start_t = time.perf_counter()
    result, verdict = await analyze_image(image_bytes)
    duration_ms = (time.perf_counter() - start_t) * 1000.0

    return {
        "id": case_id,
        "actual": category,
        "predicted_verdict": verdict,
        "predicted_category": result.category,
        "is_ai_generated": result.isAiGenerated,
        "authenticity_score": result.finalScore,
        "confidence": result.confidence,
        "duration_ms": round(duration_ms, 1),
    }


async def run_benchmark(total_cases: int = 1000, batch_size: int = 25):
    print("=" * 72)
    print(f"  TrueTrace 1,000 Forensic Test Cases Benchmark")
    print("=" * 72)
    print(f"  Evaluating {total_cases} forensic cases across 4 key classes:")
    print("    • 250 AI-Generated Images (Diffusion, GANs, Synthetic)")
    print("    • 250 Tampered Documents (Altered text, whiteout, spliced stamps)")
    print("    • 250 Manipulated Photos (Copy-move, foreign splicing, double JPEG)")
    print("    • 250 Authentic Photos & Documents (Real PRNU, natural spectra)")
    print("=" * 72)

    cases_per_cat = total_cases // 4

    # Build dataset
    print(f"\n[1/3] Generating {total_cases} test samples...")
    t0 = time.time()
    dataset = []

    for i in range(cases_per_cat):
        dataset.append((i, "ai_generated", make_ai_generated_image(1000 + i)))
    for i in range(cases_per_cat):
        dataset.append((cases_per_cat + i, "document_tampered", make_tampered_document(2000 + i)))
    for i in range(cases_per_cat):
        dataset.append((2 * cases_per_cat + i, "manipulated_image", make_manipulated_image(3000 + i)))
    for i in range(cases_per_cat):
        # Alternate between authentic photo and authentic document
        fn = make_authentic_image if i % 2 == 0 else make_authentic_document
        dataset.append((3 * cases_per_cat + i, "authentic", fn(4000 + i)))

    print(f"      Generated {len(dataset)} samples in {time.time() - t0:.2f}s.")

    # Execute analysis in concurrent batches
    print(f"\n[2/3] Executing forensic analysis engine (batch size: {batch_size})...")
    results = []
    start_eval = time.time()

    for idx in range(0, len(dataset), batch_size):
        batch = dataset[idx:idx + batch_size]
        tasks = [evaluate_single_case(c_id, cat, data) for c_id, cat, data in batch]
        batch_res = await asyncio.gather(*tasks)
        results.extend(batch_res)

        done = len(results)
        pct = (done / total_cases) * 100.0
        elapsed = time.time() - start_eval
        rate = done / (elapsed + 1e-6)
        print(f"      [{done:4d}/{total_cases}] ({pct:5.1f}%) — {rate:4.1f} cases/sec", end="\r")

    print(f"\n      Completed in {time.time() - start_eval:.2f}s.")

    # Compute Statistics
    print(f"\n[3/3] Computing performance metrics & confusion matrix...")
    categories = ["ai_generated", "document_tampered", "manipulated_image", "authentic"]
    
    # Confusion matrix: [actual][predicted]
    conf_matrix = {act: {pred: 0 for pred in categories} for act in categories}

    for r in results:
        act = r["actual"]
        pred = r["predicted_category"]
        if pred not in categories:
            pred = "manipulated_image"
        conf_matrix[act][pred] += 1

    # Per-category metrics
    metrics = {}
    total_correct = 0

    for cat in categories:
        tp = conf_matrix[cat][cat]
        fn = sum(conf_matrix[cat][p] for p in categories if p != cat)
        fp = sum(conf_matrix[a][cat] for a in categories if a != cat)
        tn = sum(conf_matrix[a][p] for a in categories for p in categories if a != cat and p != cat)

        total_correct += tp
        precision = (tp / (tp + fp)) * 100.0 if (tp + fp) > 0 else 0.0
        recall    = (tp / (tp + fn)) * 100.0 if (tp + fn) > 0 else 0.0
        f1        = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

        metrics[cat] = {
            "samples": cases_per_cat,
            "tp": tp, "fp": fp, "fn": fn,
            "precision": round(precision, 1),
            "recall": round(recall, 1),
            "f1_score": round(f1, 1),
        }

    overall_accuracy = (total_correct / total_cases) * 100.0
    auth_fpr = (metrics["authentic"]["fp"] / (cases_per_cat * 3)) * 100.0

    # Print summary report
    print("\n" + "=" * 72)
    print("                     BENCHMARK EVALUATION REPORT")
    print("=" * 72)
    print(f"  Overall Accuracy : {overall_accuracy:.2f}% ({total_correct}/{total_cases} test cases)")
    print(f"  False Positive Rate on Authentic: {auth_fpr:.2f}%")
    print("-" * 72)
    print(f"  {'Category':<22} | {'Samples':<8} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<8}")
    print("-" * 72)

    cat_labels = {
        "ai_generated": "AI-Generated",
        "document_tampered": "Tampered Document",
        "manipulated_image": "Manipulated Photo",
        "authentic": "Authentic (Clean)",
    }

    for cat in categories:
        m = metrics[cat]
        print(f"  {cat_labels[cat]:<22} | {m['samples']:<8} | {m['precision']:>8.1f}% | {m['recall']:>8.1f}% | {m['f1_score']:>7.1f}%")

    print("-" * 72)
    print("\n  Confusion Matrix (Actual Rows x Predicted Columns):")
    print(f"  {'Actual / Predicted':<20} | {'AI Gen':<8} | {'Doc Tamp':<8} | {'Manip':<8} | {'Authentic':<8}")
    print("  " + "-" * 62)
    for act in categories:
        row = conf_matrix[act]
        print(f"  {cat_labels[act]:<20} | {row['ai_generated']:<8} | {row['document_tampered']:<8} | {row['manipulated_image']:<8} | {row['authentic']:<8}")

    print("=" * 72)

    # Save results to JSON
    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_cases": total_cases,
        "overall_accuracy_pct": round(overall_accuracy, 2),
        "false_positive_rate_pct": round(auth_fpr, 2),
        "per_category_metrics": metrics,
        "confusion_matrix": conf_matrix,
    }

    out_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "benchmark_results.json"))
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"\n  Detailed benchmark report saved to:\n  -> {out_file}\n")
    return overall_accuracy


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TrueTrace 1000 Cases Benchmark")
    parser.add_argument("--cases", type=int, default=1000, help="Total test cases to run (default: 1000)")
    parser.add_argument("--batch", type=int, default=25, help="Batch concurrency (default: 25)")
    args = parser.parse_args()

    asyncio.run(run_benchmark(total_cases=args.cases, batch_size=args.batch))
