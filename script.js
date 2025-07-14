// script.js

// Переменные для экранов
const gamesScreen = document.getElementById("gamesScreen");
const appsScreen = document.getElementById("appsScreen");
const openGamesBtn = document.getElementById("openGames");
const openAppsBtn = document.getElementById("openApps");

// Убедимся, что элементы найдены, прежде чем добавлять слушатели
if (gamesScreen && appsScreen && openGamesBtn && openAppsBtn) {
    openGamesBtn.addEventListener("click", (event) => {
        event.preventDefault(); // Предотвращаем стандартное поведение ссылки
        gamesScreen.style.display = "block";
        appsScreen.style.display = "none";
    });

    openAppsBtn.addEventListener("click", (event) => {
        event.preventDefault(); // Предотвращаем стандартное поведение ссылки
        appsScreen.style.display = "block";
        gamesScreen.style.display = "none";
    });

    // Изначально показываем gamesScreen (этот блок можно удалить, если он уже есть в index.html в модульном скрипте)
    document.addEventListener("DOMContentLoaded", () => {
        gamesScreen.style.display = "block";
        appsScreen.style.display = "none";
    });
} else {
    console.error("Один или несколько элементов экрана games/apps не найдены.");
}

// renderCard функция будет находиться в index.html, в главном модульном скрипте,
// так как она использует `window.currentUserIsVip` и `onSnapshot` из Firebase.
// Здесь я оставляю ее закомментированной, чтобы не было дублирования,
// но напоминаю, что она обновлена в <script type="module"> в index.html.

/*
// renderCard функция (ПЕРЕНЕСЕНА В index.html ВНУТРЬ МОДУЛЬНОГО СКРИПТА)
function renderCard(data, isUserVip) {
    const isVipContent = data.type === 'vip';
    const blockedClass = isVipContent && !isUserVip ? ' blocked' : '';
    const vipTag = isVipContent ? '<span class="vip-tag">VIP</span>' : '';

    return `
        <div class="icon-card${blockedClass}"
             data-name="${data.name}"
             data-iconurl="${data.iconUrl}"
             data-downloadlink="${data.downloadLink || ''}"
             data-size="${data.size || 'N/A'}"
             data-minimalios="${data.minimaliOS || 'N/A'}"
             data-type="${data.type}"
             data-is-vip-content="${isVipContent}">
          <img src="${data.iconUrl}" alt="${data.name}">
          <span>${data.name}</span>
          ${vipTag}
        </div>`;
}
*/
