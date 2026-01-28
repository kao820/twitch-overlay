// --- Элементы DOM ---
const charsContainer = document.getElementById('charsContainer');
const glossLetter    = document.getElementById('glossLetter');
const glossList      = document.getElementById('glossList');
const downloadHeroesBtn = document.getElementById('downloadHeroes');
const downloadGlossBtn  = document.getElementById('downloadGloss');
const themeToggleBtn    = document.getElementById('themeToggle');
const loadSampleHeroesBtn = document.getElementById('loadSampleHeroes');

// Порядок полей характеристик
const statsFields = ['СИЛ','ЛОВ','ВЫН','ИНТ','МУД','ХАР'];

// --- Данные ---
let heroes  = [];
let glossary = {};
const letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');

// --- Загрузка JSON ---
async function loadJSON(path){
  try {
    const r = await fetch(path, { cache: 'no-store' });
    if(r.ok) return await r.json();
  } catch(e) {}
  return null;
}

// --- Инициализация ---
(async function init(){
  heroes   = await loadJSON('data/heroes.json')   || [];
  glossary = await loadJSON('data/glossary.json') || {};
  // Не фильтруем героев: отображаем все заведённые карточки.
  // heroes = heroes.filter(h => h.name && h.name.trim() !== '');
  renderHeroes();
  populateGlossLetters();
  renderGloss();
  applyTheme();
})();

// --- Работа с темой (светлая/тёмная) ---
function applyTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
  } else {
    document.body.classList.remove('light-theme');
    if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
  }
}

if (themeToggleBtn) {
  themeToggleBtn.onclick = () => {
    const isLight = document.body.classList.contains('light-theme');
    if (isLight) {
      document.body.classList.remove('light-theme');
      themeToggleBtn.textContent = '🌙';
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-theme');
      themeToggleBtn.textContent = '☀️';
      localStorage.setItem('theme', 'light');
    }
  };
}

// --- Вспомогательные функции ---
function escapeHtml(s){ 
  return (s || '').toString()
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;');
}

function downloadJSON(name, obj){
  const blob = new Blob([JSON.stringify(obj,null,2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

// --- Сортировка глоссария ---
function sortGlossaryArray(arr){
  arr.sort((a,b) => {
    const termA = a.term.toUpperCase();
    const termB = b.term.toUpperCase();
    const len = Math.max(termA.length, termB.length);
    for(let i=0;i<len;i++){
      const chA = termA[i] || '';
      const chB = termB[i] || '';
      const idxA = letters.indexOf(chA);
      const idxB = letters.indexOf(chB);
      if(idxA!==idxB) return idxA - idxB;
    }
    return 0;
  });
}

// --- Герои ---
function renderHeroes(){
  charsContainer.innerHTML = '';
  // Выводим всех заведённых героев, но минимум четыре карточки.
  const count = Math.max(4, heroes.length);
  for (let i = 0; i < count; i++) {
    const c = heroes[i] || { name:'', race:'', class:'', portrait:'', stats:{} };
    const div = document.createElement('div');
    div.className = 'char';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong>Персонаж ${i+1}</strong>
        <div><button class="clearChar" data-i="${i}">Очистить</button></div>
      </div>
      <label>Имя</label><input class="c-name" data-i="${i}" value="${escapeHtml(c.name)}">
      <label>Раса</label><input class="c-race" data-i="${i}" value="${escapeHtml(c.race)}">
      <label>Класс</label><input class="c-class" data-i="${i}" value="${escapeHtml(c.class)}">
      <label>Портрет (URL)</label><input class="c-portrait" data-i="${i}" value="${escapeHtml(c.portrait)}">
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
        ${statsFields.map(stat => `
          <div style="flex:1">
            <label>${stat}</label>
            <input class="c-stat" data-i="${i}" data-stat="${stat}" value="${escapeHtml(c.stats[stat] || '')}">
          </div>`).join('')}
      </div>
    `;
    charsContainer.appendChild(div);
  }
  attachHeroListeners();
}

function attachHeroListeners(){
  document.querySelectorAll('.c-name,.c-race,.c-class,.c-portrait,.c-stat').forEach(inp => {
    inp.oninput = () => {
      const i = +inp.dataset.i;
      if(!heroes[i]) heroes[i] = { name:'', race:'', class:'', portrait:'', stats:{} };
      if(inp.classList.contains('c-name'))     heroes[i].name     = inp.value;
      if(inp.classList.contains('c-race'))     heroes[i].race     = inp.value;
      if(inp.classList.contains('c-class'))    heroes[i].class    = inp.value;
      if(inp.classList.contains('c-portrait')) heroes[i].portrait = inp.value;
      if(inp.classList.contains('c-stat'))     heroes[i].stats[inp.dataset.stat] = inp.value;
    };
  });
  document.querySelectorAll('.clearChar').forEach(b => {
    b.onclick = () => {
      const i = +b.dataset.i;
      heroes[i] = { name:'', race:'', class:'', portrait:'', stats:{} };
      renderHeroes();
    };
  });
}

// --- Словарь ---
function populateGlossLetters(){
  glossLetter.innerHTML = '';
  letters.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = l;
    glossLetter.appendChild(opt);
  });
  glossLetter.onchange = renderGloss;
}

function renderGloss(){
  const L    = glossLetter.value || letters[0];
  const list = (glossary[L] || []).slice();
  sortGlossaryArray(list);
  glossList.innerHTML = '';
  list.forEach((it, idx) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div>
        <strong>${escapeHtml(it.term)}</strong>
        <div class="small">${escapeHtml(it.desc)}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="editTerm" data-i="${idx}">✎</button>
        <button class="delTerm" data-i="${idx}">🗑</button>
      </div>`;
    glossList.appendChild(div);
  });
  attachGlossListeners();
}

function attachGlossListeners(){
  document.querySelectorAll('.delTerm').forEach(b => {
    b.onclick = () => {
      const i = +b.dataset.i;
      const L = glossLetter.value;
      glossary[L].splice(i, 1);
      sortGlossaryArray(glossary[L]);
      renderGloss();
    };
  });
  document.querySelectorAll('.editTerm').forEach(b => {
    b.onclick = () => {
      const i = +b.dataset.i;
      const L = glossLetter.value;
      const it = glossary[L][i];
      const t = prompt('Термин', it.term); if(t === null) return;
      const d = prompt('Описание', it.desc); if(d === null) return;
      it.term = t; it.desc = d;
      sortGlossaryArray(glossary[L]);
      renderGloss();
    };
  });
}

// --- Кнопки ---
document.getElementById('addTerm').onclick = () => {
  const t = document.getElementById('newTerm').value.trim();
  const d = document.getElementById('newDesc').value.trim();
  if(!t) return alert('Введите термин');
  const L = glossLetter.value;
  if(!glossary[L]) glossary[L] = [];
  glossary[L].push({ term:t, desc:d });
  sortGlossaryArray(glossary[L]);
  document.getElementById('newTerm').value = '';
  document.getElementById('newDesc').value = '';
  renderGloss();
};

downloadHeroesBtn.onclick = () => downloadJSON('heroes.json', heroes);

// Кнопка добавления персонажа
const addHeroBtn = document.getElementById('addHero');
if (addHeroBtn) {
  addHeroBtn.onclick = () => {
    heroes.push({ name:'', race:'', class:'', portrait:'', stats:{} });
    renderHeroes();
  };
}

// Скачивание глоссария по алфавиту
downloadGlossBtn.onclick = () => {
  const sortedGlossary = {};
  letters.forEach(L => {
    if(glossary[L] && glossary[L].length) {
      const arr = glossary[L].slice();
      sortGlossaryArray(arr);
      sortedGlossary[L] = arr;
    }
  });
  downloadJSON('glossary.json', sortedGlossary);
};

// --- Вкладки ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    document.getElementById('tabHeroes').style.display   = (target === 'heroes')   ? '' : 'none';
    document.getElementById('tabGlossary').style.display = (target === 'glossary') ? '' : 'none';
  });
});

// --- Кнопка очистки (loadSampleHeroes) ---
if (loadSampleHeroesBtn) {
  loadSampleHeroesBtn.onclick = () => {
    heroes = [];
    for (let i=0; i<4; i++) {
      heroes.push({ name:'', race:'', class:'', portrait:'', stats:{} });
    }
    renderHeroes();
  };
}
