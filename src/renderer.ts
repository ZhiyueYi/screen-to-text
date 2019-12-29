import fs from 'fs';
import os from 'os';
import path from 'path';
import electron, { desktopCapturer, shell } from 'electron';

const screenshot = document.getElementById('screenshot');
const screenshotMsg = document.getElementById('screenshot-path');
const screen = electron.screen || electron.remote.screen;

screenshot!.addEventListener('click', async () => {
  try {
    screenshotMsg!.textContent = 'Gathering screens...';
    const thumbSize = determineScreenShot(
      screen.getPrimaryDisplay().workAreaSize,
      window.devicePixelRatio,
    );
    const options = { types: ['screen'], thumbnailSize: thumbSize };

    const sources = await desktopCapturer.getSources(options);
    sources.forEach(async source => {
      if (source.name === 'Entire Screen' || source.name === 'Screen 1') {
        const screenshotPath = path.join(os.tmpdir(), 'screenshot.png');

        await fs.writeFileSync(screenshotPath, source.thumbnail.toPNG());

        shell.openExternal('file://' + screenshotPath);

        const message = `Saved screenshot to: ${screenshotPath}`;
        screenshotMsg!.textContent = message;
      }
    });
  } catch (error) {
    console.log(error);
  }
});

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
