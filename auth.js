// auth.js

// ========== ИМПОРТЫ ИЗ FIREBASE SDK ==========
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// !!! ИМПОРТ ФУНКЦИИ ИЗ НОВОГО profile.js !!!
import { updateProfileDisplay } from './profile.js';

document.addEventListener("DOMContentLoaded", () => {
  const app = window.firebaseApp;
  if (!app) {
    console.error("Firebase App не инициализировано в index.html. Функции аутентификации могут не работать.");
    return;
  }
  const auth = getAuth(app);

  // Элементы DOM для форм и статуса
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authContainer = document.querySelector('.auth-container');
  const profileInfoContainer = document.getElementById('profileInfoContainer'); // Добавлено для управления видимостью

  // Поля ввода для входа
  const loginEmailInput = document.getElementById('loginEmail');
  const loginPasswordInput = document.getElementById('loginPassword');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');

  // Поля ввода для регистрации
  const registerEmailInput = document.getElementById('registerEmail');
  const registerNicknameInput = document.getElementById('registerNickname');
  const registerPasswordInput = document.getElementById('registerPassword');
  const registerBtn = document.getElementById('registerBtn');
  const registerError = document.getElementById('registerError');

  // --- Отладочные логи ---
  console.log('Элемент loginTab:', loginTab);
  console.log('Элемент registerTab:', registerTab);
  console.log('Элемент loginForm:', loginForm);
  console.log('Элемент registerForm:', registerForm);
  console.log('Элемент loginBtn:', loginBtn);
  console.log('Элемент registerBtn:', registerBtn);
  console.log('Элемент authContainer:', authContainer);
  console.log('Элемент profileInfoContainer:', profileInfoContainer); // Отладочный лог
  // --- Конец отладочных логов ---

  // Функция для показа формы и переключения активных вкладок
  function showAuthForm(isRegister) {
    // Скрываем контейнер профиля, когда показываем формы входа/регистрации
    if (profileInfoContainer) {
      profileInfoContainer.style.display = 'none';
    }

    loginForm.classList.toggle('active', !isRegister);
    registerForm.classList.toggle('active', isRegister);

    loginForm.style.display = isRegister ? 'none' : 'flex';
    registerForm.style.display = isRegister ? 'flex' : 'none';

    // !!! Убираем прозрачность фона auth-container при показе форм !!!
    if (authContainer) {
      authContainer.classList.remove('transparent-bg');
    }

    // Показываем вкладки
    loginTab.style.display = 'block';
    registerTab.style.display = 'block';
    loginTab.classList.toggle('active', !isRegister);
    registerTab.classList.toggle('active', isRegister);

    // Очищаем ошибки при смене формы
    loginError.textContent = '';
    registerError.textContent = '';
  }

  // По умолчанию показываем форму входа
  // showAuthForm(false); // Убрали, так как теперь onAuthStateChanged управляет начальным отображением

  // Переключение между формами входа и регистрации
  loginTab.addEventListener('click', () => {
    showAuthForm(false);
  });

  registerTab.addEventListener('click', () => {
    showAuthForm(true);
  });

  // Обработчик для ВХОДА (привязан к submit формы)
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;
    loginError.textContent = '';

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Пользователь успешно вошел!');
      // При успешном входе формы должны закрыться, а профиль открыться.
      // onAuthStateChanged позаботится об этом.
    } catch (error) {
      console.error('Ошибка входа:', error.code, error.message);
      let errorMessage = 'Ошибка входа. Пожалуйста, попробуйте еще раз.';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Некорректный формат email.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Пользователь отключен.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Неправильный email или пароль.';
      } else {
        errorMessage = `Ошибка: ${error.message}`;
      }
      loginError.textContent = errorMessage;
    }
  });

  // Обработчик для РЕГИСТРАЦИИ (привязан к submit формы)
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = registerEmailInput.value.trim();
    const nickname = registerNicknameInput.value.trim();
    const password = registerPasswordInput.value;
    registerError.textContent = '';

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser && nickname) {
        await updateProfile(auth.currentUser, { displayName: nickname });
      }
      console.log('Пользователь успешно зарегистрирован!');
      // При успешной регистрации формы должны закрыться, а профиль открыться.
      // onAuthStateChanged позаботится об этом.
    } catch (error) {
      console.error('Ошибка регистрации:', error.code, error.message);
      let errorMessage = 'Ошибка регистрации. Пожалуйста, попробуйте еще раз.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Этот email уже используется.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Некорректный формат email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Пароль должен быть не менее 6 символов.';
      } else {
        errorMessage = `Ошибка: ${error.message}`;
      }
      registerError.textContent = errorMessage;
    }
  });


  // Отслеживание состояния аутентификации (вход/выход)
  onAuthStateChanged(auth, (user) => {
    // !!! ВЫЗЫВАЕМ ФУНКЦИЮ ИЗ profile.js ДЛЯ ОБНОВЛЕНИЯ ОТОБРАЖЕНИЯ ПРОФИЛЯ !!!
    updateProfileDisplay(user);

    if (user) {
      // Пользователь вошел в систему
      // Скрываем формы и вкладки входа/регистрации
      loginForm.style.display = 'none';
      registerForm.style.display = 'none';
      loginTab.style.display = 'none';
      registerTab.style.display = 'none';

      // !!! Делаем фон auth-container прозрачным при входе !!!
      if (authContainer) {
        authContainer.classList.add('transparent-bg');
      }

      // Убеждаемся, что контейнер профиля видим
      if (profileInfoContainer) {
        profileInfoContainer.style.display = 'flex';
      }

    } else {
      // Пользователь вышел из системы или еще не вошел
      // Показываем формы и вкладки входа/регистрации
      showAuthForm(false); // По умолчанию показываем форму входа при выходе

      // showAuthForm уже позаботится об удалении 'transparent-bg'
      // И скрытии profileInfoContainer
    }
  });
});
