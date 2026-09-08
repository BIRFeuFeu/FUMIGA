export type RadialAction = "dig" | "build" | "cancel";

export type TacticalPoint = {
  x: number;
  y: number;
};

const LONG_PRESS_MS = 300;
const MOVE_TOLERANCE_PX = 10;

export class TimeController {
  private longPressTimer: number | null = null;
  private pointerId: number | null = null;
  private pointerStart: TacticalPoint | null = null;
  private tacticalActive = false;
  private pointerMoved = false;
  private suppressNextPick = false;
  private _timeScale = 1;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly onTacticalStart: (point: TacticalPoint) => void,
    private readonly onTacticalEnd: (action: RadialAction, point: TacticalPoint) => void,
  ) {
    window.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerCancel);
    this.canvas.addEventListener("contextmenu", this.preventContextMenu);
  }

  get timeScale() {
    return this._timeScale;
  }

  get isTacticalActive() {
    return this.tacticalActive;
  }

  consumeNextPick() {
    const shouldConsume = this.suppressNextPick;
    this.suppressNextPick = false;
    return shouldConsume;
  }

  cancel() {
    this.clearTimer();
    if (!this.tacticalActive) return;
    this.tacticalActive = false;
    this._timeScale = 1;
    if (this.pointerStart) this.onTacticalEnd("cancel", this.pointerStart);
    this.pointerStart = null;
    this.pointerId = null;
  }

  dispose() {
    this.clearTimer();
    window.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerCancel);
    this.canvas.removeEventListener("contextmenu", this.preventContextMenu);
  }

  private readonly onPointerDown = (event: PointerEvent) => {
    if (event.target !== this.canvas || this.tacticalActive || this.pointerId !== null) return;
    this.pointerId = event.pointerId;
    this.pointerStart = { x: event.clientX, y: event.clientY };
    this.pointerMoved = false;
    if (event.isTrusted) this.canvas.setPointerCapture?.(event.pointerId);
    this.longPressTimer = window.setTimeout(() => {
      if (!this.pointerMoved && this.pointerStart && this.pointerId === event.pointerId) {
        this.tacticalActive = true;
        this._timeScale = 0.1;
        this.onTacticalStart(this.pointerStart);
      }
    }, LONG_PRESS_MS);
  };

  private readonly onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== this.pointerId || !this.pointerStart || this.tacticalActive) return;
    const distance = Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y);
    if (distance > MOVE_TOLERANCE_PX) {
      this.pointerMoved = true;
      this.clearTimer();
    }
  };

  private readonly onPointerUp = (event: PointerEvent) => {
    if (event.pointerId !== this.pointerId) return;
    this.clearTimer();
    if (this.tacticalActive && this.pointerStart) {
      const action = this.resolveAction(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y);
      const point = this.pointerStart;
      this.tacticalActive = false;
      this._timeScale = 1;
      this.suppressNextPick = true;
      this.onTacticalEnd(action, point);
    }
    this.pointerId = null;
    this.pointerStart = null;
  };

  private readonly onPointerCancel = (event: PointerEvent) => {
    if (event.pointerId !== this.pointerId) return;
    this.cancel();
  };

  private readonly preventContextMenu = (event: MouseEvent) => event.preventDefault();

  private resolveAction(dx: number, dy: number): RadialAction {
    if (Math.hypot(dx, dy) < 24) return "cancel";
    const angle = Math.atan2(dy, dx);
    if (angle >= -Math.PI * 0.75 && angle < -Math.PI * 0.25) return "dig";
    if (angle >= -Math.PI * 0.25 && angle < Math.PI * 0.25) return "build";
    return "cancel";
  }

  private clearTimer() {
    if (this.longPressTimer !== null) {
      window.clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
}
