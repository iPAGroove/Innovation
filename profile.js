// profile.js

// Функция для обновления и показа/скрытия блока профиля
export function updateProfileDisplay(user, isAdmin) { // Добавляем isAdmin как аргумент
    const profileInfoContainer = document.getElementById('profileInfoContainer');
    const profileNicknameDisplay = document.getElementById('profileNicknameDisplay');
    const authTabs = document.querySelector('.auth-tabs');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authContainer = document.querySelector('.auth-container');
    const openAdminPanelBtn = document.getElementById('openAdminPanel'); // Получаем ссылку на кнопку

    // Базовая проверка на существование всех необходимых элементов
    if (!profileInfoContainer || !profileNicknameDisplay || !authTabs || !loginForm || !registerForm || !authContainer || !openAdminPanelBtn) {
        console.warn('Один или несколько элементов профиля/аутентификации не найдены в DOM. Проверьте HTML и ID.');
        return;
    }

    if (user) {
        // Пользователь вошел в систему
        profileNicknameDisplay.textContent = user.displayName || (user.email ? user.email.split('@')[0] : 'Гость');

        profileInfoContainer.style.display = 'flex'; // Показываем контейнер профиля

        // Скрываем вкладки и формы
        authTabs.style.display = 'none';
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';

        // Добавляем прозрачность контейнеру auth-container
        authContainer.classList.add('transparent-bg');

        // Управляем видимостью кнопки админ-панели
        if (isAdmin) {
            openAdminPanelBtn.style.display = 'block'; // Показываем кнопку админа
        } else {
            openAdminPanelBtn.style.display = 'none'; // Скрываем, если не админ
        }

    } else {
        // Пользователь вышел из системы
        profileInfoContainer.style.display = 'none'; // Скрываем контейнер профиля

        // Показываем вкладки и формы (по умолчанию форму входа)
        authTabs.style.display = 'flex';
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';

        // Удаляем прозрачность контейнера auth-container
        authContainer.classList.remove('transparent-bg');

        // Сбрасываем текст никнейма
        profileNicknameDisplay.textContent = 'Войдите';

        // Всегда скрываем кнопку админа, если пользователь не авторизован
        openAdminPanelBtn.style.display = 'none';
    }
}
