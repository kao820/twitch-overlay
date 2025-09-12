document.addEventListener('DOMContentLoaded', () => {
  const heroesTab = document.getElementById('heroesTab');
  const glossaryTab = document.getElementById('glossaryTab');
  const heroesSection = document.getElementById('heroesSection');
  const glossarySection = document.getElementById('glossarySection');
  const termModal = document.getElementById('termModal');
  const termTitle = document.getElementById('termTitle');
  const termDesc = document.getElementById('termDesc');
  const termClose = document.getElementById('termClose');
  const termsList = document.getElementById('termsList');

  // Загрузка данных
  fetch('data/glossary.json')
    .then(res => res.json())
    .then(data => {
      renderGlossary(data);
    });

  function renderGlossary(glossaryData) {
    termsList.innerHTML = '';
    Object.entries(glossaryData).forEach(([letter, terms]) => {
      terms.forEach(term => {
        const termItem = document.createElement('div');
        termItem.classList.add('term-item');
        termItem.textContent = term.term;
        termItem.addEventListener('click', () => openTerm(term));
        termsList.appendChild(termItem);
      });
    });
  }

  function openTerm(item) {
    termTitle.textContent = item.term;
    termDesc.textContent = item.desc;
    termModal.classList.remove('hidden');
  }

  termClose.addEventListener('click', () => {
    termModal.classList.add('hidden');
  });

  heroesTab.addEventListener('click', () => {
    heroesSection.classList.remove('hidden');
    glossarySection.classList.add('hidden');
    heroesTab.classList.add('active');
    glossaryTab.classList.remove('active');
  });

  glossaryTab.addEventListener('click', () => {
    glossarySection.classList.remove('hidden');
    heroesSection.classList.add('hidden');
    glossaryTab.classList.add('active');
    heroesTab.classList.remove('active');
  });
});
