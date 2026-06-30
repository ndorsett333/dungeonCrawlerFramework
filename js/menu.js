import { renderInventoryBlock, renderStatsBlock, setOverlayVisible } from "./ui.js";
import { useItem } from "./inventory.js";

let activeTab = "inventory";
let menuCallbacks = null;
let playerRef = null;

function setActiveTab(tabId) {
  activeTab = tabId;
  document.querySelectorAll(".menu-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabId);
  });

  document.querySelectorAll(".tab-content").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${tabId}`);
  });
}

function focusableInMenu() {
  return Array.from(document.querySelectorAll("#ingame-menu-screen button:not([disabled])"));
}

export function initMenuSystem(callbacks) {
  menuCallbacks = callbacks;

  document.querySelectorAll(".menu-tab").forEach((tab) => {
    tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
  });

  document.querySelectorAll("[data-ingame-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.ingameAction;
      if (action === "save") menuCallbacks.onSave();
      if (action === "quit") menuCallbacks.onQuit();
      if (action === "close") menuCallbacks.onClose();
    });
  });
}

export function openInGameMenu(player) {
  playerRef = player;
  setOverlayVisible(true);
  refreshInGameMenu();
  setActiveTab("inventory");
}

export function closeInGameMenu() {
  setOverlayVisible(false);
}

export function refreshInGameMenu() {
  if (!playerRef) {
    return;
  }

  renderInventoryBlock("tab-inventory", playerRef, (itemId) => {
    const result = useItem(playerRef, itemId);
    menuCallbacks.onLog(result.message);
    refreshInGameMenu();
    menuCallbacks.onHudRefresh();
  });
  renderStatsBlock(playerRef);
}

export function handleInGameMenuKey(event) {
  const buttons = focusableInMenu();
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

  if (event.key === "Enter") {
    if (document.activeElement && typeof document.activeElement.click === "function") {
      document.activeElement.click();
      event.preventDefault();
      return true;
    }
  }

  return false;
}
