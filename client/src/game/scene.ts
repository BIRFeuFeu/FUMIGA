import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { PointerEventTypes, PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import {
  emitFoundationScene,
  emitFoundationState,
  emitFoundationStatus,
} from "./core/GameState";
import { CameraController } from "./core/CameraController";
import { EconomyManager } from "./core/EconomyManager";
import { TimeController, type RadialAction, type TacticalPoint } from "./core/TimeController";
import { AStarGrid } from "./ai/AStarGrid";
import { Queen } from "./entities/Queen";
import { WorkerAnt } from "./entities/WorkerAnt";
import { MapGenerator } from "./world/MapGenerator";

export type GameHandle = {
  scene: Scene;
  dispose: () => void;
};

function makeMaterial(scene: Scene, name: string, color: Color3, emissive?: Color3) {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = color;
  material.specularColor = Color3.Black();
  if (emissive) material.emissiveColor = emissive;
  return material;
}

function createQueen(scene: Scene, material: StandardMaterial) {
  const root = MeshBuilder.CreateSphere("queen-body", { diameter: 1.45, segments: 12 }, scene);
  root.position = new Vector3(0, 0.72, 0);
  root.scaling = new Vector3(0.86, 0.72, 1.35);
  root.material = material;

  const thorax = MeshBuilder.CreateSphere("queen-thorax", { diameter: 0.72, segments: 12 }, scene);
  thorax.parent = root;
  thorax.position = new Vector3(0, 0.02, -0.72);
  thorax.scaling = new Vector3(1, 0.9, 1.1);
  thorax.material = material;

  const head = MeshBuilder.CreateSphere("queen-head", { diameter: 0.46, segments: 10 }, scene);
  head.parent = root;
  head.position = new Vector3(0, 0.02, -1.08);
  head.material = material;
  return root;
}

function createEggs(scene: Scene, material: StandardMaterial) {
  const eggs: ReturnType<typeof MeshBuilder.CreateSphere>[] = [];
  const positions = [
    [-1.35, 0.19, -0.85], [-1.08, 0.19, -0.48], [-1.42, 0.19, -0.18],
    [1.25, 0.19, -0.72], [1.42, 0.19, -0.35], [1.18, 0.19, 0.02],
  ];
  positions.forEach(([x, y, z], index) => {
    const egg = MeshBuilder.CreateSphere(`egg-${index}`, { diameter: 0.28, segments: 8 }, scene);
    egg.position = new Vector3(x, y, z);
    egg.scaling = new Vector3(0.82, 1.18, 0.82);
    egg.material = material;
    eggs.push(egg);
  });
  return eggs;
}

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.025, 0.02, 0.025, 1);

  const camera = new ArcRotateCamera(
    "foundation-camera",
    -Math.PI / 2,
    0.92,
    18.5,
    new Vector3(0, 0, 0),
    scene,
  );
  camera.lowerRadiusLimit = 14;
  camera.upperRadiusLimit = 26;
  camera.lowerBetaLimit = 0.68;
  camera.upperBetaLimit = 1.15;
  camera.panningSensibility = 0;
  camera.wheelPrecision = 80;
  camera.attachControl(canvas, true);

  const light = new HemisphericLight("warm-underground-light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.72;
  light.diffuse = new Color3(1, 0.77, 0.5);
  light.groundColor = new Color3(0.06, 0.04, 0.03);

  const fill = new HemisphericLight("green-biomass-fill", new Vector3(-0.7, 0.2, -0.5), scene);
  fill.intensity = 0.16;
  fill.diffuse = new Color3(0.4, 0.8, 0.28);

  const map = new MapGenerator(scene);
  const eggMaterial = makeMaterial(scene, "queen-eggs", new Color3(0.85, 0.68, 0.38), new Color3(0.42, 0.2, 0.05));
  const eggs = createEggs(scene, eggMaterial);
  const economy = new EconomyManager();
  const navigation = new AStarGrid(() => map.getMatrix());
  const workers: WorkerAnt[] = [];
  const queen = new Queen(scene, map, navigation, economy, (worker) => workers.push(worker), emitFoundationStatus);

  let isPaused = false;
  let elapsed = 0;
  let pendingTacticalMesh: AbstractMesh | null = null;
  let timeController: TimeController;

  const cameraController = new CameraController(canvas, camera, () => !isPaused && !timeController.isTacticalActive);

  const onTacticalStart = (point: TacticalPoint) => {
    pendingTacticalMesh = scene.pick(point.x, point.y)?.pickedMesh ?? null;
    emitFoundationState({
      isTacticalPause: true,
      timeScale: 0.1,
      radialMenu: { visible: true, x: point.x, y: point.y },
    });
    emitFoundationStatus("PAUSA TÁTICA · arraste para uma ordem", "warning");
  };

  const onTacticalEnd = (action: RadialAction) => {
    emitFoundationState({
      isTacticalPause: false,
      timeScale: 1,
      radialMenu: { visible: false, x: 0, y: 0 },
    });
    if (action === "dig" && map.digMesh(pendingTacticalMesh)) {
      emitFoundationState({ tilesDug: map.walkableCount });
      emitFoundationStatus(`ORDEM CAVAR · ${map.walkableCount.toString().padStart(2, "0")} células abertas`, "success");
    } else if (action === "spawn") {
      queen.requestWorker();
      emitFoundationState({ biomass: economy.biomass });
    } else {
      emitFoundationStatus("ORDEM CANCELADA · mapa preservado", "neutral");
    }
    pendingTacticalMesh = null;
  };
  timeController = new TimeController(canvas, onTacticalStart, onTacticalEnd);

  emitFoundationScene("game");
  emitFoundationState({ tilesDug: map.walkableCount, isPaused: false, isTacticalPause: false, timeScale: 1, radialMenu: { visible: false, x: 0, y: 0 } });
  emitFoundationStatus("TIME CONTROLLER ONLINE · segure para abrir ordens", "success");

  const onBeforeRender = () => {
    if (isPaused) return;
    const delta = (engine.getDeltaTime() / 1000) * timeController.timeScale;
    elapsed += delta;
    queen.update(delta);
    workers.forEach((worker) => worker.update(delta));
    eggs.forEach((egg, index) => {
      egg.position.y = 0.19 + Math.sin(elapsed * 1.1 + index) * 0.018;
    });
  };
  const renderObserver = scene.onBeforeRenderObservable.add(onBeforeRender);

  const onPointer = (pointerInfo: PointerInfo) => {
    if (pointerInfo.type !== PointerEventTypes.POINTERPICK || isPaused || timeController.consumeNextPick()) return;
    if (!map.digMesh(pointerInfo.pickInfo?.pickedMesh)) return;
    emitFoundationState({ tilesDug: map.walkableCount });
    emitFoundationStatus(`TILE ESCAVADO · ${map.walkableCount.toString().padStart(2, "0")} células abertas`, "success");
  };
  const pointerObserver = scene.onPointerObservable.add(onPointer);

  const onPauseToggle = () => {
    if (timeController.isTacticalActive) timeController.cancel();
    isPaused = !isPaused;
    emitFoundationState({ isPaused });
    emitFoundationStatus(isPaused ? "PAUSA TOTAL · mapa congelado" : "MAPA RETOMADO · input liberado", isPaused ? "warning" : "success");
  };
  window.addEventListener("fumiga:pause-toggle", onPauseToggle);

  const onSceneChange = (event: Event) => {
    const customEvent = event as CustomEvent<{ scene?: "boot" | "main-menu" | "game" }>;
    if (customEvent.detail?.scene) emitFoundationScene(customEvent.detail.scene);
  };
  window.addEventListener("fumiga:scene-change", onSceneChange);

  return {
    scene,
    dispose: () => {
      window.removeEventListener("fumiga:pause-toggle", onPauseToggle);
      window.removeEventListener("fumiga:scene-change", onSceneChange);
      scene.onBeforeRenderObservable.remove(renderObserver);
      scene.onPointerObservable.remove(pointerObserver);
      timeController.dispose();
      cameraController.dispose();
      workers.forEach((worker) => worker.dispose());
      queen.dispose();
      camera.detachControl();
      map.dispose();
      scene.dispose();
    },
  };
}
