const menuBtn = document.getElementById('menu-button');
const panel = document.getElementById('panel');
const heroesPanel = document.getElementById('heroes-panel');
const glossaryPanel = document.getElementById('glossary-panel');
const heroesBtn = document.getElementById('tab-heroes-btn');
const glossaryBtn = document.getElementById('tab-glossary-btn');
const glossaryList = document.getElementById('glossary-list');
const alphabetContainer = document.getElementById('alphabet');
const searchBox = document.getElementById('search-box');

let glossaryData = {};

menuBtn.addEventListener('click', () => {
  panel.classList.toggle('hidden');
  switchTab('heroes');
});

heroesBtn.addEventListener('click', () => switchTab('heroes'));
glossaryBtn.addEventListener('click', () => switchTab('glossary'));
searchBox.addEventListener('input', () => renderGlossaryList());

function switchTab(tab) {
  if (tab === 'heroes') {
    heroesPanel.classList.remove('hidden');
    glossaryPanel.classList.add('hidden');
    heroesBtn.classList.add('active');
    glossaryBtn.classList.remove('active');
    loadHeroes();
  } else {
    heroesPanel.classList.add('hidden');
    glossaryPanel.classList.remove('hidden');
    glossaryBtn.classList.add('active');
    heroesBtn.classList.remove('active');
    loadGlossary();
  }
}

function loadHeroes() {
  fetch('data/heroes.json')
    .then(res => res.json())
    .then(heroes => {
      heroesPanel.innerHTML = '';
      heroes.forEach(hero => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = <h3>${hero.character} (${hero.race} ${hero.class})</h3>
          <p><strong>Участник:</strong> ${hero.player}</p>
          <img src="${hero.portrait}" alt="${hero.character}">
          <div class="stats">
            ${Object.entries(hero.stats).map(([k,v]) => `<div class="stat">${k}: ${v}</div>`).join('')}
          </div>
        `;
        heroesPanel.appendChild(card);
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
  const letters = Object.keys(glossaryData).sort();
  alphabetContainer.innerHTML = '';
  letters.forEach(letter => {
    const btn = document.createElement('button');
    btn.textContent = letter;
    btn.addEventListener('click', () => {
      renderGlossaryList(letter);
    });
    alphabetContainer.appendChild(btn);
  });
}

function renderGlossaryList(filterLetter = null) {
  const query = searchBox.value.toLowerCase();
  glossaryList.innerHTML = '';

  const letters = filterLetter ? [filterLetter] : Object.keys(glossaryData);

  letters.forEach(letter => {
    glossaryData[letter].forEach(entry => {
      if (
        query === '' ||
        entry.term.toLowerCase().includes(query) ||
        entry.desc.toLowerCase().includes(query)
      ) {
        const item = document.createElement('div');
        item.className = 'card';
        item.innerHTML = `<strong>${entry.term}</strong><p>${entry.desc}</p>`;
        glossaryList.appendChild(item);
      }
    });
  });
}
