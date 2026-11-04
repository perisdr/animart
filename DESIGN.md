---
name: Animart — Cel Archive
colors:
  lavender: "#ebe4f3"
  plum: "#29163b"
  violet: "#633988"
  rule: "#a995bb"
  comparison: "#e8def3"
  anime: "#182a43"
  originalTitle: "#b83b28"
typography:
  body:
    fontFamily: "Source, sans-serif"
    fontSize: "17px"
  display:
    fontFamily: "Fraunces, serif"
rounded:
  control: "0"
---

# Cel Archive

## Overview

Give the featured AI Crossover the largest surface on the page. Lavender framing, plum typography, and fine rules keep the interface quiet around the anime imagery. The current Cel Archive palette is intentional: violet is an accent, with navy anime titles and vermilion original-work titles. The base lavender is now #ebe4f3, slightly darker than the previous #f3eef9, while comparison panels retain #e8def3.

## Layout

On wide desktop screens, place the personal introduction beside the featured AI Crossover. Keep its title above the uncropped 16:9 image, with the artist credit and download control below. At intermediate widths, move the introduction above the image; on phones, stack its text. Lead directly into the collection controls and grid. Slider and List remain optional desktop views. Phones use a single-column gallery. Search and filters open through a compact disclosure on all sizes.

## Typography and hierarchy

Use Fraunces for the opening invitation, AI Crossover titles, and collection heading, with Source Sans 3 for body text and controls. The opening invitation is the page h1; the featured AI Crossover is an h2. Collection entries remain h3 under the collection h2. Preserve the featured title's size when changing its semantic level. Multiline AI Crossover titles use 1.35 line height, the personal introduction uses 1.4, and the story lead uses 1.5. Compact display headings may retain tighter leading.

## Components

Keep images uncropped, preserve the original artwork proportions in comparisons, and keep download variants and detail links visible. Use the existing native dialog and prompt disclosure. Respect reduced motion and retain visible keyboard focus.

Download panels use a defined border without a diffuse shadow. Preserve their floating placement, viewport containment, four PNG variants, and existing warm surface. Do not remove useful interaction states to satisfy a generic detector warning. Evaluate the intentional violet accent against contrast and hierarchy rather than treating its hue alone as a defect.
