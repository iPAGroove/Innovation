import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const auth = getAuth();
  const menuPanel = document.getElementById("menuPanel");
  const profilePanel = document.getElementById("profilePanel");
  const profileEmail = document.getElementById("profileEmail");
  const logoutBtn = document.getElementById("logoutBtn");
  const authContainer = document.querySelector(".auth-container");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      profilePanel.classList.remove("hidden");
      profileEmail.textContent = user.email;
      authContainer.style.display = "none";
    } else {
      profilePanel.classList.add("hidden");
      authContainer.style.display = "block";
    }
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        alert("Вы вышли из аккаунта");
        profilePanel.classList.remove("show");
        profilePanel.classList.add("hidden");
        authContainer.style.display = "block";
      })
      .catch((error) => {
        console.error("Ошибка выхода:", error);
      });
  });
});
