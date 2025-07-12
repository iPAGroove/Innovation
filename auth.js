// ========== ИМПОРТЫ ИЗ FIREBASE SDK ==========
// Эти импорты необходимы, потому что auth.js теперь будет модулем.
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile // Добавлено для установки никнейма
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  // Получаем экземпляр приложения Firebase из глобальной области видимости (инициализировано в index.html)
  // Это предполагает, что index.html устанавливает `window.firebaseApp`
  const app = window.firebaseApp; 
  if (!app) {
    console.error("Firebase App не инициализировано в index.html. Функции аутентификации могут не работать.");
    return;
  }
  const auth = getAuth(app); // Получаем экземпляр службы аутентификации из приложения

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
  const registerNicknameInput = document.getElementById('registerNickname'); // Добавлено поле никнейма
  const registerPasswordInput = document.getElementById('registerPassword');
  const registerError = document.getElementById('registerError');

  // По умолчанию показываем форму входа и скрываем статус пользователя
  // Убедитесь, что формы изначально скрыты через CSS и отображаются только при наличии класса 'active'
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
  userStatus.style.display = 'none';

  // Переключение между формами входа и регистрации
  loginTab.addEventListener('click', () => {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginTab.classList.add('active');
    registerTab.classList.remove('active'); 
    loginError.textContent = ''; // Очистка ошибок
    registerError.textContent = ''; // Очистка ошибок
  });

  registerTab.addEventListener('click', () => {
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    registerTab.classList.add('active'); 
    loginTab.classList.remove('active'); 
    loginError.textContent = ''; // Очистка ошибок
    registerError.textContent = ''; // Очистка ошибок
  });

  // Обработчик для ВХОДА (привязан к submit формы)
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Предотвращаем перезагрузку страницы
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;
    loginError.textContent = ''; // Очищаем предыдущие ошибки

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Пользователь успешно вошел!');
      // Firebase onAuthStateChanged обновит UI
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
        errorMessage = `Ошибка: ${error.message}`; // Более общая ошибка
      }
      loginError.textContent = errorMessage;
    }
  });

  // Обработчик для РЕГИСТРАЦИИ (привязан к submit формы)
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Предотвращаем перезагрузку страницы
    const email = registerEmailInput.value;
    const nickname = registerNicknameInput.value; // Получаем никнейм
    const password = registerPasswordInput.value;
    registerError.textContent = ''; // Очищаем предыдущие ошибки

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Обновляем профиль пользователя, если никнейм был введен
      if (auth.currentUser && nickname) {
        await updateProfile(auth.currentUser, { displayName: nickname });
      }
      console.log('Пользователь успешно зарегистрирован!');
      // Firebase onAuthStateChanged обновит UI
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
        errorMessage = `Ошибка: ${error.message}`; // Более общая ошибка
      }
      registerError.textContent = errorMessage;
    }
  });

  // Обработчик для выхода
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      console.log('Пользователь вышел.');
      // Firebase onAuthStateChanged обновит UI
    } catch (error) {
      console.error('Ошибка выхода:', error.message);
    }
  });

  // Отслеживание состояния аутентификации (вход/выход)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Пользователь вошел
      loggedInUser.textContent = `Вы вошли как: ${user.email}`;
      userStatus.style.display = 'block';
      loginForm.style.display = 'none';
      registerForm.style.display = 'none';
      loginTab.style.display = 'none'; // Скрываем вкладки после входа
      registerTab.style.display = 'none'; // Скрываем вкладки после входа
    } else {
      // Пользователь вышел
      loggedInUser.textContent = '';
      userStatus.style.display = 'none';
      loginForm.style.display = 'flex'; // Показываем форму входа по умолчанию
      registerForm.style.display = 'none';
      loginTab.style.display = 'block'; // Показываем вкладки
      registerTab.style.display = 'block'; // Показываем вкладки
      loginTab.classList.add('active'); // Активируем вкладку входа
      registerTab.classList.remove('active');
    }
  });
});
