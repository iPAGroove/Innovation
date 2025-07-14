// menu.js

document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById('openMenu');
    const menuPanel = document.getElementById('menuPanel');

    if (!menuBtn || !menuPanel) {
        console.error("Элементы кнопки меню или самой панели меню не найдены.");
        return;
    }

    menuBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        menuPanel.classList.toggle('show');
    });

    // Закрытие по клику вне панели
    document.addEventListener('click', (e) => {
        // Проверяем, был ли клик вне menuPanel и не на menuBtn
        // Также проверяем, не был ли клик внутри adminPanel, чтобы избежать конфликтов
        const adminPanel = document.getElementById('adminPanel'); // Получаем ссылку на админ-панель
        if (menuPanel.classList.contains('show') &&
            !menuPanel.contains(e.target) &&
            !menuBtn.contains(e.target) &&
            // Добавлено условие: если админ-панель открыта и клик внутри неё, то меню не закрывается
            (!adminPanel.classList.contains('active') || !adminPanel.contains(e.target))) {
            menuPanel.classList.remove('show');
        }
    });

    // Глобальная функция для закрытия панели меню, доступная другим скриптам
    window.closeMenuPanel = () => {
        if (menuPanel.classList.contains('show')) {
            menuPanel.classList.remove('show');
        }
    };
});
