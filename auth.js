// Импортируем только необходимые функции из Firebase, так как initializeApp уже есть в index.html
// Мы больше не импортируем getAuth, createUserWithEmailAndPassword и т.д. здесь напрямую,
// потому что auth объект будет получен из window.firebaseAuth, который инициализирован в index.html.

document.addEventListener("DOMContentLoaded", () => {
  // Получаем объект auth из глобального scope, который инициализирован в index.html
  const auth = window.firebaseAuth;
  // Убеждаемся, что функции Firebase Auth доступны через auth объект
  const {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
  } = firebase; // Используем глобальный объект Firebase для доступа к методам auth

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
  // Кнопка входа теперь не имеет отдельного обработчика click, а является частью submit формы
  const loginError = document.getElementById('loginError');

  // Поля ввода для регистрации
  const registerEmailInput = document.getElementById('registerEmail');
  const registerNicknameInput = document.getElementById('registerNickname'); // Добавлено поле никнейма
  const registerPasswordInput = document.getElementById('registerPassword');
  // Кнопка регистрации теперь не имеет отдельного обработчика click, а является частью submit формы
  const registerError = document.getElementById('registerError');

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
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
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
        // Убедитесь, что firebase.auth.Auth.updateProfile доступен
        await firebase.auth().currentUser.updateProfile({ displayName: nickname });
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
      loginTab.style.display = 'none';
      registerTab.style.display = 'none';
    } else {
      // Пользователь вышел
      loggedInUser.textContent = '';
      userStatus.style.display = 'none';
      loginForm.style.display = 'flex'; // Показываем форму входа по умолчанию
      registerForm.style.display = 'none';
      loginTab.style.display = 'block'; // Показываем вкладки
      registerTab.style.display = 'block';
      loginTab.classList.add('active'); // Активируем вкладку входа
      registerTab.classList.remove('active');
    }
  });
});
