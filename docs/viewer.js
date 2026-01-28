// Elements
const heroesTab = document.getElementById("heroesTab");
const glossaryTab = document.getElementById("glossaryTab");
const heroesSection = document.getElementById("heroesSection");
const glossarySection = document.getElementById("glossarySection");
const heroesList = document.getElementById("heroesList");

const heroModal = document.getElementById("heroModal");
const heroTitle = document.getElementById("heroTitle");
const heroContent = document.getElementById("heroContent");
const heroClose = document.getElementById("heroClose");

const alphabet = document.getElementById("alphabet");
const termsList = document.getElementById("termsList");
const searchInput = document.getElementById("searchInput");

const termModal = document.getElementById("termModal");
const termTitle = document.getElementById("termTitle");
const termDesc = document.getElementById("termDesc");
const termClose = document.getElementById("termClose");

// Tab switching
heroesTab.onclick = () => setTab("heroes");
glossaryTab.onclick = () => setTab("glossary");
termClose.onclick = () => termModal.classList.add("hidden");
heroClose.onclick = () => heroModal.classList.add("hidden");

function setTab(tab) {
  const isHeroes = tab === "heroes";
  heroesTab.classList.toggle("active", isHeroes);
  glossaryTab.classList.toggle("active", !isHeroes);
  heroesSection.classList.toggle("hidden", !isHeroes);
  glossarySection.classList.toggle("hidden", isHeroes);
}

// Load settings (colors/background)
fetch("data/settings.json")
  .then((res) => res.json())
  .then((st) => {
    const root = document.documentElement.style;
    if (st.textColor) root.setProperty("--text-color", st.textColor);
    if (st.btnColor) root.setProperty("--btn-color", st.btnColor);
    if (st.panelBg) root.setProperty("--panel-bg", st.panelBg);
    if (st.background) document.body.style.backgroundImage = `url('${st.background}')`;
  });

// Load heroes and render in columns by status
fetch("data/heroes.json")
  .then((res) => res.json())
  .then((data) => {
    // group by status; default to alive if no status property
    const groups = { alive: [], dead: [], unknown: [] };
    data.forEach((hero) => {
      const status = hero.status || "alive";
      if (!groups[status]) groups[status] = [];
      groups[status].push(hero);
    });
    renderHeroes(groups);
  });

function renderHeroes(groups) {
  heroesList.innerHTML = "";
  const order = ["alive", "dead", "unknown"];
  const labels = { alive: "Живы", dead: "Мёртвы", unknown: "Неизвестно" };
  order.forEach((status) => {
    const col = document.createElement("div");
    col.className = "status-column";
    const h = document.createElement("h4");
    h.textContent = labels[status];
    col.appendChild(h);
    const listDiv = document.createElement("div");
    (groups[status] || []).forEach((hero) => {
      const btn = document.createElement("button");
      btn.textContent = hero.name;
      btn.onclick = () => showHero(hero);
      listDiv.appendChild(btn);
    });
    col.appendChild(listDiv);
    heroesList.appendChild(col);
  });
}

function showHero(h) {
  heroTitle.textContent = h.name;
  heroContent.innerHTML = `
    <div class="hero-stats">❤ ${h.hp} 🛡 ${h.brn} ⬆ ${h.urv}</div>
    <div><b>Раса:</b> ${h.race}</div>
    <div><b>Класс:</b> ${h.class}</div>
    <div class="attrs">
      <div>СИЛ: ${h.stats?.СИЛ ?? ''}</div>
      <div>ЛОВ: ${h.stats?.ЛОВ ?? ''}</div>
      <div>ВЫН: ${h.stats?.ВЫН ?? ''}</div>
      <div>ИНТ: ${h.stats?.ИНТ ?? ''}</div>
      <div>МУД: ${h.stats?.МУД ?? ''}</div>
      <div>ХАР: ${h.stats?.ХАР ?? ''}</div>
    </div>
  `;
  heroModal.classList.remove("hidden");
}

// Glossary
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
    (glossaryData[letter] || []).forEach((item) => {
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
