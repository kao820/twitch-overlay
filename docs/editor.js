function download(name, text) {
  const blob = new Blob([text], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

// save
document.getElementById("saveHeroes").onclick = ()=>{
  const val = document.getElementById("heroesInput").value;
  download("heroes.json", val);
};
document.getElementById("saveGlossary").onclick = ()=>{
  const val = document.getElementById("glossaryInput").value;
  download("glossary.json", val);
};
document.getElementById("saveSettings").onclick = ()=>{
  const val = document.getElementById("settingsInput").value;
  download("settings.json", val);
};

// load existing
fetch("data/heroes.json").then(r=>r.json()).then(d=>{
  document.getElementById("heroesInput").value = JSON.stringify(d,null,2);
});
fetch("data/glossary.json").then(r=>r.json()).then(d=>{
  document.getElementById("glossaryInput").value = JSON.stringify(d,null,2);
});
fetch("data/settings.json").then(r=>r.json()).then(d=>{
  document.getElementById("settingsInput").value = JSON.stringify(d,null,2);
});
