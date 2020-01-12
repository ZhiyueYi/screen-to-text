import electron from 'electron';

export function determineScreenShot(
  screenSize: electron.Size,
  devicePixelRatio: number,
): electron.Size {
  const maxDimension = Math.max(screenSize.width, screenSize.height);
  return {
    width: maxDimension * devicePixelRatio,
    height: maxDimension * devicePixelRatio,
  };
}
