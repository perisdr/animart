"""Refresh the local static upload folder without deploying or deleting files."""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / "publish"


def main():
    paths = {
        ".nojekyll", "index.html", "story.html", "favicon.svg",
        "data/wallpapers.json", "data/prompts.json",
        "scripts/gallery.js", "scripts/featured.js", "scripts/cookieconsent-config.js",
    }
    for directory in ("styles", "fonts", "vendor", "Assets/branding", "Assets/story"):
        paths.update(path.relative_to(ROOT).as_posix()
                     for path in (ROOT / directory).rglob("*") if path.is_file())
    records = json.loads((ROOT / "data/wallpapers.json").read_text(encoding="utf-8"))
    for record in records:
        paths.add(record["preview"])
        if record["artwork"].get("preview"):
            paths.add(record["artwork"]["preview"])
        paths.update(image["path"] for image in record.get("webImage", {}).values())
        paths.update(download["path"] for download in record["downloads"])
    # Validate all sources before changing the upload folder.
    for relative in paths:
        source = (ROOT / relative).resolve()
        if not source.is_relative_to(ROOT) or not source.is_file():
            raise ValueError(f"Missing or invalid publish source: {relative}")
        if not (DESTINATION / relative).resolve().is_relative_to(DESTINATION.resolve()):
            raise ValueError(f"Invalid publish destination: {relative}")
    for relative in sorted(paths):
        target = DESTINATION / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / relative, target)
        if target.read_bytes() != (ROOT / relative).read_bytes():
            raise RuntimeError(f"Publish copy differs: {relative}")
    print(f"Prepared and verified {len(paths)} files for {len(records)} AI Crossovers in {DESTINATION}")
    print("Existing extra files retained. No deployment performed.")


if __name__ == "__main__":
    main()
