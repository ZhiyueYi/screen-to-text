import { Coordinate, Position, ListenType } from './../constants';

export class Cropper {
  private ref: HTMLElement;
  private startCoordinator: Coordinate = new Coordinate();
  private endCoordinator: Coordinate = new Coordinate();

  constructor($app: HTMLElement) {
    this.ref = document.createElement('div');
    this.ref.classList.add('image-cropper');

    this.initAdjusters();
    this.listenToShift();

    $app.appendChild(this.ref);
  }

  /**
   * Initial 8 adjusters
   */
  initAdjusters() {
    const imageCropperInner = document.createElement('div');
    imageCropperInner.classList.add('image-cropper-inner');

    Object.keys(Position).forEach(key => {
      const adjuster = document.createElement('div');
      const position = Position[key as keyof typeof Position];
      adjuster.classList.add('adjuster', position);
      this.listenToAdjust(adjuster, position);
      imageCropperInner.appendChild(adjuster);
    });

    this.ref.appendChild(imageCropperInner);
  }

  /**
   * Listen to shifting cropper position event
   */
  listenToShift() {
    this.listen(this.ref, ListenType.Shift);
  }

  /**
   * Listen to adjusting cropper size event
   * @param adjuster the individual adjuster of the event
   * @param position the position of the adjuster
   */
  listenToAdjust(adjuster: HTMLElement, position: Position) {
    this.listen(adjuster, ListenType.Adjust, position);
  }

  /**
   * Listen to certain event and adjust the size and position of the cropper
   * @param listener the particular HTMLElement which listens mouse events
   * @param listenType the type of the listening event
   * @param positionType optional. The position of the listener (only adjuster has position)
   */
  listen(
    listener: HTMLElement,
    listenType: ListenType,
    positionType?: Position,
  ) {
    listener.addEventListener('mousedown', mouseDownEvent => {
      mouseDownEvent.stopPropagation();

      let oldPoint: Coordinate = {
        x: mouseDownEvent.x,
        y: mouseDownEvent.y,
      };

      const onMouseMove = (e: MouseEvent) => {
        e.stopPropagation();

        const newPoint: Coordinate = {
          x: e.x,
          y: e.y,
        };

        switch (listenType) {
          case ListenType.Shift:
            this.shift(oldPoint, newPoint);
            break;
          case ListenType.Adjust:
            this.adjust(oldPoint, newPoint, positionType);
            break;
        }

        oldPoint = { ...newPoint };
      };

      const onMouseUp = (e: MouseEvent) => {
        e.stopPropagation();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mousemove', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  /**
   * Set an initial starting point when there is no cropper
   * @param e MouseEvent
   */
  start(e: MouseEvent) {
    this.startCoordinator = { x: e.clientX, y: e.clientY };
    this.endCoordinator = { x: e.clientX, y: e.clientY };
    this.refresh();
  }

  /**
   * Update the end coordinator every time when there is a new mouse event
   * @param e MouseEvent
   */
  move(e: MouseEvent) {
    this.endCoordinator = { x: e.clientX, y: e.clientY };
    this.refresh();
  }

  /**
   * Triggers when the cropper intialisation stops.
   * @param e MouseEvent
   */
  stop(e: MouseEvent) {
    this.move(e);
  }

  /**
   * Handles the shifting of the cropper
   * @param start the start coordinate
   * @param stop the end coordinate
   */
  shift(start: Coordinate, stop: Coordinate) {
    const movementX = stop.x - start.x;
    const movementY = stop.y - start.y;

    this.startCoordinator.x += movementX;
    this.startCoordinator.y += movementY;

    this.endCoordinator.x += movementX;
    this.endCoordinator.y += movementY;

    this.refresh();
  }

  /**
   * Handles the adjustments of the size of the cropper
   * @param start the start coordinate
   * @param stop the end coordinate
   * @param position the position of the adjuster
   */
  adjust(start: Coordinate, stop: Coordinate, position: Position) {
    const movementX = stop.x - start.x;
    const movementY = stop.y - start.y;
    let top = parseInt(this.ref.style.top, 10);
    let left = parseInt(this.ref.style.left, 10);
    let width = parseInt(this.ref.style.width, 10);
    let height = parseInt(this.ref.style.height, 10);

    switch (position) {
      case Position.TOP:
        top += movementY;
        height -= movementY;
        break;
      case Position.BOTTOM:
        height += movementY;
        break;
      case Position.LEFT:
        left += movementX;
        width -= movementX;
        break;
      case Position.RIGHT:
        width += movementX;
        break;
      case Position.TOP_LEFT:
        top += movementY;
        height -= movementY;
        left += movementX;
        width -= movementX;
        break;
      case Position.TOP_RIGHT:
        top += movementY;
        height -= movementY;
        width += movementX;
        break;
      case Position.BOTTOM_LEFT:
        height += movementY;
        left += movementX;
        width -= movementX;
        break;
      case Position.BOTTOM_RIGHT:
        height += movementY;
        width += movementX;
        break;
    }

    this.startCoordinator = {
      x: left,
      y: top,
    };

    this.endCoordinator = {
      x: left + width,
      y: top + height,
    };

    this.ref.style.top = `${top}px`;
    this.ref.style.left = `${left}px`;
    this.ref.style.width = `${width}px`;
    this.ref.style.height = `${height}px`;
  }

  /**
   * Refresh the cropper's styles so that it is displayed at the right place
   */
  refresh() {
    const left = Math.min(this.startCoordinator.x, this.endCoordinator.x);
    const right = Math.max(this.startCoordinator.x, this.endCoordinator.x);
    const top = Math.min(this.startCoordinator.y, this.endCoordinator.y);
    const bottom = Math.max(this.startCoordinator.y, this.endCoordinator.y);
    const height = bottom - top;
    const width = right - left;

    this.ref.style.top = `${top}px`;
    this.ref.style.left = `${left}px`;
    this.ref.style.width = `${width}px`;
    this.ref.style.height = `${height}px`;
  }
}
