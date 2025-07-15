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
    const gameHackFeaturesInput = document.getElementById('gameHackFeatures'); // NEW
    const gameTypeSelect = document.getElementById('gameType');
    const gameMessage = document.getElementById('gameMessage');

    // Add App elements
    const addAppForm = document.getElementById('addAppForm');
    const appNameInput = document.getElementById('appName');
    const appIconUrlInput = document.getElementById('appIconUrl');
    const appDownloadLinkInput = document.getElementById('appDownloadLink');
    const appSizeInput = document.getElementById('appSize');
    const appMinimaliOSInput = document.getElementById('appMinimaliOS');
    const appHackFeaturesInput = document.getElementById('appHackFeatures'); // NEW
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
    const editItemMinimaliOSInput = document.getElementById('editItemMinimaliOS');
    const editItemHackFeaturesInput = document.getElementById('editItemHackFeatures'); // NEW
    const editItemTypeSelect = document.getElementById('editItemType');
    const deleteItemBtn = document.getElementById('deleteItemBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editMessage = document.getElementById('editMessage');

    // User Management elements
    const usersPanel = document.getElementById('usersPanel');
    const openUsersPanelBtn = document.getElementById('openUsersPanel');
    const closeUsersPanelBtn = document.getElementById('closeUsersPanel');
    const usersList = document.getElementById('usersList');
    const editUserForm = document.getElementById('editUserForm');
    const editUserIdInput = document.getElementById('editUserId');
    const editUserEmailInput = document.getElementById('editUserEmail');
    const editUserNicknameInput = document.getElementById('editUserNickname');
    const editUserStatusSelect = document.getElementById('editUserStatus');
    const vipEndDateInput = document.getElementById('vipEndDate');
    const vipEndDateLabel = vipEndDateInput.previousElementSibling; // Label for VIP End Date
    const cancelUserEditBtn = document.getElementById('cancelUserEditBtn');
    const userMessage = document.getElementById('userMessage');

    // Check for all required elements
    const requiredElements = [
        adminPanel, openAdminPanelBtn, closeAdminPanelBtn,
        addGameForm, gameNameInput, gameIconUrlInput, gameDownloadLinkInput, gameSizeInput, gameMinimaliOSInput, gameHackFeaturesInput, gameTypeSelect, gameMessage,
        addAppForm, appNameInput, appIconUrlInput, appDownloadLinkInput, appSizeInput, appMinimaliOSInput, appHackFeaturesInput, appTypeSelect, appMessage,
        editItemsTab, editItemsSection, editGamesList, editAppsList, editItemForm, editItemIdInput, editItemCollectionInput,
        editItemNameInput, editItemIconUrlInput, editItemDownloadLinkInput, editItemSizeInput, editItemMinimaliOSInput, editItemHackFeaturesInput,
        editItemTypeSelect, deleteItemBtn, cancelEditBtn, editMessage,
        usersPanel, openUsersPanelBtn, closeUsersPanelBtn, usersList, editUserForm, editUserIdInput, editUserEmailInput,
        editUserNicknameInput, editUserStatusSelect, vipEndDateInput, vipEndDateLabel, cancelUserEditBtn, userMessage
    ];

    if (requiredElements.some(el => !el)) {
        requiredElements.forEach(el => {
            if (!el) {
                console.error(`❗ Missing DOM element: ${el ? el.id : 'undefined element (check console for missing element details)'}`);
            }
        });
        console.error("❗ Missing required DOM elements for admin.js. Please check index.html.");
        return;
    }

    const db = window.db; // Get db from global window object
    const auth = window.auth; // Get auth from global window object

    if (!db || !auth) {
        console.error("❗ Firestore (db) or Auth not initialized. Ensure firebaseApp is initialized before admin.js");
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
        document.getElementById('addGameTab').click(); // Activate first tab by default
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
        });
    });

    // Helper to get selected options from a multiple select
    function getSelectedOptions(selectElement) {
        return Array.from(selectElement.options)
                    .filter(option => option.selected)
                    .map(option => option.value);
    }

    // Handle Add Game form submission
    addGameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        gameMessage.textContent = ''; // Clear previous messages

        const user = auth.currentUser;
        if (!user) {
            gameMessage.style.color = '#dc3545';
            gameMessage.textContent = 'You must be logged in to add games.';
            return;
        }

        const gameData = {
            name: gameNameInput.value.trim(),
            iconUrl: gameIconUrlInput.value.trim(),
            downloadLink: gameDownloadLinkInput.value.trim(),
            size: gameSizeInput.value.trim(),
            minimaliOS: gameMinimaliOSInput.value.trim(),
            hackFeatures: gameHackFeaturesInput.value.trim(), // NEW field
            type: getSelectedOptions(gameTypeSelect), // Use helper for multiple select
            createdAt: new Date(),
            addedBy: user.email
        };

        try {
            await addDoc(collection(db, "Games"), gameData);
            gameMessage.style.color = '#28a745';
            gameMessage.textContent = 'Game successfully added!';
            addGameForm.reset(); // Clear the form
        } catch (error) {
            console.error("Error adding game:", error);
            gameMessage.style.color = '#dc3545';
            gameMessage.textContent = `Error: ${error.message}`;
        }
    });

    // Handle Add App form submission
    addAppForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        appMessage.textContent = ''; // Clear previous messages

        const user = auth.currentUser;
        if (!user) {
            appMessage.style.color = '#dc3545';
            appMessage.textContent = 'You must be logged in to add apps.';
            return;
        }

        const appData = {
            name: appNameInput.value.trim(),
            iconUrl: appIconUrlInput.value.trim(),
            downloadLink: appDownloadLinkInput.value.trim(),
            size: appSizeInput.value.trim(),
            minimaliOS: appMinimaliOSInput.value.trim(),
            hackFeatures: appHackFeaturesInput.value.trim(), // NEW field
            type: getSelectedOptions(appTypeSelect), // Use helper for multiple select
            createdAt: new Date(),
            addedBy: user.email
        };

        try {
            await addDoc(collection(db, "Apps"), appData);
            appMessage.style.color = '#28a745';
            appMessage.textContent = 'App successfully added!';
            addAppForm.reset(); // Clear the form
        } catch (error) {
            console.error("Error adding app:", error);
            appMessage.style.color = '#dc3545';
            appMessage.textContent = `Error: ${error.message}`;
        }
    });

    // Function to load items for editing/deleting
    async function loadItemsForEditing(collectionName, listElement) {
        listElement.innerHTML = ''; // Clear list
        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            if (querySnapshot.empty) {
                listElement.innerHTML = `<li>No items to display.</li>`;
                return;
            }
            querySnapshot.forEach((doc) => {
                const item = doc.data();
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.name}</span>
                    <div class="item-actions">
                        <button data-id="${doc.id}" data-collection="${collectionName}" class="edit-item-btn">Edit</button>
                    </div>
                `;
                listElement.appendChild(li);
            });
        } catch (error) {
            console.error(`Error loading ${collectionName} for editing:`, error);
            listElement.innerHTML = `<li>Error loading: ${error.message}</li>`;
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
                    editItemHackFeaturesInput.value = data.hackFeatures || ''; // NEW field

                    // Set selected options for multiple select
                    Array.from(editItemTypeSelect.options).forEach(option => {
                        option.selected = (Array.isArray(data.type) && data.type.includes(option.value)) || (!Array.isArray(data.type) && data.type === option.value);
                    });

                    editItemForm.style.display = 'flex'; // Show the edit form
                } else {
                    editMessage.style.color = '#dc3545';
                    editMessage.textContent = 'Item not found.';
                }
            } catch (error) {
                console.error("Error loading item for editing:", error);
                editMessage.style.color = '#dc3545';
                editMessage.textContent = `Error: ${error.message}`;
            }
        }
        // Event listener for editing users
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
                        vipEndDateLabel.style.display = 'block'; // Label
                        if (userData.vipEndDate) {
                            // Convert Firebase Timestamp to YYYY-MM-DD for input type="date"
                            const date = userData.vipEndDate.toDate();
                            vipEndDateInput.value = date.toISOString().split('T')[0];
                        } else {
                            vipEndDateInput.value = '';
                        }
                    } else {
                        vipEndDateInput.style.display = 'none';
                        vipEndDateLabel.style.display = 'none';
                        vipEndDateInput.value = '';
                    }
                    editUserForm.style.display = 'flex'; // Show the user edit form
                } else {
                    userMessage.style.color = '#dc3545';
                    userMessage.textContent = 'User not found.';
                }
            } catch (error) {
                console.error("Error loading user for editing:", error);
                userMessage.style.color = '#dc3545';
                userMessage.textContent = `Error: ${error.message}`;
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
            editMessage.textContent = 'You must be logged in to edit items.';
            return;
        }

        const updatedData = {
            name: editItemNameInput.value.trim(),
            iconUrl: editItemIconUrlInput.value.trim(),
            downloadLink: editItemDownloadLinkInput.value.trim(),
            size: editItemSizeInput.value.trim(),
            minimaliOS: editItemMinimaliOSInput.value.trim(),
            hackFeatures: editItemHackFeaturesInput.value.trim(), // NEW field
            type: getSelectedOptions(editItemTypeSelect), // Use helper for multiple select
            lastModifiedAt: new Date(),
            lastModifiedBy: user.email
        };

        try {
            await updateDoc(doc(db, itemCollection, itemId), updatedData);
            editMessage.style.color = '#28a745';
            editMessage.textContent = 'Item successfully updated!';
            editItemForm.style.display = 'none'; // Hide the form
            // Reload the lists
            await loadItemsForEditing('Games', editGamesList);
            await loadItemsForEditing('Apps', editAppsList);
            // Re-render items on main screens
            window.loadRealtimeCollection('Games', 'games');
            window.loadRealtimeCollection('Apps', 'apps');
        } catch (error) {
            console.error("Error updating item:", error);
            editMessage.style.color = '#dc3545';
            editMessage.textContent = `Error: ${error.message}`;
        }
    });

    // Handle Delete Item button
    deleteItemBtn.addEventListener('click', async () => {
        const confirmDelete = confirm('Are you sure you want to delete this item?');
        if (!confirmDelete) return;

        editMessage.textContent = '';
        const itemId = editItemIdInput.value;
        const itemCollection = editItemCollectionInput.value;

        try {
            await deleteDoc(doc(db, itemCollection, itemId));
            editMessage.style.color = '#28a745';
            editMessage.textContent = 'Item successfully deleted!';
            editItemForm.style.display = 'none'; // Hide the form
            // Reload the lists
            await loadItemsForEditing('Games', editGamesList);
            await loadItemsForEditing('Apps', editAppsList);
            // Re-render items on main screens
            window.loadRealtimeCollection('Games', 'games');
            window.loadRealtimeCollection('Apps', 'apps');
        } catch (error) {
            console.error("Error deleting item:", error);
            editMessage.style.color = '#dc3545';
            editMessage.textContent = `Error: ${error.message}`;
        }
    });

    // Handle Cancel Edit button
    cancelEditBtn.addEventListener('click', () => {
        editItemForm.style.display = 'none';
        editMessage.textContent = '';
    });

    // --- User Management Logic (for usersPanel) ---

    // Function to load users for editing/deleting
    async function loadUsersForEditing() {
        usersList.innerHTML = ''; // Clear list
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            if (querySnapshot.empty) {
                usersList.innerHTML = `<li>No users to display.</li>`;
                return;
            }
            querySnapshot.forEach((doc) => {
                const user = doc.data();
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${user.nickname || user.email} (${user.isVip ? 'VIP' : 'Free'})</span>
                    <div class="item-actions">
                        <button data-id="${doc.id}" class="edit-user-btn">Edit</button>
                    </div>
                `;
                usersList.appendChild(li);
            });
        } catch (error) {
            console.error("Error loading users for editing:", error);
            usersList.innerHTML = `<li>Error loading: ${error.message}</li>`;
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
            userMessage.textContent = 'You must be logged in to edit users.';
            return;
        }

        const isVip = editUserStatusSelect.value === 'vip';
        let vipEndDate = null;

        if (isVip) {
            const dateValue = vipEndDateInput.value;
            if (dateValue) {
                vipEndDate = new Date(dateValue);
                // Ensure date is valid and in the future
                if (isNaN(vipEndDate.getTime()) || vipEndDate < new Date()) {
                    userMessage.style.color = '#dc3545';
                    userMessage.textContent = 'Please enter a valid future VIP end date.';
                    return;
                }
            } else {
                userMessage.style.color = '#dc3545';
                userMessage.textContent = 'VIP status requires an end date.';
                return;
            }
        }

        const updatedUserData = {
            nickname: editUserNicknameInput.value.trim(),
            isVip: isVip,
            vipEndDate: vipEndDate,
            lastModifiedByAdmin: user.email,
            lastModifiedAt: new Date()
        };

        try {
            await updateDoc(doc(db, "users", userId), updatedUserData);
            userMessage.style.color = '#28a745';
            userMessage.textContent = 'User successfully updated!';
            editUserForm.style.display = 'none';
            await loadUsersForEditing(); // Reload users list
            // Force re-render of content if the current user's VIP status changed
            if (userId === auth.currentUser.uid) {
                window.currentUserIsVip = isVip;
                window.currentUserVipEndDate = vipEndDate;
                window.loadRealtimeCollection('Games', 'games');
                window.loadRealtimeCollection('Apps', 'apps');
            }
        } catch (error) {
            console.error("Error updating user:", error);
            userMessage.style.color = '#dc3545';
            userMessage.textContent = `Error: ${error.message}`;
        }
    });

    // Event listener for VIP status select to show/hide VIP End Date input
    editUserStatusSelect.addEventListener('change', () => {
        if (editUserStatusSelect.value === 'vip') {
            vipEndDateInput.style.display = 'block';
            vipEndDateLabel.style.display = 'block';
        } else {
            vipEndDateInput.style.display = 'none';
            vipEndDateLabel.style.display = 'none';
            vipEndDateInput.value = ''; // Clear date when switching to free
        }
    });

    // Handle Cancel User Edit button
    cancelUserEditBtn.addEventListener('click', () => {
        editUserForm.style.display = 'none';
        userMessage.textContent = '';
    });
});
