// chat.js

document.addEventListener("DOMContentLoaded", () => {
  const chatBtn = document.getElementById('openChat'); // ID изменен
  const chatModal = document.getElementById('chatModal'); // ID изменен
  const closeChatBtn = document.getElementById('closeChat'); // ID изменен

  const chatTabButtons = document.querySelectorAll('.chat-tab-btn');
  const chatWindow = document.getElementById('chatWindow');

  // Открытие модального окна чата
  chatBtn.addEventListener('click', (event) => {
    event.preventDefault(); // Предотвращаем переход по ссылке #
    chatModal.classList.add('active');
    // При открытии окна, активируем вкладку "Chat" по умолчанию
    activateChatTab('chat');
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

    // Обновляем содержимое chatWindow в зависимости от выбранной вкладки
    switch (chatType) {
      case 'support':
        chatWindow.innerHTML = '<p>Это раздел поддержки. Вы можете задать свой вопрос здесь.</p><p>Наши операторы скоро ответят.</p>';
        break;
      case 'chat':
        chatWindow.innerHTML = '<p>Это основной чат. Общайтесь с другими пользователями!</p><p>Пример сообщения в чате.</p><p>Еще одно сообщение...</p>';
        break;
      case 'news':
        chatWindow.innerHTML = '<p>Последние новости и обновления iPA Groove:</p><ul><li>Обновление 1.0.5: Добавлены новые игры!</li><li>Акция: Скидки для VIP пользователей!</li><li>Плановые работы на сервере: 15 июля.</li></ul>';
        break;
      default:
        chatWindow.innerHTML = '<p>Выберите раздел чата.</p>';
    }
  }

  // При первой загрузке страницы, убедитесь, что окно чата не активно
  // (хотя это уже делается в CSS с opacity/visibility)
  // chatModal.classList.remove('active');
});
