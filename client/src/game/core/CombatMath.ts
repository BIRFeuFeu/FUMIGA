export type CombatStats = {
  hp: number;
  maxHp: number;
  armor: number;
  damage: number;
};

export function resolveDamage(rawDamage: number, armor: number) {
  return Math.max(1, Math.round(rawDamage * (100 / (100 + Math.max(0, armor)))));
}

export function applyDamage(stats: CombatStats, rawDamage: number) {
  const damage = resolveDamage(rawDamage, stats.armor);
  stats.hp = Math.max(0, stats.hp - damage);
  return { damage, defeated: stats.hp <= 0 };
}

export function healthRatio(stats: Pick<CombatStats, "hp" | "maxHp">) {
  return stats.maxHp <= 0 ? 0 : stats.hp / stats.maxHp;
}
