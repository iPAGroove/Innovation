/* chat.css - Обновленный дизайн */

/* Стиль модального окна чата */
.chat-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 15, 15, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9998;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.chat-modal.active {
  opacity: 1;
  visibility: visible;
}

.chat-content {
  /* Обновленный фон с градиентом */
  background: linear-gradient(135deg, #2a2a4a 0%, #1e1e3e 100%);
  border-radius: 16px; /* Более мягкие углы */
  padding: 0;
  width: 90%;
  max-width: 550px; /* Немного шире для лучшего вида */
  height: 75%; /* Немного выше */
  max-height: 650px; /* Увеличим максимальную высоту */
  color: #fff;
  position: relative;
  /* Улучшенная тень */
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Montserrat', sans-serif; /* Добавим шрифт */
  border: 1px solid rgba(255, 255, 255, 0.08); /* Тонкая рамка */
}

/* Кнопка закрытия */
.close-btn {
  position: absolute;
  top: 15px; /* Немного сместим вниз */
  right: 15px; /* Немного сместим влево */
  background: rgba(255, 255, 255, 0.1); /* Полупрозрачный фон */
  border: none;
  border-radius: 50%; /* Круглая кнопка */
  width: 30px; /* Размер */
  height: 30px; /* Размер */
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 20px; /* Уменьшим размер крестика */
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s ease, transform 0.2s ease;
  backdrop-filter: blur(4px); /* Легкое размытие для фона */
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg); /* Эффект вращения при наведении */
}

/* Стили для кнопок-вкладок SUPPORT | Chat | NEWS */
.chat-tabs {
  display: flex;
  width: 100%;
  /* Более темный и градиентный фон для вкладок */
  background: linear-gradient(90deg, #1f1f3f 0%, #171732 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  /* Удалим border-top-left/right-radius здесь, т.к. он уже есть у .chat-content */
  padding: 5px 0; /* Небольшой вертикальный отступ */
  box-shadow: inset 0 -1px 0 rgba(0,0,0,0.2); /* Внутренняя тень */
}

.chat-tab-btn {
  flex: 1;
  padding: 14px 0; /* Увеличим отступы для кнопок */
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6); /* Приглушенный цвет для неактивных */
  font-size: 15px; /* Размер шрифта */
  font-weight: 500; /* Немного тоньше шрифт */
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  outline: none;
  position: relative; /* Для псевдоэлемента индикатора */
}

.chat-tab-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05); /* Легкий фон при наведении */
}

.chat-tab-btn.active {
  color: #87CEFA; /* Яркий цвет для активной вкладки */
  font-weight: 600;
  /* Добавим нижний индикатор активности */
}

.chat-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%; /* Ширина индикатора */
  height: 3px;
  background-color: #87CEFA; /* Цвет индикатора */
  border-radius: 2px;
  transition: width 0.3s ease;
}


/* Стиль для окна содержимого чата/новостей */
.chat-window {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto; /* Добавляем прокрутку, если контента много */
  line-height: 1.6;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  background: #1e1e3e; /* Фон для области контента */
  border-bottom-left-radius: 16px; /* Закругление снизу */
  border-bottom-right-radius: 16px;
  box-sizing: border-box; /* Важно для padding */
}

/* Стилизация скроллбара (для Webkit-браузеров) */
.chat-window::-webkit-scrollbar {
  width: 8px; /* Ширина скроллбара */
}

.chat-window::-webkit-scrollbar-track {
  background: #2a2a4a; /* Цвет трека скроллбара */
  border-radius: 10px;
}

.chat-window::-webkit-scrollbar-thumb {
  background: #007bff; /* Цвет ползунка скроллбара */
  border-radius: 10px;
  border: 2px solid #2a2a4a; /* Граница для контраста */
}

.chat-window::-webkit-scrollbar-thumb:hover {
  background: #0056b3; /* Цвет ползунка при наведении */
}

/* Стили для содержимого внутри chat-window */
.chat-window p {
  margin-bottom: 10px;
}

.chat-window ul {
  list-style: none;
  padding-left: 0;
}

.chat-window li {
  margin-bottom: 8px;
  padding-left: 15px;
  position: relative;
}

.chat-window li::before {
  content: '•'; /* Маркер списка */
  color: #87CEFA;
  position: absolute;
  left: 0;
  top: 0;
}
