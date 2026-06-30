import { ITEMS } from "./items.js";

export const INVENTORY_MAX_SLOTS = 16;

function findSlot(inventory, itemId) {
  return inventory.find((entry) => entry.itemId === itemId);
}

export function hasItem(player, itemId, qty = 1) {
  const slot = findSlot(player.inventory, itemId);
  return Boolean(slot && slot.qty >= qty);
}

export function addItem(player, itemId, qty = 1) {
  const item = ITEMS[itemId];
  if (!item) {
    return { ok: false, message: "Unknown item." };
  }

  const existing = findSlot(player.inventory, itemId);
  if (existing) {
    existing.qty += qty;
    return { ok: true, message: `Obtained ${item.name} x${qty}.` };
  }

  if (player.inventory.length >= INVENTORY_MAX_SLOTS) {
    return { ok: false, message: "Inventory is full." };
  }

  player.inventory.push({ itemId, qty });
  return { ok: true, message: `Obtained ${item.name} x${qty}.` };
}

export function removeItem(player, itemId, qty = 1) {
  const existing = findSlot(player.inventory, itemId);
  if (!existing || existing.qty < qty) {
    return false;
  }

  existing.qty -= qty;
  if (existing.qty <= 0) {
    player.inventory = player.inventory.filter((entry) => entry !== existing);
  }
  return true;
}

export function listInventory(player) {
  return player.inventory.map((entry) => ({
    ...entry,
    item: ITEMS[entry.itemId]
  }));
}

export function useItem(player, itemId) {
  const item = ITEMS[itemId];
  if (!item) {
    return { ok: false, message: "Item does not exist." };
  }

  if (!hasItem(player, itemId, 1)) {
    return { ok: false, message: `No ${item.name} left.` };
  }

  if (item.type !== "consumable") {
    return { ok: false, message: `${item.name} cannot be used right now.` };
  }

  let changed = false;
  if (item.effect.kind === "restoreHp") {
    const before = player.stats.hp;
    player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + item.effect.value);
    changed = before !== player.stats.hp;
  }

  if (item.effect.kind === "restoreMp") {
    const before = player.stats.mp;
    player.stats.mp = Math.min(player.stats.maxMp, player.stats.mp + item.effect.value);
    changed = before !== player.stats.mp;
  }

  if (!changed) {
    return { ok: false, message: "No effect." };
  }

  removeItem(player, itemId, 1);
  return { ok: true, message: `Used ${item.name}.` };
}
