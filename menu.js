import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const auth = window.firebaseAuth;

  const menuBtn = document.getElementById('navMenu');
  const menuPanel = document.getElementById('menuPanel');

  // Открытие панели
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuPanel.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!menuPanel.contains(e.target) && !menuBtn.contains(e.target)) {
      menuPanel.classList.remove('show');
    }
  });

  // Auth UI
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const userStatus = document.getElementById("userStatus");
  const loggedInUser = document.getElementById("loggedInUser");
  const logoutBtn = document.getElementById("logoutBtn");

  loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  });

  registerTab.addEventListener("click", () => {
    loginTab.classList.remove("active");
    registerTab.classList.add("active");
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
  });

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

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert("Ошибка регистрации: " + err.message);
    }
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth);
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userStatus.classList.remove("hidden");
      loginForm.classList.add("hidden");
      registerForm.classList.add("hidden");
      loggedInUser.textContent = user.email;
    } else {
      userStatus.classList.add("hidden");
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
      loginTab.classList.add("active");
      registerTab.classList.remove("active");
    }
  });
});
