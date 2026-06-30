import { addItem, hasItem, removeItem } from "./inventory.js";

export const TILE = {
  OPEN: 0,
  WALL: 1,
  DOOR_A: 2,
  CHEST: 3,
  STAIRS: 4,
  ENCOUNTER: 6
};

const DIRS = {
  N: { x: 0, y: -1 },
  E: { x: 1, y: 0 },
  S: { x: 0, y: 1 },
  W: { x: -1, y: 0 }
};

const TURN_LEFT = { N: "W", W: "S", S: "E", E: "N" };
const TURN_RIGHT = { N: "E", E: "S", S: "W", W: "N" };

const FLOORS = {
  1: {
    id: 1,
    name: "Floor 1",
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
    encounterTileIds: [TILE.ENCOUNTER],
    encounterPool: ["01", "02", "03"],
    encounterThreshold: 3,
    encounterChance: 0.45,
    chests: {
      "3,3": { itemId: "keyA", qty: 1 }
    }
  },
  2: {
    id: 2,
    name: "Floor 2",
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

function isOpaque(tile) {
  return tile === TILE.WALL || tile === TILE.DOOR_A || tile === TILE.CHEST;
}

function isBlocking(tile) {
  return tile === TILE.WALL || tile === TILE.DOOR_A || tile === TILE.CHEST;
}

function coordKey(x, y) {
  return `${x},${y}`;
}

export function getFloorData(floorId) {
  return FLOORS[floorId] || null;
}

export function getTile(floorId, x, y) {
  const floor = getFloorData(floorId);
  if (!floor) {
    return TILE.WALL;
  }

  if (y < 0 || y >= floor.map.length || x < 0 || x >= floor.map[0].length) {
    return TILE.WALL;
  }

  return floor.map[y][x];
}

export function setTile(floorId, x, y, tileValue) {
  const floor = getFloorData(floorId);
  if (!floor || y < 0 || y >= floor.map.length || x < 0 || x >= floor.map[0].length) {
    return;
  }

  floor.map[y][x] = tileValue;
}

export function placePlayerAtFloorStart(player, floorId) {
  const floor = getFloorData(floorId);
  if (!floor) {
    return;
  }

  player.floor = floorId;
  player.x = floor.start.x;
  player.y = floor.start.y;
  player.facing = floor.start.facing;
}

export function turnPlayerLeft(player) {
  player.facing = TURN_LEFT[player.facing];
}

export function turnPlayerRight(player) {
  player.facing = TURN_RIGHT[player.facing];
}

export function getForwardDelta(player) {
  return DIRS[player.facing];
}

function getLeftDelta(player) {
  const leftFacing = TURN_LEFT[player.facing];
  return DIRS[leftFacing];
}

export function movePlayerForward(player) {
  const d = getForwardDelta(player);
  return tryMove(player, d.x, d.y);
}

export function movePlayerBackward(player) {
  const d = getForwardDelta(player);
  return tryMove(player, -d.x, -d.y);
}

function tryMove(player, dx, dy) {
  const nx = player.x + dx;
  const ny = player.y + dy;
  const tile = getTile(player.floor, nx, ny);
  if (isBlocking(tile)) {
    return { moved: false, tile };
  }

  player.x = nx;
  player.y = ny;
  return { moved: true, tile };
}

export function getTileAhead(player) {
  const d = getForwardDelta(player);
  const tx = player.x + d.x;
  const ty = player.y + d.y;
  return {
    x: tx,
    y: ty,
    tile: getTile(player.floor, tx, ty)
  };
}

export function interactAhead(player) {
  const floor = getFloorData(player.floor);
  if (!floor) {
    return { type: "none", message: "Nothing happens." };
  }

  const ahead = getTileAhead(player);
  if (ahead.tile === TILE.DOOR_A) {
    if (!hasItem(player, "keyA", 1)) {
      return { type: "locked", message: "The door is locked. Key A is required." };
    }

    removeItem(player, "keyA", 1);
    setTile(player.floor, ahead.x, ahead.y, TILE.OPEN);
    return { type: "door", message: "Used Key A and unlocked the door." };
  }

  if (ahead.tile === TILE.CHEST) {
    const loot = floor.chests[coordKey(ahead.x, ahead.y)] || { itemId: "herbB", qty: 1 };
    const result = addItem(player, loot.itemId, loot.qty);
    if (!result.ok) {
      return { type: "chest", message: result.message };
    }

    setTile(player.floor, ahead.x, ahead.y, TILE.OPEN);
    return { type: "chest", message: `Opened chest. ${result.message}` };
  }

  if (ahead.tile === TILE.STAIRS) {
    return { type: "stairs", targetFloor: player.floor + 1, message: "A stairway leads onward." };
  }

  return { type: "none", message: "Nothing to interact with." };
}

export function revealTile(player, x, y) {
  const floorKey = String(player.floor);
  if (!player.explored[floorKey]) {
    player.explored[floorKey] = {};
  }

  player.explored[floorKey][coordKey(x, y)] = true;
}

export function revealAroundPlayer(player, radius = 1) {
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      revealTile(player, player.x + dx, player.y + dy);
    }
  }
}

function isRevealed(player, floorId, x, y) {
  const floorKey = String(floorId);
  return Boolean(player.explored[floorKey] && player.explored[floorKey][coordKey(x, y)]);
}

export function renderMinimap(ctx, player) {
  const floor = getFloorData(player.floor);
  if (!floor) {
    return;
  }

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
      if (!isRevealed(player, player.floor, x, y)) {
        continue;
      }

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
  ctx.beginPath();
  ctx.arc((player.x + 0.5) * tileW, (player.y + 0.5) * tileH, Math.max(2, tileW * 0.2), 0, Math.PI * 2);
  ctx.fill();
}

function drawCenteredWallSlice(ctx, depthIndex, color) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const scales = [0.32, 0.5, 0.74];
  const offsets = [0.06, 0.04, 0.02];

  const scale = scales[depthIndex];
  const panelW = width * scale;
  const panelH = height * (scale + 0.08);
  const x = (width - panelW) / 2;
  const y = (height - panelH) / 2 + height * offsets[depthIndex];

  ctx.fillStyle = color;
  ctx.fillRect(x, y, panelW, panelH);
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.strokeRect(x, y, panelW, panelH);
}

function drawSideWallSlice(ctx, depthIndex, side, solid) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const far = depthIndex === 0;
  const near = depthIndex === 2;

  const paneW = near ? width * 0.2 : far ? width * 0.1 : width * 0.15;
  const paneH = near ? height * 0.75 : far ? height * 0.4 : height * 0.58;
  const y = (height - paneH) / 2 + (near ? 16 : far ? 40 : 28);
  const x = side === "left" ? 0 : width - paneW;

  ctx.fillStyle = solid ? "#59657d" : "rgba(89,101,125,0.18)";
  ctx.fillRect(x, y, paneW, paneH);
}

export function renderFirstPerson(ctx, player) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#566077";
  ctx.fillRect(0, 0, width, height / 2);
  ctx.fillStyle = "#2a3446";
  ctx.fillRect(0, height / 2, width, height / 2);

  const forward = getForwardDelta(player);
  const left = getLeftDelta(player);

  for (let depth = 3; depth >= 1; depth -= 1) {
    const px = player.x + forward.x * depth;
    const py = player.y + forward.y * depth;
    const centerTile = getTile(player.floor, px, py);

    const sideLeftTile = getTile(player.floor, px + left.x, py + left.y);
    const sideRightTile = getTile(player.floor, px - left.x, py - left.y);

    drawSideWallSlice(ctx, depth - 1, "left", isOpaque(sideLeftTile));
    drawSideWallSlice(ctx, depth - 1, "right", isOpaque(sideRightTile));

    if (isOpaque(centerTile)) {
      const tone = depth === 1 ? "#8b7760" : depth === 2 ? "#6e5f4d" : "#53483d";
      drawCenteredWallSlice(ctx, depth - 1, tone);
    } else if (centerTile === TILE.STAIRS && depth === 1) {
      drawCenteredWallSlice(ctx, depth - 1, "#4f6c9e");
    }
  }
}

export function checkEncounterTrigger(player) {
  const floor = getFloorData(player.floor);
  if (!floor) {
    return false;
  }

  const currentTile = getTile(player.floor, player.x, player.y);
  if (!floor.encounterTileIds.includes(currentTile)) {
    player.stepsInEncounter = 0;
    return false;
  }

  player.stepsInEncounter += 1;
  if (player.stepsInEncounter < floor.encounterThreshold) {
    return false;
  }

  if (Math.random() < floor.encounterChance) {
    player.stepsInEncounter = 0;
    return true;
  }

  return false;
}
