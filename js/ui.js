import { ITEMS } from "./items.js";

export function showScreen(screenId) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === screenId || (screen.id === "ingame-menu-screen" && screenId === "ingame-menu-screen"));
  });
}

export function setOverlayVisible(visible) {
  const overlay = document.getElementById("ingame-menu-screen");
  overlay.classList.toggle("active", visible);
}

export function setContinueEnabled(enabled) {
  const btn = document.getElementById("continue-button");
  btn.disabled = !enabled;
}

export function updateHUD(player) {
  document.getElementById("hud-hp").textContent = `HP: ${player.stats.hp} / ${player.stats.maxHp}`;
  document.getElementById("hud-mp").textContent = `MP: ${player.stats.mp} / ${player.stats.maxMp}`;
  document.getElementById("hud-gold").textContent = `Gold: ${player.gold}`;
  document.getElementById("hud-compass").textContent = `Dir: ${player.facing}`;
  document.getElementById("hud-floor").textContent = `Floor: ${player.floor}`;
}

export function appendMessage(message) {
  const log = document.getElementById("message-log");
  const line = document.createElement("div");
  line.textContent = message;
  log.prepend(line);

  while (log.children.length > 6) {
    log.removeChild(log.lastElementChild);
  }
}

export function updateBattleEnemy(enemy) {
  const hpRatio = Math.max(0, enemy.currentHp) / enemy.hp;
  document.getElementById("enemy-name").textContent = enemy.name;
  document.getElementById("enemy-hp-text").textContent = `HP: ${enemy.currentHp} / ${enemy.hp}`;
  document.getElementById("enemy-hp-bar").style.width = `${Math.max(0, hpRatio * 100)}%`;

  const sprite = document.getElementById("enemy-sprite");
  sprite.textContent = enemy.symbol;
  sprite.style.background = enemy.color;
}

export function updateBattlePlayer(player) {
  document.getElementById("battle-player-stats").textContent = `HP: ${player.stats.hp} / ${player.stats.maxHp} | MP: ${player.stats.mp} / ${player.stats.maxMp}`;
}

export function setBattleMessage(message) {
  document.getElementById("battle-message").textContent = message;
}

export function renderInventoryBlock(containerId, player, clickHandler) {
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
    if (clickHandler) {
      btn.addEventListener("click", () => clickHandler(item.id));
    }
    wrap.appendChild(btn);
  });

  root.appendChild(wrap);
}

export function renderStatsBlock(player) {
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
