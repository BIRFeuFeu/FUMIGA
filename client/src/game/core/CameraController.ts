import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";

const MIN_RADIUS = 14;
const MAX_RADIUS = 26;
const PAN_SPEED = 0.018;
const MAX_TARGET_OFFSET = 5.2;

type Point = { x: number; y: number };

export class CameraController {
  private readonly pointers = new Map<number, Point>();
  private pinchStartDistance = 0;
  private pinchStartRadius = 0;
  private lastPanPoint: Point | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: ArcRotateCamera,
    private readonly canPan: () => boolean,
  ) {
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerup", this.onPointerUp);
    this.canvas.addEventListener("pointercancel", this.onPointerUp);
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
  }

  reset() {
    this.camera.target.x = 0;
    this.camera.target.z = 0;
    this.camera.radius = 18.5;
  }

  dispose() {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
    this.canvas.removeEventListener("wheel", this.onWheel);
    this.pointers.clear();
  }

  private readonly onPointerDown = (event: PointerEvent) => {
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (event.isTrusted) this.canvas.setPointerCapture?.(event.pointerId);
    if (this.pointers.size === 1) {
      this.lastPanPoint = { x: event.clientX, y: event.clientY };
    }
    if (this.pointers.size === 2) {
      this.pinchStartDistance = this.distanceBetweenPointers();
      this.pinchStartRadius = this.camera.radius;
      this.lastPanPoint = null;
    }
  };

  private readonly onPointerMove = (event: PointerEvent) => {
    if (!this.pointers.has(event.pointerId)) return;
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.pointers.size >= 2) {
      const distance = this.distanceBetweenPointers();
      if (this.pinchStartDistance > 0) {
        const scale = this.pinchStartDistance / Math.max(distance, 1);
        this.camera.radius = this.clamp(this.pinchStartRadius * scale, MIN_RADIUS, MAX_RADIUS);
      }
      return;
    }

    if (!this.canPan() || !this.lastPanPoint) return;
    const dx = event.clientX - this.lastPanPoint.x;
    const dy = event.clientY - this.lastPanPoint.y;
    this.lastPanPoint = { x: event.clientX, y: event.clientY };
    this.camera.target.x = this.clamp(this.camera.target.x - dx * PAN_SPEED, -MAX_TARGET_OFFSET, MAX_TARGET_OFFSET);
    this.camera.target.z = this.clamp(this.camera.target.z + dy * PAN_SPEED, -MAX_TARGET_OFFSET, MAX_TARGET_OFFSET);
  };

  private readonly onPointerUp = (event: PointerEvent) => {
    this.pointers.delete(event.pointerId);
    if (this.pointers.size < 2) {
      this.pinchStartDistance = 0;
      this.lastPanPoint = this.pointers.size === 1 ? Array.from(this.pointers.values())[0] : null;
    }
  };

  private readonly onWheel = (event: WheelEvent) => {
    event.preventDefault();
    this.camera.radius = this.clamp(this.camera.radius + event.deltaY * 0.012, MIN_RADIUS, MAX_RADIUS);
  };

  private distanceBetweenPointers() {
    const [first, second] = Array.from(this.pointers.values());
    if (!first || !second) return 0;
    return Math.hypot(first.x - second.x, first.y - second.y);
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }
}
