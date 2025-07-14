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

  let currentUser = null;
  let db = null;
  let auth = null;
  let unsubscribeMessages = null;

  function initializeChat() {
    if (window.db && window.auth) {
      db = window.db;
      auth = window.auth;

      auth.onAuthStateChanged(user => {
        currentUser = user;
        if (currentUser) {
          messageInput.disabled = false;
          sendMessageBtn.disabled = false;
          messageInput.placeholder = "Введите ваше сообщение...";
        } else {
          messageInput.disabled = true;
          sendMessageBtn.disabled = true;
          messageInput.placeholder = "Войдите, чтобы отправлять сообщения...";
        }
      });

      function loadMessages() {
        if (unsubscribeMessages) unsubscribeMessages(); // Отписываемся от старого snapshot
        const messagesRef = collection(db, 'chatMessages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        unsubscribeMessages = onSnapshot(q, (snapshot) => {
          messagesDisplay.innerHTML = '';
          snapshot.forEach(doc => displayMessage(doc.data()));
          messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
        });
      }

      function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        const senderName = message.sender || 'Аноним';
        const isOutgoing = currentUser &&
          ((currentUser.displayName && currentUser.displayName === senderName) ||
            (!currentUser.displayName && currentUser.email === senderName));

        messageElement.classList.add(isOutgoing ? 'outgoing' : 'incoming');

        messageElement.innerHTML = `
          <span class="message-sender">${senderName}</span>
          <span class="message-text">${message.text}</span>
        `;

        messagesDisplay.appendChild(messageElement);
      }

      sendMessageBtn.addEventListener('click', async () => {
        const messageText = messageInput.value.trim();
        if (!messageText) return;
        if (!currentUser) {
          alert('Войдите в аккаунт, чтобы отправлять сообщения.');
          return;
        }
        try {
          const senderIdentifier = currentUser.displayName || currentUser.email;
          await addDoc(collection(db, 'chatMessages'), {
            sender: senderIdentifier,
            text: messageText,
            timestamp: serverTimestamp()
          });
          messageInput.value = '';
        } catch (error) {
          console.error('Ошибка отправки:', error);
          alert('Не удалось отправить сообщение. Попробуйте еще раз.');
        }
      });

      if (chatBtn) {
        chatBtn.addEventListener('click', (e) => {
          e.preventDefault();
          chatModal.classList.add('active');
          activateChatTab('chat');
          loadMessages();
        });
      }

      if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
          chatModal.classList.remove('active');
        });
      }

      if (chatModal) {
        chatModal.addEventListener('click', (e) => {
          if (e.target === chatModal) {
            chatModal.classList.remove('active');
          }
        });
      }

      chatTabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const chatType = button.dataset.chatType;
          activateChatTab(chatType);
          if (chatType === 'chat') {
            loadMessages();
          } else {
            messagesDisplay.innerHTML = '';
          }
        });
      });

      function activateChatTab(chatType) {
        chatTabButtons.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.chat-tab-btn[data-chat-type="${chatType}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        if (chatType === 'chat') {
          chatMainArea.style.display = 'flex';
          messageInput.style.display = 'block';
          sendMessageBtn.style.display = 'flex';
        } else if (chatType === 'support') {
          chatMainArea.style.display = 'flex';
          messageInput.style.display = 'none';
          sendMessageBtn.style.display = 'none';
          messagesDisplay.innerHTML = `
            <p>Это раздел поддержки. Опишите свою проблему, и мы ответим вам как можно скорее.</p>
          `;
        } else if (chatType === 'news') {
          chatMainArea.style.display = 'flex';
          messageInput.style.display = 'none';
          sendMessageBtn.style.display = 'none';
          messagesDisplay.innerHTML = `
            <p><strong>Новости iPA Groove:</strong></p>
            <ul>
              <li><strong>${new Date().toISOString().split('T')[0]}:</strong> Новые обновления и улучшения платформы.</li>
            </ul>
          `;
        }
      }

    } else {
      setTimeout(initializeChat, 100);
    }
  }

  initializeChat();
});
