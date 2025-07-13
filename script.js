// script.js

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

  // Изначально показываем gamesScreen
  document.addEventListener("DOMContentLoaded", () => {
    gamesScreen.style.display = "block";
    appsScreen.style.display = "none";
  });
} else {
  console.error("Один или несколько элементов экрана games/apps не найдены.");
}
