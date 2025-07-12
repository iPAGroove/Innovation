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
  const authContainer = document.querySelector('.auth-container'); // !!! ДОБАВЛЕНО: получаем auth-container !!!


  // НОВЫЕ ЭЛЕМЕНТЫ DOM ДЛЯ ПРОФИЛЯ
  const profileInfoContainer = document.getElementById('profileInfoContainer');
  const profileNicknameDisplay = document.getElementById('profileNicknameDisplay');
  // Если вы раскомментировали email и кнопку выхода в HTML, то раскомментируйте и здесь:
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
  console.log('Элемент profileInfoContainer:', profileInfoContainer);
  console.log('Элемент profileNicknameDisplay:', profileNicknameDisplay);
  console.log('Элемент authContainer:', authContainer); // !!! НОВЫЙ ЛОГ !!!
  // console.log('Элемент loggedInUserDisplay:', loggedInUserDisplay);
  // console.log('Элемент logoutBtn:', logoutBtn);
  // --- Конец отладочных логов ---

  // Функция для показа формы и переключения активных вкладок
  function showAuthForm(isRegister) {
    loginForm.classList.toggle('active', !isRegister);
    registerForm.classList.toggle('active', isRegister);

    loginForm.style.display = isRegister ? 'none' : 'flex';
    registerForm.style.display = isRegister ? 'flex' : 'none';

    // Скрываем контейнер профиля, когда показываем формы аутентификации
    if (profileInfoContainer) {
      profileInfoContainer.style.display = 'none';
    }
    
    // !!! ДОБАВЛЕНО: Убираем прозрачность фона auth-container при показе форм !!!
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

  // Обработчик для выхода (если кнопка была раскомментирована в HTML)
  // if (logoutBtn) { 
  //   logoutBtn.addEventListener('click', async () => {
  //     try {
  //       await signOut(auth);
  //       console.log('Пользователь вышел.');
  //     } catch (error) {
  //       console.error('Ошибка выхода:', error.message);
  //     }
  //   });
  // }


  // Отслеживание состояния аутентификации (вход/выход)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Пользователь вошел в систему
      if (profileInfoContainer && profileNicknameDisplay) {
        profileNicknameDisplay.textContent = 'iPA Groove'; // Показываем статический текст "iPA Groove"
        // Если хотите показывать никнейм пользователя, раскомментируйте следующую строку и закомментируйте предыдущую:
        // profileNicknameDisplay.textContent = user.displayName || user.email.split('@')[0]; 
        
        // Если email отображается, раскомментируйте:
        // if (loggedInUserDisplay) loggedInUserDisplay.textContent = user.email; 

        profileInfoContainer.style.display = 'flex'; // Показываем контейнер профиля
      }

      // Скрываем формы и вкладки входа/регистрации
      loginForm.style.display = 'none';
      registerForm.style.display = 'none';
      loginTab.style.display = 'none'; 
      registerTab.style.display = 'none'; 
      
      // !!! ДОБАВЛЕНО: Делаем фон auth-container прозрачным при входе !!!
      if (authContainer) {
          authContainer.classList.add('transparent-bg');
      }

    } else {
      // Пользователь вышел из системы
      if (profileInfoContainer) {
        profileInfoContainer.style.display = 'none'; // Скрываем контейнер профиля
      }

      // Показываем формы и вкладки входа/регистрации
      showAuthForm(registerTab.classList.contains('active')); 

      // showAuthForm уже позаботится об удалении 'transparent-bg'
    }
  });
});
