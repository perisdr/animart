"""Create cached WebP previews with Tinify, without third-party dependencies."""
import argparse
import base64
import getpass
import hashlib
import json
import os
from pathlib import Path
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OPTIONS = {"resize": {"method": "fit", "width": 640, "height": 640},
           "convert": {"type": "image/webp"}}


def request(url, data, key, content_type):
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.netloc != "api.tinify.com":
        raise ValueError("Unexpected Tinify endpoint")
    auth = base64.b64encode(("api:" + key).encode()).decode()
    req = Request(url, data=data, headers={"Authorization": "Basic " + auth,
                                         "Content-Type": content_type})
    with urlopen(req, timeout=90) as response:
        return response.read(), response.headers


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    manifest_path = ROOT / "previews/manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    records = json.loads((ROOT / "data/wallpapers.json").read_text(encoding="utf-8"))
    pending = []
    for record in records:
        source = ROOT / record["downloads"][0]["path"]
        destination = ROOT / record["preview"]
        fingerprint = hashlib.sha256(source.read_bytes() + json.dumps(OPTIONS).encode()).hexdigest()
        if (manifest.get(record["id"]) == fingerprint and destination.exists()
                and destination.stat().st_size > 0):
            print("Cached:", record["id"])
            continue
        pending.append((record, source, destination, fingerprint))
        print("Pending:", record["id"])
    if args.dry_run or not pending:
        print(f"{len(pending)} previews need generation.")
        return
    key = os.environ.get("TINIFY_API_KEY") or getpass.getpass("Tinify API key: ")
    if not key.strip():
        raise ValueError("A Tinify API key is required")
    for record, source, destination, fingerprint in pending:
        _, headers = request("https://api.tinify.com/shrink", source.read_bytes(), key, "image/png")
        output, headers = request(headers["Location"], json.dumps(OPTIONS).encode(), key,
                                  "application/json")
        if output[:4] != b"RIFF" or output[8:12] != b"WEBP":
            raise ValueError("Tinify did not return a WebP image")
        destination.parent.mkdir(parents=True, exist_ok=True)
        temporary = destination.with_suffix(".tmp")
        temporary.write_bytes(output)
        temporary.replace(destination)
        manifest[record["id"]] = fingerprint
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        print(f"Created {record['preview']} ({len(output)} bytes); "
              f"monthly quota count: {headers.get('Compression-Count', 'unknown')}")


if __name__ == "__main__":
    try:
        main()
    except HTTPError as error:
        print(f"Tinify HTTP {error.code}; check credentials, quota, or service status.", file=sys.stderr)
        sys.exit(1)
    except (URLError, ValueError, OSError) as error:
        print(f"Thumbnail generation failed ({type(error).__name__}). No credentials logged.", file=sys.stderr)
        sys.exit(1)
