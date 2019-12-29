import os from 'os';
import path from 'path';
import { screen, globalShortcut, BrowserWindow, ipcMain } from 'electron';

let captureWins: BrowserWindow[] = [];

export function initScreenCapturer() {
  // Exit hotkey
  globalShortcut.register('Esc', () => {
    if (captureWins) {
      captureWins.forEach(win => win.close());
      captureWins = [];
    }
  });

  // Register hot key to start screen capturer
  globalShortcut.register('CmdOrCtrl+Alt+A', createWindow);

  // Listen to capture-screen event
  ipcMain.on('capture-screen', (e, { type = 'start', screenId } = {}) => {
    if (type === 'start') {
      createWindow();
    } else if (type === 'complete') {
      // nothing
    } else if (type === 'select') {
      captureWins.forEach(win =>
        win.webContents.send('capture-screen', { type: 'select', screenId }),
      );
    }
  });
}

const createWindow = () => {
  if (captureWins.length) {
    return;
  }

  const displays = screen.getAllDisplays();
  captureWins = displays.map(display => {
    const captureWin = new BrowserWindow({
      fullscreen: os.platform() === 'win32' || undefined,
      width: display.bounds.width,
      height: display.bounds.height,
      x: display.bounds.x,
      y: display.bounds.y,
      transparent: true,
      frame: false,
      movable: false,
      resizable: false,
      enableLargerThanScreen: true,
      hasShadow: false,
    });
    captureWin.setAlwaysOnTop(true, 'screen-saver');
    captureWin.setVisibleOnAllWorkspaces(true);
    captureWin.setFullScreenable(false);

    captureWin.loadFile(path.join(__dirname, 'index.html'));

    const { x, y } = screen.getCursorScreenPoint();
    if (
      x >= display.bounds.x &&
      x <= display.bounds.x + display.bounds.width &&
      y >= display.bounds.y &&
      y <= display.bounds.y + display.bounds.height
    ) {
      captureWin.focus();
    } else {
      captureWin.blur();
    }
    // captureWin.openDevTools()

    captureWin.on('closed', () => {
      const index = captureWins.indexOf(captureWin);
      if (index !== -1) {
        captureWins.splice(index, 1);
      }
      captureWins.forEach(win => win.close());
    });
    return captureWin;
  });
};
