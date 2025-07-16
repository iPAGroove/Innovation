document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById('navMenu');
  const menuPanel = document.getElementById('menuPanel');
  const profilePanel = document.getElementById('profilePanel');

  let isLoggedIn = false;

  // Проверяем вход по Firebase
  import("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js").then(({ getAuth, onAuthStateChanged }) => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      isLoggedIn = !!user;
    });
  });

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isLoggedIn) {
      profilePanel.classList.toggle('show');
    } else {
      menuPanel.classList.toggle('show');
    }
  });

  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target)) {
      menuPanel.classList.remove('show');
      profilePanel.classList.remove('show');
    }
  });
});
