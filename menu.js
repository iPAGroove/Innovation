document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("navMenu");
  const menuPanel = document.getElementById("menuPanel");
  const profilePanel = document.getElementById("profilePanel");

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuPanel.classList.toggle("show");

    // Показываем или скрываем только если пользователь авторизован
    const isAuthenticated = !profilePanel.classList.contains("hidden");

    if (menuPanel.classList.contains("show") && isAuthenticated) {
      profilePanel.classList.add("show");
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
