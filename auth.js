// auth.js

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { addDoc, collection, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Импорт функции обновления профиля из profile.js
import { updateProfileDisplay } from './profile.js';

document.addEventListener("DOMContentLoaded", () => {
    const app = window.firebaseApp;
    const auth = window.auth;
    const db = window.db;

    if (!app || !auth || !db) {
        console.error("❗ Firebase App, Auth или Firestore не инициализированы в index.html");
        return;
    }

    // DOM элементы
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authContainer = document.querySelector('.auth-container');
    const profileInfoContainer = document.getElementById('profileInfoContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    const openAdminPanelBtn = document.getElementById('openAdminPanel');
    const openUsersPanelBtn = document.getElementById('openUsersPanel');
    const addButton = document.getElementById('addButton'); // Ссылка на кнопку "Добавить"

    const authTabs = document.querySelector('.auth-tabs');

    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginError = document.getElementById('loginError');

    const registerEmailInput = document.getElementById('registerEmail');
    const registerNicknameInput = document.getElementById('registerNickname');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerError = document.getElementById('registerError');

    const requiredElements = [
        loginTab, registerTab, loginForm, registerForm, authContainer,
        profileInfoContainer, logoutBtn, loginEmailInput, loginPasswordInput,
        loginError, registerEmailInput, registerNicknameInput, registerPasswordInput,
        registerError, openAdminPanelBtn, openUsersPanelBtn, authTabs, addButton
    ];

    if (requiredElements.some(el => !el)) {
        requiredElements.forEach(el => {
            if (!el) {
                console.error(`❗ Отсутствует DOM элемент с ID: ${el ? el.id : 'undefined'}`);
            }
        });
        console.error("❗ Отсутствуют обязательные DOM элементы для auth.js");
        return;
    }

    function showAuthForm(isRegister) {
        if (profileInfoContainer) profileInfoContainer.style.display = 'none';
        if (authTabs) authTabs.style.display = 'flex';
        if (loginTab) loginTab.classList.toggle('active', !isRegister);
        if (registerTab) registerTab.classList.toggle('active', isRegister);
        if (loginForm) loginForm.style.display = isRegister ? 'none' : 'flex';
        if (registerForm) registerForm.style.display = isRegister ? 'flex' : 'none';
        if (authContainer) authContainer.classList.remove('transparent-bg');
        if (loginError) loginError.textContent = '';
        if (registerError) registerError.textContent = '';

        // Скрываем все кнопки, которые должны быть видны только при авторизации
        if (openAdminPanelBtn) openAdminPanelBtn.style.display = 'none';
        if (openUsersPanelBtn) openUsersPanelBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (addButton) addButton.style.display = 'none'; // Скрываем кнопку "Добавить"
    }

    if (loginTab) loginTab.addEventListener('click', () => showAuthForm(false));
    if (registerTab) registerTab.addEventListener('click', () => showAuthForm(true));

    // Логин
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginEmailInput.value.trim();
            const password = loginPasswordInput.value;
            if (loginError) loginError.textContent = '';

            try {
                await signInWithEmailAndPassword(auth, email, password);
                console.log('✅ Пользователь вошел в систему');
                if (loginEmailInput) loginEmailInput.value = '';
                if (loginPasswordInput) loginPasswordInput.value = '';
            } catch (error) {
                console.error('❌ Ошибка входа:', error.code);
                if (loginError) loginError.textContent = getAuthErrorMessage(error.code, 'login');
            }
        });
    }

    // Регистрация
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = registerEmailInput.value.trim();
            const nickname = registerNicknameInput.value.trim();
            const password = registerPasswordInput.value;
            if (registerError) registerError.textContent = '';

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                if (user && nickname) {
                    await updateProfile(user, { displayName: nickname });
                }

                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    nickname: nickname,
                    isVip: false,
                    vipEndDate: null,
                    createdAt: new Date(),
                    lastLogin: new Date(),
                    isAdmin: false
                });

                console.log('🎉 Пользователь зарегистрирован и добавлен в коллекцию users');
                if (registerEmailInput) registerEmailInput.value = '';
                if (registerNicknameInput) registerNicknameInput.value = '';
                if (registerPasswordInput) registerPasswordInput.value = '';
            } catch (error) {
                console.error('❌ Ошибка регистрации:', error.code);
                if (registerError) registerError.textContent = getAuthErrorMessage(error.code, 'register');
            }
        });
    }

    // Обработчик изменения состояния пользователя
    onAuthStateChanged(auth, async (user) => {
        let isAdmin = false;
        let isUserVip = false;
        let vipEndDate = null;

        if (user) {
            console.log('👤 Пользователь авторизован:', user.email);
            if (authTabs) authTabs.style.display = 'none';
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'none';
            if (profileInfoContainer) profileInfoContainer.style.display = 'flex';

            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    isUserVip = userData.isVip || false;
                    vipEndDate = userData.vipEndDate || null;
                    isAdmin = userData.isAdmin || false;
                    console.log(`User ${user.email} from Firestore: isAdmin=${isAdmin}, isVip=${isUserVip}, vipEndDate=${vipEndDate}`);

                    if (isUserVip && vipEndDate) {
                        const now = new Date();
                        const endDate = vipEndDate.toDate();
                        if (endDate < now) {
                            isUserVip = false;
                            await setDoc(userDocRef, { isVip: false, vipEndDate: null }, { merge: true });
                            console.log(`VIP статус пользователя ${user.email} истек и был обновлен на Free.`);
                        }
                    }
                } else {
                    console.warn(`Пользователь ${user.email} не найден в коллекции 'users'. Создаем запись.`);
                    const adminEmails = ["ipagroove@gmail.com"];
                    isAdmin = adminEmails.includes(user.email);
                    await setDoc(doc(db, "users", user.uid), {
                        email: user.email,
                        nickname: user.displayName || 'Пользователь',
                        isVip: false,
                        vipEndDate: null,
                        createdAt: new Date(),
                        lastLogin: new Date(),
                        isAdmin: isAdmin
                    });
                }
            } catch (error) {
                console.error("Ошибка при получении VIP/Admin статуса пользователя:", error);
            }

            try {
                const userDocRef = doc(db, "users", user.uid);
                await setDoc(userDocRef, { lastLogin: new Date() }, { merge: true });
            } catch (error) {
                console.error("Ошибка обновления lastLogin:", error);
            }

        } else {
            console.log('🔒 Пользователь не авторизован');
            if (authTabs) authTabs.style.display = 'flex';
            if (loginTab) loginTab.click();
            if (profileInfoContainer) profileInfoContainer.style.display = 'none';
        }

        window.currentUserIsVip = isUserVip;
        window.currentUserVipEndDate = vipEndDate ? (vipEndDate.toDate ? vipEndDate.toDate() : vipEndDate) : null;

        // Вызываем функцию обновления профиля из profile.js
        updateProfileDisplay(user, isAdmin, isUserVip, window.currentUserVipEndDate);

        // Перерисовываем карточки после получения VIP-статуса
        if (window.loadRealtimeCollection) {
            window.loadRealtimeCollection('Games', 'games');
            window.loadRealtimeCollection('Apps', 'apps');
        } else {
            console.warn("Функция window.loadRealtimeCollection не определена. Карточки могут не обновиться.");
        }
    });

    function getAuthErrorMessage(code, mode) {
        switch (code) {
            case 'auth/invalid-email': return 'Некорректный email.';
            case 'auth/user-disabled': return 'Аккаунт отключен.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential': return mode === 'login' ? 'Неверный email или пароль.' : 'Ошибка регистрации.';
            case 'auth/email-already-in-use': return 'Email уже зарегистрирован.';
            case 'auth/weak-password': return 'Пароль должен быть не менее 6 символов.';
            case 'auth/too-many-requests': return 'Слишком много попыток. Попробуйте позже.';
            default: return `Неизвестная ошибка (${code}).`;
        }
    }
});
