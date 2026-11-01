# GitHub Pages plan

GitHub Free supports Pages from public repositories. GitHub Pro also supports
Pages from private personal repositories. Repository privacy does not itself
make the published website private.

Recommendation: public `animart` repository and public GitHub Pages gallery.
No remote repository or deployment has been created yet.

Start with static HTML/CSS/JavaScript and a JSON catalogue. Keep generated preview
files and current downloads in Git. Use repository-relative URLs so project Pages
works under `/animart/`. If a build step is chosen, deploy only its static output
through GitHub Actions. Otherwise publish a curated static directory.

Do not publish local tools, secrets, or environment files in the site artifact.
Tinify runs locally or in an explicitly triggered workflow using a repository secret.
Do not regenerate previews on each deployment. Commit generated outputs.

Current image payload: 56,949,722 bytes across 24 PNG files.
Pages currently limits published sites to 1 GB with a soft 100 GB/month bandwidth limit.
Reassess image hosting as the collection grows.

Sources:
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://tinypng.com/developers/reference
