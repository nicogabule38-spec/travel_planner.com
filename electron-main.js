const { app, BrowserWindow } = require('electron');
const path = require('path');
const server = require('./server');

let mainWindow;

async function createWindow(startUrl) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  await mainWindow.loadURL(startUrl);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(async () => {
  try {
    const { port } = await server.startServer();
    const startUrl = process.env.ELECTRON_START_URL || `http://localhost:${port}/`;
    await createWindow(startUrl);
  } catch (err) {
    console.error('Failed to start bundled server:', err);
    // Fallback to load local file if server fails
    const fallback = `file://${path.join(__dirname, 'index.html')}`;
    await createWindow(fallback);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow(`file://${path.join(__dirname, 'index.html')}`);
});
