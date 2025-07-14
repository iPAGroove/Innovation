// modal.js

document.addEventListener("DOMContentLoaded", () => {
    const itemDetailModal = document.getElementById('itemDetailModal');
    const closeModalBtn = document.getElementById('closeItemDetailModal');
    const modalItemName = document.getElementById('modalItemName');
    const modalItemIcon = document.getElementById('modalItemIcon');
    const modalItemSize = document.getElementById('modalItemSize');
    const modalItemMinimaliOS = document.getElementById('modalItemMinimaliOS');
    const modalItemType = document.getElementById('modalItemType');
    const modalDownloadBtn = document.getElementById('modalDownloadBtn');
    const modalVipMessage = document.getElementById('modalVipMessage');

    // Проверка наличия всех элементов
    const requiredElements = [
        itemDetailModal, closeModalBtn, modalItemName, modalItemIcon,
        modalItemSize, modalItemMinimaliOS, modalItemType, modalDownloadBtn,
        modalVipMessage
    ];

    if (requiredElements.some(el => !el)) {
        console.error("❗ Отсутствуют обязательные DOM элементы для modal.js. Проверьте index.html.");
        return;
    }

    // Обработчик клика по карточкам игр/приложений
    document.addEventListener('click', (e) => {
        const iconCard = e.target.closest('.icon-card');
        if (iconCard) {
            const isVipContent = iconCard.dataset.isVipContent === 'true';

            // Проверяем VIP статус пользователя
            if (isVipContent && !window.currentUserIsVip) {
                // Если контент VIP, а пользователь не VIP
                modalVipMessage.style.display = 'block'; // Показываем сообщение
                modalDownloadBtn.style.display = 'none'; // Скрываем кнопку скачивания
            } else {
                // Если контент FREE или пользователь VIP
                modalVipMessage.style.display = 'none'; // Скрываем сообщение
                modalDownloadBtn.style.display = 'block'; // Показываем кнопку скачивания
            }

            modalItemName.textContent = iconCard.dataset.name;
            modalItemIcon.src = iconCard.dataset.iconurl;
            modalItemIcon.alt = iconCard.dataset.name;
            modalItemSize.textContent = iconCard.dataset.size;
            modalItemMinimaliOS.textContent = iconCard.dataset.minimalios;
            modalItemType.textContent = iconCard.dataset.type.toUpperCase(); // VIP/FREE/UPDATES/TOP

            // Устанавливаем ссылку для кнопки скачивания
            if (iconCard.dataset.downloadlink) {
                modalDownloadBtn.onclick = () => {
                    window.open(iconCard.dataset.downloadlink, '_blank');
                };
            } else {
                modalDownloadBtn.style.display = 'none';
            }


            itemDetailModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Запрещаем скролл фона
        }
    });

    // Закрытие модального окна
    closeModalBtn.addEventListener('click', () => {
        itemDetailModal.classList.remove('active');
        document.body.style.overflow = ''; // Разрешаем скролл фона
    });

    // Закрытие по клику вне модального окна
    itemDetailModal.addEventListener('click', (e) => {
        if (e.target === itemDetailModal) {
            itemDetailModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});
