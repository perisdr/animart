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
const image = (r, large = false) => `<img ${large ? '' : 'loading="lazy"'} src="${path(large ? (r.downloads.find(d => /optimized/i.test(d.label)) || r.downloads[0]).path : r.preview)}" alt="${esc(r.anime.name)} crossover inspired by ${esc(r.artwork.title)}">`;
const meta = r => `<p class="anime">${esc(r.anime.name)} ×</p><h3>${esc(r.artwork.title)}</h3><p>After ${esc(r.artwork.artist)}${r.artwork.year ? ` · ${esc(r.artwork.year)}` : ''}</p>`;
function render() {
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
  document.querySelector('#count').textContent = `${filtered.length} of ${records.length} crossovers`;
  root.className = `gallery-${view}`;
  if (!filtered.length) { root.innerHTML='<div class="gallery-empty"><h3>No crossovers found.</h3><p>Try another search or return to the full collection.</p><button type="button" class="btn btn-outline-dark" id="reset-gallery">Clear filters</button></div>';document.querySelector('#reset-gallery').onclick=()=>{clearFilters();document.querySelector('#search').focus();};return; }
  if (!filtered.some(r => r.id === currentId)) currentId = filtered[0].id;
  if (mobile.matches) {
    root.className = 'gallery-mobile';
    root.innerHTML = filtered.map(r => `<article><a class="mobile-artwork" href="${detail(r)}" aria-label="View details: ${esc(r.anime.name)} × ${esc(r.artwork.title)}">${image(r)}<span class="mobile-caption"><span>${esc(r.anime.name)} <span aria-hidden="true">×</span> ${esc(r.artwork.title)}</span><span aria-hidden="true">→</span></span></a></article>`).join('');
    return;
  }
  if (view === 'grid') { root.innerHTML = `<div class="row g-4">${filtered.map(r=>`<article class="col-md-6 col-xl-4"><a class="piece" href="${detail(r)}">${image(r)}<div class="piece-copy">${meta(r)}<small>Explore & download →</small></div></a></article>`).join('')}</div>`;return; }
  if (view === 'list') { root.innerHTML = filtered.map(r=>`<article class="list-piece"><a class="list-image" href="${detail(r)}">${image(r)}</a><div class="list-copy">${meta(r)}<p class="list-description">${esc(r.artwork.description || '')}</p></div><div class="list-action"><span>1920 × 1080</span><a href="${detail(r)}">Explore & download →</a></div></article>`).join('');return; }
  const i=filtered.findIndex(r=>r.id===currentId),r=filtered[i],file=r.downloads.find(d=>/optimized/i.test(d.label))||r.downloads[0];
  root.innerHTML=`<section class="slider-stage" aria-label="Artwork viewer" aria-roledescription="carousel"><div class="slider-art"><a href="${detail(r)}">${image(r,true)}</a><div class="slide-navigation"><button class="btn" id="previous" aria-label="Previous artwork" ${filtered.length===1?'disabled':''}>←</button><p role="status">${i+1} / ${filtered.length} <span>— ${esc(r.anime.name)}</span></p><button class="btn" id="next" aria-label="Next artwork" ${filtered.length===1?'disabled':''}>→</button></div></div><aside class="slider-caption">${meta(r)}<p class="slide-description">${esc(r.artwork.description||'')}</p>${r.artwork.preview?`<figure class="source-reference"><img src="${path(r.artwork.preview)}" alt="${esc(r.artwork.title)} — original artwork"><figcaption>The original artwork</figcaption></figure>`:''}<a class="btn slide-download" href="${path(file.path)}" download>Download crossover ↓</a><a class="slide-details" href="${detail(r)}">Explore the story & credits →</a></aside></section><div class="filmstrip" role="group" aria-label="Choose artwork">${filtered.map((item,n)=>`<button type="button" class="film-frame" data-piece="${esc(item.id)}" aria-label="Show ${esc(item.anime.name)} × ${esc(item.artwork.title)}" aria-pressed="${n===i}">${image(item)}<span>${String(n+1).padStart(2,'0')}</span></button>`).join('')}</div>`;
  const move=(amount,focusId)=>{currentId=filtered[(i+amount+filtered.length)%filtered.length].id;render();document.getElementById(focusId).focus({preventScroll:true});};
  document.querySelector('#previous').onclick=()=>move(-1,'previous');document.querySelector('#next').onclick=()=>move(1,'next');
  root.querySelectorAll('[data-piece]').forEach(b=>b.onclick=()=>{currentId=b.dataset.piece;render();Array.from(root.querySelectorAll('[data-piece]')).find(el=>el.dataset.piece===currentId).focus({preventScroll:true});});
}
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
  document.querySelector('#count').textContent='Loading the collection…';
  try{
    const response=await fetch('data/wallpapers.json');if(!response.ok)throw Error('Catalogue unavailable');
    const data=await response.json();if(!Array.isArray(data)||!data.length)throw Error('Catalogue empty');
    // Prompt availability must not prevent wallpaper browsing.
    let prompts={};try{const response=await fetch('data/prompts.json');if(response.ok)prompts=await response.json();}catch{}
    records=data.map(r=>({...r,prompt:prompts[r.id]?.text||'',promptNote:prompts[r.id]?.note||''}));
    const order=name=>name==='One Piece'?0:/Fullmetal|FMA/.test(name)?1:name==='Death Note'?2:3;
    records.sort((a,b)=>order(a.anime.name)-order(b.anime.name));
    fillSelect('anime',records.map(r=>r.anime.name));fillSelect('artist',records.map(r=>r.artwork.artist));fillSelect('artwork',records.map(r=>r.artwork.title));
    currentId=records[0].id;readFilters();filter(false);syncDetail();
  }catch(error){root.innerHTML='';document.querySelector('#load-error').hidden=false;document.querySelector('#count').textContent='Collection unavailable';console.error('Unable to load collection:',error);}
}
document.querySelector('#retry').addEventListener('click',loadGallery);

const artworkDialog = document.querySelector('#artwork-dialog');
let detailLauncher = null;
const externalLink = (url,label) => /^https:\/\//.test(url || '') ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : '';
function syncDetail() {
  const match=location.hash.match(/^#piece=(.+)$/);let id;
  try{id=match?decodeURIComponent(match[1]):null;}catch{id=null;}
  const r=records.find(item=>item.id===id);
  if(!r){if(artworkDialog.open)artworkDialog.close();return;}
  if(!artworkDialog.open)detailLauncher=document.activeElement;
  const files=[...r.downloads].sort((a,b)=>a.bytes-b.bytes);
  const prompt=typeof r.prompt==='string'?r.prompt.trim():'';
  document.querySelector('#artwork-content').innerHTML=`<div class="row g-3 align-items-end"><div class="col-lg-8"><h2 id="artwork-title">${esc(r.artwork.title)}</h2><p>${esc(r.anime.name)} × ${esc(r.artwork.artist)}</p></div><div class="col-lg-4"><a class="btn slide-download" href="${path(files[0].path)}" download>Download wallpaper ↓<small>${files[0].width} × ${files[0].height} · ${(files[0].bytes/1000000).toFixed(2)} MB</small></a></div></div><div class="comparison-controls my-4"><div class="btn-group compare-switch" role="group" aria-label="Artwork comparison view"><button class="btn" data-compare="0" aria-pressed="false">Original</button><button class="btn" data-compare="1" aria-pressed="true">Both</button><button class="btn" data-compare="2" aria-pressed="false">Crossover</button></div><p id="comparison-hint">Select an image to expand it. Select it again or choose Both to compare.</p></div><div class="art-comparison" data-mode="both"><figure data-image="original">${r.artwork.preview?`<img src="${path(r.artwork.preview)}" alt="${esc(r.artwork.title)} by ${esc(r.artwork.artist)}">`:'<p>Original preview unavailable.</p>'}<figcaption>The original artwork</figcaption></figure><figure data-image="crossover">${image(r,true)}<figcaption>The crossover · AI-generated</figcaption></figure></div><div class="row g-4 mt-2"><section class="col-md-6"><h3>Behind the painting</h3><p>${esc(r.artwork.description||'')}</p>${externalLink(r.artwork.sourceUrl,'View original source')}</section><section class="col-md-6"><h3>From the anime</h3><p>${esc(r.anime.description||'')}</p>${externalLink(r.anime.anidbUrl,'Explore the anime')}${externalLink(r.anime.alternateAnidbUrl,'Brotherhood on AniDB')}</section></div><details class="prompt-section"><summary>The Prompt</summary>${prompt?`${r.promptNote?`<p class="prompt-note">${esc(r.promptNote)}</p>`:''}<p class="prompt-text">${esc(prompt)}</p><button type="button" class="btn btn-outline-dark" id="copy-prompt">Copy prompt</button><p id="prompt-status" role="status"></p>`:'<p>The original generation prompt hasn’t been added to this artwork yet.</p>'}</details><details class="file-options"><summary>More download options</summary><div class="d-flex flex-wrap gap-3 mt-3">${files.map(f=>`<a href="${path(f.path)}" download>${/optimized/i.test(f.label)?'Optimized crossover PNG':'Crossover PNG'} · ${f.width} × ${f.height} · ${(f.bytes/1000000).toFixed(2)} MB</a>`).join('')}</div></details><div class="mt-4"><button type="button" class="btn btn-outline-dark" id="share-piece">Copy link</button><p id="share-message" role="status"></p></div><section class="artwork-credits"><h3>Credits & sources</h3><p>${esc(r.artwork.credit||r.artwork.artist)} ${esc(r.artwork.reuseTerms||'')}</p>${externalLink(r.artwork.previewSourceUrl,'Image source & rights')}<p>Crossover: AI-generated fan artwork. No affiliation with the original creators or rights holders.</p></section>`;
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
      button.setAttribute('aria-label', value === 1 ? 'Expand ' + name + ' artwork' : 'Show both artworks');
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
    wipe.setAttribute('aria-label', 'Original and crossover comparison');
    wipe.innerHTML = '<div class="wipe-frame"><img class="wipe-original" src="'+path(r.artwork.preview)+'" alt="'+esc(r.artwork.title)+' — original"><div class="wipe-overlay">'+image(r,true)+'</div><span class="wipe-label original-label">Original</span><span class="wipe-label crossover-label">Crossover</span><span class="wipe-divider" aria-hidden="true"><span>‹ ›</span></span><input class="wipe-input" type="range" min="0" max="100" value="50" aria-label="Reveal crossover" aria-valuetext="50% crossover revealed"></div><p>Drag to compare. Images retain their own proportions.</p>';
    comparison.after(wipe);
    const input=wipe.querySelector('input');
    input.addEventListener('input',()=>{
      wipe.style.setProperty('--reveal',input.value+'%');
      input.setAttribute('aria-valuetext',input.value+'% crossover revealed');
    });
    artworkDialog.classList.add('has-mobile-wipe');
  } else artworkDialog.classList.remove('has-mobile-wipe');

  document.querySelector('#share-piece').onclick=async()=>{
    const status=document.querySelector('#share-message');status.textContent='Copying link…';
    try{await copyText(location.href);status.textContent='Link copied.';}
    catch{status.textContent='Copy this link: ';const input=document.createElement('input');input.className='form-control';input.readOnly=true;input.value=location.href;input.setAttribute('aria-label','Shareable artwork link');status.append(input);input.focus();input.select();}
  };
  if(prompt)document.querySelector('#copy-prompt').onclick=async()=>{try{await copyText(prompt);document.querySelector('#prompt-status').textContent='Prompt copied.';}catch{document.querySelector('#prompt-status').textContent='Copy unavailable. Select the prompt text above to copy it.';}};
  if(!artworkDialog.open)artworkDialog.showModal();artworkDialog.scrollTop=0;
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
