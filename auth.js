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
// Убедитесь, что profile.js экспортирует эту функцию, например:
// export function updateProfileDisplay(user, isAdmin, isUserVip, vipEndDate) { ... }
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
    const openUsersPanelBtn = document.getElementById('openUsersPanel'); // НОВАЯ КНОПКА

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
        registerError, openAdminPanelBtn, openUsersPanelBtn
    ];

    if (requiredElements.some(el => !el)) {
        // Добавлено более детальное логирование отсутствующих элементов
        requiredElements.forEach(el => {
            if (!el) {
                console.error(`❗ Отсутствует DOM элемент с ID: ${el ? el.id : 'undefined'}`);
            }
        });
        console.error("❗ Отсутствуют обязательные DOM элементы для auth.js");
        return;
    }

    function showAuthForm(isRegister) {
        profileInfoContainer.style.display = 'none';
        loginTab.classList.toggle('active', !isRegister);
        registerTab.classList.toggle('active', isRegister);
        loginForm.style.display = isRegister ? 'none' : 'flex';
        registerForm.style.display = isRegister ? 'flex' : 'none';
        authContainer.classList.remove('transparent-bg');
        loginError.textContent = '';
        registerError.textContent = '';

        // Убедимся, что кнопки скрыты при показе формы авторизации/регистрации
        // Проверяем на null перед изменением стиля
        if (openAdminPanelBtn) openAdminPanelBtn.style.display = 'none';
        if (openUsersPanelBtn) openUsersPanelBtn.style.display = 'none';
    }

    loginTab.addEventListener('click', () => showAuthForm(false));
    registerTab.addEventListener('click', () => showAuthForm(true));

    // Логин
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value;
        loginError.textContent = '';

        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ Пользователь вошел в систему');
            loginEmailInput.value = '';
            loginPasswordInput.value = '';
        } catch (error) {
            console.error('❌ Ошибка входа:', error.code);
            loginError.textContent = getAuthErrorMessage(error.code, 'login');
        }
    });

    // Регистрация
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = registerEmailInput.value.trim();
        const nickname = registerNicknameInput.value.trim();
        const password = registerPasswordInput.value;
        registerError.textContent = '';

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user && nickname) {
                await updateProfile(user, { displayName: nickname });
            }

            // Добавляем запись о пользователе в коллекцию 'users' в Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                nickname: nickname,
                isVip: false, // По дефолту Free
                vipEndDate: null, // Нет даты окончания VIP
                createdAt: new Date(),
                lastLogin: new Date(),
                isAdmin: false // По дефолту не админ
            });

            console.log('🎉 Пользователь зарегистрирован и добавлен в коллекцию users');
            registerEmailInput.value = '';
            registerNicknameInput.value = '';
            registerPasswordInput.value = '';
        } catch (error) {
            console.error('❌ Ошибка регистрации:', error.code);
            registerError.textContent = getAuthErrorMessage(error.code, 'register');
        }
    });

    // Выход
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log('👋 Пользователь вышел из системы');
        } catch (error) {
            console.error('❌ Ошибка выхода:', error.message);
            alert('Не удалось выйти. Попробуйте снова.');
        }
    });

    // Обработчик изменения состояния пользователя
    onAuthStateChanged(auth, async (user) => {
        let isAdmin = false;
        let isUserVip = false;
        let vipEndDate = null;

        if (user) {
            console.log('👤 Пользователь авторизован:', user.email);
            // Проверяем, является ли пользователь администратором по email (как запасной вариант)
            const adminEmails = ["ipagroove@gmail.com"]; // Ваши админские email-ы

            // Получаем VIP-статус и статус админа из коллекции 'users'
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    isUserVip = userData.isVip || false;
                    vipEndDate = userData.vipEndDate ? userData.vipEndDate.toDate() : null;
                    // isAdmin теперь берется из Firestore в первую очередь, затем из списка email
                    isAdmin = userData.isAdmin || adminEmails.includes(user.email);

                    // Проверяем, не истек ли VIP
                    if (isUserVip && vipEndDate && vipEndDate < new Date()) {
                        isUserVip = false; // VIP истек
                        // Опционально: обновить статус в базе данных на Free
                        await setDoc(userDocRef, { isVip: false, vipEndDate: null }, { merge: true });
                        console.log(`VIP статус пользователя ${user.email} истек и был обновлен на Free.`);
                    }
                } else {
                    // Если пользователя нет в коллекции users, создаем его
                    console.warn(`Пользователь ${user.email} не найден в коллекции 'users'. Создаем запись.`);
                    isAdmin = adminEmails.includes(user.email); // Инициализируем isAdmin на основе email
                    await setDoc(doc(db, "users", user.uid), {
                        email: user.email,
                        nickname: user.displayName || 'Пользователь',
                        isVip: false,
                        vipEndDate: null,
                        createdAt: new Date(),
                        lastLogin: new Date(),
                        isAdmin: isAdmin // Сохраняем статус админа в Firestore
                    });
                }
            } catch (error) {
                console.error("Ошибка при получении VIP/Admin статуса пользователя:", error);
            }

            // Обновляем lastLogin при каждом входе
            try {
                const userDocRef = doc(db, "users", user.uid);
                await setDoc(userDocRef, { lastLogin: new Date() }, { merge: true });
            } catch (error) {
                console.error("Ошибка обновления lastLogin:", error);
            }

        } else {
            console.log('🔒 Пользователь не авторизован');
        }

        // Обновляем глобальные переменные VIP-статуса
        window.currentUserIsVip = isUserVip;
        window.currentUserVipEndDate = vipEndDate;

        // Передаем статус админа и VIP в функцию обновления профиля
        updateProfileDisplay(user, isAdmin, isUserVip, vipEndDate);

        // Перерисовываем карточки после получения VIP-статуса
        window.loadRealtimeCollection('Games', 'games');
        window.loadRealtimeCollection('Apps', 'apps');
    });

    function getAuthErrorMessage(code, mode) {
        switch (code) {
            case 'auth/invalid-email':
                return 'Некорректный email.';
            case 'auth/user-disabled':
                return 'Аккаунт отключен.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return mode === 'login' ? 'Неверный email или пароль.' : 'Ошибка регистрации.';
            case 'auth/email-already-in-use':
                return 'Email уже зарегистрирован.';
            case 'auth/weak-password':
                return 'Пароль должен быть не менее 6 символов.';
            case 'auth/too-many-requests':
                return 'Слишком много попыток. Попробуйте позже.';
            default:
                return `Неизвестная ошибка (${code}).`;
        }
    }
});
