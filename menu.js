// Обработчик кнопки "Menu"
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector('.nav-item[title="Menu"]');
  const menuPanel = document.getElementById('menuPanel');

  menuBtn.addEventListener('click', () => {
    menuPanel.classList.toggle('show');
  });

  // Закрытие по клику вне панели
  document.addEventListener('click', (e) => {
    if (!menuPanel.contains(e.target) && !menuBtn.contains(e.target)) {
      menuPanel.classList.remove('show');
    }
  });
});
