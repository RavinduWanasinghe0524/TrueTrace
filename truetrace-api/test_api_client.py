import urllib.request
import json
import sys
sys.path.insert(0, ".")
from tests.test_benchmark_1000 import make_ai_generated_image, make_tampered_document

def test_api(name, img_bytes):
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    part1 = f"--{boundary}\r\nContent-Disposition: form-data; name=\"image\"; filename=\"{name}\"\r\nContent-Type: image/jpeg\r\n\r\n".encode("utf-8")
    part2 = f"\r\n--{boundary}--\r\n".encode("utf-8")
    body = part1 + img_bytes + part2

    req = urllib.request.Request(
        "http://localhost:8000/api/analyze",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        print(f"API Output for '{name}':")
        print("  Verdict       :", res.get("verdict"))
        print("  Is AI Gen     :", res.get("isAiGenerated"))
        print("  Category      :", res.get("category"))
        print("  Authenticity  :", res.get("finalScore"))
        print("  Summary       :", res.get("summary"))
        print()

test_api("ai_sample.jpg", make_ai_generated_image(1000))
test_api("doc_sample.jpg", make_tampered_document(2000))
