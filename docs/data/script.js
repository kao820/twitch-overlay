const heroesUrl = "heroes.json";
const glossaryUrl = "glossary.json";

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

// переключение панели
overlayToggle.onclick = () => overlayPanel.classList.toggle("hidden");
overlayClose.onclick = () => overlayPanel.classList.add("hidden");

// вкладки
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

// загрузка героев
fetch(heroesUrl).then(r => r.json()).then(data => {
  data.forEach((h,i)=>{
    const btn = document.createElement("button");
    btn.textContent = h.name;
    btn.onclick = ()=> showHero(h);
    heroesList.appendChild(btn);
  });
});
function showHero(h){
  heroCard.classList.remove("hidden");
  document.getElementById("heroPortrait").style.backgroundImage = `url(${h.portrait})`;
  document.getElementById("heroName").textContent = h.name;
  document.getElementById("statHP").textContent = h.hp;
  document.getElementById("statBRN").textContent = h.brn;
  document.getElementById("statURV").textContent = h.urv;
  document.getElementById("statRace").textContent = h.race;
  document.getElementById("statClass").textContent = h.class;
  document.getElementById("aSTR").textContent = h.stats.СИЛ;
  document.getElementById("aDEX").textContent = h.stats.ЛОВ;
  document.getElementById("aCON").textContent = h.stats.ВЫН;
  document.getElementById("aINT").textContent = h.stats.ИНТ;
  document.getElementById("aWIS").textContent = h.stats.МУД;
  document.getElementById("aCHA").textContent = h.stats.ХАР;
}

// словарь
fetch(glossaryUrl).then(r => r.json()).then(data => {
  const letters = Object.keys(data);
  letters.forEach(l=>{
    const btn = document.createElement("button");
    btn.textContent = l;
    btn.onclick = ()=> showTerms(l,data[l]);
    alphabet.appendChild(btn);
  });
});
function showTerms(letter, arr){
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
