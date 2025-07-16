import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { auth } from "./firebase-init.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const showLoginBtn = document.getElementById("showLoginBtn");
  const showRegisterBtn = document.getElementById("showRegisterBtn");
  const menuPanel = document.getElementById("menuPanel");
  const profilePanel = document.getElementById("profilePanel");
  const profileEmail = document.getElementById("profileEmail");
  const logoutBtn = document.getElementById("logoutBtn");

  // Переключение вкладок
  showLoginBtn.addEventListener("click", () => {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    showLoginBtn.classList.add("active");
    showRegisterBtn.classList.remove("active");
  });

  showRegisterBtn.addEventListener("click", () => {
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    showRegisterBtn.classList.add("active");
    showLoginBtn.classList.remove("active");
  });

  // Вход
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert("Ошибка входа: " + err.message);
    }
  });

  // Регистрация
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert("Ошибка регистрации: " + err.message);
    }
  });

  // Выход
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
  });

  // Отслеживание авторизации
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Пользователь авторизован
      profileEmail.textContent = user.email;
      profilePanel.classList.remove("hidden");
      profilePanel.classList.add("show");

      menuPanel.classList.remove("show");

      // Скрыть формы входа/регистрации
      loginForm.classList.add("hidden");
      registerForm.classList.add("hidden");
    } else {
      // Пользователь вышел
      profilePanel.classList.remove("show");
      profilePanel.classList.add("hidden");

      // Показать формы
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
      showLoginBtn.classList.add("active");
      showRegisterBtn.classList.remove("active");
    }
  });
});
