const LEVEL_EXP_MULTIPLIER = 10;

export function createDefaultPlayer() {
  return {
    name: "Adventurer",
    floor: 1,
    x: 1,
    y: 1,
    facing: "E",
    stepsInEncounter: 0,
    gold: 0,
    inventory: [{ itemId: "herbA", qty: 2 }, { itemId: "vialA", qty: 1 }],
    explored: {},
    stats: {
      hp: 30,
      maxHp: 30,
      mp: 12,
      maxMp: 12,
      str: 6,
      def: 4,
      agi: 5,
      int: 5,
      lck: 3,
      lvl: 1,
      exp: 0
    }
  };
}

function nextLevelExp(level) {
  return level * LEVEL_EXP_MULTIPLIER;
}

function randomLevelStatKey() {
  const keys = ["str", "def", "agi", "int", "lck"];
  return keys[Math.floor(Math.random() * keys.length)];
}

export function gainExp(player, amount) {
  const messages = [];
  player.stats.exp += amount;
  messages.push(`Gained ${amount} EXP.`);

  while (player.stats.exp >= nextLevelExp(player.stats.lvl)) {
    player.stats.exp -= nextLevelExp(player.stats.lvl);
    player.stats.lvl += 1;
    player.stats.maxHp += 5;
    player.stats.hp = player.stats.maxHp;

    const boostKey = randomLevelStatKey();
    player.stats[boostKey] += 1;
    messages.push(`Level up! Reached LVL ${player.stats.lvl}. ${boostKey.toUpperCase()} +1.`);
  }

  return messages;
}

export function takeDamage(player, rawDamage) {
  const dmg = Math.max(1, Math.floor(rawDamage));
  player.stats.hp = Math.max(0, player.stats.hp - dmg);
  return dmg;
}

export function spendMp(player, cost) {
  if (player.stats.mp < cost) {
    return false;
  }

  player.stats.mp -= cost;
  return true;
}

export function isPlayerDefeated(player) {
  return player.stats.hp <= 0;
}

export function movePlayerToFloor(player, floorId, startX, startY, facing = "N") {
  player.floor = floorId;
  player.x = startX;
  player.y = startY;
  player.facing = facing;
  player.stepsInEncounter = 0;
}
