const SAVE_KEY = "dungeonCrawlerFrameworkSave";

export function hasSaveData() {
  return Boolean(localStorage.getItem(SAVE_KEY));
}

export function saveGame(player) {
  const payload = JSON.stringify(player);
  localStorage.setItem(SAVE_KEY, payload);
}

export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
