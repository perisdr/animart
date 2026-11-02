# Artwork prompts in the preview

Source: ../../docs/anime_art_crossover_prompts.md (repository root).

prompts.json maps the twelve catalogue IDs to original archive prompts 1–12, preserving the text inside each fenced block. mockup.js merges this preview-only mapping with the catalogue at load time. The production catalogue and main website are unchanged.

For the corrected Tanjiro Great Wave image, section 8 is explicitly labelled as the original generation prompt. The correction prompt is not in this archive. Section 13 is an unused future-generation rewrite and is deliberately excluded.

The Prompt disclosure starts closed for each artwork, preserves line breaks, and offers Copy prompt with manual selection as a clipboard-failure fallback. Update the mapping if the archive changes.
