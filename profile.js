// profile.js

// Функция для обновления и показа/скрытия блока профиля
export function updateProfileDisplay(user) {
    const profileInfoContainer = document.getElementById('profileInfoContainer');
    const profileNicknameDisplay = document.getElementById('profileNicknameDisplay');
    // const loggedInUserDisplay = document.getElementById('loggedInUserDisplay'); // Раскомментировать, если email есть
    // const logoutBtn = document.getElementById('logoutBtn'); // Раскомментировать, если кнопка выхода есть

    if (!profileInfoContainer || !profileNicknameDisplay) {
        console.warn('Элементы профиля не найдены в DOM.');
        return;
    }

    if (user) {
        // Пользователь вошел в систему
        profileNicknameDisplay.textContent = 'iPA Groove'; // Статический текст "iPA Groove"
        // Если хотите показывать никнейм пользователя, раскомментируйте следующую строку:
        // profileNicknameDisplay.textContent = user.displayName || user.email.split('@')[0]; 
        
        // Если email отображается, раскомментируйте:
        // if (loggedInUserDisplay) loggedInUserDisplay.textContent = user.email; 

        profileInfoContainer.style.display = 'flex'; // Показываем контейнер профиля
    } else {
        // Пользователь вышел из системы
        profileInfoContainer.style.display = 'none'; // Скрываем контейнер профиля
    }
}

// Если кнопка выхода есть и вы хотите, чтобы она обрабатывалась в profile.js
/*
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById('logoutBtn');
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
*/
