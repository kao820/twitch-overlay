const charsContainer = document.getElementById('charsContainer');
const glossLetter = document.getElementById('glossLetter');
const glossList = document.getElementById('glossList');
const downloadHeroesBtn = document.getElementById('downloadHeroes');
const downloadGlossBtn = document.getElementById('downloadGloss');

// Статистика персонажей: МУД вместо МДР
const statsFields = ['СИЛ','ЛОВ','ВЫН','ИНТ','МУД','ХАР'];

// --- Данные ---
let heroes = [];
let glossary = {};
const letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');

// --- Загрузка данных из файлов ---
async function loadJSON(path){
  try{
    const r = await fetch(path, {cache:'no-store'});
    if(r.ok) return await r.json();
  }catch(e){}
  return null;
}

(async function init(){
  heroes = await loadJSON('data/heroes.json') || [];
  glossary = await loadJSON('data/glossary.json') || {};
  renderHeroes();
  populateGlossLetters();
  renderGloss();
})();

// --- Хелперы ---
function escapeHtml(s){ 
  return (s||'').toString().replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); 
}

function downloadJSON(name, obj){
  const blob = new Blob([JSON.stringify(obj,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

// --- Рендер персонажей ---
function renderHeroes(){
  charsContainer.innerHTML='';
  for(let i=0;i<4;i++){
    const c = heroes[i] || {name:'', race:'', class:'', portrait:'', stats:{}};
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
        ${statsFields.map(stat=>`
          <div style="flex:1">
            <label>${stat}</label>
            <input class="c-stat" data-i="${i}" data-stat="${stat}" value="${escapeHtml(c.stats[stat]||'')}">
          </div>`).join('')}
      </div>
    `;
    charsContainer.appendChild(div);
  }
  attachHeroListeners();
}

function attachHeroListeners(){
  document.querySelectorAll('.c-name,.c-race,.c-class,.c-portrait,.c-stat').forEach(inp=>{
    inp.oninput = ()=>{
      const i = +inp.dataset.i;
      if(!heroes[i]) heroes[i] = {name:'', race:'', class:'', portrait:'', stats:{}};
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
      heroes[i] = {name:'', race:'', class:'', portrait:'', stats:{}};
      renderHeroes();
    };
  });
}

// --- Рендер глоссария ---
function populateGlossLetters(){
  glossLetter.innerHTML='';
  letters.forEach(l=>{
    const opt = document.createElement('option'); opt.value=l; opt.textContent=l;
    glossLetter.appendChild(opt);
  });
}

function renderGloss(){
  if(!glossLetter) return;
  const L = glossLetter.value || letters[0];
  const list = glossary[L] || [];
  if(!glossList) return;
  glossList.innerHTML='';
  list.forEach((it, idx)=>{
    const div = document.createElement('div');
    div.style.display='flex'; div.style.justifyContent='space-between'; div.style.padding='6px'; div.style.borderBottom='1px solid #111';
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
  if(!glossList) return;
  document.querySelectorAll('.delTerm').forEach(b=>{
    b.onclick = ()=>{
      const i = +b.dataset.i; const L = glossLetter.value;
      glossary[L].splice(i,1); renderGloss();
    };
  });
  document.querySelectorAll('.editTerm').forEach(b=>{
    b.onclick = ()=>{
      const i = +b.dataset.i; const L = glossLetter.value;
      const it = glossary[L][i];
      const t = prompt('Термин', it.term); if(t===null) return;
      const d = prompt('Описание', it.desc); if(d===null) return;
      it.term=t; it.desc=d; renderGloss();
    };
  });
}

// --- Кнопки ---
const addTermBtn = document.getElementById('addTerm');
if(addTermBtn){
  addTermBtn.onclick = ()=>{
    const t = document.getElementById('newTerm').value.trim();
    const d = document.getElementById('newDesc').value.trim();
    if(!t) return alert('Введите термин');
    const L = glossLetter.value;
    if(!glossary[L]) glossary[L]=[];
    glossary[L].push({term:t,desc:d});
    document.getElementById('newTerm').value=''; 
    document.getElementById('newDesc').value='';
    renderGloss();
  };
}

if(downloadHeroesBtn) downloadHeroesBtn.onclick = ()=> downloadJSON('heroes.json', heroes);
if(downloadGlossBtn) downloadGlossBtn.onclick = ()=> downloadJSON('glossary.json', glossary);

// --- Переключение вкладок ---
document.querySelectorAll('.tab').forEach(tab=>{
  tab.onclick = ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const t = tab.dataset.tab;
    document.getElementById('tabHeroes').style.display = t==='heroes' ? '' : 'none';
    document.getElementById('tabGlossary').style.display = t==='glossary' ? '' : 'none';
  };
});
