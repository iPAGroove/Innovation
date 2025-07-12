// auth.js

// ... (существующие импорты и инициализация) ...

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
  // const userStatus = document.getElementById('userStatus'); // Этот элемент может быть удален или переосмыслен
  // const loggedInUser = document.getElementById('loggedInUser'); // Этот элемент может быть удален или переосмыслен
  const logoutBtn = document.getElementById('logoutBtn'); // Если перенесли кнопку, она будет найдена в новом контейнере

  // НОВЫЕ ЭЛЕМЕНТЫ DOM ДЛЯ ПРОФИЛЯ
  const profileInfoContainer = document.getElementById('profileInfoContainer');
  const profileNicknameDisplay = document.getElementById('profileNicknameDisplay');
  const loggedInUserDisplay = document.getElementById('loggedInUserDisplay'); // Если выводим email пользователя

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
  console.log('Элемент profileInfoContainer:', profileInfoContainer); // НОВЫЙ ЛОГ
  // --- Конец отладочных логов ---

  // Функция для показа формы и переключения активных вкладок
  function showAuthForm(isRegister) {
    loginForm.classList.toggle('active', !isRegister);
    registerForm.classList.toggle('active', isRegister);

    loginForm.style.display = isRegister ? 'none' : 'flex';
    registerForm.style.display = isRegister ? 'flex' : 'none';

    // Также скрываем контейнер профиля, когда показываем формы аутентификации
    if (profileInfoContainer) { // Проверяем существование элемента
      profileInfoContainer.style.display = 'none';
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
  // userStatus.style.display = 'none'; // Этот элемент может быть удален

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
      // onAuthStateChanged будет вызван автоматически и обновит UI
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
      // onAuthStateChanged будет вызван автоматически и обновит UI
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

  // Обработчик для выхода (если кнопка была перемещена в profileInfoContainer, она все равно будет найдена)
  // Убедитесь, что logoutBtn существует, прежде чем добавлять слушатель
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


  // Отслеживание состояния аутентификации (вход/выход)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Пользователь вошел в систему
      if (profileInfoContainer) {
        profileNicknameDisplay.textContent = user.displayName || user.email.split('@')[0]; // Показываем никнейм или часть email
        loggedInUserDisplay.textContent = user.email; // Показываем полный email
        profileInfoContainer.style.display = 'flex'; // Показываем контейнер профиля
      }

      // Скрываем формы и вкладки входа/регистрации
      loginForm.style.display = 'none';
      registerForm.style.display = 'none';
      loginTab.style.display = 'none'; 
      registerTab.style.display = 'none'; 
      // userStatus.style.display = 'none'; // Если userStatus больше не нужен

    } else {
      // Пользователь вышел из системы
      if (profileInfoContainer) {
        profileInfoContainer.style.display = 'none'; // Скрываем контейнер профиля
      }

      // Показываем формы и вкладки входа/регистрации
      // Сохраняем текущую активную вкладку, если она есть
      showAuthForm(registerTab.classList.contains('active')); 
    }
  });
});
