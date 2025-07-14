// admin.js

import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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
    const gameDownloadLinkInput = document.getElementById('gameDownloadLink'); // NEW
    const gameSizeInput = document.getElementById('gameSize');             // NEW
    const gameMinimaliOSInput = document.getElementById('gameMinimaliOS'); // NEW
    const gameTypeSelect = document.getElementById('gameType');
    const gameMessage = document.getElementById('gameMessage');

    // Add App elements
    const addAppForm = document.getElementById('addAppForm');
    const appNameInput = document.getElementById('appName');
    const appIconUrlInput = document.getElementById('appIconUrl');
    const appDownloadLinkInput = document.getElementById('appDownloadLink'); // NEW
    const appSizeInput = document.getElementById('appSize');             // NEW
    const appMinimaliOSInput = document.getElementById('appMinimaliOS'); // NEW
    const appTypeSelect = document.getElementById('appType');
    const appMessage = document.getElementById('appMessage');

    // Edit Item elements (NEW SECTION)
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
    const editItemMinimaliOSInput = document.getElementById('editItemMinimaliOS');
    const editItemTypeSelect = document.getElementById('editItemType');
    const deleteItemBtn = document.getElementById('deleteItemBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editMessage = document.getElementById('editMessage');


    // Check for all required elements
    const requiredElements = [
        adminPanel, openAdminPanelBtn, closeAdminPanelBtn,
        addGameForm, gameNameInput, gameIconUrlInput, gameDownloadLinkInput, gameSizeInput, gameMinimaliOSInput, gameTypeSelect, gameMessage,
        addAppForm, appNameInput, appIconUrlInput, appDownloadLinkInput, appSizeInput, appMinimaliOSInput, appTypeSelect, appMessage,
        editItemsTab, editItemsSection, editGamesList, editAppsList, editItemForm, editItemIdInput, editItemCollectionInput,
        editItemNameInput, editItemIconUrlInput, editItemDownloadLinkInput, editItemSizeInput, editItemMinimaliOSInput,
        editItemTypeSelect, deleteItemBtn, cancelEditBtn, editMessage
    ];

    if (requiredElements.some(el => !el)) {
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
        if (window.closeMenuPanel) { // Check if the function exists
            window.closeMenuPanel();
        }
        adminPanel.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });

    closeAdminPanelBtn.addEventListener('click', () => {
        adminPanel.classList.remove('active');
        document.body.style.overflow = ''; // Restore background scrolling
    });

    // Function to switch tabs
    adminTabButtons.forEach(button => {
        button.addEventListener('click', async () => { // Made async for loadItemsForEditing
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
            downloadLink: gameDownloadLinkInput.value.trim(), // NEW
            size: gameSizeInput.value.trim(),                 // NEW
            minimaliOS: gameMinimaliOSInput.value.trim(),     // NEW
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
            downloadLink: appDownloadLinkInput.value.trim(), // NEW
            size: appSizeInput.value.trim(),                 // NEW
            minimaliOS: appMinimaliOSInput.value.trim(),     // NEW
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
    });

    // Handle Edit Item form submission
    editItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        editMessage.textContent = '';

        const itemId = editItemIdInput.value;
        const itemCollection = editItemCollectionInput.value;
        if (!itemId || !itemCollection) {
            editMessage.style.color = '#dc3545';
            editMessage.textContent = 'Ошибка: не выбран элемент для редактирования.';
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            editMessage.style.color = '#dc3545';
            editMessage.textContent = 'Для редактирования необходимо быть авторизованным.';
            return;
        }

        const updatedData = {
            name: editItemNameInput.value.trim(),
            iconUrl: editItemIconUrlInput.value.trim(),
            downloadLink: editItemDownloadLinkInput.value.trim(),
            size: editItemSizeInput.value.trim(),
            minimaliOS: editItemMinimaliOSInput.value.trim(),
            type: editItemTypeSelect.value,
            lastModified: new Date(), // Add timestamp for modification
            modifiedBy: user.email // Save who modified it
        };

        try {
            const docRef = doc(db, itemCollection, itemId);
            await updateDoc(docRef, updatedData);
            editMessage.style.color = '#28a745';
            editMessage.textContent = 'Изменения сохранены успешно!';
            editItemForm.style.display = 'none'; // Hide the form
            // Reload the lists to reflect changes
            if (itemCollection === 'Games') {
                await loadItemsForEditing('Games', editGamesList);
            } else {
                await loadItemsForEditing('Apps', editAppsList);
            }
        } catch (error) {
            console.error("Ошибка сохранения изменений:", error);
            editMessage.style.color = '#dc3545';
            editMessage.textContent = `Ошибка: ${error.message}`;
        }
    });

    // Handle Delete Item button click
    deleteItemBtn.addEventListener('click', async () => {
        const confirmDelete = confirm('Вы уверены, что хотите удалить этот элемент? Это действие необратимо.');
        if (!confirmDelete) return;

        const itemId = editItemIdInput.value;
        const itemCollection = editItemCollectionInput.value;

        if (!itemId || !itemCollection) {
            editMessage.style.color = '#dc3545';
            editMessage.textContent = 'Ошибка: не выбран элемент для удаления.';
            return;
        }

        try {
            const docRef = doc(db, itemCollection, itemId);
            await deleteDoc(docRef);
            editMessage.style.color = '#28a745';
            editMessage.textContent = 'Элемент успешно удален!';
            editItemForm.style.display = 'none'; // Hide form after deletion
            // Reload the lists to reflect deletion
            if (itemCollection === 'Games') {
                await loadItemsForEditing('Games', editGamesList);
            } else {
                await loadItemsForEditing('Apps', editAppsList);
            }
        } catch (error) {
            console.error("Ошибка удаления элемента:", error);
            editMessage.style.color = '#dc3545';
            editMessage.textContent = `Ошибка: ${error.message}`;
        }
    });

    // Handle Cancel Edit button click
    cancelEditBtn.addEventListener('click', () => {
        editItemForm.style.display = 'none';
        editMessage.textContent = '';
    });

    // Initially show "Add Game" tab
    document.getElementById('addGameTab').click();
});
