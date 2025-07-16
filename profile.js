import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const auth = getAuth();
  const profilePanel = document.getElementById("profilePanel");
  const authContainer = document.querySelector(".auth-container");
  const profileEmail = document.getElementById("profileEmail");
  const profileUsername = document.getElementById("profileUsername");
  const profileAvatar = document.getElementById("profileAvatar");
  const downloadCount = document.getElementById("downloadCount");
  const logoutBtn = document.getElementById("logoutBtn");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      profilePanel.classList.remove("hidden");
      authContainer.style.display = "none";

      // Пример: email и имя
      profileEmail.textContent = user.email;
      profileUsername.textContent = user.displayName || user.email.split("@")[0];

      // Аватар заглушка — можно подключить из Firebase позже
      profileAvatar.src = "https://i.ibb.co/r4H3rqD/avatar.jpg";

      // Загрузка количества загрузок (можно подключить Firebase Database)
      downloadCount.textContent = "0";
    } else {
      profilePanel.classList.add("hidden");
      authContainer.style.display = "block";
    }
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        alert("Вы вышли из аккаунта");
        profilePanel.classList.add("hidden");
        authContainer.style.display = "block";
      })
      .catch((error) => {
        console.error("Ошибка выхода:", error);
      });
  });
});
