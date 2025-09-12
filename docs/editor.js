(async function(){

// Defaults
const defaultHeroes = [
  {name:"Фогги", race:"Полурослик", class:"Плут", portrait:"assets/Фогги.png", stats:{"СИЛ":"∞","ЛОВ":"∞","ВЫН":"∞","ИНТ":"∞","МДР":"∞","ХАР":"∞"}},
  {name:"Оскар", race:"Дварф", class:"Варвар", portrait:"assets/Оскар.png", stats:{"СИЛ":"∞","ЛОВ":"∞","ВЫН":"∞","ИНТ":"∞","МДР":"∞","ХАР":"∞"}},
  {name:"Орелл", race:"Человек", class:"Бард", portrait:"assets/Орелл.png", stats:{"СИЛ":"∞","ЛОВ":"∞","ВЫН":"∞","ИНТ":"∞","МДР":"∞","ХАР":"∞"}},
  {name:"Рэмбэл", race:"Человек", class:"Жреч", portrait:"assets/Рэмбэл.png", stats:{"СИЛ":"∞","ЛОВ":"∞","ВЫН":"∞","ИНТ":"∞","МДР":"∞","ХАР":"∞"}}
];

const letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
let heroes = await fetchJSON('data/heroes.json') || defaultHeroes;
let glossary = await fetchJSON('data/glossary.json') || letters.reduce((a,l)=>({...a,[l]:[]}),{});

// Fetch helper
async function fetchJSON(path){
  try{ const r = await fetch(path,{cache:'no-store'}); if(r.ok) return await r.json(); } catch(e){ return null; }
}

// Tabs
document.querySelectorAll('.tab').forEach(t=>{
  t.onclick = ()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('tabHeroes').style.display = t.dataset.tab==='heroes'?'':'none';
    document.getElementById('tabGlossary').style.display = t.dataset.tab==='glossary'?'':'none';
  }
});

// --- Heroes ---
const charsContainer = document.getElementById('charsContainer');

function escapeHtml(s){ return (s||'').toString().replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

function renderHeroes(){
  charsContainer.innerHTML='';
  heroes.forEach((c,i)=>{
    const div = document.createElement('div'); div.className='char';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong>Колонка ${i+1}</strong>
        <div><button class="clearChar" data-i="${i}">Очистить</button></div>
      </div>
      <label>Имя</label><input class="c-name" data-i="${i}" value="${escapeHtml(c.name)}">
      <label>Раса</label><input class="c-race" data-i="${i}" value="${escapeHtml(c.race)}">
      <label>Класс</label><input class="c-class" data-i="${i}" value="${escapeHtml(c.class)}">
      <label>Портрет (URL)</label><input class="c-portrait" data-i="${i}" value="${escapeHtml(c.portrait)}">
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
        ${['СИЛ','ЛОВ','ВЫН','ИНТ','МДР','ХАР'].map(stat=>`
          <div style="flex:1">
            <label>${stat}</label>
            <input class="c-stat" data-i="${i}" data-stat="${stat}" value="${escapeHtml(c.stats[stat])}">
          </div>`).join('')}
      </div>
    `;
    charsContainer.appendChild(div);
  });
  attachHeroListeners();
}

function attachHeroListeners(){
  document.querySelectorAll('.c-name,.c-race,.c-class,.c-portrait,.c-stat').forEach(inp=>{
    inp.oninput = ()=>{
      const i = +inp.dataset.i;
      if(inp.classList.contains('c-name')) heroes[i].name = inp.value;
      if(inp.classList.contains('c-race')) heroes[i].race = inp.value;
      if(inp.classList.contains('c-class')) heroes[i].class = inp.value;
      if(inp.classList.contains('c-portrait')) heroes[i].portrait = inp.value;
      if(inp.classList.contains('c-stat')) heroes[i].stats[inp.dataset.stat] = inp.value;
    };
  });
  document.querySelectorAll('.clearChar').forEach(b=>{
    b.onclick = ()=>{
      const i = +b.dataset.i;
      heroes[i] = {name:'', race:'', class:'', portrait:'', stats:{"СИЛ":"","ЛОВ":"","ВЫН":"","ИНТ":"","МДР":"","ХАР":""}};
      renderHeroes();
    };
  });
}

// --- Glossary ---
const glossLetter = document.getElementById('glossLetter');
letters.forEach(l=>{ const o=document.createElement('option'); o.value=l; o.textContent=l; glossLetter.appendChild(o); });

const glossList = document.getElementById('glossList');

function renderGloss(){
  const L = glossLetter.value || letters[0];
  const list = glossary[L] || [];
  glossList.innerHTML='';
  list.forEach((it,idx)=>{
    const div = document.createElement('div'); div.style.display='flex'; div.style.justifyContent='space-between'; div.style.padding='6px'; div.style.borderBottom='1px solid #111';
    div.innerHTML = `<div><strong>${escapeHtml(it.term)}</strong><div class="small">${escapeHtml(it.desc)}</div></div>
      <div style="display:flex;gap:6px">
        <button class="editTerm" data-i="${idx}">✎</button>
        <button class="delTerm" data-i="${idx}">🗑</button>
      </div>`;
    glossList.appendChild(div);
  });
  attachGlossListeners();
}

function attachGlossListeners(){
  document.querySelectorAll('.delTerm').forEach(b=>{
    b.onclick = ()=>{
      const i=+b.dataset.i, L=glossLetter.value;
      glossary[L].splice(i,1); renderGloss();
    }
  });
  document.querySelectorAll('.editTerm').forEach(b=>{
    b.onclick = ()=>{
      const i=+b.dataset.i,L=glossLetter.value;
      const it=glossary[L][i];
      const t=prompt('Термин', it.term); if(t===null) return;
      const d=prompt('Описание', it.desc); if(d===null) return;
      it.term=t; it.desc=d; renderGloss();
    }
  });
}

document.getElementById('addTerm').onclick = ()=>{
  const t=document.getElementById('newTerm').value.trim();
  const d=document.getElementById('newDesc').value.trim();
  if(!t) return alert('Введите термин');
  const L = glossLetter.value;
  if(!glossary[L]) glossary[L]=[];
  glossary[L].push({term:t, desc:d});
  document.getElementById('newTerm').value=''; document.getElementById('newDesc').value='';
  renderGloss();
};

glossLetter.onchange=renderGloss;

// --- Buttons ---
document.getElementById('downloadHeroes').onclick = ()=>download('heroes.json', heroes);
document.getElementById('downloadGloss').onclick = ()=>download('glossary.json', glossary);
document.getElementById('loadSampleHeroes').onclick = async ()=>{
  const r=await fetch('data/heroes.json',{cache:'no-store'});
  if(r.ok){ heroes = await r.json(); renderHeroes(); } else alert('Не найден data.json');
};

// Initial render
renderHeroes();
renderGloss();

})();
