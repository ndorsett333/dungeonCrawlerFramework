export const ITEMS = {
  herbA: {
    id: "herbA",
    name: "Herb A",
    type: "consumable",
    category: "consumables",
    effect: { kind: "restoreHp", value: 10 },
    description: "Restore 10 HP"
  },
  herbB: {
    id: "herbB",
    name: "Herb B",
    type: "consumable",
    category: "consumables",
    effect: { kind: "restoreHp", value: 20 },
    description: "Restore 20 HP"
  },
  vialA: {
    id: "vialA",
    name: "Vial A",
    type: "consumable",
    category: "consumables",
    effect: { kind: "restoreMp", value: 10 },
    description: "Restore 10 MP"
  },
  weaponA: {
    id: "weaponA",
    name: "Weapon A",
    type: "equipment",
    slot: "weapon",
    bonus: "+2 STR",
    category: "equipment",
    description: "Equipment stub"
  },
  armorA: {
    id: "armorA",
    name: "Armor A",
    type: "equipment",
    slot: "body",
    bonus: "+2 DEF",
    category: "equipment",
    description: "Equipment stub"
  },
  accessoryA: {
    id: "accessoryA",
    name: "Accessory A",
    type: "equipment",
    slot: "ring",
    bonus: "+1 LCK",
    category: "equipment",
    description: "Equipment stub"
  },
  keyA: {
    id: "keyA",
    name: "Key A",
    type: "key",
    category: "keyItems",
    description: "Opens locked door type A"
  },
  keyB: {
    id: "keyB",
    name: "Key B",
    type: "key",
    category: "keyItems",
    description: "Opens locked door type B"
  }
};

export const SPELLS = {
  spellA: { id: "spellA", name: "Spell A", mpCost: 4, power: 8 },
  spellB: { id: "spellB", name: "Spell B", mpCost: 6, power: 12 },
  spellC: { id: "spellC", name: "Spell C", mpCost: 8, power: 16 }
};
