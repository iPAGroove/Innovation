// chat.js

document.addEventListener("DOMContentLoaded", () => {
  const chatBtn = document.getElementById('openChat');
  const chatModal = document.getElementById('chatModal');
  const closeChatBtn = document.getElementById('closeChat');

  const chatTabButtons = document.querySelectorAll('.chat-tab-btn');
  const chatMainArea = document.getElementById('chatMainArea'); // Новый элемент
  const messagesDisplay = document.getElementById('messagesDisplay'); // Новый элемент
  const messageInput = document.getElementById('messageInput'); // Новый элемент
  const sendMessageBtn = document.getElementById('sendMessageBtn'); // Новый элемент

  // Открытие модального окна чата
  chatBtn.addEventListener('click', (event) => {
    event.preventDefault();
    chatModal.classList.add('active');
    // При открытии окна, активируем вкладку "Chat" по умолчанию
    activateChatTab('chat'); // Убедимся, что 'chat' вкладка активна при открытии
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

    // Обновляем содержимое chatMainArea (или messagesDisplay, если речь только о сообщениях)
    // В данном случае, мы будем скрывать/показывать chatMainArea или менять его содержимое
    // в зависимости от вкладки.
    // Для "Chat" будет показываться поле ввода, для "Support" и "News" - нет.
    if (chatType === 'chat' || chatType === 'support') { // Вкладки с интерактивным содержимым
        chatMainArea.style.display = 'flex'; // Показываем область чата/поддержки
        if (chatType === 'chat') {
            // Если это "Chat", показываем поле ввода и кнопку отправки
            messageInput.style.display = 'block';
            sendMessageBtn.style.display = 'flex'; // или 'block'
            messagesDisplay.innerHTML = `
              <div class="message incoming">
                <span class="message-sender">iPA Groove Admin</span>
                <span class="message-text">Добро пожаловать в наш чат! Задавайте вопросы и общайтесь.</span>
              </div>
              `;
            messagesDisplay.scrollTop = messagesDisplay.scrollHeight; // Прокрутить вниз при активации
        } else if (chatType === 'support') {
            // Если это "Support", скрываем поле ввода и кнопку отправки, показываем контент поддержки
            messageInput.style.display = 'none';
            sendMessageBtn.style.display = 'none';
            messagesDisplay.innerHTML = `
              <p>Это раздел поддержки. Вы можете задать свой вопрос здесь.</p>
              <p>Наши операторы скоро ответят. Пожалуйста, опишите вашу проблему как можно подробнее.</p>
              `;
        }
    } else { // Для "News" и других неинтерактивных вкладок
        chatMainArea.style.display = 'flex'; // Можем оставить flex, но скрывать input area
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

  // Пока не добавляем логику отправки сообщений, только заглушка
  sendMessageBtn.addEventListener('click', () => {
    // В будущем здесь будет логика отправки сообщения
    console.log('Сообщение отправлено:', messageInput.value);
    // Очистить поле ввода
    messageInput.value = '';
  });

  // Активировать вкладку "Chat" при первой загрузке модального окна (когда оно становится видимым)
  // Мы это уже делаем в chatBtn.addEventListener, но если бы окно было всегда видимо,
  // это потребовалось бы для начального состояния.
  // current active tab set in HTML now.
});
