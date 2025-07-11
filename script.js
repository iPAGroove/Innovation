const gamesScreen = document.getElementById("gamesScreen");
const appsScreen = document.getElementById("appsScreen");

document.getElementById("openGames").addEventListener("click", () => {
  gamesScreen.style.display = "block";
  appsScreen.style.display = "none";
});

document.getElementById("openApps").addEventListener("click", () => {
  appsScreen.style.display = "block";
  gamesScreen.style.display = "none";
});