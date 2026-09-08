import { describe, expect, it } from "vitest";
import { AStarGrid } from "./AStarGrid";
import { EconomyManager } from "../core/EconomyManager";
import { TileType } from "../world/MapGenerator";

describe("AStarGrid", () => {
  it("contorna paredes e nunca atravessa tiles sólidos", () => {
    const matrix = [
      [TileType.Dug, TileType.Dug, TileType.Dug, TileType.Dug, TileType.Dug],
      [TileType.Dug, TileType.Dug, TileType.Solid, TileType.Dug, TileType.Dug],
      [TileType.Indestructible, TileType.Dug, TileType.Dug, TileType.Dug, TileType.Dug],
    ];
    const grid = new AStarGrid(() => matrix);
    const path = grid.findPath(0, 1, 4, 1);
    expect(path.length).toBeGreaterThan(0);
    expect(path).not.toContainEqual({ x: 2, z: 1 });
    path.forEach(({ x, z }) => expect(matrix[z][x] === TileType.Dug || matrix[z][x] === TileType.Room).toBe(true));
  });

  it("retorna vazio quando o destino caminhável está isolado", () => {
    const matrix = [
      [TileType.Dug, TileType.Solid, TileType.Solid],
      [TileType.Solid, TileType.Solid, TileType.Solid],
      [TileType.Solid, TileType.Solid, TileType.Dug],
    ];
    const grid = new AStarGrid(() => matrix);
    expect(grid.findPath(0, 0, 2, 2)).toEqual([]);
  });
});

describe("EconomyManager", () => {
  it("inicia com 100 Biomassa e nunca permite saldo negativo", () => {
    const economy = new EconomyManager();
    expect(economy.biomass).toBe(100);
    expect(economy.trySpend(10)).toBe(true);
    expect(economy.biomass).toBe(90);
    expect(economy.trySpend(1000)).toBe(false);
    expect(economy.biomass).toBe(90);
  });
});
