# Animart project context

Animart is a personal collection of AI-generated anime crossovers made as 16:9
TV wallpapers. The owner is exploring paintings through familiar anime characters,
not claiming to be an artist. Preserve the personal story and clear AI disclosure.
Use “AI Crossovers” (singular “AI Crossover”) for generated images in all visitor-facing copy, including accessible labels. Original human works may still be called artworks. Internal `artwork` fields describe those originals.

## Implementation

- Static HTML, local Bootstrap CSS, custom CSS and vanilla JavaScript; no build step.
- `index.html`: opening, collection, story, footer and native detail dialog.
- `scripts/gallery.js`: filters, desktop views, mobile feed, comparison, prompts,
  downloads and `#piece=...` deep links. Preserve browser URL sharing.
- `styles/site.css` and `DESIGN.md`: approved Crossover Edition identity. Preserve
  Fraunces / Source Sans 3, paper / ink / vermilion palette and image proportions.
- `data/wallpapers.json`: source of truth for catalogue entries and statistics.
- `data/prompts.json`: archived prompts keyed by stable catalogue IDs; do not rewrite.
- `Assets/`, `previews/`, `fonts/`, `vendor/`: committed local assets.
- `mockups/`: historical prototypes, not the production site.

## Collection maintenance

Keep IDs stable and paths relative, with exact filename case for static hosting.
Each entry's `addedOn` is its first catalogue addition date (`YYYY-MM-DD`), not
the date its metadata or downloads changed. Initial dates come from git history.
Footer counts and last-added date derive from the full catalogue, never filters.
`artwork.sourceUrl` is the primary original-work reference; use verified WikiArt
entries when the exact work matches. `artwork.links` holds labelled supplementary
museum/reference links. Preserve `previewSourceUrl`, credits and reuse terms:
switching a reference URL does not change the source or rights of a local image.
Document source-verification exceptions in `docs/source-links.md`.

Keep the four download variants and default Tinified 1080p option. Do not regenerate
images or use paid Tinify quota unless requested. Never commit API keys or `.env`.

## Verification

Run `node --check scripts/gallery.js` and `git diff --check`. Serve the repository
over HTTP with `python scripts/serve.py` (not `file://`). Check desktop and phone
layouts, a detail deep link, filters, downloads, comparison and prompt disclosure
for changes affecting those paths. No deployment is implied by local edits.
