// auth.js

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { addDoc, collection, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Import updateProfileDisplay function from profile.js
import { updateProfileDisplay } from './profile.js';

document.addEventListener("DOMContentLoaded", () => {
    const app = window.firebaseApp;
    const auth = window.auth;
    const db = window.db;

    if (!app || !auth || !db) {
        console.error("❗ Firebase App, Auth, or Firestore not initialized in index.html");
        return;
    }

    // DOM elements
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authContainer = document.querySelector('.auth-container');
    const profileInfoContainer = document.getElementById('profileInfoContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    const openAdminPanelBtn = document.getElementById('openAdminPanel');
    const openUsersPanelBtn = document.getElementById('openUsersPanel'); // NEW BUTTON

    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginError = document.getElementById('loginError');

    const registerEmailInput = document.getElementById('registerEmail');
    const registerNicknameInput = document.getElementById('registerNickname');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerError = document.getElementById('registerError');

    const requiredElements = [
        loginTab, registerTab, loginForm, registerForm, authContainer,
        profileInfoContainer, logoutBtn, loginEmailInput, loginPasswordInput,
        loginError, registerEmailInput, registerNicknameInput, registerPasswordInput,
        registerError, openAdminPanelBtn, openUsersPanelBtn
    ];

    if (requiredElements.some(el => !el)) {
        requiredElements.forEach(el => {
            if (!el) {
                console.error(`❗ Missing DOM element with ID: ${el ? el.id : 'undefined'}`);
            }
        });
        console.error("❗ Missing required DOM elements for auth.js");
        return;
    }

    function showAuthForm(isRegister) {
        profileInfoContainer.style.display = 'none';
        loginTab.classList.toggle('active', !isRegister);
        registerTab.classList.toggle('active', isRegister);
        loginForm.style.display = isRegister ? 'none' : 'flex';
        registerForm.style.display = isRegister ? 'flex' : 'none';
        authContainer.classList.remove('transparent-bg');
        loginError.textContent = '';
        registerError.textContent = '';

        // Ensure buttons are hidden when showing auth/register form
        if (openAdminPanelBtn) openAdminPanelBtn.style.display = 'none';
        if (openUsersPanelBtn) openUsersPanelBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none'; // Ensure logout button is hidden
    }

    loginTab.addEventListener('click', () => showAuthForm(false));
    registerTab.addEventListener('click', () => showAuthForm(true));

    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value;
        loginError.textContent = '';

        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ User logged in');
            loginEmailInput.value = '';
            loginPasswordInput.value = '';
        } catch (error) {
            console.error('❌ Login error:', error.code);
            loginError.textContent = getAuthErrorMessage(error.code, 'login');
        }
    });

    // Registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = registerEmailInput.value.trim();
        const nickname = registerNicknameInput.value.trim();
        const password = registerPasswordInput.value;
        registerError.textContent = '';

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user && nickname) {
                await updateProfile(user, { displayName: nickname });
            }

            // Add user record to 'users' collection in Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                nickname: nickname,
                isVip: false, // Default to Free
                vipEndDate: null, // No VIP end date
                createdAt: new Date(),
                lastLogin: new Date(),
                isAdmin: false // Default to not admin
            });

            console.log('🎉 User registered and added to users collection');
            registerEmailInput.value = '';
            registerNicknameInput.value = '';
            registerPasswordInput.value = '';
        } catch (error) {
            console.error('❌ Registration error:', error.code);
            registerError.textContent = getAuthErrorMessage(error.code, 'register');
        }
    });

    // Logout
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log('👋 User logged out');
        } catch (error) {
            console.error('❌ Logout error:', error.message);
            alert('Failed to log out. Please try again.');
        }
    });

    // Auth state change handler
    onAuthStateChanged(auth, async (user) => {
        let isAdmin = false;
        let isUserVip = false;
        let vipEndDate = null;

        if (user) {
            console.log('👤 User authenticated:', user.email);
            const adminEmails = ["ipagroove@gmail.com"]; // Your admin emails

            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    isUserVip = userData.isVip || false;
                    vipEndDate = userData.vipEndDate ? userData.vipEndDate.toDate() : null;
                    isAdmin = userData.isAdmin || adminEmails.includes(user.email);

                    // Check if VIP has expired
                    if (isUserVip && vipEndDate && vipEndDate < new Date()) {
                        isUserVip = false; // VIP expired
                        // Optionally: update status in the database to Free
                        await setDoc(userDocRef, { isVip: false, vipEndDate: null }, { merge: true });
                        console.log(`User ${user.email}'s VIP status expired and was updated to Free.`);
                    }
                } else {
                    // If user not found in 'users' collection, create entry
                    console.warn(`User ${user.email} not found in 'users' collection. Creating entry.`);
                    isAdmin = adminEmails.includes(user.email); // Initialize isAdmin based on email
                    await setDoc(doc(db, "users", user.uid), {
                        email: user.email,
                        nickname: user.displayName || 'User',
                        isVip: false,
                        vipEndDate: null,
                        createdAt: new Date(),
                        lastLogin: new Date(),
                        isAdmin: isAdmin // Save admin status to Firestore
                    });
                }
            } catch (error) {
                console.error("Error getting VIP/Admin status for user:", error);
            }

            // Update lastLogin on each login/auth state change
            try {
                const userDocRef = doc(db, "users", user.uid);
                await setDoc(userDocRef, { lastLogin: new Date() }, { merge: true });
            } catch (error) {
                console.error("Error updating lastLogin:", error);
            }

        } else {
            console.log('🔒 User not authenticated');
        }

        // Update global VIP status variables
        window.currentUserIsVip = isUserVip;
        window.currentUserVipEndDate = vipEndDate;

        // Pass admin and VIP status to profile display function
        updateProfileDisplay(user, isAdmin, isUserVip, vipEndDate);

        // Re-render cards after getting VIP status
        window.loadRealtimeCollection('Games', 'games');
        window.loadRealtimeCollection('Apps', 'apps');
    });

    function getAuthErrorMessage(code, mode) {
        switch (code) {
            case 'auth/invalid-email':
                return 'Invalid email.';
            case 'auth/user-disabled':
                return 'Account disabled.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return mode === 'login' ? 'Invalid email or password.' : 'Registration error.';
            case 'auth/email-already-in-use':
                return 'Email already registered.';
            case 'auth/weak-password':
                return 'Password must be at least 6 characters.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Try again later.';
            default:
                return `Unknown error (${code}).`;
        }
    }
});
