import { Mesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export type PheromoneType = "collection" | "attack" | "movement";

type PheromoneZone = {
  id: number;
  type: PheromoneType;
  center: Vector3;
  radius: number;
  ttl: number;
  mesh: Mesh;
};

export class PheromoneSystem {
  private readonly zones: PheromoneZone[] = [];
  private nextId = 1;
  private readonly material: StandardMaterial;

  constructor(private readonly scene: Scene) {
    this.material = new StandardMaterial("collection-pheromone", scene);
    this.material.diffuseColor = new Color3(0.52, 0.82, 0.22);
    this.material.emissiveColor = new Color3(0.16, 0.3, 0.04);
    this.material.alpha = 0.12;
    this.material.specularColor = Color3.Black();
  }

  place(type: PheromoneType, center: Vector3, radius = 4.6, ttl = 12) {
    this.clearType(type);
    const mesh = MeshBuilder.CreateTorus(`pheromone-${this.nextId}`, { diameter: radius * 2, thickness: 0.035, tessellation: 48 }, this.scene);
    mesh.position = center.clone();
    mesh.position.y = 0.2;
    mesh.material = this.material;
    mesh.metadata = { pheromone: true, type };
    const zone: PheromoneZone = { id: this.nextId++, type, center: center.clone(), radius, ttl, mesh };
    this.zones.push(zone);
    return zone;
  }

  getActive(type: PheromoneType) {
    return this.zones.find((zone) => zone.type === type && zone.ttl > 0);
  }

  update(delta: number) {
    for (let index = this.zones.length - 1; index >= 0; index -= 1) {
      const zone = this.zones[index];
      zone.ttl -= delta;
      zone.mesh.scaling.setAll(Math.max(0.05, zone.ttl / 12));
      if (zone.ttl <= 0) {
        zone.mesh.dispose();
        this.zones.splice(index, 1);
      }
    }
  }

  dispose() {
    this.zones.forEach((zone) => zone.mesh.dispose());
    this.zones.length = 0;
    this.material.dispose();
  }

  private clearType(type: PheromoneType) {
    for (let index = this.zones.length - 1; index >= 0; index -= 1) {
      if (this.zones[index].type !== type) continue;
      this.zones[index].mesh.dispose();
      this.zones.splice(index, 1);
    }
  }
}
