// ============================================
// IT HELP DESK - FRONTEND APPLICATION
// ============================================

// ============================================
// GLOBAL VARIABLES
// ============================================

let currentUser = null;
let currentTicket = null;
let currentTicketImage = null;
let departments = [];
let statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
let tickets = [];
let reportTickets = [];
let reportUsersData = [];
let onCallStaff = [];
let rotationStartWeek = 1; // Default, will be loaded from DB



// Auto-refresh variables
let autoRefreshEnabled = true;
let autoRefreshInterval = 500; // Check for new tickets every 0.5 seconds
let isRefreshing = false;
let autoRefreshInitialized = false;
let fallbackRefreshInterval = null;
let lastRenderedTicketsHash = null; // Track last rendered tickets to prevent unnecessary re-renders

// Ticket tab auto-refresh variables
let ticketTabRefreshInterval = null;
let ticketTabRefreshRate = 1000; // Refresh every 1 seconds when tab is active
let isTicketTabActive = false;

// Notification variables
let unreadTicketCount = 0;
let lastKnownTicketCount = 0;
let notificationsEnabled = true;
let taskbarFlashEnabled = true;

// Use the defaultTheme from the HTML initialization
let currentTheme = null;

// Initialize the current theme from localStorage or default
async function initializeCurrentTheme() {
    try {
        // Load theme from localStorage only (per-PC settings)
        const savedTheme = localStorage.getItem('helpDeskTheme');
        
        // Use localStorage theme or default
        currentTheme = savedTheme ? JSON.parse(savedTheme) : { ...defaultTheme };
        
        // Save to localStorage if it was the default
        if (!savedTheme) {
            localStorage.setItem('helpDeskTheme', JSON.stringify(currentTheme));
        }
        
        // Apply theme CSS variables
        const root = document.documentElement;
        root.style.setProperty('--primary-color', currentTheme.primaryColor);
        root.style.setProperty('--primary-hover', currentTheme.primaryHover);
        root.style.setProperty('--secondary-color', currentTheme.secondaryColor);
        root.style.setProperty('--success-color', currentTheme.successColor);
        
        // Update swatches after DOM is loaded - more precise selection
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            const type = swatch.parentElement.previousElementSibling.textContent.toLowerCase().split(' ')[0];
            const color = swatch.dataset.color;
            swatch.classList.remove('selected');

            // Only select if both color and type match
            if ((type === 'primary' && color === currentTheme.primaryColor) ||
                (type === 'secondary' && color === currentTheme.secondaryColor) ||
                (type === 'success' && color === currentTheme.successColor)) {
                swatch.classList.add('selected');
            }
        });

        const themeModeSelect = document.getElementById('themeMode');
        if (themeModeSelect) {
            const savedThemeMode = localStorage.getItem('themeMode') || 'light';
            themeModeSelect.value = savedThemeMode;
            root.setAttribute('data-theme', savedThemeMode);
        }
    } catch (error) {
        console.error('Error initializing current theme:', error);
        currentTheme = { ...defaultTheme };
        // Apply default theme if there's an error
        const root = document.documentElement;
        root.style.setProperty('--primary-color', defaultTheme.primaryColor);
        root.style.setProperty('--primary-hover', defaultTheme.primaryHover);
        root.style.setProperty('--secondary-color', defaultTheme.secondaryColor);
        root.style.setProperty('--success-color', defaultTheme.successColor);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeCurrentTheme);

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [79, 70, 229]; // Default to indigo if parsing fails
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

/**
 * Updates the connection status display
 * @param {string} message - Status message to display
 * @param {string} color - Color for the status text (green/red/gray)
 */
function updateConnectionStatus(message, color) {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = color;
    }
}

/**
 * Displays query results in a table format
 * @param {Array} data - Array of query result objects
 */
function displayResults(data) {
    const resultsElement = document.getElementById('results');
    if (!resultsElement) return;

    // Handle empty results
    if (!data || data.length === 0) {
        resultsElement.innerHTML = '<p>No results found</p>';
        return;
    }

    // Build table structure
    let table = '<table class="w-full text-xs border-collapse border border-gray-300"><thead><tr class="bg-gray-50">';

    // Create table headers from first row keys
    Object.keys(data[0]).forEach(key => {
        table += `<th class="border border-gray-300 p-2 text-left">${key}</th>`;
    });
    table += '</tr></thead><tbody>';

    // Create table rows with data
    data.forEach(row => {
        table += '<tr class="hover:bg-gray-50">';
        Object.values(row).forEach(value => {
            table += `<td class="border border-gray-300 p-2">${value !== null ? value : ''}</td>`;
        });
        table += '</tr>';
    });

    table += '</tbody></table>';
    resultsElement.innerHTML = table;
}

/**
 * Displays error message in results area
 * @param {string} errorMessage - Error message to display
 */
function displayError(errorMessage) {
    const resultsElement = document.getElementById('results');
    if (resultsElement) {
        resultsElement.innerHTML = `<div class="text-red-500 p-2 bg-red-50 border border-red-200 rounded">Error: ${errorMessage}</div>`;
    }
}


// ============================================
// DATABASE CONNECTION HANDLERS
// ============================================

/**
 * Handles database connection request
 */
async function handleConnect() {
    const result = await window.electronAPI.connectToDatabase();

    if (result.success) {
        updateConnectionStatus('Connected', 'green');
    } else {
        updateConnectionStatus('Error: ' + result.message, 'red');
    }
}

/**
 * Handles database disconnection request
 */
async function handleDisconnect() {
    const result = await window.electronAPI.disconnectDatabase();

    if (result.success) {
        updateConnectionStatus('Disconnected', 'gray');
    }
}


// ============================================
// QUERY EXECUTION HANDLERS
// ============================================

/**
 * Handles query execution request
 */
async function handleRunQuery() {
    const query = document.getElementById('queryInput').value;

    // Validate query input
    if (!query || query.trim() === '') {
        alert('Please enter a query');
        return;
    }

    // Execute query
    const result = await window.electronAPI.executeQuery(query);

    // Display results or error
    if (result.success) {
        displayResults(result.data);
    } else {
        displayError(result.error);
    }
}


// ============================================
// EVENT LISTENER INITIALIZATION
// ============================================

/**
 * Initialize all event listeners when DOM is ready
 */
function initializeEventListeners() {
    // Connection button
    document.getElementById('connectBtn')
        .addEventListener('click', handleConnect);

    // Disconnection button
    document.getElementById('disconnectBtn')
        .addEventListener('click', handleDisconnect);

    // Query execution button
    document.getElementById('runQueryBtn')
        .addEventListener('click', handleRunQuery);
}

// ============================================
// THEME MANAGEMENT
// ============================================

/**
 * Applies the current theme to the application
 */
function applyTheme() {
    // If no theme is set, load from localStorage or use default
    if (!currentTheme) {
        const savedTheme = localStorage.getItem('helpDeskTheme');
        currentTheme = savedTheme ? JSON.parse(savedTheme) : { ...defaultTheme };
    }
    
    // Apply colors to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary-color', currentTheme.primaryColor || defaultTheme.primaryColor);
    root.style.setProperty('--primary-hover', currentTheme.primaryHover || defaultTheme.primaryHover);
    root.style.setProperty('--secondary-color', currentTheme.secondaryColor || defaultTheme.secondaryColor);
    root.style.setProperty('--success-color', currentTheme.successColor || defaultTheme.successColor);
    
    // Save theme to localStorage
    localStorage.setItem('helpDeskTheme', JSON.stringify(currentTheme));
    
    // Update swatches if they exist
    selectCurrentThemeSwatches();
}

/**
 * Selects current theme swatches in the UI
 */
function selectCurrentThemeSwatches() {
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.classList.remove('selected');
    });

    const primarySwatch = document.querySelector(`.color-swatch[data-color="${currentTheme.primaryColor}"]`);
    if (primarySwatch) primarySwatch.classList.add('selected');

    const secondarySwatch = document.querySelector(`.color-swatch[data-color="${currentTheme.secondaryColor}"]`);
    if (secondarySwatch) secondarySwatch.classList.add('selected');

    const successSwatch = document.querySelector(`.color-swatch[data-color="${currentTheme.successColor}"]`);
    if (successSwatch) successSwatch.classList.add('selected');
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

/**
 * Loads notification settings from localStorage
 */
function loadNotificationSettings() {
    const savedNotificationSettings = localStorage.getItem('notificationSettings');
    if (savedNotificationSettings) {
        const settings = JSON.parse(savedNotificationSettings);
        notificationsEnabled = settings.notificationsEnabled !== false;
        taskbarFlashEnabled = settings.taskbarFlashEnabled !== false;

        const notificationToggle = document.getElementById('notificationToggle');
        const taskbarFlashToggle = document.getElementById('taskbarFlashToggle');

        if (notificationToggle) {
            notificationToggle.checked = notificationsEnabled;
        }
        if (taskbarFlashToggle) {
            taskbarFlashToggle.checked = taskbarFlashEnabled;
        }
    }
}

/**
 * Saves notification settings to localStorage
 */
function saveNotificationSettings() {
    const settings = {
        notificationsEnabled: notificationsEnabled,
        taskbarFlashEnabled: taskbarFlashEnabled
    };
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
}

/**
 * Requests notification permission from the user
 */
function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                } else {
                    console.log('Notification permission denied');
                    notificationsEnabled = false;
                    saveNotificationSettings();
                    const notificationToggle = document.getElementById('notificationToggle');
                    if (notificationToggle) {
                        notificationToggle.checked = false;
                    }
                }
            });
        } else if (Notification.permission === 'denied') {
            notificationsEnabled = false;
            saveNotificationSettings();
            const notificationToggle = document.getElementById('notificationToggle');
            if (notificationToggle) {
                notificationToggle.checked = false;
            }
        }
    }
}

/**
 * Shows a test notification
 */
function testNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('IT Help Desk Test', {
            body: 'This is a test notification from IT Help Desk',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234f46e5"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7H9V5.5L3 7V9L9 10.5V12L3 13.5V15.5L9 14V16L3 17.5V19.5L9 18V22H15V18L21 19.5V17.5L15 16V14L21 15.5V13.5L15 12V10.5L21 9Z"/></svg>',
            silent: false
        });

        setTimeout(() => {
            notification.close();
        }, 3000);
    } else {
        showErrorMessage('Notification permission not granted. Please enable notifications in your browser settings.');
    }
}

/**
 * Shows a temporary notification message
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
function showTemporaryNotification(message, duration = 2000) {
    let notification = document.getElementById('autoRefreshNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'autoRefreshNotification';
        notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg text-sm z-50 transition-all duration-300';
        notification.style.display = 'none';
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, duration);
}

/**
 * Updates the ticket notification badge
 */
function updateTicketNotificationBadge() {
    const badge = document.getElementById('ticketNotificationBadge');
    if (!badge) return;

    if (unreadTicketCount > 0) {
        badge.textContent = unreadTicketCount > 99 ? '99+' : unreadTicketCount.toString();
        badge.classList.remove('hidden');

        // Add pulse animation for new notifications
        badge.classList.add('animate-pulse');
        setTimeout(() => {
            badge.classList.remove('animate-pulse');
        }, 2000);

        // Update tab title if there are notifications
        document.title = `(${unreadTicketCount}) IT Help Desk`;
    } else {
        badge.classList.add('hidden');
        document.title = 'IT Help Desk';
    }
}

// ============================================
// AUTO-REFRESH SYSTEM
// ============================================

/**
 * Initializes the auto-refresh system
 */
function initializeAutoRefresh() {
    if (autoRefreshEnabled && currentUser && !autoRefreshInitialized) {
        startAutoRefresh();
        setupUpdateListener();
        autoRefreshInitialized = true;
        console.log('Auto-refresh initialized for user:', currentUser.username);
    }
}

/**
 * Starts the auto-refresh system
 */
async function startAutoRefresh() {
    try {
        const result = await window.electronAPI.startAutoRefresh(autoRefreshInterval);
        if (result.success) {
            console.log('Auto-refresh started:', result.message);
        } else {
            console.error('Failed to start auto-refresh:', result.error);
            startFallbackAutoRefresh();
        }
    } catch (error) {
        console.error('Error starting auto-refresh:', error);
        startFallbackAutoRefresh();
    }
}

/**
 * Starts fallback auto-refresh system
 */
function startFallbackAutoRefresh() {
    console.log('Starting fallback auto-refresh system');
    if (fallbackRefreshInterval) {
        clearInterval(fallbackRefreshInterval);
    }
    fallbackRefreshInterval = setInterval(async () => {
        if (!isRefreshing && currentUser) {
            await checkForUpdatesManually();
        }
    }, autoRefreshInterval);
}

/**
 * Manual update check
 */
async function checkForUpdatesManually() {
    try {
        const result = await window.electronAPI.checkForUpdates();
        if (result.success && result.hasUpdates) {
            console.log('Manual update check: changes detected');
            await handleTicketsUpdate();
        }
    } catch (error) {
        console.error('Error in manual update check:', error);
    }
}

/**
 * Sets up the update listener for tickets
 */
function setupUpdateListener() {
    if (window.electronAPI && window.electronAPI.onTicketsUpdated) {
        window.electronAPI.onTicketsUpdated(async () => {
            console.log('Received tickets-updated event from main process');
            await handleTicketsUpdate();
        });
    } else {
        console.warn('onTicketsUpdated API not available, using fallback');
    }
}

/**
 * Handles tickets update notifications
 */
async function handleTicketsUpdate() {
    console.log('Handling tickets update...');

    // Don't process updates if user is not logged in
    if (!currentUser) {
        console.log('handleTicketsUpdate skipped: user not logged in');
        return;
    }

    // Get current filter values
    const currentStatusFilter = document.getElementById('ticketFilter')?.value || 'all';
    const currentDeptFilter = document.getElementById('departmentFilter')?.value || 'all';

    // Store old ticket count for comparison
    const oldTicketCount = tickets.length;

    // Reload tickets with current filters
    await loadTickets();

    // Check for new tickets and show notifications
    if (notificationsEnabled && tickets.length > oldTicketCount && oldTicketCount > 0) {
        const newTicketsCount = tickets.length - oldTicketCount;

        // Show desktop notification
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('New IT Help Desk Ticket' + (newTicketsCount > 1 ? 's' : ''), {
                body: `${newTicketsCount} new ticket${newTicketsCount > 1 ? 's' : ''} submitted`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234f46e5"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7H9V5.5L3 7V9L9 10.5V12L3 13.5V15.5L9 14V16L3 17.5V19.5L9 18V22H15V18L21 19.5V17.5L15 16V14L21 15.5V13.5L15 12V10.5L21 9Z"/></svg>',
                silent: false
            });

            notification.onclick = () => {
                if (window.electronAPI && window.electronAPI.showWindow) {
                    window.electronAPI.showWindow();
                }
                const myTicketsTab = document.getElementById('myTicketsTab');
                const myTicketsContent = document.getElementById('myTicketsContent');
                if (myTicketsTab && myTicketsContent) {
                    activateTab(myTicketsTab, myTicketsContent);
                }
                notification.close();
            };

            setTimeout(() => {
                notification.close();
            }, 5000);
        }
    }

    // Show in-app notification if not on tickets tab
    const activeTab = document.querySelector('.tab-content.active');
    const isViewingTickets = activeTab && activeTab.id === 'myTicketsContent';
    if (!isViewingTickets && unreadTicketCount > 0) {
        showTemporaryNotification(`📢 ${unreadTicketCount} new ticket(s) available`, 3000);
    }
}

/**
 * Initializes the notification system
 */
function initializeNotificationSystem() {
    if (currentUser) {
        loadTickets().then(() => {
            console.log('Notification system initialized');
            lastKnownTicketCount = tickets.length;
            console.log('Initial ticket count:', lastKnownTicketCount);
        });
    }
}

// ============================================
// WINDOW CONTROL FUNCTIONS
// ============================================

/**
 * Shows the main window
 */
function showWindow() {
    if (window.electronAPI && window.electronAPI.showWindow) {
        window.electronAPI.showWindow();
    }
}

/**
 * Hides the main window
 */
function hideWindow() {
    if (window.electronAPI && window.electronAPI.hideWindow) {
        window.electronAPI.hideWindow();
    }
}

// ============================================
// IMAGE HANDLING FUNCTIONS
// ============================================

/**
 * Shows full size image in modal
 * @param {string} imageSrc - Image source URL
 * @param {string} title - Modal title
 */
function showFullSizeImage(imageSrc, title = 'Image Preview') {
    const fullSizeImage = document.getElementById('fullSizeImage');
    const imageViewerTitle = document.getElementById('imageViewerTitle');
    const imageViewerModal = document.getElementById('imageViewerModal');
    const imageInfo = document.getElementById('imageInfo');

    if (fullSizeImage && imageViewerTitle && imageViewerModal) {
        fullSizeImage.src = imageSrc;
        imageViewerTitle.textContent = title;
        fullSizeImage.classList.remove('zoomed');

        const img = new Image();
        img.onload = function () {
            if (imageInfo) {
                imageInfo.textContent = `Dimensions: ${this.width} × ${this.height} pixels | Size: ${formatImageSize(imageSrc)}`;
            }
        };
        img.src = imageSrc;

        imageViewerModal.classList.add('active');
    }
}

/**
 * Formats image size for display
 * @param {string} base64String - Base64 image string
 * @returns {string} Formatted size string
 */
function formatImageSize(base64String) {
    if (!base64String) return 'Unknown';

    try {
        const base64 = base64String.includes(',') ? base64String.split(',')[1] : base64String;
        const sizeInBytes = Math.floor((base64.length * 3) / 4);

        if (sizeInBytes < 1024) {
            return sizeInBytes + ' B';
        } else if (sizeInBytes < 1024 * 1024) {
            return (sizeInBytes / 1024).toFixed(1) + ' KB';
        } else {
            return (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
    } catch (error) {
        return 'Unknown';
    }
}

// ============================================
// AUTHENTICATION & USER MANAGEMENT
// ============================================

/**
 * Shows login content and resets UI state
 */
function showLoginContent() {
    // Lightweight reset for login screen - skip heavy resetUIState() call
    if (loginContent) loginContent.classList.remove('hidden');
    if (appContent) appContent.classList.add('hidden');
    if (userInfo) userInfo.classList.add('hidden');
    // Hide theme customization button on login screen
    if (themeCustomizeBtn) themeCustomizeBtn.classList.add('hidden');

    // Only reset form fields, don't call reset() on entire form (faster)
    if (loginForm) {
        const usernameInput = loginForm.elements['username'];
        const passwordInput = loginForm.elements['password'];
        const rememberMeCheckbox = loginForm.elements['rememberMe'];
        
        if (passwordInput) passwordInput.value = '';
        
        // Pre-fill remembered username (if any) - user must still enter password and click login
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        if (rememberedUsername) {
            if (usernameInput) usernameInput.value = rememberedUsername;
            if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
        } else {
            // Also load from rememberedUser for backward compatibility
            const rememberedUser = localStorage.getItem('rememberedUser');
            if (rememberedUser) {
                try {
                    const { username } = JSON.parse(rememberedUser);
                    if (usernameInput) usernameInput.value = username;
                    if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
                } catch (e) {
                    console.error('Error parsing remembered user:', e);
                    if (usernameInput) usernameInput.value = '';
                    if (rememberMeCheckbox) rememberMeCheckbox.checked = false;
                }
            } else {
                if (usernameInput) usernameInput.value = '';
                if (rememberMeCheckbox) rememberMeCheckbox.checked = false;
            }
        }
    }

    tickets = [];
    currentTicket = null;
    reportTickets = [];
    reportUsersData = [];
}

/**
 * Shows main app content after login
 */
function showAppContent() {
    const newTicketTab = document.getElementById('newTicketTab');
    const newTicketContent = document.getElementById('newTicketContent');

    if (newTicketTab && newTicketContent) {
        activateTab(newTicketTab, newTicketContent);
    }

    const loginContent = document.getElementById('loginContent');
    const appContent = document.getElementById('appContent');
    const userInfo = document.getElementById('userInfo');

    if (loginContent) loginContent.classList.add('hidden');
    if (appContent) appContent.classList.remove('hidden');
    if (userInfo) userInfo.classList.remove('hidden');
    if (themeCustomizeBtn) themeCustomizeBtn.classList.remove('hidden');
    // Show theme customization button after login
    if (themeCustomizeBtn) themeCustomizeBtn.classList.remove('hidden');

    // Set up user-specific fields
    const nameInput = document.getElementById('name');
    if (currentUser && currentUser.fullName && nameInput) {
        setTimeout(() => {
            nameInput.value = currentUser.fullName;
            nameInput.readOnly = true;
            nameInput.classList.add('bg-gray-100');
        }, 100);
    }

    const departmentSelect = document.getElementById('department');
    if (currentUser && currentUser.role === 'Staff' && departmentSelect) {
        setTimeout(() => {
            departmentSelect.value = currentUser.department;
            departmentSelect.disabled = true;
        }, 100);
    } else if (departmentSelect) {
        departmentSelect.disabled = false;
    }

    const userRole = document.getElementById('userRole');
    const usernameDisplay = document.getElementById('usernameDisplay');

    if (userRole) userRole.textContent = currentUser.role;
    if (usernameDisplay) usernameDisplay.textContent = currentUser.fullName;

    // Show/hide admin elements based on role
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    const itAdminOnlyElements = document.querySelectorAll('.it-admin-only');
    const staffOnlyElements = document.querySelectorAll('.staff-only');

    if (currentUser.role === 'Admin') {
        adminOnlyElements.forEach(el => el.classList.remove('hidden'));
        itAdminOnlyElements.forEach(el => el.classList.remove('hidden'));
        staffOnlyElements.forEach(el => el.classList.add('hidden'));
        const departmentFilterContainer = document.getElementById('departmentFilter')?.parentElement;
        if (departmentFilterContainer) departmentFilterContainer.classList.remove('hidden');
    } else if (currentUser.role === 'IT') {
        adminOnlyElements.forEach(el => el.classList.add('hidden'));
        itAdminOnlyElements.forEach(el => el.classList.remove('hidden'));
        staffOnlyElements.forEach(el => el.classList.add('hidden'));
        const departmentFilterContainer = document.getElementById('departmentFilter')?.parentElement;
        if (departmentFilterContainer) departmentFilterContainer.classList.remove('hidden');
    } else {
        adminOnlyElements.forEach(el => el.classList.add('hidden'));
        itAdminOnlyElements.forEach(el => el.classList.add('hidden'));
        staffOnlyElements.forEach(el => el.classList.remove('hidden'));
        const departmentFilterContainer = document.getElementById('departmentFilter')?.parentElement;
        if (departmentFilterContainer) departmentFilterContainer.classList.add('hidden');

        // Set department filter to user's department for Staff
        const departmentFilter = document.getElementById('departmentFilter');
        if (departmentFilter) {
            departmentFilter.value = currentUser.department;
        }
    }

    // Update subtitle to reflect current filter (will be called again after loadTickets)
    updateTicketsSubtitle();

    setTimeout(() => {
        initializeAutoRefresh();
        initializeNotificationSystem();
    }, 1000);
}

/**
 * Resets the UI state
 */
function resetUIState() {
    const ticketForm = document.getElementById('ticketForm');
    const loginForm = document.getElementById('loginForm');

    if (ticketForm) ticketForm.reset();
    if (loginForm) loginForm.reset();

    const nameInput = document.getElementById('name');
    if (currentUser && currentUser.fullName && nameInput) {
        nameInput.value = currentUser.fullName;
        nameInput.readOnly = true;
        nameInput.classList.add('bg-gray-100');
    } else if (nameInput) {
        nameInput.readOnly = false;
        nameInput.classList.remove('bg-gray-100');
    }

    const departmentSelect = document.getElementById('department');
    if (currentUser && currentUser.role === 'Staff' && departmentSelect) {
        setTimeout(() => {
            departmentSelect.value = currentUser.department;
            departmentSelect.disabled = true;
        }, 10);
    }

    // Hide role-specific elements on logout
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    const itAdminOnlyElements = document.querySelectorAll('.it-admin-only');
    const staffOnlyElements = document.querySelectorAll('.staff-only');
    
    adminOnlyElements.forEach(el => el.classList.add('hidden'));
    itAdminOnlyElements.forEach(el => el.classList.add('hidden'));
    staffOnlyElements.forEach(el => el.classList.add('hidden'));

    tickets = [];
    currentTicket = null;
    reportTickets = [];
    reportUsersData = [];

    const ticketFilter = document.getElementById('ticketFilter');
    const departmentFilter = document.getElementById('departmentFilter');

    if (ticketFilter) ticketFilter.value = 'all';
    if (departmentFilter) departmentFilter.value = 'all';

    const ticketsList = document.getElementById('ticketsList');
    const usersList = document.getElementById('usersList');
    const reportContent = document.getElementById('reportContent');

    if (ticketsList) ticketsList.innerHTML = '';
    if (usersList) usersList.innerHTML = '';
    if (reportContent) reportContent.innerHTML = '';

    const newTicketTab = document.getElementById('newTicketTab');
    const newTicketContent = document.getElementById('newTicketContent');

    if (newTicketTab && newTicketContent) {
        activateTab(newTicketTab, newTicketContent);
    }

    const ticketModal = document.getElementById('ticketModal');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const reportDisplay = document.getElementById('reportDisplay');
    const noReportData = document.getElementById('noReportData');

    if (ticketModal) ticketModal.classList.remove('active');
    if (deleteConfirmModal) deleteConfirmModal.classList.remove('active');
    if (reportDisplay) reportDisplay.classList.add('hidden');
    if (noReportData) noReportData.classList.add('hidden');

    const successMessage = document.getElementById('successMessage');
    const loginError = document.getElementById('loginError');
    const userMessage = document.getElementById('userMessage');

    if (successMessage) successMessage.classList.remove('show');
    if (loginError) loginError.classList.add('hidden');
    if (userMessage) userMessage.classList.add('hidden');
}

// ============================================
// TAB MANAGEMENT
// ============================================

/**
 * Activates a specific tab
 * @param {Element} tabButton - Tab button element
 * @param {Element} tabContent - Tab content element
 */
function activateTab(tabButton, tabContent) {
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active-tab');
        tab.classList.add('text-gray-500');
    });

    if (tabButton) {
        tabButton.classList.add('active-tab');
        tabButton.classList.remove('text-gray-500');
    }

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (tabContent) {
        tabContent.classList.add('active');
    }

    const nameInput = document.getElementById('name');
    const departmentSelect = document.getElementById('department');

    if (tabContent && tabContent.id === 'newTicketContent' && currentUser && currentUser.fullName && nameInput) {
        setTimeout(() => {
            nameInput.value = currentUser.fullName;
            nameInput.readOnly = true;
            nameInput.classList.add('bg-gray-100');

            if (currentUser.role === 'Staff' && departmentSelect) {
                if (departmentSelect.value !== currentUser.department) {
                    departmentSelect.value = currentUser.department;
                    departmentSelect.disabled = true;
                }
            }
        }, 10);
    }
}

/**
 * Starts auto-refresh for the ticket tab when it's active
 */
function startTicketTabAutoRefresh() {
    if (ticketTabRefreshInterval) {
        clearInterval(ticketTabRefreshInterval);
    }
    
    isTicketTabActive = true;
    
    // Initial refresh
    loadTickets(false);
    
    // Set up interval to refresh every ticketTabRefreshRate ms
    ticketTabRefreshInterval = setInterval(() => {
        if (isTicketTabActive) {
            loadTickets(false);
        }
    }, ticketTabRefreshRate);
}

/**
 * Stops auto-refresh for the ticket tab
 */
function stopTicketTabAutoRefresh() {
    isTicketTabActive = false;
    
    if (ticketTabRefreshInterval) {
        clearInterval(ticketTabRefreshInterval);
        ticketTabRefreshInterval = null;
    }
}

/**
 * Gets the ISO week number of the year for a given date.
 * @param {Date} d - The date.
 * @returns {number} The week number.
 */
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate the week number
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

/**
 * Populates the On Call tab with staff information and rotation schedule.
 */
function updateOnCallTab() {
    const onCallScheduleContainer = document.getElementById('onCallSchedule');
    const onCallNowContainer = document.getElementById('onCallNow');
    if (!onCallScheduleContainer || !onCallNowContainer) return;

    onCallScheduleContainer.innerHTML = '';
    onCallNowContainer.innerHTML = '';

    const today = new Date();
    const currentWeek = getWeekNumber(today);
    
    // Calculate index based on the difference from the start week
    const weekOffset = currentWeek - rotationStartWeek;
    const onCallIndex = (weekOffset % onCallStaff.length + onCallStaff.length) % onCallStaff.length;
    const onCallPerson = onCallStaff[onCallIndex];

    // Populate "Currently On Call" - Featured Card
    const onCallNowCard = document.createElement('div');
    onCallNowCard.className = 'p-4 rounded-lg border-2 flex flex-col items-center text-center space-y-3 shadow-md relative overflow-hidden';
    onCallNowCard.style.backgroundColor = 'rgba(' + hexToRgb(currentTheme.primaryColor).join(',') + ', 0.1)';
    onCallNowCard.style.borderColor = currentTheme.primaryColor;
    onCallNowCard.innerHTML = `
        <div class="absolute top-2 right-2">
            <span class="px-2 py-0.5 text-xs font-semibold rounded-full text-white" style="background-color: ${currentTheme.primaryColor};">
                ON CALL
            </span>
        </div>
        <div class="w-20 h-20 rounded-full border-3 border-white shadow-lg overflow-hidden on-call-image-container flex items-center justify-center" style="border-color: ${currentTheme.primaryColor};">
            <img src="${onCallPerson.picture}" alt="${onCallPerson.name}" class="on-call-image object-contain">
        </div>
        <div>
            <p class="text-base font-bold text-gray-900">${onCallPerson.name}</p>
            <p class="text-xs text-gray-600">${onCallPerson.position}</p>
        </div>
        <a href="https://wa.me/${onCallPerson.whatsapp}" target="_blank" class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-medium rounded-lg text-white transition-all shadow-sm hover:shadow-md" style="background-color: #25D366; cursor: pointer;" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.433-9.89-9.889-9.89-5.452 0-9.887 4.434-9.889 9.891.001 2.23.651 3.89 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.289.173-1.413z"/></svg>
            Contact via WhatsApp
        </a>
    `;
    onCallNowContainer.appendChild(onCallNowCard);

    // Populate weekly rotation schedule with upcoming weeks
    // First, create an array of staff excluding the current on-call person
    const upcomingStaff = onCallStaff
        .map((staff, index) => {
            if (index === onCallIndex) return null;
            
            // Calculate which week this person will be on call
            let weeksUntilOnCall = index - onCallIndex;
            if (weeksUntilOnCall <= 0) weeksUntilOnCall += onCallStaff.length;
            
            return { staff, index, weeksUntilOnCall };
        })
        .filter(item => item !== null);
    
    // Sort: STANDBY (weeksUntilOnCall === 1) first, then rest in order
    upcomingStaff.sort((a, b) => a.weeksUntilOnCall - b.weeksUntilOnCall);
    
    // Render the sorted staff
    upcomingStaff.forEach(({ staff, weeksUntilOnCall }) => {
        const isNextWeek = weeksUntilOnCall === 1;
        
        const staffCard = document.createElement('div');
        staffCard.className = `bg-white p-3 rounded-lg border transition-all hover:shadow-sm ${isNextWeek ? 'border-2' : 'border border-gray-200'}`;
        if (isNextWeek) {
            staffCard.style.borderColor = currentTheme.secondaryColor;
            staffCard.style.backgroundColor = 'rgba(' + hexToRgb(currentTheme.secondaryColor).join(',') + ', 0.05)';
        }
        
        staffCard.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full overflow-hidden on-call-image-container flex-shrink-0 flex items-center justify-center border-2 ${isNextWeek ? 'border-purple-300' : 'border-gray-200'}">
                    <img src="${staff.picture}" alt="${staff.name}" class="on-call-image object-contain">
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                        <p class="text-sm font-semibold text-gray-900 truncate">${staff.name}</p>
                        ${isNextWeek ? `<span class="px-1.5 py-0.5 text-[10px] font-medium rounded-full text-white" style="background-color: ${currentTheme.secondaryColor};">STANDBY</span>` : ''}
                    </div>
                    <p class="text-xs text-gray-600">${staff.position}</p>
                    ${isNextWeek ? '<p class="text-xs text-gray-500 mt-0.5">Next in rotation</p>' : ''}
                </div>
                <a href="https://wa.me/${staff.whatsapp}" target="_blank" class="text-green-500 hover:text-green-600 transition-colors flex-shrink-0" title="Contact via WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.433-9.89-9.889-9.89-5.452 0-9.887 4.434-9.889 9.891.001 2.23.651 3.89 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.289.173-1.413z"/></svg>
                </a>
            </div>
        `;
        onCallScheduleContainer.appendChild(staffCard);
    });
}

/**
 * Opens the modal to edit the on-call schedule.
 */
function openOnCallEditModal() {
    const modal = document.getElementById('onCallEditModal');
    const listContainer = document.getElementById('onCallEditList');
    if (!modal || !listContainer) return;

    listContainer.innerHTML = '';
    
    // Calculate current on-call index based on week rotation
    const today = new Date();
    const currentWeek = getWeekNumber(today);
    const weekOffset = currentWeek - rotationStartWeek;
    const currentOnCallIndex = (weekOffset % onCallStaff.length + onCallStaff.length) % onCallStaff.length;
    
    onCallStaff.forEach((staff, index) => {
        const staffItem = document.createElement('div');
        const isCurrentlyOnCall = index === currentOnCallIndex;
        const nextOnCallIndex = (currentOnCallIndex + 1) % onCallStaff.length;
        const isNextOnCall = index === nextOnCallIndex;
        
        staffItem.className = `bg-white p-3 rounded border flex items-start space-x-3 ${isCurrentlyOnCall ? 'border-blue-500 border-2' : isNextOnCall ? 'border-green-500 border-2' : 'border-gray-300'}`;
        staffItem.draggable = true;
        staffItem.dataset.index = index;
        staffItem.innerHTML = `
            <div class="flex-shrink-0 w-12 h-12">
                <div class="w-12 h-12 rounded-full on-call-image-container flex items-center justify-center overflow-hidden">
                    <img src="${staff.picture}" alt="${staff.name}" class="on-call-image object-contain cursor-pointer edit-on-call-picture" title="Click to change picture">
                </div>
                <input type="hidden" class="edit-on-call-picture-data" value="${staff.picture}">
            </div>
            <div class="flex-1 space-y-2">
                <div class="flex items-center gap-2">
                    ${isCurrentlyOnCall ? '<span class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-500 text-white">CURRENT ON CALL</span>' : ''}
                    ${isNextOnCall ? '<span class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-500 text-white">NEXT</span>' : ''}
                </div>
                <input type="text" class="edit-on-call-name text-xs w-full border border-gray-300 rounded shadow-sm py-1 px-2" value="${staff.name}" placeholder="Name">
                <input type="text" class="edit-on-call-position text-xs w-full border border-gray-300 rounded shadow-sm py-1 px-2" value="${staff.position}" placeholder="Position">
            </div>
            <div class="flex-shrink-0 pt-4 cursor-grab active:cursor-grabbing">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </div>
        `;
        listContainer.appendChild(staffItem);
    });

    // Drag and drop event listeners
    let draggedItem = null;
    listContainer.addEventListener('dragstart', e => { 
        // Make sure we are dragging the item, not an input field
        if (e.target.tagName === 'INPUT') {
            e.preventDefault();
            return;
        }
        draggedItem = e.target;
        setTimeout(() => e.target.style.opacity = '0.5', 0);
    });

    listContainer.addEventListener('dragend', e => {
        e.target.style.opacity = '1';
        draggedItem = null;
    });

    listContainer.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(listContainer, e.clientY);
        if (afterElement == null) {
            listContainer.appendChild(draggedItem);
        } else {
            listContainer.insertBefore(draggedItem, afterElement);
        }
    });

    // Add event listeners for changing pictures
    listContainer.querySelectorAll('.edit-on-call-picture').forEach(img => {
        img.addEventListener('click', async (e) => {
            const result = await window.electronAPI.selectImageFile();
            if (result.success) {
                const newPictureSrc = result.data;
                e.target.src = newPictureSrc;
                // Find the hidden input sibling and update its value
                const hiddenInput = e.target.nextElementSibling;
                if (hiddenInput && hiddenInput.classList.contains('edit-on-call-picture-data')) {
                    hiddenInput.value = newPictureSrc;
                }
            }
        });
    });

    modal.classList.add('active');
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('[draggable="true"]:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ============================================
// TICKET MANAGEMENT
// ============================================

/**
 * Computes a simple hash of ticket data to detect changes
 * @param {Array} tickets - Array of tickets
 * @returns {string} Hash string
 */
function computeTicketsHash(tickets) {
    // Create a simple hash based on ticket ID, status, priority, and submit date
    // Exclude duration for active tickets (Open/In Progress) since it changes constantly
    if (!tickets || tickets.length === 0) return 'empty';
    return tickets.map(t => {
        const status = t.Status || t.status;
        // Include duration in hash only for resolved/closed tickets (duration doesn't change)
        const duration = (status === 'Resolved' || status === 'Closed') ? (t.DurationFormatted || '') : '';
        return `${t.TicketID || t.id}:${status}:${t.Priority || t.priority}:${t.SubmitDate}:${duration}`;
    }).join('|');
}

/**
 * Loads tickets from the database
 * @param {boolean} resetNotifications - Whether to reset the unread ticket count.
 */
async function loadTickets(resetNotifications = false) {
    setTicketsLoading(true);

    try {
        // Check if currentUser is available before loading tickets
        if (!currentUser) {
            console.warn('Cannot load tickets: currentUser is not set');
            tickets = [];
            renderGroupedTickets();
            setTicketsLoading(false);
            return;
        }

        const ticketFilter = document.getElementById('ticketFilter');
        const departmentFilter = document.getElementById('departmentFilter');

        const filters = {
            userRole: currentUser.role,
            username: currentUser.username,
            userDepartment: currentUser.department,
            status: ticketFilter ? ticketFilter.value : 'all',
            department: departmentFilter ? departmentFilter.value : 'all'
        };

        console.log('Loading tickets with filters:', filters);

        const result = await window.electronAPI.getTickets(filters);

        if (result.success) {
            const newTickets = result.data; // Re-introduce for comparison logic
            
            // Compute hash of new tickets
            const newHash = computeTicketsHash(newTickets);
            
            // Only re-render if tickets have actually changed (including duration updates)
            if (newHash !== lastRenderedTicketsHash) {
                tickets = newTickets;
                lastRenderedTicketsHash = newHash;
                renderGroupedTickets();
            } else {
                // Tickets data is identical, no need to re-render
                // But update durations for active tickets since they keep increasing
                updateTicketDurations(newTickets);
                tickets = newTickets;
            }
            console.log('Tickets received:', tickets.length);

            if (resetNotifications) {
                unreadTicketCount = 0;
                lastKnownTicketCount = tickets.length;
            } else {
                // Calculate new tickets count (only if we have a previous count)
                if (lastKnownTicketCount > 0 && tickets.length > lastKnownTicketCount) {
                    const newTicketCount = tickets.length - lastKnownTicketCount;
                    unreadTicketCount += newTicketCount;

                    const activeTab = document.querySelector('.tab-content.active');
                    const isViewingTickets = activeTab && activeTab.id === 'myTicketsContent';
                    if (newTicketCount > 0 && !isViewingTickets) {
                        showTemporaryNotification(`📢 ${newTicketCount} new ticket(s) available`, 3000);
                    }
                }
                lastKnownTicketCount = tickets.length;
            }
            updateTicketNotificationBadge();
            updateTicketsSubtitle();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Failed to load tickets:', error);
        showErrorMessage('Failed to load tickets: ' + error.message);
        tickets = [];
        renderGroupedTickets();
    } finally {
        setTicketsLoading(false);
    }
}

/**
 * Updates duration display for all visible tickets without re-rendering the entire list
 * @param {Array} newTickets - Array of tickets with updated durations
 */
function updateTicketDurations(newTickets) {
    newTickets.forEach(ticket => {
        const ticketId = ticket.TicketID || ticket.id;
        const durationElement = document.getElementById(`duration-${ticketId}`);
        
        if (durationElement && ticket.DurationFormatted) {
            // Only update if the duration has changed
            const currentText = durationElement.textContent;
            const newDurationText = `⏱️ ${ticket.DurationFormatted}`;
            
            if (currentText !== newDurationText) {
                durationElement.textContent = newDurationText;
            }
        }
    });
}

/**
 * Updates the subtitle to reflect current filter selection
 */
function updateTicketsSubtitle() {
    const ticketsSubtitle = document.getElementById('ticketsSubtitle');
    if (!ticketsSubtitle || !currentUser) return;

    const departmentFilter = document.getElementById('departmentFilter');
    const currentDeptFilter = departmentFilter ? departmentFilter.value : 'all';

    let subtitle = '';

    if (currentUser.role === 'Staff') {
        // Staff users only see their own department
        subtitle = `(${currentUser.department})`;
    } else if (currentDeptFilter === 'all') {
        // Admin and IT users viewing all departments
        subtitle = '(All Departments)';
    } else {
        // Admin and IT users viewing specific department
        subtitle = `(${currentDeptFilter})`;
    }

    ticketsSubtitle.textContent = subtitle;
    ticketsSubtitle.title = subtitle.replace(/[()]/g, ''); // Add tooltip for long names without brackets
}

/**
 * Updates the tickets table display
 */
function renderGroupedTickets() {
    const container = document.getElementById('ticketGroupsContainer');
    const noTicketsMessage = document.getElementById('noTickets');

    if (!container) return;
    container.innerHTML = '';

    if (tickets.length === 0) {
        if (noTicketsMessage) noTicketsMessage.style.display = 'block';
        return;
    }

    if (noTicketsMessage) noTicketsMessage.style.display = 'none';

    // Group tickets by date
    const groups = {
        Today: [],
        Yesterday: [],
        'Previous 7 Days': [],
        'This Month': [],
        Older: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    tickets.forEach(ticket => {
        const ticketDate = new Date(ticket.SubmitDate);
        // Set time to 0 to compare dates only
        ticketDate.setHours(0, 0, 0, 0);

        if (ticketDate >= today) {
            groups.Today.push(ticket);
        } else if (ticketDate >= yesterday) {
            groups.Yesterday.push(ticket);
        } else if (ticketDate >= sevenDaysAgo) {
            groups['Previous 7 Days'].push(ticket);
        } else if (ticketDate >= startOfMonth) {
            groups['This Month'].push(ticket);
        } else {
            groups.Older.push(ticket);
        }
    });

    // Render groups
    for (const groupName in groups) {
        const groupTickets = groups[groupName];
        if (groupTickets.length > 0) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'ticket-group';

            const ticketsContainer = document.createElement('div');
            ticketsContainer.className = 'space-y-3';

            const groupHeaderContainer = document.createElement('div');
            groupHeaderContainer.className = 'flex justify-between items-center cursor-pointer sticky top-0 bg-gray-100 py-1.5 z-10 mb-2 px-2.5 rounded hover:bg-gray-200 transition-colors';
            groupHeaderContainer.innerHTML = `
                <h4 class="text-sm font-bold text-gray-800">${groupName} <span class="ml-1.5 text-gray-600">(${groupTickets.length})</span></h4>
                <button class="text-gray-400 hover:text-gray-600 transition-transform transform">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
            `;

            groupDiv.appendChild(groupHeaderContainer);

            // Toggle collapse/expand
            groupHeaderContainer.addEventListener('click', () => {
                ticketsContainer.classList.toggle('hidden');
                const icon = groupHeaderContainer.querySelector('svg');
                icon.classList.toggle('rotate-180');
            });

            // By default, collapse older groups
            if (groupName === 'Older' || groupName === 'This Month') {
                ticketsContainer.classList.add('hidden');
                const icon = groupHeaderContainer.querySelector('svg');
                icon.classList.add('rotate-180');
            }

            groupTickets.forEach(ticket => {
                const ticketCard = createTicketCard(ticket);
                ticketsContainer.appendChild(ticketCard);
            });

            groupDiv.appendChild(ticketsContainer);
            container.appendChild(groupDiv);
        }
    }

    // Add event listeners for image viewing
    document.querySelectorAll('.view-image').forEach(link => {
        link.addEventListener('click', async function (e) {
            e.stopPropagation();
            const ticketId = this.dataset.ticketId;
            await viewTicketImage(ticketId);
        });
    });
}

function createTicketCard(ticket) {
    const statusClass = getStatusClass(ticket.Status || ticket.status);
    const priorityClass = getPriorityClass(ticket.Priority || ticket.priority);
    
    // Add a colored left border based on status
    let borderColorClass = 'border-l-4 ';
    switch (ticket.Status || ticket.status) {
        case 'Open': borderColorClass += 'border-l-blue-500'; break;
        case 'In Progress': borderColorClass += 'border-l-orange-500'; break;
        case 'Resolved': borderColorClass += 'border-l-green-500'; break;
        case 'Closed': borderColorClass += 'border-l-red-600'; break;
        default: borderColorClass += 'border-l-gray-400';
    }

    const ticketCard = document.createElement('div');
    const themeColor = currentTheme?.primaryColor || '#4f46e5';
    ticketCard.className = `bg-transparent rounded-md p-2 ${borderColorClass} border border-gray-200 cursor-pointer shadow-sm`;
    ticketCard.dataset.ticketId = ticket.TicketID || ticket.id;
    ticketCard.style.borderLeftColor = '';

    // Get department color (same color for all departments)
    const deptColor = 'text-cyan-700 font-semibold';
    const deptName = ticket.Department || ticket.department;

    const systemInfo = (currentUser && (currentUser.role === 'IT' || currentUser.role === 'Admin')) && (ticket.PCName || ticket.IPAddress) ?
        `<div class="mt-0.5 flex justify-between items-center text-xs gap-1">
            ${ticket.PCName ? `<span class="text-gray-700">PC: ${ticket.PCName}</span>` : ''}
            ${ticket.IPAddress ? `<span class="text-gray-700">IP: ${ticket.IPAddress}</span>` : ''}
        </div>` : '';

    const imageAttached = ticket.ImageFileName ? `<span class="text-xs font-semibold text-gray-600 view-image cursor-pointer" data-ticket-id="${ticket.TicketID || ticket.id}">📎 Image Attached</span>` : '';

    ticketCard.innerHTML = `
        <div class="flex justify-between items-start gap-2 mb-1">
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-gray-800 leading-tight break-words">
                    ${ticket.Subject || ticket.subject}
                </h4>
                <p class="text-xs text-gray-500 mt-0.5">
                    <span class="text-gray-600 font-semibold">${ticket.TicketID || ticket.id}</span> · 
                    <span class="text-gray-500">${formatDateForDisplay(ticket.SubmitDate)}</span>
                </p>
            </div>
            <span class="text-xs font-medium flex-shrink-0 whitespace-nowrap ${statusClass}">
                ${ticket.Status || ticket.status}
            </span>
        </div>
        <div class="mt-1">
            <p class="text-sm text-gray-600 line-clamp-2" title="${ticket.Description || ticket.description}">
                ${(ticket.Description || ticket.description).length > 100 ?
                    (ticket.Description || ticket.description).substring(0, 100) + '...' :
                    (ticket.Description || ticket.description)}
            </p>
        </div>
        <div class="mt-1 flex justify-between items-center">
            <span class="text-xs ${deptColor}">${ticket.Department || ticket.department}</span>
        </div>
        ${systemInfo}
        <div class="mt-1 flex justify-between items-center gap-2">
            <span class="text-xs ${priorityClass}">${ticket.Priority || ticket.priority}</span>
            <div class="flex items-center gap-2">
                ${imageAttached}
                <span class="text-xs font-semibold text-gray-600" id="duration-${ticket.TicketID || ticket.id}">
                    ⏱️ ${formatDuration(ticket.DurationFormatted) || 'Calculating...'}
                </span>
            </div>
        </div>
    `;

    ticketCard.addEventListener('click', function () {
        const ticketId = this.dataset.ticketId;
        const ticket = tickets.find(t => (t.TicketID || t.id) == ticketId);
        if (ticket) {
            showTicketDetails(ticket);
        }
    });

    return ticketCard;
}

/**
 * Views ticket image
 * @param {string} ticketId - Ticket ID
 */
async function viewTicketImage(ticketId) {
    try {
        const result = await window.electronAPI.getTicketImage(ticketId);
        if (result.success) {
            showFullSizeImage(result.data, `Ticket ${ticketId} - Attached Image`);
        } else {
            showErrorMessage('No image found for this ticket');
        }
    } catch (error) {
        showErrorMessage('Error loading image: ' + error.message);
    }
}

/**
 * Shows ticket details in modal
 * @param {Object} ticket - Ticket object
 */
async function showTicketDetails(ticket) {
    currentTicket = ticket;

    const modalTicketId = document.getElementById('modalTicketId');
    const modalSubject = document.getElementById('modalSubject');
    const modalName = document.getElementById('modalName');
    const modalDepartment = document.getElementById('modalDepartment');
    const modalPriority = document.getElementById('modalPriority');
    const modalDate = document.getElementById('modalDate');
    const modalDescription = document.getElementById('modalDescription');
    const modalStatusBadge = document.getElementById('modalStatusBadge');

    if (modalTicketId) modalTicketId.textContent = ticket.TicketID || ticket.id;
    if (modalSubject) modalSubject.textContent = ticket.Subject || ticket.subject;
    if (modalName) modalName.textContent = ticket.Name || ticket.name;
    if (modalDepartment) modalDepartment.textContent = ticket.Department || ticket.department;
    if (modalPriority) modalPriority.textContent = ticket.Priority || ticket.priority;
    if (modalPriority) {
        modalPriority.className = `text-sm font-bold ${getPriorityClass(ticket.Priority || ticket.priority)}`;
    }
    if (modalDate) modalDate.textContent = formatDateForDisplay(ticket.SubmitDate, true);
    if (modalDescription) modalDescription.textContent = ticket.Description || ticket.description;

    // Load timeline, duration, and image in parallel for faster loading
    const ticketId = ticket.TicketID || ticket.id;
    try {
        const [timelineResult, durationResult, imageResult] = await Promise.all([
            window.electronAPI.getTicketTimeline(ticketId),
            window.electronAPI.getTicketDuration(ticketId),
            window.electronAPI.getTicketImage(ticketId)
        ]);

        // Process timeline
        if (timelineResult.success) {
            updateTicketTimeline(timelineResult.data);
        }

        // Process duration
        if (durationResult.success) {
            const durationElement = document.getElementById('modalDuration');
            if (durationElement) {
                durationElement.textContent = formatDuration(durationResult.data.durationFormatted);

                // Apply color based on overdue status
                if (durationResult.data.isOverdue) {
                    durationElement.className = 'text-xs font-semibold text-red-600';
                } else {
                    durationElement.className = 'text-xs font-semibold text-green-600';
                }
            }
        }

        // Process image
        const imageSection = document.getElementById('imageSection');
        const modalImage = document.getElementById('modalImage');

        if (imageResult.success && imageSection && modalImage) {
            modalImage.src = imageResult.data;
            imageSection.classList.remove('hidden');
        } else if (imageSection) {
            imageSection.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error loading ticket details:', error);
        const imageSection = document.getElementById('imageSection');
        if (imageSection) imageSection.classList.add('hidden');
    }

    // Update status badge
    const statusClass = getStatusClass(ticket.Status || ticket.status);
    if (modalStatusBadge) {
        modalStatusBadge.className = `px-2 py-0.5 text-xs font-medium rounded-full ${statusClass}`;
        modalStatusBadge.textContent = ticket.Status || ticket.status;
    }

    // Setup admin controls
    const modalStatusContainer = document.getElementById('modalStatusContainer');
    const modalStatus = document.getElementById('modalStatus');
    const adminButtons = document.querySelectorAll('.it-admin-only');

    if (currentUser && (currentUser.role === 'IT' || currentUser.role === 'Admin')) {
        if (modalStatusContainer) modalStatusContainer.classList.remove('hidden');
        if (modalStatus) {
            modalStatus.innerHTML = '';
            statuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                if (status === (ticket.Status || ticket.status)) {
                    option.selected = true;
                }
                modalStatus.appendChild(option);
            });
        }
        adminButtons.forEach(btn => btn.classList.remove('hidden'));
        if (modalStatusBadge) modalStatusBadge.classList.add('hidden');
    } else {
        if (modalStatusContainer) modalStatusContainer.classList.add('hidden');
        adminButtons.forEach(btn => btn.classList.add('hidden'));
        if (modalStatusBadge) modalStatusBadge.classList.remove('hidden');
    }

    // Show system info for IT/Admin
    const systemInfoSection = document.getElementById('systemInfoSection');
    const modalPCName = document.getElementById('modalPCName');
    const modalIPAddress = document.getElementById('modalIPAddress');

    if (currentUser && (currentUser.role === 'IT' || currentUser.role === 'Admin') && systemInfoSection) {
        systemInfoSection.classList.remove('hidden');

        const pcName = ticket.PCName || ticket.pcName || 'Not available';
        const ipAddress = ticket.IPAddress || ticket.ipAddress || 'Not available';

        if (modalPCName) modalPCName.textContent = pcName;
        if (modalIPAddress) modalIPAddress.textContent = ipAddress;

        console.log('Displaying system info:', { pcName, ipAddress });
    } else if (systemInfoSection) {
        systemInfoSection.classList.add('hidden');
    }

    const ticketModal = document.getElementById('ticketModal');
    if (ticketModal) ticketModal.classList.add('active');
}

/**
 * Updates ticket timeline display
 * @param {Object} timeline - Timeline data
 */
function updateTicketTimeline(timeline) {
    const submitDate = document.getElementById('modalSubmitDate');
    const resolvedDate = document.getElementById('modalResolvedDate');
    const resolvedBy = document.getElementById('modalResolvedBy');
    const closedBy = document.getElementById('modalClosedBy');
    const currentStatus = document.getElementById('modalCurrentStatus');
    const resolutionInfo = document.getElementById('resolutionInfo');
    const openStatus = document.getElementById('openStatus');

    if (submitDate) submitDate.textContent = formatDateForDisplay(timeline.SubmitDate, true);

    if (timeline.ResolvedDate && (timeline.Status === 'Resolved' || timeline.Status === 'Closed')) {
        if (resolvedDate) resolvedDate.textContent = formatDateForDisplay(timeline.ResolvedDate);
        if (resolvedBy) resolvedBy.textContent = timeline.ResolvedBy || 'System';
        if (closedBy) closedBy.textContent = timeline.ClosedBy || '';
        if (resolutionInfo) resolutionInfo.classList.remove('hidden');
        if (openStatus) openStatus.classList.add('hidden');
        if (currentStatus) currentStatus.textContent = timeline.Status;
    } else {
        if (resolutionInfo) resolutionInfo.classList.add('hidden');
        if (openStatus) openStatus.classList.remove('hidden');
        if (currentStatus) {
            currentStatus.textContent = timeline.Status;
            currentStatus.className = `text-xs font-medium ${getStatusClass(timeline.Status).replace('bg-', 'text-')}`;
        }
    }
}

/**
 * Loads and displays the ticket timeline for a given ticket ID
 * @param {number|string} ticketId - The ID of the ticket to load timeline for
 */
async function loadTicketTimeline(ticketId) {
    try {
        const timelineResult = await window.electronAPI.getTicketTimeline(ticketId);
        if (timelineResult.success) {
            updateTicketTimeline(timelineResult.data);
        } else {
            console.error('Failed to load ticket timeline:', timelineResult.error);
        }
    } catch (error) {
        console.error('Error loading ticket timeline:', error);
    }
}

/**
 * Updates the content of the ticket detail modal with new ticket data.
 * This is useful after an update operation to reflect changes immediately.
 * @param {object} ticket - The updated ticket object.
 */
function updateTicketModal(ticket) {
    if (!ticket) return;

    // Update the currentTicket global variable
    currentTicket = ticket;

    // Update status dropdown/badge
    const modalStatus = document.getElementById('modalStatus');
    const modalStatusBadge = document.getElementById('modalStatusBadge');

    if (modalStatus) {
        modalStatus.value = ticket.Status || ticket.status;
    }
    if (modalStatusBadge) {
        modalStatusBadge.textContent = ticket.Status || ticket.status;
        modalStatusBadge.className = `px-2 py-0.5 text-xs font-medium rounded-full ${getStatusClass(ticket.Status || ticket.status)}`;
    }

}

/**
 * Gets status class for styling
 * @param {string} status - Status string
 * @returns {string} CSS class string
 */
function getStatusClass(status) {
    switch (status) {
        case 'Open': return 'text-blue-600 font-semibold';
        case 'In Progress': return 'text-orange-600 font-semibold';
        case 'Resolved': return 'text-green-600 font-semibold';
        case 'Closed': return 'text-red-600 font-semibold';
        default: return 'text-gray-700 font-semibold';
    }
}

/**
 * Gets priority class for styling
 * @param {string} priority - Priority string
 * @returns {string} CSS class string
 */
function getPriorityClass(priority) {
    switch (priority) {
        case 'Critical': return 'text-red-700 font-bold';
        case 'High': return 'text-orange-700 font-bold';
        case 'Medium': return 'text-amber-700 font-bold';
        case 'Low': return 'text-green-700 font-bold';
        default: return 'text-gray-700 font-bold';
    }
}

/**
 * Formats date for display
 * @param {string} dateString - Date string
 * @param {boolean} full - Whether to show full date/time
 * @returns {string} Formatted date string
 */
function formatDateForDisplay(dateString, full = false) {
    if (!dateString) return 'N/A'; 

    try {
        let date;
        if (String(dateString).includes('T')) {
            date = new Date(dateString);
        } else if (dateString.includes(' ')) {
            date = new Date(dateString.replace(' ', 'T'));
        } else {
            date = new Date(dateString + 'T00:00:00');
        }

        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (full) {
            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // If today
        if (diffDays === 0) {
            if (diffHours === 0) {
                if (diffMinutes === 0) {
                    return 'Just now';
                }
                return `${diffMinutes} min ago`;
            }
            return `Today, ${date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })}`;
        }

        // If yesterday
        if (diffDays === 1) {
            return `Yesterday, ${date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })}`;
        }

        // If within a week
        if (diffDays < 7) {
            return `${diffDays} days ago`;
        }

        // Otherwise show date
        const options = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        };
        return date.toLocaleDateString('en-GB', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

/**
 * Formats a duration string from 'Xm' to 'Yh Zm' format.
 * @param {string} durationString - The duration string, e.g., "608m".
 * @returns {string} The formatted duration string, e.g., "10h 8m".
 */
function formatDuration(durationString) {
    // If no duration string provided, return empty
    if (!durationString) {
        return '';
    }

    // Duration is already formatted correctly from backend (e.g., "5m", "2h 30m", "3d 2h")
    // Return it as-is since backend already formats it properly
    return durationString;
}

/**
 * Sets tickets loading state
 * @param {boolean} loading - Loading state
 */
function setTicketsLoading(loading) {
    const ticketsList = document.getElementById('ticketsList');
    const manualRefreshBtn = document.getElementById('manualRefreshBtn');

    if (loading && ticketsList) {
        ticketsList.classList.add('opacity-50');
        if (manualRefreshBtn) {
            manualRefreshBtn.disabled = true;
        }
    } else {
        if (ticketsList) ticketsList.classList.remove('opacity-50');
        if (manualRefreshBtn) {
            manualRefreshBtn.disabled = false;
        }
    }
}

// ============================================
// DEPARTMENT MANAGEMENT
// ============================================

/**
 * Loads departments from database or uses defaults
 */
async function loadDepartments() {
    try {
        const result = await window.electronAPI.getDepartments();
        if (result.success) {
            departments = result.data.map(dept => dept.DepartmentName);
            populateDepartmentSelect();
            populateDepartmentFilter();
            populateUserDepartmentSelect();
            populateReportDepartmentFilter();

            const departmentSelect = document.getElementById('department');
            if (currentUser && currentUser.role === 'Staff' && departmentSelect) {
                setTimeout(() => {
                    departmentSelect.value = currentUser.department;
                    departmentSelect.disabled = true;
                }, 50);
            }
        }
    } catch (error) {
        console.error('Failed to load departments:', error);
        departments = ['Finance', 'Human Resources', 'Marketing', 'Operations', 'Sales', 'IT', 'Other'];
        populateDepartmentSelect();
        populateDepartmentFilter();
        populateUserDepartmentSelect();
        populateReportDepartmentFilter();

        const departmentSelect = document.getElementById('department');
        if (currentUser && currentUser.role === 'Staff' && departmentSelect) {
            setTimeout(() => {
                departmentSelect.value = currentUser.department;
                departmentSelect.disabled = true;
            }, 50);
        }
    }
}

/**
 * Populates department select dropdown
 */
function populateDepartmentSelect() {
    const departmentSelect = document.getElementById('department');
    if (!departmentSelect) return;

    departmentSelect.innerHTML = '<option value="" disabled selected>Select Department</option>';
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentSelect.appendChild(option);
    });

    if (currentUser && currentUser.role === 'Staff') {
        const userDeptExists = departments.includes(currentUser.department);
        if (userDeptExists) {
            departmentSelect.value = currentUser.department;
            departmentSelect.disabled = true;
        } else {
            const option = document.createElement('option');
            option.value = currentUser.department;
            option.textContent = currentUser.department;
            departmentSelect.appendChild(option);
            departmentSelect.value = currentUser.department;
            departmentSelect.disabled = true;
        }
    }
}

/**
 * Populates department filter dropdown
 */
function populateDepartmentFilter() {
    const departmentFilter = document.getElementById('departmentFilter');
    if (!departmentFilter) return;

    departmentFilter.innerHTML = '<option value="all">All Departments</option>';

    // For Staff users, only show their department
    if (currentUser && currentUser.role === 'Staff') {
        const option = document.createElement('option');
        option.value = currentUser.department;
        option.textContent = currentUser.department;
        option.title = currentUser.department;
        option.setAttribute('data-full-name', currentUser.department);
        departmentFilter.appendChild(option);
        departmentFilter.value = currentUser.department;
        departmentFilter.disabled = true;
    } else {
        // For IT and Admin, show all departments
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            option.title = dept;
            option.setAttribute('data-full-name', dept);
            departmentFilter.appendChild(option);
        });
        departmentFilter.disabled = false;
    }

    // Update tooltip on selection change
    departmentFilter.addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        this.title = selectedOption.value === 'all' ? 'All Departments' : selectedOption.textContent;
    });

    // Set initial tooltip
    const initialSelected = departmentFilter.options[departmentFilter.selectedIndex];
    departmentFilter.title = initialSelected.value === 'all' ? 'All Departments' : initialSelected.textContent;
}

/**
 * Populates user department select dropdown
 */
function populateUserDepartmentSelect() {
    const newUserDepartment = document.getElementById('newUserDepartment');
    if (!newUserDepartment) return;

    newUserDepartment.innerHTML = '<option value="" disabled selected>Select Department</option>';
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        newUserDepartment.appendChild(option);
    });
}

/**
 * Updates departments list in settings
 */
function updateDepartmentsList() {
    const departmentsList = document.getElementById('departmentsList');
    const noDepartments = document.getElementById('noDepartments');

    if (!departmentsList) return;

    departmentsList.innerHTML = '';

    if (departments.length === 0) {
        if (noDepartments) noDepartments.classList.remove('hidden');
        return;
    }

    if (noDepartments) noDepartments.classList.add('hidden');

    departments.forEach(dept => {
        const deptItem = document.createElement('div');
        deptItem.className = 'flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors';

        deptItem.innerHTML = `
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <span class="text-xs font-medium">${dept}</span>
            </div>
            <button class="text-red-500 hover:text-red-700 delete-department p-1 rounded hover:bg-red-50 transition-colors"
                    data-dept="${dept}" title="Delete department">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
            </button>
        `;

        const deleteBtn = deptItem.querySelector('.delete-department');
        deleteBtn.addEventListener('click', async function (e) {
            e.stopPropagation();
            const deptToDelete = this.dataset.dept;

            if (confirm(`Are you sure you want to delete the "${deptToDelete}" department? This action cannot be undone.`)) {
                try {
                    const result = await window.electronAPI.deleteDepartment(deptToDelete);
                    if (result.success) {
                        showSuccessMessage(`Department "${deptToDelete}" deleted successfully!`);
                        await loadDepartments(); // Reload from DB
                    } else {
                        showErrorMessage(result.error);
                    }
                } catch (error) {
                    showErrorMessage('Failed to delete department: ' + error.message);
                }
            }
        });

        departmentsList.appendChild(deptItem);
    });
}

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Loads users from database
 */
async function loadUsers() {
    try {
        const result = await window.electronAPI.getUsers();
        if (result.success) {
            const users = result.data;
            updateUsersList(users);
            // Clear search input when users are loaded
            const usersSearchInput = document.getElementById('usersSearchInput');
            if (usersSearchInput) {
                usersSearchInput.value = '';
            }
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Failed to load users:', error);
        showUserMessage('Failed to load users', 'error');
    }
}

/**
 * Updates users list display
 * @param {Array} users - Array of users
 */
function updateUsersList(users) {
    const usersList = document.getElementById('usersList');
    const noUsers = document.getElementById('noUsers');

    if (!usersList) return;

    if (users.length === 0) {
        if (noUsers) noUsers.classList.remove('hidden');
        usersList.innerHTML = '';
        return;
    }

    if (noUsers) noUsers.classList.add('hidden');
    usersList.innerHTML = '';

    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'bg-white p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors';

        userCard.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                        <h4 class="text-xs font-medium text-gray-900">${user.FullName}</h4>
                    </div>
                    <p class="text-xs text-gray-500">${user.Username} • ${user.Department}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-2 py-0.5 text-xs rounded-full ${user.IsActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}">
                        ${user.IsActive ? 'Active' : 'Inactive'}
                    </span>
                    <span class="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        ${user.Role}
                    </span>
                </div>
            </div>

            <div class="flex space-x-2 mt-3">
<select class="user-role text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 !important focus:ring-indigo-500 !important"
                        data-user-id="${user.ID}" title="Change user role">
                    <option value="Staff" ${user.Role === 'Staff' ? 'selected' : ''}>Staff</option>
                    <option value="IT" ${user.Role === 'IT' ? 'selected' : ''}>IT Support</option>
                    <option value="Admin" ${user.Role === 'Admin' ? 'selected' : ''}>Administrator</option>
                </select>

                <button class="toggle-user text-xs px-2 py-1 rounded border ${user.IsActive ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'}"
                        data-user-id="${user.ID}" data-current-status="${user.IsActive}"
                        title="${user.IsActive ? 'Deactivate user' : 'Activate user'}">
                    ${user.IsActive ? 'Deactivate' : 'Activate'}
                </button>

                <button class="delete-user text-xs px-2 py-1 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        data-user-id="${user.ID}" title="Delete user">
                    Delete
                </button>
            </div>
        `;

        usersList.appendChild(userCard);
    });

    addUserEventListeners();
}

/**
 * Filters users display based on search input
 * @param {string} searchTerm - Search term to filter by (ID/Username or Full Name)
 */
function filterUsersDisplay(searchTerm) {
    const userCards = document.querySelectorAll('#usersList > div');
    let visibleCount = 0;

    userCards.forEach(card => {
        // Get username (ID) from the card
        const username = card.querySelector('p.text-xs.text-gray-500')?.textContent.split(' • ')[0]?.trim() || '';
        
        // Get full name from the card
        const fullName = card.querySelector('h4.text-xs.font-medium')?.textContent.trim() || '';
        
        // Check if either username or full name contains the search term
        const matches = username.toLowerCase().includes(searchTerm) || 
                       fullName.toLowerCase().includes(searchTerm);
        
        if (matches) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Show "no users" message if no results match
    const noUsers = document.getElementById('noUsers');
    if (visibleCount === 0 && userCards.length > 0) {
        if (noUsers) noUsers.classList.remove('hidden');
    } else if (noUsers) {
        noUsers.classList.add('hidden');
    }
}

/**
 * Adds event listeners for user management
 */
function addUserEventListeners() {
    document.querySelectorAll('.user-role').forEach(select => {
        select.addEventListener('change', async function () {
            const userId = this.dataset.userId;
            const newRole = this.value;

            try {
                const userData = {
                    fullName: '',
                    department: '',
                    role: newRole,
                    isActive: true
                };

                const result = await window.electronAPI.updateUser(userId, userData);

                if (result.success) {
                    showUserMessage('User role updated successfully', 'success');
                } else {
                    showUserMessage(result.error, 'error');
                    this.value = this.dataset.previousValue;
                }
            } catch (error) {
                showUserMessage('Failed to update user role', 'error');
                this.value = this.dataset.previousValue;
            }
        });
    });

    document.querySelectorAll('.toggle-user').forEach(button => {
        button.addEventListener('click', async function () {
            const userId = this.dataset.userId;
            const currentStatus = this.dataset.currentStatus === 'true';

            try {
                const userData = {
                    fullName: '',
                    department: '',
                    role: 'Staff',
                    isActive: !currentStatus
                };

                const result = await window.electronAPI.updateUser(userId, userData);

                if (result.success) {
                    showUserMessage(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
                    loadUsers();
                } else {
                    showUserMessage(result.error, 'error');
                }
            } catch (error) {
                showUserMessage('Failed to update user status', 'error');
            }
        });
    });

    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', async function () {
            const userId = this.dataset.userId;

            if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                try {
                    const result = await window.electronAPI.deleteUser(userId);

                    if (result.success) {
                        showUserMessage('User deleted successfully', 'success');
                        loadUsers();
                    } else {
                        showUserMessage(result.error, 'error');
                    }
                } catch (error) {
                    showUserMessage('Failed to delete user', 'error');
                }
            }
        });
    });
}

/**
 * Resets user management form
 */
function resetUserManagementForm() {
    const newUsername = document.getElementById('newUsername');
    const newPassword = document.getElementById('newPassword');
    const newFullName = document.getElementById('newFullName');
    const newUserDepartment = document.getElementById('newUserDepartment');
    const newUserRole = document.getElementById('newUserRole');

    if (newUsername) newUsername.value = '';
    if (newPassword) newPassword.value = '';
    if (newFullName) newFullName.value = '';
    if (newUserDepartment) newUserDepartment.value = '';
    if (newUserRole) newUserRole.value = 'Staff';
}

/**
 * Shows user message
 * @param {string} message - Message to display
 * @param {string} type - Message type (success/error)
 */
function showUserMessage(message, type) {
    const userMessage = document.getElementById('userMessage');
    if (!userMessage) return;

    userMessage.textContent = message;
    userMessage.className = `text-xs text-center p-2 rounded ${type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`;
    userMessage.classList.remove('hidden');

    setTimeout(() => {
        userMessage.classList.add('hidden');
    }, 5000);
}

/**
 * Sets add user loading state
 * @param {boolean} loading - Loading state
 */
function setAddUserLoading(loading) {
    const addUserBtn = document.getElementById('addUserBtn');
    if (!addUserBtn) return;

    if (loading) {
        addUserBtn.innerHTML = `
            <span class="loading inline-block mr-2"></span>
            Adding...
        `;
        addUserBtn.disabled = true;
        addUserBtn.classList.add('opacity-50');
    } else {
        addUserBtn.innerHTML = 'Add User';
        addUserBtn.disabled = false;
        addUserBtn.classList.remove('opacity-50');
    }
}

// ============================================
// REPORTS SYSTEM
// ============================================

/**
 * Populates year dropdown for reports
 */
function populateYearDropdown() {
    const currentYear = new Date().getFullYear();
    const reportYear = document.getElementById('reportYear');
    if (!reportYear) return;

    reportYear.innerHTML = '';
    for (let year = currentYear; year >= currentYear - 2; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        reportYear.appendChild(option);
    }
}

/**
 * Populates report department filter
 */
function populateReportDepartmentFilter() {
    const reportDepartment = document.getElementById('reportDepartment');
    if (!reportDepartment) return;

    reportDepartment.innerHTML = '<option value="all">All Departments</option>';

    // For Staff users, only show their department
    if (currentUser && currentUser.role === 'Staff') {
        const option = document.createElement('option');
        option.value = currentUser.department;
        option.textContent = currentUser.department;
        reportDepartment.appendChild(option);
        reportDepartment.value = currentUser.department;
    } else {
        // For IT and Admin, show all departments
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            reportDepartment.appendChild(option);
        });
        reportDepartment.value = 'all';
    }

    // Show/hide department filter based on user role and report type
    updateReportDepartmentFilterVisibility();
}

/**
 * Updates report department filter visibility
 */
function updateReportDepartmentFilterVisibility() {
    const reportDepartmentFilter = document.getElementById('reportDepartmentFilter');
    const reportType = document.getElementById('reportType');

    if (!reportDepartmentFilter || !reportType) return;

    const shouldShow = (currentUser.role === 'IT' || currentUser.role === 'Admin') &&
        (reportType.value === 'department' || reportType.value === 'all');

    if (shouldShow) {
        reportDepartmentFilter.classList.remove('hidden');
    } else {
        reportDepartmentFilter.classList.add('hidden');
    }
}

/**
 * Generates reports
 */
async function generateReport() {
    const reportMonth = document.getElementById('reportMonth');
    const reportYear = document.getElementById('reportYear');
    const reportType = document.getElementById('reportType');
    const reportDepartment = document.getElementById('reportDepartment');

    if (!reportMonth || !reportYear) {
        showErrorMessage('Please select both month and year');
        return;
    }

    const month = parseInt(reportMonth.value);
    const year = parseInt(reportYear.value);
    const reportTypeValue = reportType.value;
    const department = reportDepartment.value;

    if (!month || !year) {
        showErrorMessage('Please select both month and year');
        return;
    }

    setReportLoading(true);
    const reportDisplay = document.getElementById('reportDisplay');
    const noReportData = document.getElementById('noReportData');

    if (reportDisplay) reportDisplay.classList.add('hidden');
    if (noReportData) noReportData.classList.add('hidden');

    try {
        let filters = {
            userRole: currentUser.role,
            username: currentUser.username,
            userDepartment: currentUser.department,
            status: 'all',
            department: 'all'
        };

        // Get all tickets first
        const result = await window.electronAPI.getTickets(filters);

        if (result.success) {
            // Filter tickets by month and year
            const allTickets = result.data;
            reportTickets = allTickets.filter(ticket => {
                const ticketDate = new Date(ticket.SubmitDate);
                return ticketDate.getMonth() + 1 === month && ticketDate.getFullYear() === year;
            });

            // Apply additional filters based on report type
            if (reportTypeValue === 'user') {
                // My tickets only
                reportTickets = reportTickets.filter(ticket =>
                    ticket.SubmittedBy === currentUser.username
                );
            } else if (reportTypeValue === 'department' && department && department !== 'all') {
                // Specific department
                reportTickets = reportTickets.filter(ticket =>
                    ticket.Department === department
                );
            }

            // For "all users" report type, we need to generate user statistics
            if (reportTypeValue === 'all') {
                if (currentUser.role !== 'Admin') {
                    showErrorMessage('Access denied. All users reports are only available for Administrators.');
                    return;
                }
                await generateAllUsersReport(month, year, department);
            } else {
                // Regular tickets report
                if (reportTickets.length === 0) {
                    if (noReportData) noReportData.classList.remove('hidden');
                    if (reportDisplay) reportDisplay.classList.add('hidden');
                    showErrorMessage('No data found for the selected period and filters');
                } else {
                    displayReport(reportTypeValue, month, year, department);
                    if (reportDisplay) reportDisplay.classList.remove('hidden');
                    if (noReportData) noReportData.classList.add('hidden');
                    showSuccessMessage('Report generated successfully!');
                }
            }
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error generating report:', error);
        showErrorMessage('Failed to generate report: ' + error.message);
        if (noReportData) noReportData.classList.remove('hidden');
        if (reportDisplay) reportDisplay.classList.add('hidden');
    } finally {
        setReportLoading(false);
    }
}

/**
 * Displays report data
 * @param {string} reportType - Type of report
 * @param {number} month - Month
 * @param {number} year - Year
 * @param {string} department - Department filter
 */
function displayReport(reportType, month, year, department) {
    const reportTitle = document.getElementById('reportTitle');
    const reportPeriod = document.getElementById('reportPeriod');
    const reportFilters = document.getElementById('reportFilters');
    const reportGenerated = document.getElementById('reportGenerated');
    const reportSummary = document.getElementById('reportSummary');
    const summaryStats = document.getElementById('summaryStats');
    const reportContent = document.getElementById('reportContent');

    if (!reportTitle || !reportPeriod || !reportFilters || !reportGenerated) return;

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthName = monthNames[month - 1];

    reportTitle.textContent = getReportTitle(reportType);
    reportPeriod.textContent = `${monthName} ${year}`;

    let filtersText = '';
    if (department && department !== 'all') {
        filtersText = `Department: ${department}`;
    } else if (reportType === 'department') {
        filtersText = 'All Departments';
    }
    reportFilters.textContent = filtersText;

    reportGenerated.textContent = `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;

    generateSummaryStats(reportType, month, year, department);
    generateReportContent(reportType);
}

/**
 * Gets report title based on type
 * @param {string} reportType - Report type
 * @returns {string} Report title
 */
function getReportTitle(reportType) {
    switch (reportType) {
        case 'user':
            return 'My Tickets Report';
        case 'department':
            return 'Department Tickets Report';
        case 'all':
            return 'All Users Summary Report';
        default:
            return 'Monthly Report';
    }
}

/**
 * Generates summary statistics
 * @param {string} reportType - Report type
 * @param {number} month - Month
 * @param {number} year - Year
 * @param {string} department - Department
 */
function generateSummaryStats(reportType, month, year, department) {
    const summaryStats = document.getElementById('summaryStats');
    if (!summaryStats) return;

    summaryStats.innerHTML = '';

    if (reportType === 'all') {
        // User summary stats
        const totalUsers = reportUsersData.length;
        const totalTickets = reportUsersData.reduce((sum, user) => sum + (user.TotalTickets || 0), 0);
        const openTickets = reportUsersData.reduce((sum, user) => sum + (user.OpenTickets || 0), 0);
        const resolvedTickets = reportUsersData.reduce((sum, user) => sum + (user.ResolvedTickets || 0), 0);
        const closedTickets = reportUsersData.reduce((sum, user) => sum + (user.ClosedTickets || 0), 0);

        summaryStats.innerHTML = `
            <div class="text-center">
                <div class="text-lg font-bold text-gray-900">${totalUsers}</div>
                <div class="text-xs text-gray-600">Total Users</div>
            </div>
            <div class="text-center">
                <div class="text-lg font-bold text-gray-900">${totalTickets}</div>
                <div class="text-xs text-gray-600">Total Tickets</div>
            </div>
            <div class="text-center">
                <div class="text-lg font-bold text-yellow-600">${openTickets}</div>
                <div class="text-xs text-gray-600">Open</div>
            </div>
            <div class="text-center">
                <div class="text-lg font-bold text-green-600">${resolvedTickets}</div>
                <div class="text-xs text-gray-600">Resolved</div>
            </div>
            <div class="text-center">
                <div class="text-lg font-bold text-gray-600">${closedTickets}</div>
                <div class="text-xs text-gray-600">Closed</div>
            </div>
        `;
    } else {
        // Ticket summary stats
        const totalTickets = reportTickets.length;
        const openTickets = reportTickets.filter(ticket => ticket.Status === 'Open').length;
        const inProgressTickets = reportTickets.filter(ticket => ticket.Status === 'In Progress').length;
        const resolvedTickets = reportTickets.filter(ticket => ticket.Status === 'Resolved').length;
        const closedTickets = reportTickets.filter(ticket => ticket.Status === 'Closed').length;

        summaryStats.innerHTML = `
            <div class="text-center">
                <div class="text-lg font-bold text-gray-900">${totalTickets}</div>
                <div class="text-xs text-gray-600">Total Tickets</div>
            </div>
            <div class="text-center">
                <div class="text-lg font-bold text-yellow-600">${openTickets}</div>
                <div class="text-xs text-gray-600">Open</div>
            </div>
            <div class="text-center">
                <div class="text-lg font-bold text-blue-600">${inProgressTickets}</div>
                <div class="text-xs text-gray-600">In Progress</div>
            </div>
            <div class="text-center">
                <div class="text-lg font-bold text-green-600">${resolvedTickets}</div>
                <div class="text-xs text-gray-600">Resolved</div>
            </div>
            <div class="text-center">
                <div class="text-lg font-bold text-gray-600">${closedTickets}</div>
                <div class="text-xs text-gray-600">Closed</div>
            </div>
        `;
    }
}

/**
 * Generates report content
 * @param {string} reportType - Report type
 */
function generateReportContent(reportType) {
    const reportContent = document.getElementById('reportContent');
    if (!reportContent) return;

    reportContent.innerHTML = '';

    if (reportType === 'all') {
        generateUsersReportContent();
    } else {
        generateTicketsReportContent(reportType);
    }
}

/**
 * Generates users report content
 */
function generateUsersReportContent() {
    let contentHTML = `
        <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-3">User Performance Summary</h4>
            <div class="overflow-x-auto">
                <table class="w-full text-xs border-collapse border border-gray-300">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="border border-gray-300 p-2 text-left">User</th>
                            <th class="border border-gray-300 p-2 text-left">Department</th>
                            <th class="border border-gray-300 p-2 text-center">Total Tickets</th>
                            <th class="border border-gray-300 p-2 text-center">Open</th>
                            <th class="border border-gray-300 p-2 text-center">In Progress</th>
                            <th class="border border-gray-300 p-2 text-center">Resolved</th>
                            <th class="border border-gray-300 p-2 text-center">Closed</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    reportUsersData.forEach(user => {
        contentHTML += `
            <tr class="hover:bg-gray-50 user-row">
                <td class="border border-gray-300 p-2">
                    <div class="font-medium">${user.FullName}</div>
                    <div class="text-gray-500 text-xs">${user.Username}</div>
                </td>
                <td class="border border-gray-300 p-2">${user.Department}</td>
                <td class="border border-gray-300 p-2 text-center font-medium">${user.TotalTickets || 0}</td>
                <td class="border border-gray-300 p-2 text-center">
                    <span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">${user.OpenTickets || 0}</span>
                </td>
                <td class="border border-gray-300 p-2 text-center">
                    <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">${user.InProgressTickets || 0}</span>
                </td>
                <td class="border border-gray-300 p-2 text-center">
                    <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">${user.ResolvedTickets || 0}</span>
                </td>
                <td class="border border-gray-300 p-2 text-center">
                    <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">${user.ClosedTickets || 0}</span>
                </td>
            </tr>
        `;
    });

    contentHTML += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    reportContent.innerHTML = contentHTML;
}

/**
 * Generates tickets report content
 * @param {string} reportType - Report type
 */
function generateTicketsReportContent(reportType) {
    let contentHTML = `
        <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Ticket Details</h4>
            <div class="space-y-3">
    `;

    reportTickets.forEach(ticket => {
        const statusClass = getStatusClass(ticket.Status);
        const submitDateTime = formatDateTimeForReport(ticket.SubmitDate);
        const resolvedDateTime = ticket.ResolvedDate ? formatDateTimeForReport(ticket.ResolvedDate) : null;
        const resolvedBy = ticket.ResolvedBy || 'Not resolved';

        // Calculate resolution time if resolved
        let resolutionTime = '';
        if (ticket.ResolvedDate && ticket.SubmitDate) {
            const submitDate = new Date(ticket.SubmitDate);
            const resolvedDate = new Date(ticket.ResolvedDate);
            const timeDiff = resolvedDate - submitDate;
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                resolutionTime = `${days}d ${hours}h ${minutes}m`;
            } else if (hours > 0) {
                resolutionTime = `${hours}h ${minutes}m`;
            } else {
                resolutionTime = `${minutes}m`;
            }
        }

        contentHTML += `
            <div class="bg-white border border-gray-200 rounded-lg p-4 ticket-row hover:bg-gray-50">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h5 class="font-medium text-gray-900">${ticket.Subject || ticket.subject}</h5>
                        <p class="text-xs text-gray-500">${ticket.TicketID} • Submitted: ${submitDateTime}</p>
                        ${resolvedDateTime ? `
                            <p class="text-xs text-green-600">Resolved: ${resolvedDateTime} • By: ${resolvedBy}</p>
                            ${resolutionTime ? `<p class="text-xs text-blue-600">Resolution Time: ${resolutionTime}</p>` : ''}
                        ` : ''}
                    </div>
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${statusClass}">
                        ${ticket.Status}
                    </span>
                </div>

                <div class="grid grid-cols-2 gap-4 text-xs mb-2">
                    <div>
                        <span class="text-gray-600">Submitted by:</span>
                        <span class="font-medium ml-1">${ticket.Name || ticket.SubmittedBy}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Department:</span>
                        <span class="font-medium ml-1">${ticket.Department}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Priority:</span>
                        <span class="font-medium ml-1 ${getPriorityClass(ticket.Priority)}">${ticket.Priority}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Issue Type:</span>
                        <span class="font-medium ml-1">${ticket.IssueType}</span>
                    </div>
                </div>

                <div class="text-xs">
                    <span class="text-gray-600">Description:</span>
                    <p class="mt-1 text-gray-700">${ticket.Description}</p>
                </div>
            </div>
        `;
    });

    contentHTML += `
            </div>
        </div>
    `;

    reportContent.innerHTML = contentHTML;
}

/**
 * Formats date and time for reports
 * @param {string} dateString - Date string
 * @returns {string} Formatted date time string
 */
function formatDateTimeForReport(dateString) {
    if (!dateString) return 'Date not available';

    try {
        let date;
        if (dateString.includes('T')) {
            date = new Date(dateString);
        } else if (dateString.includes(' ')) {
            date = new Date(dateString.replace(' ', 'T'));
        } else {
            date = new Date(dateString + 'T00:00:00');
        }

        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting date for report:', error);
        return dateString;
    }
}

/**
 * Generates all users report
 * @param {number} month - Month
 * @param {number} year - Year
 * @param {string} department - Department filter
 */
async function generateAllUsersReport(month, year, department) {
    try {
        // Get all users
        const usersResult = await window.electronAPI.getUsers();
        if (!usersResult.success) {
            throw new Error('Failed to load users');
        }

        const allUsers = usersResult.data.filter(user => user.IsActive);
        reportUsersData = [];

        // Get all tickets for the period
        const filters = {
            userRole: 'Admin', // Use admin role to get all tickets
            username: currentUser.username,
            userDepartment: currentUser.department,
            status: 'all',
            department: department !== 'all' ? department : 'all'
        };

        const ticketsResult = await window.electronAPI.getTickets(filters);
        if (!ticketsResult.success) {
            throw new Error('Failed to load tickets');
        }

        const allTickets = ticketsResult.data.filter(ticket => {
            const ticketDate = new Date(ticket.SubmitDate);
            return ticketDate.getMonth() + 1 === month && ticketDate.getFullYear() === year;
        });

        // Aggregate data by user
        allUsers.forEach(user => {
            const userTickets = allTickets.filter(ticket => ticket.SubmittedBy === user.Username);

            const userReport = {
                Username: user.Username,
                FullName: user.FullName,
                Department: user.Department,
                TotalTickets: userTickets.length,
                OpenTickets: userTickets.filter(t => t.Status === 'Open').length,
                InProgressTickets: userTickets.filter(t => t.Status === 'In Progress').length,
                ResolvedTickets: userTickets.filter(t => t.Status === 'Resolved').length,
                ClosedTickets: userTickets.filter(t => t.Status === 'Closed').length
            };

            // Only include users with tickets or if we want to show all users
            if (userReport.TotalTickets > 0) {
                reportUsersData.push(userReport);
            }
        });

        if (reportUsersData.length === 0) {
            const noReportData = document.getElementById('noReportData');
            const reportDisplay = document.getElementById('reportDisplay');
            if (noReportData) noReportData.classList.remove('hidden');
            if (reportDisplay) reportDisplay.classList.add('hidden');
            showErrorMessage('No user data found for the selected period and filters');
        } else {
            displayReport('all', month, year, department);
            const reportDisplay = document.getElementById('reportDisplay');
            const noReportData = document.getElementById('noReportData');
            if (reportDisplay) reportDisplay.classList.remove('hidden');
            if (noReportData) noReportData.classList.add('hidden');
            showSuccessMessage('All Users Report generated successfully!');
        }
    } catch (error) {
        throw new Error('Failed to generate all users report: ' + error.message);
    }
}

/**
 * Sets report loading state
 * @param {boolean} loading - Loading state
 */
function setReportLoading(loading) {
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (!generateReportBtn) return;

    if (loading) {
        generateReportBtn.textContent = 'Generating...';
        generateReportBtn.disabled = true;
    } else {
        generateReportBtn.textContent = 'Generate Report';
        generateReportBtn.disabled = false;
    }
}

// ============================================
// PDF EXPORT SYSTEM
// ============================================

/**
 * Exports report to PDF
 */
async function exportReportToPDF() {
    const exportPDFBtn = document.getElementById('exportPDFBtn');
    if (!exportPDFBtn) return;

    setPDFLoading(true);

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text('IT Help Desk Report', 20, 20);

        // Add period and filters
        doc.setFontSize(10);
        doc.text('Monthly Report', 20, 30);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 36);

        // Add summary section
        doc.setFontSize(12);
        doc.text('Summary Statistics', 20, 50);

        // Get summary data
        let summaryData = [];

        if (reportType.value === 'all') {
            // User summary stats
            const totalUsers = reportUsersData.length;
            const totalTickets = reportUsersData.reduce((sum, user) => sum + (user.TotalTickets || 0), 0);
            const openTickets = reportUsersData.reduce((sum, user) => sum + (user.OpenTickets || 0), 0);
            const resolvedTickets = reportUsersData.reduce((sum, user) => sum + (user.ResolvedTickets || 0), 0);
            const closedTickets = reportUsersData.reduce((sum, user) => sum + (user.ClosedTickets || 0), 0);

            summaryData = [
                { label: 'Total Users', value: totalUsers },
                { label: 'Total Tickets', value: totalTickets },
                { label: 'Open Tickets', value: openTickets },
                { label: 'Resolved Tickets', value: resolvedTickets },
                { label: 'Closed Tickets', value: closedTickets }
            ];
        } else {
            // Ticket summary stats
            const totalTickets = reportTickets.length;
            const openTickets = reportTickets.filter(ticket => ticket.Status === 'Open').length;
            const inProgressTickets = reportTickets.filter(ticket => ticket.Status === 'In Progress').length;
            const resolvedTickets = reportTickets.filter(ticket => ticket.Status === 'Resolved').length;
            const closedTickets = reportTickets.filter(ticket => ticket.Status === 'Closed').length;

            summaryData = [
                { label: 'Total Tickets', value: totalTickets },
                { label: 'Open', value: openTickets },
                { label: 'In Progress', value: inProgressTickets },
                { label: 'Resolved', value: resolvedTickets },
                { label: 'Closed', value: closedTickets }
            ];
        }

        // Display summary stats in a simple list
        let yPosition = 60;
        doc.setFontSize(10);

        summaryData.forEach((stat) => {
            doc.text(`${stat.label}: ${stat.value}`, 20, yPosition);
            yPosition += 6;
        });

        // Add content section
        doc.setFontSize(12);
        yPosition += 10;
        doc.text('Report Details', 20, yPosition);
        yPosition += 10;

        // Add ticket or user details
        doc.setFontSize(8);
        let currentY = yPosition;

        if (reportType.value === 'all') {
            // Users report
            reportUsersData.forEach((user) => {
                if (currentY > 270) {
                    doc.addPage();
                    currentY = 20;
                }

                const userText = [
                    `User: ${user.FullName} (${user.Username})`,
                    `Department: ${user.Department}`,
                    `Tickets: Total ${user.TotalTickets || 0} | Open ${user.OpenTickets || 0} | In Progress ${user.InProgressTickets || 0} | Resolved ${user.ResolvedTickets || 0} | Closed ${user.ClosedTickets || 0}`
                ];

                userText.forEach(line => {
                    if (currentY > 270) {
                        doc.addPage();
                        currentY = 20;
                    }
                    doc.text(line, 20, currentY);
                    currentY += 4;
                });
                currentY += 4; // Extra space between users
            });
        } else {
            // Tickets report
            reportTickets.forEach((ticket) => {
                if (currentY > 270) {
                    doc.addPage();
                    currentY = 20;
                }

                const submitDateTime = formatDateTimeForReport(ticket.SubmitDate);
                const resolvedDateTime = ticket.ResolvedDate ? formatDateTimeForReport(ticket.ResolvedDate) : 'Not resolved';
                const resolvedBy = ticket.ResolvedBy || 'N/A';

                const ticketText = [
                    `Ticket: ${ticket.TicketID} - ${ticket.Subject}`,
                    `Submitted: ${submitDateTime}`,
                    `Status: ${ticket.Status} | Priority: ${ticket.Priority} | Department: ${ticket.Department}`,
                    `Submitted by: ${ticket.Name || ticket.SubmittedBy} | Issue Type: ${ticket.IssueType}`,
                    `Resolved: ${resolvedDateTime} | By: ${resolvedBy}`,
                    `Description: ${ticket.Description.substring(0, 80)}${ticket.Description.length > 80 ? '...' : ''}`
                ];

                ticketText.forEach(line => {
                    doc.text(line, 20, currentY);
                    currentY += 4;
                });
                currentY += 6; // Extra space between tickets
            });
        }

        // Save the PDF
        const fileName = `IT_HelpDesk_Report_${new Date().getFullYear()}_${(new Date().getMonth() + 1).toString().padStart(2, '0')}_${new Date().getDate().toString().padStart(2, '0')}.pdf`;
        doc.save(fileName);

        showSuccessMessage('PDF exported successfully!');
    } catch (error) {
        console.error('Error exporting PDF:', error);
        showErrorMessage('Failed to export PDF: ' + error.message);
    } finally {
        setPDFLoading(false);
    }
}

/**
 * Sets PDF loading state
 * @param {boolean} loading - Loading state
 */
function setPDFLoading(loading) {
    const exportPDFBtn = document.getElementById('exportPDFBtn');
    if (!exportPDFBtn) return;

    if (loading) {
        exportPDFBtn.textContent = 'Exporting...';
        exportPDFBtn.disabled = true;
    } else {
        exportPDFBtn.textContent = 'Export as PDF';
        exportPDFBtn.disabled = false;
    }
}

// ============================================
// MESSAGE DISPLAY FUNCTIONS
// ============================================

/**
 * Shows success message
 * @param {string} message - Success message
 */
function showSuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    const successMessageText = document.getElementById('successMessageText');

    if (successMessage && successMessageText) {
        successMessageText.textContent = message;
        successMessage.classList.add('show');
        setTimeout(() => successMessage.classList.remove('show'), 3000);
    }
}

/**
 * Shows error message
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
    const successMessage = document.getElementById('successMessage');
    const successMessageText = document.getElementById('successMessageText');

    if (successMessage && successMessageText) {
        successMessageText.textContent = message;
        successMessage.classList.add('show');
        setTimeout(() => successMessage.classList.remove('show'), 3000);
    }
}

/**
 * Shows login error
 * @param {string} message - Error message
 */
function showLoginError(message) {
    const loginError = document.getElementById('loginError');
    if (loginError) {
        loginError.textContent = message;
        loginError.classList.remove('hidden');
    }
}

/**
 * Sets login loading state
 * @param {boolean} loading - Loading state
 */
function setLoginLoading(loading) {
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');

    if (loading) {
        if (loginBtnText) loginBtnText.textContent = 'Logging in...';
        if (loginSpinner) loginSpinner.classList.remove('hidden');
        if (loginBtn) loginBtn.disabled = true;
    } else {
        if (loginBtnText) loginBtnText.textContent = 'Login';
        if (loginSpinner) loginSpinner.classList.add('hidden');
        if (loginBtn) loginBtn.disabled = false;
    }
}

/**
 * Sets submit loading state
 * @param {boolean} loading - Loading state
 */
function setSubmitLoading(loading) {
    const submitTicketBtn = document.getElementById('submitTicketBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    const submitSpinner = document.getElementById('submitSpinner');

    if (loading) {
        if (submitBtnText) submitBtnText.textContent = 'Submitting...';
        if (submitSpinner) submitSpinner.classList.remove('hidden');
        if (submitTicketBtn) submitTicketBtn.disabled = true;
    } else {
        if (submitBtnText) submitBtnText.textContent = 'Submit Ticket';
        if (submitSpinner) submitSpinner.classList.add('hidden');
        if (submitTicketBtn) submitTicketBtn.disabled = false;
    }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the app
 */
async function initializeApp() {
    applyTheme();
    loadNotificationSettings();
 
    // Load and display app version
    try {
        const version = await window.electronAPI.getAppVersion();
        const versionElement = document.getElementById('appVersion');
        if (versionElement) {
            versionElement.textContent = `v${version}`;
        }
    } catch (error) {
        console.error('Error loading app version:', error);
    }

    // Load on-call schedule from database
    try {
        const result = await window.electronAPI.getOnCallSchedule();
        if (result.success) {
            onCallStaff = result.data.schedule;
            rotationStartWeek = result.data.startWeek;
        } else {
            console.error("Failed to load on-call schedule:", result.error);
        }
    } catch (error) {
        console.error("Error loading on-call schedule:", error);
    }

    requestNotificationPermission();

    // Check if user is already logged in (e.g., after page refresh)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('Restoring user session:', currentUser.username);
            // Restore the app content with the logged-in user
            await showAppContent();
            await loadDepartments();
            await loadTickets();
            initializeAutoRefresh();
        } catch (error) {
            console.error('Error restoring user session:', error);
            showLoginContent();
        }
    } else {
        // Show login screen if no saved user
        // The "Remember Me" feature will only pre-fill the username
        showLoginContent();
    }

    const sidebarHidden = localStorage.getItem('sidebarHidden') === 'true';
    const sidebar = document.getElementById('sidebar');
    const reopenBtn = document.getElementById('reopenBtn');

    if (sidebarHidden && sidebar && reopenBtn) {
        sidebar.style.display = 'none';
        reopenBtn.classList.add('visible');
    }

    selectCurrentThemeSwatches();

    // Setup auto-update listeners
    setupAutoUpdateListeners();
}

// ============================================
// AUTO-UPDATE FUNCTIONALITY
// ============================================

function setupAutoUpdateListeners() {
    // Listen for update available
    window.electronAPI.onUpdateAvailable((event, version) => {
        showUpdateNotification('update-available', version);
    });

    // Listen for download progress
    window.electronAPI.onDownloadProgress((event, progressObj) => {
        updateDownloadProgress(progressObj);
    });

    // Listen for update downloaded
    window.electronAPI.onUpdateDownloaded((event, version) => {
        showUpdateNotification('update-downloaded', version);
    });
}

function showUpdateNotification(type, version) {
    const existingNotif = document.getElementById('update-notification');
    if (existingNotif) {
        existingNotif.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 2px solid var(--primary-color);
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 350px;
        animation: slideIn 0.3s ease-out;
    `;

    if (type === 'update-available') {
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <h3 style="margin: 0; font-size: 16px; color: var(--primary-color);">New Version Available!</h3>
            </div>
            <p style="margin: 0 0 15px 0; color: #666;">Version ${version} is ready to download.</p>
            <div style="display: flex; gap: 10px;">
                <button onclick="downloadUpdate()" style="flex: 1; padding: 8px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                    Download
                </button>
                <button onclick="closeUpdateNotification()" style="flex: 1; padding: 8px; background: #e5e7eb; color: #374151; border: none; border-radius: 4px; cursor: pointer;">
                    Later
                </button>
            </div>
        `;
    } else if (type === 'update-downloaded') {
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h3 style="margin: 0; font-size: 16px; color: var(--success-color);">Update Ready!</h3>
            </div>
            <p style="margin: 0 0 15px 0; color: #666;">Version ${version} has been downloaded. Restart to install.</p>
            <div style="display: flex; gap: 10px;">
                <button onclick="installUpdate()" style="flex: 1; padding: 8px; background: var(--success-color); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
                    Restart Now
                </button>
                <button onclick="closeUpdateNotification()" style="flex: 1; padding: 8px; background: #e5e7eb; color: #374151; border: none; border-radius: 4px; cursor: pointer;">
                    Later
                </button>
            </div>
        `;
    }

    document.body.appendChild(notification);
}

function updateDownloadProgress(progressObj) {
    const notification = document.getElementById('update-notification');
    if (notification) {
        const percent = Math.round(progressObj.percent);
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <h3 style="margin: 0; font-size: 16px; color: var(--primary-color);">Downloading Update...</h3>
            </div>
            <div style="margin-bottom: 8px;">
                <div style="background: #e5e7eb; border-radius: 4px; overflow: hidden; height: 8px;">
                    <div style="background: var(--primary-color); height: 100%; width: ${percent}%; transition: width 0.3s;"></div>
                </div>
            </div>
            <p style="margin: 0; color: #666; font-size: 14px;">${percent}% complete</p>
        `;
    }
}

async function downloadUpdate() {
    const result = await window.electronAPI.downloadUpdate();
    if (!result.success) {
        alert('Failed to download update: ' + result.error);
    }
}

function installUpdate() {
    window.electronAPI.installUpdate();
}

function closeUpdateNotification() {
    const notification = document.getElementById('update-notification');
    if (notification) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
