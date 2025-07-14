// auth.js

// Импорт функций Firebase Auth (Modular SDK)
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Импорт функции обновления профиля из profile.js
import { updateProfileDisplay } from './profile.js';

document.addEventListener("DOMContentLoaded", () => {
  const app = window.firebaseApp;
  const auth = window.auth;

  if (!app || !auth) {
    console.error("❗ Firebase App или Auth не инициализированы в index.html");
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
  // Добавляем кнопку админ-панели
  const openAdminPanelBtn = document.getElementById('openAdminPanel');

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
    registerError, openAdminPanelBtn // Добавляем в проверку
  ];

  if (requiredElements.some(el => !el)) {
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
    // Скрываем кнопку админ-панели при переключении на формы входа/регистрации
    openAdminPanelBtn.style.display = 'none';
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
      if (auth.currentUser && nickname) {
        await updateProfile(auth.currentUser, { displayName: nickname });
      }
      console.log('🎉 Пользователь зарегистрирован');
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
    if (user) {
      console.log('👤 Пользователь авторизован:', user.email);
      // Проверяем, является ли пользователь администратором по email
      // ВНИМАНИЕ: Это ПРОСТОЙ пример. Для продакшена лучше использовать Firebase Custom Claims.
      const adminEmails = ["ipagroove@gmail.com", "другой_админ@example.com"]; // Замените на реальные админские email-ы
      if (adminEmails.includes(user.email)) {
        isAdmin = true;
      }
      // Если используете Custom Claims, то логика будет такой:
      // try {
      //   const idTokenResult = await user.getIdTokenResult();
      //   isAdmin = idTokenResult.claims.admin === true;
      // } catch (error) {
      //   console.error("Ошибка получения ID токена:", error);
      // }
    } else {
      console.log('🔒 Пользователь не авторизован');
    }
    // Передаем статус админа в функцию обновления профиля
    updateProfileDisplay(user, isAdmin);
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
