'use strict';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root = document.querySelector('#pieces');
const controls = {q:document.querySelector('#search'),anime:document.querySelector('#anime'),artist:document.querySelector('#artist'),artwork:document.querySelector('#artwork')};
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function readFilters(){const params=new URLSearchParams(location.search);for(const [name,control] of Object.entries(controls))control.value=params.get(name)||'';}
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
let view = 'slider', currentId = null, records = [], filtered = [];
const path = p => esc(encodeURI(p));
const detail = r => `#piece=${encodeURIComponent(r.id)}`;
const defaultDownload = r => r.downloads.find(d => d.label === 'Tinified 1080p') || r.downloads[0];
function downloadButton(r, surface) {
  const file = defaultDownload(r), id = `downloads-${surface}-${r.id}`;
  const size = f => `${f.width} × ${f.height} · ${(f.bytes / 1000000).toFixed(2)} MB`;
  return `<div class="download-split"><a class="btn slide-download" href="${path(file.path)}" download aria-label="Download ${esc(file.label)}"><span>Download AI Crossover</span><small>${esc(file.label)} · ${(file.bytes / 1000000).toFixed(2)} MB</small></a><button type="button" class="btn download-toggle" aria-label="Other download options" aria-expanded="false" aria-controls="${id}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="download-options" id="${id}" hidden>${r.downloads.filter(f => f !== file).map(f => `<a href="${path(f.path)}" download><span>${esc(f.label)}</span><small>${size(f)}</small></a>`).join('')}</div></div>`;
}
function closeDownloads(except = null) {
  document.querySelectorAll('.download-toggle[aria-expanded="true"]').forEach(button => {
    if (button === except) return;
    button.setAttribute('aria-expanded', 'false');
    document.getElementById(button.getAttribute('aria-controls')).hidden = true;
  });
}
document.addEventListener('click', event => {
  const toggle = event.target.closest('.download-toggle');
  if (toggle) {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    closeDownloads();
    toggle.setAttribute('aria-expanded', String(open));
    document.getElementById(toggle.getAttribute('aria-controls')).hidden = !open;
  } else closeDownloads();
});
document.addEventListener('focusin', event => {
  closeDownloads(event.target.closest('.download-split')?.querySelector('.download-toggle'));
});
document.addEventListener('keydown', event => {
  const split = event.target.closest('.download-split');
  if (!split) return;
  const toggle = split.querySelector('.download-toggle');
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    event.preventDefault(); event.stopPropagation(); closeDownloads(); toggle.focus();
  } else if (event.key === 'ArrowDown' && event.target === toggle) {
    event.preventDefault(); closeDownloads(toggle);
    toggle.setAttribute('aria-expanded', 'true');
    split.querySelector('.download-options').hidden = false;
    split.querySelector('.download-options a').focus();
  }
});
function image(r, large = false, eager = false, thumbnail = false) {
  const web = r.webImage;
  const source = thumbnail ? web.thumbnail.path : large ? web.large.path : r.preview;
  const sizes = large
    ? '(max-width: 767px) 100vw, (max-width: 991px) calc(100vw - 48px), (min-width: 1500px) 1080px, 70vw'
    : '(max-width: 767px) 100vw, (min-width: 1500px) 704px, calc(50vw - 64px)';
  const responsive = thumbnail ? '' : ` srcset="${path(r.preview)} 640w, ${path(web.medium.path)} ${web.medium.width}w, ${path(web.large.path)} ${web.large.width}w" sizes="${sizes}"`;
  return `<img decoding="async" ${large || eager ? 'loading="eager"' : 'loading="lazy"'} src="${path(source)}"${responsive} alt="${esc(r.anime.name)} AI Crossover inspired by ${esc(r.artwork.title)}">`;
}
const meta = r => `<p class="anime">${esc(r.anime.name)} ×</p><h3>${esc(r.artwork.title)}</h3><p>After ${esc(r.artwork.artist)}${r.artwork.year ? ` · ${esc(r.artwork.year)}` : ''}</p>`;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    root.getAnimations({subtree:true}).forEach(animation => animation.cancel());
    root.querySelectorAll('.slide-outgoing').forEach(image => image.remove());
  }
});
const sliderStage = (r,i) => `<section class="slider-stage" aria-label="AI Crossover viewer" aria-roledescription="carousel"><div class="slider-art"><a href="${detail(r)}">${image(r,true)}</a><div class="slide-navigation"><button class="btn" id="previous" aria-label="Previous AI Crossover" ${filtered.length===1?'disabled':''}>←</button><p role="status">${i+1} / ${filtered.length} <span>— ${esc(r.anime.name)}</span></p><button class="btn" id="next" aria-label="Next AI Crossover" ${filtered.length===1?'disabled':''}>→</button></div></div><aside class="slider-caption">${meta(r)}<p class="slide-description">${esc(r.artwork.description||'')}</p>${r.artwork.preview?`<figure class="source-reference"><img src="${path(r.artwork.preview)}" alt="${esc(r.artwork.title)} — original artwork"><figcaption>The original artwork</figcaption></figure>`:''}${downloadButton(r, "slider")}<a class="slide-details" href="${detail(r)}">Explore the story & credits →</a></aside></section>`;
function changeSlide(id, focusId, direction = 1) {
  if (id === currentId) return;
  const previousImage = root.querySelector('.slider-art > a > img');
  const outgoing = previousImage?.cloneNode(true);
  currentId = id;
  const index = filtered.findIndex(record => record.id === id);
  root.querySelector('.slider-stage').outerHTML = sliderStage(filtered[index],index);
  root.querySelectorAll('[data-piece]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.piece === id)));
  const focusTarget = focusId ? document.getElementById(focusId) : Array.from(root.querySelectorAll('[data-piece]')).find(button => button.dataset.piece === id);
  focusTarget?.focus({preventScroll:true});
  const selected = root.querySelector('.film-frame[aria-pressed="true"]');
  if (selected) {
    const strip = selected.parentElement;
    const left = selected.offsetLeft - strip.offsetLeft;
    if (left < strip.scrollLeft || left + selected.offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({left:left - (strip.clientWidth - selected.offsetWidth) / 2, behavior:'instant'});
    }
  }
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
  if (!filtered.length) { root.innerHTML='<div class="gallery-empty"><h3>No AI Crossovers found.</h3><p>Try another search or return to the full collection.</p><button type="button" class="btn btn-outline-dark" id="reset-gallery">Clear filters</button></div>';document.querySelector('#reset-gallery').onclick=()=>{clearFilters();document.querySelector('#search').focus();};return; }
  if (!filtered.some(r => r.id === currentId)) currentId = filtered[0].id;
  if (mobile.matches) {
    root.className = 'gallery-mobile';
    root.innerHTML = filtered.map((r,i) => `<article><a class="mobile-artwork" href="${detail(r)}" aria-label="View details: ${esc(r.anime.name)} × ${esc(r.artwork.title)}">${image(r,false,i===0)}<span class="mobile-caption"><span>${esc(r.anime.name)} <span aria-hidden="true">×</span> ${esc(r.artwork.title)}</span><span aria-hidden="true">→</span></span></a></article>`).join('');
    return;
  }
  if (view === 'grid') { root.innerHTML = `<div class="row g-4">${filtered.map(r=>`<article class="col-md-6 col-xl-4"><a class="piece" href="${detail(r)}">${image(r)}<div class="piece-copy">${meta(r)}<small>Explore & download →</small></div></a></article>`).join('')}</div>`;return; }
  if (view === 'list') { root.innerHTML = filtered.map(r=>`<article class="list-piece"><a class="list-image" href="${detail(r)}">${image(r)}</a><div class="list-copy">${meta(r)}<p class="list-description">${esc(r.artwork.description || '')}</p></div><div class="list-action"><span>1920 × 1080</span><a href="${detail(r)}">Explore & download →</a></div></article>`).join('');return; }
  const i=filtered.findIndex(r=>r.id===currentId),r=filtered[i];
  root.innerHTML=`${sliderStage(r,i)}<div class="filmstrip" role="group" aria-label="Choose AI Crossover">${filtered.map((item,n)=>`<button type="button" class="film-frame" data-piece="${esc(item.id)}" aria-label="Show AI Crossover: ${esc(item.anime.name)} × ${esc(item.artwork.title)}" aria-pressed="${n===i}">${image(item,false,false,true)}<span class="film-number">${String(n+1).padStart(2,'0')}</span><span class="film-title">${esc(item.artwork.title)}</span></button>`).join('')}</div>`;
  const hint=document.createElement('p');
  hint.className='browse-hint';hint.textContent='A different frame, one at a time. Use the arrow keys to browse.';
  root.append(hint);
}
root.addEventListener('click', event => {
  const button = event.target.closest('#previous, #next, [data-piece]');
  if (!button || button.disabled) return;
  const index = filtered.findIndex(record => record.id === currentId);
  const target = button.dataset.piece ? filtered.findIndex(record => record.id === button.dataset.piece) : (index + (button.id === 'next' ? 1 : -1) + filtered.length) % filtered.length;
  const direction = button.dataset.piece ? target - index : button.id === 'next' ? 1 : -1;
  changeSlide(filtered[target].id,button.id || null,direction);
});
root.addEventListener('keydown', event => {
  if (view !== 'slider' || mobile.matches || !['ArrowLeft','ArrowRight'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (!event.target.matches('#previous, #next, .film-frame')) return;
  event.preventDefault();
  const amount = event.key === 'ArrowRight' ? 1 : -1;
  const index = filtered.findIndex(record => record.id === currentId);
  changeSlide(filtered[(index + amount + filtered.length) % filtered.length].id,event.target.id || null,amount);
});
function filter(updateURL=true){
  const words=normalize(controls.q.value.trim()).split(/\s+/).filter(Boolean);
  filtered=records.filter(r=>{
    const text=normalize([r.anime.name,...(r.anime.aliases||[]),r.anime.description,r.artwork.title,r.artwork.artist,r.artwork.description,...(r.tags||[])].filter(Boolean).join(' '));
    return (!controls.anime.value||r.anime.name===controls.anime.value)&&(!controls.artist.value||r.artwork.artist===controls.artist.value)&&(!controls.artwork.value||r.artwork.title===controls.artwork.value)&&words.every(word=>text.includes(word));
  });
  document.querySelector('#clear-filters').hidden=!Object.values(controls).some(control=>control.value);
  if(updateURL){const url=new URL(location.href);for(const [name,control] of Object.entries(controls)){if(control.value)url.searchParams.set(name,control.value);else url.searchParams.delete(name);}history.replaceState(null,'',url);}
  render();
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;render();});
controls.q.addEventListener('input',()=>filter());
for(const name of ['anime','artist','artwork'])controls[name].addEventListener('change',()=>filter());
document.querySelector('#clear-filters').addEventListener('click',clearFilters);
async function loadGallery(){
  document.querySelector('#load-error').hidden=true;
  document.querySelector('.collection-update').hidden=true;
  document.querySelector('#count').textContent='Loading the collection…';
  try{
    const response=await fetch('data/wallpapers.json');if(!response.ok)throw Error('Catalogue unavailable');
    const data=await response.json();if(!Array.isArray(data)||!data.length)throw Error('Catalogue empty');
    records=data;
    const order=name=>name==='One Piece'?0:/Fullmetal|FMA/.test(name)?1:name==='Death Note'?2:3;
    records.sort((a,b)=>order(a.anime.name)-order(b.anime.name));
    fillSelect('anime',records.map(r=>r.anime.name));fillSelect('artist',records.map(r=>r.artwork.artist));fillSelect('artwork',records.map(r=>r.artwork.title));
    renderCollectionUpdate();currentId=records[0].id;readFilters();filter(false);syncDetail();
  }catch(error){root.innerHTML='';document.querySelector('#load-error').hidden=false;document.querySelector('#count').textContent='Collection unavailable';console.error('Unable to load collection:',error);}
}
document.querySelector('#retry').addEventListener('click',loadGallery);

const artworkDialog = document.querySelector('#artwork-dialog');
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
  if(!r){if(artworkDialog.open)artworkDialog.close();return;}
  if(!artworkDialog.open)detailLauncher=document.activeElement;
  document.querySelector('#artwork-content').innerHTML=`<div class="row g-3 align-items-end"><div class="col-lg-8"><h2 id="artwork-title">${esc(r.artwork.title)}</h2><p>${esc(r.anime.name)} × ${esc(r.artwork.artist)}</p></div><div class="col-lg-4">${downloadButton(r, "detail")}</div></div><div class="comparison-controls my-4"><div class="btn-group compare-switch" role="group" aria-label="Original and AI Crossover comparison"><button class="btn" data-compare="0" aria-pressed="false">Original</button><button class="btn" data-compare="1" aria-pressed="true">Both</button><button class="btn" data-compare="2" aria-pressed="false">AI Crossover</button></div><p id="comparison-hint">Select an image to expand it. Select it again or choose Both to compare.</p></div><div class="art-comparison" data-mode="both"><figure data-image="original">${r.artwork.preview?`<img src="${path(r.artwork.preview)}" alt="${esc(r.artwork.title)} by ${esc(r.artwork.artist)}">`:'<p>Original preview unavailable.</p>'}<figcaption>The original artwork</figcaption></figure><figure data-image="crossover">${image(r,true)}<figcaption>The AI Crossover</figcaption></figure></div><div class="row g-4 mt-2"><section class="col-md-6"><h3>Behind the painting</h3><p>${esc(r.artwork.description||'')}</p>${externalLink(r.artwork.sourceUrl,'View the original')}</section><section class="col-md-6"><h3>From the anime</h3><p>${esc(r.anime.description||'')}</p>${externalLink(r.anime.anidbUrl,'Explore the anime')}${externalLink(r.anime.alternateAnidbUrl,'Brotherhood on AniDB')}</section></div>${interestingLinks(r.artwork)}<section class="prompt-section"><h3>The Prompt</h3><p role="status">Loading the original prompt…</p></section><section class="artwork-credits"><h3>Credits & sources</h3><p>${esc(r.artwork.credit||r.artwork.artist)} ${esc(r.artwork.reuseTerms||'')}</p>${externalLink(r.artwork.previewSourceUrl,'Image source & rights')}<p>AI Crossover: an AI-generated fan experiment. No affiliation with the original creators or rights holders.</p></section>`;
  const comparison = artworkDialog.querySelector('.art-comparison');
  const modes = ['original','both','crossover'];
  function setComparison(value) {
    const previous = new Map();
    comparison.querySelectorAll('img').forEach(img => {
      img.getAnimations().forEach(animation => animation.cancel());
      previous.set(img, img.getBoundingClientRect());
    });
    comparison.dataset.mode = modes[value];
    artworkDialog.querySelectorAll('[data-compare]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.compare) === value)));
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && artworkDialog.open) {
      comparison.querySelectorAll('img').forEach(img => {
        const before = previous.get(img), after = img.getBoundingClientRect();
        if (!after.width || !after.height) return;
        const scale = before.width ? Math.min(before.width / after.width, before.height / after.height) : .97;
        const x = before.width ? before.x + before.width / 2 - after.x - after.width / 2 : 0;
        const y = before.height ? before.y + before.height / 2 - after.y - after.height / 2 : 0;
        img.animate([{transform: 'translate('+x+'px,'+y+'px) scale('+scale+')', opacity:before.width?1:0}, {transform:'none',opacity:1}], {duration:320,easing:'cubic-bezier(.22,1,.36,1)'});
      });
    }
    comparison.querySelectorAll('.expand-artwork').forEach(button => {
      const name = button.closest('figure').dataset.image;
      button.setAttribute('aria-label', value === 1 ? (name === 'original' ? 'Expand original artwork' : 'Expand AI Crossover') : 'Show both images');
    });
  }
  comparison.querySelectorAll('figure img').forEach(img => {
    const figure = img.closest('figure');
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'expand-artwork';
    img.replaceWith(button); button.append(img);
    button.onclick = () => { setComparison(comparison.dataset.mode === 'both' ? (figure.dataset.image === 'original' ? 0 : 2) : 1); button.focus({preventScroll:true}); };
  });
  artworkDialog.querySelectorAll('[data-compare]').forEach(button => button.onclick = () => setComparison(Number(button.dataset.compare)));

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
    artworkDialog.classList.add('has-mobile-wipe');
  } else artworkDialog.classList.remove('has-mobile-wipe');

  if(!artworkDialog.open)artworkDialog.showModal();artworkDialog.scrollTop=0;
  hydratePrompt(id,version);
}
async function hydratePrompt(id,version) {
  const prompts = await loadPrompts();
  if (version !== detailVersion || !artworkDialog.open) return;
  const section = artworkDialog.querySelector('.prompt-section');
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
function closeDetail(){history.replaceState(null,'',location.pathname+location.search+'#collection');artworkDialog.close();}
document.querySelector('#close-artwork').onclick=closeDetail;
artworkDialog.addEventListener('cancel',e=>{e.preventDefault();closeDetail();});
artworkDialog.addEventListener('close',()=>{const href=detailLauncher?.getAttribute('href');const target=detailLauncher?.isConnected?detailLauncher:href?Array.from(root.querySelectorAll('a')).find(link=>link.getAttribute('href')===href):null;(target||controls.q).focus({preventScroll:true});});
window.addEventListener('hashchange',syncDetail);

async function copyText(text){let timer;try{await Promise.race([navigator.clipboard.writeText(text),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Clipboard unavailable')),1500);})]);}finally{clearTimeout(timer);}}
// A failed preview leaves the accessible destination and explanatory text usable.
document.addEventListener('error',event=>{
  const img=event.target;if(!(img instanceof HTMLImageElement))return;
  const inWipe=img.closest('.mobile-wipe');
  if(inWipe){inWipe.remove();artworkDialog.classList.remove('has-mobile-wipe');}
  const message=document.createElement('span');message.className='image-unavailable';message.textContent='Preview unavailable: '+img.alt;img.replaceWith(message);
},true);
artworkDialog.addEventListener('click',event=>{if(event.target!==artworkDialog)return;const rect=artworkDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDetail();});
window.addEventListener('popstate',()=>{readFilters();filter(false);syncDetail();});
loadGallery();
