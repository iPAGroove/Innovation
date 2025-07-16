// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const menuBtn = document.getElementById('navMenu');
  const menuPanel = document.getElementById('menuPanel');
  const userInfoDiv = document.getElementById('userInfo');
  const authFormsContainer = document.getElementById('authFormsContainer');
  const displayUsername = document.getElementById('displayUsername');
  const displayUserId = document.getElementById('displayUserId');
  const logoutBtn = document.getElementById('logoutBtn');

  const showLoginBtn = document.getElementById('showLoginBtn');
  const showRegisterBtn = document.getElementById('showRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  const messageBox = document.getElementById('messageBox');
  const messageText = document.getElementById('messageText');
  const closeMessageBoxBtn = document.getElementById('closeMessageBox');

  // --- Firebase Initialization ---
  let app, auth, db, userId;
  let isAuthReady = false; // Flag to ensure Firebase auth is ready

  try {
    // Access global variables provided by the Canvas environment
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');

    if (Object.keys(firebaseConfig).length === 0) {
      console.error("Firebase configuration is missing or invalid.");
      showMessage("Ошибка: Конфигурация Firebase отсутствует.");
      return;
    }

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Initial authentication check
    // Use __initial_auth_token if available, otherwise sign in anonymously
    if (typeof __initial_auth_token !== 'undefined') {
      await signInWithCustomToken(auth, __initial_auth_token);
    } else {
      await signInAnonymously(auth);
    }

    // Listen for authentication state changes
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        userId = user.uid;
        isAuthReady = true;
        console.log("User is signed in:", userId);
        
        // Try to get user's display name from Firestore
        const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/user_profiles`, "profile");
        const userProfileSnap = await getDoc(userProfileRef);

        if (userProfileSnap.exists()) {
          const userData = userProfileSnap.data();
          displayUsername.textContent = userData.username || user.email || "Пользователь";
        } else {
          displayUsername.textContent = user.email || "Пользователь";
        }
        displayUserId.textContent = userId;
        updateUIForAuthState(true);
      } else {
        userId = null;
        isAuthReady = true;
        console.log("User is signed out.");
        updateUIForAuthState(false);
      }
    });

  } catch (error) {
    console.error("Error initializing Firebase or during initial auth:", error);
    showMessage(`Ошибка инициализации: ${error.message}`);
    return;
  }

  // --- Helper function for custom message box ---
  function showMessage(message) {
    messageText.textContent = message;
    messageBox.classList.remove('hidden');
    // Add an overlay to prevent interaction with the background
    const overlay = document.createElement('div');
    overlay.classList.add('message-box-overlay');
    overlay.classList.add('show');
    document.body.appendChild(overlay);

    closeMessageBoxBtn.onclick = () => {
      messageBox.classList.add('hidden');
      overlay.remove(); // Remove overlay when message box is closed
    };
  }

  // --- UI Update Function based on Auth State ---
  function updateUIForAuthState(loggedIn) {
    if (loggedIn) {
      authFormsContainer.classList.add('hidden');
      userInfoDiv.classList.remove('hidden');
      menuPanel.style.justifyContent = 'flex-start'; // Adjust alignment if needed
    } else {
      authFormsContainer.classList.remove('hidden');
      userInfoDiv.classList.add('hidden');
      menuPanel.style.justifyContent = 'center'; // Reset alignment
      // Ensure login form is active by default when logged out
      showLoginBtn.click(); 
    }
  }

  // --- Event Listeners for Menu Panel ---
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuPanel.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (
      !menuPanel.contains(e.target) &&
      !menuBtn.contains(e.target) &&
      !messageBox.contains(e.target) // Don't close if clicking on message box
    ) {
      menuPanel.classList.remove('show');
    }
  });

  // --- Event Listeners for Auth Forms ---
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

  loginForm.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  registerForm.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // --- Firebase Login ---
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isAuthReady) {
      showMessage("Подождите, пока инициализируется аутентификация.");
      return;
    }

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage('Вход выполнен успешно!');
      loginForm.reset(); // Clear form
      menuPanel.classList.remove('show'); // Close menu
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Ошибка входа. Пожалуйста, проверьте email и пароль.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Неверный email или пароль.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Неверный формат email.";
      }
      showMessage(errorMessage);
    }
  });

  // --- Firebase Registration ---
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isAuthReady) {
      showMessage("Подождите, пока инициализируется аутентификация.");
      return;
    }

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      showMessage('Пароли не совпадают!');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save username to Firestore
      const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/user_profiles`, "profile");
      await setDoc(userProfileRef, {
        username: username,
        email: email,
        createdAt: new Date()
      });

      showMessage('Регистрация успешна!');
      registerForm.reset(); // Clear form
      menuPanel.classList.remove('show'); // Close menu
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Ошибка регистрации.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Этот email уже используется.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Пароль должен быть не менее 6 символов.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Неверный формат email.";
      }
      showMessage(errorMessage);
    }
  });

  // --- Firebase Logout ---
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      showMessage('Вы успешно вышли из аккаунта.');
      menuPanel.classList.remove('show'); // Close menu
    } catch (error) {
      console.error("Logout error:", error);
      showMessage(`Ошибка выхода: ${error.message}`);
    }
  });
});
