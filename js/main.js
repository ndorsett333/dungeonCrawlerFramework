const TILE = {
  OPEN: 0,
  WALL: 1,
  DOOR_A: 2,
  CHEST: 3,
  STAIRS: 4,
  ENCOUNTER: 6
};

const ENEMIES = {
  "01": { id: "01", name: "Creature A", hp: 10, str: 4, def: 1, agi: 3, expReward: 5, goldReward: 2, symbol: "A", color: "#8fcb75" },
  "02": { id: "02", name: "Creature B", hp: 20, str: 6, def: 3, agi: 2, expReward: 12, goldReward: 5, symbol: "B", color: "#d1b35c" },
  "03": { id: "03", name: "Creature C", hp: 35, str: 9, def: 5, agi: 4, expReward: 25, goldReward: 10, symbol: "C", color: "#d06f5f" }
};

const ITEMS = {
  herbA: { id: "herbA", name: "Herb A", type: "consumable", effect: { kind: "restoreHp", value: 10 }, description: "Restore 10 HP" },
  herbB: { id: "herbB", name: "Herb B", type: "consumable", effect: { kind: "restoreHp", value: 20 }, description: "Restore 20 HP" },
  vialA: { id: "vialA", name: "Vial A", type: "consumable", effect: { kind: "restoreMp", value: 10 }, description: "Restore 10 MP" },
  weaponA: { id: "weaponA", name: "Weapon A", type: "equipment", slot: "weapon", bonus: "+2 STR", description: "Equipment stub" },
  armorA: { id: "armorA", name: "Armor A", type: "equipment", slot: "body", bonus: "+2 DEF", description: "Equipment stub" },
  accessoryA: { id: "accessoryA", name: "Accessory A", type: "equipment", slot: "ring", bonus: "+1 LCK", description: "Equipment stub" },
  keyA: { id: "keyA", name: "Key A", type: "key", description: "Opens locked door type A" },
  keyB: { id: "keyB", name: "Key B", type: "key", description: "Opens locked door type B" }
};

const SPELLS = {
  spellA: { id: "spellA", name: "Spell A", mpCost: 4, power: 8 },
  spellB: { id: "spellB", name: "Spell B", mpCost: 6, power: 12 },
  spellC: { id: "spellC", name: "Spell C", mpCost: 8, power: 16 }
};

const FLOORS = {
  1: {
    id: 1,
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,6,6,6,0,4,1],
      [1,0,1,1,1,0,1,1,6,0,1,1],
      [1,0,1,3,1,0,0,0,6,0,1,1],
      [1,0,1,0,1,1,1,0,1,0,1,1],
      [1,0,1,0,0,0,1,0,1,0,1,1],
      [1,0,1,1,1,0,1,0,1,0,1,1],
      [1,0,0,0,1,0,0,0,1,0,0,1],
      [1,1,1,0,1,1,1,2,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,1,1,1,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    start: { x: 1, y: 1, facing: "E" },
    encounterTileIds: [6],
    encounterPool: ["01", "02", "03"],
    encounterThreshold: 3,
    encounterChance: 0.45,
    chests: { "3,3": { itemId: "keyA", qty: 1 } }
  },
  2: {
    id: 2,
    map: [
      [1,1,1,1,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,0,0,0,1],
      [1,1,1,1,1]
    ],
    start: { x: 2, y: 2, facing: "N" },
    encounterTileIds: [],
    encounterPool: [],
    encounterThreshold: 999,
    encounterChance: 0,
    chests: {}
  }
};

const DIRS = { N: { x: 0, y: -1 }, E: { x: 1, y: 0 }, S: { x: 0, y: 1 }, W: { x: -1, y: 0 } };
const TURN_LEFT = { N: "W", W: "S", S: "E", E: "N" };
const TURN_RIGHT = { N: "E", E: "S", S: "W", W: "N" };
const LEVEL_EXP_MULTIPLIER = 10;
const INVENTORY_MAX_SLOTS = 16;
const SAVE_KEY = "dungeonCrawlerFrameworkSave";

// Swap these file paths to reskin dungeon surfaces.
const TEXTURE_PATHS = {
  ceiling: "assets/textures/ceiling.png",
  floor: "assets/textures/floor.png",
  wallFar: "assets/textures/wall-far.png",
  wallMid: "assets/textures/wall-mid.png",
  wallNear: "assets/textures/wall-near.png",
  wallSide: "assets/textures/wall-side.png",
  stairs: "assets/textures/stairs.png"
};

const textureImages = {};

const STATE = {
  MAIN_MENU: "MAIN_MENU",
  DUNGEON: "DUNGEON",
  MENU: "MENU",
  BATTLE: "BATTLE",
  OPTIONS: "OPTIONS",
  GAMEOVER: "GAMEOVER"
};

let gameState = STATE.MAIN_MENU;
let player = null;
let dungeonCtx = null;
let minimapCtx = null;
let battleState = null;
let menuCallbacks = null;

const TURN_TRANSITION_DURATION_MS = 170;
const turnTransition = {
  active: false,
  direction: "right",
  startMs: 0,
  oldFrame: null,
  newFrame: null
};

function createDefaultPlayer() {
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

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === screenId || (screen.id === "ingame-menu-screen" && screenId === "ingame-menu-screen"));
  });
}

function setOverlayVisible(visible) {
  document.getElementById("ingame-menu-screen").classList.toggle("active", visible);
}

function setContinueEnabled(enabled) {
  document.getElementById("continue-button").disabled = !enabled;
}

function appendMessage(message) {
  const log = document.getElementById("message-log");
  if (!log) return;
  const line = document.createElement("div");
  line.textContent = message;
  log.prepend(line);
  while (log.children.length > 6) log.removeChild(log.lastElementChild);
}

function updateHUD() {
  document.getElementById("hud-hp").textContent = `HP: ${player.stats.hp} / ${player.stats.maxHp}`;
  document.getElementById("hud-mp").textContent = `MP: ${player.stats.mp} / ${player.stats.maxMp}`;
  document.getElementById("hud-gold").textContent = `Gold: ${player.gold}`;
  document.getElementById("hud-compass").textContent = `Dir: ${player.facing}`;
  document.getElementById("hud-floor").textContent = `Floor: ${player.floor}`;
}

function hasSaveData() {
  return Boolean(localStorage.getItem(SAVE_KEY));
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(player));
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getFloorData(floorId) {
  return FLOORS[floorId] || null;
}

function getTile(floorId, x, y) {
  const floor = getFloorData(floorId);
  if (!floor) return TILE.WALL;
  if (y < 0 || y >= floor.map.length || x < 0 || x >= floor.map[0].length) return TILE.WALL;
  return floor.map[y][x];
}

function setTile(floorId, x, y, tileValue) {
  const floor = getFloorData(floorId);
  if (!floor) return;
  if (y < 0 || y >= floor.map.length || x < 0 || x >= floor.map[0].length) return;
  floor.map[y][x] = tileValue;
}

function placePlayerAtFloorStart(floorId) {
  const floor = getFloorData(floorId);
  if (!floor) return;
  player.floor = floorId;
  player.x = floor.start.x;
  player.y = floor.start.y;
  player.facing = floor.start.facing;
}

function revealTile(x, y) {
  const floorKey = String(player.floor);
  if (!player.explored[floorKey]) player.explored[floorKey] = {};
  player.explored[floorKey][`${x},${y}`] = true;
}

function revealAroundPlayer(radius = 1) {
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      revealTile(player.x + dx, player.y + dy);
    }
  }
}

function isRevealed(floorId, x, y) {
  const floorKey = String(floorId);
  return Boolean(player.explored[floorKey] && player.explored[floorKey][`${x},${y}`]);
}

function renderMinimap() {
  const floor = getFloorData(player.floor);
  if (!floor) return;

  const ctx = minimapCtx;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const rows = floor.map.length;
  const cols = floor.map[0].length;
  const tileW = w / cols;
  const tileH = h / rows;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0f131b";
  ctx.fillRect(0, 0, w, h);

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (!isRevealed(player.floor, x, y)) continue;
      const tile = floor.map[y][x];
      if (tile === TILE.WALL) ctx.fillStyle = "#6f778a";
      else if (tile === TILE.DOOR_A) ctx.fillStyle = "#8e7243";
      else if (tile === TILE.CHEST) ctx.fillStyle = "#b0893f";
      else if (tile === TILE.STAIRS) ctx.fillStyle = "#5b8dcf";
      else if (tile === TILE.ENCOUNTER) ctx.fillStyle = "#4f6a93";
      else ctx.fillStyle = "#243047";
      ctx.fillRect(x * tileW, y * tileH, tileW - 1, tileH - 1);
    }
  }

  ctx.fillStyle = "#f0c45d";
  const px = (player.x + 0.5) * tileW;
  const py = (player.y + 0.5) * tileH;
  const radius = Math.max(2, tileW * 0.2);
  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.fill();

  const dir = DIRS[player.facing] || DIRS.N;
  const arrowLen = Math.max(6, tileW * 0.5);
  const tipX = px + dir.x * arrowLen;
  const tipY = py + dir.y * arrowLen;

  ctx.strokeStyle = "#f5efe0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  const perpX = -dir.y;
  const perpY = dir.x;
  const headSize = Math.max(3, tileW * 0.18);
  ctx.fillStyle = "#f5efe0";
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - dir.x * headSize - perpX * headSize, tipY - dir.y * headSize - perpY * headSize);
  ctx.lineTo(tipX - dir.x * headSize + perpX * headSize, tipY - dir.y * headSize + perpY * headSize);
  ctx.closePath();
  ctx.fill();
}

function isOpaque(tile) {
  return tile === TILE.WALL || tile === TILE.DOOR_A || tile === TILE.CHEST;
}

function getForwardDelta() {
  return DIRS[player.facing];
}

function getLeftDelta() {
  return DIRS[TURN_LEFT[player.facing]];
}

function preloadTextures() {
  Object.entries(TEXTURE_PATHS).forEach(([key, path]) => {
    const img = new Image();
    img.decoding = "async";
    img.src = path;
    textureImages[key] = img;
  });
}

function drawTexturedRect(ctx, textureKey, x, y, w, h, fallbackColor) {
  const img = textureImages[textureKey];
  if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
    ctx.drawImage(img, x, y, w, h);
    return;
  }

  ctx.fillStyle = fallbackColor;
  ctx.fillRect(x, y, w, h);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function drawWarpedQuadTexture(ctx, textureKey, quad, fallbackColor) {
  const img = textureImages[textureKey];
  const hasTexture = Boolean(img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0);

  if (!hasTexture) {
    ctx.fillStyle = fallbackColor;
    ctx.beginPath();
    ctx.moveTo(quad.tl.x, quad.tl.y);
    ctx.lineTo(quad.tr.x, quad.tr.y);
    ctx.lineTo(quad.br.x, quad.br.y);
    ctx.lineTo(quad.bl.x, quad.bl.y);
    ctx.closePath();
    ctx.fill();
    return;
  }

  // Approximate perspective by drawing many narrow texture strips.
  const slices = 36;
  for (let i = 0; i < slices; i += 1) {
    const t0 = i / slices;
    const t1 = (i + 1) / slices;

    const top0 = { x: lerp(quad.tl.x, quad.tr.x, t0), y: lerp(quad.tl.y, quad.tr.y, t0) };
    const top1 = { x: lerp(quad.tl.x, quad.tr.x, t1), y: lerp(quad.tl.y, quad.tr.y, t1) };
    const bot0 = { x: lerp(quad.bl.x, quad.br.x, t0), y: lerp(quad.bl.y, quad.br.y, t0) };

    const sx = Math.floor(t0 * img.naturalWidth);
    const sw = Math.max(1, Math.ceil((t1 - t0) * img.naturalWidth));

    ctx.save();
    ctx.setTransform(
      top1.x - top0.x,
      top1.y - top0.y,
      bot0.x - top0.x,
      bot0.y - top0.y,
      top0.x,
      top0.y
    );
    ctx.drawImage(img, sx, 0, sw, img.naturalHeight, 0, 0, 1, 1);
    ctx.restore();
  }
}

function drawCenteredWallSlice(ctx, depth, textureKey, fallbackColor) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  // Depth 1 is nearest, so it should be the largest wall panel.
  const sizeByDepth = {
    1: { w: 1.06, h: 1.06, yOffset: 0.0 },
    2: { w: 0.74, h: 0.78, yOffset: 0.02 },
    3: { w: 0.5, h: 0.56, yOffset: 0.04 }
  };
  const size = sizeByDepth[depth] || sizeByDepth[3];
  const panelW = width * size.w;
  const panelH = height * size.h;
  const x = (width - panelW) / 2;
  const y = (height - panelH) / 2 + height * size.yOffset;

  drawTexturedRect(ctx, textureKey, x, y, panelW, panelH, fallbackColor);
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.strokeRect(x, y, panelW, panelH);
}

function drawSideWallSlice(ctx, depth, side, solid) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const shapeByDepth = {
    1: { innerX: 0.40, top: 0.27, bottom: 0.79, slant: 0.11 },
    2: { innerX: 0.31, top: 0.23, bottom: 0.75, slant: 0.08 },
    3: { innerX: 0.23, top: 0.19, bottom: 0.69, slant: 0.06 }
  };
  const shape = shapeByDepth[depth] || shapeByDepth[3];

  const innerX = width * shape.innerX;
  const topY = height * shape.top;
  const bottomY = height * shape.bottom;
  const slant = height * shape.slant;

  if (solid) {
    const quad = side === "left"
      ? {
        tl: { x: 0, y: topY - slant },
        tr: { x: innerX, y: topY },
        br: { x: innerX, y: bottomY },
        bl: { x: 0, y: bottomY + slant }
      }
      : {
        tl: { x: width - innerX, y: topY },
        tr: { x: width, y: topY - slant },
        br: { x: width, y: bottomY + slant },
        bl: { x: width - innerX, y: bottomY }
      };

    drawWarpedQuadTexture(ctx, "wallNear", quad, "#59657d");
  } else {
    ctx.fillStyle = "rgba(89,101,125,0.18)";
    ctx.beginPath();
    if (side === "left") {
      ctx.moveTo(0, topY - slant);
      ctx.lineTo(innerX, topY);
      ctx.lineTo(innerX, bottomY);
      ctx.lineTo(0, bottomY + slant);
    } else {
      ctx.moveTo(width - innerX, topY);
      ctx.lineTo(width, topY - slant);
      ctx.lineTo(width, bottomY + slant);
      ctx.lineTo(width - innerX, bottomY);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function renderFirstPerson() {
  const ctx = dungeonCtx;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);
  drawTexturedRect(ctx, "ceiling", 0, 0, width, height / 2, "#566077");
  drawTexturedRect(ctx, "floor", 0, height / 2, width, height / 2, "#2a3446");

  const forward = getForwardDelta();
  const left = getLeftDelta();

  // Stop rendering deeper slices once a front wall is found.
  let occlusionDepth = null;
  for (let depth = 1; depth <= 3; depth += 1) {
    const cx = player.x + forward.x * depth;
    const cy = player.y + forward.y * depth;
    if (isOpaque(getTile(player.floor, cx, cy))) {
      occlusionDepth = depth;
      break;
    }
  }

  const furthestDepth = occlusionDepth ?? 3;

  // Draw one dominant side wall per side to avoid stacked duplicates.
  let leftWallDepth = null;
  let rightWallDepth = null;
  for (let depth = 1; depth <= furthestDepth; depth += 1) {
    const px = player.x + forward.x * depth;
    const py = player.y + forward.y * depth;

    if (leftWallDepth === null) {
      const sideLeftTile = getTile(player.floor, px + left.x, py + left.y);
      if (isOpaque(sideLeftTile)) {
        leftWallDepth = depth;
      }
    }

    if (rightWallDepth === null) {
      const sideRightTile = getTile(player.floor, px - left.x, py - left.y);
      if (isOpaque(sideRightTile)) {
        rightWallDepth = depth;
      }
    }
  }

  for (let depth = furthestDepth; depth >= 1; depth -= 1) {
    const px = player.x + forward.x * depth;
    const py = player.y + forward.y * depth;
    const centerTile = getTile(player.floor, px, py);
    const sideLeftTile = getTile(player.floor, px + left.x, py + left.y);
    const sideRightTile = getTile(player.floor, px - left.x, py - left.y);

    if (leftWallDepth === depth) {
      drawSideWallSlice(ctx, depth, "left", isOpaque(sideLeftTile));
    }
    if (rightWallDepth === depth) {
      drawSideWallSlice(ctx, depth, "right", isOpaque(sideRightTile));
    }

    if (isOpaque(centerTile)) {
      const wallTextureKey = depth === 1 ? "wallNear" : depth === 2 ? "wallMid" : "wallFar";
      const fallbackTone = depth === 1 ? "#8b7760" : depth === 2 ? "#6e5f4d" : "#53483d";
      drawCenteredWallSlice(ctx, depth, wallTextureKey, fallbackTone);
    } else if (centerTile === TILE.STAIRS && depth === 1) {
      drawCenteredWallSlice(ctx, depth, "stairs", "#4f6c9e");
    }
  }
}

function snapshotDungeonFrame() {
  const canvas = dungeonCtx.canvas;
  const frame = document.createElement("canvas");
  frame.width = canvas.width;
  frame.height = canvas.height;
  const frameCtx = frame.getContext("2d");
  frameCtx.drawImage(canvas, 0, 0);
  return frame;
}

function beginTurnTransition(direction) {
  if (turnTransition.active) {
    return;
  }

  const oldFrame = snapshotDungeonFrame();

  if (direction === "left") {
    turnPlayerLeft();
  } else {
    turnPlayerRight();
  }
  updateHUD();

  renderFirstPerson();
  const newFrame = snapshotDungeonFrame();

  dungeonCtx.clearRect(0, 0, dungeonCtx.canvas.width, dungeonCtx.canvas.height);
  dungeonCtx.drawImage(oldFrame, 0, 0);

  turnTransition.active = true;
  turnTransition.direction = direction;
  turnTransition.startMs = performance.now();
  turnTransition.oldFrame = oldFrame;
  turnTransition.newFrame = newFrame;
}

function renderTurnTransitionFrame(nowMs) {
  if (!turnTransition.active) {
    return false;
  }

  const canvas = dungeonCtx.canvas;
  const width = canvas.width;
  const height = canvas.height;

  const elapsed = nowMs - turnTransition.startMs;
  const rawT = Math.max(0, Math.min(1, elapsed / TURN_TRANSITION_DURATION_MS));
  const t = rawT * rawT * (3 - 2 * rawT);

  let oldX = 0;
  let newX = 0;
  if (turnTransition.direction === "right") {
    oldX = -t * width;
    newX = width - t * width;
  } else {
    oldX = t * width;
    newX = -width + t * width;
  }

  dungeonCtx.clearRect(0, 0, width, height);
  dungeonCtx.drawImage(turnTransition.oldFrame, oldX, 0);
  dungeonCtx.drawImage(turnTransition.newFrame, newX, 0);

  if (rawT >= 1) {
    turnTransition.active = false;
    turnTransition.oldFrame = null;
    turnTransition.newFrame = null;
  }

  return true;
}

function turnPlayerLeft() {
  player.facing = TURN_LEFT[player.facing];
}

function turnPlayerRight() {
  player.facing = TURN_RIGHT[player.facing];
}

function tryMove(dx, dy) {
  const nx = player.x + dx;
  const ny = player.y + dy;
  const tile = getTile(player.floor, nx, ny);
  if (isOpaque(tile)) return { moved: false, tile };
  player.x = nx;
  player.y = ny;
  return { moved: true, tile };
}

function movePlayerForward() {
  const d = getForwardDelta();
  return tryMove(d.x, d.y);
}

function movePlayerBackward() {
  const d = getForwardDelta();
  return tryMove(-d.x, -d.y);
}

function findInvSlot(itemId) {
  return player.inventory.find((entry) => entry.itemId === itemId);
}

function hasItem(itemId, qty = 1) {
  const slot = findInvSlot(itemId);
  return Boolean(slot && slot.qty >= qty);
}

function addItem(itemId, qty = 1) {
  const item = ITEMS[itemId];
  if (!item) return { ok: false, message: "Unknown item." };
  const slot = findInvSlot(itemId);
  if (slot) {
    slot.qty += qty;
    return { ok: true, message: `Obtained ${item.name} x${qty}.` };
  }
  if (player.inventory.length >= INVENTORY_MAX_SLOTS) return { ok: false, message: "Inventory is full." };
  player.inventory.push({ itemId, qty });
  return { ok: true, message: `Obtained ${item.name} x${qty}.` };
}

function removeItem(itemId, qty = 1) {
  const slot = findInvSlot(itemId);
  if (!slot || slot.qty < qty) return false;
  slot.qty -= qty;
  if (slot.qty <= 0) player.inventory = player.inventory.filter((it) => it !== slot);
  return true;
}

function useItem(itemId) {
  const item = ITEMS[itemId];
  if (!item) return { ok: false, message: "Item does not exist." };
  if (!hasItem(itemId, 1)) return { ok: false, message: `No ${item.name} left.` };
  if (item.type !== "consumable") return { ok: false, message: `${item.name} cannot be used right now.` };

  let changed = false;
  if (item.effect.kind === "restoreHp") {
    const before = player.stats.hp;
    player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + item.effect.value);
    changed = before !== player.stats.hp;
  }
  if (item.effect.kind === "restoreMp") {
    const before = player.stats.mp;
    player.stats.mp = Math.min(player.stats.maxMp, player.stats.mp + item.effect.value);
    changed = changed || before !== player.stats.mp;
  }
  if (!changed) return { ok: false, message: "No effect." };
  removeItem(itemId, 1);
  return { ok: true, message: `Used ${item.name}.` };
}

function getTileAhead() {
  const d = getForwardDelta();
  const x = player.x + d.x;
  const y = player.y + d.y;
  return { x, y, tile: getTile(player.floor, x, y) };
}

function interactAhead() {
  const floor = getFloorData(player.floor);
  if (!floor) return { type: "none", message: "Nothing happens." };

  const ahead = getTileAhead();
  if (ahead.tile === TILE.DOOR_A) {
    if (!hasItem("keyA", 1)) return { type: "locked", message: "The door is locked. Key A is required." };
    removeItem("keyA", 1);
    setTile(player.floor, ahead.x, ahead.y, TILE.OPEN);
    return { type: "door", message: "Used Key A and unlocked the door." };
  }

  if (ahead.tile === TILE.CHEST) {
    const loot = floor.chests[`${ahead.x},${ahead.y}`] || { itemId: "herbB", qty: 1 };
    const result = addItem(loot.itemId, loot.qty);
    if (!result.ok) return { type: "chest", message: result.message };
    setTile(player.floor, ahead.x, ahead.y, TILE.OPEN);
    return { type: "chest", message: `Opened chest. ${result.message}` };
  }

  if (ahead.tile === TILE.STAIRS) {
    return { type: "stairs", targetFloor: player.floor + 1, message: "A stairway leads onward." };
  }

  return { type: "none", message: "Nothing to interact with." };
}

function checkEncounterTrigger() {
  const floor = getFloorData(player.floor);
  if (!floor) return false;
  const currentTile = getTile(player.floor, player.x, player.y);
  if (!floor.encounterTileIds.includes(currentTile)) {
    player.stepsInEncounter = 0;
    return false;
  }
  player.stepsInEncounter += 1;
  if (player.stepsInEncounter < floor.encounterThreshold) return false;
  if (Math.random() < floor.encounterChance) {
    player.stepsInEncounter = 0;
    return true;
  }
  return false;
}

function nextLevelExp(level) {
  return level * LEVEL_EXP_MULTIPLIER;
}

function gainExp(amount) {
  const messages = [];
  player.stats.exp += amount;
  messages.push(`Gained ${amount} EXP.`);
  while (player.stats.exp >= nextLevelExp(player.stats.lvl)) {
    player.stats.exp -= nextLevelExp(player.stats.lvl);
    player.stats.lvl += 1;
    player.stats.maxHp += 5;
    player.stats.hp = player.stats.maxHp;
    const options = ["str", "def", "agi", "int", "lck"];
    const boostKey = options[Math.floor(Math.random() * options.length)];
    player.stats[boostKey] += 1;
    messages.push(`Level up! Reached LVL ${player.stats.lvl}. ${boostKey.toUpperCase()} +1.`);
  }
  return messages;
}

function takeDamage(rawDamage) {
  const dmg = Math.max(1, Math.floor(rawDamage));
  player.stats.hp = Math.max(0, player.stats.hp - dmg);
  return dmg;
}

function spendMp(cost) {
  if (player.stats.mp < cost) return false;
  player.stats.mp -= cost;
  return true;
}

function isPlayerDefeated() {
  return player.stats.hp <= 0;
}

function updateBattleEnemy(enemy) {
  const hpRatio = Math.max(0, enemy.currentHp) / enemy.hp;
  document.getElementById("enemy-name").textContent = enemy.name;
  document.getElementById("enemy-hp-text").textContent = `HP: ${enemy.currentHp} / ${enemy.hp}`;
  document.getElementById("enemy-hp-bar").style.width = `${Math.max(0, hpRatio * 100)}%`;
  const sprite = document.getElementById("enemy-sprite");
  sprite.textContent = enemy.symbol;
  sprite.style.background = enemy.color;
}

function updateBattlePlayer() {
  document.getElementById("battle-player-stats").textContent = `HP: ${player.stats.hp} / ${player.stats.maxHp} | MP: ${player.stats.mp} / ${player.stats.maxMp}`;
}

function setBattleMessage(message) {
  document.getElementById("battle-message").textContent = message;
}

function renderInventoryBlock(containerId, clickHandler) {
  const root = document.getElementById(containerId);
  root.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "inventory-list";

  if (player.inventory.length === 0) {
    const p = document.createElement("p");
    p.textContent = "Inventory is empty.";
    root.appendChild(p);
    return;
  }

  player.inventory.forEach((entry) => {
    const item = ITEMS[entry.itemId];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = `${item.name} x${entry.qty}`;
    btn.dataset.itemId = item.id;
    if (clickHandler) btn.addEventListener("click", () => clickHandler(item.id));
    wrap.appendChild(btn);
  });

  root.appendChild(wrap);
}

function renderStatsBlock() {
  const root = document.getElementById("tab-stats");
  root.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "info-grid";

  const entries = [
    ["LVL", player.stats.lvl],
    ["EXP", player.stats.exp],
    ["Next", player.stats.lvl * 10],
    ["STR", player.stats.str],
    ["DEF", player.stats.def],
    ["AGI", player.stats.agi],
    ["INT", player.stats.int],
    ["LCK", player.stats.lck]
  ];

  entries.forEach(([k, v]) => {
    const line = document.createElement("div");
    line.textContent = `${k}: ${v}`;
    grid.appendChild(line);
  });

  root.appendChild(grid);
}

function refreshInGameMenu() {
  renderInventoryBlock("tab-inventory", (itemId) => {
    const result = useItem(itemId);
    menuCallbacks.onLog(result.message);
    refreshInGameMenu();
    menuCallbacks.onHudRefresh();
  });
  renderStatsBlock();
}

function setActiveTab(tabId) {
  document.querySelectorAll(".menu-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-content").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${tabId}`);
  });
}

function openInGameMenu() {
  setOverlayVisible(true);
  refreshInGameMenu();
  setActiveTab("inventory");
}

function closeInGameMenu() {
  setOverlayVisible(false);
}

function initMenuSystem(callbacks) {
  menuCallbacks = callbacks;

  document.querySelectorAll(".menu-tab").forEach((tab) => {
    tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
  });

  document.querySelectorAll("[data-ingame-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.ingameAction;
      if (action === "save") callbacks.onSave();
      if (action === "quit") callbacks.onQuit();
      if (action === "close") callbacks.onClose();
    });
  });
}

function focusableInGameMenuButtons() {
  return Array.from(document.querySelectorAll("#ingame-menu-screen button:not([disabled])"));
}

function handleInGameMenuKey(event) {
  const buttons = focusableInGameMenuButtons();
  if (buttons.length === 0) return false;

  const current = document.activeElement;
  let idx = buttons.indexOf(current);

  if (event.key === "ArrowDown") {
    idx = (idx + 1 + buttons.length) % buttons.length;
    buttons[idx].focus();
    event.preventDefault();
    return true;
  }

  if (event.key === "ArrowUp") {
    idx = (idx - 1 + buttons.length) % buttons.length;
    buttons[idx].focus();
    event.preventDefault();
    return true;
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    const tabs = Array.from(document.querySelectorAll(".menu-tab"));
    let tabIndex = tabs.findIndex((tab) => tab.classList.contains("active"));
    tabIndex += event.key === "ArrowRight" ? 1 : -1;
    if (tabIndex < 0) tabIndex = tabs.length - 1;
    if (tabIndex >= tabs.length) tabIndex = 0;
    tabs[tabIndex].click();
    tabs[tabIndex].focus();
    event.preventDefault();
    return true;
  }

  if (event.key === "Escape") {
    menuCallbacks.onClose();
    event.preventDefault();
    return true;
  }

  if (event.key === "Enter" && document.activeElement && typeof document.activeElement.click === "function") {
    document.activeElement.click();
    event.preventDefault();
    return true;
  }

  return false;
}

function pickRandomEnemy(enemyIds) {
  const id = enemyIds[Math.floor(Math.random() * enemyIds.length)];
  const base = ENEMIES[id];
  return { ...base, currentHp: base.hp };
}

function closeBattleSubMenus() {
  document.getElementById("magic-menu").classList.add("hidden");
  document.getElementById("battle-item-menu").classList.add("hidden");
}

function openMagicMenu() {
  closeBattleSubMenus();
  document.getElementById("magic-menu").classList.remove("hidden");
}

function openItemMenuInBattle() {
  closeBattleSubMenus();
  document.getElementById("battle-item-menu").classList.remove("hidden");
  renderInventoryBlock("battle-item-list", (itemId) => {
    playerUseItemInBattle(itemId);
  });
}

function enemyTurn() {
  if (!battleState || battleState.ended) return;
  const enemy = battleState.enemy;
  const damage = takeDamage(enemy.str - player.stats.def * 0.35);
  updateBattlePlayer();
  setBattleMessage(`${enemy.name} attacks for ${damage} damage.`);

  if (isPlayerDefeated()) {
    battleState.ended = true;
    battleState.onDefeat();
    return;
  }

  battleState.playerTurn = true;
}

function finishBattleVictory() {
  const enemy = battleState.enemy;
  const messages = [];

  player.gold += enemy.goldReward;
  messages.push(`Victory! +${enemy.expReward} EXP, +${enemy.goldReward} Gold.`);
  gainExp(enemy.expReward).forEach((m) => messages.push(m));

  if (Math.random() < 0.35) {
    const drop = Math.random() < 0.5 ? "herbA" : "vialA";
    const result = addItem(drop, 1);
    messages.push(result.message);
  }

  battleState.ended = true;
  battleState.onVictory(messages);
}

function playerAttackInBattle() {
  if (!battleState || !battleState.playerTurn) return;
  const enemy = battleState.enemy;
  const damage = Math.max(1, player.stats.str - enemy.def);
  enemy.currentHp = Math.max(0, enemy.currentHp - damage);
  updateBattleEnemy(enemy);
  setBattleMessage(`You attack for ${damage} damage.`);

  if (enemy.currentHp <= 0) {
    finishBattleVictory();
    return;
  }

  battleState.playerTurn = false;
  setTimeout(enemyTurn, 350);
}

function playerCastSpellInBattle(spellId) {
  if (!battleState || !battleState.playerTurn) return;
  const spell = SPELLS[spellId];
  if (!spell) return;
  if (!spendMp(spell.mpCost)) {
    setBattleMessage("Not enough MP.");
    return;
  }

  const damage = Math.max(1, player.stats.int + spell.power - battleState.enemy.def);
  battleState.enemy.currentHp = Math.max(0, battleState.enemy.currentHp - damage);
  updateBattlePlayer();
  updateBattleEnemy(battleState.enemy);
  setBattleMessage(`${spell.name} hits for ${damage} damage.`);

  if (battleState.enemy.currentHp <= 0) {
    finishBattleVictory();
    return;
  }

  battleState.playerTurn = false;
  closeBattleSubMenus();
  setTimeout(enemyTurn, 350);
}

function playerUseItemInBattle(itemId) {
  if (!battleState || !battleState.playerTurn) return;
  const result = useItem(itemId);
  setBattleMessage(result.message);
  updateBattlePlayer();
  openItemMenuInBattle();

  if (!result.ok) return;

  battleState.playerTurn = false;
  setTimeout(enemyTurn, 350);
}

function playerTryRunInBattle() {
  if (!battleState || !battleState.playerTurn) return;
  const chance = Math.min(0.9, Math.max(0.1, 0.5 + (player.stats.agi - battleState.enemy.agi) * 0.05));
  if (Math.random() < chance) {
    battleState.ended = true;
    battleState.onRunSuccess();
    return;
  }
  setBattleMessage("Could not escape!");
  battleState.playerTurn = false;
  setTimeout(enemyTurn, 350);
}

function startBattle(enemyPool, callbacks) {
  if (!enemyPool || enemyPool.length === 0) return false;
  battleState = {
    enemy: pickRandomEnemy(enemyPool),
    playerTurn: true,
    ended: false,
    onVictory: callbacks.onVictory,
    onDefeat: callbacks.onDefeat,
    onRunSuccess: callbacks.onRunSuccess
  };

  closeBattleSubMenus();
  updateBattleEnemy(battleState.enemy);
  updateBattlePlayer();
  setBattleMessage(`A wild ${battleState.enemy.name} appears.`);
  return true;
}

function initBattleUI() {
  document.querySelectorAll("#battle-actions [data-battle-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.battleAction;
      if (action === "attack") playerAttackInBattle();
      if (action === "magic") openMagicMenu();
      if (action === "item") openItemMenuInBattle();
      if (action === "run") playerTryRunInBattle();
    });
  });

  document.querySelectorAll("#magic-menu [data-spell]").forEach((btn) => {
    btn.addEventListener("click", () => playerCastSpellInBattle(btn.dataset.spell));
  });

  document.querySelectorAll("[data-submenu-close]").forEach((btn) => {
    btn.addEventListener("click", closeBattleSubMenus);
  });
}

function handleBattleKey(event) {
  const buttons = Array.from(document.querySelectorAll("#battle-actions button:not([disabled])"));
  if (buttons.length === 0) return false;

  const current = document.activeElement;
  let idx = buttons.indexOf(current);

  if (event.key === "ArrowDown") {
    idx = (idx + 1 + buttons.length) % buttons.length;
    buttons[idx].focus();
    event.preventDefault();
    return true;
  }

  if (event.key === "ArrowUp") {
    idx = (idx - 1 + buttons.length) % buttons.length;
    buttons[idx].focus();
    event.preventDefault();
    return true;
  }

  if (event.key === "Escape") {
    closeBattleSubMenus();
    event.preventDefault();
    return true;
  }

  if (event.key === "Enter" && document.activeElement && document.activeElement.dataset.battleAction) {
    document.activeElement.click();
    event.preventDefault();
    return true;
  }

  return false;
}

function setState(nextState) {
  gameState = nextState;

  if (nextState === STATE.MAIN_MENU) {
    showScreen("main-menu-screen");
    setOverlayVisible(false);
    setContinueEnabled(hasSaveData());
  }

  if (nextState === STATE.OPTIONS) {
    showScreen("options-screen");
  }

  if (nextState === STATE.DUNGEON) {
    showScreen("game-screen");
    setOverlayVisible(false);
    updateHUD();
  }

  if (nextState === STATE.MENU) {
    showScreen("game-screen");
    openInGameMenu();
    refreshInGameMenu();
  }

  if (nextState === STATE.BATTLE) {
    showScreen("battle-screen");
    setOverlayVisible(false);
  }

  if (nextState === STATE.GAMEOVER) {
    showScreen("gameover-screen");
    setOverlayVisible(false);
  }
}

function startNewGame() {
  player = createDefaultPlayer();
  placePlayerAtFloorStart(1);
  revealAroundPlayer(1);
  appendMessage("New game started.");
  setState(STATE.DUNGEON);
}

function continueGame() {
  const loaded = loadGame();
  if (!loaded) {
    appendMessage("No save found.");
    return;
  }
  player = loaded;
  revealAroundPlayer(1);
  appendMessage("Save loaded.");
  setState(STATE.DUNGEON);
}

function enterBattle() {
  const floor = getFloorData(player.floor);
  if (!floor) return;

  const started = startBattle(floor.encounterPool, {
    onVictory: (messages) => {
      messages.forEach((msg) => appendMessage(msg));
      updateHUD();
      setState(STATE.DUNGEON);
    },
    onDefeat: () => {
      setState(STATE.GAMEOVER);
    },
    onRunSuccess: () => {
      appendMessage("Escaped battle.");
      setState(STATE.DUNGEON);
    }
  });

  if (started) setState(STATE.BATTLE);
}

function handleInteraction() {
  const result = interactAhead();
  appendMessage(result.message);

  if (result.type === "stairs") {
    const targetFloor = getFloorData(result.targetFloor) ? result.targetFloor : 2;
    placePlayerAtFloorStart(targetFloor);
    revealAroundPlayer(1);
    if (targetFloor === 2) appendMessage("Floor 2 is a placeholder area. More content coming soon.");
  }

  updateHUD();
  refreshInGameMenu();
}

function tryStep(moveFn) {
  const result = moveFn();
  if (!result.moved) {
    if (result.tile === TILE.DOOR_A) {
      appendMessage("Blocked by a locked door.");
    } else if (result.tile === TILE.CHEST) {
      appendMessage("Blocked by a chest.");
    } else if (result.tile === TILE.WALL) {
      appendMessage("Blocked by a wall.");
    } else {
      appendMessage("Blocked.");
    }
    return;
  }

  revealAroundPlayer(1);
  updateHUD();

  if (checkEncounterTrigger()) enterBattle();
}

function handleDungeonInput(event) {
  const k = event.key.toLowerCase();
  if (event.key === "ArrowLeft" || k === "a") {
    beginTurnTransition("left");
    return true;
  }
  if (event.key === "ArrowRight" || k === "d") {
    beginTurnTransition("right");
    return true;
  }
  if (event.key === "ArrowUp" || k === "w") {
    tryStep(movePlayerForward);
    return true;
  }
  if (event.key === "ArrowDown" || k === "s") {
    tryStep(movePlayerBackward);
    return true;
  }
  if (event.key === "Enter" || event.key === " ") {
    handleInteraction();
    return true;
  }
  if (event.key === "Escape") {
    setState(STATE.MENU);
    return true;
  }
  return false;
}

function setupMainMenu() {
  document.querySelectorAll("#main-menu-screen [data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      if (action === "new-game") startNewGame();
      if (action === "continue") continueGame();
      if (action === "options") setState(STATE.OPTIONS);
    });
  });

  document.querySelector("#options-screen [data-action='back-to-main']").addEventListener("click", () => {
    setState(STATE.MAIN_MENU);
  });

  document.querySelector("#gameover-screen [data-action='gameover-main']").addEventListener("click", () => {
    setState(STATE.MAIN_MENU);
  });

  document.getElementById("open-menu-button").addEventListener("click", () => {
    if (gameState === STATE.DUNGEON) setState(STATE.MENU);
  });
}

function setupMenuCallbacks() {
  initMenuSystem({
    onSave: () => {
      saveGame();
      appendMessage("Game saved.");
      setContinueEnabled(true);
    },
    onQuit: () => {
      closeInGameMenu();
      setState(STATE.MAIN_MENU);
    },
    onClose: () => {
      closeInGameMenu();
      setState(STATE.DUNGEON);
    },
    onLog: (message) => {
      appendMessage(message);
      updateHUD();
    },
    onHudRefresh: () => {
      updateHUD();
    }
  });
}

function setupKeyboardNavigation() {
  document.addEventListener("keydown", (event) => {
    if (gameState === STATE.DUNGEON && handleDungeonInput(event)) {
      event.preventDefault();
      return;
    }

    if (gameState === STATE.MENU && handleInGameMenuKey(event)) return;
    if (gameState === STATE.BATTLE && handleBattleKey(event)) return;

    if (gameState === STATE.MAIN_MENU) {
      const options = Array.from(document.querySelectorAll("#main-menu-screen .menu-list button"));
      const current = document.activeElement;
      let idx = options.indexOf(current);

      if (event.key === "ArrowDown") {
        idx = (idx + 1 + options.length) % options.length;
        options[idx].focus();
        event.preventDefault();
      }

      if (event.key === "ArrowUp") {
        idx = (idx - 1 + options.length) % options.length;
        options[idx].focus();
        event.preventDefault();
      }

      if (event.key === "Enter" && document.activeElement && document.activeElement.dataset.action) {
        document.activeElement.click();
        event.preventDefault();
      }
    }
  });
}

function renderLoop() {
  if (gameState === STATE.DUNGEON || gameState === STATE.MENU) {
    if (!renderTurnTransitionFrame(performance.now())) {
      renderFirstPerson();
    }
    renderMinimap();
  }
  requestAnimationFrame(renderLoop);
}

function init() {
  dungeonCtx = document.getElementById("dungeon-canvas").getContext("2d");
  minimapCtx = document.getElementById("minimap-canvas").getContext("2d");
  preloadTextures();

  setupMainMenu();
  setupMenuCallbacks();
  initBattleUI();
  setupKeyboardNavigation();

  setState(STATE.MAIN_MENU);
  requestAnimationFrame(renderLoop);
}

window.addEventListener("DOMContentLoaded", () => {
  player = createDefaultPlayer();
  init();
});
