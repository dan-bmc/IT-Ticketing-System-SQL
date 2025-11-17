// ============================================================================
// IMPORTS AND DEPENDENCIES
// ============================================================================
const { app, BrowserWindow, ipcMain, screen, dialog, Tray, Menu, Notification } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const sql = require('mssql');
const fs = require('fs').promises;
const fsSync = require('fs');
const os = require('os');
const { networkInterfaces } = require('os');

// ============================================================================
// APPLICATION CONFIGURATION
// ============================================================================
app.setAppUserModelId('IT Help Desk');

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'dan-bmc',
    repo: 'IT-Ticketing-System-SQL'
});

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    if (mainWindow) {
        mainWindow.webContents.send('update-available', info.version);
    }
});

autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available. Current version:', info.version);
    if (mainWindow) {
        mainWindow.webContents.send('update-not-available', info.version);
    }
});

autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
    if (mainWindow) {
        mainWindow.webContents.send('download-progress', progressObj);
    }
});

autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded');
    if (mainWindow) {
        mainWindow.webContents.send('update-downloaded', info.version);
    }
});


// SQL Server configuration
const dbConfig = {
    server: '192.168.1.253',
    port: 1433,
    database: 'ITHELPDESK',
    user: 'bmc',
    password: 'Bmcbtu123!@#',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 30000
    }
};

// Images directory configuration
const imagesDir = path.join('\\\\192.168.1.254\\Users\\Public\\it helpdesk');
if (!fsSync.existsSync(imagesDir)) {
    fsSync.mkdirSync(imagesDir, { recursive: true });
}

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================
let mainWindow;
let tray = null;
let isQuitting = false;
let refreshInterval = null;
let lastTicketCount = 0;
let lastTicketHash = '';
let notificationCooldown = new Set();
const NOTIFICATION_COOLDOWN_TIME = 5000; // 5 seconds cooldown

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================

/**
 * Initialize theme settings table in the database
 * DISABLED: Themes are now stored per-PC in localStorage to prevent sharing across installations
 */
/*
async function initializeThemeTable() {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ThemeSettings')
            BEGIN
                CREATE TABLE ThemeSettings (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    primaryColor NVARCHAR(50),
                    primaryHover NVARCHAR(50),
                    secondaryColor NVARCHAR(50),
                    successColor NVARCHAR(50),
                    themeMode NVARCHAR(20),
                    lastUpdated DATETIME DEFAULT GETDATE()
                )
                INSERT INTO ThemeSettings (primaryColor, primaryHover, secondaryColor, successColor, themeMode)
                VALUES ('#4f46e5', '#4338ca', '#7c3aed', '#10b981', 'light')
            END
        `);
    } catch (error) {
        console.error('Error initializing theme table:', error);
    }
}
*/

/**
 * Save theme settings to the database
 * DISABLED: Themes are now stored per-PC in localStorage to prevent sharing across installations
 */
/*
async function saveThemeSettings(theme) {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('primaryColor', sql.NVarChar, theme.primaryColor)
            .input('primaryHover', sql.NVarChar, theme.primaryHover)
            .input('secondaryColor', sql.NVarChar, theme.secondaryColor)
            .input('successColor', sql.NVarChar, theme.successColor)
            .input('themeMode', sql.NVarChar, theme.themeMode || 'light')
            .query(`
                UPDATE ThemeSettings SET
                    primaryColor = @primaryColor,
                    primaryHover = @primaryHover,
                    secondaryColor = @secondaryColor,
                    successColor = @successColor,
                    themeMode = @themeMode,
                    lastUpdated = GETDATE()
            `);
        return true;
    } catch (error) {
        console.error('Error saving theme settings:', error);
        throw error;
    }
}
*/

/**
 * Get theme settings from the database
 * DISABLED: Themes are now stored per-PC in localStorage to prevent sharing across installations
 */
/*
async function getThemeSettings() {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT TOP 1 primaryColor, primaryHover, secondaryColor, successColor, themeMode
            FROM ThemeSettings
        `);
        return result.recordset[0];
    } catch (error) {
        console.error('Error getting theme settings:', error);
        return null;
    }
}
*/

/**
 * Initialize WhatsApp API settings table in the database
 */
async function initializeWhatsAppSettingsTable() {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WhatsAppSettings')
            BEGIN
                CREATE TABLE WhatsAppSettings (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    apiKey NVARCHAR(500),
                    phoneNumber NVARCHAR(50),
                    lastUpdated DATETIME DEFAULT GETDATE()
                )
                INSERT INTO WhatsAppSettings (apiKey, phoneNumber)
                VALUES ('85e5d75676db4abb4fee2d08afed4b270e1c710cc920f015f535323e01b98066', '60149431803')
            END
        `);
    } catch (error) {
        console.error('Error initializing WhatsApp settings table:', error);
    }
}

/**
 * Save WhatsApp API settings to the database
 */
async function saveWhatsAppSettings(settings) {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('apiKey', sql.NVarChar, settings.apiKey)
            .input('phoneNumber', sql.NVarChar, settings.phoneNumber)
            .query(`
                UPDATE WhatsAppSettings SET
                    apiKey = @apiKey,
                    phoneNumber = @phoneNumber,
                    lastUpdated = GETDATE()
            `);
        return true;
    } catch (error) {
        console.error('Error saving WhatsApp settings:', error);
        throw error;
    }
}

/**
 * Get WhatsApp API settings from the database
 */
async function getWhatsAppSettings() {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT TOP 1 apiKey, phoneNumber
            FROM WhatsAppSettings
        `);
        return result.recordset[0];
    } catch (error) {
        console.error('Error getting WhatsApp settings:', error);
        return null;
    }
}

// ============================================================================
// WINDOW MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Creates and configures the main application window
 */
async function createWindow() {
    const existingWindows = BrowserWindow.getAllWindows();
    existingWindows.forEach(win => {
        if (!win.isDestroyed()) {
            win.destroy();
        }
    });

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const windowWidth = 370;

    mainWindow = new BrowserWindow({
        width: windowWidth,
        height: 800,
        x: screenWidth - windowWidth,
        y: 0,
        resizable: false,
        frame: false,
        autoHideMenuBar: true,
        show: false,
        skipTaskbar: true,
        icon: path.join(__dirname, 'assets', 'chat.png'),
        title: 'IT Help Desk',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // DO NOT clear storage data - we need to preserve localStorage for "Remember Me" functionality
    // mainWindow.webContents.session.clearStorageData();
    mainWindow.loadFile('src/renderer/index.html');

    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        `).then(() => {
            const workAreaHeight = primaryDisplay.workAreaSize.height;
            const contentHeight = workAreaHeight;
            
            mainWindow.setBounds({
                width: windowWidth,
                height: contentHeight,
                x: screenWidth - windowWidth,
                y: 0
            });
        });
    });

    mainWindow.on('minimize', (event) => {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            // Clear user session before hiding
            if (mainWindow && mainWindow.webContents) {
                mainWindow.webContents.executeJavaScript(`
                    localStorage.removeItem('currentUser');
                `).catch(err => console.error('Error clearing session:', err));
            }
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

/**
 * Shows and focuses the main window
 */
function showWindow() {
    if (mainWindow) {
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width: screenWidth } = primaryDisplay.workAreaSize;
        const windowWidth = 370;
        const workAreaHeight = primaryDisplay.workAreaSize.height;
        
        mainWindow.setBounds({
            x: screenWidth - windowWidth,
            y: 0,
            width: windowWidth,
            height: workAreaHeight
        });

        mainWindow.show();
        mainWindow.focus();
        
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.setAlwaysOnTop(true);
        mainWindow.focus();
        setTimeout(() => {
            mainWindow.setAlwaysOnTop(false);
        }, 100);
    }
}

/**
 * Hides the main window
 */
function hideWindow() {
    if (mainWindow) {
        mainWindow.hide();
    }
}

/**
 * Toggles window visibility
 */
function toggleWindow() {
    if (mainWindow) {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            showWindow();
        }
    }
}

// ============================================================================
// TRAY MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Creates and configures the system tray icon and menu
 */
function createTray() {
    const iconPath = path.join(__dirname, 'assets', 'chat.png');
    
    let trayIcon;
    try {
        if (fsSync.existsSync(iconPath)) {
            trayIcon = iconPath;
        } else {
            if (process.platform === 'win32') {
                trayIcon = path.join(__dirname, 'assets', 'chat1.ico');
            } else if (process.platform === 'darwin') {
                trayIcon = path.join(__dirname, 'assets', 'chat1.icns');
            } else {
                trayIcon = path.join(__dirname, 'assets', 'chat1.png');
            }
        }
    } catch (error) {
        trayIcon = null;
    }

    tray = new Tray(trayIcon || path.join(__dirname, 'assets', 'icon1.png'));
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Help Desk',
            click: () => {
                showWindow();
            }
        },
        {
            label: 'New Ticket',
            click: () => {
                showWindow();
                if (mainWindow) {
                    mainWindow.webContents.send('focus-new-ticket');
                }
            }
        },
        {
            label: 'View Tickets',
            click: () => {
                showWindow();
                if (mainWindow) {
                    mainWindow.webContents.send('focus-tickets-tab');
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Check for Updates',
            click: async () => {
                try {
                    const hasUpdates = await checkForTicketUpdates();
                    if (hasUpdates) {
                        if (mainWindow) {
                            mainWindow.webContents.send('tickets-updated');
                        }
                        const notification = new Notification('IT Help Desk', {
                            body: 'Ticket list updated',
                            icon: path.join(__dirname, 'assets', 'chat.png'),
                            silent: true
                        });
                        setTimeout(() => notification.close(), 2000);
                    }
                } catch (err) {
                    console.error('Error checking updates:', err);
                }
            }
        },
        {
            label: 'Check for App Updates',
            click: async () => {
                if (process.argv.includes('--dev')) {
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'Updates Disabled',
                        message: 'Auto-updates are disabled in development mode.',
                        buttons: ['OK']
                    });
                    return;
                }
                
                // Show initial dialog
                const checkingDialog = dialog.showMessageBox({
                    type: 'info',
                    title: 'Checking for Updates',
                    message: 'Checking for updates, please wait...',
                    buttons: [],
                    defaultId: -1
                });
                
                try {
                    const result = await autoUpdater.checkForUpdates();
                    
                    // Close the checking dialog
                    checkingDialog.then(() => {});
                    
                    if (result && result.updateInfo) {
                        const currentVersion = app.getVersion();
                        const latestVersion = result.updateInfo.version;
                        
                        if (currentVersion === latestVersion) {
                            await dialog.showMessageBox({
                                type: 'info',
                                title: 'No Updates Available',
                                message: `You are running the latest version (v${currentVersion}).`,
                                buttons: ['OK']
                            });
                        }
                        // If there's an update, the update-available event will handle it
                    } else {
                        await dialog.showMessageBox({
                            type: 'info',
                            title: 'No Updates Available',
                            message: 'You are running the latest version.',
                            buttons: ['OK']
                        });
                    }
                } catch (err) {
                    console.error('Error checking for app updates:', err);
                    await dialog.showMessageBox({
                        type: 'error',
                        title: 'Update Check Failed',
                        message: `Failed to check for updates: ${err.message}`,
                        buttons: ['OK']
                    });
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('IT Help Desk - Click to show/hide');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        toggleWindow();
    });

    tray.on('double-click', () => {
        showWindow();
    });

    tray.on('right-click', () => {
        tray.popUpContextMenu();
    });
}

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================

/**
 * Tests database connection
 */
async function testDatabaseConnection() {
    try {
        await sql.connect(dbConfig);
        console.log('Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

/**
 * Initializes the ticket state for change detection
 */
async function initializeTicketState() {
    try {
        const query = `
            SELECT 
                COUNT(*) as ticketCount,
                MAX(SubmitDate) as latestDate,
                CHECKSUM_AGG(BINARY_CHECKSUM(*)) as ticketHash
            FROM Tickets
        `;
        const result = await sql.query(query);
        
        if (result.recordset.length > 0) {
            lastTicketCount = result.recordset[0].ticketCount;
            lastTicketHash = result.recordset[0].ticketHash?.toString() || '';
            console.log('Ticket state initialized:', { lastTicketCount, lastTicketHash });
        }
    } catch (err) {
        console.error('Error initializing ticket state:', err);
    }
}

/**
 * Checks for new or updated tickets
 */
async function checkForTicketUpdates() {
    try {
        const query = `
            SELECT 
                COUNT(*) as currentCount,
                MAX(SubmitDate) as latestDate,
                CHECKSUM_AGG(BINARY_CHECKSUM(*)) as currentHash
            FROM Tickets
        `;
        const result = await sql.query(query);
        
        if (result.recordset.length > 0) {
            const currentCount = result.recordset[0].currentCount;
            const currentHash = result.recordset[0].currentHash?.toString() || '';
            
            const countChanged = currentCount !== lastTicketCount;
            const hashChanged = currentHash !== lastTicketHash;
            
            console.log('Update check - Current count:', currentCount, 'Last count:', lastTicketCount, 'Count changed:', countChanged, 'Hash changed:', hashChanged);
            
            if (countChanged || hashChanged) {
                // Get new tickets for notifications
                if (countChanged && currentCount > lastTicketCount) {
                    const newTicketsQuery = `
                        SELECT TOP ${currentCount - lastTicketCount} 
                            TicketID, Subject, Name, Department, SubmitDate
                        FROM Tickets 
                        ORDER BY SubmitDate DESC
                    `;
                    const newTicketsResult = await sql.query(newTicketsQuery);
                    
                    // Show notifications for new tickets
                    newTicketsResult.recordset.forEach(ticket => {
                        showNewTicketNotification(ticket);
                    });
                }
                
                console.log('Changes detected - updating ticket state');
                lastTicketCount = currentCount;
                lastTicketHash = currentHash;
                return true;
            }
        }
        
        return false;
    } catch (err) {
        console.error('Error checking for ticket updates:', err);
        return false;
    }
}

/**
 * Initializes the auto-refresh system
 */
async function initializeAutoRefresh() {
    try {
        await initializeTicketState();
        console.log('Auto-refresh system initialized');
    } catch (err) {
        console.error('Error initializing auto-refresh:', err);
    }
}

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Shows notification for new tickets
 */
function showNewTicketNotification(ticketData) {
    if (!ticketData || notificationCooldown.has(ticketData.TicketID)) {
        return;
    }

    // Add to cooldown to prevent duplicate notifications
    notificationCooldown.add(ticketData.TicketID);
    setTimeout(() => {
        notificationCooldown.delete(ticketData.TicketID);
    }, NOTIFICATION_COOLDOWN_TIME);

    // Create notification
    const notification = new Notification('New IT Help Desk Ticket', {
        body: `Ticket #${ticketData.TicketID}: ${ticketData.Subject}\nFrom: ${ticketData.Name} (${ticketData.Department})`,
        icon: path.join(__dirname, 'assets', 'chat.png'),
        silent: false
    });

    // Flash taskbar on Windows
    if (process.platform === 'win32' && mainWindow && !mainWindow.isFocused()) {
        mainWindow.flashFrame(true);
        
        // Stop flashing when window is focused
        mainWindow.once('focus', () => {
            mainWindow.flashFrame(false);
        });
    }

    // Handle notification click
    notification.onclick = () => {
        showWindow();
        if (mainWindow) {
            mainWindow.webContents.send('focus-tickets-tab');
        }
    };

    // Auto-close notification after 8 seconds
    setTimeout(() => {
        notification.close();
    }, 8000);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets MIME type from file extension
 */
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp'
    };
    return mimeTypes[ext] || 'image/jpeg';
}

/**
 * Fallback method to get IP address using system commands
 */
function getFallbackIP() {
    return new Promise((resolve) => {
        const { exec } = require('child_process');
        
        const commands = [
            'ipconfig',
            'ifconfig',
            'hostname -I'
        ];
        
        exec(commands[0], (error, stdout, stderr) => {
            if (!error) {
                const lines = stdout.split('\n');
                for (let line of lines) {
                    if (line.includes('IPv4 Address') || line.includes('IP Address')) {
                        const match = line.match(/(\d+\.\d+\.\d+\.\d+)/);
                        if (match) {
                            resolve(match[1]);
                            return;
                        }
                    }
                }
            }
            resolve('Unknown');
        });
    });
}

/**
 * Get current on-call person based on rotation schedule
 */
async function getCurrentOnCallPerson() {
    try {
        const scheduleResult = await sql.query('SELECT * FROM OnCallSchedule ORDER BY RotationOrder ASC');
        const settingsResult = await sql.query("SELECT SettingValue FROM ApplicationSettings WHERE SettingKey = 'rotationStartWeek'");
        
        const schedule = scheduleResult.recordset;
        if (schedule.length === 0) {
            return null;
        }
        
        const startWeek = settingsResult.recordset.length > 0 ? parseInt(settingsResult.recordset[0].SettingValue, 10) : 1;
        
        // Calculate current week of year
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now - start;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        const weekOfYear = Math.floor(diff / oneWeek) + 1;
        
        // Calculate which person is on call
        const weeksElapsed = weekOfYear - startWeek;
        const currentIndex = weeksElapsed % schedule.length;
        const onCallPerson = schedule[currentIndex >= 0 ? currentIndex : schedule.length + currentIndex];
        
        return onCallPerson;
    } catch (error) {
        console.error('Error getting on-call person:', error);
        return null;
    }
}

/**
 * Send ticket details to on-call person via WhatsApp
 */
async function sendTicketToOnCallWhatsApp(ticketData) {
    try {
        const onCallPerson = await getCurrentOnCallPerson();
        
        if (!onCallPerson || !onCallPerson.Whatsapp) {
            console.log('No on-call person found or WhatsApp number not available');
            return;
        }
        
        // Format the message
        const message = `🎫 *New IT Support Ticket*

*Ticket ID:* ${ticketData.id}
*From:* ${ticketData.name}
*Department:* ${ticketData.department}
*Priority:* ${ticketData.priority}
*Issue Type:* ${ticketData.issueType}

*Subject:* ${ticketData.subject}
*Description:* ${ticketData.description}

*PC Name:* ${ticketData.pcName}
*IP Address:* ${ticketData.ipAddress}
*Submitted by:* ${ticketData.submittedBy}`;
        
        const whatsappNumber = onCallPerson.Whatsapp.replace(/[^0-9+]/g, ''); // Keep + for international format
        
        // Get WhatsApp settings from database
        const whatsappSettings = await getWhatsAppSettings();
        const apiKey = whatsappSettings?.apiKey || '85e5d75676db4abb4fee2d08afed4b270e1c710cc920f015f535323e01b98066';
        
        // Send via WA Sender API
        const https = require('https');
        const apiUrl = 'https://wasenderapi.com/api/send-message';
        
        const postData = JSON.stringify({
            to: whatsappNumber,
            text: message
        });
        
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        return new Promise((resolve, reject) => {
            const req = https.request(apiUrl, options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log(`Ticket sent to on-call person: ${onCallPerson.StaffName} (${onCallPerson.Whatsapp})`);
                        console.log('WA Sender API Response:', responseData);
                        resolve(responseData);
                    } else {
                        console.error('WA Sender API Error:', res.statusCode, responseData);
                        reject(new Error(`API returned status ${res.statusCode}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error('Error sending to WA Sender API:', error);
                reject(error);
            });
            
            req.write(postData);
            req.end();
        });
        
    } catch (error) {
        console.error('Error sending ticket to WhatsApp:', error);
        throw error;
    }
}

// ============================================================================
// IPC HANDLERS - WINDOW CONTROL
// ============================================================================

ipcMain.handle('show-window', () => {
    showWindow();
    return { success: true };
});

ipcMain.handle('hide-window', () => {
    hideWindow();
    return { success: true };
});

ipcMain.handle('minimize-to-tray', () => {
    hideWindow();
    return { success: true };
});

ipcMain.on('focus-new-ticket', () => {
    if (mainWindow) {
        showWindow();
    }
});

// ============================================================================
// IPC HANDLERS - DATABASE CONNECTION
// ============================================================================

ipcMain.handle('connect-to-database', async () => {
    try {
        await sql.connect(dbConfig);
        return { success: true, message: 'Connected to SQL Server successfully' };
    } catch (err) {
        return { success: false, message: err.message };
    }
});

ipcMain.handle('disconnect-database', async () => {
    try {
        await sql.close();
        return { success: true, message: 'Disconnected successfully' };
    } catch (err) {
        return { success: false, message: err.message };
    }
});

ipcMain.handle('execute-query', async (event, query) => {
    try {
        const lowerQuery = query.toLowerCase();
        const dangerousKeywords = ['drop ', 'delete ', 'insert ', 'update ', 'alter ', 'truncate ', 'create ', 'exec ', 'execute '];
        
        if (dangerousKeywords.some(keyword => lowerQuery.includes(keyword))) {
            return { success: false, error: 'Potentially dangerous query blocked' };
        }

        const result = await sql.query(query);
        return { success: true, data: result.recordset };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ============================================================================
// IPC HANDLERS - USER MANAGEMENT
// ============================================================================

ipcMain.handle('authenticate-user', async (event, username, password) => {
    try {
        const query = `
            SELECT Username, FullName, Department, Role 
            FROM Users 
            WHERE Username = '${username}' 
                AND Password = '${password}' 
                AND IsActive = 1
        `;
        
        const result = await sql.query(query);
        
        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            return { 
                success: true, 
                user: {
                    username: user.Username,
                    fullName: user.FullName,
                    department: user.Department,
                    role: user.Role
                }
            };
        } else {
            return { success: false, error: 'Invalid username or password' };
        }
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('get-users', async () => {
    try {
        const query = `SELECT ID, Username, FullName, Department, Role, IsActive FROM Users ORDER BY Username`;
        const result = await sql.query(query);
        return { success: true, data: result.recordset };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('add-user', async (event, userData) => {
    try {
        const checkQuery = `SELECT COUNT(*) as count FROM Users WHERE Username = '${userData.username}'`;
        const checkResult = await sql.query(checkQuery);
        
        if (checkResult.recordset[0].count > 0) {
            return { success: false, error: 'Username already exists' };
        }

        const query = `
            INSERT INTO Users (Username, Password, FullName, Department, Role, IsActive)
            VALUES ('${userData.username}', '${userData.password}', '${userData.fullName}', 
                    '${userData.department}', '${userData.role}', 1)
        `;
        
        await sql.query(query);
        return { success: true, message: 'User added successfully' };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('update-user', async (event, userId, userData) => {
    try {
        const updates = [];
        if (userData.fullName) {
            updates.push(`FullName = '${userData.fullName}'`);
        }
        if (userData.department) {
            updates.push(`Department = '${userData.department}'`);
        }
        if (userData.role) {
            updates.push(`Role = '${userData.role}'`);
        }
        if (typeof userData.isActive !== 'undefined') {
            updates.push(`IsActive = ${userData.isActive ? 1 : 0}`);
        }

        if (updates.length > 0) {
            const query = `UPDATE Users SET ${updates.join(', ')} WHERE ID = ${userId}`;
            await sql.query(query);
        }

        return { success: true, message: 'User updated successfully' };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('delete-user', async (event, userId) => {
    try {
        const currentUserQuery = `SELECT Username FROM Users WHERE ID = ${userId}`;
        const currentUserResult = await sql.query(currentUserQuery);
        
        if (currentUserResult.recordset.length > 0) {
            const query = `DELETE FROM Users WHERE ID = ${userId}`;
            await sql.query(query);
            return { success: true, message: 'User deleted successfully' };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ============================================================================
// IPC HANDLERS - TICKET MANAGEMENT
// ============================================================================

// Auto-updater IPC handlers
ipcMain.handle('download-update', async () => {
    try {
        await autoUpdater.downloadUpdate();
        return { success: true };
    } catch (error) {
        console.error('Error downloading update:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('check-for-updates', async () => {
    try {
        const result = await autoUpdater.checkForUpdates();
        return { success: true, updateInfo: result };
    } catch (error) {
        console.error('Error checking for updates:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-tickets', async (event, filters = {}) => {
    try {
        let query = `
            SELECT 
                *
            FROM Tickets 
            WHERE 1=1`;
        
        // Apply department filter for all roles
        if (filters.department && filters.department !== 'all') {
            query += ` AND Department = '${filters.department}'`;
        }
        
        // For Staff users, always filter by their department regardless of the filter selection
        if (filters.userRole === 'Staff') {
            query += ` AND Department = '${filters.userDepartment}'`;
        }
        
        if (filters.status && filters.status !== 'all') {
            query += ` AND Status = '${filters.status}'`;
        }
        
        query += ` ORDER BY SubmitDate DESC`;
        
        console.log('Executing query:', query);
        const result = await sql.query(query);
        
        // Calculate duration in JavaScript (where we have timezone context)
        const tickets = result.recordset.map(ticket => {
            const submitDate = new Date(ticket.SubmitDate);
            const resolvedDate = ticket.ResolvedDate ? new Date(ticket.ResolvedDate) : new Date();
            const endDate = (ticket.Status === 'Resolved' || ticket.Status === 'Closed') ? resolvedDate : new Date();
            
            let durationMs = endDate - submitDate;
            
            // If duration is negative, use absolute value (shouldn't happen but safety check)
            if (durationMs < 0) {
                durationMs = Math.abs(durationMs);
            }
            
            const durationHours = durationMs / (1000 * 60 * 60);
            
            let durationFormatted;
            if (durationHours < 1) {
                const minutes = Math.floor(durationMs / (1000 * 60));
                durationFormatted = `${minutes}m`;
            } else if (durationHours < 24) {
                const hours = Math.floor(durationHours);
                const minutes = Math.floor((durationHours - hours) * 60);
                durationFormatted = `${hours}h ${minutes}m`;
            } else {
                const days = Math.floor(durationHours / 24);
                const hours = Math.floor(durationHours % 24);
                durationFormatted = `${days}d ${hours}h`;
            }
            
            // Check for overdue
            let isOverdue = 0;
            if (durationHours > 48 && (ticket.Status === 'Open' || ticket.Status === 'In Progress')) {
                isOverdue = 1;
            }
            
            return {
                ...ticket,
                DurationHours: durationHours,
                DurationFormatted: durationFormatted,
                IsOverdue: isOverdue
            };
        });
        
        return { success: true, data: tickets };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('submit-ticket', async (event, ticketData) => {
    try {
        // Use client's local time to avoid timezone issues
        const clientTime = new Date();
        const localDateString = clientTime.toISOString().slice(0, 19).replace('T', ' ');
        
        console.log('=== TICKET SUBMISSION DEBUG ===');
        console.log('Client Time (ISO):', clientTime.toISOString());
        console.log('Local Date String:', localDateString);
        console.log('Is On Call Submission:', ticketData.isOnCall);
        console.log('Ticket Data:', {
            pcName: ticketData.pcName,
            ipAddress: ticketData.ipAddress,
            id: ticketData.id
        });

        const query = `
            INSERT INTO Tickets (
                TicketID, Name, Department, Priority, IssueType, 
                Subject, Description, Restarted, Urgent, Status, 
                SubmitDate, SubmittedBy, UserRole, PCName, IPAddress
            ) VALUES (
                '${ticketData.id}', '${ticketData.name}', '${ticketData.department}', 
                '${ticketData.priority}', '${ticketData.issueType}', '${ticketData.subject}', 
                '${ticketData.description}', '${ticketData.restarted}', ${ticketData.urgent ? 1 : 0}, 
                '${ticketData.status}', '${localDateString}', '${ticketData.submittedBy}', 
                '${ticketData.userRole}', '${ticketData.pcName}', '${ticketData.ipAddress}'
            )
        `;
        
        const result = await sql.query(query);
        console.log('Ticket submitted with local time:', localDateString);
        
        // If it's an on-call submission, send to WhatsApp
        if (ticketData.isOnCall) {
            try {
                await sendTicketToOnCallWhatsApp(ticketData);
            } catch (whatsappError) {
                console.error('Error sending WhatsApp message:', whatsappError);
                // Don't fail the ticket submission if WhatsApp fails
            }
        }
        
        console.log('================================');
        return { success: true, ticketId: ticketData.id };
    } catch (err) {
        console.error('Error submitting ticket:', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('update-ticket', async (event, ticketId, status, resolvedBy = null) => {
    try {
        let query = `UPDATE Tickets SET Status = '${status}'`;

        if (status === 'Resolved') {
            const resolvedTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            query += `, ResolvedDate = '${resolvedTime}', ResolvedBy = '${resolvedBy}'`;
        } else if (status === 'Closed') {
            query += `, ClosedBy = '${resolvedBy}'`;
        } else {
            query += `, ResolvedDate = NULL, ResolvedBy = NULL, ClosedBy = NULL`;
        }
        query += ` WHERE TicketID = '${ticketId}'`;
        
        await sql.query(query);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('delete-ticket', async (event, ticketId) => {
    try {
        const query = `DELETE FROM Tickets WHERE TicketID = '${ticketId}'`;
        await sql.query(query);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('get-ticket-duration', async (event, ticketId) => {
    try {
        const query = `
            SELECT 
                SubmitDate,
                ResolvedDate,
                Status
            FROM Tickets 
            WHERE TicketID = '${ticketId}'
        `;
        
        const result = await sql.query(query);
        
        if (result.recordset.length === 0) {
            return { success: false, error: 'Ticket not found' };
        }
        
        const ticket = result.recordset[0];
        const submitDate = new Date(ticket.SubmitDate);
        const resolvedDate = ticket.ResolvedDate ? new Date(ticket.ResolvedDate) : new Date();
        const now = new Date();
        
        // Calculate duration in hours
        const endDate = ticket.Status === 'Resolved' || ticket.Status === 'Closed' ? resolvedDate : now;
        const durationMs = endDate - submitDate;
        const durationHours = durationMs / (1000 * 60 * 60);
        
        // Format duration for display
        let durationFormatted;
        let isOverdue = false;
        
        if (durationHours < 1) {
            const minutes = Math.floor(durationMs / (1000 * 60));
            durationFormatted = `${minutes}m`;
        } else if (durationHours < 24) {
            const hours = Math.floor(durationHours);
            const minutes = Math.floor((durationHours - hours) * 60);
            durationFormatted = `${hours}h ${minutes}m`;
        } else {
            const days = Math.floor(durationHours / 24);
            const hours = Math.floor(durationHours % 24);
            durationFormatted = `${days}d ${hours}h`;
            
            // Consider tickets overdue if open for more than 48 hours
            if (durationHours > 48 && (ticket.Status === 'Open' || ticket.Status === 'In Progress')) {
                isOverdue = true;
            }
        }
        
        return {
            success: true,
            data: {
                durationHours: durationHours,
                durationFormatted: durationFormatted,
                isOverdue: isOverdue
            }
        };
    } catch (err) {
        console.error('Error calculating ticket duration:', err);
        return { 
            success: false, 
            error: err.message,
            data: {
                durationHours: 0,
                durationFormatted: 'Error',
                isOverdue: false
            }
        };
    }
});

ipcMain.handle('get-ticket-timeline', async (event, ticketId) => {
    try {
        const query = `
            SELECT 
                TicketID,
                SubmitDate,
                ResolvedDate,
                ResolvedBy,
                ClosedBy,
                Status
            FROM Tickets 
            WHERE TicketID = '${ticketId}'
        `;
        
        const result = await sql.query(query);
        return { success: true, data: result.recordset[0] };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ============================================================================
// IPC HANDLERS - AUTO-REFRESH & UPDATES
// ============================================================================

ipcMain.handle('check-new-tickets', async () => {
    try {
        const hasUpdates = await checkForTicketUpdates();
        return { success: true, hasUpdates: hasUpdates };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('check-for-ticket-updates', async () => {
    try {
        const hasUpdates = await checkForTicketUpdates();
        return { success: true, hasUpdates: hasUpdates };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('start-auto-refresh', async (event, interval = 500) => {
    try {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        
        await initializeTicketState();
        
        refreshInterval = setInterval(async () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                try {
                    const hasUpdates = await checkForTicketUpdates();
                    if (hasUpdates) {
                        console.log('New tickets detected, sending update notification');
                        mainWindow.webContents.send('tickets-updated');
                        await initializeTicketState();
                    }
                } catch (err) {
                    console.error('Error in auto-refresh check:', err);
                }
            }
        }, interval);
        
        return { success: true, message: `Auto-refresh started every ${interval/1000} seconds` };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('stop-auto-refresh', async () => {
    try {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
        return { success: true, message: 'Auto-refresh stopped' };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ============================================================================
// IPC HANDLERS - FILE & IMAGE MANAGEMENT
// ============================================================================

ipcMain.handle('select-image-file', async () => {
    try {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                {
                    name: 'Images',
                    extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp']
                }
            ]
        });

        if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0];
            const imageBuffer = await fs.readFile(filePath);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = getMimeType(filePath);
            
            return {
                success: true,
                data: `data:${mimeType};base64,${base64Image}`,
                fileName: path.basename(filePath)
            };
        }
        
        return { success: false, error: 'No file selected' };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('save-ticket-image', async (event, imageData, ticketId) => {
    try {
        if (!imageData) {
            return { success: true, message: 'No image to save' };
        }

        const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return { success: false, error: 'Invalid image data' };
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const extension = mimeType.split('/')[1];
        const fileName = `${ticketId}.${extension}`;
        const filePath = path.join(imagesDir, fileName);

        await fs.writeFile(filePath, base64Data, 'base64');

        const query = `UPDATE Tickets SET ImageFileName = '${fileName}' WHERE TicketID = '${ticketId}'`;
        await sql.query(query);

        return { success: true, fileName: fileName };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('get-ticket-image', async (event, ticketId) => {
    try {
        const query = `SELECT ImageFileName FROM Tickets WHERE TicketID = '${ticketId}'`;
        const result = await sql.query(query);
        
        if (result.recordset.length === 0 || !result.recordset[0].ImageFileName) {
            return { success: false, error: 'No image found' };
        }

        const fileName = result.recordset[0].ImageFileName;
        const filePath = path.join(imagesDir, fileName);

        try {
            await fs.access(filePath);
        } catch {
            return { success: false, error: 'Image file not found' };
        }

        const imageBuffer = await fs.readFile(filePath);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = getMimeType(filePath);
        
        return {
            success: true,
            data: `data:${mimeType};base64,${base64Image}`,
            fileName: fileName
        };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ============================================================================
// IPC HANDLERS - SYSTEM INFORMATION
// ============================================================================

ipcMain.handle('get-app-version', async () => {
    return app.getVersion();
});

ipcMain.handle('get-system-info', async () => {
    try {
        const nets = networkInterfaces();
        let ipAddress = 'Unknown';
        
        console.log('Available network interfaces:');
        for (const name of Object.keys(nets)) {
            console.log(`Interface: ${name}`);
            for (const net of nets[name]) {
                console.log(`  Family: ${net.family}, Address: ${net.address}, Internal: ${net.internal}`);
                if (net.family === 'IPv4' && !net.internal) {
                    ipAddress = net.address;
                    console.log(`Selected IP: ${ipAddress} from interface ${name}`);
                    break;
                }
            }
            if (ipAddress !== 'Unknown') break;
        }

        const pcName = os.hostname();
        console.log(`PC Name: ${pcName}, IP Address: ${ipAddress}`);

        return {
            success: true,
            data: {
                pcName: pcName,
                ipAddress: ipAddress
            }
        };
    } catch (err) {
        console.error('Error getting system info:', err);
        return {
            success: false,
            error: err.message,
            data: {
                pcName: 'Unknown',
                ipAddress: 'Unknown'
            }
        };
    }
});

// ============================================================================
// IPC HANDLERS - DEPARTMENTS
// ============================================================================

ipcMain.handle('get-departments', async () => {
    try {
        const result = await sql.query('SELECT * FROM Departments ORDER BY DepartmentName');
        return { success: true, data: result.recordset };
    } catch (err) {
        return { 
            success: true, 
            data: [
                { DepartmentName: 'Finance' },
                { DepartmentName: 'Human Resources' },
                { DepartmentName: 'Marketing' },
                { DepartmentName: 'Operations' },
                { DepartmentName: 'Sales' },
                { DepartmentName: 'IT' },
                { DepartmentName: 'Other' }
            ]
        };
    }
});

ipcMain.handle('add-department', async (event, departmentName) => {
    try {
        const checkQuery = `SELECT COUNT(*) as count FROM Departments WHERE DepartmentName = '${departmentName}'`;
        const checkResult = await sql.query(checkQuery);

        if (checkResult.recordset[0].count > 0) {
            return { success: false, error: 'Department already exists' };
        }

        const query = `INSERT INTO Departments (DepartmentName) VALUES ('${departmentName}')`;
        await sql.query(query);
        return { success: true, message: 'Department added successfully' };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('delete-department', async (event, departmentName) => {
    try {
        const checkQuery = `SELECT COUNT(*) as count FROM Departments WHERE DepartmentName = '${departmentName}'`;
        const checkResult = await sql.query(checkQuery);

        if (checkResult.recordset[0].count === 0) {
            return { success: false, error: 'Department not found' };
        }

        const query = `DELETE FROM Departments WHERE DepartmentName = '${departmentName}'`;
        await sql.query(query);
        return { success: true, message: 'Department deleted successfully' };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ============================================================================
// IPC HANDLERS - REPORTS
// ============================================================================

ipcMain.handle('get-user-reports', async (event, userId, month, year, department = null, currentUserRole) => {
    try {
        let query = `
            SELECT 
                TicketID,
                Subject,
                Department,
                Priority,
                IssueType,
                Status,
                SubmitDate,
                Description,
                Name,
                SubmittedBy
            FROM Tickets 
            WHERE MONTH(SubmitDate) = ${month}
                AND YEAR(SubmitDate) = ${year}
        `;
        
        if (currentUserRole === 'Staff') {
            query += ` AND SubmittedBy = '${userId}'`;
        } else {
            if (department && department !== 'all') {
                query += ` AND Department = '${department}'`;
            }
        }
        
        query += ` ORDER BY SubmitDate DESC`;
        
        const result = await sql.query(query);
        return { success: true, data: result.recordset };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('get-department-tickets-report', async (event, month, year, department = null, currentUserRole) => {
    try {
        if (currentUserRole !== 'IT' && currentUserRole !== 'Admin') {
            return { success: false, error: 'Access denied. Department reports are only available for IT Support and Administrators.' };
        }
        
        let query = `
            SELECT 
                TicketID,
                Subject,
                Department,
                Priority,
                IssueType,
                Status,
                SubmitDate,
                Description,
                Name,
                SubmittedBy
            FROM Tickets 
            WHERE MONTH(SubmitDate) = ${month}
                AND YEAR(SubmitDate) = ${year}
        `;
        
        if (department && department !== 'all') {
            query += ` AND Department = '${department}'`;
        }
        
        query += ` ORDER BY Department, SubmitDate DESC`;
        
        const result = await sql.query(query);
        return { success: true, data: result.recordset };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('get-all-users-reports', async (event, month, year, department = null, currentUserRole) => {
    try {
        if (currentUserRole !== 'Admin') {
            return { success: false, error: 'Access denied. All users reports are only available for Administrators.' };
        }
        
        let query = `
            SELECT 
                u.Username,
                u.FullName,
                u.Department,
                COUNT(t.TicketID) as TotalTickets,
                SUM(CASE WHEN t.Status = 'Open' THEN 1 ELSE 0 END) as OpenTickets,
                SUM(CASE WHEN t.Status = 'In Progress' THEN 1 ELSE 0 END) as InProgressTickets,
                SUM(CASE WHEN t.Status = 'Resolved' THEN 1 ELSE 0 END) as ResolvedTickets,
                SUM(CASE WHEN t.Status = 'Closed' THEN 1 ELSE 0 END) as ClosedTickets
            FROM Users u
            LEFT JOIN Tickets t ON u.Username = t.SubmittedBy
                AND MONTH(t.SubmitDate) = ${month}
                AND YEAR(t.SubmitDate) = ${year}
        `;
        
        if (department && department !== 'all') {
            query += ` AND u.Department = '${department}'`;
        }
        
        query += ` 
            WHERE u.IsActive = 1
            GROUP BY u.Username, u.FullName, u.Department
            ORDER BY u.Department, u.FullName
        `;
        
        const result = await sql.query(query);
        return { success: true, data: result.recordset };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ============================================================================
// IPC HANDLERS - APPLICATION CONTROL
// ============================================================================

ipcMain.handle('close-app', async () => {
    try {
        await sql.close();
        console.log('Database connection closed');
        app.exit(0);
        return { success: true };
    } catch (err) {
        console.error('Error during app close:', err);
        app.exit(1);
        return { success: false, error: err.message };
    }
});

// ============================================================================
// IPC HANDLERS - ON-CALL SCHEDULE
// ============================================================================

ipcMain.handle('get-on-call-schedule', async () => {
    try {
        const scheduleResult = await sql.query('SELECT * FROM OnCallSchedule ORDER BY RotationOrder ASC');
        const settingsResult = await sql.query("SELECT SettingValue FROM ApplicationSettings WHERE SettingKey = 'rotationStartWeek'");

        const schedule = scheduleResult.recordset.map(row => ({
            name: row.StaffName,
            position: row.Position,
            whatsapp: row.Whatsapp,
            picture: row.Picture
        }));

        const startWeek = settingsResult.recordset.length > 0 ? parseInt(settingsResult.recordset[0].SettingValue, 10) : 1;

        return { success: true, data: { schedule, startWeek } };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('update-on-call-schedule', async (event, schedule, startWeek) => {
    try {
        const transaction = new sql.Transaction();
        await transaction.begin();

        try {
            // Clear existing schedule
            await transaction.request().query('DELETE FROM OnCallSchedule');

            // Insert new schedule order
            for (let i = 0; i < schedule.length; i++) {
                const staff = schedule[i];
                const request = new sql.Request(transaction);
                request.input('StaffName', sql.NVarChar, staff.name);
                request.input('Position', sql.NVarChar, staff.position);
                request.input('Whatsapp', sql.NVarChar, staff.whatsapp);
                request.input('Picture', sql.NVarChar, staff.picture);
                request.input('RotationOrder', sql.Int, i + 1);
                await request.query('INSERT INTO OnCallSchedule (StaffName, Position, Whatsapp, Picture, RotationOrder) VALUES (@StaffName, @Position, @Whatsapp, @Picture, @RotationOrder)');
            }

            // Update rotation start week
            const settingsRequest = new sql.Request(transaction);
            settingsRequest.input('SettingKey', sql.NVarChar, 'rotationStartWeek');
            settingsRequest.input('SettingValue', sql.NVarChar, startWeek.toString());
            await settingsRequest.query("UPDATE ApplicationSettings SET SettingValue = @SettingValue WHERE SettingKey = @SettingKey IF @@ROWCOUNT = 0 INSERT INTO ApplicationSettings (SettingKey, SettingValue) VALUES (@SettingKey, @SettingValue)");

            await transaction.commit();
            return { success: true };
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ============================================================================
// IPC HANDLERS - APP DATA MANAGEMENT
// ============================================================================

ipcMain.handle('clear-app-data', async () => {
    try {
        // Clear session storage
        if (mainWindow && mainWindow.webContents) {
            await mainWindow.webContents.session.clearStorageData({
                storages: ['localStorage', 'sessionStorage', 'cookies']
            });
        }
        
        // Restart the app
        app.relaunch();
        app.exit(0);
        
        return { success: true };
    } catch (err) {
        console.error('Error clearing app data:', err);
        return { success: false, error: err.message };
    }
});

// ============================================================================
// IPC HANDLERS - THEME MANAGEMENT
// DISABLED: Themes are now stored per-PC in localStorage to prevent sharing across installations
// ============================================================================

/*
ipcMain.handle('get-theme-settings', async () => {
    try {
        const theme = await getThemeSettings();
        return { success: true, data: theme };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('save-theme-settings', async (event, theme) => {
    try {
        await saveThemeSettings(theme);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});
*/

ipcMain.handle('get-whatsapp-settings', async () => {
    try {
        const settings = await getWhatsAppSettings();
        return { success: true, data: settings };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('save-whatsapp-settings', async (event, settings) => {
    try {
        await saveWhatsAppSettings(settings);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('test-whatsapp-connection', async (event, apiKey, phoneNumber) => {
    try {
        const https = require('https');
        const apiUrl = 'https://wasenderapi.com/api/send-message';
        
        const testMessage = `🧪 *Test Message*\n\nThis is a test message from IT Help Desk system.\n\nTime: ${new Date().toLocaleString()}`;
        
        const postData = JSON.stringify({
            to: phoneNumber,
            text: testMessage
        });
        
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        return new Promise((resolve, reject) => {
            const req = https.request(apiUrl, options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ success: true, message: 'Test message sent successfully! ✅' });
                    } else {
                        resolve({ success: false, error: `Failed to send. Status: ${res.statusCode}` });
                    }
                });
            });
            
            req.on('error', (error) => {
                resolve({ success: false, error: `Connection error: ${error.message}` });
            });
            
            req.write(postData);
            req.end();
        });
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// ============================================================================
// APPLICATION LIFECYCLE
// ============================================================================

app.whenReady().then(async () => {
    // await initializeThemeTable(); // DISABLED: Themes are now stored per-PC in localStorage
    await initializeWhatsAppSettingsTable();
    createWindow();
    createTray();
    
    testDatabaseConnection().then(success => {
        if (success) {
            initializeAutoRefresh();
        }
    });
    
    // Check for updates after app is ready (only in production)
    if (!process.argv.includes('--dev')) {
        setTimeout(() => {
            autoUpdater.checkForUpdates();
        }, 3000);
    }
    
    console.log('IT Help Desk running in system tray');
});

app.on('window-all-closed', (event) => {
    if (process.platform !== 'darwin') {
        event.preventDefault();
    }
});

app.on('before-quit', (event) => {
    isQuitting = true;
    // Clear user session on app quit
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.executeJavaScript(`
            localStorage.removeItem('currentUser');
        `).catch(err => console.error('Error clearing session on quit:', err));
    }
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    sql.close();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
    showWindow();
});

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        showWindow();
    });
}
