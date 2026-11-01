'use strict';

const byId = id => document.getElementById(id);
const controls = {q: byId('search'), anime: byId('anime'), artist: byId('artist'), artwork: byId('artwork')};
const dialog = byId('piece-dialog');
let records = [];
let previousFocus = null;
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const href = value => escapeHTML(encodeURI(value));
const external = (url, label) => url && /^https:\/\//.test(url) ? `<a class="reference-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)} ↗</a>` : '';
const megabytes = bytes => `${(bytes / 1000000).toFixed(2)} MB`;

function fillSelect(id, values) {
  const select = byId(id);
  select.length = 1;
  [...new Set(values)].sort((a,b) => a.localeCompare(b)).forEach(value => select.add(new Option(value, value)));
}

function readFilters() {
  const params = new URLSearchParams(location.search);
  for (const [name, control] of Object.entries(controls)) control.value = params.get(name) || '';
}

function render(updateURL = true) {
  const query = normalize(controls.q.value.trim()).split(/\s+/).filter(Boolean);
  const filtered = records.filter(record => {
    const searchable = normalize([record.anime.name, ...(record.anime.aliases || []), record.anime.description,
      record.artwork.title, record.artwork.artist, record.artwork.description, ...(record.tags || [])].filter(Boolean).join(' '));
    return (!controls.anime.value || record.anime.name === controls.anime.value)
      && (!controls.artist.value || record.artwork.artist === controls.artist.value)
      && (!controls.artwork.value || record.artwork.title === controls.artwork.value)
      && query.every(word => searchable.includes(word));
  });
  byId('gallery').innerHTML = filtered.map(record => {
    const number = String(records.indexOf(record) + 1).padStart(2, '0');
    const target = `#piece=${encodeURIComponent(record.id)}`;
    return `<article class="wallpaper">
      <a class="wallpaper-image" href="${target}" aria-label="Explore ${escapeHTML(record.anime.name)} × ${escapeHTML(record.artwork.title)}">
        <img src="${href(record.preview)}" alt="${escapeHTML(record.anime.name)} crossover inspired by ${escapeHTML(record.artwork.title)}" width="640" height="360" loading="lazy" decoding="async">
        <span class="piece-number" aria-hidden="true">${number}</span><span class="image-action" aria-hidden="true">A closer look ↗</span>
      </a>
      <div class="wallpaper-caption"><p class="card-anime">${escapeHTML(record.anime.name)} <span class="cross">×</span></p>
        <h3><a href="${target}">${escapeHTML(record.artwork.title)}</a></h3>
        <p class="card-artist">After ${escapeHTML(record.artwork.artist)}${record.artwork.year ? ` · ${escapeHTML(record.artwork.year)}` : ''}</p>
        <div class="card-bottom"><span>1920 × 1080 · AI crossover</span><a href="${target}">Explore & download ↗</a></div>
      </div></article>`;
  }).join('');
  byId('result-count').textContent = `${filtered.length} of ${records.length} ${records.length === 1 ? 'wallpaper' : 'wallpapers'}`;
  byId('empty-state').hidden = filtered.length !== 0;
  byId('clear-filters').hidden = !Object.values(controls).some(control => control.value);
  if (updateURL) {
    const url = new URL(location.href);
    for (const [name, control] of Object.entries(controls)) {
      if (control.value) url.searchParams.set(name, control.value); else url.searchParams.delete(name);
    }
    history.replaceState(null, '', url);
  }
}

function resetFilters() {
  Object.values(controls).forEach(control => { control.value = ''; });
  render();
}

function openPiece(record) {
  if (!dialog.open) previousFocus = document.activeElement;
  const art = record.artwork;
  const original = art.preview ? `<img src="${href(art.preview)}" alt="${escapeHTML(art.title)} by ${escapeHTML(art.artist)}">`
    : `<div class="unavailable">Original-art preview not available.<br>${external(art.sourceUrl, 'View the source artwork')}</div>`;
  byId('piece-content').innerHTML = `<h2 id="piece-title">${escapeHTML(art.title)}</h2>
    <p class="piece-subtitle">${escapeHTML(record.anime.name)} <span class="cross">×</span> ${escapeHTML(art.artist)}${art.year ? ` · ${escapeHTML(art.year)}` : ''}</p>
    <div class="comparison"><figure><div class="comparison-image">${original}</div><figcaption>The original artwork</figcaption></figure>
      <figure><div class="comparison-image crossover"><img src="${href(record.downloads[1]?.path || record.downloads[0].path)}" alt="${escapeHTML(record.anime.name)} × ${escapeHTML(art.title)} — AI-generated crossover"></div><figcaption>The anime crossover · AI-generated</figcaption></figure></div>
    <div class="piece-info"><section><h3>Behind the painting</h3><p>${escapeHTML(art.description || 'Explore the source to learn more about the artwork that inspired this wallpaper.')}</p>${external(art.sourceUrl,'Explore the original')}</section>
      <section><h3>From the anime</h3><p>${escapeHTML(record.anime.description || 'Familiar characters, seen through a different artistic lens.')}</p>${external(record.anime.anidbUrl,'View on AniDB')}${external(record.anime.alternateAnidbUrl,'Brotherhood on AniDB')}</section></div>
    <section class="download-area" aria-labelledby="download-title"><div class="download-heading"><h3 id="download-title">Make it your wallpaper.</h3><button id="share-piece" class="subtle-button" type="button">Copy link ↗</button></div>
      <div class="download-links">${record.downloads.map(file => `<a class="download-link" href="${href(file.path)}" download><strong>${escapeHTML(file.label)} ↓</strong><small>${file.width} × ${file.height} · ${megabytes(file.bytes)}</small></a>`).join('')}</div>
      <p class="download-note">Both downloads have the same dimensions. The optimized PNG has a smaller file size.<br>Need WebP or another format? Download an image, then <a href="https://tinypng.com/convert" target="_blank" rel="noopener noreferrer">convert it with Tinify ↗</a>.</p><p id="share-message" class="share-message" role="status"></p></section>
    <p class="credits">${escapeHTML(art.credit || `Original artwork: ${art.artist}.`)}${art.reuseTerms ? ` ${escapeHTML(art.reuseTerms)}` : ''} ${art.previewSourceUrl ? external(art.previewSourceUrl,'Image source & rights') : ''}<br>Crossover: AI-generated fan artwork. No affiliation with the original creators or rights holders.</p>`;
  byId('piece-content').querySelector('.comparison-image img')?.addEventListener('error', event => {
    event.target.parentElement.innerHTML = `<div class="unavailable">This preview couldn’t load.<br>${external(art.sourceUrl,'View the source artwork')}</div>`;
  });
  byId('share-piece').addEventListener('click', async () => {
    const message = byId('share-message');
    message.textContent = 'Copying link…';
    let timer;
    try {
      await Promise.race([
        navigator.clipboard.writeText(location.href),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Clipboard unavailable')), 1500); })
      ]);
      message.textContent = 'Link copied.';
    } catch {
      message.textContent = 'Copy this link: ';
      const link = document.createElement('input');
      link.className = 'form-control share-url';
      link.readOnly = true;
      link.value = location.href;
      link.setAttribute('aria-label', 'Shareable wallpaper link');
      message.append(link);
      link.focus();
      link.select();
    } finally { clearTimeout(timer); }
  });
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}

function syncPiece() {
  const match = location.hash.match(/^#piece=(.+)$/);
  let id;
  try { id = match && decodeURIComponent(match[1]); } catch { id = null; }
  const record = records.find(item => item.id === id);
  if (record) openPiece(record); else if (dialog.open) dialog.close();
}

function closePiece() {
  if (location.hash.startsWith('#piece=')) history.replaceState(null, '', location.pathname + location.search + '#collection');
  dialog.close();
}

async function loadGallery() {
  byId('load-error').hidden = true;
  byId('result-count').textContent = 'Loading the collection…';
  try {
    const response = await fetch('data/wallpapers.json');
    if (!response.ok) throw new Error('Catalogue request failed');
    const data = await response.json();
    if (!Array.isArray(data) || !data.length) throw new Error('Catalogue is empty');
    records = data;
    // A small editorial ordering: the wave that started it, then the rest by anime.
    records.sort((a,b) => {
      const order = name => name === 'One Piece' ? 0 : /Fullmetal|FMA/.test(name) ? 1 : name === 'Death Note' ? 2 : 3;
      return order(a.anime.name) - order(b.anime.name);
    });
    fillSelect('anime', records.map(record => record.anime.name));
    fillSelect('artist', records.map(record => record.artwork.artist));
    fillSelect('artwork', records.map(record => record.artwork.title));
    readFilters(); render(false); syncPiece();
  } catch (error) {
    byId('load-error').hidden = false;
    byId('result-count').textContent = 'Collection unavailable';
    console.error('Unable to load wallpaper catalogue:', error);
  }
}

byId('filters').addEventListener('submit', event => event.preventDefault());
controls.q.addEventListener('input', () => render());
for (const control of [controls.anime, controls.artist, controls.artwork]) control.addEventListener('change', () => render());
byId('clear-filters').addEventListener('click', resetFilters);
byId('empty-reset').addEventListener('click', resetFilters);
byId('retry').addEventListener('click', loadGallery);
byId('close-dialog').addEventListener('click', closePiece);
dialog.addEventListener('cancel', event => { event.preventDefault(); closePiece(); });
dialog.addEventListener('click', event => { if (event.target === dialog) {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closePiece();
} });
dialog.addEventListener('close', () => { if (previousFocus?.isConnected) previousFocus.focus({preventScroll:true}); });
window.addEventListener('hashchange', syncPiece);
window.addEventListener('popstate', () => { readFilters(); render(false); syncPiece(); });
loadGallery();
