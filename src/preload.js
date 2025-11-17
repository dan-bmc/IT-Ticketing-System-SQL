const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {

    // Window control
    showWindow: () => ipcRenderer.invoke('show-window'),
    hideWindow: () => ipcRenderer.invoke('hide-window'),
    minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),

    
    
   getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
   getTicketDuration: (ticketId) => ipcRenderer.invoke('get-ticket-duration', ticketId),
    // Database operations
    connectToDatabase: () => ipcRenderer.invoke('connect-to-database'),
    executeQuery: (query) => ipcRenderer.invoke('execute-query', query),
    disconnectDatabase: () => ipcRenderer.invoke('disconnect-database'),
    
    // Authentication and ticket management
    authenticateUser: (username, password) => ipcRenderer.invoke('authenticate-user', username, password),
    getTickets: (filters) => ipcRenderer.invoke('get-tickets', filters),
    submitTicket: (ticketData) => ipcRenderer.invoke('submit-ticket', ticketData),
    updateTicket: (ticketId, status, resolvedBy) => ipcRenderer.invoke('update-ticket', ticketId, status, resolvedBy),
    deleteTicket: (ticketId) => ipcRenderer.invoke('delete-ticket', ticketId),
    getDepartments: () => ipcRenderer.invoke('get-departments'),
    addDepartment: (departmentName) => ipcRenderer.invoke('add-department', departmentName),
    deleteDepartment: (departmentName) => ipcRenderer.invoke('delete-department', departmentName),

    // User management
    addUser: (userData) => ipcRenderer.invoke('add-user', userData),
    getUsers: () => ipcRenderer.invoke('get-users'),
    updateUser: (userId, userData) => ipcRenderer.invoke('update-user', userId, userData),
    deleteUser: (userId) => ipcRenderer.invoke('delete-user', userId),

    // File operations for image upload
    selectImageFile: () => ipcRenderer.invoke('select-image-file'),  // Make sure this is selectImageFile (capital I)
    saveTicketImage: (imageData, ticketId) => ipcRenderer.invoke('save-ticket-image', imageData, ticketId),
    getTicketImage: (ticketId) => ipcRenderer.invoke('get-ticket-image', ticketId),

    // Refresh and auto-update functionality
    startAutoRefresh: (interval) => ipcRenderer.invoke('start-auto-refresh', interval),
    stopAutoRefresh: () => ipcRenderer.invoke('stop-auto-refresh'),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    installUpdate: () => ipcRenderer.invoke('install-update'),
    
    // Event listeners for auto-updates
    onTicketsUpdated: (callback) => ipcRenderer.on('tickets-updated', callback),
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

    getTicketTimeline: (ticketId) => ipcRenderer.invoke('get-ticket-timeline', ticketId),

    

    

    // App control
    closeApp: () => ipcRenderer.invoke('close-app'),

        // Notification and tray functionality
    checkNewTickets: () => ipcRenderer.invoke('check-new-tickets'),
    
    // Event listeners
    onFocusNewTicket: (callback) => ipcRenderer.on('focus-new-ticket', callback),
    onFocusTicketsTab: (callback) => ipcRenderer.on('focus-tickets-tab', callback),
    
    // Remove listeners
    removeFocusListeners: () => { ipcRenderer.removeAllListeners('focus-new-ticket'); ipcRenderer.removeAllListeners('focus-tickets-tab'); },

    // On-Call Schedule
    getOnCallSchedule: () => ipcRenderer.invoke('get-on-call-schedule'),
    updateOnCallSchedule: (schedule, startWeek) => ipcRenderer.invoke('update-on-call-schedule', schedule, startWeek),

    // Theme Management - DISABLED: Themes are now stored per-PC in localStorage
    /*
    getThemeSettings: async () => {
        const response = await ipcRenderer.invoke('get-theme-settings');
        return response.success ? response.data : null;
    },
    saveThemeSettings: async (theme) => {
        const response = await ipcRenderer.invoke('save-theme-settings', theme);
        return response.success;
    },
    */
    
    // WhatsApp Settings
    getWhatsAppSettings: async () => {
        const response = await ipcRenderer.invoke('get-whatsapp-settings');
        return response.success ? response.data : null;
    },
    saveWhatsAppSettings: async (settings) => {
        const response = await ipcRenderer.invoke('save-whatsapp-settings', settings);
        return response.success;
    },
    testWhatsAppConnection: async (apiKey, phoneNumber) => {
        return await ipcRenderer.invoke('test-whatsapp-connection', apiKey, phoneNumber);
    },
    
    // App Data Management
    clearAppData: async () => {
        const response = await ipcRenderer.invoke('clear-app-data');
        return response.success;
    },

    // Get app version
    getAppVersion: () => ipcRenderer.invoke('get-app-version')
});