// DOMенты
const heroesTab = document.getElementById('heroesTab');
const glossaryTab = document.getElementById('glossaryTab');
const heroesSection = document.getElementById('heroesSection');
const glossarySection = document.getElementById('glossarySection');

const heroesList = document.getElementById('heroesList');
const heroCard = document.getElementById('heroCard');

const alphabet = document.getElementById('alphabet');
const termsList = document.getElementById('termsList');
const searchInput = document.getElementById('searchInput');

const termModal = document.getElementById('termModal');
const termTitle = document.getElementById('termTitle');
const termDesc = document.getElementById('termDesc');
const termClose = document.getElementById('termClose');

let glossaryData = {};

// Переключение вкладок
heroesTab.onclick = () => setTab('heroes');
glossaryTab.onclick = () => setTab('glossary');
termClose.onclick = () => termModal.classList.add("hidden");

function setTab(tab) {
  const isHeroes = tab === 'heroes';
  heroesSection.classList.toggle('hidden', !isHeroes);
  glossarySection.classList.toggle('hidden', isHeroes);
  heroesTab.classList.toggle('active', isHeroes);
  glossaryTab.classList.toggle('active', !isHeroes);
}

// Загрузка героев
fetch('data/heroes.json')
  .then(res => res.json())
  .then(data => {
    data.forEach(hero => {
      const btn = document.createElement('button');
      btn.textContent = hero.name;
      btn.onclick = () => showHero(hero);
      heroesList.appendChild(btn);
    });
  });

function showHero(hero) {
  heroCard.innerHTML = `
   -left">
      <div class="hero-name">${hero.name}</div>
      <div class="portrait" style="background-image: url('${hero.portrait}')"></div>
    </div>
    <div class="hero-right">
      <div class="stat-row">❤ ${hero.hp} 🛡 ${hero.brn} ⬆ ${hero.urv}</div>
      <div><b>Раса:</b> ${hero.race}</div>
      <div><b>Класс:</b> ${hero.class}</div>
      <div class="attrs">
        <div>СИЛ: ${hero.stats.СИЛ}</div>
        <div>ЛОВ: ${hero.stats.ЛОВ}</div>
        <div>ВЫН: ${hero.stats.ВЫН}</div>
        <div>ИНТ: ${hero.stats.ИНТ}</div>
        <div>МУД: ${hero.stats.МУД}</div>
        <div>ХАР: ${hero.stats.ХАР}</div>
      </div>
    </div>
  `;
  heroCard.classList.remove('hidden');
}

// Загрузка глоссария
fetch('data/glossary.json')
  .then(res => res.json())
  .then(data => {
    glossaryData = data;
    renderAlphabet();
    renderGlossaryList();
  });

function renderAlphabet() {
  alphabet.innerHTML = '';
  Object.keys(glossaryData).forEach(letter => {
    const btn = document.createElement('button');
    btn.textContent = letter;
    btn.onclick = () => renderGlossaryList(letter);
    alphabet.appendChild(btn);
  });
}

function renderGlossaryList(letterFilter) {
  termsList.innerHTML = '';
  const query = searchInput.value.toLowerCase();
  const letters = letterFilter ? [letterFilter] : Object.keys(glossaryData);

  letters.forEach(letter => {
    glossaryData[letter].forEach(entry => {
      if (
        !query ||
        entry.term.toLowerCase().includes(query) ||
        entry.desc.toLowerCase().includes(query)
      ) {
        const div = document.createElement('div');
        div.textContent = entry.term;
        div.onclick = () => openTerm(entry);
        termsList.appendChild(div);
      }
    });
  });
}

function openTerm(entry) {
  termTitle.textContent = entry.term;
  termDesc.textContent = entry.desc;
  termModal.classList.remove("hidden");
}

searchInput.addEventListener("input", () => renderGlossaryList());
