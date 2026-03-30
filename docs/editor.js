/*
 * Скрипт для административной панели LRS Overlay.
 * Здесь реализована загрузка данных о героях и терминов, переключение
 * светлой/тёмной темы, вкладки для героев и словаря, а также формы
 * редактирования/создания. Всё максимально приближено к стилистике
 * основного оверлея.
 */

// --- DOM элементы ---
const body = document.body;
const themeToggleBtn = document.getElementById('themeToggle');

// Tabs
const tabs = document.querySelectorAll('.tab');
const tabContents = {
  heroes: document.getElementById('tabHeroes'),
  glossary: document.getElementById('tabGlossary'),
};

// Heroes elements
const heroesListEl = document.getElementById('heroesList');
const addHeroBtn = document.getElementById('addHero');
const downloadHeroesBtn = document.getElementById('downloadHeroes');
const heroFormEl = document.getElementById('heroForm');
const heroFormTitleEl = document.getElementById('heroFormTitle');
const closeHeroFormBtn = document.getElementById('closeHeroForm');
const applyHeroBtn = document.getElementById('applyHero');

// Hero form fields
const heroNameInput = document.getElementById('heroName');
const heroRaceInput = document.getElementById('heroRace');
const heroClassInput = document.getElementById('heroClass');
const heroArchetypeInput = document.getElementById('heroArchetype');
const heroPortraitInput = document.getElementById('heroPortrait');
const heroLevelInput = document.getElementById('heroLevel');
const heroHPInput = document.getElementById('heroHP');
const heroArmorInput = document.getElementById('heroArmor');
// Stats inputs
const statInputs = {
  'СИЛ': document.getElementById('statСИЛ'),
  'ИНТ': document.getElementById('statИНТ'),
  'ЛОВ': document.getElementById('statЛОВ'),
  'МУД': document.getElementById('statМУД'),
  'ВЫН': document.getElementById('statВЫН'),
  'ХАР': document.getElementById('statХАР'),
};
const statusButtons = heroFormEl.querySelectorAll('.status-btn');

// Glossary elements
const glossaryLettersEl = document.getElementById('glossaryLetters');
const glossaryListEl = document.getElementById('glossaryList');
const glossTermInput = document.getElementById('glossTerm');
const glossDescInput = document.getElementById('glossDesc');
// Glossary action buttons
const addTermBtn = document.getElementById('addTermBtn');
const saveTermBtn = document.getElementById('saveTermBtn');
const cancelTermBtn = document.getElementById('cancelTermBtn');
const downloadGlossaryBtn = document.getElementById('downloadGlossary');

// --- Данные ---
let heroes = [];
let glossary = {};
let currentHeroIndex = null;
let currentHeroStatus = 'alive';
let currentGlossaryLetter = '';
let currentGlossaryIndex = null;

// --- Инициализация ---
document.addEventListener('DOMContentLoaded', async () => {
  // Применяем тему из локального хранилища
  applyTheme();
  // Загрузка данных
  heroes = (await loadJSON('heroes.json')) || [];
  glossary = (await loadJSON('glossary.json')) || {};
  renderHeroesList();
  renderGlossaryLetters();
  renderGlossaryList();
  // Устанавливаем состояние кнопок словаря (только "Добавить термин" по умолчанию)
  updateGlossaryActionButtons();
  bindEvents();
});

// --- Утилиты ---
async function loadJSON(path) {
  const base = window.location.hostname.includes('ext-twitch.tv')
    ? 'https://kao820.github.io/twitch-overlay/data/'
    : 'data/';
  try {
    const res = await fetch(`${base}${path}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

function downloadJSON(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function applyTheme() {
  const saved = localStorage.getItem('adminTheme') || 'dark';
  body.classList.toggle('light-theme', saved === 'light');
  themeToggleBtn.textContent = saved === 'light' ? '☀️' : '🌙';
}

function toggleTheme() {
  const isLight = body.classList.contains('light-theme');
  const next = isLight ? 'dark' : 'light';
  localStorage.setItem('adminTheme', next);
  applyTheme();
}

// --- Отрисовка ---
function renderHeroesList() {
  heroesListEl.innerHTML = '';
  heroes
    .map((hero, idx) => ({ hero, idx }))
    .sort((a, b) => (a.hero.name || '').localeCompare(b.hero.name || '', 'ru-RU'))
    .forEach(({ hero, idx }) => {
      const btn = document.createElement('button');
      btn.className = 'hero-btn';
      btn.textContent = hero.name || '';
      btn.dataset.index = idx;
      heroesListEl.appendChild(btn);
    });
}

function renderGlossaryLetters() {
  glossaryLettersEl.innerHTML = '';
  const letters = Object.keys(glossary)
    .sort((a, b) => a.localeCompare(b, 'ru-RU'));
  const allBtn = document.createElement('button');
  allBtn.textContent = 'Все';
  allBtn.dataset.letter = '';
  allBtn.className = currentGlossaryLetter === '' ? 'active' : '';
  glossaryLettersEl.appendChild(allBtn);
  letters.forEach((letter) => {
    const btn = document.createElement('button');
    btn.textContent = letter;
    btn.dataset.letter = letter;
    if (letter === currentGlossaryLetter) btn.classList.add('active');
    glossaryLettersEl.appendChild(btn);
  });
}

function renderGlossaryList() {
  glossaryListEl.innerHTML = '';
  let entries = [];
  const letters = Object.keys(glossary).sort((a, b) => a.localeCompare(b, 'ru-RU'));
  letters.forEach((letter) => {
    if (currentGlossaryLetter && letter !== currentGlossaryLetter) return;
    const arr = glossary[letter] || [];
    arr.forEach((item, idx) => {
      entries.push({ letter, index: idx, term: item.term || '' });
    });
  });
  if (!currentGlossaryLetter) {
    entries.sort((a, b) => a.term.localeCompare(b.term, 'ru-RU'));
  }
  entries.forEach(({ letter, index, term }) => {
    const btn = document.createElement('button');
    btn.className = 'glossary-term-btn';
    btn.textContent = term;
    btn.dataset.letter = letter;
    btn.dataset.index = index;
    glossaryListEl.appendChild(btn);
  });
}

// --- Обработчики ---
function bindEvents() {
  themeToggleBtn.addEventListener('click', toggleTheme);

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      Object.keys(tabContents).forEach((k) => {
        tabContents[k].classList.toggle('hidden', k !== target);
      });
    });
  });

  heroesListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button.hero-btn');
    if (!btn) return;
    const idx = parseInt(btn.dataset.index, 10);
    if (!isNaN(idx)) {
      openHeroForm(idx);
    }
  });

  addHeroBtn.addEventListener('click', () => {
    openHeroForm(null);
  });

  downloadHeroesBtn.addEventListener('click', () => {
    downloadJSON('heroes.json', heroes);
  });

  closeHeroFormBtn.addEventListener('click', () => {
    closeHeroForm();
  });

  statusButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      statusButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentHeroStatus = btn.dataset.status;
    });
  });

  applyHeroBtn.addEventListener('click', () => {
    saveHero();
  });

  glossaryLettersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const letter = btn.dataset.letter;
    currentGlossaryLetter = letter;
    currentGlossaryIndex = null;
    renderGlossaryLetters();
    renderGlossaryList();
    glossTermInput.value = '';
    glossDescInput.value = '';
    updateGlossaryActionButtons();
  });

  glossaryListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button.glossary-term-btn');
    if (!btn) return;
    const letter = btn.dataset.letter;
    const index = parseInt(btn.dataset.index, 10);
    openGlossaryTerm(letter, index);
  });

  // Добавить/сохранить термин
  addTermBtn.addEventListener('click', () => {
    const termFilled = glossTermInput.value && glossTermInput.value.trim();
    if (termFilled) {
      saveGlossaryTerm();
    } else {
      currentGlossaryIndex = null;
      glossTermInput.value = '';
      glossDescInput.value = '';
      updateGlossaryActionButtons();
    }
  });

  // Сохранить существующий термин
  saveTermBtn.addEventListener('click', () => {
    saveGlossaryTerm();
  });

  // Отмена редактирования
  cancelTermBtn.addEventListener('click', () => {
    currentGlossaryIndex = null;
    glossTermInput.value = '';
    glossDescInput.value = '';
    updateGlossaryActionButtons();
  });

  downloadGlossaryBtn.addEventListener('click', () => {
    downloadJSON('glossary.json', glossary);
  });
}

// --- Герои: открытие формы ---
function openHeroForm(index) {
  currentHeroIndex = index;
  const isNew = index === null || index === undefined;
  heroFormTitleEl.textContent = isNew ? 'Новый герой' : 'Редактировать героя';
  if (isNew) {
    heroNameInput.value = '';
    heroRaceInput.value = '';
    heroClassInput.value = '';
    heroArchetypeInput.value = '';
    heroPortraitInput.value = '';
    heroLevelInput.value = '';
    heroHPInput.value = '';
    heroArmorInput.value = '';
    Object.keys(statInputs).forEach((k) => (statInputs[k].value = ''));
    currentHeroStatus = 'alive';
  } else {
    const h = heroes[index];
    heroNameInput.value = h.name || '';
    heroRaceInput.value = h.race || '';
    heroClassInput.value = h.class || '';
    heroArchetypeInput.value = h.archetype || '';
    heroPortraitInput.value = h.portrait || '';
    heroLevelInput.value = h.urv != null ? h.urv : '';
    heroHPInput.value = h.hp != null ? h.hp : '';
    heroArmorInput.value = h.brn != null ? h.brn : '';
    Object.keys(statInputs).forEach((k) => {
      statInputs[k].value = h.stats && h.stats[k] != null ? h.stats[k] : '';
    });
    currentHeroStatus = h.status || 'alive';
  }
  statusButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.status === currentHeroStatus);
  });
  heroFormEl.classList.remove('hidden');
  heroFormEl.setAttribute('aria-hidden', 'false');
}

function closeHeroForm() {
  heroFormEl.classList.add('hidden');
  heroFormEl.setAttribute('aria-hidden', 'true');
}

// --- Герои: сохранение ---
function saveHero() {
  const name = heroNameInput.value.trim();
  if (!name) {
    alert('Имя героя не может быть пустым');
    return;
  }
  const newHero = {
    name,
    status: currentHeroStatus || 'alive',
    race: heroRaceInput.value.trim(),
    class: heroClassInput.value.trim(),
    archetype: heroArchetypeInput.value.trim(),
    portrait: heroPortraitInput.value.trim(),
    urv: parseInt(heroLevelInput.value, 10) || 0,
    hp: parseInt(heroHPInput.value, 10) || 0,
    brn: parseInt(heroArmorInput.value, 10) || 0,
    stats: {},
  };
  Object.keys(statInputs).forEach((k) => {
    const v = parseInt(statInputs[k].value, 10);
    newHero.stats[k] = isNaN(v) ? 0 : v;
  });
  if (currentHeroIndex === null || currentHeroIndex === undefined) {
    heroes.push(newHero);
  } else {
    heroes[currentHeroIndex] = newHero;
  }
  renderHeroesList();
  closeHeroForm();
}

// --- Glossary: открытие термина ---
function openGlossaryTerm(letter, index) {
  currentGlossaryLetter = letter;
  currentGlossaryIndex = index;
  renderGlossaryLetters();
  renderGlossaryList();
  const entry = (glossary[letter] || [])[index];
  if (entry) {
    glossTermInput.value = entry.term || '';
    glossDescInput.value = entry.desc || '';
  }
  updateGlossaryActionButtons();
}

// --- Glossary: сохранение ---
function saveGlossaryTerm() {
  const letter = currentGlossaryLetter || '';
  if (!letter) {
    alert('Выберите букву для термина.');
    return;
  }
  const term = glossTermInput.value.trim();
  const desc = glossDescInput.value.trim();
  if (!term) {
    alert('Термин не может быть пустым');
    return;
  }
  if (!glossary[letter]) glossary[letter] = [];
  if (currentGlossaryIndex === null || currentGlossaryIndex === undefined) {
    glossary[letter].push({ term, desc });
  } else {
    glossary[letter][currentGlossaryIndex] = { term, desc };
  }
  glossary[letter].sort((a, b) => (a.term || '').localeCompare(b.term || '', 'ru-RU'));
  renderGlossaryList();
  currentGlossaryIndex = null;
  glossTermInput.value = '';
  glossDescInput.value = '';
  updateGlossaryActionButtons();
}

// --- Glossary: обновление состояния кнопок ---
function updateGlossaryActionButtons() {
  const hasSelection = currentGlossaryIndex !== null && currentGlossaryIndex !== undefined;
  if (addTermBtn) addTermBtn.classList.toggle('hidden', hasSelection);
  if (saveTermBtn) saveTermBtn.classList.toggle('hidden', !hasSelection);
  if (cancelTermBtn) cancelTermBtn.classList.toggle('hidden', !hasSelection);
}
