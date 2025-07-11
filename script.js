document.addEventListener('DOMContentLoaded', () => {
    // Получаем все элементы с классом games-horizontal-scroll
    const scrollContainers = document.querySelectorAll('.games-horizontal-scroll');

    scrollContainers.forEach(container => {
        // Принудительно устанавливаем overflow-x: auto (если он вдруг где-то переопределяется)
        container.style.overflowX = 'auto';

        // Принудительно устанавливаем min-width (например, на 1000px, или больше, чем ширина viewport)
        // Это должно заставить контейнер быть шире, чем экран
        // Убедитесь, что эта ширина реально больше, чем ширина вашего мобильного экрана
        if (window.innerWidth < 768) { // Если это мобильное устройство
             container.style.minWidth = '700px'; // Или любое значение, которое точно больше ширины экрана
        } else {
             container.style.minWidth = '1000px';
        }

        // Дополнительный тест: можно попробовать принудительно установить ширину, чтобы вызвать прокрутку
        // container.style.width = (container.scrollWidth + 50) + 'px'; // Добавить немного к расчетной ширине

        // Проверяем, есть ли прокрутка, после всех изменений
        // console.log('Scroll width:', container.scrollWidth);
        // console.log('Client width:', container.clientWidth);
        // if (container.scrollWidth > container.clientWidth) {
        //     console.log('Элемент должен быть прокручиваемым!');
        // }
    });
});
