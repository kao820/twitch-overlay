const heroesUrl = "data/heroes.json";
const glossaryUrl = "data/glossary.json";
const settingsUrl = "data/settings.json";

const overlayToggle = document.getElementById("overlayToggle");
const overlayPanel = document.getElementById("overlayPanel");
const overlayClose = document.getElementById("overlayClose");

const heroesTab = document.getElementById("heroesTab");
const glossaryTab = document.getElementById("glossaryTab");

const heroesSection = document.getElementById("heroesSection");
const glossarySection = document.getElementById("glossarySection");

const heroesList = document.getElementById("heroesList");
const heroCard = document.getElementById("heroCard");

const alphabet = document.getElementById("alphabet");
const termsList = document.getElementById("termsList");

const termModal = document.getElementById("termModal");
const termTitle = document.getElementById("termTitle");
const termDesc = document.getElementById("termDesc");
const termClose = document.getElementById("termClose");

// toggle overlay
overlayToggle.onclick = () => overlayPanel.classList.toggle("hidden");
overlayClose.onclick = () => overlayPanel.classList.add("hidden");

// tabs
heroesTab.onclick = () => {
  heroesTab.classList.add("active");
  glossaryTab.classList.remove("active");
  heroesSection.classList.remove("hidden");
  glossarySection.classList.add("hidden");
};
glossaryTab.onclick = () => {
  glossaryTab.classList.add("active");
  heroesTab.classList.remove("active");
  glossarySection.classList.remove("hidden");
  heroesSection.classList.add("hidden");
};

// load settings
fetch(settingsUrl).then(r=>r.json()).then(st=>{
  if(st.textColor) document.documentElement.style.setProperty("--text-color", st.textColor);
  if(st.btnColor) document.documentElement.style.setProperty("--btn-color", st.btnColor);
  if(st.panelBg) document.documentElement.style.setProperty("--panel-bg", st.panelBg);
  if(st.width) document.documentElement.style.setProperty("--panel-width", st.width+"px");
  if(st.height) document.documentElement.style.setProperty("--panel-height", st.height+"px");
});

// load heroes
fetch(heroesUrl).then(r=>r.json()).then(data=>{
  data.forEach(h=>{
    const btn = document.createElement("button");
    btn.textContent = h.name;
    btn.onclick = ()=> showHero(h);
    heroesList.appendChild(btn);
  });
});
function showHero(h){
  heroCard.innerHTML = `
    <div class="hero-left">
      <div class="hero-name">${h.name}</div>
      <div class="portrait" style="background-image:url(${h.portrait})"></div>
    </div>
    <div class="hero-right">
      <div class="stat-row">
        ❤ ${h.hp} 🛡 ${h.brn} ⬆ ${h.urv}
      </div>
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
    </div>`;
  heroCard.classList.remove("hidden");
}
// load glossary
fetch(glossaryUrl).then(r=>r.json()).then(data=>{
  Object.keys(data).forEach(l=>{
    const btn = document.createElement("button");
    btn.textContent = l;
    btn.onclick = ()=> showTerms(data[l]);
    alphabet.appendChild(btn);
  });
});
function showTerms(arr){
  termsList.innerHTML="";
  arr.forEach(item=>{
    const div = document.createElement("div");
    div.textContent = item.term;
    div.onclick = ()=> openTerm(item);
    termsList.appendChild(div);
  });
}
function openTerm(item){
  termTitle.textContent = item.term;
  termDesc.textContent = item.desc;
  termModal.classList.remove("hidden");
}
termClose.onclick = ()=> termModal.classList.add("hidden");
