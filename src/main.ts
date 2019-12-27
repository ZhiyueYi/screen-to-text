import { app, BrowserWindow } from 'electron';

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    useContentSize: true,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile('src/index.html');

  //win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
