import { describe, expect, it } from "vitest";
import { applyDamage, resolveDamage } from "./CombatMath";

describe("CombatMath", () => {
  it("reduz dano conforme a armadura, mas mantém dano mínimo", () => {
    expect(resolveDamage(20, 0)).toBe(20);
    expect(resolveDamage(20, 100)).toBe(10);
    expect(resolveDamage(1, 1000)).toBe(1);
  });

  it("não deixa HP abaixo de zero e marca a unidade derrotada", () => {
    const stats = { hp: 10, maxHp: 10, armor: 0, damage: 4 };
    expect(applyDamage(stats, 4)).toEqual({ damage: 4, defeated: false });
    expect(stats.hp).toBe(6);
    expect(applyDamage(stats, 20)).toEqual({ damage: 20, defeated: true });
    expect(stats.hp).toBe(0);
  });
});
