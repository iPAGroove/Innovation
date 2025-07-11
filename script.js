// script.js

document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const fullScreenSections = document.querySelectorAll('.full-screen-section'); // Получаем все полноэкранные разделы

    // --- Логика для активной кнопки навигации ---
    function setActiveButton(button) {
        navButtons.forEach(btn => btn.classList.remove('active'));
        if (button) {
            button.classList.add('active');
        }
    }

    // --- Логика для открытия разделов ---
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            const sectionId = button.dataset.section; // Получаем ID раздела из data-атрибута

            // Закрываем все открытые разделы перед открытием нового
            fullScreenSections.forEach(section => section.classList.remove('active'));

            if (sectionId) { // Если кнопка имеет data-section (т.е. это Games или Apps)
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    setActiveButton(button); // Делаем текущую кнопку активной
                }
            } else {
                // Если кнопка не имеет data-section (например, Mail или Menu),
                // просто убираем активное состояние со всех кнопок и закрываем все разделы
                setActiveButton(null);
            }
        });
    });

    // --- Логика для закрытия разделов (по клику вне, если это необходимо) ---
    // Если вы хотите, чтобы раздел закрывался по клику на фон, раскомментируйте этот блок:
    fullScreenSections.forEach(section => {
        section.addEventListener('click', (e) => {
            // Если клик был по самому разделу, а не по его дочерним элементам
            if (e.target === section) {
                section.classList.remove('active');
                setActiveButton(null); // Сбрасываем активное состояние
            }
        });
    });

    // Если вы добавите кнопки закрытия (например, с классом .section-close-button) внутри секций:
    // const sectionCloseButtons = document.querySelectorAll('.section-close-button');
    // sectionCloseButtons.forEach(button => {
    //     button.addEventListener('click', () => {
    //         const section = button.closest('.full-screen-section');
    //         if (section) {
    //             section.classList.remove('active');
    //             setActiveButton(null);
    //         }
    //     });
    // });


    // Опционально: Открыть раздел "Games" по умолчанию при загрузке.
    // Закомментируйте, если не хотите, чтобы раздел открывался при старте.
    // const gamesButton = document.querySelector('[data-section="games-section"]');
    // if (gamesButton) {
    //     gamesButton.click(); // Имитируем клик, чтобы открыть раздел и сделать кнопку активной
    // }
});
