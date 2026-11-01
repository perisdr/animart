# Design discussion

## Selected direction: quiet museum catalogue

Chosen by the project owner on 2026-11-01.

- Warm off-white canvas, near-black text, muted ink-blue accent.
- Large uncropped 16:9 crossover images; restrained captions underneath.
- Serif artwork titles with a readable sans-serif interface.
- Compact search and filter toolbar; visible result count and clear-all action.
- Two or three gallery columns on desktop, one on small screens.
- Artwork detail shows original and crossover together, preserving both aspect ratios.
- Downloads show format, dimensions, size, and optimization explicitly.
- Brief introduction; longer project story available on demand.
- Keyboard navigation, visible focus, labelled controls, reduced-motion support.

Use this direction for the first gallery design.

## Framework options (not yet selected)

1. Bootstrap 5.3: recommended for plain HTML and JavaScript. Ready-made forms,
   dropdowns, dialogs, and responsive layout; customize typography, spacing,
   colours, and borders so the site has its own visual identity.
2. shadcn/ui with React: customizable component source and richer controls,
   with an additional build toolchain and more dependencies.

The framework supplies controls, not the site's art direction. The wallpapers should
carry the visual weight. Avoid decorative gradients, oversized marketing headings,
heavy card shadows, and unnecessary animation.
