document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById('navMenu');
  const menuPanel = document.getElementById('menuPanel');

  // New elements for login/registration
  const showLoginBtn = document.getElementById('showLoginBtn');
  const showRegisterBtn = document.getElementById('showRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Event listener for opening/closing the main menu panel
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuPanel.classList.toggle('show');
  });

  // Event listener for closing the main menu panel when clicking outside
  document.addEventListener('click', (e) => {
    if (
      !menuPanel.contains(e.target) &&
      !menuBtn.contains(e.target)
    ) {
      menuPanel.classList.remove('show');
    }
  });

  // Event listeners for switching between login and registration forms
  showLoginBtn.addEventListener('click', () => {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    showLoginBtn.classList.add('active');
    showRegisterBtn.classList.remove('active');
  });

  showRegisterBtn.addEventListener('click', () => {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    showRegisterBtn.classList.add('active');
    showLoginBtn.classList.remove('active');
  });

  // Prevent closing the menu panel when clicking inside the auth forms
  loginForm.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  registerForm.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Optional: Handle form submissions (for demonstration, just log to console)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Login form submitted!');
    console.log('Email:', document.getElementById('loginEmail').value);
    console.log('Password:', document.getElementById('loginPassword').value);
    // Here you would typically send data to a server
    alert('Вход выполнен (для демонстрации)');
    menuPanel.classList.remove('show'); // Close menu after submission
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }
    console.log('Registration form submitted!');
    console.log('Username:', document.getElementById('registerUsername').value);
    console.log('Email:', document.getElementById('registerEmail').value);
    console.log('Password:', password);
    // Here you would typically send data to a server
    alert('Регистрация успешна (для демонстрации)');
    menuPanel.classList.remove('show'); // Close menu after submission
  });
});
