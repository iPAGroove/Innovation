// auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const app = window.firebaseApp;
  const auth = window.auth;
  const db = window.db;

  // DOM elements
  const authModal = document.getElementById('authModal');
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginEmailInput = document.getElementById('loginEmail');
  const loginPasswordInput = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');
  const registerEmailInput = document.getElementById('registerEmail');
  const registerNicknameInput = document.getElementById('registerNickname');
  const registerPasswordInput = document.getElementById('registerPassword');
  const registerError = document.getElementById('registerError');

  if (!authModal || !loginTab || !registerTab || !loginForm || !registerForm) {
    console.error('❗ Ошибка: отсутствуют элементы для авторизации');
    return;
  }

  // TAB SWITCH
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = 'flex';
    registerForm.style.display = 'none';
    loginError.textContent = '';
    registerError.textContent = '';
  });
  registerTab.addEventListener('click', () => {
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
    loginError.textContent = '';
    registerError.textContent = '';
  });

  // HIDE/SHOW AUTH MODAL
  function hideAuthModal() {
    authModal.style.display = 'none';
  }
  function showAuthModal() {
    authModal.style.display = 'flex';
  }

  // LOGIN
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    try {
      await signInWithEmailAndPassword(auth, loginEmailInput.value.trim(), loginPasswordInput.value);
      loginEmailInput.value = '';
      loginPasswordInput.value = '';
      hideAuthModal();
    } catch (error) {
      loginError.textContent = getAuthErrorMessage(error.code, 'login');
    }
  });

  // REGISTER
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.textContent = '';
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerEmailInput.value.trim(),
        registerPasswordInput.value
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: registerNicknameInput.value.trim() });

      // Firestore user record
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        nickname: registerNicknameInput.value.trim(),
        isVip: false,
        vipEndDate: null,
        createdAt: new Date(),
        lastLogin: new Date(),
        isAdmin: false
      });

      registerEmailInput.value = '';
      registerNicknameInput.value = '';
      registerPasswordInput.value = '';
      hideAuthModal();
    } catch (error) {
      registerError.textContent = getAuthErrorMessage(error.code, 'register');
    }
  });

  // AUTO HIDE MODAL ON AUTH
  onAuthStateChanged(auth, (user) => {
    if (user) {
      hideAuthModal();
    } else {
      showAuthModal();
    }
  });

  // Ошибки
  function getAuthErrorMessage(code, mode) {
    switch (code) {
      case 'auth/invalid-email':         return 'Некорректный email.';
      case 'auth/user-disabled':         return 'Аккаунт заблокирован.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':    return 'Неверная почта или пароль.';
      case 'auth/email-already-in-use':  return 'Почта уже зарегистрирована.';
      case 'auth/weak-password':         return 'Пароль от 6 символов.';
      case 'auth/too-many-requests':     return 'Слишком много попыток. Попробуй позже.';
      default:                           return `Ошибка (${code})`;
    }
  }
});
