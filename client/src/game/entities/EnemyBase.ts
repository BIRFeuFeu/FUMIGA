import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { applyDamage, type CombatStats } from "../core/CombatMath";
import { EconomyManager } from "../core/EconomyManager";

export type EnemyKind = "centipede";

export class EnemyBase {
  readonly mesh;
  readonly stats: CombatStats = { hp: 40, maxHp: 40, armor: 5, damage: 8 };
  private attackTimer = 0;
  private wanderTimer = 0;
  private readonly speed = 0.55;
  private readonly attackRange = 0.82;
  private readonly attackCooldown = 1.2;
  private direction = new Vector3(1, 0, 0);
  private defeated = false;

  constructor(
    private readonly scene: Scene,
    private readonly economy: EconomyManager,
    private readonly onQueenHit: (damage: number) => void,
    private readonly onStatus: (message: string, tone: "neutral" | "success" | "warning") => void,
    position: Vector3,
  ) {
    const material = new StandardMaterial("centipede-enemy-material", scene);
    material.diffuseColor = new Color3(0.58, 0.07, 0.045);
    material.emissiveColor = new Color3(0.18, 0.015, 0.008);
    material.specularColor = Color3.Black();
    this.mesh = MeshBuilder.CreateSphere("enemy-centipede", { diameter: 0.48, segments: 8 }, scene);
    this.mesh.position = position.clone();
    this.mesh.position.y = 0.28;
    this.mesh.scaling = new Vector3(0.7, 0.65, 1.55);
    this.mesh.material = material;
    this.mesh.metadata = { enemy: true, kind: "centipede" satisfies EnemyKind };
  }

  get isDefeated() {
    return this.defeated;
  }

  update(delta: number, queenPosition: Vector3) {
    if (this.defeated) return;

    const toQueen = queenPosition.subtract(this.mesh.position);
    toQueen.y = 0;
    const distanceToQueen = toQueen.length();
    if (distanceToQueen <= this.attackRange) {
      this.attackTimer += delta;
      if (this.attackTimer >= this.attackCooldown) {
        this.attackTimer = 0;
        this.onQueenHit(this.stats.damage);
        this.onStatus("ALERTA · a Centopeia atingiu a Rainha", "warning");
      }
      return;
    }

    this.wanderTimer += delta;
    if (this.wanderTimer >= 2.2) {
      this.wanderTimer = 0;
      this.direction = new Vector3(Math.sin(this.mesh.position.z * 1.7 + performance.now() / 1000), 0, Math.cos(this.mesh.position.x * 1.3 + performance.now() / 1000)).normalize();
    }
    const movement = this.direction.scale(this.speed * delta);
    this.mesh.position.addInPlace(movement);
    this.mesh.position.x = Math.max(-5.2, Math.min(5.2, this.mesh.position.x));
    this.mesh.position.z = Math.max(6.8, Math.min(11.3, this.mesh.position.z));
    this.mesh.rotation.y = Math.atan2(this.direction.x, this.direction.z);
  }

  takeDamage(rawDamage: number) {
    if (this.defeated) return { damage: 0, defeated: true };
    const result = applyDamage(this.stats, rawDamage);
    if (result.defeated) {
      this.defeated = true;
      this.economy.addBiomass(12);
      this.mesh.dispose();
      this.onStatus("INIMIGO ELIMINADO · +12 Biomassa", "success");
    }
    return result;
  }

  dispose() {
    if (!this.mesh.isDisposed()) {
      (this.mesh.material as StandardMaterial | null)?.dispose();
      this.mesh.dispose();
    }
  }
}
