// ========== ИМПОРТЫ ИЗ FIREBASE SDK ==========
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile 
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

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
  const userStatus = document.getElementById('userStatus');
  const loggedInUser = document.getElementById('loggedInUser');
  const logoutBtn = document.getElementById('logoutBtn');

  // Поля ввода для входа
  const loginEmailInput = document.getElementById('loginEmail');
  const loginPasswordInput = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');

  // Поля ввода для регистрации
  const registerEmailInput = document.getElementById('registerEmail');
  const registerNicknameInput = document.getElementById('registerNickname'); 
  const registerPasswordInput = document.getElementById('registerPassword');
  const registerError = document.getElementById('registerError');

  // --- Отладочные логи ---
  // Проверьте, что все элементы найдены. Если какой-то null, это причина проблемы.
  console.log('Элемент loginTab:', loginTab);
  console.log('Элемент registerTab:', registerTab);
  console.log('Элемент loginForm:', loginForm);
  console.log('Элемент registerForm:', registerForm);
  console.log('Элемент registerBtn (внутри формы):', registerForm.querySelector('button[type="submit"]'));
  // --- Конец отладочных логов ---


  // По умолчанию показываем форму входа и скрываем статус пользователя
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
  userStatus.style.display = 'none';

  // Переключение между формами входа и регистрации
  loginTab.addEventListener('click', () => {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginTab.classList.add('active');
    registerTab.classList.remove('active'); 
    loginError.textContent = ''; 
    registerError.textContent = ''; 
  });

  registerTab.addEventListener('click', () => {
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    registerTab.classList.add('active'); 
    loginTab.classList.remove('active'); 
    loginError.textContent = ''; 
    registerError.textContent = ''; 
  });

  // Обработчик для ВХОДА (привязан к submit формы)
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    const email = loginEmailInput.value;
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
    const email = registerEmailInput.value;
    const nickname = registerNicknameInput.value; 
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

  // Обработчик для выхода
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      console.log('Пользователь вышел.');
    } catch (error) {
      console.error('Ошибка выхода:', error.message);
    }
  });

  // Отслеживание состояния аутентификации (вход/выход)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loggedInUser.textContent = `Вы вошли как: ${user.email}`;
      userStatus.style.display = 'block';
      loginForm.style.display = 'none';
      registerForm.style.display = 'none';
      loginTab.style.display = 'none'; 
      registerTab.style.display = 'none'; 
    } else {
      loggedInUser.textContent = '';
      userStatus.style.display = 'none';
      loginForm.style.display = 'flex'; 
      registerForm.style.display = 'none';
      loginTab.style.display = 'block'; 
      registerTab.style.display = 'block'; 
      loginTab.classList.add('active'); 
      registerTab.classList.remove('active');
    }
  });
});
