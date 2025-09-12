const heroesTab = document.getElementById("heroesTab");
const glossaryTab = document.getElementById("glossaryTab");

const heroesSection = document.getElementById("heroesSection");
const glossarySection = document.getElementById("glossarySection");

const heroesList = document.getElementById("heroesList");
const heroCard = document.getElementById("heroCard");

const alphabet = document.getElementById("alphabet");
const termsList = document.getElementById("termsList");
const searchInput = document.getElementById("searchInput");

const termModal = document.getElementById("termModal");
const termTitle = document.getElementById("termTitle");
const termDesc = document.getElementById("termDesc");
const termClose = document.getElementById("termClose");

heroesTab.onclick = () => setTab("heroes");
glossaryTab.onclick = () => setTab("glossary");
termClose.onclick = () => termModal.classList.add("hidden");

function setTab(tab) {
  const isHeroes = tab === "heroes";
  heroesTab.classList.toggle("active", isHeroes);
  glossaryTab.classList.toggle("active", !isHeroes);
  heroesSection.classList.toggle("hidden", !isHeroes);
  glossarySection.classList.toggle("hidden", isHeroes);
}

// settings
fetch("data/settings.json")
  .then((res) => res.json())
  .then((st) => {
    const root = document.documentElement.style;
    if (st.textColor) root.setProperty("--text-color", st.textColor);
    if (st.btnColor) root.setProperty("--btn-color", st.btnColor);
    if (st.panelBg) root.setProperty("--panel-bg", st.panelBg);
    if (st.background) document.body.style.backgroundImage = `url('${st.background}')`;
  });

// герои
fetch("data/heroes.json")
  .then((res) => res.json())
  .then((data) => {
    data.forEach((hero) => {
      const btn = document.createElement("button");
      btn.textContent = hero.name;
      btn.onclick = () => showHero(hero);
      heroesList.appendChild(btn);
    });
  });

function showHero(h) {
  heroCard.innerHTML = `
    <div class="hero-left">
      <div class="hero-name">${h.name}</div>
      <div class="portrait" style="background-image:url('${h.portrait}')"></div>
    </div>
    <div class="hero-right">
      <div class="stat-row">❤ ${h.hp} 🛡 ${h.brn} ⬆ ${h.urv}</div>
      <div><b>Раса:</b> ${h.race}</div>
      <div><b>Класс:</b> ${h.class}</div>
      <div class="attrs">
        <div>СИЛ: ${h.stats.СИЛ}</div>
        <div>ЛОВ: ${h.stats.ЛОВ}</div>
        <div>ВЫН: ${h.stats.ВЫН}</div>
        <div>ИНТ: ${h.stats.ИНТ}</div>
        <div>МУД: ${h.stats.МУД}</div>
        <div>ХАР: ${h.stats.ХАР}</div>
      </div>
    </div>
  `;
  heroCard.classList.remove("hidden");
}

// глоссарий
let glossaryData = {};

fetch("data/glossary.json")
  .then((res) => res.json())
  .then((data) => {
    glossaryData = data;
    renderAlphabet();
    renderGlossaryList();
  });

function renderAlphabet() {
  alphabet.innerHTML = "";
  Object.keys(glossaryData).forEach((letter) => {
    const btn = document.createElement("button");
    btn.textContent = letter;
    btn.onclick = () => renderGlossaryList(letter);
    alphabet.appendChild(btn);
  });
}

function renderGlossaryList(filter) {
  termsList.innerHTML = "";
  const query = searchInput.value.toLowerCase();

  const letters = filter ? [filter] : Object.keys(glossaryData);

  letters.forEach((letter) => {
    glossaryData[letter].forEach((item) => {
      if (
        item.term.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query)
      ) {
        const div = document.createElement("div");
        div.textContent = item.term;
        div.onclick = () => openTerm(item);
        termsList.appendChild(div);
      }
    });
  });
}

searchInput.oninput = () => renderGlossaryList();

function openTerm(t) {
  termTitle.textContent = t.term;
  termDesc.textContent = t.desc;
  termModal.classList.remove("hidden");
}
