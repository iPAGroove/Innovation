// profile.js

import { updateProfile as firebaseUpdateProfile, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const profileNicknameDisplay = document.getElementById('profileNicknameDisplay');
const profileInfoContainer = document.getElementById('profileInfoContainer');
const openAdminPanelBtn = document.getElementById('openAdminPanel');
const openUsersPanelBtn = document.getElementById('openUsersPanel');
const freeAccessBtn = document.getElementById('freeAccessBtn'); // Изменен с querySelector на getElementById
const upgradeVipBtn = document.getElementById('upgradeVipBtn'); // Изменен с querySelector на getElementById

// ОЧЕНЬ ВАЖНО: Убедитесь, что эти элементы найдены в HTML
const accountSettingsLink = document.querySelector('.account-settings-link');
const arrowDownIcon = document.querySelector('.account-settings-link .arrow-down');
const profileCard = document.querySelector('.profile-card'); // Элемент, который будет расширяться

// Элементы для редактирования профиля
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
            upgradeVipBtn.style.background = '#8A2BE2'; // Фиолетовый
            upgradeVipBtn.style.color = '#fff';
            // Если VIP, показать дату окончания
            if (vipEndDate) {
                const date = new Date(vipEndDate.seconds * 1000);
                upgradeVipBtn.textContent += ` (до ${date.toLocaleDateString()})`;
            }
        } else {
            freeAccessBtn.style.display = 'inline-block';
            upgradeVipBtn.textContent = '⚡ Upgrade to VIP';
            upgradeVipBtn.style.background = '#ffc107'; // Желтый
            upgradeVipBtn.style.color = '#333';
        }

        if (isAdmin) {
            openAdminPanelBtn.style.display = 'block';
            openUsersPanelBtn.style.display = 'block';
        } else {
            openAdminPanelBtn.style.display = 'none';
            openUsersPanelBtn.style.display = 'none';
        }

        // При авторизации, сбрасываем состояние expanded
        if (profileCard) {
            profileCard.classList.remove('expanded');
        }
        if (arrowDownIcon) arrowDownIcon.classList.remove('rotate');
        if (editProfileNicknameInput) editProfileNicknameInput.style.display = 'none';
        if (saveProfileBtn) saveProfileBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none'; // Скрываем кнопку выхода по умолчанию при входе
        
        // Показываем основной контейнер профиля
        if (profileInfoContainer) profileInfoContainer.style.display = 'flex'; // Используем 'flex' так как profile-info-container flex-direction: column
        
        // Обновляем доступность карточек в играх/приложениях
        window.currentUserIsVip = isUserVip;
        window.currentUserVipEndDate = vipEndDate; // Обновляем глобальную переменную
        // Перезагружаем коллекции, чтобы применились новые статусы VIP
        window.loadRealtimeCollection('Games', 'games');
        window.loadRealtimeCollection('Apps', 'apps');

    } else {
        // Пользователь не авторизован
        if (profileInfoContainer) profileInfoContainer.style.display = 'none';
        if (openAdminPanelBtn) openAdminPanelBtn.style.display = 'none';
        if (openUsersPanelBtn) openUsersPanelBtn.style.display = 'none';

        window.currentUserIsVip = false; // Сбрасываем статус VIP
        window.currentUserVipEndDate = null;
        // Перезагружаем коллекции, чтобы VIP-контент стал заблокированным
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
                // После выхода, DOM-элементы будут обновлены через onAuthStateChanged в auth.js
                // Дополнительно сбросим состояние меню, если оно было открыто
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

            // Переключаем видимость полей редактирования и кнопок
            editProfileNicknameInput.style.display = isExpanded ? 'block' : 'none';
            saveProfileBtn.style.display = isExpanded ? 'block' : 'none';
            logoutBtn.style.display = isExpanded ? 'block' : 'none'; // Показываем кнопку выхода при расширении

            // Предзаполняем поле никнейма, если пользователь авторизован
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
                // Обновляем никнейм в Firebase Authentication
                await firebaseUpdateProfile(user, { displayName: newNickname });
                
                // Обновляем никнейм в Firestore коллекции 'users'
                await updateDoc(doc(window.db, "users", user.uid), {
                    nickname: newNickname,
                    lastModifiedAt: new Date()
                });
                
                profileNicknameDisplay.textContent = newNickname; // Обновляем отображение никнейма
                alert('Профиль успешно обновлен!');
                // После сохранения можно автоматически свернуть профиль, если хотите
                // profileCard.classList.remove('expanded');
                // arrowDownIcon.classList.remove('rotate');
                // editProfileNicknameInput.style.display = 'none';
                // saveProfileBtn.style.display = 'none';
                // logoutBtn.style.display = 'none'; // Скрываем кнопку выхода после сохранения, если сворачиваем
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
            alert('Вы уже пользуетесь бесплатным доступом!');
            // Здесь можно добавить логику, если что-то должно происходить при клике на "Free Access"
        });
    }
    if (upgradeVipBtn) {
        upgradeVipBtn.addEventListener('click', () => {
            alert('Функционал оплаты VIP доступа пока не реализован.');
            // Здесь будет логика для перехода на страницу оплаты или модального окна
        });
    }
});
