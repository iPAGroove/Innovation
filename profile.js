import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const auth = getAuth();
  const menuPanel = document.getElementById("menuPanel"); // Добавлено, так как используется в auth-handler, и чтобы быть уверенным в целостности
  const profilePanel = document.getElementById("profilePanel");
  const profileUsername = document.getElementById("profileUsername"); // Изменено с profileEmail
  const logoutBtn = document.getElementById("logoutBtn");
  const authContainer = document.querySelector(".auth-container"); // Добавлено, так как используется в auth-handler, и чтобы быть уверенным в целостности

  const accountSettingsSection = document.getElementById("accountSettingsSection");
  const accountSettingsContent = document.getElementById("accountSettingsContent");
  const accountSettingsArrow = document.getElementById("accountSettingsArrow");

  // Обработчик для секции "Account Settings"
  if (accountSettingsSection && accountSettingsContent && accountSettingsArrow) {
    accountSettingsSection.addEventListener("click", () => {
      accountSettingsContent.classList.toggle("hidden");
      accountSettingsContent.classList.toggle("show"); // Добавляем/убираем класс show
      accountSettingsArrow.classList.toggle("rotated");
    });
  }


  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Авторизован
      profilePanel.classList.remove("hidden");
      // Устанавливаем имя пользователя
      if (user.displayName) {
        profileUsername.textContent = user.displayName;
      } else if (user.email) {
        // Если displayName нет, используем часть email до "@"
        profileUsername.textContent = user.email.split('@')[0];
      }
      authContainer.style.display = "none";
      // Также убедимся, что меню скрыто, если это было открыто из меню
      if (menuPanel) { // Проверка на существование menuPanel
        menuPanel.classList.remove("show");
      }

    } else {
      // Не авторизован
      profilePanel.classList.add("hidden");
      authContainer.style.display = "block";
      // Скрыть содержимое "Account Settings" при выходе
      if (accountSettingsContent) {
        accountSettingsContent.classList.add("hidden");
        accountSettingsContent.classList.remove("show"); // Убираем класс show
        accountSettingsArrow.classList.remove("rotated");
      }
    }
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        alert("Вы вышли из аккаунта");
        profilePanel.classList.remove("show");
        profilePanel.classList.add("hidden");
        authContainer.style.display = "block";
        // Скрыть содержимое "Account Settings" при выходе
        if (accountSettingsContent) {
          accountSettingsContent.classList.add("hidden");
          accountSettingsContent.classList.remove("show"); // Убираем класс show
          accountSettingsArrow.classList.remove("rotated");
        }
      })
      .catch((error) => {
        console.error("Ошибка выхода:", error);
      });
  });
});
