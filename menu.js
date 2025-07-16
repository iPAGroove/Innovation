document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("navMenu");
  const menuPanel = document.getElementById("menuPanel");
  const profilePanel = document.getElementById("profilePanel");

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuPanel.classList.toggle("show");

    // Синхронно показываем или скрываем панель профиля
    if (menuPanel.classList.contains("show")) {
      profilePanel.classList.add("show");
    } else {
      profilePanel.classList.remove("show");
    }
  });

  document.addEventListener("click", (e) => {
    // НЕ закрываем, если клик внутри панели меню или профиля
    if (
      menuPanel.contains(e.target) ||
      menuBtn.contains(e.target) ||
      profilePanel.contains(e.target)
    ) {
      return;
    }

    // Закрытие
    menuPanel.classList.remove("show");
    profilePanel.classList.remove("show");
  });
});
