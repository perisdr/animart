# Approved design: The Crossover Edition

Approved for the main site on 2 November 2026 after iterative mockups. This replaces the initial quiet museum-catalogue direction. See `../DESIGN.md` for the normative visual tokens and component rules; `.impeccable/design.json` records motion, breakpoints, and design metadata.

## Experience

- Preserve the approved Fraunces / Source Sans 3 typography and paper, ink-blue, vermilion palette.
- Use dark header/opening and dark story/footer to frame the light gallery.
- Desktop offers Grid, Slider, and List; Slider is the default.
- Phones at widths up to 767px have one image-first feed, short captions, and collapsible filters.
- Desktop artwork details offer Original / Both / Crossover with animated click-to-expand/reset, honoring reduced motion.
- Mobile details use a draggable original/crossover reveal. Both images remain contained in the shared frame without stretching or forced crops.
- Downloads remain prominent; detailed source information, AI attribution, and credits stay with each work.
- The Prompt is collapsed initially and shows the archived prompt verbatim when available.

## Implementation

Use locally stored Bootstrap 5.3.8 CSS, custom CSS, plain JavaScript, native dialog/details, and no build step. `styles/site.css` owns presentation; `scripts/gallery.js` owns gallery, filters, links, detail interactions, and sharing. `fonts/` contains the locally hosted variable fonts and their SIL Open Font License files.

`data/wallpapers.json` remains the catalogue. `data/prompts.json` maps catalogue IDs to the verbatim prompts in `docs/anime_art_crossover_prompts.md`. Prompt 8 is labelled as the original generation prompt for the corrected Tanjiro wave image; the correction prompt is absent. Prompt 13 is an unused rewrite and is not presented as having generated a shipped image.

The original personal story and source credits are preserved. `mockups/crossover-edition/` remains the design preview, not the production dependency. Publication is a separate step; design approval is not a deployment claim.
