# GitHub Pages plan

GitHub Free supports Pages from public repositories. GitHub Pro also supports
Pages from private personal repositories. Repository privacy does not itself
make the published website private.

Public source repository: https://github.com/perisdr/animart
The beta is versioned as `v0.1.0-beta.1`. GitHub Pages has not been enabled;
the website remains in local UI/UX review.

Use static HTML/CSS/JavaScript and fetch the existing JSON catalogue. Local testing
uses a static HTTP server; direct `file://` access is not required. Keep generated
preview files and current downloads in Git. Use repository-relative URLs so project Pages
works under `/animart/`. No frontend build step is permitted. Publish the static
files directly, with `.nojekyll` when configuring branch-based Pages hosting.

Do not publish local tools, secrets, or environment files in the site artifact.
Tinify runs locally or in an explicitly triggered workflow using a repository secret.
Do not regenerate previews on each deployment. Commit generated outputs.

Before publication, review the per-image rights notes in the catalogue, especially
the non-free Son of Man reference and the jurisdiction-specific Nighthawks reference.
The local preview includes these for comparison; their source licences must not be
treated as a blanket licence covering this gallery.

Current image payload: 56,949,722 bytes across 24 PNG files.
Pages currently limits published sites to 1 GB with a soft 100 GB/month bandwidth limit.
Reassess image hosting as the collection grows.

Sources:
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://tinypng.com/developers/reference
