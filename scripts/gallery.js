'use strict';
const SITE_BUILD = '2026.11.10.6';
const buildLabel = document.querySelector('#site-build');
if (buildLabel) {
  buildLabel.textContent = 'Build ' + SITE_BUILD;
  buildLabel.hidden = false;
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root = document.querySelector('#pieces');
const controls = {q:document.querySelector('#search'),anime:document.querySelector('#anime'),artist:document.querySelector('#artist'),artwork:document.querySelector('#artwork')};
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function readFilters(){
  const params = new URLSearchParams(location.search);
  for (const [name, control] of Object.entries(controls)) control.value = params.get(name) || '';
  if (Object.values(controls).some(control => control.value)) {
    filterToggle.setAttribute('aria-expanded', 'true');
    document.querySelector('#gallery-filters').classList.add('is-open');
    if (controls.artist.value || controls.artwork.value) document.querySelector('.additional-filters').open = true;
  }
}
function clearFilters(){Object.values(controls).forEach(control=>control.value='');filter();}
function fillSelect(name,values){const select=controls[name];select.length=1;[...new Set(values)].sort((a,b)=>a.localeCompare(b)).forEach(value=>select.add(new Option(value,value)));}

const mobile = matchMedia('(max-width: 767px)');
mobile.addEventListener('change', () => render());
const filterToggle = document.querySelector('.mobile-filter-toggle');
filterToggle.addEventListener('click', () => {
  const open = filterToggle.getAttribute('aria-expanded') !== 'true';
  filterToggle.setAttribute('aria-expanded', String(open));
  document.querySelector('#gallery-filters').classList.toggle('is-open', open);
});
let view = 'grid', currentId = null, records = [], filtered = [];
const galleryPages = {grid: {page: 1, size: 6}, list: {page: 1, size: 4}};
const pageOptions = document.querySelector('#gallery-page-options');
const pagination = document.querySelector('#gallery-pagination');
const pageSize = document.querySelector('#page-size');
const listActions = document.querySelector('#gallery-list-actions');
const collectionTitle = document.querySelector('#collection-title');
const baseTitle = document.title;
const listingView = () => view;
const pageSizes = [4, 6, 8, 10, 12];
let sliderPage = 1;
const galleryLocationKey = () => {
  const params = new URLSearchParams(location.search);
  return JSON.stringify([...Object.keys(controls), 'view', 'page', 'pageSize'].map(name => params.get(name)));
};
let lastGalleryLocation = galleryLocationKey();

function parseGalleryLocation(search) {
  const params = new URLSearchParams(search);
  const mode = ['grid', 'list', 'slider'].includes(params.get('view')) ? params.get('view') : 'grid';
  const requestedPage = Number(params.get('page'));
  const requestedSize = Number(params.get('pageSize'));
  return {
    view: mode,
    page: Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    size: mode === 'slider' ? 1 : pageSizes.includes(requestedSize) ? requestedSize : mode === 'list' ? 4 : 6
  };
}

function readGalleryLocation() {
  const state = parseGalleryLocation(location.search);
  view = state.view;
  if (view === 'slider') sliderPage = state.page;
  else Object.assign(galleryPages[view], {page: state.page, size: state.size});
  lastGalleryLocation = galleryLocationKey();
}

function writeGalleryLocation(push = false) {
  const url = new URL(location.href);
  for (const [name, control] of Object.entries(controls)) {
    if (control.value) url.searchParams.set(name, control.value);
    else url.searchParams.delete(name);
  }
  url.searchParams.set('view', view);
  url.searchParams.set('page', view === 'slider' ? sliderPage : galleryPages[view].page);
  if (view === 'slider') url.searchParams.delete('pageSize');
  else url.searchParams.set('pageSize', galleryPages[view].size);
  if (url.href !== location.href) history[push ? 'pushState' : 'replaceState'](null, '', url);
  lastGalleryLocation = galleryLocationKey();
}

function paginationPages(total, current) {
  if (total <= 7) return Array.from({length: total}, (_, index) => index + 1);
  const visible = new Set([1, 2, 3, total - 2, total - 1, total]);
  for (let page = current - 1; page <= current + 1; page++) {
    if (page >= 1 && page <= total) visible.add(page);
  }
  const pages = [...visible].sort((a, b) => a - b);
  const result = [];
  pages.forEach((page, index) => {
    const previous = pages[index - 1];
    if (page - previous === 2) result.push(previous + 1);
    else if (page - previous > 2) result.push(null);
    result.push(page);
  });
  return result;
}

function pageLink(page, text, attributes = '') {
  const url = new URL(location.href);
  url.searchParams.set('view', 'grid');
  url.searchParams.set('page', page);
  url.searchParams.set('pageSize', galleryPages.grid.size);
  url.hash = 'collection-title';
  return `<a class="btn btn-outline-dark" href="${esc(url.pathname + url.search + url.hash)}" data-page="${page}" aria-controls="pieces" ${attributes}>${text}</a>`;
}

function pageRecords() {
  const mode = listingView();
  const state = galleryPages[mode];
  const visible = Boolean(state && filtered.length);
  pageOptions.hidden = !visible;
  pagination.hidden = true;
  listActions.hidden = !visible || mode !== 'list';
  document.title = baseTitle;
  if (!visible) {
    if (state && !filtered.length) state.page = 1;
    return filtered;
  }
  const totalPages = Math.ceil(filtered.length / state.size);
  state.page = Math.min(state.page, totalPages);
  const start = mode === 'list' ? 0 : (state.page - 1) * state.size;
  const end = Math.min(state.page * state.size, filtered.length);
  pageSize.value = String(state.size);
  document.querySelector('label[for="page-size"]').textContent = mode === 'list' ? 'AI Crossovers per batch' : 'AI Crossovers per page';
  document.querySelector('#gallery-range').textContent = `Showing ${start + 1}–${end} of ${filtered.length} AI Crossovers`;
  if (mode === 'list') {
    const more = document.querySelector('#load-more');
    more.hidden = end === filtered.length;
    more.setAttribute('aria-label', `Load ${Math.min(state.size, filtered.length - end)} more AI Crossovers`);
    document.querySelector('#list-progress').textContent = end === filtered.length ? `All ${filtered.length} AI Crossovers shown` : `${end} of ${filtered.length} AI Crossovers shown`;
  } else {
    pagination.hidden = totalPages === 1;
    const pages = paginationPages(totalPages, state.page).map(page => page === null
      ? '<li class="pagination-gap"><span aria-hidden="true">…</span><span class="visually-hidden">Skipped pages</span></li>'
      : `<li>${pageLink(page, page, `aria-label="Page ${page} of ${totalPages}"${page === state.page ? ' aria-current="page"' : ''}`)}</li>`).join('');
    pagination.innerHTML = `${state.page > 1 ? pageLink(state.page - 1, 'Previous', 'rel="prev" aria-label="Previous page"') : ''}<ul class="pagination-pages">${pages}</ul>${state.page < totalPages ? pageLink(state.page + 1, 'Next', 'rel="next" aria-label="Next page"') : ''}`;
    if (totalPages > 1) document.title = `The collection (page ${state.page} of ${totalPages}) — Animart`;
  }
  return filtered.slice(start, end);
}

let anchorScrollFrame = 0;
function cancelAnchorScroll() {
  cancelAnimationFrame(anchorScrollFrame);
  anchorScrollFrame = 0;
}
// Let deliberate user input interrupt a guided scroll immediately.
for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
  window.addEventListener(event, cancelAnchorScroll, {passive: true});
}

function scrollToCollectionHeading() {
  cancelAnchorScroll();
  collectionTitle.focus({preventScroll: true});
  const margin = parseFloat(getComputedStyle(collectionTitle).scrollMarginTop) || 0;
  const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const destination = Math.min(maximum, Math.max(0, window.scrollY + collectionTitle.getBoundingClientRect().top - margin));
  const origin = window.scrollY;
  const distance = destination - origin;
  if (reducedMotion.matches || Math.abs(distance) < 1) {
    window.scrollTo({top: destination, behavior: 'instant'});
    return;
  }
  const started = performance.now();
  const duration = 1100;
  function step(now) {
    const progress = Math.min(1, (now - started) / duration);
    const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    window.scrollTo({top: origin + distance * eased, behavior: 'instant'});
    anchorScrollFrame = progress < 1 ? requestAnimationFrame(step) : 0;
  }
  anchorScrollFrame = requestAnimationFrame(step);
}

function revealListAdditions(start) {
  if (reducedMotion.matches) return;
  Array.from(root.children).slice(start).forEach((entry, index) => {
    entry.animate([
      {opacity: .35, transform: 'translateY(16px)', clipPath: 'inset(0 0 10% 0)'},
      {opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0)'}
    ], {duration: 650, delay: Math.min(index * 70, 350), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'});
  });
}

function scrollToGalleryStart() {
  if (listingView() === 'grid') {
    scrollToCollectionHeading();
    return;
  }
  root.querySelector('h3 a')?.focus({preventScroll: true});
  root.scrollIntoView({behavior: 'instant', block: 'start'});
}

pagination.addEventListener('click', event => {
  const link = event.target.closest('a[data-page]');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const page = Number(link.dataset.page);
  if (page === galleryPages.grid.page) return;
  galleryPages.grid.page = page;
  history.pushState(null, '', link.href);
  lastGalleryLocation = galleryLocationKey();
  render();
  scrollToGalleryStart();
});

document.querySelector('#load-more').addEventListener('click', () => {
  if (listingView() !== 'list') return;
  const count = root.querySelectorAll(':scope > article').length;
  const state = galleryPages.list;
  if (count >= filtered.length) return;
  state.page++;
  const additions = filtered.slice(count, state.page * state.size);
  root.insertAdjacentHTML('beforeend', additions.map(listListing).join(''));
  revealListAdditions(count);
  pageRecords();
  writeGalleryLocation();
  root.children[count]?.querySelector('h3 a')?.focus({preventScroll: true});
});

document.querySelector('#gallery-go-top').addEventListener('click', event => {
  event.preventDefault();
  scrollToCollectionHeading();
});

pageSize.addEventListener('change', () => {
  const state = galleryPages[listingView()];
  const size = Number(pageSize.value);
  if (!state || !pageSizes.includes(size)) return;
  state.size = size;
  state.page = 1;
  render();
  writeGalleryLocation(true);
  scrollToGalleryStart();
});

const path = p => esc(encodeURI(p));
const detail = r => `#piece=${encodeURIComponent(r.id)}`;
const defaultDownload = r => r.downloads.find(d => d.label === 'Tinified 1080p') || r.downloads[0];
function downloadButton(r) {
  const groups = [1080, 2160].map(height => {
    const files = r.downloads.filter(file => file.height === height);
    return `<section class="download-group"><h3 class="download-group-title">${height === 1080 ? 'Full HD · 1080p' : '4K · 2160p'}</h3>${files.map(file => `<a class="download-file" href="${path(file.path)}" download><span><strong>${file.label.startsWith('Tinified') ? 'Optimized PNG' : 'Uncompressed PNG'}</strong></span><span>${(file.bytes / 1000000).toFixed(2)} MB ↓</span></a>`).join('')}</section>`;
  }).join('');
  return `<details class="download-picker"><summary aria-label="Download options for ${esc(r.anime.name)} × ${esc(r.artwork.title)}" title="Download options"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></svg></summary><div class="download-panel">${groups}</div></details>`;
}
function positionDownloadPanel(picker) {
  const panel = picker.querySelector('.download-panel');
  const trigger = picker.querySelector('summary').getBoundingClientRect();
  const gap = 8;
  const width = Math.min(360, window.innerWidth - 24);
  panel.style.width = width + 'px';
  panel.style.left = Math.max(12, Math.min(trigger.right - width, window.innerWidth - width - 12)) + 'px';
  const below = window.innerHeight - trigger.bottom - gap - 12;
  const above = trigger.top - gap - 12;
  const openAbove = below < 240 && above > below;
  panel.style.maxHeight = Math.max(80, openAbove ? above : below) + 'px';
  panel.style.top = openAbove ? 'auto' : (trigger.bottom + gap) + 'px';
  panel.style.bottom = openAbove ? (window.innerHeight - trigger.top + gap) + 'px' : 'auto';
}
document.addEventListener('toggle', event => {
  const picker = event.target;
  if (!picker.matches?.('.download-picker') || !picker.open) return;
  document.querySelectorAll('.download-picker[open]').forEach(other => {
    if (other !== picker) other.open = false;
  });
  positionDownloadPanel(picker);
}, true);
document.addEventListener('pointerdown', event => {
  document.querySelectorAll('.download-picker[open]').forEach(picker => {
    const trigger = picker.querySelector('summary');
    const panel = picker.querySelector('.download-panel');
    if (!trigger.contains(event.target) && !panel.contains(event.target)) {
      picker.open = false;
    }
  });
}, true);
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const picker = document.querySelector('.download-picker[open]');
  if (picker) {
    event.preventDefault();
    event.stopPropagation();
    picker.open = false;
    picker.querySelector('summary').focus();
  }
}, true);
window.addEventListener('resize', () => {
  document.querySelectorAll('.download-picker[open]').forEach(positionDownloadPanel);
});
document.addEventListener('scroll', () => {
  document.querySelectorAll('.download-picker[open]').forEach(positionDownloadPanel);
}, true);
function image(r, large = false, eager = false, thumbnail = false, priority = false) {
  const web = r.webImage;
  const source = thumbnail ? web.thumbnail.path : large ? web.large.path : r.preview;
  const sizes = large
    ? window.animartFeatured.sizes
    : '(max-width: 767px) 100vw, (min-width: 1200px) calc((100vw - 144px) / 3), calc(50vw - 64px)';
  const responsive = thumbnail ? '' : ` srcset="${esc(window.animartFeatured.srcset(r))}" sizes="${sizes}"`;
  return `<img decoding="async" ${large || eager ? 'loading="eager"' : 'loading="lazy"'}${priority ? ` fetchpriority="high" width="${web.large.width}" height="${web.large.height}"` : ''} src="${path(source)}"${responsive} alt="${esc(r.anime.name)} AI Crossover inspired by ${esc(r.artwork.title)}">`;
}
const crossoverTitle = r => `<span class="title-anime">${esc(r.anime.name)}</span> <span class="title-cross">×</span> <span class="title-art">${esc(r.artwork.title)}</span>`;
const crossoverHeading = (r, level = 3) => `<h${level}><a class="crossover-title" href="${detail(r)}">${crossoverTitle(r)}</a></h${level}>`;
const artistCredit = r => `<p class="artist-credit">After ${esc(r.artwork.artist)}${r.artwork.year ? ` · ${esc(r.artwork.year)}` : ""}</p>`;
const mangaCredit = r => `<p class="artist-credit manga-credit">Manga by ${esc(r.anime.mangaCreator)}</p>`;
const crossoverCredits = r => `<div class="crossover-byline">${mangaCredit(r)}${artistCredit(r)}</div>`;
// Each view owns its listing layout; only the content helpers are shared.
const gridListing = r => mobile.matches ? `<article>${crossoverHeading(r)}<a class="mobile-crossover preview-link" href="${detail(r)}">${image(r)}<span class="explore-orb" aria-hidden="true">Explore</span></a><div class="mobile-caption">${crossoverCredits(r)}</div></article>` : `<article class="col-md-6 col-xl-4"><div class="piece">${crossoverHeading(r)}<a class="preview-link" href="${detail(r)}">${image(r)}<span class="explore-orb" aria-hidden="true">Explore</span></a><div class="piece-copy">${crossoverCredits(r)}</div></div></article>`;
const listListing = r => `<article class="list-piece"><div class="list-copy">${crossoverHeading(r)}<p class="list-description">${esc(r.artwork.description || '')}</p></div><div class="list-preview"><div class="list-media"><div class="list-manga-credit">${mangaCredit(r)}</div><a class="list-image preview-link" href="${detail(r)}">${image(r)}<span class="explore-orb" aria-hidden="true">Explore</span></a><div class="list-art-credit">${artistCredit(r)}</div></div></div><div class="list-action"><span>1920 × 1080</span><a href="${detail(r)}">View details →</a></div></article>`;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    if (anchorScrollFrame) {
      cancelAnchorScroll();
      collectionTitle.scrollIntoView({behavior: 'instant', block: 'start'});
    }
    root.getAnimations({subtree:true}).forEach(animation => animation.cancel());
    root.querySelectorAll('.slide-outgoing').forEach(image => image.remove());
  }
});
const sliderListing = (r,i) => `<section class="slider-stage" aria-label="AI Crossover viewer" aria-roledescription="carousel"><div class="slider-art">${crossoverHeading(r)}<a class="preview-link" href="${detail(r)}">${image(r,true)}<span class="explore-orb" aria-hidden="true">Explore</span></a>${crossoverCredits(r)}<div class="slide-navigation"><button class="btn" id="previous" aria-label="Previous AI Crossover" ${filtered.length===1?'disabled':''}>←</button><p role="status">${i+1} / ${filtered.length} <span>— ${esc(r.anime.name)}</span></p><button class="btn" id="next" aria-label="Next AI Crossover" ${filtered.length===1?'disabled':''}>→</button></div></div><aside class="slider-caption"><p class="slide-description">${esc(r.artwork.description||'')}</p>${r.artwork.preview?`<figure class="source-reference"><img src="${path(r.artwork.preview)}" alt="${esc(r.artwork.title)} — original artwork"><figcaption>The original artwork</figcaption></figure>`:''}</aside></section>`;
function changeSlide(id, focusId, direction = 1) {
  if (id === currentId) return;
  const previousImage = root.querySelector('.slider-art > a > img');
  const outgoing = previousImage?.cloneNode(true);
  currentId = id;
  const index = filtered.findIndex(record => record.id === id);
  sliderPage = index + 1;
  writeGalleryLocation();
  root.querySelector('.slider-stage').outerHTML = sliderListing(filtered[index],index);
  document.getElementById(focusId)?.focus({preventScroll:true});
  const incoming = root.querySelector('.slider-art > a > img');
  if (!incoming || !outgoing || reducedMotion.matches) return;
  outgoing.className = 'slide-outgoing';
  outgoing.alt = '';
  outgoing.setAttribute('aria-hidden','true');
  incoming.parentElement.append(outgoing);
  // Keep the previous print visible until the new image is ready; never delay controls.
  incoming.decode().then(() => {
    if (!incoming.isConnected || reducedMotion.matches) return;
    const animation = outgoing.animate([
      {clipPath:'inset(0 0 0 0)'},
      {clipPath:direction > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'}
    ], {duration:420,easing:'cubic-bezier(.22,1,.36,1)'});
    return animation.finished.catch(() => {});
  }).catch(() => {}).finally(() => outgoing.remove());
}
function render() {
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
  document.querySelector('#count').textContent = `${filtered.length} of ${records.length} AI Crossovers`;
  root.className = `gallery-${view}`;
  const listings = pageRecords();
  if (!filtered.length) { root.innerHTML='<div class="gallery-empty"><h3>No AI Crossovers found.</h3><p>Try another search or return to the full collection.</p><button type="button" class="btn btn-outline-dark" id="reset-gallery">Clear filters</button></div>';document.querySelector('#reset-gallery').onclick=()=>{clearFilters();document.querySelector('#search').focus();};return; }
  if (!filtered.some(r => r.id === currentId)) currentId = filtered[0].id;
  if (view === 'grid') {
    root.className = mobile.matches ? 'gallery-mobile' : 'gallery-grid';
    const entries = listings.map(gridListing).join('');
    root.innerHTML = mobile.matches ? entries : `<div class="row g-4">${entries}</div>`;
    return;
  }
  if (view === 'list') { root.innerHTML = listings.map(listListing).join('');return; }
  const i=filtered.findIndex(r=>r.id===currentId),r=filtered[i];
  sliderPage = i + 1;
  root.innerHTML=sliderListing(r,i);
}
root.addEventListener('click', event => {
  const button = event.target.closest('#previous, #next');
  if (!button || button.disabled) return;
  const index = filtered.findIndex(record => record.id === currentId);
  const direction = button.id === 'next' ? 1 : -1;
  const target = (index + direction + filtered.length) % filtered.length;
  changeSlide(filtered[target].id,button.id,direction);
});
root.addEventListener('keydown', event => {
  if (view !== 'slider' || mobile.matches || !['ArrowLeft','ArrowRight'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (!event.target.matches('#previous, #next')) return;
  event.preventDefault();
  const amount = event.key === 'ArrowRight' ? 1 : -1;
  const index = filtered.findIndex(record => record.id === currentId);
  changeSlide(filtered[(index + amount + filtered.length) % filtered.length].id,event.target.id || null,amount);
});
function filter(updateURL=true, resetPages=true){
  if (resetPages) Object.values(galleryPages).forEach(state => { state.page = 1; });
  const words=normalize(controls.q.value.trim()).split(/\s+/).filter(Boolean);
  filtered=records.filter(r=>{
    const text=normalize([r.anime.name,...(r.anime.aliases||[]),r.anime.description,r.anime.mangaCreator,r.artwork.title,r.artwork.artist,r.artwork.description,...(r.tags||[])].filter(Boolean).join(' '));
    return (!controls.anime.value||r.anime.name===controls.anime.value)&&(!controls.artist.value||r.artwork.artist===controls.artist.value)&&(!controls.artwork.value||r.artwork.title===controls.artwork.value)&&words.every(word=>text.includes(word));
  });
  document.querySelector('#clear-filters').hidden=!Object.values(controls).some(control=>control.value);
  if (view === 'slider') {
    if (resetPages) sliderPage = 1;
    sliderPage = Math.min(sliderPage, Math.max(1, filtered.length));
    currentId = filtered[sliderPage - 1]?.id || null;
  }
  render();
  if (updateURL) writeGalleryLocation();
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;render();writeGalleryLocation(true);});
controls.q.addEventListener('input',()=>filter());
for(const name of ['anime','artist','artwork'])controls[name].addEventListener('change',()=>filter());
document.querySelector('#clear-filters').addEventListener('click',clearFilters);
async function loadGallery(){
  document.querySelector('#load-error').hidden=true;
  pageOptions.hidden=true;
  pagination.hidden=true;
  listActions.hidden=true;
  document.querySelector('.collection-update').hidden=true;
  document.querySelector('#count').textContent='Loading the collection…';
  try{
    const {records:data, featured}=await window.animartFeatured.load();
    records=data;
    if (featured) {
      document.querySelector('#featured').innerHTML = `<div class="featured-layout">${crossoverHeading(featured, 2)}<a class="featured-image preview-link" href="${detail(featured)}">${image(featured,true,false,false,true)}<span class="explore-orb" aria-hidden="true">Explore</span></a><div class="featured-caption">${crossoverCredits(featured)}</div></div>`;
    }
    const order=name=>name==='One Piece'?0:/Fullmetal|FMA/.test(name)?1:name==='Death Note'?2:3;
    records.sort((a,b)=>order(a.anime.name)-order(b.anime.name));
    fillSelect('anime',records.map(r=>r.anime.name));fillSelect('artist',records.map(r=>r.artwork.artist));fillSelect('artwork',records.map(r=>r.artwork.title));
    renderCollectionUpdate();currentId=records[0].id;readFilters();readGalleryLocation();filter(false,false);writeGalleryLocation();syncDetail();
  }catch(error){root.innerHTML='';document.querySelector('#load-error').hidden=false;document.querySelector('#count').textContent='Collection unavailable';console.error('Unable to load collection:',error);}
}
document.querySelector('#retry').addEventListener('click',loadGallery);

const crossoverDialog = document.querySelector('#crossover-dialog');
let detailLauncher = null;
const externalLink = (url,label) => /^https:\/\//.test(url || '') ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : '';
function interestingLinks(artwork) {
  const links = (artwork.links || []).map(link => externalLink(link.url, link.label)).filter(Boolean);
  return links.length ? '<section class="interesting-links"><h3>Interesting links</h3><ul>' + links.map(link => '<li>' + link + '</li>').join('') + '</ul></section>' : '';
}
function renderCollectionUpdate() {
  const latest = records.map(r => r.addedOn).filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date || '') && !Number.isNaN(Date.parse(date))).sort().at(-1);
  const lastAdded = document.querySelector('#last-added');
  lastAdded.replaceChildren();
  if (latest) {
    const time = document.createElement('time');
    time.dateTime = latest;
    time.textContent = new Intl.DateTimeFormat('en-GB', {day:'numeric', month:'long', year:'numeric', timeZone:'UTC'}).format(new Date(latest));
    lastAdded.append('Last added: ', time);
  }
  const artists = new Set(records.map(r => r.artwork.artist)).size;
  const anime = new Set(records.map(r => r.anime.name)).size;
  document.querySelector('#collection-totals').textContent = records.length + ' AI Crossovers · ' + artists + ' original artists · ' + anime + ' anime';
  document.querySelector('.collection-update').hidden = false;
}
let promptRequest;
function loadPrompts() {
  if (!promptRequest) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),8000);
    promptRequest = fetch('data/prompts.json',{signal:controller.signal})
      .then(response => { if (!response.ok) throw Error('Prompts unavailable'); return response.json(); })
      .catch(() => { promptRequest = null; return null; })
      .finally(() => clearTimeout(timeout));
  }
  return promptRequest;
}
let detailVersion = 0;
function syncDetail() {
  const version = ++detailVersion;
  const match=location.hash.match(/^#piece=(.+)$/);let id;
  try{id=match?decodeURIComponent(match[1]):null;}catch{id=null;}
  const r=records.find(item=>item.id===id);
  if(!r){if(crossoverDialog.open)crossoverDialog.close();return;}
  if(!crossoverDialog.open)detailLauncher=document.activeElement;
  document.querySelector('#crossover-content').innerHTML=`<div class="row g-3 align-items-end"><div class="col-lg-8"><h2 id="crossover-title">${crossoverTitle(r)}</h2><p>${esc(r.anime.mangaCreator)} × ${esc(r.artwork.artist)}</p></div><div class="col-lg-4">${downloadButton(r)}</div></div><div class="comparison-controls my-4"><div class="btn-group compare-switch" role="group" aria-label="Original and AI Crossover comparison"><button class="btn" data-compare="0" aria-pressed="false">Original</button><button class="btn" data-compare="1" aria-pressed="true">Both</button><button class="btn" data-compare="2" aria-pressed="false">AI Crossover</button></div><p id="comparison-hint">Select an image to expand it. Select it again or choose Both to compare.</p></div><div class="art-comparison" data-mode="both"><figure data-image="original">${r.artwork.preview?`<img src="${path(r.artwork.preview)}" alt="${esc(r.artwork.title)} by ${esc(r.artwork.artist)}">`:'<p>Original preview unavailable.</p>'}<figcaption>The original artwork</figcaption></figure><figure data-image="crossover">${image(r,true)}<figcaption>The AI Crossover</figcaption></figure></div><div class="row g-4 mt-2"><section class="col-md-6"><h3>Behind the painting</h3><p>${esc(r.artwork.description||'')}</p>${externalLink(r.artwork.sourceUrl,'View the original')}</section><section class="col-md-6"><h3>From the anime</h3><p>${esc(r.anime.description||'')}</p>${externalLink(r.anime.anidbUrl,'Explore the anime')}${externalLink(r.anime.alternateAnidbUrl,'Brotherhood on AniDB')}</section></div>${interestingLinks(r.artwork)}<section class="prompt-section"><h3>The Prompt</h3><p role="status">Loading the original prompt…</p></section><section class="crossover-credits"><h3>Credits & sources</h3><p>Manga: ${esc(r.anime.mangaCreator)}. ${externalLink(r.anime.mangaSourceUrl,'Manga creator & source')}</p><p>${esc(r.artwork.credit||r.artwork.artist)} ${esc(r.artwork.reuseTerms||'')}</p>${externalLink(r.artwork.previewSourceUrl,'Image source & rights')}<p>AI Crossover: an AI-generated fan experiment. No affiliation with the original creators or rights holders.</p></section>`;
  const comparison = crossoverDialog.querySelector('.art-comparison');
  const modes = ['original','both','crossover'];
  function setComparison(value) {
    const previous = new Map();
    comparison.querySelectorAll('img').forEach(img => {
      img.getAnimations().forEach(animation => animation.cancel());
      previous.set(img, img.getBoundingClientRect());
    });
    comparison.dataset.mode = modes[value];
    crossoverDialog.querySelectorAll('[data-compare]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.compare) === value)));
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && crossoverDialog.open) {
      comparison.querySelectorAll('img').forEach(img => {
        const before = previous.get(img), after = img.getBoundingClientRect();
        if (!after.width || !after.height) return;
        const scale = before.width ? Math.min(before.width / after.width, before.height / after.height) : .97;
        const x = before.width ? before.x + before.width / 2 - after.x - after.width / 2 : 0;
        const y = before.height ? before.y + before.height / 2 - after.y - after.height / 2 : 0;
        img.animate([{transform: 'translate('+x+'px,'+y+'px) scale('+scale+')', opacity:before.width?1:0}, {transform:'none',opacity:1}], {duration:320,easing:'cubic-bezier(.22,1,.36,1)'});
      });
    }
    comparison.querySelectorAll('.expand-comparison').forEach(button => {
      const name = button.closest('figure').dataset.image;
      button.setAttribute('aria-label', value === 1 ? (name === 'original' ? 'Expand original artwork' : 'Expand AI Crossover') : 'Show both images');
    });
  }
  comparison.querySelectorAll('figure img').forEach(img => {
    const figure = img.closest('figure');
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'expand-comparison';
    img.replaceWith(button); button.append(img);
    button.onclick = () => { setComparison(comparison.dataset.mode === 'both' ? (figure.dataset.image === 'original' ? 0 : 2) : 1); button.focus({preventScroll:true}); };
  });
  crossoverDialog.querySelectorAll('[data-compare]').forEach(button => button.onclick = () => setComparison(Number(button.dataset.compare)));

  setComparison(1);
  if (r.artwork.preview) {
    const wipe = document.createElement('section');
    wipe.className = 'mobile-wipe';
    wipe.setAttribute('aria-label', 'Original and AI Crossover comparison');
    wipe.innerHTML = '<div class="wipe-frame"><img class="wipe-original" src="'+path(r.artwork.preview)+'" alt="'+esc(r.artwork.title)+' — original"><div class="wipe-overlay">'+image(r,true)+'</div><span class="wipe-label original-label">Original</span><span class="wipe-label crossover-label">AI Crossover</span><span class="wipe-divider" aria-hidden="true"><span>‹ ›</span></span><input class="wipe-input" type="range" min="0" max="100" value="50" aria-label="Reveal AI Crossover" aria-valuetext="50% AI Crossover revealed"></div><p>Drag to compare. Images retain their own proportions.</p>';
    comparison.after(wipe);
    const input=wipe.querySelector('input');
    input.addEventListener('input',()=>{
      wipe.style.setProperty('--reveal',input.value+'%');
      input.setAttribute('aria-valuetext',input.value+'% AI Crossover revealed');
    });
    // The visible handle is not the native range thumb. Map the whole frame
    // explicitly so touch dragging works wherever a browser places that thumb.
    const frame = wipe.querySelector('.wipe-frame');
    let activePointer = null;
    const revealAt = clientX => {
      const bounds = input.getBoundingClientRect();
      if (!bounds.width) return;
      input.value = String(Math.round(Math.max(0, Math.min(100,
        100 * (bounds.right - clientX) / bounds.width))));
      input.dispatchEvent(new Event('input', {bubbles:true}));
    };
    frame.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || activePointer !== null) return;
      event.preventDefault();
      activePointer = event.pointerId;
      frame.setPointerCapture(activePointer);
      input.focus({preventScroll:true});
      revealAt(event.clientX);
    });
    frame.addEventListener('pointermove', event => {
      if (event.pointerId !== activePointer) return;
      event.preventDefault();
      revealAt(event.clientX);
    });
    frame.addEventListener('pointerup', event => {
      if (event.pointerId !== activePointer) return;
      revealAt(event.clientX);
      activePointer = null;
      if (frame.hasPointerCapture(event.pointerId)) frame.releasePointerCapture(event.pointerId);
      input.dispatchEvent(new Event('change', {bubbles:true}));
    });
    const cancelDrag = () => { activePointer = null; };
    frame.addEventListener('pointercancel', cancelDrag);
    frame.addEventListener('lostpointercapture', cancelDrag);
    crossoverDialog.classList.add('has-mobile-wipe');
  } else crossoverDialog.classList.remove('has-mobile-wipe');

  if(!crossoverDialog.open)crossoverDialog.showModal();crossoverDialog.scrollTop=0;
  hydratePrompt(id,version);
}
async function hydratePrompt(id,version) {
  const prompts = await loadPrompts();
  if (version !== detailVersion || !crossoverDialog.open) return;
  const section = crossoverDialog.querySelector('.prompt-section');
  if (!prompts) {
    section.innerHTML = '<h3>The Prompt</h3><p>The prompt couldn’t load.</p><button type="button" class="btn btn-outline-dark" id="retry-prompt">Try again</button>';
    section.querySelector('#retry-prompt').onclick = () => {
      section.innerHTML = '<h3>The Prompt</h3><p role="status">Loading the original prompt…</p>';
      hydratePrompt(id,version);
    };
    return;
  }
  const prompt=typeof prompts[id]?.text==='string'?prompts[id].text.trim():'';
  const promptNote=prompts[id]?.note || '';
  section.innerHTML = `<h3>The Prompt</h3>${prompt?`<p class="prompt-preview" aria-hidden="true">${esc(prompt)}</p><div id="full-prompt" hidden>${promptNote?`<p class="prompt-note">${esc(promptNote)}</p>`:''}<p class="prompt-text">${esc(prompt)}</p><button type="button" class="btn btn-outline-dark" id="copy-prompt">Copy prompt</button><p id="prompt-status" role="status"></p></div><button type="button" class="prompt-toggle" aria-expanded="false" aria-controls="full-prompt">Click here to view more</button>`:'<p>The original generation prompt hasn’t been added to this AI Crossover yet.</p>'}`;
  if(prompt)document.querySelector('.prompt-toggle').onclick=event=>{
    const button=event.currentTarget, expanded=button.getAttribute('aria-expanded')!=='true';
    button.setAttribute('aria-expanded',String(expanded));
    button.textContent=expanded?'Click here to hide':'Click here to view more';
    document.querySelector('#full-prompt').hidden=!expanded;
    document.querySelector('.prompt-preview').hidden=expanded;
  };
  if(prompt)document.querySelector('#copy-prompt').onclick=async()=>{try{await copyText(prompt);document.querySelector('#prompt-status').textContent='Prompt copied.';}catch{document.querySelector('#prompt-status').textContent='Copy unavailable. Select the prompt text above to copy it.';}};
}
function closeDetail(){history.replaceState(null,'',location.pathname+location.search+'#collection');crossoverDialog.close();}
document.querySelector('#close-crossover').onclick=closeDetail;
crossoverDialog.addEventListener('cancel',e=>{e.preventDefault();closeDetail();});
crossoverDialog.addEventListener('close',()=>{const href=detailLauncher?.getAttribute('href');const target=detailLauncher?.isConnected?detailLauncher:href?Array.from(root.querySelectorAll('a')).find(link=>link.getAttribute('href')===href):null;(target||controls.q).focus({preventScroll:true});});
window.addEventListener('hashchange',syncDetail);

async function copyText(text){let timer;try{await Promise.race([navigator.clipboard.writeText(text),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Clipboard unavailable')),1500);})]);}finally{clearTimeout(timer);}}
// A failed preview leaves the accessible destination and explanatory text usable.
document.addEventListener('error',event=>{
  const img=event.target;if(!(img instanceof HTMLImageElement))return;
  const inWipe=img.closest('.mobile-wipe');
  if(inWipe){inWipe.remove();crossoverDialog.classList.remove('has-mobile-wipe');}
  const message=document.createElement('span');message.className='image-unavailable';message.textContent='Preview unavailable: '+img.alt;img.replaceWith(message);
},true);
crossoverDialog.addEventListener('click',event=>{if(event.target!==crossoverDialog)return;const rect=crossoverDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDetail();});
window.addEventListener('popstate',()=>{
  // Hash-only detail navigation preserves the loaded List entries and focused link.
  if (galleryLocationKey() !== lastGalleryLocation) {
    cancelAnchorScroll();
    readFilters();
    readGalleryLocation();
    filter(false, false);
    writeGalleryLocation();
    if (!location.hash.startsWith('#piece=')) scrollToGalleryStart();
  }
  syncDetail();
});
loadGallery();
