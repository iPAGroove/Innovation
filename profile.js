// profile.js

// Функция для обновления и показа/скрытия блока профиля
export function updateProfileDisplay(user) {
    const profileInfoContainer = document.getElementById('profileInfoContainer');
    const profileNicknameDisplay = document.getElementById('profileNicknameDisplay');
    const authTabs = document.querySelector('.auth-tabs'); // Добавлено: ссылки на вкладки
    const loginForm = document.getElementById('loginForm'); // Добавлено: ссылки на формы
    const registerForm = document.getElementById('registerForm'); // Добавлено: ссылки на формы
    const authContainer = document.querySelector('.auth-container'); // Добавлено: ссылка на контейнер аутентификации

    if (!profileInfoContainer || !profileNicknameDisplay || !authTabs || !loginForm || !registerForm || !authContainer) {
        console.warn('Один или несколько элементов профиля/аутентификации не найдены в DOM.');
        return;
    }

    if (user) {
        // Пользователь вошел в систему
        profileNicknameDisplay.textContent = 'iPA Groove'; // Статический текст "iPA Groove"
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
        authTabs.style.display = 'flex'; // Важно: display: flex для вкладок
        loginForm.style.display = 'flex'; // Показываем форму входа по умолчанию
        registerForm.style.display = 'none'; // Скрываем форму регистрации

        // Удаляем прозрачность контейнера auth-container
        authContainer.classList.remove('transparent-bg');
    }
}

// Если кнопка выхода есть и вы хотите, чтобы она обрабатывалась в profile.js
document.addEventListener("DOMContentLoaded", () => {
    // Добавляем кнопку выхода из профиля, если её ещё нет
    const profileInfoContainer = document.getElementById('profileInfoContainer');
    let logoutBtn = document.getElementById('logoutBtn');

    if (profileInfoContainer && !logoutBtn) {
        logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.textContent = 'Выйти из профиля';
        logoutBtn.classList.add('logout-btn'); // Добавьте этот класс в profile.css
        profileInfoContainer.parentNode.insertBefore(logoutBtn, profileInfoContainer.nextSibling); // Вставляем после profileInfoContainer
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            // Импортируем getAuth и signOut только здесь, если profile.js независим от auth.js
            const { getAuth, signOut } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js");
            const auth = getAuth(window.firebaseApp); // Используем глобальный firebaseApp

            try {
                await signOut(auth);
                console.log('Пользователь вышел из профиля.');
            } catch (error) {
                console.error('Ошибка выхода из профиля:', error.message);
            }
        });
    }
});
