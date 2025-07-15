// profile.js

import { updateProfile as firebaseUpdateProfile, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const profileNicknameDisplay = document.getElementById('profileNicknameDisplay');
const profileInfoContainer = document.getElementById('profileInfoContainer');
// const authContainer = document.querySelector('.auth-container'); // Больше не нужен напрямую здесь
// const loginForm = document.getElementById('loginForm'); // Больше не нужен напрямую здесь
// const registerForm = document.getElementById('registerForm'); // Больше не нужен напрямую здесь
const openAdminPanelBtn = document.getElementById('openAdminPanel');
const openUsersPanelBtn = document.getElementById('openUsersPanel');
const freeAccessBtn = document.querySelector('.profile-btn.free-access-btn');
const upgradeVipBtn = document.querySelector('.profile-btn.upgrade-vip-btn');

const accountSettingsLink = document.querySelector('.account-settings-link');
const arrowDownIcon = document.querySelector('.account-settings-link .arrow-down');
const profileCard = document.querySelector('.profile-card'); // Элемент, который будет расширяться

// Элементы для редактирования профиля (убедитесь, что они есть в index.html)
const editProfileNicknameInput = document.getElementById('editProfileNickname');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const logoutBtn = document.getElementById('logoutBtn'); // Кнопка выхода, теперь в профиле

// Экспортируемая функция для обновления отображения профиля
export function updateProfileDisplay(user, isAdmin, isUserVip, vipEndDate) {
    if (user) {
        // Устанавливаем никнейм из Firebase Auth displayName, затем из Firestore, затем email
        let displayName = user.displayName;
        if (!displayName && window.db) { // Проверяем, инициализирован ли db перед обращением к Firestore
            const userDocRef = doc(window.db, "users", user.uid);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists() && docSnap.data().nickname) {
                    profileNicknameDisplay.textContent = docSnap.data().nickname;
                } else {
                    profileNicknameDisplay.textContent = user.email;
                }
            }).catch(error => {
                console.error("Ошибка при получении никнейма пользователя из Firestore:", error);
                profileNicknameDisplay.textContent = user.email;
            });
        } else {
            profileNicknameDisplay.textContent = displayName || user.email;
        }

        profileInfoContainer.style.display = 'block';
        // authContainer.classList.add('transparent-bg'); // Не нужно здесь

        // Отображаем кнопки админ-панелей, если пользователь админ
        if (isAdmin) {
            if (openAdminPanelBtn) openAdminPanelBtn.style.display = 'block';
            if (openUsersPanelBtn) openUsersPanelBtn.style.display = 'block';
        } else {
            if (openAdminPanelBtn) openAdminPanelBtn.style.display = 'none';
            if (openUsersPanelBtn) openUsersPanelBtn.style.display = 'none';
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
                    // Дополнительно можно обновить статус пользователя в Firestore здесь, если не сделано в auth.js
                }
            }
            if (freeAccessBtn) {
                freeAccessBtn.textContent = vipText;
                freeAccessBtn.style.background = '#28a745'; // Зеленый для VIP
            }
            if (upgradeVipBtn) upgradeVipBtn.style.display = 'none';
        } else {
            if (freeAccessBtn) {
                freeAccessBtn.textContent = 'Free Access';
                freeAccessBtn.style.background = '#007bff'; // Синий для Free
            }
            if (upgradeVipBtn) upgradeVipBtn.style.display = 'block';
        }

        // При авторизации, сбрасываем состояние expanded
        profileCard.classList.remove('expanded');
        if (arrowDownIcon) arrowDownIcon.classList.remove('rotate');
        if (editProfileNicknameInput) editProfileNicknameInput.style.display = 'none';
        if (saveProfileBtn) saveProfileBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none'; // Скрываем кнопку выхода по умолчанию

    } else {
        profileInfoContainer.style.display = 'none';
        // authContainer.classList.remove('transparent-bg'); // Не нужно здесь
        // loginForm.style.display = 'flex'; // Не нужно здесь
        // registerForm.style.display = 'none'; // Не нужно здесь
        if (openAdminPanelBtn) openAdminPanelBtn.style.display = 'none';
        if (openUsersPanelBtn) openUsersPanelBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none'; // Скрываем кнопку выхода при выходе
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Слушатель для кнопки выхода (перенесен сюда)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(window.auth);
                // После выхода, DOM-элементы должны быть обновлены через onAuthStateChanged в auth.js
                // Нет необходимости вручную скрывать/показывать здесь
            } catch (error) {
                console.error('Ошибка выхода:', error.message);
                alert('Не удалось выйти. Попробуйте снова.');
            }
        });
    } else {
        console.warn("Кнопка выхода 'logoutBtn' не найдена.");
    }

    // Слушатель для ссылки "Account Settings"
    if (accountSettingsLink) {
        accountSettingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            profileCard.classList.toggle('expanded');
            if (arrowDownIcon) arrowDownIcon.classList.toggle('rotate');

            const isExpanded = profileCard.classList.contains('expanded');

            // Переключаем видимость полей редактирования и кнопки сохранения/выхода
            if (editProfileNicknameInput) editProfileNicknameInput.style.display = isExpanded ? 'block' : 'none';
            if (saveProfileBtn) saveProfileBtn.style.display = isExpanded ? 'block' : 'none';
            if (logoutBtn) logoutBtn.style.display = isExpanded ? 'block' : 'none'; // Показываем кнопку выхода при расширении

            // Предзаполняем поле никнейма, если пользователь авторизован
            if (isExpanded && window.auth && window.auth.currentUser && editProfileNicknameInput) {
                editProfileNicknameInput.value = window.auth.currentUser.displayName || '';
            }
        });
    } else {
        console.warn("Ссылка 'account-settings-link' не найдена.");
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
                // Обновляем displayName в Firebase Auth
                await firebaseUpdateProfile(user, { displayName: newNickname });
                // Обновляем никнейм в Firestore коллекции 'users'
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
        console.warn("Кнопка 'saveProfileBtn' не найдена.");
    }
});
