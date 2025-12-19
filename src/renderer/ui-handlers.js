// ============================================
// UI EVENT HANDLERS AND INITIALIZATION
// ============================================

// ============================================
// DOM ELEMENT REFERENCES
// ============================================

// Main UI Elements
const selectImageBtn = document.getElementById('selectImageBtn');
const clearImageBtn = document.getElementById('clearImageBtn');
const imageFileName = document.getElementById('imageFileName');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const sidebar = document.getElementById('sidebar');
const reopenBtn = document.getElementById('reopenBtn');
const refreshBtn = document.getElementById('refreshBtn');
const closeAppBtn = document.getElementById('closeAppBtn');

// Login Elements
const loginContent = document.getElementById('loginContent');
const appContent = document.getElementById('appContent');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const loginBtnText = document.getElementById('loginBtnText');
const loginSpinner = document.getElementById('loginSpinner');

// User Interface Elements
const userInfo = document.getElementById('userInfo');
const themeCustomizeBtn = document.getElementById('themeCustomizeBtn');

// Hide theme button by default (login state)
if (themeCustomizeBtn) themeCustomizeBtn.classList.add('hidden');

// Hide theme button by default (login state)
if (themeCustomizeBtn) themeCustomizeBtn.classList.add('hidden');
const userRole = document.getElementById('userRole');
const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');

// Ticket Management Elements
const ticketForm = document.getElementById('ticketForm');
const clearFormButton = document.getElementById('clearForm');
const submitTicketBtn = document.getElementById('submitTicketBtn');
const submitBtnText = document.getElementById('submitBtnText');
const submitSpinner = document.getElementById('submitSpinner');
const successMessage = document.getElementById('successMessage');
const successMessageText = document.getElementById('successMessageText');
const ticketsList = document.getElementById('ticketsList');
const noTicketsMessage = document.getElementById('noTickets');

// Tab Elements
const newTicketTab = document.getElementById('newTicketTab');
const myTicketsTab = document.getElementById('myTicketsTab');
const settingsTab = document.getElementById('settingsTab');
const reportsTab = document.getElementById('reportsTab');
const onCallTab = document.getElementById('onCallTab');
const newTicketContent = document.getElementById('newTicketContent');
const myTicketsContent = document.getElementById('myTicketsContent');
const settingsContent = document.getElementById('settingsContent');
const reportsContent = document.getElementById('reportsContent');
const onCallContent = document.getElementById('onCallContent');
 
// On-Call Edit Elements
const editOnCallBtn = document.getElementById('editOnCallBtn');
const onCallEditModal = document.getElementById('onCallEditModal');
const closeOnCallEditModal = document.getElementById('closeOnCallEditModal');
const cancelOnCallEdit = document.getElementById('cancelOnCallEdit');
const saveOnCallOrder = document.getElementById('saveOnCallOrder');
// Filter Elements
const ticketFilter = document.getElementById('ticketFilter');
const departmentFilter = document.getElementById('departmentFilter');
const ticketSearchInput = document.getElementById('ticketSearchInput');
const ticketsSubtitle = document.getElementById('ticketsSubtitle');
const departmentSelect = document.getElementById('department');
const nameInput = document.getElementById('name');

// Modal Elements
const ticketModal = document.getElementById('ticketModal');
const closeModal = document.getElementById('closeModal');
const modalTicketId = document.getElementById('modalTicketId');
const modalSubject = document.getElementById('modalSubject');
const modalName = document.getElementById('modalName');
const modalDepartment = document.getElementById('modalDepartment');
const modalPriority = document.getElementById('modalPriority');
const modalDate = document.getElementById('modalDate');
const modalDescription = document.getElementById('modalDescription');
const modalStatusBadge = document.getElementById('modalStatusBadge');
const modalStatusContainer = document.getElementById('modalStatusContainer');
const modalStatus = document.getElementById('modalStatus');
const updateTicketBtn = document.getElementById('updateTicketBtn');
const deleteTicketBtn = document.getElementById('deleteTicketBtn');

// Confirmation Modal Elements
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Image Viewer Elements
const imageViewerModal = document.getElementById('imageViewerModal');
const closeImageViewer = document.getElementById('closeImageViewer');
const fullSizeImage = document.getElementById('fullSizeImage');
const imageViewerTitle = document.getElementById('imageViewerTitle');
const imageInfo = document.getElementById('imageInfo');
const downloadImageBtn = document.getElementById('downloadImageBtn');

// Settings Elements
const departmentsList = document.getElementById('departmentsList');
const newDepartment = document.getElementById('newDepartment');
const addDepartmentBtn = document.getElementById('addDepartmentBtn');
const noDepartments = document.getElementById('noDepartments');
const statusesList = document.getElementById('statusesList');
const newStatus = document.getElementById('newStatus');
const addStatusBtn = document.getElementById('addStatusBtn');
const colorSwatches = document.querySelectorAll('.color-swatch');
const resetThemeBtn = document.getElementById('resetThemeBtn');

// User Management Elements
const newUsername = document.getElementById('newUsername');
const newPassword = document.getElementById('newPassword');
const newFullName = document.getElementById('newFullName');
const newUserDepartment = document.getElementById('newUserDepartment');
const newUserRole = document.getElementById('newUserRole');
const addUserBtn = document.getElementById('addUserBtn');
const usersList = document.getElementById('usersList');
const noUsers = document.getElementById('noUsers');
const userMessage = document.getElementById('userMessage');
const usersSearchInput = document.getElementById('usersSearchInput');

// Theme Customization Elements (Staff Only)
const themeCustomizationModal = document.getElementById('themeCustomizationModal');
const closeThemeModal = document.getElementById('closeThemeModal');
const saveThemeModalBtn = document.getElementById('saveThemeModalBtn');
const resetThemeModalBtn = document.getElementById('resetThemeModalBtn');
const primaryColorSwatches = document.querySelectorAll('#primaryColorSwatches .color-swatch');
const secondaryColorSwatches = document.querySelectorAll('#secondaryColorSwatches .color-swatch');
const successColorSwatches = document.querySelectorAll('#successColorSwatches .color-swatch');

// Reports Elements
const reportMonth = document.getElementById('reportMonth');
const reportYear = document.getElementById('reportYear');
const reportType = document.getElementById('reportType');
const reportDepartmentFilter = document.getElementById('reportDepartmentFilter');
const reportDepartment = document.getElementById('reportDepartment');
const generateReportBtn = document.getElementById('generateReportBtn');
const reportDisplay = document.getElementById('reportDisplay');
const reportTitle = document.getElementById('reportTitle');
const reportPeriod = document.getElementById('reportPeriod');
const reportFilters = document.getElementById('reportFilters');
const reportGenerated = document.getElementById('reportGenerated');
const reportSummary = document.getElementById('reportSummary');
const summaryStats = document.getElementById('summaryStats');
const reportContent = document.getElementById('reportContent');
const exportPDFBtn = document.getElementById('exportPDFBtn');
const noReportData = document.getElementById('noReportData');

// Notification Elements
const notificationToggle = document.getElementById('notificationToggle');
const taskbarFlashToggle = document.getElementById('taskbarFlashToggle');
const testNotificationBtn = document.getElementById('testNotificationBtn');

// ============================================
// WINDOW CONTROL EVENT HANDLERS
// ============================================

/**
 * Initialize window control event listeners
 */
function initializeWindowControls() {
    if (closeAppBtn) {
        closeAppBtn.addEventListener('click', function () {
            if (window.electronAPI && window.electronAPI.minimizeToTray) {
                window.electronAPI.minimizeToTray();
            } else {
                if (sidebar) sidebar.style.display = 'none';
                if (reopenBtn) reopenBtn.classList.add('visible');
            }
        });
    }

    if (reopenBtn) {
        reopenBtn.addEventListener('click', function () {
            if (window.electronAPI && window.electronAPI.showWindow) {
                window.electronAPI.showWindow();
            } else {
                if (sidebar) sidebar.style.display = 'block';
                reopenBtn.classList.remove('visible');
            }
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
            // Add a spinning animation while refreshing
            refreshBtn.style.animation = 'spin 1s linear infinite';
            
            // Reload the window to reflect any code changes
            setTimeout(() => {
                location.reload();
            }, 300);
        });
    }
}

// ============================================
// IMAGE HANDLING EVENT HANDLERS
// ============================================

/**
 * Initialize image handling event listeners
 */
function initializeImageHandlers() {
    if (selectImageBtn) {
        selectImageBtn.addEventListener('click', async function () {
            try {
                const result = await window.electronAPI.selectImageFile();
                if (result.success) {
                    currentTicketImage = result.data;
                    if (imageFileName) imageFileName.textContent = 'Image selected';
                    if (previewImage) previewImage.src = result.data;
                    if (imagePreview) imagePreview.classList.remove('hidden');
                    if (clearImageBtn) clearImageBtn.classList.remove('hidden');
                } else {
                    showErrorMessage('Failed to select image: ' + result.error);
                }
            } catch (error) {
                showErrorMessage('Error selecting image: ' + error.message);
            }
        });
    }

    if (clearImageBtn) {
        clearImageBtn.addEventListener('click', function () {
            currentTicketImage = null;
            if (imageFileName) imageFileName.textContent = 'No image selected';
            if (imagePreview) imagePreview.classList.add('hidden');
            clearImageBtn.classList.add('hidden');
            if (previewImage) previewImage.src = '';
        });
    }

    // Image viewer event handlers
    if (closeImageViewer) {
        closeImageViewer.addEventListener('click', function () {
            if (imageViewerModal) imageViewerModal.classList.remove('active');
            if (fullSizeImage) fullSizeImage.classList.remove('zoomed');
        });
    }

    if (imageViewerModal) {
        imageViewerModal.addEventListener('click', function (e) {
            if (e.target === imageViewerModal) {
                imageViewerModal.classList.remove('active');
                if (fullSizeImage) fullSizeImage.classList.remove('zoomed');
            }
        });
    }

    if (fullSizeImage) {
        fullSizeImage.addEventListener('click', function () {
            this.classList.toggle('zoomed');
        });
    }

    if (downloadImageBtn) {
        downloadImageBtn.addEventListener('click', function () {
            const imageUrl = fullSizeImage.src;
            const fileName = (imageViewerTitle ? imageViewerTitle.textContent.replace('Image Preview - ', '') : 'ticket_image') || 'ticket_image';

            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Preview image click handler
    if (previewImage) {
        previewImage.addEventListener('click', function () {
            if (this.src && this.src !== '') {
                showFullSizeImage(this.src, 'Selected Image');
            }
        });
    }

    // Modal image click handler
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        modalImage.addEventListener('click', function () {
            if (this.src && this.src !== '') {
                const ticketId = currentTicket?.TicketID || currentTicket?.id || 'Unknown';
                showFullSizeImage(this.src, `Ticket ${ticketId} - Attached Image`);
            }
        });
    }
}

// ============================================
// AUTHENTICATION EVENT HANDLERS
// ============================================

/**
 * Initialize authentication event listeners
 */
function initializeAuthHandlers() {
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            if (!username || !password) {
                showLoginError('Please enter both username and password');
                return;
            }

            setLoginLoading(true);

            try {
                const connectionResult = await window.electronAPI.connectToDatabase();
                if (!connectionResult.success) {
                    throw new Error('Database connection failed: ' + connectionResult.message);
                }

                const authResult = await window.electronAPI.authenticateUser(username, password);

                if (authResult.success) {
                    currentUser = {
                        username: authResult.user.username,
                        fullName: authResult.user.fullName,
                        department: authResult.user.department,
                        role: authResult.user.role
                    };

                    // Handle Remember Me - store both formats for consistency and backward compatibility
                    if (rememberMe) {
                        localStorage.setItem('rememberedUsername', username);
                        localStorage.setItem('rememberedUser', JSON.stringify({ username: currentUser.username }));
                    } else {
                        localStorage.removeItem('rememberedUsername');
                        localStorage.removeItem('rememberedUser');
                    }


                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    resetUIState();
                    if (loginError) loginError.classList.add('hidden');
                    await loadDepartments();
                    showAppContent();
                    await loadTickets();
                } else {
                    showLoginError(authResult.error);
                }
            } catch (error) {
                showLoginError('Login failed: ' + error.message);
            } finally {
                setLoginLoading(false);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function () {
            // Stop auto-refresh
            if (autoRefreshInitialized) {
                try {
                    await window.electronAPI.stopAutoRefresh();
                } catch (error) {
                    console.error('Error stopping auto-refresh:', error);
                }
                if (fallbackRefreshInterval) {
                    clearInterval(fallbackRefreshInterval);
                    fallbackRefreshInterval = null;
                }
                autoRefreshInitialized = false;
            }

            // Remove notification listeners
            if (window.electronAPI && window.electronAPI.removeFocusListeners) {
                window.electronAPI.removeFocusListeners();
            }

            // Reset notification system
            unreadTicketCount = 0;
            lastKnownTicketCount = 0;
            updateTicketNotificationBadge();

            // Reset refresh button animation
            if (refreshBtn) {
                refreshBtn.style.animation = 'none';
            }

            resetUIState();
            resetUserManagementForm();
            currentUser = null;
            localStorage.removeItem('currentUser');
            // Clear remembered user object but KEEP the username pre-filled for next login
            localStorage.removeItem('rememberedUser');
            // NOTE: We keep 'rememberedUsername' so it will be pre-filled on login screen
            showLoginContent();
        });
    }
}

// ============================================
// TAB MANAGEMENT EVENT HANDLERS
// ============================================

/**
 * Initialize tab management event listeners
 */
function initializeTabHandlers() {
    if (newTicketTab) {
        newTicketTab.addEventListener('click', function () {
            stopTicketTabAutoRefresh();
            activateTab(newTicketTab, newTicketContent);
            if (ticketForm) ticketForm.reset();
            if (currentUser && currentUser.role === 'Staff' && departmentSelect) {
                setTimeout(() => {
                    departmentSelect.value = currentUser.department;
                    departmentSelect.disabled = true;
                }, 10);
            }
        });
    }

    if (myTicketsTab) {
        myTicketsTab.addEventListener('click', function () {
            activateTab(myTicketsTab, myTicketsContent);
            // Load tickets and reset notifications since the user is viewing the list
            loadTickets(true);
            // Start auto-refresh for the ticket tab
            startTicketTabAutoRefresh();
        });
    }

    if (settingsTab) {
        settingsTab.addEventListener('click', function () {
            stopTicketTabAutoRefresh();
            activateTab(settingsTab, settingsContent);
            updateDepartmentsList();
            updateStatusesList();
            loadUsers();
        });
    }

    if (reportsTab) {
        reportsTab.addEventListener('click', function () {
            stopTicketTabAutoRefresh();
            activateTab(reportsTab, reportsContent);
            populateYearDropdown();
            populateReportDepartmentFilter();
        });
    }

    if (onCallTab) {
        onCallTab.addEventListener('click', function () {
            stopTicketTabAutoRefresh();
            activateTab(onCallTab, onCallContent);
            updateOnCallTab();
        });
    }

    if (editOnCallBtn) {
        editOnCallBtn.addEventListener('click', openOnCallEditModal);
    }

    if (closeOnCallEditModal) {
        closeOnCallEditModal.addEventListener('click', () => {
            if (onCallEditModal) onCallEditModal.classList.remove('active');
        });
    }

    if (cancelOnCallEdit) {
        cancelOnCallEdit.addEventListener('click', () => {
            if (onCallEditModal) onCallEditModal.classList.remove('active');
        });
    }

    if (saveOnCallOrder) {
        saveOnCallOrder.addEventListener('click', async () => {
            const listContainer = document.getElementById('onCallEditList');
            if (!listContainer) return;

            const newStaffList = [];
            const staffElements = listContainer.querySelectorAll('[draggable="true"]');

            // Get original data to preserve whatsapp numbers if they are not editable
            const originalStaffMap = new Map(onCallStaff.map((staff, index) => [index.toString(), staff]));

            staffElements.forEach(el => {
                const originalIndex = el.dataset.index;
                const newStaffData = {
                    name: el.querySelector('.edit-on-call-name').value,
                    position: el.querySelector('.edit-on-call-position').value,
                    picture: el.querySelector('.edit-on-call-picture-data').value,
                    whatsapp: originalStaffMap.get(originalIndex)?.whatsapp || '' // Keep original whatsapp
                };
                newStaffList.push(newStaffData);
            });
            
            onCallStaff = newStaffList; // Save the exact order arranged by user
            rotationStartWeek = getWeekNumber(new Date()); // Set the start week to now

            try {
                const result = await window.electronAPI.updateOnCallSchedule(onCallStaff, rotationStartWeek);
                if (result.success) {
                    updateOnCallTab();
                    if (onCallEditModal) onCallEditModal.classList.remove('active');
                    showSuccessMessage('On-call schedule updated successfully!');
                } else {
                    showErrorMessage('Failed to save schedule: ' + result.error);
                }
            } catch (error) {
                showErrorMessage('Error saving schedule: ' + error.message);
            }
        });
    }
}

// ============================================
// TICKET MANAGEMENT EVENT HANDLERS
// ============================================

/**
 * Check if current time is between 5:00 PM and 8:00 AM and update submit button
 */
function updateSubmitButtonForTime() {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (submitTicketBtn && submitBtnText) {
        // After 5 PM (17:00) or before 8 AM (08:00) - send to WhatsApp
        if (currentHour >= 17 || currentHour < 8) {
            submitTicketBtn.classList.remove('primary-button');
            submitTicketBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            submitBtnText.textContent = 'Submit to On Call';
            submitTicketBtn.dataset.isOnCall = 'true';
            console.log('✅ ON-CALL MODE ENABLED (Hour:', currentHour + ')');
        } else {
            // Between 8 AM and 5 PM - normal submission
            submitTicketBtn.classList.add('primary-button');
            submitTicketBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            submitBtnText.textContent = 'Submit Ticket';
            submitTicketBtn.dataset.isOnCall = 'false';
        }
    }
}

/**
 * Initialize ticket management event listeners
 */
function initializeTicketHandlers() {
    if (ticketForm) {
        ticketForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const ticketNumber = 'IT-' + Math.floor(100000 + Math.random() * 900000);
            const now = new Date();

            // Get system info with better error handling
            let systemInfo = { pcName: 'Unknown', ipAddress: 'Unknown' };
            try {
                console.log('Requesting system info...');
                const systemResult = await window.electronAPI.getSystemInfo();
                console.log('System info result:', systemResult);

                if (systemResult.success) {
                    systemInfo = systemResult.data;
                    console.log('System info captured:', systemInfo);
                } else {
                    console.error('Failed to get system info:', systemResult.error);
                }
            } catch (error) {
                console.error('Error getting system info:', error);
            }

            const formData = {
                id: ticketNumber,
                name: document.getElementById('name').value,
                department: document.getElementById('department').value,
                priority: document.getElementById('priority').value,
                issueType: document.getElementById('issueType').value,
                subject: document.getElementById('subject').value,
                description: document.getElementById('description').value,
                restarted: document.querySelector('input[name="restarted"]:checked')?.value || 'Not specified',
                urgent: document.getElementById('urgent').checked,
                status: 'Open',
                date: now.toISOString(),
                submittedBy: currentUser.username,
                userRole: currentUser.role,
                pcName: systemInfo.pcName,
                ipAddress: systemInfo.ipAddress,
                isOnCall: submitTicketBtn.dataset.isOnCall === 'true'
            };

            console.log('=== FORM SUBMISSION DEBUG ===');
            console.log('Submit Button isOnCall Dataset:', submitTicketBtn.dataset.isOnCall);
            console.log('Form Data isOnCall:', formData.isOnCall);
            console.log('Form Data isOnCall Type:', typeof formData.isOnCall);
            console.log('================================');

            console.log('Submitting ticket with system info:', {
                pcName: formData.pcName,
                ipAddress: formData.ipAddress
            });

            setSubmitLoading(true);

            try {
                const result = await window.electronAPI.submitTicket(formData);

                if (result.success) {
                    if (currentTicketImage) {
                        const imageResult = await window.electronAPI.saveTicketImage(currentTicketImage, ticketNumber);
                        if (!imageResult.success) {
                            console.error('Failed to save image:', imageResult.error);
                        }
                    }

                    showSuccessMessage(`Ticket #${ticketNumber} submitted successfully by ${currentUser.fullName}!`);
                    if (ticketForm) ticketForm.reset();
                    currentTicketImage = null;
                    if (imageFileName) imageFileName.textContent = 'No image selected';
                    if (imagePreview) imagePreview.classList.add('hidden');
                    if (clearImageBtn) clearImageBtn.classList.add('hidden');
                    
                    // Re-check time and update button after submission
                    updateSubmitButtonForTime();

                    if (currentUser && currentUser.fullName && nameInput) {
                        nameInput.value = currentUser.fullName;
                        nameInput.readOnly = true;
                        nameInput.classList.add('bg-gray-100');
                    }

                    if (currentUser && currentUser.role === 'Staff' && departmentSelect) {
                        setTimeout(() => {
                            departmentSelect.value = currentUser.department;
                            departmentSelect.disabled = true;
                        }, 10);
                    }
                    
                    // Switch to tickets tab and reload the list
                    if (myTicketsTab) {
                        myTicketsTab.click();
                        // Force reload tickets after a short delay to ensure the new ticket appears
                        setTimeout(() => {
                            loadTickets(true);
                        }, 100);
                    }
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                showErrorMessage('Database error: ' + error.message);
            } finally {
                setSubmitLoading(false);
            }
        });
    }

    if (clearFormButton) {
        clearFormButton.addEventListener('click', function () {
            const currentDept = currentUser && currentUser.role === 'Staff' ? currentUser.department : null;
            if (ticketForm) ticketForm.reset();

            if (currentUser && currentUser.fullName && nameInput) {
                nameInput.value = currentUser.fullName;
                nameInput.readOnly = true;
                nameInput.classList.add('bg-gray-100');
            }

            currentTicketImage = null;
            if (imageFileName) imageFileName.textContent = 'No image selected';
            if (imagePreview) imagePreview.classList.add('hidden');
            if (clearImageBtn) clearImageBtn.classList.add('hidden');
            if (previewImage) previewImage.src = '';

            // Re-check time and update button
            updateSubmitButtonForTime();

            if (currentDept && departmentSelect) {
                setTimeout(() => {
                    departmentSelect.value = currentDept;
                    departmentSelect.disabled = true;
                }, 10);
            }
        });
    }

    // Filter event handlers
    if (ticketFilter) {
        ticketFilter.addEventListener('change', function () {
            console.log('Ticket filter changed to:', this.value);
            loadTickets(true); // Pass true to reset notifications
        });
    }

    if (departmentFilter) {
        departmentFilter.addEventListener('change', function () {
            console.log('Department filter changed to:', this.value);
            loadTickets(true); // Pass true to reset notifications
        });
    }

    // Search input handler
    if (ticketSearchInput) {
        ticketSearchInput.addEventListener('input', function () {
            filterTicketsDisplay(this.value.toLowerCase());
        });
    }

    // Initialize button state based on current time
    updateSubmitButtonForTime();
    
    // Update button every second to check if time has passed 5 PM
    setInterval(updateSubmitButtonForTime, 1000);
}

// ============================================
// MODAL EVENT HANDLERS
// ============================================

/**
 * Initialize modal event listeners
 */
function initializeModalHandlers() {
    if (closeModal) {
        closeModal.addEventListener('click', function () {
            if (ticketModal) ticketModal.classList.remove('active');
        });
    }

    if (updateTicketBtn) {
        updateTicketBtn.addEventListener('click', async function () {
            if (currentTicket && modalStatus) {
                const newStatus = modalStatus.value;
                try {
                    // If resolving the ticket, include current user as resolver
                    const resolvedBy = (newStatus === 'Resolved' || newStatus === 'Closed') ? currentUser.username : null;

                    const result = await window.electronAPI.updateTicket(
                        currentTicket.TicketID || currentTicket.id,
                        newStatus,
                        resolvedBy
                    );

                    if (result.success) {
                        const ticketIndex = tickets.findIndex(t => (t.TicketID || t.id) === (currentTicket.TicketID || currentTicket.id));
                        if (ticketIndex !== -1) {
                            tickets[ticketIndex].Status = newStatus;
                            // Reload timeline to show resolution info
                            await loadTicketTimeline(currentTicket.TicketID || currentTicket.id);
                        }
                        updateTicketModal(tickets[ticketIndex]);
                        renderGroupedTickets();
                        showSuccessMessage(`Ticket ${currentTicket.TicketID || currentTicket.id} updated successfully!`);
                    } else {
                        throw new Error(result.error);
                    }
                } catch (error) {
                    showErrorMessage('Failed to update ticket: ' + error.message);
                }
            }
        });
    }

    if (deleteTicketBtn) {
        deleteTicketBtn.addEventListener('click', function () {
            if (currentTicket && deleteConfirmModal) {
                deleteConfirmModal.classList.add('active');
            }
        });
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function () {
            if (deleteConfirmModal) deleteConfirmModal.classList.remove('active');
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async function () {
            if (currentTicket) {
                try {
                    const result = await window.electronAPI.deleteTicket(currentTicket.TicketID || currentTicket.id);
                    if (result.success) {
                        tickets = tickets.filter(t => (t.TicketID || t.id) !== (currentTicket.TicketID || currentTicket.id));
                        if (deleteConfirmModal) deleteConfirmModal.classList.remove('active');
                        if (ticketModal) ticketModal.classList.remove('active');
                        showSuccessMessage(`Ticket ${currentTicket.TicketID || currentTicket.id} deleted successfully!`);
                        renderGroupedTickets();
                    } else {
                        throw new Error(result.error);
                    }
                } catch (error) {
                    showErrorMessage('Failed to delete ticket: ' + error.message);
                }
            }
        });
    }
}

// ============================================
// SETTINGS EVENT HANDLERS
// ============================================

/**
 * Initialize settings event listeners
 */
function initializeSettingsHandlers() {
    // Department management
    if (addDepartmentBtn && newDepartment) {
        addDepartmentBtn.addEventListener('click', async function () {
            const department = newDepartment.value.trim();

            if (!department) {
                showUserMessage('Please enter a department name', 'error');
                return;
            }

            if (departments.includes(department)) {
                showUserMessage('Department already exists', 'error');
                return;
            }

            const result = await window.electronAPI.addDepartment(department);

            if (result.success) {
                showUserMessage(`Department "${department}" added successfully!`, 'success');
                if (newDepartment) newDepartment.value = '';
                
                // Reload departments from the database to update all dropdowns
                await loadDepartments();
            } else {
                showUserMessage(result.error, 'error');
            }
        });

        newDepartment.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                addDepartmentBtn.click();
            }
        });
    }

    // Status management
    if (addStatusBtn && newStatus) {
        addStatusBtn.addEventListener('click', function () {
            const status = newStatus.value.trim();
            if (status && !statuses.includes(status)) {
                statuses.push(status);
                localStorage.setItem('statuses', JSON.stringify(statuses));
                updateStatusesList();
                newStatus.value = '';
                showSuccessMessage(`Status "${status}" added successfully!`);
            }
        });
    }

    // Theme management
    let tempTheme = { ...currentTheme };
    const root = document.documentElement;

    // Function to update swatch selections based on current theme
    function updateSwatchSelections(theme) {
        // Get all swatch containers
        const primarySwatches = document.querySelector('.color-swatch').parentElement.querySelectorAll('.color-swatch');
        const secondarySwatches = document.querySelectorAll('.color-swatch')[primarySwatches.length].parentElement.querySelectorAll('.color-swatch');
        const successSwatches = document.querySelectorAll('.color-swatch')[primarySwatches.length + secondarySwatches.length].parentElement.querySelectorAll('.color-swatch');
        
        // Remove all selections first
        [primarySwatches, secondarySwatches, successSwatches].forEach(swatches => {
            swatches.forEach(swatch => swatch.classList.remove('selected'));
        });

        // Update primary color selection
        primarySwatches.forEach(swatch => {
            if (swatch.dataset.color === theme.primaryColor) {
                swatch.classList.add('selected');
            }
        });

        // Update secondary color selection
        secondarySwatches.forEach(swatch => {
            if (swatch.dataset.color === theme.secondaryColor) {
                swatch.classList.add('selected');
            }
        });

        // Update success color selection
        successSwatches.forEach(swatch => {
            if (swatch.dataset.color === theme.successColor) {
                swatch.classList.add('selected');
            }
        });
    }

    // Initial update of swatch selections
    updateSwatchSelections(currentTheme);

    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', function () {
            const container = this.closest('.mb-3');
            const type = container.querySelector('label').textContent.toLowerCase().split(' ')[0];
            const color = this.dataset.color;
            const hoverColor = this.dataset.hover || color;

            // Remove selection from all swatches in the same container only
            container.querySelectorAll('.color-swatch').forEach(s => {
                s.classList.remove('selected');
            });
            
            // Add selection to clicked swatch
            this.classList.add('selected');

            // Update the temporary theme
            if (type === 'primary') {
                tempTheme.primaryColor = color;
                tempTheme.primaryHover = hoverColor;
            } else if (type === 'secondary') {
                tempTheme.secondaryColor = color;
            } else if (type === 'success') {
                tempTheme.successColor = color;
            }

            // Apply the theme immediately for preview
            root.style.setProperty('--primary-color', tempTheme.primaryColor);
            root.style.setProperty('--primary-hover', tempTheme.primaryHover);
            root.style.setProperty('--secondary-color', tempTheme.secondaryColor);
            root.style.setProperty('--success-color', tempTheme.successColor);
        });
    });

    // Add save button handler
    const saveThemeBtn = document.getElementById('saveThemeBtn');
    const themeSuccessMessage = document.getElementById('themeSuccessMessage');

    // Debug helper
    function logThemeState() {
        console.log('Current Theme:', currentTheme);
        console.log('Temp Theme:', tempTheme);
        document.querySelectorAll('.color-swatch.selected').forEach(swatch => {
            console.log('Selected swatch:', {
                color: swatch.dataset.color,
                type: swatch.parentElement.previousElementSibling.textContent
            });
        });
    }

    if (saveThemeBtn) {
        saveThemeBtn.addEventListener('click', function() {
            // Log theme state before saving
            console.log('Before save:');
            logThemeState();
            
            // Save the temporary theme as current theme
            currentTheme = { ...tempTheme };
            localStorage.setItem('helpDeskTheme', JSON.stringify(currentTheme));
            
            // Update swatch selections to reflect saved theme
            updateSwatchSelections(currentTheme);
            
            // Show success message
            if (themeSuccessMessage) {
                themeSuccessMessage.classList.remove('hidden');
                setTimeout(() => {
                    themeSuccessMessage.classList.add('hidden');
                }, 3000);
            }
        });
    }

    if (resetThemeBtn) {
        resetThemeBtn.addEventListener('click', async function () {
            // Define default theme values
            const defaultThemeValues = {
                primaryColor: '#4f46e5',
                primaryHover: '#4338ca',
                secondaryColor: '#7c3aed',
                successColor: '#10b981',
                themeMode: 'light'
            };
            
            // Reset both temporary and current theme to default
            tempTheme = { ...defaultThemeValues };
            currentTheme = { ...defaultThemeValues };
            
            // Apply reset immediately
            root.style.setProperty('--primary-color', defaultThemeValues.primaryColor);
            root.style.setProperty('--primary-hover', defaultThemeValues.primaryHover);
            root.style.setProperty('--secondary-color', defaultThemeValues.secondaryColor);
            root.style.setProperty('--success-color', defaultThemeValues.successColor);
            
            // Reset theme mode
            const lightMode = 'light';
            currentTheme.themeMode = lightMode;
            tempTheme.themeMode = lightMode;
            localStorage.setItem('themeMode', lightMode);
            document.documentElement.removeAttribute('data-theme');
            const themeModeSelect = document.getElementById('themeMode');
            if (themeModeSelect) {
                themeModeSelect.value = lightMode;
            }
            
            // Update swatches
            document.querySelectorAll('.color-swatch').forEach(swatch => {
                const type = swatch.parentElement.previousElementSibling.textContent.toLowerCase().split(' ')[0];
                swatch.classList.remove('selected');
                if ((type === 'primary' && swatch.dataset.color === defaultThemeValues.primaryColor) ||
                    (type === 'secondary' && swatch.dataset.color === defaultThemeValues.secondaryColor) ||
                    (type === 'success' && swatch.dataset.color === defaultThemeValues.successColor)) {
                    swatch.classList.add('selected');
                }
            });

            // Save default theme to localStorage only
            localStorage.setItem('helpDeskTheme', JSON.stringify(defaultThemeValues));
            
            // Ensure all swatches are updated
            const primarySwatch = document.querySelector(`.color-swatch[data-color="${defaultThemeValues.primaryColor}"]`);
            if (primarySwatch) primarySwatch.classList.add('selected');
                
            const secondarySwatch = document.querySelector(`.color-swatch[data-color="${defaultThemeValues.secondaryColor}"]`);
            if (secondarySwatch) secondarySwatch.classList.add('selected');
            
            const successSwatch = document.querySelector(`.color-swatch[data-color="${defaultThemeValues.successColor}"]`);
            if (successSwatch) successSwatch.classList.add('selected');
            
            // Show success message
            if (themeSuccessMessage) {
                themeSuccessMessage.textContent = 'Theme reset to default!';
                themeSuccessMessage.classList.remove('hidden');
                setTimeout(() => {
                    themeSuccessMessage.classList.add('hidden');
                }, 3000);
            }
            
            // Apply default theme
            const root = document.documentElement;
            root.style.setProperty('--primary-color', defaultTheme.primaryColor);
            root.style.setProperty('--primary-hover', defaultTheme.primaryHover);
            root.style.setProperty('--secondary-color', defaultTheme.secondaryColor);
            root.style.setProperty('--success-color', defaultTheme.successColor);
            
            showSuccessMessage('Theme reset to default!');
        });
    }

    // Theme mode management
    const themeModeSelect = document.getElementById('themeMode');
    if (themeModeSelect) {
        // Set initial theme mode from localStorage
        const savedThemeMode = localStorage.getItem('themeMode') || 'light';
        themeModeSelect.value = savedThemeMode;
        if (savedThemeMode !== 'light') {
            document.documentElement.setAttribute('data-theme', savedThemeMode);
        }

        themeModeSelect.addEventListener('change', function() {
            const selectedTheme = this.value;
            if (selectedTheme === 'light') {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', selectedTheme);
            }
            localStorage.setItem('themeMode', selectedTheme);
            showSuccessMessage(`Theme mode changed to ${selectedTheme}!`);
        });
    }

    // Theme Customization Modal (Staff Only)
    if (themeCustomizeBtn && closeThemeModal && themeCustomizationModal) {
        console.log('Theme customization modal elements found');
        
        // Setup swatch listeners function
        function setupThemeSwatchListeners() {
            // Get fresh references to swatches each time
            const primarySwatches = document.querySelectorAll('#primaryColorSwatches .color-swatch');
            const secondarySwatches = document.querySelectorAll('#secondaryColorSwatches .color-swatch');
            const successSwatches = document.querySelectorAll('#successColorSwatches .color-swatch');
            
            console.log('Setting up listeners - Primary:', primarySwatches.length, 'Secondary:', secondarySwatches.length, 'Success:', successSwatches.length);

            // Handle color swatch clicks in modal - Primary Color
            primarySwatches.forEach(swatch => {
                swatch.addEventListener('click', function() {
                    const color = this.dataset.color;
                    const hoverColor = this.dataset.hover || color;

                    // Remove selection from all swatches in primary
                    primarySwatches.forEach(s => {
                        s.classList.remove('selected');
                    });
                    
                    // Add selection to clicked swatch
                    this.classList.add('selected');

                    // Update the temporary theme
                    tempTheme.primaryColor = color;
                    tempTheme.primaryHover = hoverColor;

                    // Apply the theme immediately for preview
                    const root = document.documentElement;
                    root.style.setProperty('--primary-color', tempTheme.primaryColor);
                    root.style.setProperty('--primary-hover', tempTheme.primaryHover);
                    root.style.setProperty('--secondary-color', tempTheme.secondaryColor);
                    root.style.setProperty('--success-color', tempTheme.successColor);
                    
                    console.log('Primary color changed to:', color);
                });
            });

            // Handle color swatch clicks in modal - Secondary Color
            secondarySwatches.forEach(swatch => {
                swatch.addEventListener('click', function() {
                    const color = this.dataset.color;

                    // Remove selection from all swatches in secondary
                    secondarySwatches.forEach(s => {
                        s.classList.remove('selected');
                    });
                    
                    // Add selection to clicked swatch
                    this.classList.add('selected');

                    // Update the temporary theme
                    tempTheme.secondaryColor = color;

                    // Apply the theme immediately for preview
                    const root = document.documentElement;
                    root.style.setProperty('--primary-color', tempTheme.primaryColor);
                    root.style.setProperty('--primary-hover', tempTheme.primaryHover);
                    root.style.setProperty('--secondary-color', tempTheme.secondaryColor);
                    root.style.setProperty('--success-color', tempTheme.successColor);
                    
                    console.log('Secondary color changed to:', color);
                });
            });

            // Handle color swatch clicks in modal - Success Color
            successSwatches.forEach(swatch => {
                swatch.addEventListener('click', function() {
                    const color = this.dataset.color;

                    // Remove selection from all swatches in success
                    successSwatches.forEach(s => {
                        s.classList.remove('selected');
                    });
                    
                    // Add selection to clicked swatch
                    this.classList.add('selected');

                    // Update the temporary theme
                    tempTheme.successColor = color;

                    // Apply the theme immediately for preview
                    const root = document.documentElement;
                    root.style.setProperty('--primary-color', tempTheme.primaryColor);
                    root.style.setProperty('--primary-hover', tempTheme.primaryHover);
                    root.style.setProperty('--secondary-color', tempTheme.secondaryColor);
                    root.style.setProperty('--success-color', tempTheme.successColor);
                    
                    console.log('Success color changed to:', color);
                });
            });
        }
        
        // Open modal
        themeCustomizeBtn.addEventListener('click', function() {
            console.log('Theme button clicked');
            themeCustomizationModal.classList.remove('hidden');
            // Initialize current theme selections in modal
            initializeModalThemeSelections();
            // Setup event listeners when modal opens
            setupThemeSwatchListeners();
        });

        // Close modal
        closeThemeModal.addEventListener('click', function() {
            console.log('Close button clicked');
            themeCustomizationModal.classList.add('hidden');
        });

        // Close on background click
        themeCustomizationModal.addEventListener('click', function(e) {
            if (e.target === themeCustomizationModal) {
                console.log('Clicked outside modal, closing');
                themeCustomizationModal.classList.add('hidden');
            }
        });

        // Save theme from modal
        if (saveThemeModalBtn) {
            saveThemeModalBtn.addEventListener('click', async function() {
                // Save the temporary theme as current theme
                currentTheme = { ...tempTheme };
                localStorage.setItem('helpDeskTheme', JSON.stringify(currentTheme));

                // Apply theme immediately
                applyTheme();
                showSuccessMessage('Theme saved successfully!');
                themeCustomizationModal.classList.add('hidden');
            });
        }

        // Reset theme from modal
        if (resetThemeModalBtn) {
            resetThemeModalBtn.addEventListener('click', async function() {
                const defaultThemeValues = {
                    primaryColor: '#4f46e5',
                    primaryHover: '#4338ca',
                    secondaryColor: '#7c3aed',
                    successColor: '#10b981',
                    themeMode: 'light'
                };

                // Save default theme to localStorage only
                localStorage.setItem('helpDeskTheme', JSON.stringify(defaultThemeValues));

                // Update current and temp theme
                currentTheme = { ...defaultThemeValues };
                tempTheme = { ...defaultThemeValues };

                // Reinitialize selections
                initializeModalThemeSelections();

                // Apply default theme
                const root = document.documentElement;
                root.style.setProperty('--primary-color', defaultThemeValues.primaryColor);
                root.style.setProperty('--primary-hover', defaultThemeValues.primaryHover);
                root.style.setProperty('--secondary-color', defaultThemeValues.secondaryColor);
                root.style.setProperty('--success-color', defaultThemeValues.successColor);

                showSuccessMessage('Theme reset to default!');
                themeCustomizationModal.classList.add('hidden');
            });
        }
    }

    // Helper function to initialize theme selections in modal
    function initializeModalThemeSelections() {
        // Get current theme from localStorage or use default
        const savedTheme = localStorage.getItem('helpDeskTheme');
        const theme = savedTheme ? JSON.parse(savedTheme) : currentTheme;

        // Update primary color selection
        document.querySelectorAll('#primaryColorSwatches .color-swatch').forEach(swatch => {
            swatch.classList.remove('selected');
            if (swatch.dataset.color === theme.primaryColor) {
                swatch.classList.add('selected');
            }
        });

        // Update secondary color selection
        document.querySelectorAll('#secondaryColorSwatches .color-swatch').forEach(swatch => {
            swatch.classList.remove('selected');
            if (swatch.dataset.color === theme.secondaryColor) {
                swatch.classList.add('selected');
            }
        });

        // Update success color selection
        document.querySelectorAll('#successColorSwatches .color-swatch').forEach(swatch => {
            swatch.classList.remove('selected');
            if (swatch.dataset.color === theme.successColor) {
                swatch.classList.add('selected');
            }
        });

        // Reset tempTheme to current
        tempTheme = { ...theme };
    }

    // User management
    if (addUserBtn) {
        addUserBtn.addEventListener('click', async function () {
            const username = newUsername ? newUsername.value.trim() : '';
            const password = newPassword ? newPassword.value.trim() : '';
            const fullName = newFullName ? newFullName.value.trim() : '';
            const department = newUserDepartment ? newUserDepartment.value : '';
            const role = newUserRole ? newUserRole.value : 'Staff';

            if (!username || !password || !fullName || !department) {
                showUserMessage('Please fill all required fields', 'error');
                return;
            }

            if (password.length < 6) {
                showUserMessage('Password must be at least 6 characters', 'error');
                return;
            }

            if (username.length < 3) {
                showUserMessage('Username must be at least 3 characters', 'error');
                return;
            }

            setAddUserLoading(true);

            try {
                const userData = {
                    username: username,
                    password: password,
                    fullName: fullName,
                    department: department,
                    role: role
                };

                const result = await window.electronAPI.addUser(userData);

                if (result.success) {
                    showUserMessage(result.message, 'success');
                    if (newUsername) newUsername.value = '';
                    if (newPassword) newPassword.value = '';
                    if (newFullName) newFullName.value = '';
                    if (newUserDepartment) newUserDepartment.value = '';
                    if (newUserRole) newUserRole.value = 'Staff';
                    loadUsers();
                } else {
                    showUserMessage(result.error, 'error');
                }
            } catch (error) {
                showUserMessage('Failed to add user: ' + error.message, 'error');
            } finally {
                setAddUserLoading(false);
            }
        });
    }

    // User search filter
    if (usersSearchInput) {
        usersSearchInput.addEventListener('input', function () {
            filterUsersDisplay(this.value.toLowerCase());
        });
    }
}

// ============================================
// REPORTS EVENT HANDLERS
// ============================================

/**
 * Initialize reports event listeners
 */
function initializeReportsHandlers() {
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', async function () {
            await generateReport();
        });
    }

    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', async function () {
            await exportReportToPDF();
        });
    }

    if (reportType) {
        reportType.addEventListener('change', function () {
            updateReportDepartmentFilterVisibility();
        });
    }
}

// ============================================
// NOTIFICATION EVENT HANDLERS
// ============================================

/**
 * Initialize notification event listeners
 */
function initializeNotificationHandlers() {
    if (notificationToggle) {
        notificationToggle.addEventListener('change', function () {
            notificationsEnabled = this.checked;
            saveNotificationSettings();

            if (notificationsEnabled && Notification.permission === 'default') {
                requestNotificationPermission();
            }
        });
    }

    if (taskbarFlashToggle) {
        taskbarFlashToggle.addEventListener('change', function () {
            taskbarFlashEnabled = this.checked;
            saveNotificationSettings();
        });
    }

    if (testNotificationBtn) {
        testNotificationBtn.addEventListener('click', testNotification);
    }
    
    // Auto startup toggle handler
    const autoStartupToggle = document.getElementById('autoStartupToggle');
    if (autoStartupToggle) {
        autoStartupToggle.addEventListener('change', async function () {
            try {
                const result = await window.electronAPI.setAutoStartupStatus(this.checked);
                if (result.success) {
                    showSuccessMessage(`Auto startup ${this.checked ? 'enabled' : 'disabled'} successfully!`);
                } else {
                    // Revert toggle if failed
                    this.checked = !this.checked;
                    showErrorMessage('Failed to update auto startup setting');
                }
            } catch (error) {
                // Revert toggle if error
                this.checked = !this.checked;
                showErrorMessage('Error updating auto startup: ' + error.message);
            }
        });
    }

    // WhatsApp Settings Handlers
    const saveWhatsAppSettingsBtn = document.getElementById('saveWhatsAppSettingsBtn');
    const testWhatsAppBtn = document.getElementById('testWhatsAppBtn');
    const whatsappApiKey = document.getElementById('whatsappApiKey');
    const whatsappPhoneNumber = document.getElementById('whatsappPhoneNumber');
    const whatsappMessage = document.getElementById('whatsappMessage');

    // Load WhatsApp settings on page load
    async function loadWhatsAppSettings() {
        try {
            const settings = await window.electronAPI.getWhatsAppSettings();
            if (settings) {
                if (whatsappApiKey) whatsappApiKey.value = settings.apiKey || '';
                if (whatsappPhoneNumber) whatsappPhoneNumber.value = settings.phoneNumber || '';
            }
        } catch (error) {
            console.error('Error loading WhatsApp settings:', error);
        }
    }

    // Save WhatsApp Settings
    if (saveWhatsAppSettingsBtn) {
        saveWhatsAppSettingsBtn.addEventListener('click', async function () {
            const apiKey = whatsappApiKey?.value.trim();
            const phoneNumber = whatsappPhoneNumber?.value.trim();

            if (!apiKey || !phoneNumber) {
                showWhatsAppMessage('Please fill in all fields', 'error');
                return;
            }

            try {
                const success = await window.electronAPI.saveWhatsAppSettings({
                    apiKey,
                    phoneNumber
                });

                if (success) {
                    showWhatsAppMessage('WhatsApp settings saved successfully!', 'success');
                } else {
                    showWhatsAppMessage('Failed to save settings', 'error');
                }
            } catch (error) {
                console.error('Error saving WhatsApp settings:', error);
                showWhatsAppMessage('Error saving settings', 'error');
            }
        });
    }

    // Test WhatsApp Connection
    if (testWhatsAppBtn) {
        testWhatsAppBtn.addEventListener('click', async function () {
            const apiKey = whatsappApiKey?.value.trim();
            const phoneNumber = whatsappPhoneNumber?.value.trim();

            if (!apiKey || !phoneNumber) {
                showWhatsAppMessage('Please fill in all fields first', 'error');
                return;
            }

            showWhatsAppMessage('Sending test message...', 'info');
            
            try {
                const result = await window.electronAPI.testWhatsAppConnection(apiKey, phoneNumber);
                
                if (result.success) {
                    showWhatsAppMessage(result.message, 'success');
                } else {
                    showWhatsAppMessage(result.error, 'error');
                }
            } catch (error) {
                showWhatsAppMessage(`Error: ${error.message}`, 'error');
            }
        });
    }

    function showWhatsAppMessage(message, type) {
        if (!whatsappMessage) return;
        
        whatsappMessage.textContent = message;
        whatsappMessage.className = 'text-xs text-center mt-2';
        
        if (type === 'success') {
            whatsappMessage.classList.add('text-green-600', 'font-medium');
        } else if (type === 'error') {
            whatsappMessage.classList.add('text-red-600', 'font-medium');
        } else {
            whatsappMessage.classList.add('text-blue-600');
        }
        
        whatsappMessage.classList.remove('hidden');
        
        setTimeout(() => {
            whatsappMessage.classList.add('hidden');
        }, 5000);
    }

    // Load WhatsApp settings when page loads
    loadWhatsAppSettings();

    // Clear App Data handler
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', async function () {
            const confirm = window.confirm('This will clear all app data and restart the application. Continue?');
            if (confirm) {
                try {
                    await window.electronAPI.clearAppData();
                } catch (error) {
                    console.error('Error clearing app data:', error);
                }
            }
        });
    }

    // Listen for focus events from main process
    if (window.electronAPI) {
        window.electronAPI.onFocusNewTicket(() => {
            if (newTicketTab && newTicketContent) {
                activateTab(newTicketTab, newTicketContent);
            }
        });

        window.electronAPI.onFocusTicketsTab(() => {
            if (myTicketsTab && myTicketsContent) {
                activateTab(myTicketsTab, myTicketsContent);
                // Clear notifications when focusing tickets tab
                unreadTicketCount = 0;
                updateTicketNotificationBadge();
            }
        });
    }
}

// ============================================
// KEYBOARD EVENT HANDLERS
// ============================================

/**
 * Initialize keyboard event listeners
 */
function initializeKeyboardHandlers() {
    document.addEventListener('keydown', function (e) {
        if (imageViewerModal && imageViewerModal.classList.contains('active')) {
            if (e.key === 'Escape') {
                imageViewerModal.classList.remove('active');
                if (fullSizeImage) fullSizeImage.classList.remove('zoomed');
            } else if (e.key === ' ' || e.key === 'Enter') {
                if (fullSizeImage) fullSizeImage.classList.toggle('zoomed');
            }
        }
    });
}

// ============================================
// STATUS MANAGEMENT
// ============================================

/**
 * Updates statuses list in settings
 */
function updateStatusesList() {
    if (!statusesList) return;

    statusesList.innerHTML = '';
    statuses.forEach(status => {
        const statusItem = document.createElement('div');
        statusItem.className = 'flex justify-between items-center bg-white p-2 rounded border border-gray-200';

        statusItem.innerHTML = `
            <div class="flex items-center">
                <span class="w-3 h-3 rounded-full mr-2 ${getStatusClass(status)}"></span>
                <span class="text-xs">${status}</span>
            </div>
            <button class="text-red-500 hover:text-red-700 delete-status" data-status="${status}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;

        const deleteBtn = statusItem.querySelector('.delete-status');
        deleteBtn.addEventListener('click', function () {
            const statusToDelete = this.dataset.status;
            statuses = statuses.filter(s => s !== statusToDelete);
            localStorage.setItem('statuses', JSON.stringify(statuses));
            updateStatusesList();
            showSuccessMessage(`Status "${statusToDelete}" deleted successfully!`);
        });

        statusesList.appendChild(statusItem);
    });
}

// ============================================
// MAIN INITIALIZATION
// ============================================

/**
 * Initialize all event listeners and handlers
 */
function initializeAllEventListeners() {
    // Theme is already initialized in the HTML head
    
    initializeWindowControls();
    initializeImageHandlers();
    initializeAuthHandlers();
    initializeTabHandlers();
    initializeTicketHandlers();
    initializeModalHandlers();
    initializeSettingsHandlers();
    initializeReportsHandlers();
    initializeNotificationHandlers();
    initializeKeyboardHandlers();

    // Initialize basic event listeners (connection, query execution)
    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    const runQueryBtn = document.getElementById('runQueryBtn');

    if (connectBtn) {
        connectBtn.addEventListener('click', handleConnect);
    }

    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', handleDisconnect);
    }

    if (runQueryBtn) {
        runQueryBtn.addEventListener('click', handleRunQuery);
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeAllEventListeners);
