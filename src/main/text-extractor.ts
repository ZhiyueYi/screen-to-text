import fs from 'fs';
import os from 'os';
import path from 'path';
import Tesseract from 'tesseract.js';
import { shell } from 'electron';

const indicator = document.getElementById('indicator');
const progressBar = document.getElementById('progress') as HTMLProgressElement;

export async function extractText(base64: string) {
  try {
    indicator!.textContent = 'Gathering screens...';

    const img = new Image();
    img.style.display = 'none';
    img.id = 'screenshot';
    img.src = base64;

    document.body.appendChild(img);

    const result = await Tesseract.recognize(
      document.getElementById('screenshot') as HTMLImageElement,
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
  } catch (error) {
    console.log(error);
  }
}
