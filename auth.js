// auth.js

// ========== ИМПОРТЫ ИЗ FIREBASE SDK ==========
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut, // 'signOut' is imported but not used in the provided snippet. Keep it if needed elsewhere.
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// !!! ИМПОРТ ФУНКЦИИ ИЗ НОВОГО profile.js !!!
import {
  updateProfileDisplay
} from './profile.js';

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
  const profileInfoContainer = document.getElementById('profileInfoContainer');

  // Поля ввода для входа
  const loginEmailInput = document.getElementById('loginEmail');
  const loginPasswordInput = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');

  // Поля ввода для регистрации
  const registerEmailInput = document.getElementById('registerEmail');
  const registerNicknameInput = document.getElementById('registerNickname');
  const registerPasswordInput = document.getElementById('registerPassword');
  const registerError = document.getElementById('registerError');

  // --- Отладочные логи (можно удалить в продакшене) ---
  console.log('Элемент loginTab:', loginTab);
  console.log('Элемент registerTab:', registerTab);
  console.log('Элемент loginForm:', loginForm);
  console.log('Элемент registerForm:', registerForm);
  console.log('Элемент authContainer:', authContainer);
  console.log('Элемент profileInfoContainer:', profileInfoContainer);
  // --- Конец отладочных логов ---

  /**
   * @function showAuthForm
   * @description Handles the display of authentication forms (login/register) and related UI elements.
   * @param {boolean} isRegister - If true, shows the registration form; otherwise, shows the login form.
   */
  function showAuthForm(isRegister) {
    // Ensure both forms exist before manipulating
    if (!loginForm || !registerForm || !loginTab || !registerTab || !authContainer || !profileInfoContainer) {
      console.error("One or more required DOM elements for authentication forms are missing.");
      return;
    }

    // Hide profile container when showing auth forms
    profileInfoContainer.style.display = 'none';

    // Toggle active classes for tabs and forms
    loginTab.classList.toggle('active', !isRegister);
    registerTab.classList.toggle('active', isRegister);
    loginForm.classList.toggle('active', !isRegister);
    registerForm.classList.toggle('active', isRegister);

    // Set display style for forms
    loginForm.style.display = isRegister ? 'none' : 'flex';
    registerForm.style.display = isRegister ? 'flex' : 'none';

    // Make auth-container background non-transparent when showing forms
    authContainer.classList.remove('transparent-bg');

    // Show tabs
    loginTab.style.display = 'block';
    registerTab.style.display = 'block';

    // Clear any previous error messages
    loginError.textContent = '';
    registerError.textContent = '';
  }

  // Event listeners for tab switching
  loginTab.addEventListener('click', () => {
    showAuthForm(false); // Show login form
  });

  registerTab.addEventListener('click', () => {
    showAuthForm(true); // Show registration form
  });

  // Event listener for LOGIN form submission
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;
    loginError.textContent = ''; // Clear previous error

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Пользователь успешно вошел!');
      // onAuthStateChanged will handle UI updates upon successful login
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
        case 'auth/invalid-credential': // Modern Firebase error for incorrect email/password
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

  // Event listener for REGISTRATION form submission
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission
    const email = registerEmailInput.value.trim();
    const nickname = registerNicknameInput.value.trim();
    const password = registerPasswordInput.value;
    registerError.textContent = ''; // Clear previous error

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update user profile with nickname if provided
      if (auth.currentUser && nickname) {
        await updateProfile(auth.currentUser, {
          displayName: nickname
        });
      }
      console.log('🎉 Пользователь успешно зарегистрирован!');
      // onAuthStateChanged will handle UI updates upon successful registration
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

  // Observing authentication state changes (login/logout)
  onAuthStateChanged(auth, (user) => {
    // Call the function from profile.js to update profile display
    updateProfileDisplay(user);

    if (user) {
      // User is signed in
      console.log('Пользователь вошел в систему:', user.email, user.displayName);

      // Hide auth forms and tabs
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'none';
      if (loginTab) loginTab.style.display = 'none';
      if (registerTab) registerTab.style.display = 'none';

      // Make auth-container background transparent when logged in
      if (authContainer) {
        authContainer.classList.add('transparent-bg');
      }

      // Ensure profile container is visible
      if (profileInfoContainer) {
        profileInfoContainer.style.display = 'flex';
      }

    } else {
      // User is signed out
      console.log('Пользователь вышел из системы.');
      // Show auth forms and tabs (default to login form)
      showAuthForm(false);
      // showAuthForm already handles removing 'transparent-bg' and hiding 'profileInfoContainer'
    }
  });
});
