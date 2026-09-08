import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { PointerEventTypes, PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import {
  emitFoundationScene,
  emitFoundationState,
  emitFoundationStatus,
} from "./core/GameState";
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

function createWorker(scene: Scene, material: StandardMaterial) {
  const worker = MeshBuilder.CreateSphere("worker-foundation", { diameter: 0.23, segments: 8 }, scene);
  worker.position = new Vector3(-3.8, 0.24, 1.85);
  worker.scaling = new Vector3(0.65, 0.72, 1.35);
  worker.material = material;
  return worker;
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
  const queenMaterial = makeMaterial(scene, "queen-chitin", new Color3(0.22, 0.075, 0.045), new Color3(0.16, 0.035, 0.015));
  const eggMaterial = makeMaterial(scene, "queen-eggs", new Color3(0.85, 0.68, 0.38), new Color3(0.42, 0.2, 0.05));
  const workerMaterial = makeMaterial(scene, "worker-chitin", new Color3(0.43, 0.21, 0.08), new Color3(0.12, 0.055, 0.015));
  const queen = createQueen(scene, queenMaterial);
  const eggs = createEggs(scene, eggMaterial);
  const worker = createWorker(scene, workerMaterial);

  emitFoundationScene("game");
  emitFoundationState({ tilesDug: map.walkableCount, isPaused: false });
  emitFoundationStatus("MAP GENERATOR ONLINE · clique em um bloco sólido para escavar", "success");

  let isPaused = false;
  let elapsed = 0;
  const initialWorkerPosition = worker.position.clone();

  const onBeforeRender = () => {
    if (isPaused) return;
    const delta = engine.getDeltaTime() / 1000;
    elapsed += delta;
    worker.position.x = initialWorkerPosition.x + Math.sin(elapsed * 0.8) * 0.45;
    worker.position.z = initialWorkerPosition.z + Math.cos(elapsed * 0.8) * 0.22;
    worker.rotation.y += delta * 0.75;
    queen.scaling.y = 0.86 + Math.sin(elapsed * 1.4) * 0.035;
    eggs.forEach((egg, index) => {
      egg.position.y = 0.19 + Math.sin(elapsed * 1.1 + index) * 0.018;
    });
  };
  const renderObserver = scene.onBeforeRenderObservable.add(onBeforeRender);

  const onPointer = (pointerInfo: PointerInfo) => {
    if (pointerInfo.type !== PointerEventTypes.POINTERPICK || isPaused) return;
    if (!map.digMesh(pointerInfo.pickInfo?.pickedMesh)) return;
    emitFoundationState({ tilesDug: map.walkableCount });
    emitFoundationStatus(`TILE ESCAVADO · ${map.walkableCount.toString().padStart(2, "0")} células abertas`, "success");
  };
  const pointerObserver = scene.onPointerObservable.add(onPointer);

  const onPauseToggle = () => {
    isPaused = !isPaused;
    emitFoundationState({ isPaused });
    emitFoundationStatus(isPaused ? "PAUSA TÁTICA · mapa congelado" : "MAPA RETOMADO · input liberado", isPaused ? "warning" : "success");
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
      camera.detachControl();
      map.dispose();
      scene.dispose();
    },
  };
}
