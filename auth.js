// auth.js

// ========== ИМПОРТЫ ИЗ FIREBASE SDK ==========
// Эти импорты УДАЛЕНЫ, так как используются глобальные объекты из index.html
// import {
//   getAuth,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   onAuthStateChanged,
//   signOut,
//   updateProfile
// } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// !!! ИМПОРТ ФУНКЦИИ ИЗ profile.js !!!
// Убедитесь, что profile.js загружается ДО auth.js в index.html
import {
  updateProfileDisplay
} from './profile.js';

document.addEventListener("DOMContentLoaded", () => {
  // Получаем объекты app, auth из глобального window, которые инициализированы в index.html
  const app = window.firebaseApp;
  if (!app) {
    console.error("Firebase App не инициализировано в index.html. Функции аутентификации могут не работать.");
    return;
  }
  // Используем глобальный объект auth, инициализированный в index.html
  const auth = window.auth;
  if (!auth) {
    console.error("Firebase Auth не инициализирован глобально. Проверьте ваш index.html.");
    return;
  }


  // Элементы DOM для форм и статуса
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authContainer = document.querySelector('.auth-container');
  const profileInfoContainer = document.getElementById('profileInfoContainer');
  const logoutBtn = document.getElementById('logoutBtn'); // Кнопка выхода

  // Поля ввода для входа
  const loginEmailInput = document.getElementById('loginEmail');
  const loginPasswordInput = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');

  // Поля ввода для регистрации
  const registerEmailInput = document.getElementById('registerEmail');
  const registerNicknameInput = document.getElementById('registerNickname');
  const registerPasswordInput = document.getElementById('registerPassword');
  const registerError = document.getElementById('registerError');

  // Проверка существования всех необходимых элементов
  const requiredElements = [
    loginTab, registerTab, loginForm, registerForm, authContainer,
    profileInfoContainer, logoutBtn, loginEmailInput, loginPasswordInput,
    loginError, registerEmailInput, registerNicknameInput, registerPasswordInput,
    registerError
  ];

  if (requiredElements.some(el => !el)) {
    console.error("Один или несколько обязательных DOM элементов для аутентификации/профиля отсутствуют.");
    // alert("Проблема с загрузкой страницы. Пожалуйста, попробуйте позже."); // Можно добавить для пользователя
    return; // Прерываем выполнение скрипта, если элементы не найдены
  }


  /**
   * @function showAuthForm
   * @description Handles the display of authentication forms (login/register) and related UI elements.
   * @param {boolean} isRegister - If true, shows the registration form; otherwise, shows the login form.
   */
  function showAuthForm(isRegister) {
    // Скрываем контейнер профиля, когда показываем формы аутентификации
    profileInfoContainer.style.display = 'none';

    // Переключаем активные классы для вкладок и форм
    loginTab.classList.toggle('active', !isRegister);
    registerTab.classList.toggle('active', isRegister);
    loginForm.classList.toggle('active', !isRegister);
    registerForm.classList.toggle('active', isRegister);

    // Устанавливаем стиль display для форм
    loginForm.style.display = isRegister ? 'none' : 'flex';
    registerForm.style.display = isRegister ? 'flex' : 'none';

    // Удаляем прозрачный фон auth-контейнера при показе форм
    authContainer.classList.remove('transparent-bg');

    // Показываем вкладки
    loginTab.style.display = 'block';
    registerTab.style.display = 'block';

    // Очищаем предыдущие сообщения об ошибках
    loginError.textContent = '';
    registerError.textContent = '';
  }

  // Слушатели событий для переключения вкладок
  loginTab.addEventListener('click', () => {
    showAuthForm(false); // Показать форму входа
  });

  registerTab.addEventListener('click', () => {
    showAuthForm(true); // Показать форму регистрации
  });

  // Слушатель события для отправки формы ВХОДА
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Предотвращаем стандартную отправку формы
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;
    loginError.textContent = ''; // Очищаем предыдущую ошибку

    try {
      // Используем метод объекта auth
      await auth.signInWithEmailAndPassword(email, password);
      console.log('✅ Пользователь успешно вошел!');
      // onAuthStateChanged обработает обновления UI при успешном входе
      // Очищаем поля формы
      loginEmailInput.value = '';
      loginPasswordInput.value = '';
    } catch (error) {
      console.error('❌ Ошибка входа:', error.code, error.message);
      let errorMessage = 'Ошибка входа. Пожалуйста, попробуйте еще раз.';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Некорректный формат email. Пожалуйста, проверьте свой адрес.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Ваша учетная запись отключена. Пожалуйста, свяжитесь с поддержкой.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': // Современная ошибка Firebase для неверных данных
          errorMessage = 'Неправильный email или пароль. Пожалуйста, проверьте свои данные.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Слишком много неудачных попыток входа. Попробуйте позже.';
          break;
        default:
          errorMessage = `Произошла неизвестная ошибка: ${error.message}`;
          break;
      }
      loginError.textContent = errorMessage;
    }
  });

  // Слушатель события для отправки формы РЕГИСТРАЦИИ
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Предотвращаем стандартную отправку формы
    const email = registerEmailInput.value.trim();
    const nickname = registerNicknameInput.value.trim();
    const password = registerPasswordInput.value;
    registerError.textContent = ''; // Очищаем предыдущую ошибку

    try {
      // Используем метод объекта auth
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      // Обновляем профиль пользователя с никнеймом, если предоставлен
      if (auth.currentUser && nickname) {
        // Используем метод объекта auth.currentUser
        await auth.currentUser.updateProfile({
          displayName: nickname
        });
      }
      console.log('🎉 Пользователь успешно зарегистрирован!');
      // onAuthStateChanged обработает обновления UI при успешной регистрации
      // Очищаем поля формы
      registerEmailInput.value = '';
      registerNicknameInput.value = '';
      registerPasswordInput.value = '';
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error.code, error.message);
      let errorMessage = 'Ошибка регистрации. Пожалуйста, попробуйте еще раз.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Этот email уже используется. Пожалуйста, войдите или используйте другой email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Некорректный формат email. Пожалуйста, проверьте свой адрес.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Пароль должен быть не менее 6 символов.';
          break;
        default:
          errorMessage = `Произошла неизвестная ошибка: ${error.message}`;
          break;
      }
      registerError.textContent = errorMessage;
    }
  });

  // Слушатель для кнопки ВЫХОД
  logoutBtn.addEventListener('click', async () => {
    try {
      // Используем метод объекта auth
      await auth.signOut();
      console.log('👋 Пользователь успешно вышел из системы.');
      // onAuthStateChanged обработает обновления UI при выходе
    } catch (error) {
      console.error('❌ Ошибка при выходе:', error.message);
      alert('Не удалось выйти из системы. Пожалуйста, попробуйте еще раз.');
    }
  });


  // Наблюдение за изменениями состояния аутентификации (вход/выход)
  // Эта функция будет вызвана при каждой загрузке страницы и при каждом изменении состояния входа
  // Используем метод объекта auth
  auth.onAuthStateChanged((user) => {
    // Вызываем функцию из profile.js для обновления отображения профиля
    // updateProfileDisplay управляет видимостью authContainer, profileInfoContainer, табов и форм
    updateProfileDisplay(user);

    if (user) {
      console.log('Пользователь вошел в систему:', user.email, user.displayName || '[Без никнейма]');
    } else {
      console.log('Пользователь вышел из системы.');
      // Показываем формы аутентификации (по умолчанию форму входа)
      // Это уже обрабатывается функцией updateProfileDisplay, но для ясности:
      // showAuthForm(false); // Показываем форму входа
    }
  });
});
