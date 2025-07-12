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


  // !!! УДАЛЕНЫ ССЫЛКИ НА ЭЛЕМЕНТЫ ПРОФИЛЯ, теперь это в profile.js !!!
  // const profileInfoContainer = document.getElementById('profileInfoContainer');
  // const profileNicknameDisplay = document.getElementById('profileNicknameDisplay');
  // const loggedInUserDisplay = document.getElementById('loggedInUserDisplay');
  // const logoutBtn = document.getElementById('logoutBtn');


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
  // --- Конец отладочных логов ---

  // Функция для показа формы и переключения активных вкладок
  function showAuthForm(isRegister) {
    loginForm.classList.toggle('active', !isRegister);
    registerForm.classList.toggle('active', isRegister);

    loginForm.style.display = isRegister ? 'none' : 'flex';
    registerForm.style.display = isRegister ? 'flex' : 'none';

    // !!! ВЫЗЫВАЕМ ФУНКЦИЮ ИЗ profile.js ДЛЯ СКРЫТИЯ ПРОФИЛЯ !!!
    updateProfileDisplay(null); // Передаем null, чтобы скрыть профиль

    // !!! Убираем прозрачность фона auth-container при показе форм !!!
    if (authContainer) {
        authContainer.classList.remove('transparent-bg');
    }

    // Показываем/скрываем вкладки
    loginTab.style.display = 'block'; 
    registerTab.style.display = 'block'; 
    loginTab.classList.toggle('active', !isRegister);
    registerTab.classList.toggle('active', isRegister);

    // Очищаем ошибки при смене формы
    loginError.textContent = '';
    registerError.textContent = '';
  }

  // По умолчанию показываем форму входа
  showAuthForm(false);

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

  // !!! ЛОГИКА КНОПКИ ВЫХОДА ПЕРЕНЕСЕНА В profile.js (если вы её там реализовали) !!!
  // Если кнопка выхода находится в auth-container и не в profile-card, то оставьте здесь.
  // В текущем HTML она находится в profileInfoContainer, поэтому она будет управляться profile.js
  /*
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) { 
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        console.log('Пользователь вышел.');
      } catch (error) {
        console.error('Ошибка выхода:', error.message);
      }
    });
  }
  */


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

    } else {
      // Пользователь вышел из системы
      // Показываем формы и вкладки входа/регистрации
      showAuthForm(registerTab.classList.contains('active')); 

      // showAuthForm уже позаботится об удалении 'transparent-bg'
    }
  });
});
