const menuBtn = document.getElementById('menu-button');
const panel = document.getElementById('panel');
const heroesPanel = document.getElementById('heroes-panel');
const glossaryPanel = document.getElementById('glossary-panel');
const heroesBtn = document.getElementById('tab-heroes-btn');
const glossaryBtn = document.getElementById('tab-glossary-btn');
const glossaryList = document.getElementById('glossary-list');
const alphabetContainer = document.getElementById('alphabet');
const searchBox = document.getElementById('search-box');

menuBtn.addEventListener('click', () => {
  panel.classList.toggle('hidden');
  switchTab('heroes');
});

heroesBtn.addEventListener('click', () => switchTab('heroes'));
glossaryBtn.addEventListener('click', () => switchTab('glossary'));
searchBox.addEventListener('input', () => renderGlossaryList());

let glossaryData = {};

function switchTab(tab) {
  if (tab === 'heroes') {
    heroesPanel.classList.remove('hidden');
    glossaryPanel.classList.add('hidden');
    heroesBtn.classList.add('active');
    glossaryBtn.classList.remove('active');
    loadHeroes();
  } else {
    glossaryPanel.classList.remove('hidden');
    heroesPanel.classList.add('hidden');
    glossaryBtn.classList.add('active');
    heroesBtn.classList.remove('active');
    loadGlossary();
  }
}

function loadHeroes() {
  fetch('data/heroes.json')
    .then(res => res.json())
    .then(data => {
      heroesPanel.innerHTML = '';
      data.forEach(hero => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <h3>${hero.character} <small>(${hero.race} ${hero.class})</small></h3>
          <p>Участник: ${hero.player}</p>
          <img src="${hero.portrait}" alt="${hero.character}" style="max-width:100px;">
          <div>${Object.entries(hero.stats).map(([k, v]) => `<span>${k}: ${v}</span>`).join(', ')}</div>
        `;
        heroesPanel.appendChild(div);
      });
    });
}

function loadGlossary() {
  fetch('data/glossary.json')
    .then(res => res.json())
    .then(data => {
      glossaryData = data;
      renderAlphabet();
      renderGlossaryList();
    });
}

function renderAlphabet() {
  const letters = Object.keys(glossaryData);
  alphabetContainer.innerHTML = '';
  letters.forEach(letter => {
    const btn = document.createElement('button');
    btn.textContent = letter;
    btn.addEventListener('click', () => renderGlossaryList(letter));
    alphabetContainer.appendChild(btn);
  });
}

function renderGlossaryList(letterFilter) {
  const query = (searchBox.value || '').toLowerCase();
  glossaryList.innerHTML = '';

  const letters = letterFilter ? [letterFilter] : Object.keys(glossaryData);
  letters.forEach(letter => {
    glossaryData[letter].forEach(entry => {
      if (
        entry.term.toLowerCase().includes(query) ||
        entry.desc.toLowerCase().includes(query)
      ) {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `<strong>${entry.term}</strong><p>${entry.desc}</p>`;
        glossaryList.appendChild(div);
      }
    });
  });
}
