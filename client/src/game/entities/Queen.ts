import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AStarGrid } from "../ai/AStarGrid";
import { EconomyManager } from "../core/EconomyManager";
import { MapGenerator } from "../world/MapGenerator";
import { WorkerAnt, type DigTask } from "./WorkerAnt";

const WORKER_COST = 10;
const SPAWN_COOLDOWN = 2;

export class Queen {
  readonly mesh;
  private readonly spawnQueue: Array<"worker"> = [];
  private spawnTimer = 0;

  constructor(
    private readonly scene: Scene,
    private readonly map: MapGenerator,
    private readonly navigation: AStarGrid,
    private readonly economy: EconomyManager,
    private readonly onWorkerSpawned: (worker: WorkerAnt) => void,
    private readonly onStatus: (message: string, tone: "neutral" | "success" | "warning") => void,
  ) {
    const material = new StandardMaterial("queen-chitin", scene);
    material.diffuseColor = new Color3(0.22, 0.075, 0.045);
    material.emissiveColor = new Color3(0.16, 0.035, 0.015);
    material.specularColor = Color3.Black();
    this.mesh = MeshBuilder.CreateSphere("queen-body", { diameter: 1.45, segments: 12 }, scene);
    this.mesh.position.y = 0.72;
    this.mesh.scaling = new Vector3(0.86, 0.72, 1.35);
    this.mesh.material = material;

    const thorax = MeshBuilder.CreateSphere("queen-thorax", { diameter: 0.72, segments: 12 }, scene);
    thorax.parent = this.mesh;
    thorax.position = new Vector3(0, 0.02, -0.72);
    thorax.scaling = new Vector3(1, 0.9, 1.1);
    thorax.material = material;

    const head = MeshBuilder.CreateSphere("queen-head", { diameter: 0.46, segments: 10 }, scene);
    head.parent = this.mesh;
    head.position = new Vector3(0, 0.02, -1.08);
    head.material = material;
  }

  get queueLength() {
    return this.spawnQueue.length;
  }

  requestWorker() {
    if (!this.economy.trySpend(WORKER_COST)) {
      this.onStatus("SPAWN NEGADO · Biomassa insuficiente", "warning");
      return false;
    }
    this.spawnQueue.push("worker");
    this.onStatus(`FILA DA RAINHA · ${this.spawnQueue.length} operária aguardando`, "success");
    return true;
  }

  update(delta: number) {
    this.mesh.scaling.y = 0.72 + Math.sin(performance.now() / 1000 * 1.4) * 0.03;
    if (this.spawnQueue.length === 0) return;
    this.spawnTimer += delta;
    if (this.spawnTimer < SPAWN_COOLDOWN) return;
    this.spawnTimer = 0;
    this.spawnQueue.shift();
    const task = this.map.findDigTask(7, 4);
    if (!task) {
      this.onStatus("FILA DA RAINHA · nenhum alvo escavável disponível", "warning");
      return;
    }
    const worker = new WorkerAnt(this.scene, this.map, this.navigation, task, this.onStatus);
    this.onWorkerSpawned(worker);
  }

  dispose() {
    (this.mesh.material as StandardMaterial | null)?.dispose();
    this.mesh.dispose();
  }
}
