// LRS Overlay — совместимый с Twitch код (без inline-скриптов).
// Этот файл содержит логику отображения героев, глоссария и обработку
// темной/светлой темы. Он не использует инлайновых обработчиков и
// совместим с политикой Content Security Policy Twitch.

const appView = document.getElementById("appView");
const backButton = document.getElementById("backButton");
const themeToggle = document.getElementById("themeToggle");
const termModal = document.getElementById("termModal");
const termModalBackdrop = document.getElementById("termModalBackdrop");
const termModalTitle = document.getElementById("termModalTitle");
const termModalBody = document.getElementById("termModalBody");
const termModalClose = document.getElementById("termModalClose");
const fontUp = document.getElementById("fontUp");
const fontDown = document.getElementById("fontDown");

// Метки статусов для локализации
const STATUS_LABELS = {
  alive: "Живы",
  dead: "Мёртвы",
  unknown: "Неизвестно",
};

// Глобальное состояние приложения
const appState = {
  view: "home",
  selectedStatus: null,
  selectedHero: null,
  selectedLetter: null,
  glossaryScale: 1,
  history: [],
};

// Данные о героях и словаре будут загружаться из JSON
let heroesData = [];
let glossaryData = {};
let settingsData = {};

// Определяем базовые URL для данных и ассетов. В продакшене
// используется GitHub Pages, локально — папка data/.
const isProd = window.location.hostname.includes("ext-twitch.tv");
const DATA_BASE_URL = isProd
  ? "https://kao820.github.io/twitch-overlay/data/"
  : "data/";
const ASSETS_BASE_URL = isProd
  ? "https://kao820.github.io/twitch-overlay/"
  : "";

// Начало работы: применяем тему, назначаем события, загружаем данные
init();

async function init() {
  applyTheme();
  bindStaticEvents();
  await loadData();
  render();
}

// Назначаем события, которые не зависят от состояния
function bindStaticEvents() {
  backButton.addEventListener("click", goBack);
  themeToggle.addEventListener("click", () => {
    const next = document.body.classList.contains("light-theme") ? "dark" : "light";
    localStorage.setItem("viewerTheme", next);
    applyTheme();
  });
  termModalBackdrop.addEventListener("click", closeTermModal);
  termModalClose.addEventListener("click", closeTermModal);
  fontUp.addEventListener("click", () => {
    appState.glossaryScale = Math.min(2.2, +(appState.glossaryScale + 0.1).toFixed(1));
    document.documentElement.style.setProperty("--term-font-scale", appState.glossaryScale);
  });
  fontDown.addEventListener("click", () => {
    appState.glossaryScale = Math.max(0.7, +(appState.glossaryScale - 0.1).toFixed(1));
    document.documentElement.style.setProperty("--term-font-scale", appState.glossaryScale);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !termModal.classList.contains("hidden")) closeTermModal();
  });
}

// Загружаем JSON данные для героев, словаря и настроек
async function loadData() {
  const [heroes, glossary, settings] = await Promise.all([
    loadJSON("heroes.json", []),
    loadJSON("glossary.json", {}),
    loadJSON("settings.json", {}),
  ]);
  heroesData = Array.isArray(heroes) ? heroes : [];
  glossaryData = glossary || {};
  settingsData = settings || {};
  applySettings();
}

// Универсальный загрузчик JSON с обработкой ошибок
async function loadJSON(path, fallback) {
  try {
    const response = await fetch(`${DATA_BASE_URL}${path}`, { cache: "no-store" });
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

// Применяем пользовательские настройки цветов из settings.json
function applySettings() {
  const root = document.documentElement.style;
  if (settingsData?.textColor) root.setProperty("--text", settingsData.textColor);
  if (settingsData?.panelBg) root.setProperty("--panel-color", settingsData.panelBg);
}

// Применяем тему из localStorage (темная/светлая)
function applyTheme() {
  const saved = localStorage.getItem("viewerTheme") || "dark";
  document.body.classList.toggle("light-theme", saved === "light");
  themeToggle.textContent = saved === "light" ? "☀️" : "🌙";
  document.documentElement.style.setProperty("--term-font-scale", appState.glossaryScale);
}

// Переключение между экранами (домашний, список статусов, список героев, карточка героя, словарь)
function pushView(nextView, payload = {}) {
  appState.history.push({
    view: appState.view,
    selectedStatus: appState.selectedStatus,
    selectedHero: appState.selectedHero,
    selectedLetter: appState.selectedLetter,
  });
  appState.view = nextView;
  appState.selectedStatus = payload.selectedStatus ?? appState.selectedStatus ?? null;
  appState.selectedHero = payload.selectedHero ?? null;
  appState.selectedLetter = payload.selectedLetter ?? null;
  render();
}

// Возврат к предыдущему экрану по истории
function goBack() {
  if (!appState.history.length) return;
  closeTermModal();
  const prev = appState.history.pop();
  appState.view = prev.view;
  appState.selectedStatus = prev.selectedStatus;
  appState.selectedHero = prev.selectedHero;
  appState.selectedLetter = prev.selectedLetter;
  render();
}

// Основной рендерер: выбирает нужный экран
function render() {
  backButton.classList.toggle("hidden", appState.view === "home");
  if (appState.view === "home") { renderHome(); return; }
  if (appState.view === "heroes-status") { renderHeroesStatus(); return; }
  if (appState.view === "heroes-list") { renderHeroesList(); return; }
  if (appState.view === "hero-card") { renderHeroCard(); return; }
  if (appState.view === "glossary") { renderGlossary(); return; }
}

// ... далее следует логика для renderHeroesStatus, renderHeroesList, renderHeroCard, renderGlossary, renderBadge, renderStatLine и вспомогательные функции ...
