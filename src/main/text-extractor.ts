import fs from 'fs';
import os from 'os';
import path from 'path';
import Tesseract from 'tesseract.js';
import electron, { desktopCapturer, shell, ipcRenderer } from 'electron';

const screen = electron.screen || electron.remote.screen;

const indicator = document.getElementById('indicator');
const progressBar = document.getElementById('progress') as HTMLProgressElement;

export async function extractText() {
  try {
    indicator!.textContent = 'Gathering screens...';
    const thumbSize = determineScreenShot(
      screen.getPrimaryDisplay().workAreaSize,
      window.devicePixelRatio,
    );
    const options = { types: ['screen'], thumbnailSize: thumbSize };

    const sources = await desktopCapturer.getSources(options);
    sources.forEach(async source => {
      if (source.name === 'Entire Screen' || source.name === 'Screen 1') {
        const result = await Tesseract.recognize(
          source.thumbnail.toPNG(),
          'eng',
          {
            logger: m => {
              console.log(m);
              const progress = Math.round(m.progress * 10000) / 100;

              progressBar!.value = progress;

              indicator!.textContent = `Status: ${
                m.status
              }\n Progress: ${progress.toString()}%`;
            },
          },
        );

        const tmpPath = path.join(os.tmpdir(), 'screenshot-text.txt');

        fs.writeFileSync(path.join(tmpPath), result.data.text);

        shell.openItem(tmpPath);
        indicator!.textContent = 'Completed!';
      }
    });
  } catch (error) {
    console.log(error);
  }
}

function determineScreenShot(
  screenSize: electron.Size,
  devicePixelRatio: number,
): electron.Size {
  const maxDimension = Math.max(screenSize.width, screenSize.height);
  return {
    width: maxDimension * devicePixelRatio,
    height: maxDimension * devicePixelRatio,
  };
}
