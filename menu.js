document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById('navMenu');
  const menuPanel = document.getElementById('menuPanel');

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // чтобы не закрыло сразу
    menuPanel.classList.toggle('hidden');
  });

  // Закрытие по клику вне панели
  document.addEventListener('click', (e) => {
    if (
      !menuPanel.contains(e.target) &&
      !menuBtn.contains(e.target)
    ) {
      menuPanel.classList.add('hidden');
    }
  });
});
