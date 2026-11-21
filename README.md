# Animart

AI-generated anime crossovers inspired by well-known artworks, made as TV wallpapers.

## Status

**Beta: v0.1.0-beta.1** — functional first version, ready for UI/UX review.

The gallery uses the approved Crossover Edition design: Fraunces and Source Sans 3,
ink-blue framing, a warm paper gallery, and vermilion actions. Locally stored
Bootstrap 5.3.8 CSS, custom CSS, and plain JavaScript provide the interface. Desktop
offers Grid, Slider, and List; mobile uses one image-first feed. Artwork details
include comparisons, generation prompts, direct downloads, and shareable links.
The gallery requires no build step; local testing uses a static
web server. Opening the page directly with `file://` is not a supported target.
Nothing is deployed. The existing collection contains 16 crossovers, each with original
and Pillow Q95 WebP downloads at 1920 × 1080 and 3840 × 2160.
The default download is Optimized WebP 1080p. The download menu offers
Optimized PNG, Optimized WebP, and Uncompressed PNG at both 1080p and 2160p.

## Structure

- `Assets/`: supplied wallpapers and existing `tinified/` variants.
- `index.html`: introduction, gallery controls, story, and detail-dialog shell.
- `styles/site.css`: colours, typography, layout, and responsive rules.
- `scripts/gallery.js`: filtering, catalogue rendering, detail views, and URL navigation.
- `data/wallpapers.json`: catalogue and per-image source metadata.
- `data/prompts.json`: original prompt text keyed by catalogue ID, with provenance notes.
- `fonts/`: local Fraunces and Source Sans 3 variable fonts and SIL OFL licences.
- `DESIGN.md`: approved visual system; `.impeccable/design.json` carries extensions.
- `previews/`: generated WebP thumbnails, committed for static hosting.
- `vendor/`: precompiled Bootstrap CSS and its MIT licence; no CDN required.
- `scripts/thumbnails.py`: local Tinify thumbnail generation; never runs in the visitor's browser.
- `docs/design.md`: approved design decisions and framework choices.
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

For AI Crossover previews and optimized downloads, run `python scripts/optimize_images.py`.
This uses local Pillow WebP Q95 (method 6), preserves embedded ICC profiles,
and requires no API key. Previews select the closest-ratio uncompressed PNG
from the entry's download sources (preferring the smaller source on ties), resize
with Lanczos, then encode once. Downloads encode the matching uncompressed PNG
without resizing. Outputs live in the existing `tinified/` folders; the catalogue
paths, dimensions, byte counts and optimization audit are updated automatically.
The six download choices are: Optimized PNG, Optimized WebP and Uncompressed PNG, each at
1080p and 2160p. The default is Optimized 1080p. `scripts/web_images.py` invokes
the same pipeline. The older Tinify scripts are legacy tools, not this workflow.

## Editing the collection

Add an entry in `data/wallpapers.json`, retaining the existing field structure.
Every entry needs a unique stable `id`, an anime, an artwork, a preview path, and
download variants. Keep paths relative to the repository root and match filename
case exactly for GitHub Pages. Filters populate automatically from the catalogue.
For a multi-film AI Crossover, use `anime.name` for its listing name and
`anime.films` for its inspirations. Each film has a canonical `title` and a
reference `url`. Use the same title for a single-film listing so both appear
under one Anime filter. Search also includes `anime.creator`, film titles,
aliases, descriptions, and tags.

Place new source wallpapers in `Assets/`, then run the thumbnail script when you
want to generate their previews. There is no need to regenerate existing images.
Record artwork credits, source URLs, and image reuse terms alongside each entry.

The URL retains filter selections; each artwork has a `#piece=...` link.
Copy the browser URL to share a detail view. Localhost links are only useful on
the computer running the preview server.

## Generation prompts

`data/prompts.json` preserves prompts 1–12 from `docs/anime_art_crossover_prompts.md`.
Each AI Crossover opens with a three-line fading prompt preview; View more reveals the full prompt and copy control. Section 8 is identified as the original
generation prompt for the corrected Tanjiro wave; the correction prompt is not in the
archive. Section 13 is an unused future-generation rewrite and is excluded.

## Publication

Source repository: https://github.com/perisdr/animart

The website has not been deployed. Review the UI and image credits, then configure
Pages as described in `docs/publishing.md`.

No blanket image licence is granted by this repository. Code licensing and image
attribution will be documented separately before publication.

## Collection dates and references

Set `addedOn` (YYYY-MM-DD) when adding a new crossover; preserve it during edits.
The footer derives its last-added date and piece, original-artist and anime counts
from the entire catalogue. Initial dates use the first catalogue commit, 1 November 2026.

Use verified WikiArt references in `artwork.sourceUrl` and labelled `{label, url}`
entries in `artwork.links` for Interesting links. Keep image provenance in
`previewSourceUrl`. See `docs/source-links.md` for verification and the Monet exception.
## Release identification

The footer shows the build ID embedded in the loaded `scripts/gallery.js`.
For each release, update `SITE_BUILD` there and both `?v=` values for the
custom CSS and gallery script in `index.html` to the same `YYYY.MM.DD.N` ID
(increment N for releases on the same date). This keeps the site static, with
no build step, and gives changed assets new cache URLs. The label identifies
the loaded release, not whether a newer release is still deploying. An older
cached HTML page can still show the previous build until refreshed.

Optimized PNG downloads use Pillow lossless PNG optimization (`optimize=True`,
`compress_level=9`), not Q95 (PNG has no quality setting). Run
`python scripts/optimize_png.py` to rebuild only these PNGs. Pixels are verified
against each original; file sizes may be similar to or larger than the originals.
