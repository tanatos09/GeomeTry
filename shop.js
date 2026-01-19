// ===================================================================
// SHOP.JS - Systém Upgradů (Barvy a Ostré Hrany)
// ===================================================================
// Účel: Definice všech upgradů a jejich stav, výpočty bonusů
//
// Upgrady jsou rozděleny do 2 kategorií:
// 1. Barevné upgrady (Color) - zvyšují sbírané úhly
// 2. Upgrady ostrých hran (Sharpness) - zvyšují XP za zabité nepřátele
//
// Příklad:
//   Red (cost 10, +1 angle) → Orange (cost 20, +2 angles) atd.
// ===================================================================

export const shopSystem = {
  // ===================================================================
  // BAREVNÉ UPGRADY (COLOR UPGRADES)
  // ===================================================================
  // Zvyšují počet úhlů získaných ze sbírání a nepřátel
  // Existuje 5 úrovní: Red → Orange → Gold → Turquoise → Purple
  // Cena roste: 10 → 20 → 35 → 55 → 80
  
  colorUpgrades: [
    {
      id: 'color_1',
      name: 'Red',                    // Název upgradu
      cost: 10,                        // Cena v úhlech (angles)
      color: '#ff6b9d',               // Barva hráče když je aktivní
      angleBonus: 1,                  // Bonus úhlů +1
      description: '+1 angle'         // Krátký popis
    },
    {
      id: 'color_2',
      name: 'Orange',
      cost: 20,                        // Další krok (kumulativní cena je 10+20=30)
      color: '#ff9f43',
      angleBonus: 2,                  // Zvýšení bonusu na +2
      description: '+2 angles'
    },
    {
      id: 'color_3',
      name: 'Gold',
      cost: 35,                        // Kumulativní: 10+20+35=65
      color: '#ffd32a',
      angleBonus: 5,                  // Zvýšení na +5 (skokové zvýšení)
      description: '+5 angles'
    },
    {
      id: 'color_4',
      name: 'Turquoise',
      cost: 55,                        // Kumulativní: 10+20+35+55=120
      color: '#00ddff',
      angleBonus: 10,                 // Zkokové zvýšení na +10
      description: '+10 angles'
    },
    {
      id: 'color_5',
      name: 'Purple',
      cost: 80,                        // Kumulativní: 10+20+35+55+80=200
      color: '#9d4edd',
      angleBonus: 15,                 // Nejvyšší bonus +15
      description: '+15 angles'
    }
  ],
  
  // ===================================================================
  // UPGRADY OSTRÝCH HRAN (SHARPNESS UPGRADES)
  // ===================================================================
  // Zvyšují XP získaný za zabití nepřátel
  // Existuje 5 úrovní: Sharp → Very Sharp → Steel → Diamond → Plasma
  // Cena stejná jako Color upgrades (10, 20, 35, 55, 80)
  
  sharpnessUpgrades: [
    {
      id: 'sharp_1',
      name: 'Sharp',                  // Úroveň 1
      cost: 10,
      xpBonus: 1,                     // Bonus XP +1
      description: '+1 XP'
    },
    {
      id: 'sharp_2',
      name: 'Very Sharp',             // Úroveň 2
      cost: 20,
      xpBonus: 2,                     // Bonus XP +2
      description: '+2 XP'
    },
    {
      id: 'sharp_3',
      name: 'Steel',                  // Úroveň 3
      cost: 35,
      xpBonus: 5,                     // Skokové zvýšení na +5
      description: '+5 XP'
    },
    {
      id: 'sharp_4',
      name: 'Diamond',                // Úroveň 4
      cost: 55,
      xpBonus: 10,                    // Skokové zvýšení na +10
      description: '+10 XP'
    },
    {
      id: 'sharp_5',
      name: 'Plasma',                 // Úroveň 5 - nejlepší
      cost: 80,
      xpBonus: 20,                    // Skokové zvýšení na +20 (nejlepší)
      description: '+20 XP'
    }
  ],
  
  // ===================================================================
  // STAV VYBRANÝCH UPGRADŮ
  // ===================================================================
  // Tato čísla se nastavují když hráč koupi upgrade
  
  // Aktuálně vybraná úroveň barevného upgradu
  // 0 = základní (bez upgradu), 1-5 = jednotlivé úrovně
  selectedColorLevel: 0,
  
  // Aktuálně vybraná úroveň upgradu ostrých hran
  // 0 = základní (bez upgradu), 1-5 = jednotlivé úrovně
  selectedSharpnessLevel: 0,
  
  // ===================================================================
  // METODY ZÍSKÁNÍ AKTUÁLNÍCH HODNOT
  // ===================================================================
  
  // Vrátí aktuální barvu hráče podle zvoleného upgradu
  getPlayerColor() {
    // Pokud není koupen upgrade (level 0), vrátí základní azurovou
    if (this.selectedColorLevel === 0) {
      return '#00f0ff';  // Kyanová (základní)
    }
    
    // Jinak vrátí barvu vybraného upgradu
    // selectedColorLevel je 1-5, takže index je selectedColorLevel - 1
    return this.colorUpgrades[this.selectedColorLevel - 1].color;
  },
  
  // Vrátí aktuální bonus k úhlům (počet navíc úhlů za sběr)
  getAngleBonusMultiplier() {
    // Bez upgradu = bez bonusu
    if (this.selectedColorLevel === 0) {
      return 0;
    }
    
    // Jinak vrátí angleBonus z vybraného upgradu
    // Např. selectedColorLevel=2 → colorUpgrades[1].angleBonus = 2
    return this.colorUpgrades[this.selectedColorLevel - 1].angleBonus;
  },
  
  // Vrátí aktuální bonus k XP (počet navíc XP za zabití nepřítele)
  getXPBonusMultiplier() {
    // Bez upgradu = bez bonusu
    if (this.selectedSharpnessLevel === 0) {
      return 0;
    }
    
    // Jinak vrátí xpBonus z vybraného upgradu
    // Např. selectedSharpnessLevel=3 → sharpnessUpgrades[2].xpBonus = 5
    return this.sharpnessUpgrades[this.selectedSharpnessLevel - 1].xpBonus;
  },
  
  // ===================================================================
  // METODY PRO NÁKUP (LEGACY - HLAVNÍ LOGIKA JE V RENDER.JS)
  // ===================================================================
  
  // Koupí barevný upgrade na danou úroveň (legacy)
  // Poznámka: Hlavní logika je v render.js → buyColorUpgrade()
  buyColorUpgrade(level) {
    // Validace: level musí být 1-5
    if (level < 1 || level > 5) return false;
    
    // Pokud je nižší úroveň koupen, pokud je vyšší k dosažení
    if (this.selectedColorLevel < level) {
      return true;  // Logika platby je v render.js
    }
    return false;
  },
  
  // Koupí upgrade ostrých hran na danou úroveň (legacy)
  buySharpnessUpgrade(level) {
    // Validace: level musí být 1-5
    if (level < 1 || level > 5) return false;
    
    // Pokud je nižší úroveň koupen, pokud je vyšší k dosažení
    if (this.selectedSharpnessLevel < level) {
      return true;  // Logika platby je v render.js
    }
    return false;
  },
  
  // ===================================================================
  // VÝPOČTY CEN
  // ===================================================================
  
  // Vrátí cenu pro upgrade barvy na danou úroveň
  // Počítá všechny kroky od aktuální úrovně
  // Příklad: selectedColorLevel=0, targetLevel=3 → 10+20+35=65
  getColorUpgradeCost(targetLevel) {
    let totalCost = 0;
    
    // Projdi od aktuální úrovně až do cíl úrovně
    // Sečti všechny ceny
    for (let i = this.selectedColorLevel; i < targetLevel; i++) {
      totalCost += this.colorUpgrades[i].cost;
    }
    
    return totalCost;  // Vrátí celková cena
  },
  
  // Vrátí cenu pro upgrade ostrých hran na danou úroveň
  // Stejná logika jako getColorUpgradeCost
  getSharpnessUpgradeCost(targetLevel) {
    let totalCost = 0;
    
    // Projdi od aktuální úrovně až do cíl úrovně
    for (let i = this.selectedSharpnessLevel; i < targetLevel; i++) {
      totalCost += this.sharpnessUpgrades[i].cost;
    }
    
    return totalCost;  // Vrátí celková cena
  },
  
  // ===================================================================
  // RESET UPGRADU
  // ===================================================================
  
  // Resetuje upgrady na jejich základní stav
  // Volá se při levelupu - nový level přináší nové upgrady
  resetUpgrades() {
    // Vrátí obě úrovně na 0 (bez upgradu)
    // Hráč si bude muset koupit upgrady znovu v novém levelu
    // POZNÁMKA: V praxi se asi neměly resetovat - zkontroluj game design!
    this.selectedColorLevel = 0;
    this.selectedSharpnessLevel = 0;
  }
};
