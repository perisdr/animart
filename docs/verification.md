# First gallery verification

Checked locally on 2026-11-01 using the in-app browser and the static preview server.

- All 12 catalogue entries render, with 11 distinct original artworks (the Great Wave is shared).
- All 24 download URLs return HTTP 200 with the expected file sizes.
- Anime and artist filters combine correctly; Demon Slayer + Hokusai yields two records.
- Adding "wave" to that combination yields one record.
- Artist and artwork filters combine; Hokusai + Great Wave yields two records.
- Filter selections persist through refresh using URL query parameters.
- Anime aliases work: "fma" finds both Fullmetal Alchemist wallpapers.
- Empty searches show the no-results state; reset restores all 12 records.
- Details open from cards and direct fragment links; Escape and Close dismiss them.
- Clipboard access is unavailable in this test browser; the selectable-link fallback works.
- Desktop (1440px) shows three gallery columns; narrow mobile (390px) shows one.
- Mobile gallery and detail views have no horizontal overflow; original proportions are preserved.
- Original thumbnails were checked visually together and validated with Pillow.
- JavaScript syntax check and Git whitespace checks pass.

## Source limitations

AniDB rejects automated direct access in this environment. Entry IDs were corroborated
using indexed references; links have not been interactively verified on AniDB itself.
FMA includes both the 2003 series and Brotherhood rather than asserting a specific adaptation.

Artwork image rights are recorded individually in the catalogue. In particular,
Wikipedia's Son of Man image is non-free and its Wikipedia fair-use rationale is
article-specific, not permission for this site. Nighthawks has jurisdiction-specific
rights information. Review these reference images before public deployment.

This is a local website preview. The beta source repository is
https://github.com/perisdr/animart; the website has not been deployed.
