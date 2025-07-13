// chat.js

// Импорт необходимых функций из Firebase Firestore SDK
// Эти импорты необходимы, потому что chat.js является отдельным модулем,
// и функции (collection, query, etc.) не становятся глобальными автоматически
// даже если SDK импортирован в index.html.
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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
        // console.log("Current user in chat.js:", currentUser); // Для отладки
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
        const messagesRef = collection(db, 'chatMessages'); // Используем импортированную функцию collection и объект db
        const q = query(messagesRef, orderBy('timestamp', 'asc')); // Используем импортированные функции query и orderBy

        // Подписываемся на изменения в коллекции в реальном времени
        onSnapshot(q, (snapshot) => { // Используем импортированную функцию onSnapshot
          messagesDisplay.innerHTML = ''; // Очищаем текущие сообщения перед обновлением
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

        // Определяем имя отправителя. Если displayName отсутствует, используем email.
        const senderName = message.sender || 'Аноним'; 
        
        // Проверяем, является ли сообщение исходящим (от текущего пользователя)
        // Сравниваем либо по displayName, либо по email, если displayName отсутствует
        const isOutgoing = currentUser && (currentUser.displayName === senderName || currentUser.email === senderName);

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
          // Используем displayName пользователя, если доступен, иначе email
          const senderIdentifier = currentUser.displayName || currentUser.email;

          // Добавляем документ в коллекцию 'chatMessages'
          await addDoc(collection(db, 'chatMessages'), { // Используем импортированные функции addDoc и collection
            sender: senderIdentifier,
            text: messageText,
            timestamp: serverTimestamp() // Используем импортированную функцию serverTimestamp
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
        if (chatType === 'chat') {
            chatMainArea.style.display = 'flex';
            messageInput.style.display = 'block';
            sendMessageBtn.style.display = 'flex';
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
                <li><strong>2025-07-13:</strong> Добавлены новые функции в раздел профиля.</li>
                <li><strong>2025-07-10:</strong> Обновление библиотеки игр и приложений.</li>
                <li><strong>2025-07-05:</strong> Плановые технические работы завершены успешно.</li>
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
