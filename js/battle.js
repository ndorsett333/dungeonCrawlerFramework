import { pickRandomEnemy } from "./enemies.js";
import { SPELLS } from "./items.js";
import { addItem, useItem } from "./inventory.js";
import { gainExp, isPlayerDefeated, spendMp, takeDamage } from "./player.js";
import { renderInventoryBlock, setBattleMessage, updateBattleEnemy, updateBattlePlayer } from "./ui.js";

let battleState = null;

function battleButtons() {
  return Array.from(document.querySelectorAll("#battle-actions button:not([disabled])"));
}

function closeSubMenus() {
  document.getElementById("magic-menu").classList.add("hidden");
  document.getElementById("battle-item-menu").classList.add("hidden");
}

function openMagicMenu() {
  closeSubMenus();
  document.getElementById("magic-menu").classList.remove("hidden");
}

function openItemMenu(player) {
  closeSubMenus();
  document.getElementById("battle-item-menu").classList.remove("hidden");
  renderInventoryBlock("battle-item-list", player, (itemId) => {
    playerUseItem(itemId);
  });
}

function enemyTurn() {
  if (!battleState || battleState.ended) {
    return;
  }

  const { player, enemy } = battleState;
  const damage = takeDamage(player, enemy.str - player.stats.def * 0.35);
  updateBattlePlayer(player);
  setBattleMessage(`${enemy.name} attacks for ${damage} damage.`);

  if (isPlayerDefeated(player)) {
    battleState.ended = true;
    battleState.onDefeat();
    return;
  }

  battleState.playerTurn = true;
}

function finishVictory() {
  const { player, enemy } = battleState;
  const messages = [];

  player.gold += enemy.goldReward;
  messages.push(`Victory! +${enemy.expReward} EXP, +${enemy.goldReward} Gold.`);

  gainExp(player, enemy.expReward).forEach((msg) => messages.push(msg));

  if (Math.random() < 0.35) {
    const drop = Math.random() < 0.5 ? "herbA" : "vialA";
    const result = addItem(player, drop, 1);
    messages.push(result.message);
  }

  battleState.ended = true;
  battleState.onVictory(messages);
}

function playerAttack() {
  if (!battleState || !battleState.playerTurn) {
    return;
  }

  const { player, enemy } = battleState;
  const damage = Math.max(1, player.stats.str - enemy.def);
  enemy.currentHp = Math.max(0, enemy.currentHp - damage);

  updateBattleEnemy(enemy);
  setBattleMessage(`You attack for ${damage} damage.`);

  if (enemy.currentHp <= 0) {
    finishVictory();
    return;
  }

  battleState.playerTurn = false;
  setTimeout(enemyTurn, 350);
}

function playerCastSpell(spellId) {
  if (!battleState || !battleState.playerTurn) {
    return;
  }

  const spell = SPELLS[spellId];
  if (!spell) {
    return;
  }

  if (!spendMp(battleState.player, spell.mpCost)) {
    setBattleMessage("Not enough MP.");
    return;
  }

  const damage = Math.max(1, battleState.player.stats.int + spell.power - battleState.enemy.def);
  battleState.enemy.currentHp = Math.max(0, battleState.enemy.currentHp - damage);

  updateBattlePlayer(battleState.player);
  updateBattleEnemy(battleState.enemy);
  setBattleMessage(`${spell.name} hits for ${damage} damage.`);

  if (battleState.enemy.currentHp <= 0) {
    finishVictory();
    return;
  }

  battleState.playerTurn = false;
  closeSubMenus();
  setTimeout(enemyTurn, 350);
}

function playerUseItem(itemId) {
  if (!battleState || !battleState.playerTurn) {
    return;
  }

  const result = useItem(battleState.player, itemId);
  setBattleMessage(result.message);
  updateBattlePlayer(battleState.player);
  openItemMenu(battleState.player);

  if (!result.ok) {
    return;
  }

  battleState.playerTurn = false;
  setTimeout(enemyTurn, 350);
}

function playerTryRun() {
  if (!battleState || !battleState.playerTurn) {
    return;
  }

  const chance = Math.min(0.9, Math.max(0.1, 0.5 + (battleState.player.stats.agi - battleState.enemy.agi) * 0.05));
  if (Math.random() < chance) {
    battleState.ended = true;
    battleState.onRunSuccess();
    return;
  }

  setBattleMessage("Could not escape!");
  battleState.playerTurn = false;
  setTimeout(enemyTurn, 350);
}

export function startBattle(player, enemyPool, callbacks) {
  const enemy = pickRandomEnemy(enemyPool);
  if (!enemy) {
    return false;
  }

  battleState = {
    player,
    enemy,
    playerTurn: true,
    ended: false,
    onVictory: callbacks.onVictory,
    onDefeat: callbacks.onDefeat,
    onRunSuccess: callbacks.onRunSuccess
  };

  closeSubMenus();
  updateBattleEnemy(enemy);
  updateBattlePlayer(player);
  setBattleMessage(`A wild ${enemy.name} appears.`);
  return true;
}

export function initBattleUI() {
  document.querySelectorAll("#battle-actions [data-battle-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.battleAction;
      if (action === "attack") playerAttack();
      if (action === "magic") openMagicMenu();
      if (action === "item") openItemMenu(battleState.player);
      if (action === "run") playerTryRun();
    });
  });

  document.querySelectorAll("#magic-menu [data-spell]").forEach((btn) => {
    btn.addEventListener("click", () => {
      playerCastSpell(btn.dataset.spell);
    });
  });

  document.querySelectorAll("[data-submenu-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeSubMenus());
  });
}

export function handleBattleKey(event) {
  const buttons = battleButtons();
  if (buttons.length === 0) {
    return false;
  }

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
    closeSubMenus();
    event.preventDefault();
    return true;
  }

  if (event.key === "Enter" && document.activeElement?.dataset.battleAction) {
    document.activeElement.click();
    event.preventDefault();
    return true;
  }

  return false;
}
