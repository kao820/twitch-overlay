// Admin/editor logic: edit heroes, glossary, style; save to localStorage and allow download
(async function(){
  // helpers
  function q(id){ return document.getElementById(id); }
  function el(sel){ return document.querySelector(sel); }
  function fetchJSON(path){ return fetch(path, {cache:'no-store'}).then(r=>r.ok? r.json(): null).catch(()=>null); }
  function download(name,obj){ const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

  // state
  let heroes = [];
  let glossary = {};
  let style = {};

  // load files and localStorage fallback
  async function loadAll(){
    const h = await fetchJSON('heroes.json');
    const g = await fetchJSON('glossary.json');
    const s = await fetchJSON('style.json');
    const ls_h = localStorage.getItem('rpg_overlay_data');
    const ls_g = localStorage.getItem('rpg_overlay_glossary');
    const ls_s = localStorage.getItem('rpg_overlay_style');

    heroes = ls_h ? JSON.parse(ls_h).heroes || JSON.parse(ls_h) : (h || []);
    glossary = ls_g ? JSON.parse(ls_g) : (g || {});
    style = ls_s ? JSON.parse(ls_s) : (s || {});
    // normalize: heroes as array of objects
    if(!Array.isArray(heroes)) heroes = [];
    // ensure glossary has letters
    const letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
    letters.forEach(L=> { if(!glossary[L]) glossary[L]=[] });
  }

  // UI refs
  const heroesEditor = q('heroesEditor');
  const miniPreview = q('miniPreview');

  // tabs
  document.querySelectorAll('.tab-btn').forEach(b=>{
    b.onclick = ()=>{
      document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(x=>x.style.display='none');
      b.classList.add('active');
      q('tab-'+b.dataset.tab).style.display='';
    };
  });

  // render heroes editor (4 blocks)
  function renderHeroesEditor(){
    heroesEditor.innerHTML = '';
    for(let i=0;i<4;i++){
      const h = heroes[i] || {name:'',race:'',class:'',portrait:'',hp:0,brn:0,urv:0,stats:{"СИЛ":"", "ИНТ":"", "ЛОВ":"", "МУД":"", "ВЫН":"", "ХАР":""}};
      const div = document.createElement('div'); div.className='hero-block';
      div.innerHTML = `
        <label>Имя</label><input class="h_name" data-i="${i}" value="${escapeHtml(h.name)}">
        <label>Раса</label><input class="h_race" data-i="${i}" value="${escapeHtml(h.race)}">
        <label>Класс</label><input class="h_class" data-i="${i}" value="${escapeHtml(h.class)}">
        <label>Портрет (URL или assets/...)</label><input class="h_portrait" data-i="${i}" value="${escapeHtml(h.portrait)}">
        <label>HP</label><input type="number" class="h_hp" data-i="${i}" value="${h.hp||0}">
        <label>БРН</label><input type="number" class="h_brn" data-i="${i}" value="${h.brn||0}">
        <label>УРВ</label><input type="number" class="h_urv" data-i="${i}" value="${h.urv||0}">
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:8px">
          <div><label>СИЛ</label><input class="h_stat" data-i="${i}" data-stat="СИЛ" value="${escapeHtml(h.stats['СИЛ']||'')}"></div>
          <div><label>ИНТ</label><input class="h_stat" data-i="${i}" data-stat="ИНТ" value="${escapeHtml(h.stats['ИНТ']||'')}"></div>
          <div><label>ЛОВ</label><input class="h_stat" data-i="${i}" data-stat="ЛОВ" value="${escapeHtml(h.stats['ЛОВ']||'')}"></div>
          <div><label>МУД</label><input class="h_stat" data-i="${i}" data-stat="МУД" value="${escapeHtml(h.stats['МУД']||'')}"></div>
          <div><label>ВЫН</label><input class="h_stat" data-i="${i}" data-stat="ВЫН" value="${escapeHtml(h.stats['ВЫН']||'')}"></div>
          <div><label>ХАР</label><input class="h_stat" data-i="${i}" data-stat="ХАР" value="${escapeHtml(h.stats['ХАР']||'')}"></div>
        </div>
      `;
      heroesEditor.appendChild(div);
    }
    attachHeroInputs();
  }
  function escapeHtml(s){ return (s||'').toString().replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;') }

  function attachHeroInputs(){
    document.querySelectorAll('.h_name,.h_race,.h_class,.h_portrait,.h_hp,.h_brn,.h_urv,.h_stat').forEach(inp=>{
      inp.oninput = ()=>{
        const i = +inp.dataset.i;
        if(!heroes[i]) heroes[i] = {name:'',race:'',class:'',portrait:'',hp:0,brn:0,urv:0,stats:{"СИЛ":"","ИНТ":"","ЛОВ":"","МУД":"","ВЫН":"","ХАР":""}};
        if(inp.classList.contains('h_name')) heroes[i].name = inp.value;
        if(inp.classList.contains('h_race')) heroes[i].race = inp.value;
        if(inp.classList.contains('h_class')) heroes[i].class = inp.value;
        if(inp.classList.contains('h_portrait')) heroes[i].portrait = inp.value;
        if(inp.classList.contains('h_hp')) heroes[i].hp = parseInt(inp.value) || 0;
        if(inp.classList.contains('h_brn')) heroes[i].brn = parseInt(inp.value) || 0;
        if(inp.classList.contains('h_urv')) heroes[i].urv = parseInt(inp.value) || 0;
        if(inp.classList.contains('h_stat')) heroes[i].stats[inp.dataset.stat] = inp.value;
        autoSavePreview();
      };
    });
  }

  // GLOSSARY editor
  const letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
  function renderGlossControls(){
    const sel = q('glossLetter'); sel.innerHTML='';
    letters.forEach(L=>{ const o=document.createElement('option'); o.value=L; o.textContent=L; sel.appendChild(o); });
    sel.onchange = ()=> renderGlossList();
    renderGlossList();
  }
  function renderGlossList(){
    const L = q('glossLetter').value;
    const list = glossary[L] || [];
    const container = q('glossList'); container.innerHTML='';
    list.forEach((it, idx)=>{
      const div = document.createElement('div'); div.style.display='flex'; div.style.justifyContent='space-between'; div.style.padding='6px'; div.style.borderBottom='1px solid #111';
      div.innerHTML = `<div><strong>${it.term}</strong><div style="color:#999">${it.desc}</div></div>
        <div style="display:flex;gap:6px"><button class="edit-gloss" data-i="${idx}" data-l="${L}">✎</button><button class="del-gloss" data-i="${idx}" data-l="${L}">🗑</button></div>`;
      container.appendChild(div);
    });
    attachGlossListeners();
  }
  function attachGlossListeners(){
    document.querySelectorAll('.del-gloss').forEach(b=> b.onclick = ()=>{
      const i = +b.dataset.i; const L = b.dataset.l;
      glossary[L].splice(i,1); renderGlossList(); autoSavePreview();
    });
    document.querySelectorAll('.edit-gloss').forEach(b=> b.onclick = ()=>{
      const i = +b.dataset.i; const L = b.dataset.l;
      const it = glossary[L][i];
      const t = prompt('Термин', it.term); if(t===null) return;
      const d = prompt('Описание', it.desc); if(d===null) return;
      it.term = t; it.desc = d; renderGlossList(); autoSavePreview();
    });
  }

  q('addGloss').onclick = ()=>{
    const L = q('glossLetter').value;
    const t = q('glossTerm').value.trim();
    const d = q('glossDesc').value.trim();
    if(!t) return alert('Введите термин');
    if(!glossary[L]) glossary[L]=[];
    glossary[L].push({term:t, desc:d});
    q('glossTerm').value=''; q('glossDesc').value='';
    renderGlossList(); autoSavePreview();
  };

  // design controls
  function bindDesign(){
    const map = {
      d_btnColor: 'btnColor',
      d_panelBg: 'panelBg',
      d_textColor: 'textColor',
      d_width: 'width',
      d_height: 'height'
    };
    Object.keys(map).forEach(id=>{
      const el = q(id);
      el.value = style[map[id]] ?? '';
      el.oninput = ()=> {
        const key = map[id];
        style[key] = (el.type === 'number') ? Number(el.value) : el.value;
        autoSavePreview();
      };
    });
  }

  // save/download functions
  function saveToLocal(){
    localStorage.setItem('rpg_overlay_data', JSON.stringify(heroes));
    localStorage.setItem('rpg_overlay_glossary', JSON.stringify(glossary));
    localStorage.setItem('rpg_overlay_style', JSON.stringify(style));
    alert('Сохранено в localStorage. Оверлей увидит изменения автоматически.');
  }
  q('saveHeroes').onclick = saveToLocal;
  q('downloadHeroes').onclick = ()=> download('heroes.json', heroes);
  q('downloadGloss').onclick = ()=> download('glossary.json', glossary);
  q('downloadStyle').onclick = ()=> download('style.json', style);
  q('saveGloss').onclick = saveToLocal;
  q('saveStyle').onclick = saveToLocal;

  q('clearLocal').onclick = ()=> { localStorage.removeItem('rpg_overlay_data'); localStorage.removeItem('rpg_overlay_glossary'); localStorage.removeItem('rpg_overlay_style'); alert('localStorage очищен'); };

  q('reloadViewer').onclick = ()=> { window.open('index.html','_blank'); };

  // preview
  function renderPreview(){
    miniPreview.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.display='grid';
    wrap.style.gridTemplateColumns='repeat(2,1fr)';
    wrap.style.gap='8px';
    const toRender = heroes.slice(0,4);
    toRender.forEach(h=>{
      const card = document.createElement('div');
      card.style.background='#070707';
      card.style.padding='8px';
      card.style.borderRadius='6px';
      card.style.border='1px solid #111';
      card.innerHTML = `<div style="height:80px;background-image:url('${h.portrait||''}');background-size:cover;background-position:center;border-radius:6px"></div>
        <div style="font-weight:700;color:${style.textColor||'#ff6a35'};margin-top:6px">${h.name||''}</div>
        <div style="color:#999">${h.race||''} · ${h.class||''}</div>
        <div style="display:flex;gap:6px;margin-top:6px">
          <div style="background:#111;padding:6px;border-radius:6px">HP: ${h.hp||0}</div>
          <div style="background:#111;padding:6px;border-radius:6px">БРН: ${h.brn||0}</div>
        </div>`;
      wrap.appendChild(card);
    });
    miniPreview.appendChild(wrap);
  }

  // auto save + preview
  function autoSavePreview(){
    // write to localStorage keys so viewer picks up
    localStorage.setItem('rpg_overlay_data', JSON.stringify(heroes));
    localStorage.setItem('rpg_overlay_glossary', JSON.stringify(glossary));
    localStorage.setItem('rpg_overlay_style', JSON.stringify(style));
    renderPreview();
  }

  // load initial
  await loadAll();
  renderHeroesEditor();
  renderGlossControls();
  bindDesign();
  renderPreview();

  // attach file load buttons
  q('loadSampleHeroes').onclick = async ()=>{
    const h = await fetchJSON('heroes.json');
    if(h) { heroes = h; renderHeroesEditor(); autoSavePreview(); alert('Загружен sample из heroes.json'); } else alert('Не найден heroes.json');
  };

})();
