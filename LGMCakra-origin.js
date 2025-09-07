/* =========================================================
   LGMCakra — Final (BG statis + BOX PNG + Header/Text overlay)
   - Tanpa SkillBuilder
   - Batas body: 50 kata
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
const ART_W = 1080, ART_H = 1350;
const k  = () => stage.clientWidth / ART_W;   // skala (artboard 1080×1350)
function autoSizeTA(el){ el.style.height='auto'; el.style.height = el.scrollHeight + 'px'; }

/* ============ Inject CSS kecil (counter + overlay style) ============ */
(function inject(){
  if (document.getElementById('lgm-inline-style')) return;
  const css = `
    .mini.counter{ font-size:.85rem; margin-top:.25rem; opacity:.95 }
    .mini.counter.ok{ color:#198754 }
    .mini.counter.near{ color:#dc3545 }
    .mini.counter.bad{ color:#dc3545; font-weight:600 }

    /* grid area (flow-wrap) menempel pada kanvas 1080×1350 */
    .flow-wrap{ position:absolute; left:0; top:0; right:0; bottom:0; }
    /* kartu png */
    .box.png-mode{
      position:absolute;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: top left;
    }
    /* dua layer teks */
    .box .hdr, .box .txt{
      position:absolute; white-space:pre-wrap; word-wrap:break-word;
      max-width: 100%;
    }
    .box .hdr{
      font-family: "Urbanist", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-weight:700; letter-spacing:.05em; color:#fff;
      line-height:1.1;
    }
    .box .txt{
      font-family: "Urbanist", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-weight:400; color:#1E1E1E; line-height:1.35;
    }
  `;
  const style=document.createElement('style'); style.id='lgm-inline-style'; style.textContent=css;
  document.head.appendChild(style);
})();

/* ---------- Frames (halaman) ---------- */
const FRAME = {
  1: './frame-02.png', // Self Potential
  2: './frame-03.png', // Study Plan (1–4)
  3: './frame-04.png', // Study Plan (5–8)
  4: './frame-05.png', // Life Grand Map (2025–2035)
  5: './frame-06.png', // Life Grand Map (2035–Beyond)
  6: './frame-07.png', // Community Service & Grand Goals
  7: './frame-08.png', // Cover/Akhir
};

/* ---------- Box PNG (file harus ada di folder yang sama) ---------- */
const BOXES = {};
[
  'p1a','p1b','p1c','p1d',
  'p2a','p2b','p2c','p2d',
  'p3a','p3b','p3c','p3d',
  'p4a','p4b',
  'p5a','p5b',
  'p6a','p6b'
].forEach(id=> BOXES[id] = `./${id}.png`);

/* ---------- Preset anchor (relatif KE DALAM BOX) ---------- */
const PRESET = {
  SMALL: {
    hdr: { x: 40,  y: 18,  size: 28, weight:700, color:'#FFFFFF', letterSpacing: 0.05 },   // relatif ke box
    txt: { x: 34,  y: 110, size: 18, weight:400, color:'#1E1E1E', letterSpacing: 0.05, maxWidth: 360 }, 
  },
  BIG: {
    hdr: { x: 40, y: 28, size: 36, weight:700, color:'#FFFFFF', letterSpacing: 0.05 },
    txt: { x: 40, y: 96, size: 20, weight:400, color:'#1E1E1E', letterSpacing: 0.05, maxWidth: 915 }
  }
};

/* ---------- Limit kata (body) ---------- */
const BODY_MAX_WORDS = 50;
const HEADER_MAX_WORDS = 999;

/* ---------- Helpers hitung ---------- */
function countWords(t){ return (t||'').trim().split(/\s+/).filter(Boolean).length; }
function classify(words, max){
  if (words > max) return 'bad';
  if (words >= max-5) return 'near';
  return 'ok';
}

/* ---------- Format plain text jadi HTML paragraf ---------- */
function formatHTML(t){
  const lines = String(t||'').split(/\r?\n/);
  return lines.map(l => l.trim() ? `<p>${escapeHtml(l)}</p>` : '<br>').join('');
}
function escapeHtml(s){
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ===== Toolbar helpers (paragraf, bullets, numbered, bold, italic) ===== */
function getSel(el){ return {s: el.selectionStart ?? el.value.length, e: el.selectionEnd ?? el.value.length}; }
function setSel(el, p){ try{ el.focus(); el.setSelectionRange(p,p); }catch(_){} }
function insertAt(el, text, moveEnd=true){
  const {s,e}=getSel(el);
  el.value = el.value.slice(0,s) + text + el.value.slice(e);
  setSel(el, moveEnd ? s+text.length : s);
  el.dispatchEvent(new Event('input',{bubbles:true}));
}
function insertParagraph(el){
  const t = (el.value && !el.value.endsWith('\n')) ? '\n\n' : '\n\n';
  insertAt(el, t);
}
function insertBullets(el){
  const t = (el.value && !el.value.endsWith('\n') ? '\n' : '') + '• Poin 1\n• Poin 2\n• Poin 3\n';
  insertAt(el, t);
}
function insertNumbered(el){
  const t = (el.value && !el.value.endsWith('\n') ? '\n' : '') + '1) Langkah 1\n2) Langkah 2\n3) Hasil\n';
  insertAt(el, t);
}
function wrapSel(el, marker){  // '**' untuk bold, '*' untuk italic
  const {s,e}=getSel(el);
  if(s===e) return;
  el.value = el.value.slice(0,s) + marker + el.value.slice(s,e) + marker + el.value.slice(e);
  el.dispatchEvent(new Event('input',{bubbles:true}));
  el.focus();
  el.setSelectionRange(s, e + marker.length*2);
}

/* ===== Rename / Delete (khusus halaman Study Plan) ===== */
function renameTerm(pageIndex, boxId){
  const pg = PAGES[pageIndex]; if(!pg) return;
  const idx = (pg.boxes||[]).findIndex(b=>b.id===boxId);
  if(idx<0) return;
  const curName = pg.boxes[idx].title || '';
  const next = prompt('Nama baru untuk header:', curName);
  if(next==null) return;
  pg.boxes[idx].title = String(next).trim();
  renderPage(pageIndex);
}
function deleteTerm(pageIndex, boxId){
  const pg = PAGES[pageIndex]; if(!pg) return;
  const idx = (pg.boxes||[]).findIndex(b=>b.id===boxId);
  if(idx<0) return;
  const label = pg.boxes[idx].title || boxId;
  if(!confirm(`Hapus kotak "${label}" dari halaman ini?`)) return;
  pg.boxes.splice(idx,1);
  renderPage(pageIndex);
}

/* ---------- PAGES: posisi BG box (ABSOLUT) & posisi teks (relatif/ABS) ---------- */
const PAGES = [
 { name:"Self Potential", bg:FRAME[1], boxes:[
  // kiri–atas
  { id:'p1a', title:'Self Potential 1', x:110, y:375, w:430, h:349, preset:'SMALL', text:'',
    // header geser kanan + batasi lebar
    hdr:{ x:64, maxWidth: 320 } },

  // kanan–atas
  { id:'p1b', title:'Self Potential 2', x:568, y:375, w:430, h:349, preset:'SMALL', text:'',
    // header tetap start kiri, batasi lebar supaya aman dari ikon kanan
    hdr:{ x:40, maxWidth: 310 } },

  // kiri–bawah
  { id:'p1c', title:'Self Potential 3', x:110, y:798, w:430, h:349, preset:'SMALL', text:'',
    // header geser lebih kanan (ikon kiri lebih “masuk”)
    hdr:{ x:96, maxWidth: 320 } },

  // kanan–bawah
  { id:'p1d', title:'Self Potential 4', x:568, y:798, w:430, h:349, preset:'SMALL', text:'',
    // batasi lebar agar tak menyentuh ikon kanan
    hdr:{ x:40, maxWidth: 310 } },
]},
  { name:"Study Plan 1–4", bg:FRAME[2], boxes:[
    { id:'p2a', title:'1st Term', x:83,  y:365, w:435, h:400, preset:'BIG', text:'' },
    { id:'p2b', title:'2nd Term', x:563, y:363.22, w:435.89, h:401.78, preset:'BIG', text:'' },
    { id:'p2c', title:'3rd Term', x:83,  y:804.19, w:435, h:400, preset:'BIG', text:'' },
    { id:'p2d', title:'4th Term', x:563, y:805, w:435, h:400.81, preset:'BIG', text:'' },
  ]},
  { name:"Study Plan 5–8", bg:FRAME[3], boxes:[
    { id:'p2a', title:'5th Term', x:83,  y:365, w:435, h:400, preset:'BIG', text:'' },
    { id:'p2b', title:'6th Term', x:563, y:363.22, w:435.89, h:401.78, preset:'BIG', text:'' },
    { id:'p2c', title:'7th Term', x:83,  y:804.19, w:435, h:400, preset:'BIG', text:'' },
    { id:'p2d', title:'8th Term', x:563, y:805, w:435, h:400.81, preset:'BIGL', text:'' },
  ]},


  { name:"Life Grand Map 2025–2035", bg:FRAME[4], boxes:[
    { id:'p4a', title:'2025 – 2030', x:91,  y:438, w:430, h:489, preset:'BIG', text:'',

      hdr: { abs: true, x: 200, y: 454, size: 35, weight: 280, color: "#FFFFFF", maxWidthAbs: 430, align:"center"},
      txt: { abs: true, x: 130, y: 454 + 48 + 20, size: 25, weight: 360, color: "#2B2B2B", maxWidthAbs: 360, lineHeight: 1.45, letterSpacing: 0}
     },
    { id:'p4b', title:'2030 – 2035', x:580, y:438, w:430, h:489, preset:'BIG', text:'',
       hdr: { abs: true, x: 715, y: 454, size: 35, weight: 280, color: "#FFFFFF", maxWidthAbs: 430, align:"center"},
       txt: { abs: true, x: 610, y: 537, size: 25, weight: 360, color: "#2B2B2B", maxWidthAbs: 360, lineHeight: 1.45, letterSpacing: 0}
     },
  ]},
  { name:"Life Grand Map 2035–Beyond", bg:FRAME[5], boxes:[
    { id:'p5a', title:'2035 – 2040', x:91,  y:332.73, w:430, h:613.82, preset:'BIG', text:'',
       hdr: { abs: true, x: 200, y: 454, size: 35, weight: 280, color: "#FFFFFF", maxWidthAbs: 430, align:"center"},
       txt: { abs: true, x: 125, y: 537, size: 25, weight: 360, color: "#2B2B2B", maxWidthAbs: 360, lineHeight: 1.45, letterSpacing: 0}
    },
    { id:'p5b', title:'2040 – Beyond', x:580, y:313.18, w:430, h:613.82, preset:'SMALL', text:'',
       hdr: { abs: true, x: 655, y: 454, size: 35, weight: 280, color: "#FFFFFF", maxWidthAbs: 280, align:"center"},
       txt: { abs: true, x: 610, y: 537, size: 25, weight: 360, color: "#2B2B2B", maxWidthAbs: 360, lineHeight: 1.45, letterSpacing: 0}
     },
  ]},
  { name:"Community Service & Grand Goals", bg:FRAME[6], boxes:[
    {
      id:'p6a', title:'Contribution Plan',
      // BG PNG (absolut ke kanvas)
      x:83, y:375, w:915, h:365, preset:'BIG', text:'',
      // TEKS absolut ke kanvas (tidak ikut BG)
      
      hdr: { abs:true, x:183, y:400, size:40, weight:457, color: "#FFFFFF", maxWidthAbs: 457, align:"center"},
      txt: { abs: true, x: 121, y: 474, size: 25, weight: 360, color: "#2B2B2B", maxWidthAbs: 820, lineHeight: 1.45, letterSpacing: 0}
    },
    {
      id:'p6b', title:'Personal Grand Goals',
      x:61.57, y:778, w:915, h:387, preset:'BIG', text:'',
      hdr: { abs:true, x:183, y:818, size:40, weight:423, color: "#FFFFFF", maxWidthAbs: 457, align:"center"},
      txt: { abs:true, x:122, y:897, size:25, weight:400, color: "#2B2B2B", maxWidthAbs: 820, lineHeight: 1.45, letterSpacing: 0}
    },
  ]},

  { name:"Cover", bg:FRAME[7], boxes:[] },
];

/* ============= RENDER ============= */
function renderPage(i){
  cur = i;
  if (labelPg) labelPg.textContent = i+1;
  if (totalPg) totalPg.textContent = PAGES.length;

  // BG frame
  bgImg.src = PAGES[i].bg || '';

  // reset
  inputs.innerHTML = '';
  stage.querySelectorAll('.flow-wrap').forEach(n=>n.remove());

  const s = k();
  const wrap = document.createElement('div');
  wrap.className = 'flow-wrap';

  // Study Plan pages: index 1 & 2 (0-based) → toolbar aktif
  const isStudyPlan = [1,2].includes(i);

  // render setiap box absolut
  (PAGES[i].boxes || []).forEach(b=>{
    const card = document.createElement('div');
    card.className = 'box png-mode';
    card.style.left   = (b.x * s) + 'px';
    card.style.top    = (b.y * s) + 'px';
    card.style.width  = (b.w * s) + 'px';
    card.style.height = (b.h * s) + 'px';
    card.style.backgroundImage = `url("${BOXES[b.id]}")`;

    // anchor style (relatif/absolut)
    const preset = PRESET[b.preset || 'SMALL'];
    const H = {...preset.hdr, ...(b.hdr||{})};
    const T = {...preset.txt, ...(b.txt||{})};

    // HEADER
    const hdr = document.createElement('div');
    hdr.className = 'hdr';
    hdr.id = `hdr_${b.id}`;
    hdr.textContent = b.title || '';
    applyTextStyle(hdr, H, s, b);  // pass box

    // BODY
    const txt = document.createElement('div');
    txt.className = 'txt';
    txt.id = `out_${b.id}`;
    txt.innerHTML = formatHTML(b.text || '');
    applyTextStyle(txt, T, s, b);

    card.append(hdr, txt);
    wrap.appendChild(card);

    /* ===== KIRI: form (kondisional) ===== */
    const grp = document.createElement('div');
    grp.className = 'mb-3';
    grp.id = 'grp_' + b.id;

    if (isStudyPlan){
      // dengan toolbar + rename/delete
      grp.innerHTML = `
        <div class="d-flex justify-content-between align-items-center gap-2 mb-1">
          <label class="form-label mb-0">${PAGES[i].name} — <b>${b.id.toUpperCase()}</b></label>
          <div class="btn-group btn-group-sm">
            <button type="button" class="btn btn-outline-secondary act-rename">Ganti Nama</button>
            <button type="button" class="btn btn-outline-danger act-delete">Hapus Term</button>
          </div>
        </div>
        <div class="row g-2">
          <div class="col-12">
            <input id="title_${b.id}" class="form-control" placeholder="Header title..." />
          </div>
          <div class="col-12">
            <div class="d-flex gap-2 flex-wrap mb-1">
              <button type="button" class="btn btn-outline-secondary btn-sm tb-para">Paragraf</button>
              <button type="button" class="btn btn-outline-secondary btn-sm tb-bullets">Bullets</button>
              <button type="button" class="btn btn-outline-secondary btn-sm tb-num">Numbered</button>
              <button type="button" class="btn btn-outline-secondary btn-sm tb-bold"><b>B</b></button>
              <button type="button" class="btn btn-outline-secondary btn-sm tb-italic"><i>/</i></button>
            </div>
            <textarea id="in_${b.id}" class="form-control" rows="5" placeholder="Isi body... (max 50 kata)"></textarea>
            <div id="cnt_${b.id}" class="mini counter"></div>
          </div>
        </div>
      `;
    } else {
      // sederhana (tanpa toolbar/rename/delete)
      grp.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <label class="form-label mb-1">${PAGES[i].name} — <b>${b.id.toUpperCase()}</b></label>
        </div>
        <div class="row g-2">
          <div class="col-12">
            <input id="title_${b.id}" class="form-control" placeholder="Header title..." />
          </div>
          <div class="col-12">
            <textarea id="in_${b.id}" class="form-control" rows="5" placeholder="Isi body... (max 50 kata)"></textarea>
            <div id="cnt_${b.id}" class="mini counter"></div>
          </div>
        </div>
      `;
    }
    inputs.appendChild(grp);

    // sinkron nilai awal
    const titleInp = grp.querySelector(`#title_${b.id}`);
    const ta       = grp.querySelector(`#in_${b.id}`);
    const cnt      = grp.querySelector(`#cnt_${b.id}`);

    titleInp.value = b.title || '';
    ta.value       = b.text  || '';
    autoSizeTA(ta);

    // counter awal
    const w0 = countWords(ta.value);
    cnt.textContent = `${w0}/${BODY_MAX_WORDS} words (${Math.max(0,BODY_MAX_WORDS-w0)} left)`;
    cnt.className = 'mini counter ' + classify(w0, BODY_MAX_WORDS);

    // events umum
    titleInp.addEventListener('input', ()=>{
      b.title = titleInp.value;
      hdr.textContent = b.title || '';
      const words = countWords(b.title);
      if (words>HEADER_MAX_WORDS) titleInp.classList.add('is-invalid');
      else titleInp.classList.remove('is-invalid');
    });
    ta.addEventListener('input', ()=>{
      b.text = ta.value;
      txt.innerHTML = formatHTML(b.text);
      autoSizeTA(ta);
      const w = countWords(b.text);
      cnt.textContent = `${w}/${BODY_MAX_WORDS} words (${Math.max(0,BODY_MAX_WORDS-w)} left)`;
      cnt.className = 'mini counter ' + classify(w, BODY_MAX_WORDS);
    });

    // events khusus Study Plan
    if (isStudyPlan){
      grp.querySelector('.tb-para')  .addEventListener('click', ()=> insertParagraph(ta));
      grp.querySelector('.tb-bullets').addEventListener('click', ()=> insertBullets(ta));
      grp.querySelector('.tb-num')   .addEventListener('click', ()=> insertNumbered(ta));
      grp.querySelector('.tb-bold')  .addEventListener('click', ()=> wrapSel(ta, '**'));
      grp.querySelector('.tb-italic').addEventListener('click', ()=> wrapSel(ta, '*'));
      grp.querySelector('.act-rename').addEventListener('click', ()=> renameTerm(i, b.id));
      grp.querySelector('.act-delete').addEventListener('click', ()=> deleteTerm(i, b.id));
    }
  });

  stage.appendChild(wrap);

  // highlight pager
  pager.querySelectorAll('button.nav-link').forEach((a,idx)=>{
    a.classList.toggle('active', idx===i);
  });
}

/* Apply style & position for text overlays
   - spec.abs === true  -> x,y adalah KOORDINAT KANVAS.
     Karena elemen tetap anak .box, kita harus konversi ke koordinat DALAM box:
       posX = spec.x - box.x
       posY = spec.y - box.y
   - selain itu -> x,y relatif ke dalam box (default preset).
*/
function applyTextStyle(el, spec, scale, box){
  const s = spec || {};
  const bx = box?.x || 0;
  const by = box?.y || 0;

  // konversi posisi
  const relX = s.abs ? ((s.x || 0) - bx) : (s.x || 0);
  const relY = s.abs ? ((s.y || 0) - by) : (s.y || 0);

  el.style.left = (relX * scale) + 'px';
  el.style.top  = (relY * scale) + 'px';

  // tipografi
  el.style.fontSize     = ((s.size || 18) * scale) + 'px';
  el.style.fontWeight   = String(s.weight || 400);
  el.style.color        = s.color || '#1E1E1E';
  el.style.letterSpacing= ((s.letterSpacing ?? 0) + 'em');

  // lebar teks
  if (s.maxWidthAbs != null){
    el.style.maxWidth = (s.maxWidthAbs * scale) + 'px';
  } else if (s.maxWidth != null){
    el.style.maxWidth = (s.maxWidth * scale) + 'px';
  } else {
    el.style.maxWidth = '100%';
  }

  // anchor horizontal (opsional)
  if (s.anchor === 'middle'){
    el.style.transform = 'translateX(-50%)';
  } else if (s.anchor === 'end'){
    el.style.transform = 'translateX(-100%)';
  } else {
    el.style.transform = 'none';
  }
}

/* ---------- Pager ---------- */
function buildPager(){
  pager.innerHTML = '';
  PAGES.forEach((pg,idx)=>{
    const li=document.createElement('li'); li.className='nav-item';
    const a=document.createElement('button'); a.type='button'; a.className='nav-link';
    a.textContent = idx+1;
    a.title = pg.name;
    a.addEventListener('click', ()=>renderPage(idx));
    li.appendChild(a); pager.appendChild(li);
  });
  if(totalPg) totalPg.textContent = PAGES.length;
}

/* ---------- Export (html2canvas) ---------- */
async function renderCanvasSafe(){
  try{ await bgImg.decode(); }catch(_){}
  stage.classList.add('exporting');
  await new Promise(r => requestAnimationFrame(()=>requestAnimationFrame(r)));
  try{
    const cv = await html2canvas(stage,{ scale:2, backgroundColor:'#fff', useCORS:true });
    return cv;
  } finally { stage.classList.remove('exporting'); }
}
document.getElementById('export').onclick = async ()=>{
  const cv = await renderCanvasSafe();
  cv.toBlob(b=>saveAs(b,`page-${cur+1}.png`));
};

/* ---------- Navigasi ---------- */
btnPrev.onclick = ()=>{ cur=(cur-1+PAGES.length)%PAGES.length; renderPage(cur); };
btnNext.onclick = ()=>{ cur=(cur+1)%PAGES.length; renderPage(cur); };
window.addEventListener('keydown', e=>{
  if(e.key==='ArrowLeft')  btnPrev.click();
  if(e.key==='ArrowRight') btnNext.click();
});

/* ---------- Init ---------- */
window.addEventListener('DOMContentLoaded', ()=>{
  buildPager();
  renderPage(0);
});










