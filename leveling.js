// ===================================================================
// LEVELING.JS - Systém Levelování, XP a Měny (Úhly)
// ===================================================================
// Účel: Spravuje XP, úrovně hráče, měnu (úhly) a nákup upgradů tvarů
//
// Klíčové prvky:
// - XP systém: získání XP za zabití nepřátel
// - Levelup: zvýšení levelu s bonusy
// - Měna (Angles): sbírá se z nepřátel a letajících objektů
// - Aura efekt: vizuální efekt při levelupu
// - Nákup tvarů: přidání stran polygonu (3 → 4 → 5 stran atd.)
// ===================================================================

import { geome } from './player.js';           // Objekt hráče (sides atd.)
import { shopSystem } from './shop.js';         // Upgrady a jejich bonusy

export const levelSystem = {
  // ===================================================================
  // STAV - AKTUÁLNÍ HODNOTY HRÁČE
  // ===================================================================
  
  // Aktuální level hráče (1, 2, 3, ...)
  currentLevel: 1,
  
  // XP k dosažení příštího levelu
  currentXP: 0,
  
  // Totální XP získaný za všechny časy
  totalXP: 0,
  
  // Počet stran polygonu hráče
  // Začíná na 3 (trojúhelník), lze zvýšit nákupem
  playerSides: 3,
  
  // Měna v hře - sbíraní "úhly"
  // Získává se z nepřátel a letajících úhlů
  angles: 0,
  
  // ===================================================================
  // LEVELUP EFEKTY - AURA ANIMACE
  // ===================================================================
  
  // Čitač pro auru efekt (počet framů zbývajících)
  levelUpAuraTime: 0,
  
  // Jak dlouho má trvat aura efekt (v fraimech)
  // 60 framů = 1 sekunda (při 60 FPS)
  levelUpAuraDuration: 60,
  
  // ===================================================================
  // KONFIGURACE - VZORCE A NÁKLADY
  // ===================================================================
  
  // Základní XP potřebný k levelupu na level 2
  // Vyšší levely budou potřebovat exponenciálně více
  baseXPForLevel: 300,
  
  // Multiplikátor exponenciálního vzorce
  // Každý level bude potřebovat 3x více XP než předchozí
  // Level 1: 30 XP
  // Level 2: 30 * 3 = 90 XP
  // Level 3: 30 * 3² = 270 XP
  xpMultiplier: 3,
  
  // XP za jednu stranu nepřítele
  // Když zabijeme nepřítele se 5 stranami, dostaneme 5 * 1 = 5 XP
  xpPerSide: 1,
  
  // Úhly za jednoho zabítého nepřítele
  // Plus bonusy z shopních upgradů
  anglePerKill: 2,
  
  // Počáteční cena za upgrade (přidání strany)
  // Později se bude zvyšovat s každým nákupem
  upgradeCost: 10,
  
  // ===================================================================
  // STATISTIKY
  // ===================================================================
  
  // Celkový počet zabítých nepřátel
  enemiesKilled: 0,
  
  // ===================================================================
  // VÝPOČETNÍ METODY
  // ===================================================================
  
  // Vypočítá kolik XP je potřeba na daný level
  // Formule: baseXP * (multiplikátor ^ (level - 1))
  // Příklady:
  //   Level 1: 30 * 3^0 = 30
  //   Level 2: 30 * 3^1 = 90
  //   Level 3: 30 * 3^2 = 270
  //   Level 4: 30 * 3^3 = 810
  getXPRequired(level) {
    return Math.floor(this.baseXPForLevel * Math.pow(this.xpMultiplier, level - 1));
  },
  
  // ===================================================================
  // XP A ÚHLY - PŘÍJEM
  // ===================================================================
  
  // Přidá XP a úhly když je nepřítel zabit
  // enemySides: počet stran zabítého nepřítele
  // (Větší nepřátelé = více XP a úhlů)
  addXP(enemySides) {
    // ===== VÝPOČET XP =====
    // Základní: počet stran * 1 XP za stranu
    let xpGain = enemySides * this.xpPerSide;
    
    // Přidej bonus z ostrých hran (sharpness upgrade)
    // Např. Sharpness level 1 přidá +1, level 2 přidá +2 atd.
    xpGain += shopSystem.getXPBonusMultiplier();
    
    // Aktualizuj XP počítadla
    this.currentXP += xpGain;
    this.totalXP += xpGain;
    
    // ===== VÝPOČET ÚHLŮ =====
    // Základní: anglePerKill (obychejně 2)
    // Plus bonus z barevného upgradu (Color level)
    const angleBonus = shopSystem.getAngleBonusMultiplier();
    this.angles += this.anglePerKill + angleBonus;
    
    // Inkrementuj počítadlo zabítých nepřátel
    this.enemiesKilled++;
    
    // Zkontroluj jestli se má provést levelup
    this.checkLevelUp();
    
    return xpGain;  // Vrátí kolik XP bylo přidáno
  },
  
  // Sbírání úhlů ze sbíraných letajících úhlů (ne od nepřátel)
  // count: počet sbíraných úhlů
  addAnglesFromCollect(count) {
    // Základní příjem + bonus z barevného upgradu
    const bonusPerAngle = 1 + shopSystem.getAngleBonusMultiplier();
    this.angles += count * bonusPerAngle;
  },
  
  // ===================================================================
  // LEVELUP MECHANIKA
  // ===================================================================
  
  // Zkontroluj jestli hráč dosáhl dostatku XP k levelupu
  checkLevelUp() {
    // Kolik XP je potřeba na příští level?
    const requiredXP = this.getXPRequired(this.currentLevel);
    
    // Má hráč dost XP?
    if (this.currentXP >= requiredXP) {
      this.levelUp();  // Provede levelup
    }
  },
  
  // Provede levelup - zvýší level a resetuje XP
  levelUp() {
    // Kolik XP bylo potřeba na tento level?
    const requiredXP = this.getXPRequired(this.currentLevel);
    
    // Odeber spotřebovaný XP (zbývající přejde na další level)
    this.currentXP -= requiredXP;
    
    // Zvýšíme level o 1
    this.currentLevel++;
    
    // Spusť auru efekt (bude se zobrazovat po dobu 60 framů)
    this.levelUpAuraTime = this.levelUpAuraDuration;
    
    // Reset shopských upgradů - nový level = nová nabídka upgradů
    // (Starší upgrady zůstávají aktivní, jen se skryje nabídka na koupit)
    shopSystem.resetUpgrades();
    
    // Vrať informace o novém levelu (pro debug či UI)
    return {
      newLevel: this.currentLevel,
      bonus: this.currentLevel * 10  // Příklad bonusu za level
    };
  },
  
  // Aktualizuje auru efekt - spustí se z game loop
  updateLevelUpAura() {
    // Pokud je aura aktivní, odeber jeden frame
    if (this.levelUpAuraTime > 0) {
      this.levelUpAuraTime--;
    }
  },
  
  // Vrátí boolean - je aura efekt právě aktivní?
  hasLevelUpAura() {
    return this.levelUpAuraTime > 0;
  },
  
  // Vrátí intenzitu aury (0-1, kde 1 = plná viditelnost)
  // Používá se pro render.js k vytváření efektů
  getLevelUpAuraAlpha() {
    if (this.levelUpAuraTime <= 0) return 0;
    // Dělení: čím méně framů zbývá, tím méně viditelná je aura
    return this.levelUpAuraTime / this.levelUpAuraDuration;
  },
  
  // ===================================================================
  // NÁKUP UPGRADŮ - PŘIDÁNÍ STRAN
  // ===================================================================
  
  // Koupí upgrade tvaru - přidá jednu stranu k hráči
  // Vyžaduje: Level 2+, dost úhlů
  buyUpgrade() {
    // Kontrola: musí být level 2+ (level 1 nemůže koupit) AND dost úhlů
    if (this.currentLevel >= 2 && this.angles >= this.upgradeCost) {
      // Odeber cenu z inventáře
      this.angles -= this.upgradeCost;
      
      // Přidej jednu stranu
      this.playerSides++;
      
      // Aktualizuj hráčů objekt - aby se změnila velikost při renderingu
      geome.sides = this.playerSides;
      
      // Zvýšíme cenu pro další kolo (exponenciální cena)
      // Aby se staly upgrady postupně dražšími
      this.upgradeCost += 25;
      
      return true;  // Úspěšný nákup
    }
    
    return false;  // Nemá dostatečné podmínky
  },
  
  // ===================================================================
  // RESET A STATISTIKY
  // ===================================================================
  
  // Resetuje veškerý pokrok (pro nový den/season/hru)
  resetLevel() {
    this.currentLevel = 1;
    this.currentXP = 0;
    this.playerSides = 3;
    this.angles = 0;
    geome.sides = 3;  // Resetuj i hráčův objekt
  },
  
  // Vrátí objekt se všema informacemi o aktuálním stavu hráče
  // Používá se pro vykreslování UI v render.js
  getStatus() {
    // Kolik XP je potřeba na příští level?
    const requiredXP = this.getXPRequired(this.currentLevel);
    
    // Kolik procent progress na příští level? (0-100)
    const progressPercent = (this.currentXP / requiredXP) * 100;
    
    // Vrátí objekt s veškerými statem
    return {
      level: this.currentLevel,           // Aktuální level
      xp: this.currentXP,                  // XP k příštímu levelu
      requiredXP: requiredXP,              // Kolik XP je potřeba
      progress: progressPercent,           // Procenta (0-100)
      sides: this.playerSides,             // Počet stran polygonu
      angles: this.angles,                 // Počet úhlů (měna)
      nextUpgradeCost: this.upgradeCost,   // Cena příštího upgradu
      enemiesKilled: this.enemiesKilled    // Celkem zabítých nepřátel
    };
  }
};
