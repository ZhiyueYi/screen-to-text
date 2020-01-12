import { ipcRenderer } from 'electron';
import { extractText } from './text-extractor';

const screenshotBtn = document.getElementById('screenshot-btn');

screenshotBtn!.addEventListener('click', async () => {
  ipcRenderer.send('capture-screen');
});

ipcRenderer.on('complete-capture', (_, args) => {
  extractText(args);
});
