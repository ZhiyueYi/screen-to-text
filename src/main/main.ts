import path from 'path';
import { app, BrowserWindow } from 'electron';
import { initScreenCapturer } from '../screen-capturer/main';

let win: BrowserWindow | null;
let appIsReady = false;

function createWindow() {
  initScreenCapturer();

  win = new BrowserWindow({
    height: 80,
    width: 800,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  //win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', () => {
  appIsReady = true;
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!win && appIsReady) {
    createWindow();
  }
});
