// menu.js

document.addEventListener("DOMContentLoaded", () => {
  // Теперь используем ID, который был добавлен в index.html для кнопки меню
  const menuBtn = document.getElementById('openMenu'); 
  const menuPanel = document.getElementById('menuPanel');

  if (!menuBtn || !menuPanel) {
    console.error("Элементы кнопки меню или самой панели меню не найдены.");
    return;
  }

  menuBtn.addEventListener('click', (event) => { // Добавляем event для preventDefault
    event.preventDefault(); // Предотвращаем дефолтное поведение ссылки
    menuPanel.classList.toggle('show');
  });

  // Закрытие по клику вне панели
  document.addEventListener('click', (e) => {
    // Проверяем, был ли клик вне menuPanel и не на menuBtn
    if (!menuPanel.contains(e.target) && !menuBtn.contains(e.target)) {
      menuPanel.classList.remove('show');
    }
  });
});
