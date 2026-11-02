---
name: Animart — The Crossover Edition
description: An image-first anime and art collection for TV wallpapers.
colors:
  paper: "#f4ebdd"
  ink: "#182a43"
  vermilion: "#b83b28"
  headline-accent: "#f5a184"
  comparison-surface: "#dce5ea"
  paper-rule: "#b9afa2"
  ink-rule: "#647080"
typography:
  display:
    fontFamily: "Fraunces, serif"
    fontSize: "clamp(40px,4.5vw,64px)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Source, sans-serif"
    fontSize: "17px"
  wordmark:
    fontFamily: "Fraunces, serif"
    fontSize: "43px"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "-0.03em"
rounded:
  control: "0"
  wipe-handle: "50%"
spacing:
  compact: "12px"
  standard: "16px"
  section-gap: "24px"
  dialog-inset: "32px"
components:
  button-primary:
    backgroundColor: "{colors.vermilion}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
  selected-view:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
---

# Design System: Animart

## Overview

**Creative North Star: The Crossover Edition.** Approved for promotion from the mockup to the main site on 2 November 2026. An independent exhibition-publication character: expressive typography, warm paper, ink-blue framing, and selective vermilion actions. Artwork leads; visitors can explore its source and download the crossover without a competing marketing funnel.

The approved typography and palette are durable commitments. The first museum-catalogue proposal is superseded. Existing factual story, AI disclosure, artwork sources, and credits remain part of the experience.

## Colors

Paper is the gallery and dialog surface; ink is the header, opening, story, and footer surface as well as primary text on paper. Vermilion marks download actions and selected thumbnails. The headline's warm accent provides contrast on ink. Pale blue supports contained images without changing their proportions. Rules use paper-rule on light surfaces and ink-rule on dark surfaces.

## Typography

Fraunces is the display, wordmark, and artwork-title face. Source Sans 3 is locally registered as `Source` for reading and controls. Both variable TTFs and their SIL Open Font License files live in `fonts/`; no external font requests are required.

Desktop h1 uses the frontmatter display scale. Phone h1 is 36px at widths up to 767px; the wordmark becomes 33px. Artwork-detail titles use `clamp(32px,4vw,52px)`. Keep long titles wrapping naturally. Supporting captions are compact, while body and form text remain readable.

## Layout

Use locally stored Bootstrap 5.3.8 CSS containers, rows, columns, gutters, flex utilities, and form foundations; custom CSS supplies the artistic composition. The static site requires no build step or Bootstrap JavaScript bundle.

Desktop offers Grid, Slider, and List, with Slider as the default. Slider pairs a large landscape with contextual details and a thumbnail strip; Grid provides an overview; List favors comparison of descriptions. At 991px and below, the slider stage stacks. At 767px and below, one edge-to-edge image feed replaces all three desktop choices, with short captions and collapsed search/filter controls.

The desktop artwork dialog is at most 1120px wide, inset 20px from the viewport edges. Mobile details use the viewport. Keep image proportions with `object-fit: contain`; never force unrelated paintings into matching crops. Desktop comparison supports Original / Both / Crossover and clicking an image to expand or reset. Mobile replaces these with a draggable reveal over two contained images in a 4:3 frame. This compares compositions; it does not imply pixel-aligned subjects.

## Elevation & Depth

The gallery is flat: surfaces, rules, and scale establish hierarchy. Native dialog separation uses `rgb(10 20 35 / .78)` backdrop. The wipe handle alone uses `0 2px 8px #182a4355` for visibility over artwork. Avoid decorative card shadows.

## Shapes

Controls and artwork frames are square. The mobile wipe handle is circular with a 44px footprint. The rest of the interface should not inherit that circular shape merely for decoration.

## Components

- **Gallery controls:** labelled Bootstrap form controls; selected view buttons invert ink and paper. Preserve active filters across view changes.
- **Downloads:** solid vermilion primary action, with dimensions and size; secondary files remain available. Use unambiguous crossover labels.
- **Comparison:** preserve image aspect ratios and accessible keyboard controls. No redundant Show both button; the Both option and image toggle provide reset on desktop.
- **Motion:** desktop image transitions use 320ms and `cubic-bezier(.22,1,.36,1)`, with uniform scaling and positional continuity. Disable this animation under reduced motion. No automatic gallery advancement.
- **The Prompt:** native details disclosure, initially closed for every artwork. Preserve original line breaks and provide copy feedback/fallback. Prompts come from the archive, not generated descriptions.
- **Navigation/footer:** shallow header, dark closing story/footer, useful grouped links; maintain the distinction between dark framing and light gallery.
- **Focus:** visible 3px vermilion outlines with offsets; on dark story/footer surfaces use the warm headline accent.

## Do's and Don'ts

- **Do** retain the approved fonts and palette across every view and state.
- **Do** keep mobile image-first and place richer information in details.
- **Do** preserve source artwork proportions and label both sides of a comparison.
- **Do** retain actual prompt provenance: archive section 8 is the original prompt for the subsequently corrected Tanjiro wave; section 13 is unused and excluded.
- **Don't** restore a separate Show both button or desktop view selector on phones.
- **Don't** claim a free image licence merely because the fonts and Bootstrap are freely licensed.
- **Don't** copy the reference site's channel numbers, broadcast palette, or terminal aesthetic.
