export const ENEMIES = {
  "01": {
    id: "01",
    name: "Creature A",
    hp: 10,
    str: 4,
    def: 1,
    agi: 3,
    expReward: 5,
    goldReward: 2,
    symbol: "A",
    color: "#8fcb75"
  },
  "02": {
    id: "02",
    name: "Creature B",
    hp: 20,
    str: 6,
    def: 3,
    agi: 2,
    expReward: 12,
    goldReward: 5,
    symbol: "B",
    color: "#d1b35c"
  },
  "03": {
    id: "03",
    name: "Creature C",
    hp: 35,
    str: 9,
    def: 5,
    agi: 4,
    expReward: 25,
    goldReward: 10,
    symbol: "C",
    color: "#d06f5f"
  }
};

export function getEnemyById(id) {
  const base = ENEMIES[id];
  if (!base) {
    return null;
  }

  return {
    ...base,
    currentHp: base.hp
  };
}

export function pickRandomEnemy(enemyIds) {
  if (!enemyIds || enemyIds.length === 0) {
    return null;
  }

  const id = enemyIds[Math.floor(Math.random() * enemyIds.length)];
  return getEnemyById(id);
}
