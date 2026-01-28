// --- Элементы DOM ---
const charsContainer = document.getElementById('charsContainer');
const glossLetter    = document.getElementById('glossLetter');
const glossList      = document.getElementById('glossList');
const downloadHeroesBtn = document.getElementById('downloadHeroes');
const downloadGlossBtn  = document.getElementById('downloadGloss');
const themeToggleBtn    = document.getElementById('themeToggle');
const loadSampleHeroesBtn = document.getElementById('loadSampleHeroes');

const statsFields = ['СИЛ','ЛОВ','ВЫН','ИНТ','МУД','ХАР'];

let heroes  = [];
let glossary = {};
const letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');

async function loadJSON(path){
  try{
    const r = await fetch(path, {cache:'no-store'});
    if(r.ok) return await r.json();
  }catch(e){}
  return null;
}

(async function init(){
  heroes  = await loadJSON('data/heroes.json')   || [];
  glossary = await loadJSON('data/glossary.json') || {};
  // Не фильтруем героев: отображаем все заведённые карточки.
  // heroes = heroes.filter(h => h.name && h.name.trim() !== '');
  renderHeroes();
  populateGlossLetters();
  renderGloss();
  applyTheme();
})();

function applyTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggleBtn.textContent = '☀️';
  } else {
    document.body.classList.remove('light-theme');
    themeToggleBtn.textContent = '🌙';
  }
}

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

function escapeHtml(s){ /* ... */ }
function downloadJSON(name, obj){ /* ... */ }
function sortGlossaryArray(arr){ /* ... */ }

// --- Герои ---
function renderHeroes(){
  charsContainer.innerHTML = '';
  const count = Math.max(4, heroes.length);
  for (let i = 0; i < count; i++) {
    const c = heroes[i] || { name: '', race: '', class: '', portrait: '', stats: {} };
    const div = document.createElement('div');
    div.className='char';
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

function attachHeroListeners(){ /* ... */ }

// --- Словарь, кнопки, вкладки и прочие функции остаются без изменений ---
