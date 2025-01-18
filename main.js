const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let mainWindow;
let serverInstance;
const userDataPath = app.getPath('userData');
const setupFlagPath = path.join(userDataPath, '.setup-complete');
const dbPath = path.join(userDataPath, 'database.sqlite');
const settingsPath = path.join(userDataPath, 'settings.json');

// Default settings
const defaultSettings = {
  networkMode: 'offline',
  serverPort: 5001,
  allowRegistration: false
};

async function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      return { ...defaultSettings, ...settings };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return defaultSettings;
  }
}

async function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

async function checkFirstRun() {
  try {
    return !fs.existsSync(setupFlagPath);
  } catch (error) {
    console.error('Error checking first run:', error);
    return true;
  }
}

async function createAdminUser(userData) {
  try {
    const { sequelize } = require('./models');
    const { User } = sequelize.models;
    
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await User.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      isAdmin: true,
      status: 'active'
    });
    
    return true;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return false;
  }
}

async function runSetup() {
  const setupWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  try {
    // Create necessary directories
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    // Load the setup wizard
    const setupPath = isDev
      ? 'http://localhost:3000/setup'
      : `file://${path.join(__dirname, 'client', 'build', 'index.html')}#/setup`;
    
    await setupWindow.loadURL(setupPath);
    
    if (isDev) {
      setupWindow.webContents.openDevTools();
    }

    // Handle setup completion
    return new Promise((resolve) => {
      ipcMain.handleOnce('setup:complete', async (event, data) => {
        try {
          // Initialize database
          const { sequelize } = require('./models');
          await sequelize.authenticate();
          await sequelize.sync({ force: true });

          // Create admin user
          const adminCreated = await createAdminUser(data.admin);
          if (!adminCreated) {
            throw new Error('Failed to create admin user');
          }

          // Save settings
          await saveSettings({
            ...defaultSettings,
            ...data.settings
          });

          // Mark setup as complete
          fs.writeFileSync(setupFlagPath, new Date().toISOString());
          
          setupWindow.close();
          resolve(true);
        } catch (error) {
          console.error('Setup failed:', error);
          await dialog.showMessageBox(setupWindow, {
            type: 'error',
            title: 'Setup Failed',
            message: `Installation failed: ${error.message}\nPlease try again.`,
            buttons: ['OK']
          });
          setupWindow.close();
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.error('Setup failed:', error);
    await dialog.showMessageBox(setupWindow, {
      type: 'error',
      title: 'Setup Failed',
      message: `Installation failed: ${error.message}\nPlease try again.`,
      buttons: ['OK']
    });
    setupWindow.close();
    return false;
  }
}

// Express server setup
const expressApp = require('./server');

async function startServer(settings) {
  if (settings.networkMode === 'offline') {
    console.log('Running in offline mode, server not started');
    return true;
  }

  try {
    const port = settings.serverPort || 5001;
    return new Promise((resolve, reject) => {
      serverInstance = expressApp.listen(port, () => {
        console.log(`Server running on port ${port}`);
        resolve(true);
      });
      serverInstance.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${port} is already in use`);
          reject(new Error(`Port ${port} is already in use. Please close other applications using this port.`));
        } else {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    dialog.showErrorBox(
      'Server Error',
      'Failed to start the server. Please check if the port is available.'
    );
    return false;
  }
}

// IPC Handlers
ipcMain.handle('settings:get', async () => {
  return await loadSettings();
});

ipcMain.handle('settings:update', async (event, newSettings) => {
  return await saveSettings(newSettings);
});

async function createWindow() {
  try {
    // Check if this is the first run
    const isFirstRun = await checkFirstRun();
    if (isFirstRun) {
      const setupComplete = await runSetup();
      if (!setupComplete) {
        app.quit();
        return;
      }
    }

    // Load settings
    const settings = await loadSettings();

    // Start the server if in online mode
    if (settings.networkMode === 'online') {
      const serverStarted = await startServer(settings);
      if (!serverStarted) {
        throw new Error('Server initialization failed');
      }
    }

    // Create the browser window
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    // Set Content Security Policy
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self';" +
            "script-src 'self';" +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" +
            "font-src 'self' https://fonts.gstatic.com;" +
            "connect-src 'self' http://localhost:5001;" +
            "img-src 'self' data: https:;"
          ]
        }
      });
    });

    // Load the app
    const indexPath = path.join(__dirname, 'client', 'build', 'index.html');
    console.log('Loading application from:', indexPath);
    await mainWindow.loadFile(indexPath);

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    dialog.showErrorBox(
      'Application Error',
      `Failed to start the application: ${error.message}`
    );
    app.quit();
  }
}

// Handle app lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('Server closed');
    });
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox(
    'Application Error',
    'An unexpected error occurred. The application will restart.'
  );
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('Server closed due to error');
      app.relaunch();
      app.quit();
    });
  } else {
    app.relaunch();
    app.quit();
  }
}); 