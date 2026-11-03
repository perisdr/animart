# Death Note 4K versions

Nighthawks, The Death of Marat, The Scream, and The Son of Man were upscaled directly from their non-tinified originals to 3840 × 2160 using System.Drawing high-quality bicubic interpolation. These preserve the original artwork without generative edits; they are not native 4K generations.

Files follow `Death Note X Painting Title X 1080p.png` and `Death Note X Painting Title X 2160p.png` in `Assets/Death Note/`. Existing optimized 1080p files were renamed to match, and catalogue links updated while keeping stable artwork IDs.

`scripts/tinify_variants.py` creates compressed 2160p PNGs and 640 × 360 WebP thumbnails in `Assets/Death Note/tinified/` using the Tinify API.
