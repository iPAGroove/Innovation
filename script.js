// script.js

document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    // Обновляем селектор, чтобы он выбирал только новый объединенный модал
    const fullScreenSection = document.getElementById('games-and-apps-modal'); 

    // --- Логика для активной кнопки навигации ---
    function setActiveButton(button) {
        navButtons.forEach(btn => btn.classList.remove('active'));
        if (button) {
            button.classList.add('active');
        }
    }

    // --- Логика для открытия/закрытия разделов ---
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            const sectionId = button.dataset.section; // Получаем ID раздела из data-атрибута

            // Если кликнутая кнопка должна открывать наш объединенный модал
            if (sectionId === 'games-and-apps-modal') {
                // Если модал уже активен, закрываем его
                if (fullScreenSection.classList.contains('active')) {
                    fullScreenSection.classList.remove('active');
                    setActiveButton(null); // Сбрасываем активное состояние
                } else { // Иначе, открываем его
                    fullScreenSection.classList.add('active');
                    setActiveButton(button); // Делаем текущую кнопку активной
                }
            } else { // Если кликнута другая кнопка (например, Mail или Menu)
                // Закрываем наш объединенный модал, если он был открыт
                fullScreenSection.classList.remove('active');
                setActiveButton(button); // Делаем текущую кнопку активной (или сбрасываем, если она не должна быть активной)
                // Здесь вы можете добавить логику для открытия других модалов, если они есть и имеют свои data-section
            }
        });
    });

    // --- Логика для закрытия раздела по клику вне его (если это необходимо) ---
    // Если вы хотите, чтобы раздел закрывался по клику на фон, раскомментируйте этот блок:
    if (fullScreenSection) {
        fullScreenSection.addEventListener('click', (e) => {
            // Если клик был по самому разделу, а не по его дочерним элементам
            if (e.target === fullScreenSection) {
                fullScreenSection.classList.remove('active');
                setActiveButton(null); // Сбрасываем активное состояние
            }
        });
    }


    // Опционально: Открыть раздел "Games" по умолчанию при загрузке.
    // Закомментируйте, если не хотите, чтобы раздел открывался при старте.
    // Если вы хотите, чтобы объединенный модал открывался при загрузке
    // const gamesButton = document.querySelector('[data-section="games-and-apps-modal"]');
    // if (gamesButton) {
    //     gamesButton.click(); // Имитируем клик, чтобы открыть раздел и сделать кнопку активной
    // }
});
