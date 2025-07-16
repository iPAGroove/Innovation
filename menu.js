document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById('navMenu');
  const menuPanel = document.getElementById('menuPanel');

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuPanel.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (
      !menuPanel.contains(e.target) &&
      !menuBtn.contains(e.target)
    ) {
      menuPanel.classList.remove('show');
    }
  });
});
