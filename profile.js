// profile.js

// Функция для обновления и показа/скрытия блока профиля
export function updateProfileDisplay(user) {
    const profileInfoContainer = document.getElementById('profileInfoContainer');
    const profileNicknameDisplay = document.getElementById('profileNicknameDisplay');
    const authTabs = document.querySelector('.auth-tabs');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authContainer = document.querySelector('.auth-container');

    // Базовая проверка на существование всех необходимых элементов
    if (!profileInfoContainer || !profileNicknameDisplay || !authTabs || !loginForm || !registerForm || !authContainer) {
        console.warn('Один или несколько элементов профиля/аутентификации не найдены в DOM. Проверьте HTML и ID.');
        return;
    }

    if (user) {
        // Пользователь вошел в систему
        // Устанавливаем никнейм: предпочитаем displayName, если нет - часть email до @
        profileNicknameDisplay.textContent = user.displayName || (user.email ? user.email.split('@')[0] : 'Гость');
        
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

        // Показываем вкладки и формы (по умолчанию форму входа)
        authTabs.style.display = 'flex';
        loginForm.style.display = 'flex'; 
        registerForm.style.display = 'none'; 

        // Удаляем прозрачность контейнера auth-container
        authContainer.classList.remove('transparent-bg');

        // Сбрасываем текст никнейма
        profileNicknameDisplay.textContent = 'Войдите'; // Или 'iPA Groove' по умолчанию
    }
}
