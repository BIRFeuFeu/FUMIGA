import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { EconomyManager } from "../core/EconomyManager";
import { PheromoneSystem } from "../ai/PheromoneSystem";
import { EnemyBase } from "./EnemyBase";

const SOLDIER_COST = 25;

export class SoldierAnt {
  readonly mesh;
  readonly attackPower = 14;
  private target: EnemyBase | undefined;
  private readonly speed = 1.4;
  private attackTimer = 0;
  private readonly attackCooldown = 0.8;

  constructor(
    private readonly scene: Scene,
    private readonly surfaceEntrance: Vector3,
    private readonly pheromones: PheromoneSystem,
    private readonly economy: EconomyManager,
    private readonly onStatus: (message: string, tone: "neutral" | "success" | "warning") => void,
  ) {
    const material = new StandardMaterial("soldier-ant-material", scene);
    material.diffuseColor = new Color3(0.92, 0.38, 0.06);
    material.emissiveColor = new Color3(0.22, 0.05, 0.01);
    material.specularColor = Color3.Black();
    this.mesh = MeshBuilder.CreateSphere("soldier-ant", { diameter: 0.34, segments: 8 }, scene);
    this.mesh.position = surfaceEntrance.clone();
    this.mesh.position.y = 0.3;
    this.mesh.scaling = new Vector3(0.92, 0.72, 1.6);
    this.mesh.material = material;
  }

  static tryCreate(
    scene: Scene,
    surfaceEntrance: Vector3,
    pheromones: PheromoneSystem,
    economy: EconomyManager,
    onStatus: (message: string, tone: "neutral" | "success" | "warning") => void,
  ) {
    if (!economy.trySpend(SOLDIER_COST)) {
      onStatus("SOLDADO NEGADO · Biomassa insuficiente", "warning");
      return undefined;
    }
    onStatus("SOLDADO EM PRONTIDÃO · custo 25 Biomassa", "success");
    return new SoldierAnt(scene, surfaceEntrance, pheromones, economy, onStatus);
  }

  get position() {
    return this.mesh.position;
  }

  update(delta: number, enemies: readonly EnemyBase[]) {
    const zone = this.pheromones.getActive("attack");
    if (!zone) {
      this.target = undefined;
      this.moveToward(this.surfaceEntrance, delta);
      return;
    }
    if (!this.target || this.target.isDefeated) {
      this.target = enemies
        .filter((enemy) => !enemy.isDefeated && Vector3.Distance(enemy.mesh.position, zone.center) <= zone.radius + 8)
        .sort((a, b) => Vector3.Distance(a.mesh.position, zone.center) - Vector3.Distance(b.mesh.position, zone.center))[0];
    }
    if (!this.target) return;

    const distance = Vector3.Distance(this.mesh.position, this.target.mesh.position);
    if (distance > 0.82) {
      this.moveToward(this.target.mesh.position, delta);
      return;
    }
    this.attackTimer += delta;
    if (this.attackTimer >= this.attackCooldown) {
      this.attackTimer = 0;
      this.attack(this.target);
    }
  }

  attack(enemy: EnemyBase) {
    if (enemy.isDefeated) return;
    const result = enemy.takeDamage(this.attackPower);
    if (!result.defeated) this.onStatus("SOLDADO · mordida confirmada", "success");
  }

  dispose() {
    (this.mesh.material as StandardMaterial | null)?.dispose();
    this.mesh.dispose();
  }

  private moveToward(target: Vector3, delta: number) {
    const direction = target.subtract(this.mesh.position);
    direction.y = 0;
    if (direction.lengthSquared() < 0.0001) return;
    direction.normalize();
    this.mesh.position.addInPlace(direction.scale(this.speed * delta));
    this.mesh.rotation.y = Math.atan2(direction.x, direction.z);
  }
}
