// profile.js

import { updateProfile as firebaseUpdateProfile, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const profileNicknameDisplay = document.getElementById('profileNicknameDisplay');
const profileInfoContainer = document.getElementById('profileInfoContainer');
const openAdminPanelBtn = document.getElementById('openAdminPanel');
const openUsersPanelBtn = document.getElementById('openUsersPanel');
const freeAccessBtn = document.getElementById('freeAccessBtn');
const upgradeVipBtn = document.getElementById('upgradeVipBtn');

// ОЧЕНЬ ВАЖНО: Убедитесь, что эти элементы найдены в HTML
const accountSettingsLink = document.querySelector('.account-settings-link');
const arrowDownIcon = document.querySelector('.account-settings-link .arrow-down');
const profileCard = document.querySelector('.profile-card'); // Элемент, который будет расширяться

// Элементы для редактирования профиля (они внутри выпадающего блока)
const editProfileNicknameInput = document.getElementById('editProfileNickname');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const logoutBtn = document.getElementById('logoutBtn'); // Кнопка выхода, теперь в профиле

// Экспортируемая функция для обновления отображения профиля
export function updateProfileDisplay(user, isAdmin, isUserVip, vipEndDate) {
    if (user) {
        profileNicknameDisplay.textContent = user.displayName || user.email;

        if (isUserVip) {
            freeAccessBtn.style.display = 'none';
            upgradeVipBtn.textContent = '👑 VIP Access';
            upgradeVipBtn.style.background = 'linear-gradient(90deg, #8A2BE2 0%, #8A2BE2 100%)';
            upgradeVipBtn.style.color = '#fff';
            if (vipEndDate) {
                const date = new Date(vipEndDate.seconds * 1000);
                upgradeVipBtn.textContent += ` (до ${date.toLocaleDateString()})`;
            }
        } else {
            freeAccessBtn.style.display = 'inline-block';
            upgradeVipBtn.textContent = '⚡ Upgrade to VIP';
            upgradeVipBtn.style.background = 'linear-gradient(90deg, #ffba36 0%, #ff6636 100%)';
            upgradeVipBtn.style.color = '#fff';
        }

        if (isAdmin) {
            openAdminPanelBtn.style.display = 'block';
            openUsersPanelBtn.style.display = 'block';
        } else {
            openAdminPanelBtn.style.display = 'none';
            openUsersPanelBtn.style.display = 'none';
        }

        // Сброс состояния expanded при авторизации
        if (profileCard) {
            profileCard.classList.remove('expanded');
        }
        if (arrowDownIcon) arrowDownIcon.classList.remove('rotate');
        if (editProfileNicknameInput) editProfileNicknameInput.style.display = 'none';
        if (saveProfileBtn) saveProfileBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';

        // Показываем основной контейнер профиля
        if (profileInfoContainer) profileInfoContainer.style.display = 'flex';

        // Обновляем доступность карточек в играх/приложениях
        window.currentUserIsVip = isUserVip;
        window.currentUserVipEndDate = vipEndDate;
        window.loadRealtimeCollection('Games', 'games');
        window.loadRealtimeCollection('Apps', 'apps');
    } else {
        // Пользователь не авторизован
        if (profileInfoContainer) profileInfoContainer.style.display = 'none';
        if (openAdminPanelBtn) openAdminPanelBtn.style.display = 'none';
        if (openUsersPanelBtn) openUsersPanelBtn.style.display = 'none';

        window.currentUserIsVip = false;
        window.currentUserVipEndDate = null;
        window.loadRealtimeCollection('Games', 'games');
        window.loadRealtimeCollection('Apps', 'apps');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Слушатель для кнопки выхода
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(window.auth);
                const menuPanel = document.getElementById('menuPanel');
                if (menuPanel) menuPanel.classList.remove('open');
            } catch (error) {
                console.error('Ошибка выхода:', error.message);
                alert('Не удалось выйти. Попробуйте снова.');
            }
        });
    } else {
        console.warn("Кнопка выхода 'logoutBtn' не найдена.");
    }

    // Слушатель для ссылки "Account Settings"
    if (accountSettingsLink && profileCard && arrowDownIcon && editProfileNicknameInput && saveProfileBtn && logoutBtn) {
        accountSettingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            profileCard.classList.toggle('expanded');
            arrowDownIcon.classList.toggle('rotate');

            const isExpanded = profileCard.classList.contains('expanded');
            editProfileNicknameInput.style.display = isExpanded ? 'block' : 'none';
            saveProfileBtn.style.display = isExpanded ? 'block' : 'none';
            logoutBtn.style.display = isExpanded ? 'block' : 'none';

            if (isExpanded && window.auth && window.auth.currentUser) {
                editProfileNicknameInput.value = window.auth.currentUser.displayName || '';
            }
        });
    } else {
        console.warn("Один или несколько элементов для 'Account Settings' не найдены: accountSettingsLink, profileCard, arrowDownIcon, editProfileNicknameInput, saveProfileBtn, logoutBtn.");
    }

    // Слушатель для кнопки "Save Profile"
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async () => {
            const user = window.auth.currentUser;
            const newNickname = editProfileNicknameInput.value.trim();

            if (!user) {
                alert('Вы не авторизованы.');
                return;
            }

            if (newNickname === user.displayName) {
                alert('Новый никнейм совпадает с текущим.');
                return;
            }

            if (!newNickname) {
                alert('Никнейм не может быть пустым.');
                return;
            }

            try {
                await firebaseUpdateProfile(user, { displayName: newNickname });
                await updateDoc(doc(window.db, "users", user.uid), {
                    nickname: newNickname,
                    lastModifiedAt: new Date()
                });
                profileNicknameDisplay.textContent = newNickname;
                alert('Профиль успешно обновлен!');
            } catch (error) {
                console.error("Ошибка при обновлении профиля:", error);
                alert('Не удалось обновить профиль: ' + error.message);
            }
        });
    } else {
        console.warn("Кнопка 'saveProfileBtn' не найдена.");
    }

    // Слушатели для кнопок Free Access и Upgrade to VIP
    if (freeAccessBtn) {
        freeAccessBtn.addEventListener('click', () => {
            // По референсу ничего не делаем (или покажи alert если хочешь)
        });
    }
    if (upgradeVipBtn) {
        upgradeVipBtn.addEventListener('click', () => {
            window.open('https://example.com/vip', '_blank'); // Замени на свою ссылку если есть
        });
    }
});
