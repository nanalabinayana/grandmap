/* =========================================================
   LGMCakra — Editor 7 Halaman (BG PNG terkunci)
   Versi: no-skillbuilder • per-layout word limit
   Anchor Y: 375px (default), 438px (hal. 4 & 5 Life Grand Map)
   ========================================================= */
"use strict";

/* ---------- Elemen utama ---------- */
const stage   = document.getElementById('stage');
const bgImg   = document.getElementById('bgImg');
const inputs  = document.getElementById('inputsArea');
const labelPg = document.getElementById('labelPg');
const totalPg = document.getElementById('totalPg');
const pager   = document.getElementById('pager');
const btnPrev = document.getElementById('prev');
const btnNext = document.getElementById('next');

/* ---------- Util ---------- */
let cur = 0;
const k  = () => stage.clientWidth / 1080;   // skala (artboard 1080×1350)
function autoSizeTA(el){ el.style.height='auto'; el.style.height = el.scrollHeight + 'px'; }

/* ---------- Pager filter (opsional) ---------- */
let ALLOWED_INDEXES = null;
function getAllowed(){
  if (Array.isArray(ALLOWED_INDEXES) && ALLOWED_INDEXES.length) return ALLOWED_INDEXES;
  return PAGES.map((_,i)=>i);
}

/* ---------- Counter helpers ---------- */
function countWords(t){ return (t||'').trim().split(/\s+/).filter(Boolean).length; }
function countCharsNoSpace(t){ return (t||'').replace(/\s+/g,'').length; }
function countCharsWS(t){ return (t||'').length; }
function trimToMaxWords(t, maxW){
  const parts = String(t||'').trim().split(/\s+/);
  if (!maxW || parts.length <= maxW) return t;
  return parts.slice(0, maxW).join(' ');
}
function classify(words, maxW){
  if (!maxW) return 'ok';
  if (words > maxW) return 'bad';
  if (words >= maxW - Math.ceil(maxW*0.08)) return 'near'; // dekat batas
  return 'ok';
}
function renderCounterText(words, cNo, cWS, maxW){
  if (!maxW) return `${words} words • ${cNo} c(ns) • ${cWS} c(ws)`;
  const left = Math.max(0, maxW - words);
  return `${words}/${maxW} words (${left} left) • ${cNo} c(ns) • ${cWS} c(ws)`;
}

/* ====== Toolbar insert helpers ====== */
function getCaret(el){ return { start: el.selectionStart ?? el.value.length, end: el.selectionEnd ?? el.value.length }; }
function setCaret(el, pos){ try{ el.focus(); el.setSelectionRange(pos,pos); }catch(_){} }
function insertAtCursor(el, text, moveToEnd=true){
  const {start,end} = getCaret(el);
  el.value = el.value.slice(0,start) + text + el.value.slice(end);
  setCaret(el, moveToEnd ? (start + text.length) : start);
  el.dispatchEvent(new Event('input',{bubbles:true}));
}
function insertParagraph(el){
  const prefix = (el.value && !el.value.endsWith('\n')) ? '\n\n' : '\n\n';
  insertAtCursor(el, prefix);
}
function insertBullets(el){
  const tpl = (el.value && !el.value.endsWith('\n') ? '\n' : '') + `• Poin utama\n• Poin penting\n• Dampak terukur\n`;
  insertAtCursor(el, tpl);
}
function insertNumbered(el){
  const tpl = (el.value && !el.value.endsWith('\n') ? '\n' : '') + `1) Langkah 1\n2) Langkah 2\n3) Hasil\n`;
  insertAtCursor(el, tpl);
}

/* ====== Inject CSS kecil untuk counter ====== */
(function ensureCounterCSS(){
  if (document.getElementById('counter-inline-style')) return;
  const style = document.createElement('style');
  style.id = 'counter-inline-style';
  style.textContent = `
    .mini.counter{ font-size:.85rem; margin-top:.25rem; opacity:.95 }
    .mini.counter.ok{ color:#198754 }
    .mini.counter.near{ color:#dc3545 }
    .mini.counter.bad{ color:#dc3545; font-weight:600 }
    .fmt-bar{ display:flex; gap:.5rem; margin:.25rem 0 .5rem }
    .fmt-bar .btn{ padding:.15rem .5rem }
  `;
  document.head.appendChild(style);
})();

/* ---------- Path BG ---------- */
const FRAME_BASE = './';
const withBase = (name) => FRAME_BASE + name;
bgImg.addEventListener('error', () => {
  console.error('[BG ERROR] Gagal memuat:', bgImg?.src);
  alert('Background tidak ditemukan:\n' + bgImg?.src + '\n\nCek nama file & path-nya.');
});

/* ---------- Frames (PNG) ---------- */
const FRAME = {
  1: withBase('frame-02.png'), // Self Potential
  2: withBase('frame-03.png'), // Study Plan (1–4)
  3: withBase('frame-04.png'), // Study Plan (5–8)
  4: withBase('frame-05.png'), // Life Grand Map (2025–2035)
  5: withBase('frame-06.png'), // Life Grand Map (2035–Beyond)
  6: withBase('frame-07.png'), // Community Service & Grand Goals Plan
  7: withBase('frame-08.png'), // Cover/Akhir
};

/* ---------- Anchor Y rules ---------- */
const ANCHOR_Y_DEFAULT = 375;  // semua halaman
const ANCHOR_Y_LGM      = 438; // khusus halaman 4 & 5 (Life Grand Map)
function getAnchorYPx(pageIndex){
  const name = String(PAGES[pageIndex]?.name||"");
  return /Life Grand Map/i.test(name) ? ANCHOR_Y_LGM : ANCHOR_Y_DEFAULT;
}

/* ---------- PAGES: layout & tema per-halaman ---------- */
const PAGES = [
  /* 1) SELF POTENTIAL — grid 2x2, header hijau, limit 65 */
  { name:"Self Potential & Development Identification", type:'flow', bg: FRAME[1],
    flow:{ cols:2, gapPct:2, leftPct:4, widthPct:93, padXPct:2, padYPct:2, lock:true },
    boxes:[
      { id:"p1a", label:"Self Potential 1", fs:20, lh:1.35, val:"", style:{ theme:'green', body:'solid' } },
      { id:"p1b", label:"Self Potential 2", fs:20, lh:1.35, val:"", style:{ theme:'green', body:'solid' } },
      { id:"p1c", label:"Self Potential 3", fs:20, lh:1.35, val:"", style:{ theme:'green', body:'solid' } },
      { id:"p1d", label:"Self Potential 4", fs:20, lh:1.35, val:"", style:{ theme:'green', body:'solid' } },
    ]
  },

  /* 2) STUDY PLAN (1–4) — grid 2x2, header oranye, limit 65 */
  { name:"Study Plan & Academic Achievement (1–4)", type:'flow', bg: FRAME[2],
    flow:{ cols:2, gapPct:2, leftPct:4, widthPct:93, padXPct:2, padYPct:2, lock:true },
    boxes:[
      { id:"p2a", label:"1st Term", fs:20, lh:1.35, val:"", style:{ body:'solid' } },
      { id:"p2b", label:"2nd Term", fs:20, lh:1.35, val:"", style:{ body:'solid' } },
      { id:"p2c", label:"3rd Term", fs:20, lh:1.35, val:"", style:{ body:'solid' } },
      { id:"p2d", label:"4th Term", fs:20, lh:1.35, val:"", style:{ body:'solid' } },
    ]
  },

  /* 3) STUDY PLAN (5–8) — grid 2x2, header oranye, limit 65 */
  { name:"Study Plan & Academic Achievement (5–8)", type:'flow', bg: FRAME[3],
    flow:{ cols:2, gapPct:2, leftPct:4, widthPct:93, padXPct:2, padYPct:2, lock:true },
    boxes:[
      { id:"p3a", label:"5th Term", fs:20, lh:1.35, val:"", style:{ body:'solid' } },
      { id:"p3b", label:"6th Term", fs:20, lh:1.35, val:"", style:{ body:'solid' } },
      { id:"p3c", label:"7th Term", fs:20, lh:1.35, val:"", style:{ body:'solid' } },
      { id:"p3d", label:"8th Term", fs:20, lh:1.35, val:"", style:{ body:'solid' } },
    ]
  },

  /* 4) LIFE GRAND MAP (2025–2035) — 1x2 (2 box horizontal), header hijau, limit 100 */
  { name:"Life Grand Map (2025–2035)", type:'flow', bg: FRAME[4],
    flow:{ cols:2, gapPct:2, leftPct:4, widthPct:93, padXPct:2, padYPct:2, lock:true },
    boxes:[
      { id:"p4a", label:"2025 – 2030", fs:22, lh:1.35, val:"", style:{ theme:'green', body:'solid' } },
      { id:"p4b", label:"2030 – 2035", fs:22, lh:1.35, val:"", style:{ theme:'green', body:'solid' } },
    ]
  },

  /* 5) LIFE GRAND MAP (2035–Beyond) — 1x2 (2 box horizontal), header hijau, limit 100 */
  { name:"Life Grand Map (2035–Beyond)", type:'flow', bg: FRAME[5],
    flow:{ cols:2, gapPct:2, leftPct:4, widthPct:93, padXPct:2, padYPct:2, lock:true },
    boxes:[
      { id:"p5a", label:"2035 – 2040", fs:22, lh:1.35, val:"", style:{ theme:'green', body:'solid' } },
      { id:"p5b", label:"2040 – Beyond", fs:22, lh:1.35, val:"", style:{ theme:'green', body:'solid' } },
    ]
  },

  /* 6) COMMUNITY SERVICE & GRAND GOALS PLAN — 2x1 (vertikal), header oranye, limit 100 */
  { name:"Community Service & Grand Goals Plan", type:'flow', bg: FRAME[6],
    flow:{ cols:1, gapPct:3, leftPct:4, widthPct:93, padXPct:2, padYPct:2, lock:true },
    boxes:[
      { id:"p6a", label:"Contribution Plans", fs:24, lh:1.36, val:"", style:{ body:'solid' } },
      { id:"p6b", label:"Personal Grand Plans", fs:24, lh:1.36, val:"", style:{ body:'solid' } },
    ]
  },

  /* 7) COVER — tanpa input */
  { name:"CAKRA NAWASENA — Cover", type:'abs', bg: FRAME[7], boxes:[] },
];

/* ---------- Formatting (markdown mini) ---------- */
function escapeHtml(s){
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function formatInline(text){
  return text.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>');
}
function formatToHTML(text){
  const lines = escapeHtml(text || '').split(/\r?\n/);
  let html = '', mode = null; // 'ul' | 'ol' | null
  const open  = tag => { html += `<${tag}>`; mode = tag; };
  const close = ()  => { if (mode){ html += `</${mode}>`; mode=null; } };

  for (const line of lines){
    if (!line.trim()){ close(); html += '<br>'; continue; }
    const mBullet = line.match(/^\s*•\s+(.*)$/);
    if (mBullet){ if (mode!=='ul'){ close(); open('ul'); } html += `<li>${formatInline(mBullet[1])}</li>`; continue; }
    const mNum = line.match(/^\s*(\d+)\)\s+(.*)$/);
    if (mNum){ if (mode!=='ol'){ close(); open('ol'); } html += `<li>${formatInline(mNum[2])}</li>`; continue; }
    close(); html += `<p>${formatInline(line)}</p>`;
  }
  close(); return html;
}
function wrapSelection(textarea, marker){
  const start = textarea.selectionStart, end = textarea.selectionEnd;
  if (start===end) return;
  const val = textarea.value;
  textarea.value = val.slice(0,start) + marker + val.slice(start,end) + marker + val.slice(end);
  textarea.dispatchEvent(new Event('input'));
  textarea.focus();
  textarea.setSelectionRange(start, end + marker.length*2);
}

/* ---------- Word limit per layout ---------- */
function getPageWordLimit(pageIndex){
  const pg = PAGES[pageIndex];
  if (!pg || pg.type!=='flow') return null;

  const cols = pg.flow?.cols ?? 2;
  const n    = (pg.boxes||[]).length;

  // 2x2 (empat kotak, dua kolom) → 65 kata
  if (cols === 2 && n === 4) return 65;

  // 1x2 (dua kotak horizontal) → 100 kata
  if (cols === 2 && n === 2) return 100;

  // 2x1 (dua kotak vertikal) → 100 kata
  if (cols === 1 && n === 2) return 100;

  // default (jika ada kondisi lain): 100
  return 100;
}

/* ---------- Temukan box / rename / delete ---------- */
function findBoxRef(boxId){
  for (let i = 0; i < PAGES.length; i++){
    const pg = PAGES[i];
    if (!Array.isArray(pg.boxes)) continue;
    const boxIndex = pg.boxes.findIndex(b => b.id === boxId);
    if (boxIndex !== -1){ return { pageIndex:i, page:pg, boxIndex, box:pg.boxes[boxIndex] }; }
  }
  return null;
}
function renameTerm(boxId){
  const ref = findBoxRef(boxId);
  if (!ref){ alert('Term tidak ditemukan: ' + boxId); return; }
  const current = ref.box.label || '';
  const typed = prompt('Nama baru untuk term:', current);
  if (typed === null) return;
  const name = String(typed).trim();
  if (!name){ alert('Nama tidak boleh kosong.'); return; }
  ref.box.label = name;

  const titleEl = document.getElementById('title_' + boxId)
               || document.getElementById('out_' + boxId)?.previousElementSibling;
  if (titleEl) titleEl.textContent = name;

  const lblLeft = document.querySelector(`label[for="in_${boxId}"]`);
  if (lblLeft) lblLeft.textContent = name;
}
function deleteTerm(boxId){
  const ref = findBoxRef(boxId);
  if (!ref){ alert('Term tidak ditemukan: ' + boxId); return; }
  const labelNow = ref.box.label || boxId;
  const ok = confirm(`Hapus term "${labelNow}" dari halaman ini?\n\nSemua konten, judul di preview, dan form kiri akan dihapus.`);
  if (!ok) return;

  ref.page.boxes.splice(ref.boxIndex, 1);
  document.getElementById('out_' + boxId)?.closest('.box')?.remove();
  document.getElementById('grp_' + boxId)?.remove();
  renderPage(ref.pageIndex);
}

/* ---------- Pager ---------- */
function buildPager(){
  pager.innerHTML = '';
  const allowed = getAllowed();
  allowed.forEach((realIx, logicalIx)=>{
    const li = document.createElement('li'); li.className='nav-item';
    const a  = document.createElement('button');
    a.type='button'; a.className='nav-link';
    a.title = PAGES[realIx]?.name || `Page ${realIx+1}`;
    a.textContent = logicalIx + 1;
    a.addEventListener('click', ()=> renderPage(realIx));
    li.appendChild(a); pager.appendChild(li);
  });
  if (totalPg) totalPg.textContent = allowed.length;
}

/* ================= Rendering ================= */
function renderPage(i){
  cur = i;
  const allowed = getAllowed();
  const logicalPos = Math.max(0, allowed.indexOf(cur));
  if (labelPg) labelPg.textContent = logicalPos + 1;

  const inst = document.getElementById('pageInstruction');
  if (inst) inst.textContent = PAGES[i]?.name || "";

  const src = PAGES[i].bg || '';
  bgImg.src = src || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="100%" height="100%" fill="%23f3f4f6"/></svg>';

  stage.querySelectorAll('.overlay-abs, .flow-wrap').forEach(n=>n.remove());
  inputs.innerHTML='';

  if (PAGES[i].type==='abs'){
    const s = k();
    PAGES[i].boxes.forEach(b=>{
      const el = document.createElement('div');
      el.className='overlay-abs box';
      el.style.left  = (b.x*s)+'px';
      el.style.top   = (b.y*s)+'px';
      el.style.width = (b.w*s)+'px';
      el.style.fontSize = (b.fs*s)+'px';
      el.style.lineHeight = b.lh;

      const st = b.style||{};
      if (st.titleBg)    el.style.setProperty('--title-bg', st.titleBg);
      if (st.titleColor) el.style.setProperty('--title-color', st.titleColor);
      if (st.bodyBg)     el.style.setProperty('--body-bg', st.bodyBg);
      if (st.bodyBorder) el.style.setProperty('--body-border', st.bodyBorder);
      if (st.bodyPadX!==undefined)   el.style.setProperty('--body-pad-x', (st.bodyPadX*s)+'px');
      if (st.bodyPadY!==undefined)   el.style.setProperty('--body-pad-y', (st.bodyPadY*s)+'px');
      if (st.height)                 el.style.height = (st.height*s)+'px';
      el.classList?.add(`theme-${st.theme || 'orange'}`, `body-${st.body || 'solid'}`);

      const title = document.createElement('div');
      title.className = 'box-title';
      title.id = 'title_' + b.id;
      title.textContent = b.label;

      const out = document.createElement('div');
      out.className='box-body';
      out.id = `out_${b.id}`;
      out.innerHTML = formatToHTML(b.val || '');

      el.append(title, out);
      stage.appendChild(el);

      makeInputGroup(b, getPageWordLimit(i));
    });

  } else {
    /* ---------- FLOW ---------- */
    const f = PAGES[i].flow;
    const s = k();
    const toPxW=p=> (p*10.8*s)+'px';

    const leftPx = toPxW(f.leftPct ?? 0);
    const topPx  = Math.round(getAnchorYPx(i) * s) + 'px';   // anchor Y per halaman

    const wrap=document.createElement('div');
    wrap.className='flow-wrap';
    wrap.style.setProperty('--cols',   f.cols ?? 2);
    wrap.style.setProperty('--gap-px', toPxW(f.gapPct ?? 2));
    wrap.style.setProperty('--padX-px',toPxW(f.padXPct ?? 0));
    wrap.style.setProperty('--padY-px',toPxW(f.padYPct ?? 0));
    wrap.style.setProperty('--left-px',leftPx);
    wrap.style.setProperty('--top-px', topPx);
    wrap.style.setProperty('--w-px',   toPxW(f.widthPct ?? 93));

    const perBoxLimit = getPageWordLimit(i);

    PAGES[i].boxes.forEach(b=>{
      const card=document.createElement('div');
      card.className='box';
      card.style.fontSize=(b.fs*s)+'px';
      card.style.lineHeight=b.lh;

      const st = b.style||{};
      if (st.titleBg)    card.style.setProperty('--title-bg', st.titleBg);
      if (st.titleColor) card.style.setProperty('--title-color', st.titleColor);
      if (st.bodyBg)     card.style.setProperty('--body-bg', st.bodyBg);
      if (st.bodyBorder) card.style.setProperty('--body-border', st.bodyBorder);
      if (st.bodyPadX!==undefined)   card.style.setProperty('--body-pad-x', (st.bodyPadX*s)+'px');
      if (st.bodyPadY!==undefined)   card.style.setProperty('--body-pad-y', (st.bodyPadY*s)+'px');
      card.classList?.add(`theme-${st.theme || 'orange'}`, `body-${st.body || 'solid'}`);

      const title = document.createElement('div');
      title.className='box-title';
      title.id = 'title_' + b.id;
      title.textContent = b.label;

      const out = document.createElement('div');
      out.className='box-body';
      out.id = `out_${b.id}`;
      // trim sesuai limit halaman
      b.val = trimToMaxWords(b.val || '', perBoxLimit);
      out.innerHTML = formatToHTML(b.val);

      card.append(title, out);
      wrap.appendChild(card);

      makeInputGroup(b, perBoxLimit);
    });

    // tandai 1 kolom penuh / 3 box (opsional)
    const n = (PAGES[i].boxes || []).length;
    wrap.classList.remove('is-1','is-3');
    if (n === 1) { wrap.classList.add('is-1'); wrap.style.setProperty('--cols', 1); }
    if (n === 3) { wrap.classList.add('is-3'); }

    stage.appendChild(wrap);
  }

  // highlight pager
  const allowedForHL = getAllowed();
  pager.querySelectorAll('button.nav-link').forEach((a,idx)=>{
    const realIx = allowedForHL[idx];
    const on = realIx === i;
    a.classList.toggle('active', on);
    a.classList.toggle('text-white', on);
  });
}

/* ---------- Input kiri + counter (enforce limit) ---------- */
function makeInputGroup(b, maxWords){
  const grp=document.createElement('div');
  grp.className='mb-3';
  grp.id = 'grp_' + b.id;
  grp.innerHTML = `
    <div class="d-flex justify-content-between align-items-center gap-2">
      <label class="form-label mb-0" for="in_${b.id}">${b.label}</label>
      <div class="btn-group btn-group-sm">
        <button type="button" class="btn btn-outline-secondary rename-term" data-box="${b.id}">Ganti Nama</button>
        <button type="button" class="btn btn-outline-danger del-term" data-box="${b.id}">Hapus Term</button>
      </div>
    </div>
    <div class="fmt-bar">
      <button type="button" class="btn btn-outline-secondary btn-sm fmt-para">¶ Paragraf</button>
      <button type="button" class="btn btn-outline-secondary btn-sm fmt-bullets">• Bullets</button>
      <button type="button" class="btn btn-outline-secondary btn-sm fmt-num">1. Numbered</button>
      <button type="button" class="btn btn-outline-secondary btn-sm fmt-bold"><b>B</b></button>
      <button type="button" class="btn btn-outline-secondary btn-sm fmt-italic"><i>I</i></button>
    </div>
    <textarea id="in_${b.id}" class="form-control" rows="6" placeholder="Tulis konten (maks ${maxWords} kata)..."></textarea>
    <div id="cnt_${b.id}" class="mini counter"></div>
  `;
  inputs.appendChild(grp);

  const ta=grp.querySelector('textarea');
  const cnt=grp.querySelector(`#cnt_${b.id}`);

  ta.value = trimToMaxWords(b.val || '', maxWords);
  autoSizeTA(ta);

  // counter awal
  {
    const w = countWords(ta.value), cNo = countCharsNoSpace(ta.value), cWS = countCharsWS(ta.value);
    cnt.textContent = renderCounterText(w,cNo,cWS,maxWords);
    cnt.className = 'mini counter ' + classify(w,maxWords);
  }

  // live sync + HARD LIMIT sesuai halaman
  ta.addEventListener('input', e=>{
    const original = e.target.value;
    const trimmed  = trimToMaxWords(original, maxWords);
    if (trimmed !== original){
      const pos = e.target.selectionStart;
      e.target.value = trimmed;
      setCaret(e.target, Math.min(pos, trimmed.length));
    }
    b.val = e.target.value;

    const outEl=document.getElementById('out_'+b.id);
    if(outEl) outEl.innerHTML = formatToHTML(b.val);
    autoSizeTA(e.target);

    const w = countWords(b.val), cNo = countCharsNoSpace(b.val), cWS = countCharsWS(b.val);
    cnt.textContent = renderCounterText(w,cNo,cWS,maxWords);
    cnt.className = 'mini counter ' + classify(w,maxWords);
  });

  // toolbar
  grp.querySelector('.fmt-para')  .addEventListener('click', ()=> insertParagraph(ta));
  grp.querySelector('.fmt-bullets').addEventListener('click', ()=> insertBullets(ta));
  grp.querySelector('.fmt-num')   .addEventListener('click', ()=> insertNumbered(ta));
  grp.querySelector('.fmt-bold')  ?.addEventListener('click', ()=> wrapSelection(ta, '**'));
  grp.querySelector('.fmt-italic')?.addEventListener('click', ()=> wrapSelection(ta, '*'));

  // rename & delete
  grp.querySelector('.rename-term')?.addEventListener('click', ()=> renameTerm(b.id));
  grp.querySelector('.del-term')?.addEventListener('click', ()=> deleteTerm(b.id));
}

/* ---------- Export (png) ---------- */
async function renderCanvasSafe() {
  try { await bgImg.decode(); } catch(e) {}
  stage.classList.add('exporting');
  await new Promise(r => requestAnimationFrame(()=>requestAnimationFrame(r)));
  try{
    const cv = await html2canvas(stage,{ scale:2, backgroundColor:'#ffffff', useCORS:true });
    return cv;
  } finally {
    stage.classList.remove('exporting');
  }
}
document.getElementById('export')?.addEventListener('click', async ()=>{
  const cv = await renderCanvasSafe();
  cv.toBlob(b=>saveAs(b,`page-${cur+1}.png`));
});
document.getElementById('exportAll')?.addEventListener('click', async ()=>{
  const zip=new JSZip(); const keep=cur;
  const allowed = getAllowed();
  for(let li=0; li<allowed.length; li++){
    const i = allowed[li];
    renderPage(i);
    const cv=await renderCanvasSafe();
    await new Promise(r=>cv.toBlob(b=>{
      const fr=new FileReader();
      fr.onload=()=>{ zip.file(`page-${li+1}.png`, fr.result.split(',')[1], {base64:true}); r(); };
      fr.readAsDataURL(b);
    }));
  }
  const blob=await zip.generateAsync({type:'blob'});
  saveAs(blob,'Selected-Pages.zip');
  renderPage(keep);
});

/* ---------- Navigasi ---------- */
function stepTo(delta){
  const allowed = getAllowed();
  const pos = Math.max(0, allowed.indexOf(cur));
  const nextPos = (pos + delta + allowed.length) % allowed.length;
  renderPage(allowed[nextPos]);
}
btnPrev?.addEventListener('click', ()=> stepTo(-1));
btnNext?.addEventListener('click', ()=> stepTo(+1));
window.addEventListener('keydown', e=>{
  if(e.key==='ArrowLeft')  stepTo(-1);
  if(e.key==='ArrowRight') stepTo(+1);
});

/* ---------- LocalStorage ---------- */
const KEY='seven_pages_editor_lockedbg_layoutLimits_v1';
document.getElementById('save')?.addEventListener('click', ()=>{
  const data = PAGES.map(p => {
    const { boxes, flow, name, type } = p;
    return { name, type, boxes, flow };
  });
  localStorage.setItem(KEY, JSON.stringify(data));
  alert('Tersimpan di browser.');
});
(function restore(){
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw) return;
    const saved=JSON.parse(raw);
    if(Array.isArray(saved) && saved.length===PAGES.length){
      for(let i=0;i<PAGES.length;i++){
        const curPg = PAGES[i], savPg = saved[i] || {};
        if (savPg.flow && curPg.flow) curPg.flow = {...curPg.flow, ...savPg.flow};
        if (Array.isArray(savPg.boxes) && Array.isArray(curPg.boxes)){
          const limit = getPageWordLimit(i);
          curPg.boxes = curPg.boxes.map((b, idx)=>{
            const merged = {...b, ...(savPg.boxes[idx]||{})};
            merged.val = trimToMaxWords(merged.val || "", limit);
            return merged;
          });
        }
      }
    }
  }catch(e){}
})();

/* ---------- Init ---------- */
window.addEventListener('DOMContentLoaded', ()=>{
  buildPager();
  renderPage(0);
});
