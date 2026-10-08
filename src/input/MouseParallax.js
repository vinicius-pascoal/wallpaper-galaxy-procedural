export class MouseParallax {
  constructor(element) {
    this.x = 0;
    this.y = 0;
    this._element = element;
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);
    element.addEventListener("pointermove", this._onPointerMove, { passive: true });
    element.addEventListener("pointerleave", this._onPointerLeave, { passive: true });
  }

  _onPointerMove(event) {
    const width = Math.max(this._element.clientWidth, 1);
    const height = Math.max(this._element.clientHeight, 1);
    this.x = (event.clientX / width) * 2 - 1;
    this.y = (event.clientY / height) * 2 - 1;
  }

  _onPointerLeave() {
    this.x = 0;
    this.y = 0;
  }
}
