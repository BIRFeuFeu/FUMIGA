import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AStarGrid, type GridPoint } from "../ai/AStarGrid";
import { MapGenerator } from "../world/MapGenerator";

export type DigTask = {
  start: GridPoint;
  target: GridPoint;
  approach: GridPoint;
};

export class WorkerAnt {
  readonly mesh;
  private readonly path: GridPoint[];
  private pathIndex = 0;
  private workTimer = 0;
  private finished = false;

  constructor(
    private readonly scene: Scene,
    private readonly map: MapGenerator,
    private readonly navigation: AStarGrid,
    private readonly task: DigTask,
    private readonly onStatus: (message: string, tone: "neutral" | "success" | "warning") => void,
  ) {
    const material = new StandardMaterial("worker-ant-material", scene);
    material.diffuseColor = new Color3(0.12, 0.38, 0.72);
    material.emissiveColor = new Color3(0.02, 0.08, 0.18);
    material.specularColor = Color3.Black();
    this.mesh = MeshBuilder.CreateSphere("worker-ant", { diameter: 0.28, segments: 8 }, scene);
    this.mesh.scaling = new Vector3(0.72, 0.68, 1.4);
    this.mesh.material = material;
    this.mesh.position = this.map.gridToWorld(task.start.x, task.start.z).add(new Vector3(0, 0.24, 0));
    this.path = this.navigation.findPath(task.start.x, task.start.z, task.approach.x, task.approach.z);
    this.onStatus("OPERÁRIA NASCEU · aguardando tarefa", "success");
  }

  get isFinished() {
    return this.finished;
  }

  update(delta: number) {
    if (this.finished) return;
    if (this.pathIndex < this.path.length) {
      const waypoint = this.map.gridToWorld(this.path[this.pathIndex].x, this.path[this.pathIndex].z).add(new Vector3(0, 0.24, 0));
      const distance = Vector3.Distance(this.mesh.position, waypoint);
      if (distance < 0.05) {
        this.pathIndex += 1;
      } else {
        this.mesh.position = Vector3.Lerp(this.mesh.position, waypoint, Math.min(1, delta * 2.4));
        this.mesh.rotation.y += delta * 2;
        return;
      }
    }

    this.workTimer += delta;
    if (this.workTimer < 0.8) return;
    if (this.map.digAt(this.task.target.x, this.task.target.z)) {
      this.onStatus(`OPERÁRIA ESCAVOU · alvo ${this.task.target.x}:${this.task.target.z}`, "success");
    }
    this.finished = true;
  }

  dispose() {
    (this.mesh.material as StandardMaterial | null)?.dispose();
    this.mesh.dispose();
  }
}
