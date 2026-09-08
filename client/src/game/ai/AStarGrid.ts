import type { TileType } from "../world/MapGenerator";

export type GridPoint = { x: number; z: number };

export class AStarGrid {
  constructor(private readonly readMatrix: () => TileType[][]) {}

  findPath(startX: number, startZ: number, endX: number, endZ: number): GridPoint[] {
    const matrix = this.readMatrix();
    const height = matrix.length;
    const width = matrix[0]?.length ?? 0;
    if (!this.inBounds(startX, startZ, width, height) || !this.inBounds(endX, endZ, width, height)) return [];
    if (!this.isWalkable(matrix, startX, startZ) || !this.isWalkable(matrix, endX, endZ)) return [];

    const start = this.key(startX, startZ);
    const goal = this.key(endX, endZ);
    const open = new Set<string>([start]);
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>([[start, 0]]);
    const fScore = new Map<string, number>([[start, this.heuristic(startX, startZ, endX, endZ)]]);

    while (open.size > 0) {
      const current = this.lowestScore(open, fScore);
      if (current === goal) return this.reconstruct(cameFrom, current);
      open.delete(current);
      const [x, z] = this.parse(current);

      for (const neighbor of this.neighbors(x, z, width, height)) {
        if (!this.isWalkable(matrix, neighbor.x, neighbor.z)) continue;
        const neighborKey = this.key(neighbor.x, neighbor.z);
        const tentativeG = (gScore.get(current) ?? Number.POSITIVE_INFINITY) + 1;
        if (tentativeG >= (gScore.get(neighborKey) ?? Number.POSITIVE_INFINITY)) continue;
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + this.heuristic(neighbor.x, neighbor.z, endX, endZ));
        open.add(neighborKey);
      }
    }
    return [];
  }

  private isWalkable(matrix: TileType[][], x: number, z: number) {
    const type = matrix[z]?.[x];
    return type === 1 || type === 2;
  }

  private neighbors(x: number, z: number, width: number, height: number) {
    return [
      { x, z: z - 1 }, { x: x + 1, z }, { x, z: z + 1 }, { x: x - 1, z },
    ].filter((point) => this.inBounds(point.x, point.z, width, height));
  }

  private lowestScore(open: Set<string>, scores: Map<string, number>) {
    let best = "";
    let bestScore = Number.POSITIVE_INFINITY;
    open.forEach((key) => {
      const score = scores.get(key) ?? Number.POSITIVE_INFINITY;
      if (score < bestScore) {
        best = key;
        bestScore = score;
      }
    });
    return best;
  }

  private reconstruct(cameFrom: Map<string, string>, current: string) {
    const path: GridPoint[] = [this.pointFromKey(current)];
    let cursor = current;
    while (cameFrom.has(cursor)) {
      cursor = cameFrom.get(cursor) as string;
      path.unshift(this.pointFromKey(cursor));
    }
    return path;
  }

  private pointFromKey(key: string) {
    const [x, z] = this.parse(key);
    return { x, z };
  }

  private parse(key: string) {
    return key.split(":").map(Number) as [number, number];
  }

  private key(x: number, z: number) {
    return `${x}:${z}`;
  }

  private heuristic(x: number, z: number, endX: number, endZ: number) {
    return Math.abs(x - endX) + Math.abs(z - endZ);
  }

  private inBounds(x: number, z: number, width: number, height: number) {
    return x >= 0 && z >= 0 && x < width && z < height;
  }
}
