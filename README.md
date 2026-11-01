# Animart

AI-generated anime crossovers inspired by well-known artworks, made as TV wallpapers.

## Status

**Beta: v0.1.0-beta.1** — functional first version, ready for UI/UX review.

The first gallery uses a warm museum-catalogue design, locally stored Bootstrap
5.3.8 CSS, custom CSS, and plain JavaScript. It includes combined filters, free-text
search, artwork comparisons, direct downloads, and shareable links.
The gallery requires no build step; local testing uses a static
web server. Opening the page directly with `file://` is not a supported target.
Nothing is deployed. The existing collection contains 12 crossovers, each with original
and Tinify-optimized 1920 × 1080 PNG downloads.

## Structure

- `Assets/`: supplied wallpapers and existing `tinified/` variants.
- `index.html`: introduction, gallery controls, story, and detail-dialog shell.
- `styles/site.css`: colours, typography, layout, and responsive rules.
- `scripts/gallery.js`: filtering, catalogue rendering, detail views, and sharing.
- `data/wallpapers.json`: catalogue and per-image source metadata.
- `previews/`: generated WebP thumbnails, committed for static hosting.
- `vendor/`: precompiled Bootstrap CSS and its MIT licence; no CDN required.
- `scripts/thumbnails.py`: local Tinify thumbnail generation; never runs in the visitor's browser.
- `docs/design.md`: proposed visual direction and framework choices.
- `docs/publishing.md`: GitHub Pages hosting plan.

## Local preview

Serve the repository root with any static web server. The included Python 3
preview helper disables caching so edits appear on refresh:

```sh
python scripts/serve.py
```

Open `http://127.0.0.1:8000/`. Edit HTML, CSS,
JavaScript, or `data/wallpapers.json` and refresh. No build command is required.

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

## Editing the collection

Add an entry in `data/wallpapers.json`, retaining the existing field structure.
Every entry needs a unique stable `id`, an anime, an artwork, a preview path, and
download variants. Keep paths relative to the repository root and match filename
case exactly for GitHub Pages. Filters populate automatically from the catalogue.
Search also includes anime aliases, descriptions, and tags.

Place new source wallpapers in `Assets/`, then run the thumbnail script when you
want to generate their previews. There is no need to regenerate existing images.
Record artwork credits, source URLs, and image reuse terms alongside each entry.

The URL retains filter selections; each artwork has a `#piece=...` link.
After publishing, the copy-link button produces public links. Localhost links are
only useful on the computer running the preview server.

## Publication

Source repository: https://github.com/perisdr/animart

The website has not been deployed. Review the UI and image credits, then configure
Pages as described in `docs/publishing.md`.

No blanket image licence is granted by this repository. Code licensing and image
attribution will be documented separately before publication.
