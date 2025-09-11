function download(name, text) {
  const blob = new Blob([text], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

document.getElementById("saveHeroes").onclick = ()=>{
  const val = document.getElementById("heroesInput").value;
  download("heroes.json", val);
};
document.getElementById("saveGlossary").onclick = ()=>{
  const val = document.getElementById("glossaryInput").value;
  download("glossary.json", val);
};

// подгрузка файлов
fetch("heroes.json").then(r=>r.json()).then(d=>{
  document.getElementById("heroesInput").value = JSON.stringify(d,null,2);
});
fetch("glossary.json").then(r=>r.json()).then(d=>{
  document.getElementById("glossaryInput").value = JSON.stringify(d,null,2);
});
