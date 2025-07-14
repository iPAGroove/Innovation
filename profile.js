// profile.js

import { signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const profileNicknameDisplay = document.getElementById('profileNicknameDisplay');
const profileInfoContainer = document.getElementById('profileInfoContainer');
const authContainer = document.querySelector('.auth-container');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const openAdminPanelBtn = document.getElementById('openAdminPanel');
const openUsersPanelBtn = document.getElementById('openUsersPanel'); // НОВАЯ КНОПКА
const freeAccessBtn = document.querySelector('.profile-btn.free-access-btn');
const upgradeVipBtn = document.querySelector('.profile-btn.upgrade-vip-btn');


// Экспортируемая функция для обновления отображения профиля
export function updateProfileDisplay(user, isAdmin, isUserVip, vipEndDate) {
    if (user) {
        profileNicknameDisplay.textContent = user.displayName || user.email;
        profileInfoContainer.style.display = 'block';
        authContainer.classList.add('transparent-bg');
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';

        // Отображаем кнопки админ-панелей, если пользователь админ
        if (isAdmin) {
            openAdminPanelBtn.style.display = 'block';
            openUsersPanelBtn.style.display = 'block'; // Показываем кнопку "Панель Пользователей"
        } else {
            openAdminPanelBtn.style.display = 'none';
            openUsersPanelBtn.style.display = 'none'; // Скрываем обе кнопки, если не админ
        }

        // Обновляем текст кнопок Free/VIP
        if (isUserVip) {
            let vipText = 'VIP';
            if (vipEndDate) {
                const now = new Date();
                if (vipEndDate > now) {
                    const daysLeft = Math.ceil((vipEndDate - now) / (1000 * 60 * 60 * 24));
                    vipText += ` (${daysLeft} дн.)`;
                } else {
                    vipText = 'VIP (истек)';
                }
            }
            freeAccessBtn.textContent = vipText;
            freeAccessBtn.style.background = '#007bff';
            upgradeVipBtn.style.display = 'none';
        } else {
            freeAccessBtn.textContent = 'Free Access';
            freeAccessBtn.style.background = '#6c757d';
            upgradeVipBtn.style.display = 'block';
        }

    } else {
        profileInfoContainer.style.display = 'none';
        authContainer.classList.remove('transparent-bg');
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
        openAdminPanelBtn.style.display = 'none';
        openUsersPanelBtn.style.display = 'none'; // Скрываем новую кнопку
    }
}

// Слушатель для кнопки выхода - останется в профиле, так как это логично для UX
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(window.auth);
            } catch (error) {
                console.error('Ошибка выхода:', error.message);
                alert('Не удалось выйти. Попробуйте снова.');
            }
        });
    } else {
        console.warn("Кнопка выхода 'logoutBtn' не найдена.");
    }
});
