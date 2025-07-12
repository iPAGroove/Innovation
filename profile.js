// profile.js

// Функция для обновления и показа/скрытия блока профиля
export function updateProfileDisplay(user) {
    const profileInfoContainer = document.getElementById('profileInfoContainer');
    const profileNicknameDisplay = document.getElementById('profileNicknameDisplay');
    const authTabs = document.querySelector('.auth-tabs');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authContainer = document.querySelector('.auth-container');

    if (!profileInfoContainer || !profileNicknameDisplay || !authTabs || !loginForm || !registerForm || !authContainer) {
        console.warn('Один или несколько элементов профиля/аутентификации не найдены в DOM.');
        return;
    }

    if (user) {
        // Пользователь вошел в систему
        profileNicknameDisplay.textContent = 'iPA Groove';
        // Если хотите показывать никнейм пользователя, раскомментируйте следующую строку:
        // profileNicknameDisplay.textContent = user.displayName || user.email.split('@')[0];

        profileInfoContainer.style.display = 'flex'; // Показываем контейнер профиля

        // Скрываем вкладки и формы
        authTabs.style.display = 'none';
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';

        // Добавляем прозрачность контейнеру auth-container
        authContainer.classList.add('transparent-bg');

    } else {
        // Пользователь вышел из системы
        profileInfoContainer.style.display = 'none'; // Скрываем контейнер профиля

        // Показываем вкладки и формы
        authTabs.style.display = 'flex';
        loginForm.style.display = 'flex'; // Показываем форму входа по умолчанию
        registerForm.style.display = 'none'; // Скрываем форму регистрации

        // Удаляем прозрачность контейнера auth-container
        authContainer.classList.remove('transparent-bg');
    }
}

// !!! КОД ДЛЯ КНОПКИ ВЫХОДА ИЗ ПРОФИЛЯ ПО-ПРЕЖНЕМУ УДАЛЕН !!!
