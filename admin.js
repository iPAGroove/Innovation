import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const adminBtn = document.getElementById('adminPanelBtn');
  const adminModal = document.getElementById('adminModal');
  const closeModal = document.getElementById('closeAdminModal');
  const adminForm = document.getElementById('adminForm');

  if (!window.auth || !window.db) return;

  // Показываем кнопку только для админа
  window.auth.onAuthStateChanged(user => {
    if (user && user.email === "youradmin@example.com") {
      adminBtn.style.display = 'inline-block';
    }
  });

  // Открыть модалку
  adminBtn.addEventListener('click', () => {
    adminModal.classList.add('active');
  });

  // Закрыть модалку
  closeModal.addEventListener('click', () => {
    adminModal.classList.remove('active');
  });

  // Сохранить элемент
  adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('itemType').value;
    const title = document.getElementById('itemTitle').value.trim();
    const image = document.getElementById('itemImage').value.trim();
    const link = document.getElementById('itemLink').value.trim();

    try {
      await addDoc(collection(window.db, type), {
        title,
        image,
        link,
        timestamp: serverTimestamp()
      });
      alert('Успешно добавлено!');
      adminForm.reset();
      adminModal.classList.remove('active');
    } catch (err) {
      console.error('Ошибка при добавлении:', err);
      alert('Ошибка добавления!');
    }
  });
});
