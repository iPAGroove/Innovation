// chat.js

// ИМПОРТЫ FIREBASE SDK УДАЛЕНЫ.
// Теперь мы ожидаем, что `window.db` и `window.auth` будут доступны глобально
// после инициализации Firebase в `index.html` с использованием 'compat' версий SDK.
// Функции (collection, query, etc.) будут вызываться напрямую из 'db' или 'firebase.firestore.FieldValue'.

document.addEventListener("DOMContentLoaded", () => {
  const chatBtn = document.getElementById('openChat');
  const chatModal = document.getElementById('chatModal');
  const closeChatBtn = document.getElementById('closeChat');

  const chatTabButtons = document.querySelectorAll('.chat-tab-btn');
  const chatMainArea = document.getElementById('chatMainArea');
  const messagesDisplay = document.getElementById('messagesDisplay');
  const messageInput = document.getElementById('messageInput');
  const sendMessageBtn = document.getElementById('sendMessageBtn');

  let currentUser = null; // Переменная для хранения информации о текущем пользователе
  let db = null; // Переменная для хранения объекта Firestore
  let auth = null; // Переменная для хранения объекта Auth

  // --- Отладочные логи для кнопки чата (можно удалить после решения проблемы) ---
  console.log("chat.js загружен.");
  if (chatBtn) {
    console.log("Элемент 'openChat' найден:", chatBtn);
  } else {
    console.error("Элемент 'openChat' НЕ найден. Проверьте ID в index.html.");
  }
  // --- Конец отладочных логов ---

  // Ждем, пока Firebase SDK инициализируется и db/auth станут доступны из глобального scope
  function initializeChat() {
    // Проверяем наличие window.db и window.auth, которые передаются из index.html
    if (window.db && window.auth) {
      db = window.db; // Присваиваем глобальный объект Firestore
      auth = window.auth; // Присваиваем глобальный объект Auth

      // Слушатель состояния аутентификации Firebase
      // Это нужно для получения информации о текущем пользователе в реальном времени
      auth.onAuthStateChanged(user => {
        currentUser = user;
        // console.log("Current user in chat.js:", currentUser ? currentUser.email : "нет"); // Для отладки
        if (currentUser) {
          // Если пользователь авторизован, включаем поле ввода
          messageInput.disabled = false;
          sendMessageBtn.disabled = false;
          messageInput.placeholder = "Введите ваше сообщение...";
        } else {
          // Если пользователь не авторизован, отключаем поле ввода
          messageInput.disabled = true;
          sendMessageBtn.disabled = true;
          messageInput.placeholder = "Войдите, чтобы отправлять сообщения...";
        }
      });

      // Функция для загрузки и отображения сообщений в реальном времени
      function loadMessages() {
        // Создаем запрос к коллекции "chatMessages", упорядочиваем по timestamp
        // Используем db.collection, db.orderBy напрямую
        const q = db.collection('chatMessages').orderBy('timestamp', 'asc');

        // Подписываемся на изменения в коллекции в реальном времени
        // Используем db.onSnapshot напрямую
        db.onSnapshot(q, (snapshot) => {
          messagesDisplay.innerHTML = ''; // Очищаем текущие сообщения перед обновлением
          snapshot.forEach(doc => {
            const message = doc.data();
            displayMessage(message);
          });
          messagesDisplay.scrollTop = messagesDisplay.scrollHeight; // Прокрутить вниз при получении новых сообщений
        }, (error) => {
          console.error("Ошибка при получении сообщений чата:", error);
          messagesDisplay.innerHTML = '<div class="chat-error">Не удалось загрузить сообщения чата.</div>';
        });
      }

      // Функция для отображения одного сообщения
      function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        // Определяем имя отправителя. Если displayName отсутствует, используем часть email до @.
        const senderName = message.sender || 'Аноним';

        // Проверяем, является ли сообщение исходящим (от текущего пользователя)
        const isOutgoing = currentUser &&
          ((currentUser.displayName && currentUser.displayName === senderName) ||
            (!currentUser.displayName && currentUser.email === message.sender)); // Сравниваем email, если displayName нет

        if (isOutgoing) {
          messageElement.classList.add('outgoing');
        } else {
          messageElement.classList.add('incoming');
        }

        const messageHeader = document.createElement('div');
        messageHeader.classList.add('message-header');

        const senderSpan = document.createElement('span');
        senderSpan.classList.add('message-sender');
        senderSpan.textContent = senderName;

        const timeSpan = document.createElement('span');
        timeSpan.classList.add('message-time');
        // Форматируем время
        const date = message.timestamp ? new Date(message.timestamp.toDate()) : new Date();
        timeSpan.textContent = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

        messageHeader.appendChild(senderSpan);
        messageHeader.appendChild(timeSpan);

        const textSpan = document.createElement('div'); // Изменено на div для текста сообщения
        textSpan.classList.add('message-text');
        textSpan.textContent = message.text;

        messageElement.appendChild(messageHeader);
        messageElement.appendChild(textSpan);
        messagesDisplay.appendChild(messageElement);
      }

      // Отправка сообщения
      sendMessageBtn.addEventListener('click', async () => {
        const messageText = messageInput.value.trim();
        if (messageText === '') return; // Не отправлять пустые сообщения

        if (!currentUser) {
          alert('Пожалуйста, войдите в аккаунт, чтобы отправлять сообщения.');
          return;
        }

        try {
          // Используем displayName пользователя, если доступен, иначе email
          const senderIdentifier = currentUser.displayName || currentUser.email;

          // Добавляем документ в коллекцию 'chatMessages'
          // Используем db.collection и firebase.firestore.FieldValue.serverTimestamp()
          await db.collection('chatMessages').add({
            sender: senderIdentifier,
            text: messageText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Доступ к Firestore FieldValue через global firebase
          });
          messageInput.value = ''; // Очистить поле ввода после отправки
        } catch (error) {
          console.error("Ошибка при отправке сообщения: ", error);
          alert("Не удалось отправить сообщение. Пожалуйста, попробуйте еще раз.");
        }
      });

      // Открытие модального окна чата
      if (chatBtn) {
        chatBtn.addEventListener('click', (event) => {
          event.preventDefault();
          chatModal.classList.add('active');
          activateChatTab('general'); // Установил 'general' как тип для чата
          loadMessages(); // Загружаем сообщения при открытии чата
        });
      } else {
        console.error("chatBtn не найден, не удалось прикрепить слушатель события.");
      }

      // Закрытие модального окна чата по кнопке "X"
      if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
          chatModal.classList.remove('active');
        });
      }

      // Закрытие при клике вне окна
      if (chatModal) {
        chatModal.addEventListener('click', (e) => {
          // Проверяем, что клик был именно по фону модального окна, а не по его содержимому
          if (e.target === chatModal) {
            chatModal.classList.remove('active');
          }
        });
      }

      // Логика переключения вкладок чата
      chatTabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const chatType = button.dataset.chatType;
          activateChatTab(chatType);
          if (chatType === 'general') { // Используем 'general' как имя для основного чата
            loadMessages(); // Перезагружаем сообщения, если переключились на вкладку "General"
          } else {
            messagesDisplay.innerHTML = ''; // Очищаем сообщения при переключении на другие вкладки
          }
        });
      });

      function activateChatTab(chatType) {
        // Деактивируем все кнопки
        chatTabButtons.forEach(btn => btn.classList.remove('active'));

        // Активируем нужную кнопку
        const activeButton = document.querySelector(`.chat-tab-btn[data-chat-type="${chatType}"]`);
        if (activeButton) {
          activeButton.classList.add('active');
        }

        // Отображаем или скрываем поле ввода в зависимости от вкладки
        if (chatType === 'general') { // Используем 'general' как имя для основного чата
          chatMainArea.style.display = 'block'; // Block, так как у вас там флекс, но это может быть внешним контейнером
          messageInput.style.display = 'flex'; // flex для инпута и кнопки, если они в одной строке
          sendMessageBtn.style.display = 'flex';
          messagesDisplay.style.display = 'flex'; // Убедитесь, что сам дисплей сообщений виден
        } else if (chatType === 'support') {
          chatMainArea.style.display = 'flex';
          messageInput.style.display = 'none';
          sendMessageBtn.style.display = 'none';
          messagesDisplay.innerHTML = `
              <p>Это раздел поддержки. Вы можете задать свой вопрос здесь.</p>
              <p>Наши операторы скоро ответят. Пожалуйста, опишите вашу проблему как можно подробнее.</p>
            `;
        } else if (chatType === 'news') {
          chatMainArea.style.display = 'flex';
          messageInput.style.display = 'none';
          sendMessageBtn.style.display = 'none';
          messagesDisplay.innerHTML = `
              <p><strong>Последние новости и обновления iPA Groove:</strong></p>
              <ul>
                <li><strong>${new Date().getFullYear()}-07-13:</strong> Добавлены новые функции в раздел профиля.</li>
                <li><strong>${new Date().getFullYear()}-07-10:</strong> Обновление библиотеки игр и приложений.</li>
                <li><strong>${new Date().getFullYear()}-07-05:</strong> Плановые технические работы завершены успешно.</li>
              </ul>
            `;
        }
      }
    } else {
      // Если Firebase еще не инициализирован (window.db или window.auth отсутствуют),
      // пробуем снова через короткий промежуток времени.
      setTimeout(initializeChat, 100);
    }
  }

  // Запускаем инициализацию чата
  initializeChat();
});
