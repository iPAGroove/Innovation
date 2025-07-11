document.addEventListener("DOMContentLoaded", () => {
  const mailBtn = document.querySelector('.nav-item[title="Mail"]');
  const mailModal = document.getElementById('mailModal');
  const closeMail = document.getElementById('closeMail');

  mailBtn.addEventListener('click', () => {
    mailModal.classList.add('active');
  });

  closeMail.addEventListener('click', () => {
    mailModal.classList.remove('active');
  });

  // Закрытие при клике вне окна
  mailModal.addEventListener('click', (e) => {
    if (e.target === mailModal) {
      mailModal.classList.remove('active');
    }
  });
});
