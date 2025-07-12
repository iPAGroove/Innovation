// chat.js

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

  // Ждем, пока Firebase SDK инициализируется и db/auth станут доступны
  function initializeChat() {
    if (window.db && window.auth) {
      const db = window.db;
      const auth = window.auth;

      // Слушатель состояния аутентификации Firebase
      // Это нужно для получения информации о текущем пользователе
      auth.onAuthStateChanged(user => {
        currentUser = user;
        // console.log("Current user in chat.js:", currentUser);
        if (currentUser) {
            // Если пользователь авторизован, можно включить поле ввода, если нужно
            messageInput.disabled = false;
            sendMessageBtn.disabled = false;
            messageInput.placeholder = "Введите ваше сообщение...";
        } else {
            // Если пользователь не авторизован, отключить поле ввода
            messageInput.disabled = true;
            sendMessageBtn.disabled = true;
            messageInput.placeholder = "Войдите, чтобы отправлять сообщения...";
        }
      });

      // Функция для загрузки и отображения сообщений в реальном времени
      function loadMessages() {
        // Создаем запрос к коллекции "chatMessages", упорядочиваем по timestamp
        const messagesRef = window.firebase.firestore().collection('chatMessages'); // Используем window.firebase.firestore()
        const q = messagesRef.orderBy('timestamp', 'asc');

        // Подписываемся на изменения в коллекции в реальном времени
        window.firebase.firestore().onSnapshot(q, (snapshot) => { // Используем window.firebase.firestore()
          messagesDisplay.innerHTML = ''; // Очищаем текущие сообщения
          snapshot.forEach(doc => {
            const message = doc.data();
            displayMessage(message);
          });
          messagesDisplay.scrollTop = messagesDisplay.scrollHeight; // Прокрутить вниз при получении новых сообщений
        });
      }

      // Функция для отображения одного сообщения
      function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        const senderName = message.sender || 'Аноним'; // Используем sender, если он есть, иначе 'Аноним'
        const isOutgoing = currentUser && currentUser.displayName === senderName; // Проверяем, является ли сообщение исходящим

        if (isOutgoing) {
            messageElement.classList.add('outgoing');
        } else {
            messageElement.classList.add('incoming');
        }

        const senderSpan = document.createElement('span');
        senderSpan.classList.add('message-sender');
        senderSpan.textContent = senderName;

        const textSpan = document.createElement('span');
        textSpan.classList.add('message-text');
        textSpan.textContent = message.text;

        messageElement.appendChild(senderSpan);
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
          await window.firebase.firestore().collection('chatMessages').add({ // Используем window.firebase.firestore()
            sender: currentUser.displayName || currentUser.email, // Используем displayName, если доступен, иначе email
            text: messageText,
            timestamp: window.firebase.firestore.FieldValue.serverTimestamp() // Метка времени от сервера
          });
          messageInput.value = ''; // Очистить поле ввода после отправки
        } catch (error) {
          console.error("Ошибка при отправке сообщения: ", error);
          alert("Не удалось отправить сообщение. Пожалуйста, попробуйте еще раз.");
        }
      });

      // Открытие модального окна чата
      chatBtn.addEventListener('click', (event) => {
        event.preventDefault();
        chatModal.classList.add('active');
        activateChatTab('chat'); // Убедимся, что 'chat' вкладка активна при открытии
        loadMessages(); // Загружаем сообщения при открытии чата
      });

      // Закрытие модального окна чата по кнопке "X"
      closeChatBtn.addEventListener('click', () => {
        chatModal.classList.remove('active');
      });

      // Закрытие при клике вне окна
      chatModal.addEventListener('click', (e) => {
        if (e.target === chatModal) {
          chatModal.classList.remove('active');
        }
      });

      // Логика переключения вкладок чата
      chatTabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const chatType = button.dataset.chatType;
          activateChatTab(chatType);
          if (chatType === 'chat') {
            loadMessages(); // Перезагружаем сообщения, если переключились на вкладку "Chat"
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

        if (chatType === 'chat' || chatType === 'support') {
            chatMainArea.style.display = 'flex';
            if (chatType === 'chat') {
                messageInput.style.display = 'block';
                sendMessageBtn.style.display = 'flex';
                // messagesDisplay.innerHTML = `
                //   <div class="message incoming">
                //     <span class="message-sender">iPA Groove Admin</span>
                //     <span class="message-text">Добро пожаловать в наш чат! Задавайте вопросы и общайтесь.</span>
                //   </div>
                //   `; // Теперь сообщения будут загружаться из Firebase
                // messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
            } else if (chatType === 'support') {
                messageInput.style.display = 'none';
                sendMessageBtn.style.display = 'none';
                messagesDisplay.innerHTML = `
                  <p>Это раздел поддержки. Вы можете задать свой вопрос здесь.</p>
                  <p>Наши операторы скоро ответят. Пожалуйста, опишите вашу проблему как можно подробнее.</p>
                  `;
            }
        } else {
            chatMainArea.style.display = 'flex';
            messageInput.style.display = 'none';
            sendMessageBtn.style.display = 'none';
            messagesDisplay.innerHTML = `
              <p><strong>Последние новости и обновления iPA Groove:</strong></p>
              <ul>
                <li><strong>2025-07-13:</strong> Добавлены новые функции в раздел профиля.</li>
                <li><strong>2025-07-10:</strong> Обновление библиотеки игр и приложений.</li>
                <li><strong>2025-07-05:</strong> Плановые технические работы завершены успешно.</li>
              </ul>
            `;
        }
      }
    } else {
      // Если Firebase еще не инициализирован, попробуйте снова через короткий промежуток времени
      setTimeout(initializeChat, 100);
    }
  }

  // Запускаем инициализацию чата
  initializeChat();
});

