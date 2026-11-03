# Production image audit

All production `<img>` sources and responsive candidates are WebP. Downloads and historical mockups are outside this rendering inventory. The 316-byte SVG favicon and inline control SVGs remain vectors; rasterizing these would increase their size and lose scalable edges.

Generated locally with Pillow/libwebp, method 6: quality 85 for AI Crossovers, 90 for the logo. No Tinify API requests or quota were used. Existing 640px catalogue previews and original-work WebPs remain unchanged. No claims are made about the logo’s prior Tinify processing.

Rebuild derivatives with `python scripts/web_images.py` (requires Pillow with WebP support). Catalogue `webImage` fields provide dimensions, byte sizes and paths. The source PNG downloads remain untouched.

| AI Crossover | Previous viewer PNG | 320px WebP | 1280px WebP | 1920px WebP |
|---|---:|---:|---:|---:|
| Death Note × Nighthawks | 986.3 KB | 8.9 KB | 93.2 KB | 170.4 KB |
| Death Note × The Death of Marat | 1225.1 KB | 6.1 KB | 73.3 KB | 137.4 KB |
| Death Note × The Scream | 1338.6 KB | 21.9 KB | 298.3 KB | 522.9 KB |
| Death Note × The Son of Man | 1044.2 KB | 9.5 KB | 107.3 KB | 184.0 KB |
| Demon Slayer × Rain, Steam, and Speed | 1194.6 KB | 17.5 KB | 217.2 KB | 369.7 KB |
| Demon Slayer × Fine Wind, Clear Morning | 1169.9 KB | 22.2 KB | 301.2 KB | 555.3 KB |
| Demon Slayer × The Japanese Footbridge | 1488.3 KB | 27.3 KB | 377.2 KB | 659.0 KB |
| Demon Slayer × The Great Wave off Kanagawa | 1334.9 KB | 27.5 KB | 323.1 KB | 540.5 KB |
| Demon Slayer × The Abbey in the Oakwood | 1505.1 KB | 18.4 KB | 243.6 KB | 412.4 KB |
| Fullmetal Alchemist × The Creation of Adam | 1194.1 KB | 14.2 KB | 147.6 KB | 248.9 KB |
| Fullmetal Alchemist × Wanderer above the Sea of Fog | 1091.5 KB | 16.7 KB | 191.4 KB | 317.7 KB |
| One Piece × The Great Wave off Kanagawa | 1330.5 KB | 29.1 KB | 364.1 KB | 648.8 KB |

Logo: 1536×1024 PNG, 1,412,255 bytes → 378×252 WebP, 28,966 bytes (supports the 126px desktop logo at 3× density).

## Existing previews verified

| Path | Dimensions | Bytes |
|---|---:|---:|
| `previews/death-note-nighthawks.webp` | 640×360 | 16,406 |
| `previews/death-note-the-death-of-marat.webp` | 640×360 | 11,410 |
| `previews/death-note-the-scream.webp` | 640×360 | 57,606 |
| `previews/death-note-the-son-of-man.webp` | 640×360 | 18,512 |
| `previews/demon-slayer-mugen-train-turner.webp` | 640×360 | 39,150 |
| `previews/demon-slayer-rengoku-red-fuji.webp` | 640×360 | 55,390 |
| `previews/demon-slayer-shinobu-monet-garden.webp` | 640×360 | 74,298 |
| `previews/demon-slayer-tanjiro-great-wave-corrected.webp` | 640×360 | 68,556 |
| `previews/demon-slayer-tanjiro-moonlit-temple.webp` | 640×360 | 45,792 |
| `previews/fma-fma-creation-of-adam-1920x1080.webp` | 640×360 | 27,456 |
| `previews/fma-fma-wanderer-1920x1080.webp` | 640×360 | 36,972 |
| `previews/one-piece-one-piece-great-wave-1920x1080.webp` | 640×360 | 75,102 |
| `previews/originals/abbey.webp` | 640×410 | 31,646 |
| `previews/originals/creation-of-adam.webp` | 640×291 | 44,440 |
| `previews/originals/great-wave.webp` | 640×430 | 85,520 |
| `previews/originals/japanese-footbridge.webp` | 640×516 | 95,826 |
| `previews/originals/marat.webp` | 498×640 | 35,982 |
| `previews/originals/nighthawks.webp` | 640×349 | 22,308 |
| `previews/originals/rain-steam-speed.webp` | 640×481 | 59,264 |
| `previews/originals/red-fuji.webp` | 640×432 | 74,140 |
| `previews/originals/son-of-man.webp` | 276×362 | 9,380 |
| `previews/originals/the-scream.webp` | 500×637 | 82,914 |
| `previews/originals/wanderer.webp` | 502×640 | 32,572 |
