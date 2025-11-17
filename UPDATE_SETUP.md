# Auto-Update Setup Guide

Your IT Help Desk app now has auto-update functionality! Here's how to set it up:

## How It Works

When you publish a new version, the app will:
1. **Automatically check** for updates when it starts (every time a user opens the app)
2. **Show a notification** to users when a new version is available
3. **Let users download** the update with one click
4. **Install on restart** - users can choose to restart now or later

## Setup Steps

### 1. Update Your Version Number

Before building a new release, update the version in `package.json`:

```json
{
  "version": "1.0.2"  // Increment this (e.g., 1.0.1 → 1.0.2)
}
```

### 2. Build and Publish

Run this command to build your app with update files:

```bash
npm run build
```

This creates in the `Installer` folder:
- `IT-Ticketing-Setup.exe` - The installer
- `latest.yml` - Update metadata file (IMPORTANT!)

### 3. Host Update Files

You need to host these files on a web server. You have two options:

#### Option A: Use Your Network Server (Recommended for local network)

1. Create a folder on your server: `\\192.168.1.254\Users\Public\updates\`
2. Copy these files to that folder:
   - `IT-Ticketing-Setup.exe`
   - `latest.yml`
   - `IT-Ticketing-Setup.exe.blockmap`

3. Make sure the folder is accessible via HTTP. You'll need to configure IIS or another web server on `192.168.1.254` to serve files from this directory at `http://192.168.1.254/updates/`

#### Option B: Use GitHub Releases

1. Create a GitHub repository for your app
2. Update `package.json` to include your repository:
   ```json
   "repository": {
     "type": "git",
     "url": "https://github.com/yourusername/it-ticketing.git"
   }
   ```

3. Update `electron-builder.config.js`:
   ```javascript
   publish: [{
     provider: "github",
     owner: "yourusername",
     repo: "it-ticketing"
   }]
   ```

4. Build and publish:
   ```bash
   npm run publish
   ```

### 4. Configure Update Server URL

Edit `electron-builder.config.js` and update the URL to match your server:

```javascript
publish: [{
  provider: "generic",
  url: "http://192.168.1.254/updates/"  // Your update server URL
}]
```

## Testing Updates

1. Build version 1.0.1: `npm run build`
2. Install it on a test PC
3. Update version to 1.0.2 in `package.json`
4. Build again: `npm run build`
5. Copy new files to your update server
6. Open the app on test PC - you should see an update notification!

## Update Flow for Users

1. User opens the app
2. App checks for updates in the background
3. If a new version is found, a notification appears:
   - "New Version Available! Version X.X.X is ready to download."
4. User clicks "Download"
5. Progress bar shows download status
6. When complete: "Update Ready! Restart to install."
7. User clicks "Restart Now" or "Later"
8. App installs update on next restart

## File Structure on Update Server

Your update server should have this structure:

```
http://192.168.1.254/updates/
├── IT-Ticketing-Setup.exe
├── IT-Ticketing-Setup.exe.blockmap
└── latest.yml
```

## Important Notes

- ✅ Update check only happens in production (not when running `npm start` or `npm run dev`)
- ✅ Users must have network access to your update server
- ✅ Always increment the version number before building
- ✅ The `latest.yml` file is crucial - it tells the app what version is available
- ✅ Keep old versions available on your server for rollback if needed

## Troubleshooting

**Update not detected:**
- Check version number was incremented
- Verify `latest.yml` is accessible at the update URL
- Check browser: can you access `http://192.168.1.254/updates/latest.yml`?
- Look at app console logs (open Dev Tools with Ctrl+Shift+I)

**Download fails:**
- Ensure all three files are on the server (exe, blockmap, yml)
- Check file permissions - must be readable by network users
- Verify firewall isn't blocking HTTP access

**App won't check for updates:**
- Make sure you're not running in dev mode (`--dev` flag)
- Check that app has internet/network access
