import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const auth = getAuth();
  const menuPanel = document.getElementById("menuPanel");
  const profilePanel = document.getElementById("profilePanel");
  const profileEmail = document.getElementById("profileEmail");
  const logoutBtn = document.getElementById("logoutBtn");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Пользователь вошел
      menuPanel.classList.remove("show");
      profilePanel.classList.remove("hidden");
      profileEmail.textContent = user.email;
    } else {
      // Пользователь вышел
      profilePanel.classList.add("hidden");
    }
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        alert("Вы вышли из аккаунта");
        profilePanel.classList.add("hidden");
      })
      .catch((error) => {
        console.error("Ошибка выхода:", error);
      });
  });
});
