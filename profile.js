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
      authContainer.classList.add("hidden");

      profileEmail.textContent = user.email;
      profileUsername.textContent = user.displayName || user.email.split("@")[0];
      profileAvatar.src = "https://i.ibb.co/r4H3rqD/avatar.jpg";
      downloadCount.textContent = "0";
    } else {
      profilePanel.classList.add("hidden");
      authContainer.classList.remove("hidden");
    }
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        alert("Вы вышли из аккаунта");
        profilePanel.classList.add("hidden");
        authContainer.classList.remove("hidden");
      })
      .catch((error) => {
        console.error("Ошибка выхода:", error);
      });
  });
});
