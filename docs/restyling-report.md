# Animart restyling report

Date: 2 November 2026
Status: proposal only; no website changes.

## Recommendation

Restyle Animart as an independent anime-and-art exhibition publication: bold editorial typography, ink-blue and warm paper surfaces, selective vermilion accents, and compositions built around the actual crossover images. Working direction: **The Crossover Edition**.

The website should feel like a collector's publication with an exhibition inside it. Its distinguishing idea is the relationship between familiar anime characters and unfamiliar paintings. Make that relationship visible in the composition, rather than relying on a paragraph to explain it.

This is a proposed replacement for the current quiet museum catalogue direction, not an approved change to the existing design specification. Preserve the user's settled preference for balanced exploration and download. Preserve the collection, factual copy, source credits, AI disclosure, image proportions, and static Bootstrap-based architecture.

## Evidence and diagnosis

This proposal draws on the earlier desktop/mobile browser review and a fresh inspection of index.html, styles/site.css, and docs/design.md after the implementation rollback. It is not a new automated audit. The Impeccable context launcher failed earlier in this session because its engine was unavailable; project context was read directly.

The current design succeeds at restraint, but restraint has become its only expressive register:

- Warm paper, grey-green metadata, thin rules, and subdued blue occupy nearly the entire interface. There is little contrast between arrival, browsing, and inspecting a piece.
- Georgia and Arial establish a familiar editorial baseline, but the wordmark and headline do not create a recognisable identity of their own.
- A conventional copy-left/image-right introduction precedes a uniform grid. Both are serviceable; neither expresses the unusual pairing at the heart of Animart.
- Every gallery item receives effectively the same visual treatment. Repetition makes twelve distinctive works feel like inventory.
- Tiny uppercase labels and restrained captions create refinement at the cost of energy and comfortable reading.
- The detail view contains the strongest concept—the original beside its reinterpretation—but this is discovered only after opening a piece.

The answer is not to add effects everywhere. It is to give the site a stronger typographic voice, varied composition, and one memorable interaction that belongs specifically to this collection.

## Three viable directions

| Direction | Visual language | Best quality | Main risk |
|---|---|---|---|
| **The Crossover Edition — recommended** | Independent exhibition publication; warm paper, deep blue fields, vermilion punctuation, expressive serif and clear sans | Connects anime energy with art context; supports both reading and browsing | Can become visually busy if every card receives bespoke decoration |
| **After Hours Screening** | Cinema programme; charcoal surroundings, large luminous landscapes, compact credits, restrained transitions | Strong connection to TV wallpapers and screen viewing | Can resemble a generic streaming catalogue; dark surroundings alone do not create identity |
| **Print Club** | Contemporary print exhibition; clean white, bold color panels, compact poster-like captions, large image margins | Playful, collectible, and immediately graphic | Strong colored surrounds may compete with paintings or suggest merchandise that is not offered |

Choose one world and carry it through navigation, gallery, detail, controls, and mobile. Do not blend all three into a collection of unrelated effects.

## Recommended visual system

### Color

Proposed palette, subject to contrast verification in implementation:

- Paper: `#F4EBDD`, the principal reading and gallery surface.
- Ink: `#182A43`, primary text and full-width exhibition sections.
- Vermilion: `#B83B28`, selected states, essential actions, and limited editorial emphasis.
- Pale blue: `#DCE5EA`, quiet comparison backgrounds and secondary surfaces.

Use color in substantial areas, not dozens of badges. Let an ink-blue opening establish the identity, then transition to paper for browsing. Use vermilion sparingly enough that an action is unmistakable. Keep image backgrounds neutral where the painting needs accurate visual separation. Do not set small muted text over artwork.

### Typography

Evaluate a self-hosted pairing such as **Fraunces** for display and artwork titles with **Source Sans 3** for controls and reading. These are candidates, not installed assets; verify font licensing and required character coverage before shipping.

Use expressive type for the existing main headline and quieter weights for painting titles. Avoid forcing the same dramatic treatment onto every heading. Target 16px body and input text, 14px supporting information, and responsive display text around 40–80px. Treat these as initial ranges to test, not rigid final measurements.

Build the wordmark from the same typographic system with a deliberate crossover mark. Avoid generic emoji, decorative Japanese text, or faux calligraphy as shortcuts to anime identity.

### Composition and material

Use a clear editorial grid, strong alignment, occasional substantial rules, and intentional changes of scale. Retain uncropped 16:9 wallpaper images. Convey the publication character through typography and layout, without simulated paper grain, torn edges, sticker clutter, heavy shadows, or ornamental card borders.

## Page-by-page proposal

### 1. Arrival: show the relationship immediately

Replace the conventional two-column hero with an exhibition opening. The featured crossover should occupy most of the first desktop viewport, accompanied by the existing headline in a compact editorial block. Place a small, clearly labelled original-art reference alongside the feature, outside the image rather than obscuring it.

Keep the primary route into the collection obvious. On mobile, show the feature early, shorten the visual footprint of the introduction, and keep navigation straightforward. Do not introduce an automatically rotating carousel or put copy over visually busy artwork.

### 2. Collection: introduce rhythm without making browsing unpredictable

Use one featured landscape followed by a consistent two-column desktop gallery. A new featured treatment may punctuate a later group only when there is a real editorial reason. Keep the main collection in a logical DOM order and a single column on phones; avoid masonry that changes reading order or crops the images.

Each caption should clearly connect anime, painting, and artist. Give titles enough size to scan, and make the entire card's destination understandable. Keep one keyboard destination per piece while maintaining normal link behavior.

Search and Anime remain immediately available. Group secondary facets in a compact, labelled disclosure if mobile space requires it. Selected filters and reset must remain visible. Filter results should return to the same consistent grid rather than retaining decorative empty slots.

### 3. Artwork detail: an exhibition spread with an obvious download

Retain both original and crossover, preserving their aspect ratios. Put the title, attribution, and a download shortcut at the top. Below the comparison, use two concise reading columns for the painting and anime context, followed by the full file choices and credits.

On mobile, use labelled Original / Crossover controls as an optional compact viewing mode, with a simple way to show both. A wipe slider is not the default: the source paintings and wallpapers often have different compositions and aspect ratios, so forced alignment would misrepresent the relationship.

Rename ambiguous download labels to identify the crossover file. Recommend the optimized PNG while keeping the larger file available. Preserve dimensions, file size, and direct download behavior.

### 4. Story and footer: end with a personal editorial note

Treat the existing personal story as an afterword. Give it a distinct change of background and generous reading measure rather than another generic card. Keep the factual voice and AI disclosure. Finish with a straightforward route back to the collection; do not invent social proof, visitor counts, or commercial claims.

### 5. Interaction: one signature moment

Use the original-to-crossover comparison as the signature interaction, with explicit controls available to touch and keyboard users. A short fade between views can reinforce the transformation. Preserve focus, labels, and the selected state; honor reduced motion. Hover may enhance a card, but must not reveal essential controls unavailable on touch devices.

## Bootstrap-aware implementation

Use the existing locally stored Bootstrap 5.3 CSS as the structural foundation. No framework migration is needed.

| Concern | Bootstrap foundation | Deliberate custom layer |
|---|---|---|
| Responsive layout | Containers, rows, columns, breakpoint and gutter utilities | Featured artwork composition and page-level art direction |
| Spacing/alignment | Spacing, flex, display and alignment utilities | Only exceptional relationships that utilities cannot express clearly |
| Forms | form-label, form-control, form-select, input-group | Palette, focus treatment and consistent sizing |
| Actions | btn and appropriate variants | Component-level button variables and brand treatment |
| Images | Responsive image utilities; ratio where appropriate | Preserve source-art proportions; avoid universal object-fit: cover |
| Detail/disclosure | Retain native dialog/details under the existing CSS-only decision | Style them consistently with the Bootstrap-based interface |

Bootstrap is the implementation system, not the visual concept. Use a small, documented token layer and component overrides. Do not append a second cascade of corrective CSS at the end of the file. Consolidate superseded rules during implementation.

Keep native dialog/details unless there is an explicit decision to adopt Bootstrap JavaScript components. Do not combine Bootstrap Modal/Collapse and native behavior for the same control. Merely changing --bs-primary does not necessarily theme every compiled component; verify the actual component variables and states in the bundled version.

## Priority and delivery sequence

1. **Lock the visual direction.** Produce a desktop opening and mobile collection mockup using real collection images. Agree on composition and type before rebuilding the site.
2. **Build the foundation.** Establish palette, typography, Bootstrap layout conventions, component variables, and responsive scale.
3. **Restyle the complete journey.** Opening, collection, detail/download, story, and footer should be coherent before adding motion.
4. **Add purposeful interaction.** Comparison controls, selected filters, focus states, and restrained transitions.
5. **Verify and consolidate.** Check representative desktop and mobile widths, zoom, keyboard flow, long titles, empty search, load failure, download links, image loading, and reduced motion. Remove superseded CSS.

The highest-value work is composition and typography. Decorative motion comes last.

## Acceptance criteria

- Within the opening viewport, visitors see an actual crossover and understand its relationship to an original artwork.
- The site has a recognisable identity even when its images have not loaded.
- Artwork remains uncropped and visually dominant.
- Download is discoverable from the initial detail view without eclipsing exploration.
- Mobile browsing remains direct, without horizontal overflow or a wall of filters.
- Normal text meets 4.5:1 contrast; large text and essential interface boundaries meet applicable contrast requirements. Verify final combinations rather than assuming the proposed palette passes.
- Controls have visible keyboard focus and comfortable touch areas; core tasks do not depend on hover, drag, or motion.
- Bootstrap handles ordinary layout and controls; custom CSS has a clear artistic purpose.
- Existing content, credits, filter URL behavior, share links, and direct downloads continue to work.

## Decision to make next

Approve The Crossover Edition for visual mockups, or choose After Hours Screening or Print Club. Approval of this report's direction should lead to mockups first; this report does not authorize replacing the running interface.
