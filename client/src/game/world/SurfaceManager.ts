import { Mesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export type SurfaceLeaf = {
  id: string;
  position: Vector3;
  available: boolean;
  respawnTimer: number;
};

const LEAF_BIOMASS = 8;
const RESPAWN_SECONDS = 7;

export class SurfaceManager {
  readonly entrance = new Vector3(0, 0.12, 6.5);
  private readonly leaves: SurfaceLeaf[] = [];
  private readonly meshes = new Map<string, Mesh>();
  private readonly ground: Mesh;
  private readonly leafMaterial: StandardMaterial;
  private readonly harvestedMaterial: StandardMaterial;
  private readonly groundMaterial: StandardMaterial;

  constructor(private readonly scene: Scene) {
    this.groundMaterial = this.makeMaterial("surface-soil", new Color3(0.08, 0.12, 0.07));
    this.leafMaterial = this.makeMaterial("surface-leaf", new Color3(0.22, 0.62, 0.16), new Color3(0.04, 0.12, 0.02));
    this.harvestedMaterial = this.makeMaterial("surface-leaf-harvested", new Color3(0.06, 0.08, 0.05));
    this.harvestedMaterial.alpha = 0.55;

    this.ground = MeshBuilder.CreateBox("surface-ground", { width: 12, depth: 5.2, height: 0.14 }, scene);
    this.ground.position = new Vector3(0, -0.08, 9.3);
    this.ground.material = this.groundMaterial;
    this.ground.metadata = { surface: true, kind: "ground" };

    [
      [-3.4, 7.5], [0.8, 8.8], [3.5, 7.9], [-1.8, 10.8], [2.3, 11.1],
    ].forEach(([x, z], index) => this.createLeaf(index, x, z));

    const entrance = MeshBuilder.CreateCylinder("anthill-entrance", { diameter: 1.1, height: 0.26, tessellation: 12 }, scene);
    entrance.position = this.entrance.clone();
    entrance.scaling.y = 0.5;
    entrance.material = this.makeMaterial("anthill-material", new Color3(0.18, 0.1, 0.055));
    entrance.metadata = { surface: true, kind: "entrance" };
  }

  get availableCount() {
    return this.leaves.filter((leaf) => leaf.available).length;
  }

  isSurfaceMesh(mesh: Mesh | null | undefined) {
    return Boolean(mesh?.metadata?.surface || mesh?.name === "surface-ground" || mesh?.name === "anthill-entrance" || mesh?.name.startsWith("leaf-"));
  }

  findAvailableLeaf(center: Vector3, radius: number) {
    return this.leaves
      .filter((leaf) => leaf.available && Vector3.Distance(leaf.position, center) <= radius)
      .sort((a, b) => Vector3.Distance(a.position, center) - Vector3.Distance(b.position, center))[0];
  }

  harvest(leaf: SurfaceLeaf) {
    if (!leaf.available) return 0;
    leaf.available = false;
    leaf.respawnTimer = RESPAWN_SECONDS;
    const harvestedMesh = this.meshes.get(leaf.id);
    if (harvestedMesh) harvestedMesh.material = this.harvestedMaterial;
    return LEAF_BIOMASS;
  }

  update(delta: number) {
    this.leaves.forEach((leaf) => {
      if (leaf.available || leaf.respawnTimer <= 0) return;
      leaf.respawnTimer -= delta;
      if (leaf.respawnTimer <= 0) {
        leaf.available = true;
        const leafMesh = this.meshes.get(leaf.id);
        if (leafMesh) leafMesh.material = this.leafMaterial;
      }
    });
  }

  dispose() {
    this.ground.dispose();
    this.meshes.forEach((mesh) => mesh.dispose());
    this.groundMaterial.dispose();
    this.leafMaterial.dispose();
    this.harvestedMaterial.dispose();
  }

  private createLeaf(index: number, x: number, z: number) {
    const id = `leaf-${index}`;
    const mesh = MeshBuilder.CreateDisc(id, { radius: 0.42, tessellation: 6 }, this.scene);
    mesh.rotation.x = Math.PI / 2;
    mesh.position = new Vector3(x, 0.12, z);
    mesh.scaling = new Vector3(1.25, 0.72, 1);
    mesh.material = this.leafMaterial;
    mesh.metadata = { surface: true, kind: "biomass", leafId: id };
    this.meshes.set(id, mesh);
    this.leaves.push({ id, position: new Vector3(x, 0.18, z), available: true, respawnTimer: 0 });
  }

  private makeMaterial(name: string, color: Color3, emissive?: Color3) {
    const material = new StandardMaterial(name, this.scene);
    material.diffuseColor = color;
    material.specularColor = Color3.Black();
    if (emissive) material.emissiveColor = emissive;
    return material;
  }
}
