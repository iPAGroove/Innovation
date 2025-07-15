// admin.js

import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const adminPanel = document.getElementById('adminPanel');
    const openAdminPanelBtn = document.getElementById('openAdminPanel');
    const closeAdminPanelBtn = document.getElementById('closeAdminPanel');
    const adminTabButtons = document.querySelectorAll('.admin-tab-btn');
    const adminSections = document.querySelectorAll('.admin-section');

    // Add Game elements
    const addGameForm = document.getElementById('addGameForm');
    const gameNameInput = document.getElementById('gameName');
    const gameIconUrlInput = document.getElementById('gameIconUrl');
    const gameDownloadLinkInput = document.getElementById('gameDownloadLink');
    const gameSizeInput = document.getElementById('gameSize');
    const gameMinimaliOSInput = document.getElementById('gameMinimaliOS');
    const gameTypeSelect = document.getElementById('gameType');
    const gameMessage = document.getElementById('gameMessage');

    // Add App elements
    const addAppForm = document.getElementById('addAppForm');
    const appNameInput = document.getElementById('appName');
    const appIconUrlInput = document.getElementById('appIconUrl');
    const appDownloadLinkInput = document.getElementById('appDownloadLink');
    const appSizeInput = document.getElementById('appSize');
    const appMinimaliOSInput = document.getElementById('appMinimaliOS');
    const appTypeSelect = document.getElementById('appType');
    const appMessage = document.getElementById('appMessage');

    // Edit Item elements
    const editItemsTab = document.getElementById('editItemsTab');
    const editItemsSection = document.getElementById('editItemsSection');
    const editGamesList = document.getElementById('editGamesList');
    const editAppsList = document.getElementById('editAppsList');
    const editItemForm = document.getElementById('editItemForm');
    const editItemIdInput = document.getElementById('editItemId');
    const editItemCollectionInput = document.getElementById('editItemCollection');
    const editItemNameInput = document.getElementById('editItemName');
    const editItemIconUrlInput = document.getElementById('editItemIconUrl');
    const editItemDownloadLinkInput = document.getElementById('editItemDownloadLink');
    const editItemSizeInput = document.getElementById('editItemSize');
    const editItemMinimaliOSInput = document.getElementById('editItemMinimaliOS'); // ИСПРАВЛЕНО ЗДЕСЬ!
    const editItemTypeSelect = document.getElementById('editItemType');
    const deleteItemBtn = document.getElementById('deleteItemBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editMessage = document.getElementById('editMessage');

    // NEW: User Management elements (теперь относятся к отдельной панели)
    const usersPanel = document.getElementById('usersPanel'); // Новая панель
    const openUsersPanelBtn = document.getElementById('openUsersPanel'); // Новая кнопка
    const closeUsersPanelBtn = document.getElementById('closeUsersPanel'); // Кнопка закрытия
    const usersList = document.getElementById('usersList');
    const editUserForm = document.getElementById('editUserForm');
    const editUserIdInput = document.getElementById('editUserId');
    const editUserEmailInput = document.getElementById('editUserEmail');
    const editUserNicknameInput = document.getElementById('editUserNickname');
    const editUserStatusSelect = document.getElementById('editUserStatus');
    const vipEndDateInput = document.getElementById('vipEndDate');
    const cancelUserEditBtn = document.getElementById('cancelUserEditBtn');
    const userMessage = document.getElementById('userMessage');

    // Check for all required elements
    const requiredElements = [
        adminPanel, openAdminPanelBtn, closeAdminPanelBtn,
        addGameForm, gameNameInput, gameIconUrlInput, gameDownloadLinkInput, gameSizeInput, gameMinimaliOSInput, gameTypeSelect, gameMessage,
        addAppForm, appNameInput, appIconUrlInput, appDownloadLinkInput, appSizeInput, appMinimaliOSInput, appTypeSelect, appMessage,
        editItemsTab, editItemsSection, editGamesList, editAppsList, editItemForm, editItemIdInput, editItemCollectionInput,
        editItemNameInput, editItemIconUrlInput, editItemDownloadLinkInput, editItemSizeInput, editItemMinimaliOSInput,
        editItemTypeSelect, deleteItemBtn, cancelEditBtn, editMessage,
        // NEW user management elements
        usersPanel, openUsersPanelBtn, closeUsersPanelBtn, usersList, editUserForm, editUserIdInput, editUserEmailInput,
        editUserNicknameInput, editUserStatusSelect, vipEndDateInput, cancelUserEditBtn, userMessage
    ];

    if (requiredElements.some(el => !el)) {
        // Добавлено более детальное логирование отсутствующих элементов
        requiredElements.forEach(el => {
            if (!el) {
                console.error(`❗ Отсутствует DOM элемент с ID: ${el ? el.id : 'undefined'}`);
            }
        });
        console.error("❗ Отсутствуют обязательные DOM элементы для admin.js. Проверьте index.html.");
        return;
    }

    const db = window.db; // Get db from global window object
    const auth = window.auth; // Get auth from global window object

    if (!db || !auth) {
        console.error("❗ Firestore (db) или Auth не инициализированы. Убедитесь, что firebaseApp инициализируется до admin.js");
        return;
    }

    // Function to open/close admin panel
    openAdminPanelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Close menu panel if it's open
        if (window.closeMenuPanel) {
            window.closeMenuPanel();
        }
        // Close users panel if it's open
        if (usersPanel.classList.contains('active')) {
            usersPanel.classList.remove('active');
        }
        adminPanel.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        document.getElementById('addGameTab').click(); // Активируем первую вкладку по умолчанию
    });

    closeAdminPanelBtn.addEventListener('click', () => {
        adminPanel.classList.remove('active');
        document.body.style.overflow = ''; // Restore background scrolling
    });

    // NEW: Function to open/close users panel
    openUsersPanelBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (window.closeMenuPanel) {
            window.closeMenuPanel();
        }
        // Close admin panel if it's open
        if (adminPanel.classList.contains('active')) {
            adminPanel.classList.remove('active');
        }
        usersPanel.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        editUserForm.style.display = 'none'; // Hide user edit form
        userMessage.textContent = ''; // Clear any user messages
        await loadUsersForEditing(); // Load users when panel opens
    });

    closeUsersPanelBtn.addEventListener('click', () => {
        usersPanel.classList.remove('active');
        document.body.style.overflow = '';
    });


    // Function to switch tabs (for adminPanel only)
    adminTabButtons.forEach(button => {
        button.addEventListener('click', async () => {
            adminTabButtons.forEach(btn => btn.classList.remove('active'));
            adminSections.forEach(section => section.classList.remove('active'));

            button.classList.add('active');
            const targetContentId = button.dataset.content;
            document.getElementById(`${targetContentId}Section`).classList.add('active');

            // If "Edit Items" tab is clicked, load the items
            if (targetContentId === 'editItems') {
                editItemForm.style.display = 'none'; // Hide edit form when switching to list view
                editMessage.textContent = ''; // Clear any previous messages
                await loadItemsForEditing('Games', editGamesList);
                await loadItemsForEditing('Apps', editAppsList);
            }
            // Removed usersTab logic from here
        });
    });

    // Handle Add Game form submission
    addGameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        gameMessage.textContent = ''; // Clear previous messages

        const user = auth.currentUser;
        if (!user) {
            gameMessage.style.color = '#dc3545';
            gameMessage.textContent = 'Для добавления игр необходимо быть авторизованным.';
            return;
        }

        const gameData = {
            name: gameNameInput.value.trim(),
            iconUrl: gameIconUrlInput.value.trim(),
            downloadLink: gameDownloadLinkInput.value.trim(),
            size: gameSizeInput.value.trim(),
            minimaliOS: gameMinimaliOSInput.value.trim(),
            type: gameTypeSelect.value,
            createdAt: new Date(),
            addedBy: user.email
        };

        try {
            await addDoc(collection(db, "Games"), gameData);
            gameMessage.style.color = '#28a745';
            gameMessage.textContent = 'Игра успешно добавлена!';
            addGameForm.reset(); // Clear the form
        } catch (error) {
            console.error("Ошибка при добавлении игры:", error);
            gameMessage.style.color = '#dc3545';
            gameMessage.textContent = `Ошибка: ${error.message}`;
        }
    });

    // Handle Add App form submission
    addAppForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        appMessage.textContent = ''; // Clear previous messages

        const user = auth.currentUser;
        if (!user) {
            appMessage.style.color = '#dc3545';
            appMessage.textContent = 'Для добавления приложений необходимо быть авторизованным.';
            return;
        }

        const appData = {
            name: appNameInput.value.trim(),
            iconUrl: appIconUrlInput.value.trim(),
            downloadLink: appDownloadLinkInput.value.trim(),
            size: appSizeInput.value.trim(),
            minimaliOS: appMinimaliOSInput.value.trim(),
            type: appTypeSelect.value,
            createdAt: new Date(),
            addedBy: user.email
        };

        try {
            await addDoc(collection(db, "Apps"), appData);
            appMessage.style.color = '#28a745';
            appMessage.textContent = 'Приложение успешно добавлено!';
            addAppForm.reset(); // Clear the form
        } catch (error) {
            console.error("Ошибка при добавлении приложения:", error);
            appMessage.style.color = '#dc3545';
            appMessage.textContent = `Ошибка: ${error.message}`;
        }
    });

    // Function to load items for editing/deleting
    async function loadItemsForEditing(collectionName, listElement) {
        listElement.innerHTML = ''; // Clear list
        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            if (querySnapshot.empty) {
                listElement.innerHTML = `<li>Нет элементов для отображения.</li>`;
                return;
            }
            querySnapshot.forEach((doc) => {
                const item = doc.data();
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.name}</span>
                    <div class="item-actions">
                        <button data-id="${doc.id}" data-collection="${collectionName}" class="edit-item-btn">Редактировать</button>
                    </div>
                `;
                listElement.appendChild(li);
            });
        } catch (error) {
            console.error(`Ошибка загрузки ${collectionName} для редактирования:`, error);
            listElement.innerHTML = `<li>Ошибка загрузки: ${error.message}</li>`;
        }
    }

    // Event Delegation for Edit buttons in lists
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-item-btn')) {
            const itemId = e.target.dataset.id;
            const itemCollection = e.target.dataset.collection;
            editMessage.textContent = ''; // Clear previous messages
            try {
                const docRef = doc(db, itemCollection, itemId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    editItemIdInput.value = itemId;
                    editItemCollectionInput.value = itemCollection;
                    editItemNameInput.value = data.name || '';
                    editItemIconUrlInput.value = data.iconUrl || '';
                    editItemDownloadLinkInput.value = data.downloadLink || '';
                    editItemSizeInput.value = data.size || '';
                    editItemMinimaliOSInput.value = data.minimaliOS || '';
                    editItemTypeSelect.value = data.type || 'free'; // Default to 'free' if type is missing
                    editItemForm.style.display = 'flex'; // Show the edit form
                } else {
                    editMessage.style.color = '#dc3545';
                    editMessage.textContent = 'Элемент не найден.';
                }
            } catch (error) {
                console.error("Ошибка загрузки элемента для редактирования:", error);
                editMessage.style.color = '#dc3545';
                editMessage.textContent = `Ошибка: ${error.message}`;
            }
        }
        // NEW: Event listener for editing users (теперь только здесь, так как usersPanel отдельна)
        if (e.target.classList.contains('edit-user-btn')) {
            const userId = e.target.dataset.id;
            userMessage.textContent = '';
            try {
                const userDocRef = doc(db, "users", userId);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    editUserIdInput.value = userId;
                    editUserEmailInput.value = userData.email || '';
                    editUserNicknameInput.value = userData.nickname || '';
                    editUserStatusSelect.value = userData.isVip ? 'vip' : 'free';
                    // Show/hide VIP end date input based on status
                    if (editUserStatusSelect.value === 'vip') {
                        vipEndDateInput.style.display = 'block';
                        vipEndDateInput.previousElementSibling.style.display = 'block'; // Label
                        if (userData.vipEndDate) {
                            // Convert Firebase Timestamp to YYYY-MM-DD for input type="date"
                            const date = userData.vipEndDate.toDate();
                            vipEndDateInput.value = date.toISOString().split('T')[0];
                        } else {
                            vipEndDateInput.value = '';
                        }
                    } else {
                        vipEndDateInput.style.display = 'none';
                        vipEndDateInput.previousElementSibling.style.display = 'none';
                        vipEndDateInput.value = '';
                    }
                    editUserForm.style.display = 'flex'; // Show the user edit form
                } else {
                    userMessage.style.color = '#dc3545';
                    userMessage.textContent = 'Пользователь не найден.';
                }
            } catch (error) {
                console.error("Ошибка загрузки пользователя для редактирования:", error);
                userMessage.style.color = '#dc3545';
                userMessage.textContent = `Ошибка: ${error.message}`;
            }
        }
    });

    // Handle Edit Item form submission
    editItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        editMessage.textContent = '';
        const itemId = editItemIdInput.value;
        const itemCollection = editItemCollectionInput.value;
        const user = auth.currentUser;

        if (!user) {
            editMessage.style.color = '#dc3545';
            editMessage.textContent = 'Для редактирования элементов необходимо быть авторизованным.';
            return;
        }

        const updatedData = {
            name: editItemNameInput.value.trim(),
            iconUrl: editItemIconUrlInput.value.trim(),
            downloadLink: editItemDownloadLinkInput.value.trim(),
            size: editItemSizeInput.value.trim(),
            minimaliOS: editItemMinimaliOSInput.value.trim(),
            type: editItemTypeSelect.value,
            lastModifiedAt: new Date(),
            lastModifiedBy: user.email
        };

        try {
            await updateDoc(doc(db, itemCollection, itemId), updatedData);
            editMessage.style.color = '#28a745';
            editMessage.textContent = 'Элемент успешно обновлен!';
            editItemForm.style.display = 'none'; // Hide the form
            // Reload the lists
            await loadItemsForEditing('Games', editGamesList);
            await loadItemsForEditing('Apps', editAppsList);
        } catch (error) {
            console.error("Ошибка при обновлении элемента:", error);
            editMessage.style.color = '#dc3545';
            editMessage.textContent = `Ошибка: ${error.message}`;
        }
    });

    // Handle Delete Item button
    deleteItemBtn.addEventListener('click', async () => {
        const confirmDelete = confirm('Вы уверены, что хотите удалить этот элемент?');
        if (!confirmDelete) return;

        editMessage.textContent = '';
        const itemId = editItemIdInput.value;
        const itemCollection = editItemCollectionInput.value;

        try {
            await deleteDoc(doc(db, itemCollection, itemId));
            editMessage.style.color = '#28a745';
            editMessage.textContent = 'Элемент успешно удален!';
            editItemForm.style.display = 'none'; // Hide the form
            // Reload the lists
            await loadItemsForEditing('Games', editGamesList);
            await loadItemsForEditing('Apps', editAppsList);
        } catch (error) {
            console.error("Ошибка при удалении элемента:", error);
            editMessage.style.color = '#dc3545';
            editMessage.textContent = `Ошибка: ${error.message}`;
        }
    });

    // Handle Cancel Edit button
    cancelEditBtn.addEventListener('click', () => {
        editItemForm.style.display = 'none';
        editMessage.textContent = '';
    });

    // --- User Management Logic (для usersPanel) ---

    // Function to load users for editing/deleting
    async function loadUsersForEditing() {
        usersList.innerHTML = ''; // Clear list
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            if (querySnapshot.empty) {
                usersList.innerHTML = `<li>Нет пользователей для отображения.</li>`;
                return;
            }
            querySnapshot.forEach((doc) => {
                const user = doc.data();
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${user.nickname || user.email} (${user.isVip ? 'VIP' : 'Free'})</span>
                    <div class="item-actions">
                        <button data-id="${doc.id}" class="edit-user-btn">Редактировать</button>
                    </div>
                `;
                usersList.appendChild(li);
            });
        } catch (error) {
            console.error("Ошибка загрузки пользователей для редактирования:", error);
            usersList.innerHTML = `<li>Ошибка загрузки: ${error.message}</li>`;
        }
    }

    // Handle Edit User form submission
    editUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        userMessage.textContent = '';
        const userId = editUserIdInput.value;
        const user = auth.currentUser;

        if (!user) {
            userMessage.style.color = '#dc3545';
            userMessage.textContent = 'Для редактирования пользователей необходимо быть авторизованным.';
            return;
        }

        const isVip = editUserStatusSelect.value === 'vip';
        let vipEndDate = null;

        if (isVip && vipEndDateInput.value) {
            vipEndDate = new Date(vipEndDateInput.value);
            // Добавляем один день, чтобы включить весь выбранный день
            vipEndDate.setDate(vipEndDate.getDate() + 1);
        }

        const updatedUserData = {
            nickname: editUserNicknameInput.value.trim(),
            isVip: isVip,
            vipEndDate: vipEndDate,
            lastModifiedAt: new Date(),
            lastModifiedBy: user.email
        };

        try {
            await updateDoc(doc(db, "users", userId), updatedUserData);
            userMessage.style.color = '#28a745';
            userMessage.textContent = 'Данные пользователя успешно обновлены!';
            editUserForm.style.display = 'none'; // Hide the form
            await loadUsersForEditing(); // Reload the users list
        } catch (error) {
            console.error("Ошибка при обновлении пользователя:", error);
            userMessage.style.color = '#dc3545';
            userMessage.textContent = `Ошибка: ${error.message}`;
        }
    });

    // Handle VIP End Date visibility
    editUserStatusSelect.addEventListener('change', () => {
        if (editUserStatusSelect.value === 'vip') {
            vipEndDateInput.style.display = 'block';
            vipEndDateInput.previousElementSibling.style.display = 'block'; // Label
        } else {
            vipEndDateInput.style.display = 'none';
            vipEndDateInput.previousElementSibling.style.display = 'none';
            vipEndDateInput.value = ''; // Clear date if not VIP
        }
    });

    // Handle Cancel User Edit button
    cancelUserEditBtn.addEventListener('click', () => {
        editUserForm.style.display = 'none';
        userMessage.textContent = '';
    });
});
