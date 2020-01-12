import { Cropper } from './cropper';

let cropper: Cropper = null;

function onMouseDown(e: MouseEvent) {
  if (!cropper) {
    cropper = new Cropper(document.body);
    cropper.start(e);

    document.body.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseup', onMouseUp);
  }
}

function onMouseMove(e: MouseEvent) {
  cropper.move(e);
}

function onMouseUp(e: MouseEvent) {
  cropper.stop(e);
  document.body.removeEventListener('mousemove', onMouseMove);
  document.body.removeEventListener('mouseup', onMouseUp);
}

document.body.addEventListener('mousedown', onMouseDown);
