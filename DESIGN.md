---
name: "Animart — Cel Archive"
description: "Anime AI Crossovers framed by matte lavender, paired source credits, and editorial titles."
colors:
  lavender: "#ebe4f3"
  plum: "#29163b"
  violet: "#633988"
  rule: "#a995bb"
  comparison: "#e8def3"
  muted: "#614e72"
  anime: "#182a43"
  originalTitle: "#b83b28"
  cross: "#5d5862"
  input: "#faf7fd"
  download: "#fffaf4"
  downloadRule: "#c7b7a9"
  downloadHover: "#f5e5db"
  downloadDivider: "#d8c9bc"
typography:
  display:
    fontFamily: "Fraunces, serif"
    fontSize: "clamp(40px, 4.4vw, 68px)"
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: "-.035em"
  title:
    fontFamily: "Fraunces, serif"
    fontSize: "clamp(20px, 2vw, 28px)"
    fontWeight: 550
    lineHeight: 1.35
    letterSpacing: "-.02em"
  detail:
    fontFamily: "Fraunces, serif"
    fontSize: "clamp(32px, 4vw, 52px)"
    fontWeight: 550
    lineHeight: 1.35
    letterSpacing: "-.035em"
  body:
    fontFamily: "Source, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  credit:
    fontFamily: "Source, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
  downloadLabel:
    fontFamily: "Source, sans-serif"
    fontSize: "13px"
    fontWeight: 650
    lineHeight: 1.3
rounded:
  control: "0px"
  downloadRow: "4px"
  downloadPanel: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  gutter: "24px"
  lg: "32px"
components:
  view-button:
    backgroundColor: "{colors.lavender}"
    textColor: "{colors.plum}"
    rounded: "{rounded.control}"
    padding: "6px 14px"
    height: "44px"
  view-button-selected:
    backgroundColor: "{colors.plum}"
    textColor: "{colors.lavender}"
  search-input:
    backgroundColor: "{colors.input}"
    textColor: "{colors.plum}"
    rounded: "{rounded.control}"
    height: "48px"
  download-panel:
    backgroundColor: "{colors.download}"
    rounded: "{rounded.downloadPanel}"
    padding: "14px 16px"
  download-row:
    textColor: "{colors.anime}"
    rounded: "{rounded.downloadRow}"
    padding: "8px 6px"
  download-row-hover:
    backgroundColor: "{colors.downloadHover}"
---

# Design System: Animart — Cel Archive

## Overview

**Creative North Star: "Cel Archive"**

Matte lavender framing, plum text, and fine rules keep the interface quiet around the anime imagery. Fraunces gives the titles an editorial character; Source Sans 3 keeps descriptions, credits, and controls clear. The existing violet accent and navy/vermilion title pairing are intentional.

The collection feels personal and image-led. Both source creators receive visible credit, while the original works retain their own proportions and provenance in comparisons.

**Key Characteristics:**
- Uncropped 16:9 AI Crossover images.
- Navy anime titles paired with vermilion original-work titles.
- Manga creator credits on the left and original artist credits on the right.
- Flat lavender surfaces, fine rules, and restrained controls.
- A single-column phone gallery with a full-screen detail dialog.

## Colors

### Primary

Plum is the principal text and selected-control color. Violet supplies focus, hover feedback, and the emphasized phrase in the opening invitation.

### Secondary

Navy identifies the anime side of each title; vermilion identifies the original-work side. The multiplication sign uses its own muted neutral. Download rows reuse navy for text and vermilion for group labels.

### Neutral

Lavender is the page and dialog surface. The comparison tone provides image backdrops, prompt panels, and story framing. Muted plum supports source credits and collection counts; the rule color separates sections and outlines controls. Inputs use a pale lavender fill. Download panels use a warm cream surface, warm borders and dividers, and a peach hover fill.

**The Paired Title Rule.** Keep anime names navy, the multiplication sign muted, and original-work titles vermilion in both the gallery and detail dialog.

## Typography

Self-host Fraunces for the opening invitation, AI Crossover titles, and collection heading. The CSS family named Source loads Source Sans 3 and serves body text, credits, controls, and supporting headings.

- Opening invitation: use the display role; at intermediate widths it becomes 42px and on phones 38px.
- Gallery titles: use the title role with a 1.35 line height. Featured and phone-feed titles become 22px on phones. Desktop grid titles remain 24px through the collection override; List titles use their larger responsive scale.
- Detail title: use the detail role, preserving its larger scale and the same font, weight, line height, and title colors as gallery titles.
- Credits: use the credit role. Phone gallery credits use 15px with the same 1.4 line height. Pair left-aligned manga credit with right-aligned artist credit and year.
- Reading text: use the body role. The personal note uses Fraunces with a 1.4 line height; the story lead uses Source Sans 3 with a 1.5 line height. Keep longer descriptions within their existing 55–70ch measures.
- Download group labels: use the downloadLabel role; file rows use Source Sans 3 at 14px, with tabular file sizes.

**The Shared Heading Rule.** Detail titles read Anime Title × Art Title; their sibling subtitle reads Manga Creator × Artist. Preserve the page h1, featured h2, and collection h3 hierarchy independently of visual size.

## Layout

Use fluid containers with Bootstrap gutters: 24px horizontal page padding on smaller desktop sizes and 48px at larger sizes; the phone collection uses 16px padding and extends its image feed to the viewport edges. Desktop grid gutters are 24px horizontally and 28px vertically. The gallery currently shows two columns, including at wide desktop sizes.

Above 991px, place the introduction beside the featured image in a narrow/wide split. At 991px and below, move it above the image; at 767px and below, stack the introduction text. Keep gallery titles above images and bylines below them. Bylines wrap naturally rather than squeezing or clipping creator names.

Desktop visitors can choose Grid, Slider, or List. At 767px and below, use the single-column phone feed and hide the view switch. Filters open through a compact disclosure at every size. List places the manga credit beneath its preview and retains artist information beside the title. Slider places both credits below its large preview.

Desktop details use a centered native dialog up to 1120px wide, with 32px side padding and a viewport-height limit. Phone details fill the screen and use 16px side padding. The close toolbar stays at the top while dialog content scrolls. Download panels are positioned relative to the viewport, open above or below their trigger as space allows, and scroll internally when needed.

## Elevation & Depth

Use tonal surfaces and fine borders for separation. Gallery entries and floating download panels have no diffuse shadow. The dark translucent dialog backdrop separates details from the collection. The circular comparison handle alone uses a small functional shadow (0 2px 8px #29163b55) to remain legible over images.

## Shapes

Controls, inputs, dialog edges, and gallery frames are square. Download panels have softly curved corners using the downloadPanel radius; their rows use the smaller downloadRow radius. The Explore affordance is a semicircular tab joining image and caption, while the mobile comparison handle is circular. Preserve these component-specific shapes rather than applying rounded cards throughout the gallery.

## Components

### Titles and creator bylines

Use shared title markup for the gallery and dialog. Gallery titles are links with hover/focus underlining; the detail heading remains a heading. Under previews, show Manga by followed by the credited manga creator or creators, using the existing artist-credit typography. Keep the original artist's After credit and year. Death Note credits both its writer and illustrator.

### Gallery controls and search

Use bordered rectangular view buttons, with plum fill and lavender text for the selected state. Filters use a compact disclosure with an inline SVG icon; the phone trigger is a 44px square. Search and selects have at least 48px height, pale fills, and fine rule-colored borders. Preserve visible focus, the input caret color, and the selected-state semantics. Header navigation uses Source Sans 3 at weight 650, with hover underlining.

### Downloads

Use the native disclosure with a 44px square SVG download trigger aligned right. Its open state uses navy fill and warm cream text. The warm floating panel has a defined border, no shadow, and two resolution groups separated by a fine warm rule. Rows have at least 44px height, paired file labels and sizes, and peach hover/focus feedback. Keep all four PNG variants and the default Tinified 1080p choice.

### Detail dialog and comparison

Keep the native dialog and shareable piece URLs. The desktop comparison offers Original, Both, and AI Crossover states, with pressed-state buttons and image expansion controls. On phones, use the draggable comparison wipe when an original preview exists. Preserve each image's proportions; the wipe frame uses contain fitting rather than cropping.

Image expansion uses 320ms transitions; slide changes reveal the new image directionally over 420ms after decoding. Both use cubic-bezier(.22,1,.36,1). Respect reduced motion and keep controls usable while images load.

### Prompt disclosure and source credits

Use a softly tinted prompt section with a faded three-line preview, an underlined disclosure button, and a Copy prompt action after expansion. Preserve archived prompt text and loading/retry feedback. Source credits include both manga creators and original-work provenance, plus the AI disclosure.

### Focus and interaction

Use the existing violet focus outline (3px with 5px offset) for general controls, with component-specific offsets where implemented. Inputs use a tighter 2px focus outline. Preserve keyboard operation, focus return from the dialog, Escape handling, and visible selected states.

## Do's and Don'ts

### Do:
- Do preserve the Cel Archive palette, self-hosted fonts, and image proportions.
- Do use the same paired title colors and typography in gallery and detail views.
- Do keep both source creator credits legible when their byline wraps.
- Do retain visible focus, reduced-motion behavior, and clear AI Crossover labels.
- Do keep download options, provenance links, and prompt disclosure accessible.

### Don't:
- Don't crop images to make gallery entries or comparisons uniform.
- Don't add diffuse shadows to the floating download panel.
- Don't replace the intentional violet accent or title colors because of a generic design detector warning.
- Don't replace functional hover, focus, or selected states with static decoration.
