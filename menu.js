document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("navMenu");
  const menuPanel = document.getElementById("menuPanel");
  const profilePanel = document.getElementById("profilePanel");
  const authContainer = document.querySelector(".auth-container");

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuPanel.classList.toggle("show");

    const isAuthenticated = !profilePanel.classList.contains("hidden");

    if (menuPanel.classList.contains("show")) {
      // Если авторизован — показать профиль
      if (isAuthenticated) {
        profilePanel.classList.add("show");
        authContainer.style.display = "none";
      } else {
        authContainer.style.display = "block";
      }
    } else {
      profilePanel.classList.remove("show");
    }
  });

  document.addEventListener("click", (e) => {
    if (
      menuPanel.contains(e.target) ||
      menuBtn.contains(e.target) ||
      profilePanel.contains(e.target)
    ) {
      return;
    }

    menuPanel.classList.remove("show");
    profilePanel.classList.remove("show");
  });
});
