# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anime fans looking for TV wallpapers. They browse AI Crossovers by familiar series, characters, or the paintings that inspired them, then choose a file for their display.

## Product Purpose

Animart began when its owner wanted something more personal on their TV. It collects AI-generated anime crossovers as 16:9 wallpapers and shares how familiar characters helped the owner explore paintings.

## Positioning

Each AI Crossover connects a downloadable TV wallpaper with the original artwork, its creator and source, and the archived generation prompt when available. Visitors can compare the compositions and follow the source to learn more.

## Operating Context

Visitors can browse and download from a desktop or phone for use on a TV. The desktop gallery offers Slider, Grid, and List. Phones use a single image feed. Individual AI Crossover details have shareable URLs.

## Capabilities and Constraints

- Keep all four PNG variants. The default is Tinified 1080p, with Tinified 2160p and uncompressed files at both resolutions also available.
- Preserve catalogue IDs and detail links. Keep first-added dates stable and calculate collection statistics from the full catalogue.
- Keep original-work references, preview credits, and reuse terms accurate. A reference link and the source of a local preview can differ.
- Keep archived prompts verbatim and disclose them on demand. Preserve image proportions in comparisons.

## Brand Commitments

Use Animart as the collection name and AI Crossover or AI Crossovers for the generated images, including in accessible labels. Original human works may be called artworks. Preserve the owner's first-person story and clearly disclose that the wallpapers are AI-generated personal experiments.

## Evidence on Hand

- `data/wallpapers.json` holds the catalogue, download paths, and original-work metadata.
- `data/prompts.json` holds the archived prompts keyed by catalogue ID.
- `Assets/` and `previews/` contain the wallpaper files and web previews.
- `docs/source-links.md` records original-work source verification exceptions.

## Product Principles

- Make it easy to find and download a wallpaper for a TV.
- Give the original work and its creator a clear place in each comparison.
- Keep the personal story, AI disclosure, and provenance visible as the collection grows.

## Accessibility & Inclusion

Keep gallery and comparison controls operable by keyboard, preserve visible focus, label the original and the AI Crossover distinctly, and honor reduced-motion preferences.
