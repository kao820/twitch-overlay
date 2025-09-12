let heroes = [];
let glossary = {};

// ———————— Герои ————————
const heroesContainer = document.getElementById("heroesContainer");

function renderHeroes() {
  heroesContainer.innerHTML = "";
  heroes.forEach((h, idx) => {
    const div = document.createElement("div");
    div.className = "hero-card";
    div.innerHTML = `
      <button onclick="removeHero(${idx})">Очистить</button>
      <input placeholder="Player" value="${h.player||''}" oninput="heroes[${idx}].player=this.value">
      <input placeholder="Имя" value="${h.name||''}" oninput="heroes[${idx}].name=this.value">
      <input placeholder="Раса" value="${h.race||''}" oninput="heroes[${idx}].race=this.value">
      <input placeholder="Класс" value="${h.class||''}" oninput="heroes[${idx}].class=this.value">
      <input placeholder="Портрет (URL)" value="${h.portrait||''}" oninput="heroes[${idx}].portrait=this.value">
      <input placeholder="СИЛ" value="${h.STR||'∞'}" oninput="heroes[${idx}].STR=this.value">
      <input placeholder="ЛОВ" value="${h.DEX||'∞'}" oninput="heroes[${idx}].DEX=this.value">
      <input placeholder="ВЫН" value="${h.CON||'∞'}" oninput="heroes[${idx}].CON=this.value">
      <input placeholder="ИНТ" value="${h.INT||'∞'}" oninput="heroes[${idx}].INT=this.value">
      <input placeholder="МДР" value="${h.WIS||'∞'}" oninput="heroes[${idx}].WIS=this.value">
      <input placeholder="ХАР" value="${h.CHA||'∞'}" oninput="heroes[${idx}].CHA=this.value">
    `;
    heroesContainer.appendChild(div);
  });
}

function addHero() {
  heroes.push({player:'',name:'',race:'',class:'',portrait:'',STR:'∞',DEX:'∞',CON:'∞',INT:'∞',WIS:'∞',CHA:'∞'});
  renderHeroes();
}

function removeHero(idx) {
  heroes.splice(idx,1);
  renderHeroes();
}

document.getElementById("addHero").onclick = addHero;
document.getElementById("downloadHeroes").onclick = ()=>download("heroes.json", JSON.stringify(heroes,null,2));

// ———————— Словарь ————————
const glossaryContainer = document.getElementById("glossaryContainer");
const glossaryLetterInput = document.getElementById("glossaryLetter");

function renderGlossary() {
  glossaryContainer.innerHTML = "";
  const letter = glossaryLetterInput.value.toUpperCase();
  if(!letter) return;
  if(!glossary[letter]) glossary[letter]=[];
  glossary[letter].forEach((term, idx)=>{
    const div = document.createElement("div");
    div.className = "glossary-row";
    div.innerHTML = `
      <input placeholder="Термин" value="${term.term}" oninput="glossary['${letter}'][${idx}].term=this.value">
      <input placeholder="Описание" value="${term.desc}" oninput="glossary['${letter}'][${idx}].desc=this.value">
      <button onclick="removeTerm('${letter}',${idx})">Удалить</button>
    `;
    glossaryContainer.appendChild(div);
  });
}

function addTerm() {
  const letter = glossaryLetterInput.value.toUpperCase();
  if(!letter) return alert("Введите букву!");
  if(!glossary[letter]) glossary[letter]=[];
  glossary[letter].push({term:'',desc:''});
  renderGlossary();
}

function removeTerm(letter, idx) {
  glossary[letter].splice(idx,1);
  renderGlossary();
}

glossaryLetterInput.oninput = renderGlossary;
document.getElementById("addTerm").onclick = addTerm;
document.getElementById("downloadGlossary").onclick = ()=>download("glossary.json", JSON.stringify(glossary,null,2));

// ———————— Общая функция ————————
function download(name, text) {
  const blob = new Blob([text], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

// ———————— Загрузка существующих данных ————————
fetch("data/heroes.json").then(r=>r.json()).then(d=>{ heroes=d; renderHeroes(); });
fetch("data/glossary.json").then(r=>r.json()).then(d=>{ glossary=d; });
