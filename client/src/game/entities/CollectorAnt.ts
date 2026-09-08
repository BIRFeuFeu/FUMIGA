import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { EconomyManager } from "../core/EconomyManager";
import { PheromoneSystem } from "../ai/PheromoneSystem";
import { SurfaceManager, type SurfaceLeaf } from "../world/SurfaceManager";

export class CollectorAnt {
  readonly mesh;
  private state: "seeking" | "extracting" | "returning" = "seeking";
  private target: SurfaceLeaf | undefined;
  private extractTimer = 0;
  private carriedBiomass = 0;
  private reportedTarget = false;
  private readonly speed = 1.7;

  constructor(
    private readonly scene: Scene,
    private readonly surface: SurfaceManager,
    private readonly pheromones: PheromoneSystem,
    private readonly economy: EconomyManager,
    private readonly onStatus: (message: string, tone: "neutral" | "success" | "warning") => void,
  ) {
    const material = new StandardMaterial("collector-ant-material", scene);
    material.diffuseColor = new Color3(0.78, 0.6, 0.12);
    material.emissiveColor = new Color3(0.16, 0.08, 0.01);
    material.specularColor = Color3.Black();
    this.mesh = MeshBuilder.CreateSphere("collector-ant", { diameter: 0.28, segments: 8 }, scene);
    this.mesh.position = surface.entrance.clone().add(new Vector3(0, 0.22, 0));
    this.mesh.scaling = new Vector3(0.72, 0.68, 1.42);
    this.mesh.material = material;
  }

  update(delta: number) {
    const zone = this.pheromones.getActive("collection");
    if (this.state === "seeking") {
      if (!this.target && zone) this.target = this.surface.findAvailableLeaf(zone.center, zone.radius);
      if (zone && !this.target && !this.reportedTarget) {
        this.reportedTarget = true;
        this.onStatus("COLETORA · nenhum recurso no raio", "warning");
      }
      if (this.target && !this.reportedTarget) {
        this.reportedTarget = true;
        this.onStatus("COLETORA · feromônio localizado", "success");
      }
      if (!this.target) return;
      this.moveToward(this.target.position, delta);
      if (Vector3.Distance(this.mesh.position, this.target.position) < 0.25) {
        this.state = "extracting";
        this.extractTimer = 0;
        this.onStatus("COLETORA · extraindo Biomassa", "success");
      }
      return;
    }

    if (this.state === "extracting") {
      this.extractTimer += delta;
      if (this.extractTimer < 1) return;
      this.carriedBiomass = this.surface.harvest(this.target as SurfaceLeaf);
      this.state = "returning";
      this.onStatus(`COLETORA · carga ${this.carriedBiomass.toString().padStart(2, "0")} pronta`, "success");
      return;
    }

    this.moveToward(this.surface.entrance, delta);
    if (Vector3.Distance(this.mesh.position, this.surface.entrance) < 0.25) {
      this.economy.addBiomass(this.carriedBiomass);
      this.onStatus(`DESPENSA · +${this.carriedBiomass} Biomassa armazenada`, "success");
      this.carriedBiomass = 0;
      this.target = undefined;
      this.state = "seeking";
      this.reportedTarget = false;
    }
  }

  dispose() {
    (this.mesh.material as StandardMaterial | null)?.dispose();
    this.mesh.dispose();
  }

  private moveToward(target: Vector3, delta: number) {
    const direction = target.subtract(this.mesh.position);
    direction.y = 0;
    if (direction.lengthSquared() > 0.0001) {
      direction.normalize();
      this.mesh.position.addInPlace(direction.scale(this.speed * delta));
      this.mesh.rotation.y = Math.atan2(direction.x, direction.z);
    }
  }
}
