i// admin.js

import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const adminPanel = document.getElementById('adminPanel');
  const openAdminPanelBtn = document.getElementById('openAdminPanel');
  const closeAdminPanelBtn = document.getElementById('closeAdminPanel');
  const adminTabButtons = document.querySelectorAll('.admin-tab-btn');
  const adminSections = document.querySelectorAll('.admin-section');

  const addGameForm = document.getElementById('addGameForm');
  const gameNameInput = document.getElementById('gameName');
  const gameIconUrlInput = document.getElementById('gameIconUrl');
  const gameTypeSelect = document.getElementById('gameType');
  const gameMessage = document.getElementById('gameMessage');

  const addAppForm = document.getElementById('addAppForm');
  const appNameInput = document.getElementById('appName');
  const appIconUrlInput = document.getElementById('appIconUrl');
  const appTypeSelect = document.getElementById('appType');
  const appMessage = document.getElementById('appMessage');

  // Проверяем наличие всех необходимых элементов
  const requiredElements = [
    adminPanel, openAdminPanelBtn, closeAdminPanelBtn,
    addGameForm, gameNameInput, gameIconUrlInput, gameTypeSelect, gameMessage,
    addAppForm, appNameInput, appIconUrlInput, appTypeSelect, appMessage
  ];

  if (requiredElements.some(el => !el)) {
    console.error("❗ Отсутствуют обязательные DOM элементы для admin.js. Проверьте index.html.");
    return;
  }

  const db = window.db; // Получаем db из глобального объекта window
  const auth = getAuth(); // Получаем auth

  if (!db) {
    console.error("❗ Firestore (db) не инициализирован. Убедитесь, что firebaseApp инициализируется до admin.js");
    return;
  }

  // Функция для открытия/закрытия админ-панели
  openAdminPanelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    adminPanel.classList.add('active');
  });

  closeAdminPanelBtn.addEventListener('click', () => {
    adminPanel.classList.remove('active');
  });

  // Функция для переключения вкладок
  adminTabButtons.forEach(button => {
    button.addEventListener('click', () => {
      adminTabButtons.forEach(btn => btn.classList.remove('active'));
      adminSections.forEach(section => section.classList.remove('active'));

      button.classList.add('active');
      const targetContentId = button.dataset.content;
      document.getElementById(`${targetContentId}Section`).classList.add('active');
    });
  });

  // Обработка формы добавления игры
  addGameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    gameMessage.textContent = ''; // Очищаем предыдущие сообщения

    const user = auth.currentUser;
    if (!user) {
      gameMessage.style.color = '#dc3545';
      gameMessage.textContent = 'Для добавления игр необходимо быть авторизованным администратором.';
      return;
    }

    // TODO: Добавить проверку роли пользователя здесь.
    // Например, можно получить пользовательские клеймы из Firebase Authentication
    // или проверить поле в профиле пользователя в Firestore.
    // Если пользователь не админ, вернуть ошибку.
    // Пример (псевдокод):
    // const idTokenResult = await user.getIdTokenResult();
    // if (!idTokenResult.claims.admin) {
    //   gameMessage.style.color = '#dc3545';
    //   gameMessage.textContent = 'У вас нет прав администратора для добавления игр.';
    //   return;
    // }

    const gameData = {
      name: gameNameInput.value.trim(),
      iconUrl: gameIconUrlInput.value.trim(),
      type: gameTypeSelect.value,
      createdAt: new Date(), // Добавляем метку времени
      addedBy: user.email // Сохраняем, кто добавил
    };

    try {
      await addDoc(collection(db, "Games"), gameData);
      gameMessage.style.color = '#28a745';
      gameMessage.textContent = 'Игра успешно добавлена!';
      addGameForm.reset(); // Очищаем форму
    } catch (error) {
      console.error("Ошибка при добавлении игры:", error);
      gameMessage.style.color = '#dc3545';
      gameMessage.textContent = `Ошибка: ${error.message}`;
    }
  });

  // Обработка формы добавления приложения
  addAppForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    appMessage.textContent = ''; // Очищаем предыдущие сообщения

    const user = auth.currentUser;
    if (!user) {
      appMessage.style.color = '#dc3545';
      appMessage.textContent = 'Для добавления приложений необходимо быть авторизованным администратором.';
      return;
    }

    // TODO: Добавить проверку роли пользователя здесь, аналогично для игр.

    const appData = {
      name: appNameInput.value.trim(),
      iconUrl: appIconUrlInput.value.trim(),
      type: appTypeSelect.value,
      createdAt: new Date(),
      addedBy: user.email
    };

    try {
      await addDoc(collection(db, "Apps"), appData);
      appMessage.style.color = '#28a745';
      appMessage.textContent = 'Приложение успешно добавлено!';
      addAppForm.reset(); // Очищаем форму
    } catch (error) {
      console.error("Ошибка при добавлении приложения:", error);
      appMessage.style.color = '#dc3545';
      appMessage.textContent = `Ошибка: ${error.message}`;
    }
  });

  // Изначально показываем вкладку "Добавить игру"
  document.getElementById('addGameTab').click();
});
