// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2In0cOmuiYB6zNj0dQrdJ8bwPkINKdzA",
  authDomain: "updaterepoipa.firebaseapp.com",
  databaseURL: "https://updaterepoipa-default-rtdb.firebaseio.com",
  projectId: "updaterepoipa",
  storageBucket: "updaterepoipa.appspot.com",
  messagingSenderId: "621595788422",
  appId: "1:621595788422:web:9d99e1ca31188235243d07",
  measurementId: "G-2CYBC93R03"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Экспорт объекта авторизации
export const auth = getAuth(app);
