"""Compress named wallpapers and create 640x360 WebP thumbnails in tinified/."""
import argparse
from http.client import IncompleteRead
import json
import os
from pathlib import Path
import struct
import sys
from urllib.error import HTTPError, URLError

from thumbnails import request


def download(url, data, key):
    for attempt in range(3):
        try:
            return request(url, data, key, "application/json")
        except IncompleteRead:
            if attempt == 2:
                raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sources", nargs="+", type=Path)
    parser.add_argument("--env-file", type=Path)
    args = parser.parse_args()
    key = os.environ.get("TINIFY_API_KEY", "")
    if not key and args.env_file:
        for line in args.env_file.read_text(encoding="utf-8-sig").splitlines():
            name, separator, value = line.strip().removeprefix("export ").partition("=")
            if separator and name.strip() == "TINIFY_API_KEY":
                key = value.strip().strip("\"'")
    if not key:
        raise ValueError("Set TINIFY_API_KEY or supply --env-file")
    for source in args.sources:
        destination = source.parent / "tinified" / source.name
        thumbnail = destination.with_name(source.stem.rsplit(" X ", 1)[0] + " X 640x360.webp")
        if destination.exists() and thumbnail.exists():
            print("Already exists:", source.name)
            continue
        original = source.read_bytes()
        _, headers = request("https://api.tinify.com/shrink", original, key, "image/png")
        location = headers["Location"]
        destination.parent.mkdir(parents=True, exist_ok=True)
        if not destination.exists():
            compressed, headers = download(location, None, key)
            if compressed[:8] != b"\x89PNG\r\n\x1a\n" or compressed[16:24] != original[16:24]:
                raise ValueError("Unexpected compressed PNG dimensions or format")
            destination.write_bytes(compressed)
            print(f"Saved {destination.name}: {len(original)} -> {len(compressed)} bytes; dimensions {struct.unpack('>II', compressed[16:24])}")
        if not thumbnail.exists():
            options = {"resize": {"method": "fit", "width": 640, "height": 360},
                       "convert": {"type": "image/webp"}}
            output, headers = download(location, json.dumps(options).encode(), key)
            if output[:4] != b"RIFF" or output[8:12] != b"WEBP":
                raise ValueError("Unexpected thumbnail format")
            thumbnail.write_bytes(output)
            print(f"Saved {thumbnail.name}: {len(output)} bytes")
        print("Monthly compression count:", headers.get("Compression-Count", "unknown"))


if __name__ == "__main__":
    try:
        main()
    except HTTPError as error:
        print(f"Tinify HTTP {error.code}; check credentials, quota or service status.", file=sys.stderr)
        sys.exit(1)
    except (URLError, ValueError, OSError, IncompleteRead) as error:
        print(f"Tinify failed ({type(error).__name__}); no credentials logged.", file=sys.stderr)
        sys.exit(1)
