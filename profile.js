// profile.js

import { updateProfile as firebaseUpdateProfile, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const profileNicknameDisplay = document.getElementById('profileNicknameDisplay');
const profileInfoContainer = document.getElementById('profileInfoContainer');
const openAdminPanelBtn = document.getElementById('openAdminPanel');
const openUsersPanelBtn = document.getElementById('openUsersPanel');
const freeAccessBtn = document.getElementById('freeAccessBtn');
const upgradeVipBtn = document.getElementById('upgradeVipBtn');
const addButton = document.getElementById('addButton'); // Ссылка на кнопку "Добавить"

// ОЧЕНЬ ВАЖНО: Убедитесь, что эти элементы найдены в HTML
const accountSettingsLink = document.querySelector('.account-settings-link');
const arrowDownIcon = document.querySelector('.account-settings-link .arrow-down');
const profileCard = document.querySelector('.profile-card'); // Элемент, который будет расширяться
const accountSettingsContent = document.querySelector('.account-settings-content'); // Контейнер для настроек аккаунта

// Элементы для редактирования профиля
const editProfileNicknameInput = document.getElementById('editProfileNickname');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const logoutBtn = document.getElementById('logoutBtn'); // Кнопка выхода, теперь в профиле

// Экспортируемая функция для обновления отображения профиля
export function updateProfileDisplay(user, isAdmin, isUserVip, vipEndDate) {
    if (user) {
        profileNicknameDisplay.textContent = user.displayName || user.email;

        // Обновление кнопок VIP/Free
        if (isUserVip) {
            if (freeAccessBtn) freeAccessBtn.style.display = 'none';
            if (upgradeVipBtn) {
                upgradeVipBtn.textContent = '👑 VIP Access';
                upgradeVipBtn.style.background = '#8A2BE2'; // Фиолетовый
                upgradeVipBtn.style.color = '#fff';
                // Если VIP, показать дату окончания
                if (vipEndDate) {
                    const date = new Date(vipEndDate.seconds ? vipEndDate.seconds * 1000 : vipEndDate); // Handle Timestamp or Date object
                    upgradeVipBtn.textContent += ` (до ${date.toLocaleDateString()})`;
                }
                upgradeVipBtn.style.display = 'inline-block'; // Убедимся, что она видима
            }
        } else {
            if (freeAccessBtn) freeAccessBtn.style.display = 'inline-block';
            if (upgradeVipBtn) {
                upgradeVipBtn.textContent = '⚡ Upgrade to VIP';
                upgradeVipBtn.style.background = '#ffc107'; // Желтый
                upgradeVipBtn.style.color = '#333';
                upgradeVipBtn.style.display = 'inline-block'; // Убедимся, что она видима
            }
        }

        // Управление видимостью кнопок АДМИНА и кнопки "Добавить"
        if (isAdmin) {
            if (openAdminPanelBtn) openAdminPanelBtn.style.display = 'block'; // Показать ADD G/A
            if (openUsersPanelBtn) openUsersPanelBtn.style.display = 'block'; // Показать STATUS USERS
            if (addButton) addButton.style.display = 'none'; // Скрыть "Добавить" для админов
        } else {
            if (openAdminPanelBtn) openAdminPanelBtn.style.display = 'none'; // Скрыть админские кнопки
            if (openUsersPanelBtn) openUsersPanelBtn.style.display = 'none';
            if (addButton) addButton.style.display = 'flex'; // Показать "Добавить" для обычных пользователей (flex для иконки/текста)
        }

        // При авторизации, сбрасываем состояние expanded профиль-карты
        if (profileCard) {
            profileCard.classList.remove('expanded');
        }
        if (arrowDownIcon) arrowDownIcon.classList.remove('rotate');
        // Скрываем содержимое account settings по умолчанию при логине
        if (accountSettingsContent) accountSettingsContent.style.display = 'none';


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
        if (addButton) addButton.style.display = 'none'; // Скрыть "Добавить" при выходе
        if (accountSettingsContent) accountSettingsContent.style.display = 'none'; // Скрыть настройки аккаунта
        if (profileCard) profileCard.classList.remove('expanded'); // Свернуть профиль
        if (arrowDownIcon) arrowDownIcon.classList.remove('rotate');

        window.currentUserIsVip = false; // Сбрасываем статус VIP
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
                if (menuPanel) menuPanel.classList.remove('show');
            } catch (error) {
                console.error('Ошибка выхода:', error.message);
                alert('Не удалось выйти. Попробуйте снова.');
            }
        });
    } else {
        console.warn("Кнопка выхода 'logoutBtn' не найдена.");
    }

    // Слушатель для ссылки "Account Settings"
    if (accountSettingsLink && profileCard && arrowDownIcon && accountSettingsContent) {
        accountSettingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            profileCard.classList.toggle('expanded');
            arrowDownIcon.classList.toggle('rotate');

            const isExpanded = profileCard.classList.contains('expanded');

            // Переключаем видимость контейнера с настройками профиля
            accountSettingsContent.style.display = isExpanded ? 'flex' : 'none';

            // Предзаполняем поле никнейма, если пользователь авторизован
            if (isExpanded && window.auth && window.auth.currentUser && editProfileNicknameInput) {
                editProfileNicknameInput.value = window.auth.currentUser.displayName || '';
            }
        });
    } else {
        console.warn("Один или несколько элементов для 'Account Settings' не найдены: accountSettingsLink, profileCard, arrowDownIcon, accountSettingsContent.");
    }

    // Слушатель для кнопки "Save Profile"
    if (saveProfileBtn && editProfileNicknameInput && profileNicknameDisplay) {
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

                profileNicknameDisplay.textContent = newNickname; // Обновляем отображение никнейма
                alert('Профиль успешно обновлен!');
            } catch (error) {
                console.error("Ошибка при обновлении профиля:", error);
                alert('Не удалось обновить профиль: ' + error.message);
            }
        });
    } else {
        console.warn("Кнопка 'saveProfileBtn' или поле 'editProfileNicknameInput' или 'profileNicknameDisplay' не найдены.");
    }

    // Слушатели для кнопок Free Access и Upgrade to VIP
    if (freeAccessBtn) {
        freeAccessBtn.addEventListener('click', () => {
            alert('Вы уже пользуетесь бесплатным доступом!');
        });
    }
    if (upgradeVipBtn) {
        upgradeVipBtn.addEventListener('click', () => {
            alert('Функционал оплаты VIP доступа пока не реализован.');
        });
    }

    // НОВЫЙ СЛУШАТЕЛЬ для кнопки "Добавить"
    if (addButton) {
        addButton.addEventListener('click', () => {
            alert('Кнопка "Добавить" для обычного пользователя нажата! Здесь можно реализовать форму для предложений/запросов.');
        });
    } else {
        console.warn("Кнопка 'addButton' не найдена.");
    }
});
