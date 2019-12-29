import electron, { desktopCapturer, shell } from 'electron';
import Tesseract from 'tesseract.js';

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
        const result = await Tesseract.recognize(
          source.thumbnail.toPNG(),
          'eng',
          {
            logger: m => {
              console.log(m);
              const progress = (
                Math.round(m.progress * 10000) / 100
              ).toString();
              screenshotMsg!.textContent = `Status: ${m.status} Progress: ${progress}`;
            },
          },
        );

        screenshotMsg!.textContent = result.data.text;
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
