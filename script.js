// script.js

document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    const closeButtons = document.querySelectorAll('.close-button');
    const bottomNav = document.querySelector('.bottom-nav'); // Получаем навигационную панель

    // --- Логика для активной кнопки навигации ---
    function setActiveButton(button) {
        navButtons.forEach(btn => btn.classList.remove('active'));
        if (button) { // Убедимся, что кнопка существует
            button.classList.add('active');
        }
    }

    // --- Логика для открытия модальных окон ---
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Предотвращаем стандартное поведение ссылки

            const modalId = button.dataset.modal; // Получаем ID модального окна из data-атрибута

            // Закрываем все открытые модальные окна перед открытием нового
            modalOverlays.forEach(modal => modal.classList.remove('active'));

            if (modalId) { // Если кнопка имеет data-modal (т.е. это Games или Apps)
                const targetModal = document.getElementById(modalId);
                if (targetModal) {
                    targetModal.classList.add('active');
                    setActiveButton(button); // Делаем текущую кнопку активной
                    // Добавляем класс, который сдвинет панель навигации, если она должна реагировать
                    // bottomNav.classList.add('shifted-up'); // Закомментировано, если не нужен сдвиг панели
                }
            } else {
                // Если кнопка не имеет data-modal (например, Mail или Menu),
                // просто убираем активное состояние со всех кнопок и закрываем модалки
                setActiveButton(null); // Сбрасываем активное состояние
                // bottomNav.classList.remove('shifted-up'); // Закомментировано
            }
        });
    });

    // --- Логика для закрытия модальных окон ---
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal-overlay'); // Находим ближайший родительский .modal-overlay
            if (modal) {
                modal.classList.remove('active');
                setActiveButton(null); // Сбрасываем активное состояние кнопок навигации при закрытии окна
                // bottomNav.classList.remove('shifted-up'); // Закомментировано
            }
        });
    });

    // Закрытие модального окна при клике вне содержимого
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            // Если клик был по самому оверлею, а не по его дочерним элементам
            if (e.target === overlay) {
                overlay.classList.remove('active');
                setActiveButton(null); // Сбрасываем активное состояние
                // bottomNav.classList.remove('shifted-up'); // Закомментировано
            }
        });
    });

    // Опционально: Установить первую кнопку "Games" активной и открыть ее модальное окно при загрузке.
    // Если вы не хотите, чтобы какое-либо окно открывалось по умолчанию, закомментируйте этот блок.
    // const gamesButton = document.querySelector('[data-modal="games-modal"]');
    // if (gamesButton) {
    //     gamesButton.click(); // Имитируем клик, чтобы открыть окно и сделать кнопку активной
    // }
});
