// Elements
const heroesTab = document.getElementById("heroesTab");
const glossaryTab = document.getElementById("glossaryTab");
const heroesSection = document.getElementById("heroesSection");
const glossarySection = document.getElementById("glossarySection");
const heroesList = document.getElementById("heroesList");

// Detail panel elements (for both hero and glossary)
const detailPanel = document.getElementById("detailPanel");
const detailHeader = document.getElementById("detailHeader");
const detailBody = document.getElementById("detailBody");
const detailClose = document.getElementById("detailClose");
// Theme toggle element
const themeToggle = document.getElementById("themeToggle");

const alphabet   = document.getElementById("alphabet");
const termsList  = document.getElementById("termsList");
const searchInput = document.getElementById("searchInput");

// Ensure the detail panel is hidden on initial load. Some older versions of
// the index file omitted the 'hidden' class on the detail panel, causing an
// empty panel to appear when the page first loads. This line guarantees
// that the panel starts hidden and only appears when a hero or term is
// selected.
if (detailPanel && !detailPanel.classList.contains('hidden')) {
  detailPanel.classList.add('hidden');
}

// Tab switching
heroesTab.onclick   = () => setTab("heroes");
glossaryTab.onclick = () => setTab("glossary");
// Close detail panel
detailClose.onclick = () => detailPanel.classList.add("hidden");

// Apply saved theme and set up toggle
applyTheme();
if (themeToggle) {
  themeToggle.onclick = () => {
    const isLight = document.body.classList.contains("light-theme");
    if (isLight) {
      document.body.classList.remove("light-theme");
      themeToggle.textContent = "🌙";
      localStorage.setItem("viewerTheme", "dark");
    } else {
      document.body.classList.add("light-theme");
      themeToggle.textContent = "☀️";
      localStorage.setItem("viewerTheme", "light");
    }
  };
}

function setTab(tab) {
  const isHeroes = tab === "heroes";
  heroesTab.classList.toggle("active",  isHeroes);
  glossaryTab.classList.toggle("active", !isHeroes);
  heroesSection.classList.toggle("hidden", !isHeroes);
  glossarySection.classList.toggle("hidden",  isHeroes);
}

// Load settings (colours/background) — overrides some CSS variables if data/settings.json exists
fetch("data/settings.json")
  .then((res) => res.json())
  .then((st) => {
    const root = document.documentElement.style;
    if (st.textColor) root.setProperty("--text-color", st.textColor);
    if (st.btnColor)  root.setProperty("--btn-color",  st.btnColor);
    if (st.panelBg)   root.setProperty("--panel-bg",   st.panelBg);
    // игнорируем фоновое изображение, чтобы убрать «шкуру»
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
  const order  = ["alive", "dead", "unknown"];
  const labels = { alive: "Живы", dead: "Мёртвы", unknown: "Неизвестно" };
  order.forEach((status) => {
    const col = document.createElement("div");
    col.className = "status-column";
    const h = document.createElement("h4");
    h.textContent = labels[status];
    col.appendChild(h);
    const listDiv = document.createElement("div");
    // Сортируем героев в каждой колонке по алфавиту (без учёта регистра)
    const sorted = (groups[status] || []).slice().sort((a, b) => {
      const nameA = (a.name || '').toLocaleUpperCase();
      const nameB = (b.name || '').toLocaleUpperCase();
      return nameA.localeCompare(nameB, 'ru-RU');
    });
    sorted.forEach((hero) => {
      const btn = document.createElement("button");
      // Кнопка отображает только имя героя. Портрет будет показан в панели подробностей.
      btn.textContent = hero.name;
      btn.onclick = () => showHero(hero);
      listDiv.appendChild(btn);
    });
    col.appendChild(listDiv);
    heroesList.appendChild(col);
  });
}

function showHero(h) {
  // Заполняем заголовок и содержимое панели подробностей. Используем
  // отдельный контейнер .hero-info, чтобы портрет занимал фиксированное
  // место слева, а текст — оставшееся пространство справа.
  detailHeader.textContent = h.name;
  detailBody.innerHTML = `
    <img src="${h.portrait}" alt="${h.name}" class="hero-portrait">
    <div class="hero-info">
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
    </div>
  `;
  // Показываем панель и подгоняем её положение под ширину экрана
  detailPanel.classList.remove("hidden");
  adjustDetailPanelForViewport();
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
  const query   = searchInput.value.toLowerCase();
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
  // Заполняем панель подробностей для термина
  detailHeader.textContent = t.term;
  detailBody.innerHTML = `<p>${t.desc}</p>`;
  detailPanel.classList.remove("hidden");
  adjustDetailPanelForViewport();
}

/*
 * Adjusts the position and size of the detail panel based on the
 * current viewport width. On narrow screens (≤600px), the panel
 * expands to cover the entire viewport so that content is not
 * rendered off-screen. On wider screens, it aligns to the right of
 * the 360px overlay panel as before. This function should be
 * called whenever the detail panel is shown or the window is
 * resized.
 */
function adjustDetailPanelForViewport() {
  const mobileWidth = 600;
  if (window.innerWidth <= mobileWidth) {
    detailPanel.style.left = '0';
    detailPanel.style.top  = '0';
    detailPanel.style.width  = '100%';
    detailPanel.style.height = '100vh';
    detailPanel.style.borderLeft = 'none';
  } else {
    detailPanel.style.left   = '360px';
    detailPanel.style.top    = '0';
    detailPanel.style.width  = 'calc(100% - 360px)';
    detailPanel.style.height = '100vh';
    detailPanel.style.borderLeft = '';
  }
}

// Listen for window resize events to reposition the detail panel when the
// viewport size changes (e.g., device rotation). This ensures the
// detail panel remains visible on mobile and correctly aligned on
// desktop.
window.addEventListener('resize', () => {
  if (!detailPanel.classList.contains('hidden')) {
    adjustDetailPanelForViewport();
  }
});

// --- Темы ---
function applyTheme() {
  const saved = localStorage.getItem("viewerTheme") || "dark";
  if (saved === "light") {
    document.body.classList.add("light-theme");
    if (themeToggle) themeToggle.textContent = "☀️";
  } else {
    document.body.classList.remove("light-theme");
    if (themeToggle) themeToggle.textContent = "🌙";
  }
}
