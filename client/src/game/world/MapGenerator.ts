import { Mesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export const TILE_SIZE = 1;
export const GRID_WIDTH = 18;
export const GRID_HEIGHT = 12;

export const enum TileType {
  Solid = 0,
  Dug = 1,
  Room = 2,
  Indestructible = 3,
}

export type TileMetadata = {
  mapTile: true;
  x: number;
  z: number;
  type: TileType;
};

/**
 * The first deterministic map for Fumiga.
 * 0 = solid earth, 1 = walkable tunnel, 2 = central chamber, 3 = indestructible rock.
 */
export const INITIAL_MAP: TileType[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

type TileRecord = {
  mesh: Mesh;
  type: TileType;
};

export class MapGenerator {
  private readonly tiles = new Map<string, TileRecord>();
  private readonly matrix: TileType[][];
  private readonly solidMaterial: StandardMaterial;
  private readonly dugMaterial: StandardMaterial;
  private readonly roomMaterial: StandardMaterial;
  private readonly rockMaterial: StandardMaterial;

  constructor(
    private readonly scene: Scene,
    private readonly tileSize = TILE_SIZE,
    sourceMatrix: TileType[][] = INITIAL_MAP,
  ) {
    this.matrix = sourceMatrix.map((row) => [...row]);
    this.solidMaterial = this.makeMaterial("solid-earth", new Color3(0.075, 0.058, 0.05));
    this.dugMaterial = this.makeMaterial("dug-earth", new Color3(0.23, 0.145, 0.095));
    this.roomMaterial = this.makeMaterial("central-chamber", new Color3(0.33, 0.19, 0.105));
    this.rockMaterial = this.makeMaterial("indestructible-rock", new Color3(0.035, 0.04, 0.045));
    this.generate();
  }

  get width() {
    return this.matrix[0]?.length ?? 0;
  }

  get height() {
    return this.matrix.length;
  }

  get walkableCount() {
    return this.matrix.flat().filter((type) => type === TileType.Dug || type === TileType.Room).length;
  }

  getMatrix(): TileType[][] {
    return this.matrix.map((row) => [...row]);
  }

  getTile(x: number, z: number): TileType | undefined {
    return this.matrix[z]?.[x];
  }

  isWalkable(x: number, z: number) {
    const type = this.getTile(x, z);
    return type === TileType.Dug || type === TileType.Room;
  }

  gridToWorld(x: number, z: number) {
    return new Vector3(
      (x - this.width / 2 + 0.5) * this.tileSize,
      0,
      (z - this.height / 2 + 0.5) * this.tileSize,
    );
  }

  getRecordAtMesh(mesh: AbstractMesh | null | undefined) {
    const metadata = mesh?.metadata as TileMetadata | undefined;
    if (!metadata?.mapTile) return undefined;
    return { x: metadata.x, z: metadata.z, type: metadata.type };
  }

  digMesh(mesh: AbstractMesh | null | undefined) {
    const record = this.getRecordAtMesh(mesh);
    if (!record || record.type !== TileType.Solid) return false;

    this.matrix[record.z][record.x] = TileType.Dug;
    const tile = this.tiles.get(this.key(record.x, record.z));
    if (!tile) return false;

    tile.type = TileType.Dug;
    tile.mesh.material = this.dugMaterial;
    tile.mesh.scaling.y = 0.18;
    tile.mesh.position.y = 0.08;
    tile.mesh.metadata = { ...tile.mesh.metadata, type: TileType.Dug } satisfies TileMetadata;
    return true;
  }

  dispose() {
    this.tiles.forEach(({ mesh }) => mesh.dispose());
    this.tiles.clear();
    this.solidMaterial.dispose();
    this.dugMaterial.dispose();
    this.roomMaterial.dispose();
    this.rockMaterial.dispose();
  }

  private generate() {
    this.matrix.forEach((row, z) => {
      row.forEach((type, x) => {
        const isWalkable = type === TileType.Dug || type === TileType.Room;
        const mesh = MeshBuilder.CreateBox(`tile-${x}-${z}`, {
          width: this.tileSize * 0.96,
          depth: this.tileSize * 0.96,
          height: isWalkable ? 0.12 : 0.64,
        }, this.scene);
        const position = this.gridToWorld(x, z);
        mesh.position = new Vector3(position.x, isWalkable ? 0.06 : 0.32, position.z);
        mesh.material = this.materialFor(type);
        mesh.metadata = { mapTile: true, x, z, type } satisfies TileMetadata;
        this.tiles.set(this.key(x, z), { mesh, type });
      });
    });
  }

  private materialFor(type: TileType) {
    if (type === TileType.Dug) return this.dugMaterial;
    if (type === TileType.Room) return this.roomMaterial;
    if (type === TileType.Indestructible) return this.rockMaterial;
    return this.solidMaterial;
  }

  private makeMaterial(name: string, color: Color3) {
    const material = new StandardMaterial(name, this.scene);
    material.diffuseColor = color;
    material.specularColor = Color3.Black();
    return material;
  }

  private key(x: number, z: number) {
    return `${x}:${z}`;
  }
}
