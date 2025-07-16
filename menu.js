document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById('navMenu');
  const menuPanel = document.getElementById('menuPanel');

  // Elements for login/registration forms
  const showLoginBtn = document.getElementById('showLoginBtn');
  const showRegisterBtn = document.getElementById('showRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Check if all essential elements exist before adding listeners
  if (!menuBtn || !menuPanel || !showLoginBtn || !showRegisterBtn || !loginForm || !registerForm) {
    console.error("One or more required HTML elements for the menu or authentication are missing. Please check your HTML IDs.");
    return; // Stop execution if elements are not found
  }

  // Event listener for opening/closing the main menu panel
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevents click from propagating to document
    menuPanel.classList.toggle('show');
  });

  // Event listener for closing the main menu panel when clicking outside
  document.addEventListener('click', (e) => {
    // Check if the click is outside the menuPanel AND outside the menuBtn
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
  // (Ensures user can type in fields without menu closing)
  loginForm.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  registerForm.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Optional: Handle form submissions (for demonstration, just log to console)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)
    console.log('Login form submitted!');
    console.log('Email:', document.getElementById('loginEmail').value);
    console.log('Password:', document.getElementById('loginPassword').value);

    // --- Here you would typically send data to a server for actual login ---
    alert('Вход выполнен (для демонстрации)');
    menuPanel.classList.remove('show'); // Close menu after successful submission
    // Optional: Clear form fields
    loginForm.reset();
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      alert('Пароли не совпадают!');
      return; // Stop the function if passwords don't match
    }

    console.log('Registration form submitted!');
    console.log('Username:', document.getElementById('registerUsername').value);
    console.log('Email:', document.getElementById('registerEmail').value);
    console.log('Password:', password);

    // --- Here you would typically send data to a server for actual registration ---
    alert('Регистрация успешна (для демонстрации)');
    menuPanel.classList.remove('show'); // Close menu after successful submission
    // Optional: Clear form fields
    registerForm.reset();
  });
});
