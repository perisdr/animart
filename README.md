# Animart

AI-generated anime crossovers inspired by well-known artworks, made as TV wallpapers.

## Status

Repository foundation only. The selected visual direction is a warm museum catalogue;
the UI framework is still under discussion (Bootstrap 5.3 recommended).
Nothing is deployed. The existing collection contains 12 crossovers, each with original
and Tinify-optimized 1920 × 1080 PNG downloads.

## Structure

- `Assets/`: supplied wallpapers and existing `tinified/` variants.
- `data/wallpapers.json`: catalogue; unverified source metadata remains explicitly pending.
- `previews/`: generated WebP thumbnails, committed for static hosting.
- `scripts/thumbnails.py`: local Tinify thumbnail generation; never runs in the visitor's browser.
- `docs/design.md`: proposed visual direction and framework choices.
- `docs/publishing.md`: GitHub Pages hosting plan.

## Thumbnails

Python 3, standard library only:

```sh
python scripts/thumbnails.py --dry-run
python scripts/thumbnails.py
```

The script reads `TINIFY_API_KEY` from the environment or prompts privately.
It does not automatically load `.env`. Never commit a real API key.
The generator fits images inside 640 × 640 without cropping, converts to WebP,
and skips unchanged source images with matching generated outputs.
Tinify charges quota for uploads and resizing; its returned monthly count is printed.
Original-art previews can be added to the same pipeline after sourcing and attribution review.

## Next steps

1. Choose the visual direction and UI framework.
2. Verify artwork descriptions, source URLs, and exact AniDB entries.
3. Source original-art images and record credits and reuse terms.
4. Generate previews, implement the gallery, and verify it locally.
5. Create the GitHub repository and configure Pages.

No blanket image licence is granted by this repository. Code licensing and image
attribution will be documented separately before publication.
