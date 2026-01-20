// ===================================================================
// RENDER.JS - Systém Renderování a Shop UI
// ===================================================================
// Účel: Kreslení všeho obsahu na canvas + správa UI, tlačítek a obchodu
// 
// Hlavní komponenty:
// 1. Canvas inicializace a kontext (2D kreslení)
// 2. Shop state a UI tlačítka
// 3. Funkce pro kreslení (polygon, hráč, efekty, obchod)
// 4. Detekce kliknutí na UI prvky
// 5. Logika nákupu v obchodě
// ===================================================================

// Importy ze všech důležitých systémů
import { geome } from './player.js';           // Objekt hráče (pozice, rotace)
import { obstacles } from './obstacles.js';     // Pole překážek
import { config } from './config.js';           // Globální konfigurace
import { levelSystem } from './leveling.js';    // Systém XP, levelů a ugradů
import { shopSystem } from './shop.js';         // Definice upgradů a jejich stav
import { playShopOpenSound, playShopBuySound, playErrorSound } from './audio.js'; // Zvuky shopu

// Získání canvas elementu z HTML a inicializace 2D kontextu
// Canvas je hlavní plocha kde kreslíme vše (pozadí, hráč, překážky, UI)
const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');   // Exportujeme ctx pro ostatní soubory

// ===================================================================
// MOBILNÍ OPTIMALIZACE - Helper funkce
// ===================================================================
export const isMobileDevice = () => {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getUIScale = (canvasWidth) => {
  if (canvasWidth < 480) return 0.6;
  if (canvasWidth < 768) return 0.8;
  return 1.0;
};

// ===================================================================
// SHOP STATE - Sledování stavu obchodu
// ===================================================================
// shopOpen: boolean - Jestli je shop panel viditelný (true = otevřen)
export let shopOpen = false;

// shopScrollOffset: číslo - Vertikální offset pro scrollování v shopu
// Zvětšuje se při scrollu dolů (více obsahu viditelného dole)
export let shopScrollOffset = 0;

// uiButtons: objekt uchovávající souřadnice všech interaktivních prvků
// Souřadnice jsou nastavovány během kreslení a používají se pro detekci kliknutí
export const uiButtons = {
  shopButton: null,                              // Tlačítko pro otevření/zavření shopu
  closeButton: null,                             // Tlačítko X pro zavření (v rohu panelu)
  colorUpgrades: [null, null, null, null, null], // Pole 5 tlačítek pro barevné upgrady
  sharpnessUpgrades: [null, null, null, null, null], // Pole 5 tlačítek pro upgrady ostrosti
  shapeUpgradeButton: null,                      // Tlačítko pro přidání stran polygonu
  angleMultiplierButton: null,                   // Tlačítko pro angle multiplier
  xpMultiplierButton: null                       // Tlačítko pro XP multiplier
};

// ===================================================================
// ZÁKLADNÍ FUNKCE
// ===================================================================

// Přepíná viditelnost shopu (otevře/zavře)
export function toggleShop() {
  shopOpen = !shopOpen;  // Invertuje stav (true → false, false → true)
}

// Zpracování kliknutí na UI prvky
// Detekuje která tlačítka hráč kliknul a provede příslušnou akci
export function handleUIClick(x, y) {
  // ===== JE SHOP OTEVŘEN? =====
  // Pokud ano, zpracuj kliknutí na shop tlačítka, ne na skákání
  if (shopOpen) {
    // ----- TLAČÍTKO ZAVŘENÍ (X) -----
    // Kliknul-li hráč na X v pravém horním rohu, zavři shop
    if (uiButtons.closeButton && isClickInRect(x, y, uiButtons.closeButton)) {
      shopOpen = false;  // Zavři shop
      shopScrollOffset = 0;  // Reset scroll offset
      return;            // Výstup - nekontroluj další tlačítka
    }
    
    // ----- BAREVNÉ UPGRADY (5 TLAČÍTEK) -----
    // Projdi všechna barevná tlačítka (0-4 = levely 1-5)
    for (let i = 0; i < 5; i++) {
      if (uiButtons.colorUpgrades[i] && isClickInRect(x, y, uiButtons.colorUpgrades[i])) {
        buyColorUpgrade(i + 1);  // i+1 protože levely jsou 1-5, ne 0-4
        return;
      }
    }
    
    // ----- UPGRADY OSTROSTI (5 TLAČÍTEK) -----
    // Projdi všechna tlačítka pro ostrost (0-4 = levely 1-5)
    for (let i = 0; i < 5; i++) {
      if (uiButtons.sharpnessUpgrades[i] && isClickInRect(x, y, uiButtons.sharpnessUpgrades[i])) {
        buySharpnessUpgrade(i + 1);  // i+1 protože levely jsou 1-5, ne 0-4
        return;
      }
    }
    
    // ----- UPGRADE TVARU (PŘIDÁNÍ STRAN) -----
    // Koupí další stranu polygonu (3-gon → 4-gon → 5-gon atd.)
    // Vyžaduje: Level 2+, dost úhlů, není na maximu pro tento level
    if (uiButtons.shapeUpgradeButton && isClickInRect(x, y, uiButtons.shapeUpgradeButton)) {
      const result = levelSystem.buyUpgrade();  // Pokus koupit upgrade
      if (result) {
        playShopBuySound();  // Přehrát zvuk nákupu
        console.log(`Upgrade completed! New shape: ${levelSystem.playerSides}-gon`);
      } else {
        // Nákup se nezdařil - zjisti proč
        const maxSidesForLevel = levelSystem.currentLevel + 2;
        
        if (levelSystem.currentLevel < 2) {
          console.log('Upgrade tvaru je dostupný až od levelu 2!');
        } else if (levelSystem.angles < levelSystem.upgradeCost) {
          console.log(`Potřebuješ ${levelSystem.upgradeCost - levelSystem.angles} více úhlů!`);
        } else if (levelSystem.playerSides >= maxSidesForLevel) {
          console.log(`Na levelu ${levelSystem.currentLevel} můžeš mít max ${maxSidesForLevel} stran! Postup na další level pro více upgradů.`);
        }
        playErrorSound();  // Přehrát zvuk chyby
      }
      return;
    }
    
    // ----- ANGLE MULTIPLIER UPGRADE -----
    // Koupí multiplikátor na sbírané úhly/peníze
    // Vyžaduje: 150 úhlů, lze koupit jen jednou (trvalý upgrade)
    if (uiButtons.angleMultiplierButton && isClickInRect(x, y, uiButtons.angleMultiplierButton)) {
      if (shopSystem.hasAngleMultiplier) {
        console.log('Angle multiplier již máš! Efekt zůstává trvalý.');
        playErrorSound();
      } else if (levelSystem.angles >= 150) {
        levelSystem.angles -= 150;  // Odečti cenu
        shopSystem.hasAngleMultiplier = true;  // Nastav flag
        playShopBuySound();
        console.log(`Angle multiplier koupeno! Aktuální multiplikátor: ${shopSystem.getAngleMultiplier(levelSystem.playerSides).toFixed(2)}x`);
      } else {
        const angleMissing = 150 - levelSystem.angles;
        console.log(`Potřebuješ ${angleMissing} více úhlů na angle multiplier!`);
        playErrorSound();
      }
      return;
    }
    
    // ----- XP MULTIPLIER UPGRADE -----
    // Koupí multiplikátor na zkušenosti (XP)
    // Vyžaduje: 150 úhlů, lze koupit jen jednou (trvalý upgrade)
    if (uiButtons.xpMultiplierButton && isClickInRect(x, y, uiButtons.xpMultiplierButton)) {
      if (shopSystem.hasXPMultiplier) {
        console.log('XP multiplier již máš! Efekt zůstává trvalý.');
        playErrorSound();
      } else if (levelSystem.angles >= 150) {
        levelSystem.angles -= 150;  // Odečti cenu
        shopSystem.hasXPMultiplier = true;  // Nastav flag
        playShopBuySound();
        console.log(`XP multiplier koupeno! Aktuální multiplikátor: ${shopSystem.getXPMultiplier(levelSystem.playerSides).toFixed(2)}x`);
      } else {
        const angleMissing = 150 - levelSystem.angles;
        console.log(`Potřebuješ ${angleMissing} více úhlů na XP multiplier!`);
        playErrorSound();
      }
      return;
    }
    
    // Pokud kliknul mimo všechna tlačítka, jen zavři shop (stane se níže)
    return;
  }
  
  // ===== SHOP JE ZAVŘENÝ =====
  // Kontroluj jen tlačítko pro otevření shopu
  if (uiButtons.shopButton && isClickInRect(x, y, uiButtons.shopButton)) {
    shopOpen = true;  // Otevři shop
    playShopOpenSound();  // Přehrát zvuk otevření shopu
  }
}

// Pomocná funkce: Je bod (x, y) uvnitř obdélníku?
// Používá se pro detekci kliknutí - je kliknutí v oblasti tlačítka?
// rect objekt má: x (levý okraj), y (horní okraj), w (šířka), h (výška)
function isClickInRect(x, y, rect) {
  // Vrátí true pokud je bod v obdélníku, false jinak
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

// ===================================================================
// NÁKUP UPGRADŮ
// ===================================================================

// Koupí barevný upgrade (změní barvu hráče)
// level: 1-5 (Ruby-Purple, Red-Ruby, Orange-Red, atd.)
function buyColorUpgrade(level) {
  // Kontrola: jestli už hráč má koupenou vyšší nebo stejnou úroveň
  if (shopSystem.selectedColorLevel >= level) {
    console.log('Už máš tuto barvu koupenou!');  // Nemohu koupit nižší level
    playErrorSound();  // Přehrát zvuk chyby
    return;
  }
  
  // Zjisti cenu upgradu
  const cost = shopSystem.getColorUpgradeCost(level);
  
  // Zkontroluj jestli má hráč dost úhlů (měny v hře)
  if (levelSystem.angles >= cost) {
    shopSystem.selectedColorLevel = level;  // Nastav nový upgrade
    levelSystem.angles -= cost;             // Odeber cenu z inventáře
    playShopBuySound();  // Přehrát zvuk nákupu
    console.log(`Bought Color: ${shopSystem.colorUpgrades[level - 1].name}`);
  } else {
    // Chybí mu úhly - řekni kolik je potřeba
    playErrorSound();  // Přehrát zvuk chyby
    console.log(`Potřebuješ ${cost - levelSystem.angles} více úhlů!`);
  }
}

// Koupí upgrade ostrosti (zvýší XP bonusy)
// level: 1-5 (Sharp-Plasma, Ultra-Sharp, Plasma, atd.)
function buySharpnessUpgrade(level) {
  // Kontrola: jestli už hráč má koupenou vyšší nebo stejnou úroveň
  if (shopSystem.selectedSharpnessLevel >= level) {
    console.log('Už máš tuto ostrost koupenou!');  // Nemohu koupit nižší level
    playErrorSound();  // Přehrát zvuk chyby
    return;
  }
  
  // Zjisti cenu upgradu
  const cost = shopSystem.getSharpnessUpgradeCost(level);
  
  // Zkontroluj jestli má hráč dost úhlů (měny v hře)
  if (levelSystem.angles >= cost) {
    shopSystem.selectedSharpnessLevel = level;  // Nastav nový upgrade
    levelSystem.angles -= cost;                 // Odeber cenu z inventáře
    playShopBuySound();  // Přehrát zvuk nákupu
    console.log(`Bought Sharpness: ${shopSystem.sharpnessUpgrades[level - 1].name}`);
  } else {
    // Chybí mu úhly - řekni kolik je potřeba
    playErrorSound();  // Přehrát zvuk chyby
    console.log(`Potřebuješ ${cost - levelSystem.angles} více úhlů!`);
  }
}


// ===================================================================
// KRESLENÍ - ZÁKLADNÍ FUNKCE PRO VYKRESLENÍ TVARŮ
// ===================================================================

// Kreslí pravidelný polygon (mnohoúhelník)
// Používá se pro hráče a nepřátele (různý počet stran = různé tvary)
// x, y: střed polygonu
// radius: vzdálenost od středu ke vrcholům
// sides: počet stran (3=trojúhelník, 4=čtverec, 5=pětiúhelník, atd.)
// color: RGB/HEX barva výplně
// rotation: rotace v radiánech (default 0)
export function drawPolygon(x, y, radius, sides, color, rotation = 0) {
  if (sides < 3) return; // Polygon musí mít alespoň 3 strany

  // Úhel mezi každými dvěma vrcholy
  // Např. u čtverce (4 strany): 2π / 4 = π/2 (90°)
  const angleStep = (2 * Math.PI) / sides;

  // Začni novou cestu pro kreslení
  ctx.beginPath();

  // Procházej všechny vrcholy
  for (let i = 0; i < sides; i++) {
    // Vypočítej úhel tohoto vrcholu
    const angle = i * angleStep + rotation;  // Přidej rotaci pro otáčení
    
    // Vypočítej pozici vrcholu pomocí trigonometrie (cos, sin)
    // V kruhu o poloměru 'radius' je bod na úhlu 'angle'
    const pointX = x + Math.cos(angle) * radius;
    const pointY = y + Math.sin(angle) * radius;
    
    // První vrchol se nakreslí jako "move" (bez čáry), ostatní jako "line"
    if (i === 0) {
      ctx.moveTo(pointX, pointY);  // Přesuň se na první vrchol
    } else {
      ctx.lineTo(pointX, pointY);  // Nakresli čáru na další vrchol
    }
  }

  // Uzavři cestu (nakresli poslední čáru zpět na první vrchol)
  ctx.closePath();
  
  // Nastav barvu výplně a vyplň polygon
  ctx.fillStyle = color;
  ctx.fill();
}

// Kreslí ikonu úhlu - stylizované "<" s glowem (oranžová barva)
// Používá se pro zobrazení sbíraných úhlů
// x, y: střed ikony
// size: velikost ikony
// rotation: rotace v radiánech (default 0)
export function drawAngleIcon(x, y, size, rotation = 0) {
  // Ulož aktuální stav kreslení (barvy, transformace)
  ctx.save();
  
  // Posun na pozici ikony a natočení
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  // ===== HLAVNÍ TVAR: ORANŽOVÉ "V" ČÁRY (45°) =====
  ctx.strokeStyle = '#ff9f43';  // Kosmická oranžová
  ctx.lineWidth = 2.5;          // Tloušťka čáry
  ctx.lineCap = 'round';        // Kulaté konce čar
  ctx.lineJoin = 'round';       // Kulaté spoje čar
  
  // Nakreslení "V" tvaru (45° úhel) - dvě čáry které tvoří "∨"
  // Tvar je otočen o -45° aby vypadal jako V místo jak <
  ctx.beginPath();
  ctx.moveTo(-size, -size);     // Levý horní bod
  ctx.lineTo(0, size);          // Prostřední dolní bod
  ctx.lineTo(size, -size);      // Pravý horní bod
  ctx.stroke();                 // Nakresli tyto čáry
  
  // ===== VNĚJŠÍ GLOW EFEKTY =====
  // Silnější glow - vytváří zdání "zářícího" efektu
  ctx.strokeStyle = 'rgba(255, 159, 67, 0.6)';  // Oranžová, poloprůhledná
  ctx.lineWidth = 4.5;
  ctx.stroke();  // Nakresli stejné čáry, ale silnější
  
  // Měkký vnější glow - nejslabší vrstva
  ctx.strokeStyle = 'rgba(255, 159, 67, 0.25)'; // Oranžová, méně viditelná
  ctx.lineWidth = 7;
  ctx.stroke();  // Nakresli znovu, nejširší čáry
  
  // Obnovení uloženého stavu (vrátí barvy a transformace)
  ctx.restore();
}


// ===================================================================
// HLAVNÍ KRESLÍCÍ FUNKCE - drawGame
// ===================================================================

// Hlavní funkce která kreslí všechno: pozadí, překážky, hráče, UI
// Volána jednou za snímek z game.js gameLoop()
// canvasWidth, canvasHeight: rozměry canvasu (aktualizuje se při změně okna)
export function drawGame(canvasWidth, canvasHeight) {
  // POZNÁMKA: Pozadí (vzory) se kreslí jinde (drawPatterns() v background.js)
  // Tady kreslíme jen podstatné prvky

  // ===== PODLAHA - KOSMICKÝ STYL =====
  // Gradient - přechod z jedné barvy na druhou
  const floorGradient = ctx.createLinearGradient(0, canvasHeight - config.floorHeight, 0, canvasHeight);
  floorGradient.addColorStop(0, '#1a3a52');   // Horní část: tmavá modrá
  floorGradient.addColorStop(1, '#0a1a2e');   // Dolní část: ještě tmavší modrá
  ctx.fillStyle = floorGradient;
  
  // Nakresli obdélník podlahy (obvykle vysoký 100 pixelů)
  ctx.fillRect(0, canvasHeight - config.floorHeight, canvasWidth, config.floorHeight);

  // ===== PŘEKÁŽKY =====
  // Překážky mohou mít horní a spodní část (nebo jen jednu z nich)
  ctx.fillStyle = "rgb(100, 180, 255)";  // Světle modrá barva
  
  // Projdi všechny překážky z pole obstacles
  obstacles.forEach(obs => {
    // Pokud má překážka horní část (top > 0)
    if (obs.top > 0) {
      ctx.fillRect(obs.x, 0, obs.width, obs.top);  // Nakresli horní obdélník
    }
    
    // Pokud má překážka spodní část (bottom > 0)
    if (obs.bottom > 0) {
      // Spodní překážka se kreslí od podlahy nahoru
      ctx.fillRect(obs.x, canvasHeight - config.floorHeight - obs.bottom, obs.width, obs.bottom);
    }
  });
  
  // ===== GLOW BORDER KOLEM PŘEKÁŽEK =====
  // Jemný svítící efekt okolo překážek (atmosféra)
  ctx.strokeStyle = "rgba(100, 200, 255, 0.4)";  // Světle modrá, poloprůhledná
  ctx.lineWidth = 1.5;
  
  obstacles.forEach(obs => {
    // Hranice horní překážky
    if (obs.top > 0) {
      ctx.strokeRect(obs.x, 0, obs.width, obs.top);
    }
    
    // Hranice spodní překážky
    if (obs.bottom > 0) {
      ctx.strokeRect(obs.x, canvasHeight - config.floorHeight - obs.bottom, obs.width, obs.bottom);
    }
  });

  // ===== HRÁČ - SE SPECIÁLNÍM EFEKTEM BĚHEM LEVELUPU =====
  // Zjisti barvu hráče podle vybraného barevného upgradu
  const playerColor = shopSystem.getPlayerColor();
  
  // Pokud právě probíhá levelup, kresli se speciálním gleaming efektem
  if (levelSystem.hasLevelUpAura()) {
    drawPlayerWithGlow(geome.x, geome.y, geome.radius, geome.sides, geome.angle, playerColor);
  } else {
    // Normální kreslení - bez levupového efektu
    drawPolygon(geome.x, geome.y, geome.radius, geome.sides, playerColor, geome.angle);
    
    // Vnější záře - ono cosi kolem hráče (shadow efekt)
    ctx.save();
    ctx.globalAlpha = 0.3;              // Poloprůhlednost (30%)
    ctx.shadowColor = playerColor;      // Barva shadows = barva hráče
    ctx.shadowBlur = 15;                // Rozmazání shadows
    drawPolygon(geome.x, geome.y, geome.radius, geome.sides, playerColor, geome.angle);
    ctx.restore();
  }
  
  // ===== AURA EFEKT PŘI LEVELUPU =====
  // Pokud právě probíhá levelup, nakresli expandující kruh okolo hráče
  if (levelSystem.hasLevelUpAura()) {
    drawLevelUpAura(geome.x, geome.y, geome.radius);
  }
  
  // ===== UI - INFORMACE NA OBRAZOVCE =====
  // Kreslí text: Level, Enemies, Angles, XP bar, upgrade info, shop button
  drawUI(canvasWidth, canvasHeight);
}


// ===================================================================
// UI - VYKRESLOVÁNÍ INFORMACÍ A OVLÁDACÍCH PRVKŮ
// ===================================================================

// Kreslí UI prvky na obrazovku
// Zahrnuje: level, XP bar, úhly, počet nepřátel, tlačítka, upgrade info
// canvasWidth, canvasHeight: rozměry canvasu
function drawUI(canvasWidth, canvasHeight) {
  // Zjisti aktuální stav hráče (level, XP, nepřátelé, úhly, atd.)
  const status = levelSystem.getStatus();
  const isMobile = isMobileDevice();
  
  let padding = isMobile ? 10 : 20;
  let lineHeight = isMobile ? 20 : 25;
  let textSize = isMobile ? 12 : 14;
  let titleSize = isMobile ? 14 : 20;
  
  // ===== LEVÝ HORNÍ PANEL - INFORMACE O HRÁČI =====
  const panelWidth = isMobile ? Math.min(280, canvasWidth - 20) : 320;
  const panelHeight = isMobile ? 140 : 160;
  
  ctx.fillStyle = 'rgba(10, 20, 40, 0.8)';
  ctx.fillRect(padding - 5, padding - 5, panelWidth, panelHeight);
  
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(padding - 5, padding - 5, panelWidth, panelHeight);
  
  ctx.fillStyle = '#00f0ff';
  ctx.font = `bold ${titleSize}px Arial`;
  ctx.textAlign = 'left';
  
  ctx.fillText(`⬢ Level: ${status.level}`, padding, padding + 20);
  
  ctx.font = `${textSize}px Arial`;
  ctx.fillStyle = '#88ddff';
  ctx.fillText(`◆ Enemies: ${status.enemiesKilled}`, padding, padding + 40);
  
  ctx.fillStyle = '#ffaa00';
  ctx.fillText(`⊻ Angles: ${status.angles}`, padding, padding + 60);
  
  ctx.fillStyle = '#00f0ff';
  ctx.fillText(`✦ XP: ${status.xp}/${status.requiredXP}`, padding, padding + 80);
  
  // ===== XP PROGRESS BAR =====
  const barWidth = isMobile ? panelWidth - 10 : 300;
  const barHeight = isMobile ? 12 : 20;
  const barX = padding;
  const barY = padding + 95;
  
  ctx.fillStyle = 'rgba(30, 50, 80, 0.8)';
  ctx.fillRect(barX, barY, barWidth, barHeight);
  
  const barGradient = ctx.createLinearGradient(barX, 0, barX + barWidth * status.progress / 100, 0);
  barGradient.addColorStop(0, '#00ddff');
  barGradient.addColorStop(1, '#00ffaa');
  ctx.fillStyle = barGradient;
  ctx.fillRect(barX, barY, (barWidth * status.progress) / 100, barHeight);
  
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
  
  // ===== PRAVÝ HORNÍ PANEL - UPGRADE INFO (SKRYT NA VELMI MALÝCH DISPLEJÍCH) =====
  if (!isMobile || canvasWidth > 500) {
    const upgradeWidth = isMobile ? Math.min(260, canvasWidth - padding * 2 - panelWidth - 10) : 310;
    const upgradeX = canvasWidth - upgradeWidth - padding;
    const upgradeY = padding;
    
    ctx.fillStyle = 'rgba(10, 20, 40, 0.8)';
    ctx.fillRect(upgradeX - 5, upgradeY - 5, upgradeWidth, 110);
    
    ctx.strokeStyle = 'rgba(255, 170, 0, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(upgradeX - 5, upgradeY - 5, upgradeWidth, 110);
    
    ctx.fillStyle = '#ffbb00';
    ctx.font = `bold ${isMobile ? 12 : 16}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText('⬡ Upgrade Shop', upgradeX, upgradeY + 20);
    
    ctx.fillStyle = '#ddddff';
    ctx.font = `${isMobile ? 10 : 14}px Arial`;
    ctx.fillText(`Shape: ${status.sides}-gon`, upgradeX, upgradeY + 45);
    
    ctx.fillText(`Cost: ${status.nextUpgradeCost} ⊻`, upgradeX, upgradeY + 65);
    
    if (status.angles >= status.nextUpgradeCost && status.level >= 2) {
      ctx.fillStyle = '#00ff99';
      ctx.fillText('→ [SHOP]', upgradeX, upgradeY + 85);
    } else {
      ctx.fillStyle = '#ff7777';
      ctx.font = `${isMobile ? 8 : 12}px Arial`;
      ctx.fillText(`Need lvl 2+ or ${status.nextUpgradeCost - status.angles} more`, upgradeX, upgradeY + 85);
    }
  }
  
  // ===== SHOP TLAČÍTKO - LEVÝ DOLNÍ ROH =====
  const shopButtonX = padding;
  const shopButtonY = canvasHeight - (isMobile ? 45 : 50);
  const shopButtonW = isMobile ? 90 : 120;
  const shopButtonH = isMobile ? 35 : 40;
  
  ctx.fillStyle = shopOpen ? 'rgba(100, 200, 255, 0.8)' : 'rgba(50, 100, 150, 0.6)';
  ctx.fillRect(shopButtonX, shopButtonY, shopButtonW, shopButtonH);
  
  ctx.strokeStyle = shopOpen ? '#00ffff' : '#0088ff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(shopButtonX, shopButtonY, shopButtonW, shopButtonH);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${isMobile ? 11 : 14}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('SHOP', shopButtonX + shopButtonW / 2, shopButtonY + shopButtonH / 2 + 5);
  
  uiButtons.shopButton = { x: shopButtonX, y: shopButtonY, w: shopButtonW, h: shopButtonH };
  
  // ===== POKUD JE SHOP OTEVŘEN, NAKRESLI JEJ =====
  if (shopOpen) {
    drawShopUI(canvasWidth, canvasHeight);
  }
}


// ===================================================================
// SPECIÁLNÍ EFEKTY PŘI LEVELUPU
// ===================================================================

// Kreslí hráče se zářícím glow efektem - používá se během levelupu
// Vytváří efekt "pulsujícího" zářícího polygonu
// x, y: pozice hráče
// radius: velikost hráče
// sides: počet stran polygonu
// rotation: rotace polygonu
// color: základní barva hráče (default kyanová)
function drawPlayerWithGlow(x, y, radius, sides, rotation, color = '#00f0ff') {
  // Zjisti intenzitu aury (0-1, 0 = není vidět, 1 = plná intenzita)
  const alpha = levelSystem.getLevelUpAuraAlpha();
  
  // Vytvoř pulsující efekt - sinusovka která přechází mezi 0 a 1
  // Date.now() je počet milisekund, * 0.01 zpomaluje oscilaci
  // Math.sin vrací hodnotu -1 až 1, +0.5 a *0.5 ji normalizuje na 0-1
  const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
  const glowIntensity = alpha * pulse;  // Kombinuj alpha (zániku) s pulsem (blikáním)
  
  // ===== VNĚJŠÍ ZÁŘE - ZLATÁ =====
  ctx.save();
  ctx.globalAlpha = glowIntensity * 0.6;      // Průhlednost 60% z intensity
  ctx.shadowColor = '#ffff00';                // Zlatá barva
  ctx.shadowBlur = 30;                        // Silné rozmazání
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  drawPolygon(x, y, radius, sides, '#ffff00', rotation);  // Nakresli zlatý polygon
  ctx.restore();
  
  // ===== STŘEDNÍ ZÁŘE - ORANŽOVÁ =====
  ctx.save();
  ctx.globalAlpha = glowIntensity * 0.4;      // Průhlednost 40% z intensity
  ctx.shadowColor = '#ffaa00';                // Oranžová barva
  ctx.shadowBlur = 15;                        // Středně silné rozmazání
  drawPolygon(x, y, radius, sides, '#ffaa00', rotation);
  ctx.restore();
  
  // ===== HLAVNÍ TVAR - BARVA PODLE UPGRADU =====
  ctx.save();
  ctx.shadowColor = color;                    // Shadows v barvě hráče
  ctx.shadowBlur = 20;                        // Rozmazání shadows
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  drawPolygon(x, y, radius, sides, color, rotation);
  ctx.restore();
}

// Kreslí expandující kruh kolem hráče během levelupu
// Vytváří efekt "výbuchu" energie
// x, y: pozice hráče
// baseRadius: základní velikost hráče
function drawLevelUpAura(x, y, baseRadius) {
  // Zjisti jak daleko je levelup (0 = právě skončil, 1 = skončil před chvílí)
  const alpha = levelSystem.getLevelUpAuraAlpha();
  
  // Vypočítej poloměr expandujícího kruhu
  // Začíná na baseRadius a expanduje na baseRadius * 3
  const maxRadius = baseRadius * 3;
  const auraRadius = baseRadius + (maxRadius - baseRadius) * (1 - alpha);
  
  ctx.save();
  ctx.globalAlpha = alpha * 0.6;  // Kruh zaniká (alpha klesá)
  
  // ===== VNĚJŠÍ ZLATÝ KRUH =====
  ctx.strokeStyle = '#ffff00';    // Zlatá
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, auraRadius, 0, Math.PI * 2);  // Nakresli kruh
  ctx.stroke();
  
  // ===== VNITŘNÍ SVÍTÍCÍ KRUH =====
  ctx.strokeStyle = '#ffaa00';                // Oranžová
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = alpha * 0.4;              // Ještě méně viditelný
  ctx.beginPath();
  ctx.arc(x, y, auraRadius * 0.7, 0, Math.PI * 2);  // Menší kruh
  ctx.stroke();
  
  // ===== VNĚJŠÍ MĚKKÝ GLOW =====
  ctx.strokeStyle = '#ffff99';                // Žlutá (měkčí zlatá)
  ctx.lineWidth = 2;
  ctx.globalAlpha = alpha * 0.3;              // Nejméně viditelný
  ctx.beginPath();
  ctx.arc(x, y, auraRadius * 1.2, 0, Math.PI * 2);  // Největší kruh
  ctx.stroke();
  
  ctx.restore();
}


// ===================================================================
// SHOP UI - OBCHOD S UPGRADY
// ===================================================================

// Kreslí kompletní obchod - panel s upgrady
// Tento panel obsahuje: barevné upgrady, upgrady ostrosti, upgrade tvaru, levelup button
// canvasWidth, canvasHeight: rozměry canvasu
function drawShopUI(canvasWidth, canvasHeight) {
  const status = levelSystem.getStatus();
  const isMobile = isMobileDevice();
  
  // ===== POTEMŇUJÍCÍ OVERLAY =====
  // Zčernout všecho mimo shop panel aby byla vidět lépe
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // ===== URČENÍ PANELU ROZMĚRŮ NA ZÁKLADĚ OBRAZOVKY =====
  let panelWidth, panelHeight, panelX, panelY;
  
  if (canvasWidth < 480) {
    // Mobile portrait: Vertikální layout - full width, scrollable
    panelWidth = Math.min(350, canvasWidth - 20);
    panelHeight = Math.min(800, canvasHeight - 40);
  } else if (canvasWidth < 768) {
    // Tablet: Kompaktnější 2-sloupec, stále responsive
    panelWidth = Math.min(500, canvasWidth - 30);
    panelHeight = Math.min(650, canvasHeight - 60);
  } else {
    // Desktop: Původní rozměry
    panelWidth = 900;
    panelHeight = 700;
  }
  
  panelX = (canvasWidth - panelWidth) / 2;
  panelY = (canvasHeight - panelHeight) / 2;
  
  // Background panelu - tmavý s průhledností
  ctx.fillStyle = 'rgba(10, 20, 40, 0.95)';
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
  
  // Border kolem panelu - kyanový glow
  ctx.strokeStyle = '#00ddff';
  ctx.lineWidth = 3;
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
  
  // ===== NADPIS SHOPU S DYNAMICKÝMI ROZMĚRY =====
  let titleSize = isMobile ? (canvasWidth < 480 ? 18 : 22) : 28;
  ctx.fillStyle = '#00ffff';
  ctx.font = `bold ${titleSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('✦ SHOP ✦', canvasWidth / 2, panelY + 35);
  
  // ===== TLAČÍTKO ZAVŘENÍ (X) - VPRAVO NAHOŘE =====
  const closeX = panelX + panelWidth - 25;
  const closeY = panelY + 15;
  const closeSize = 20;
  
  // Background tlačítka - lehce viditelný
  ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
  ctx.fillRect(closeX - 12, closeY - 12, 24, 24);
  
  // Border tlačítka
  ctx.strokeStyle = '#ff6666';
  ctx.lineWidth = 2;
  ctx.strokeRect(closeX - 12, closeY - 12, 24, 24);
  
  // Text "×" na tlačítku
  ctx.fillStyle = '#ff6666';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('×', closeX, closeY);
  
  // Ulož souřadnice close tlačítka (pro detekci kliknutí)
  uiButtons.closeButton = { x: closeX - 12, y: closeY - 12, w: 24, h: 24 };
  
  // ===== LAYOUT LOGIKA PODLE ŠÍŘKY OBRAZOVKY =====
  if (canvasWidth < 480) {
    // MOBILNÍ VERTIKÁLNÍ LAYOUT - Všechno pod sebou
    drawShopMobileVertical(panelX, panelY, panelWidth, panelHeight);
  } else if (canvasWidth < 768) {
    // TABLET LAYOUT - Kompaktnější 2-sloupec
    drawShopTablet(panelX, panelY, panelWidth, panelHeight);
  } else {
    // DESKTOP LAYOUT - Původní 2-sloupec vedle sebe
    drawShopDesktop(panelX, panelY, panelWidth, panelHeight);
  }
}

// ===================================================================
// RESPONSIVE SHOP LAYOUTS - HELPER FUNKCE
// ===================================================================

// MOBILNÍ VERTIKÁLNÍ LAYOUT (< 480px)
function drawShopMobileVertical(panelX, panelY, panelWidth, panelHeight) {
  const status = levelSystem.getStatus();
  const padding = 10;
  const startY = panelY + 50;
  
  // Barevné upgrady
  ctx.fillStyle = '#ff9f43';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('⬢ Colors', panelX + padding, startY);
  
  const colorBtnWidth = panelWidth - 2 * padding;
  const colorBtnHeight = 24;
  
  for (let i = 0; i < 5; i++) {
    const upgrade = shopSystem.colorUpgrades[i];
    const y = startY + 20 + i * 38 - shopScrollOffset;
    
    // Přeskoč prvky které nejsou viditelné (mimo panel)
    if (y + colorBtnHeight < panelY || y > panelY + panelHeight) continue;
    
    const isBought = shopSystem.selectedColorLevel > i;
    const isAffordable = status.angles >= shopSystem.getColorUpgradeCost(i + 1);
    
    // Barva podle stavu: Koupeno (zelené) / Lze koupit (červené) / Nemůžu koupit (šedé)
    if (isBought) {
      ctx.fillStyle = 'rgba(0, 255, 100, 0.2)';  // ZELENÁ - koupeno
    } else if (isAffordable) {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';  // ČERVENÁ - lze koupit
    } else {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';  // ŠEDÁ - nemůžu koupit
    }
    
    ctx.fillRect(panelX + padding, y, colorBtnWidth, colorBtnHeight);
    
    // Border barva
    let borderColor = '#666666';
    if (isBought) borderColor = '#00ff64';  // Zelená - koupeno
    if (isAffordable && !isBought) borderColor = '#ff6464';  // Červená - lze koupit
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX + padding, y, colorBtnWidth, colorBtnHeight);
    
    // Text barva
    ctx.fillStyle = isBought || isAffordable ? '#ffffff' : '#888888';
    ctx.font = '9px Arial';
    ctx.textAlign = 'left';
    
    const costStr = `${shopSystem.getColorUpgradeCost(i + 1)}⊻`;
    const statusStr = isBought ? '✓' : (!isAffordable ? '🔒' : '');
    ctx.fillText(`${upgrade.name.substring(0, 10)} ${statusStr} ${costStr}`, panelX + padding + 3, y + 15);
    
    uiButtons.colorUpgrades[i] = { x: panelX + padding, y: y, w: colorBtnWidth, h: colorBtnHeight };
  }
  
  // Upgrady ostrosti
  const sharpnessStartY = startY + 210;
  ctx.fillStyle = '#ff6b9d';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('◆ Sharpness', panelX + padding, sharpnessStartY - shopScrollOffset);
  
  for (let i = 0; i < 5; i++) {
    const upgrade = shopSystem.sharpnessUpgrades[i];
    const y = sharpnessStartY + 20 + i * 38 - shopScrollOffset;
    
    // Přeskoč prvky které nejsou viditelné (mimo panel)
    if (y + 24 < panelY || y > panelY + panelHeight) continue;
    
    const isBought = shopSystem.selectedSharpnessLevel > i;
    const isAffordable = status.angles >= shopSystem.getSharpnessUpgradeCost(i + 1);
    
    // Barva podle stavu: Koupeno (zelené) / Lze koupit (červené) / Nemůžu koupit (šedé)
    if (isBought) {
      ctx.fillStyle = 'rgba(0, 255, 100, 0.2)';  // ZELENÁ - koupeno
    } else if (isAffordable) {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';  // ČERVENÁ - lze koupit
    } else {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';  // ŠEDÁ - nemůžu koupit
    }
    
    ctx.fillRect(panelX + padding, y, colorBtnWidth, colorBtnHeight);
    
    // Border barva
    let borderColor = '#666666';
    if (isBought) borderColor = '#00ff64';  // Zelená - koupeno
    if (isAffordable && !isBought) borderColor = '#ff6464';  // Červená - lze koupit
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX + padding, y, colorBtnWidth, colorBtnHeight);
    
    // Text barva
    ctx.fillStyle = isBought || isAffordable ? '#ffffff' : '#888888';
    ctx.font = '9px Arial';
    ctx.textAlign = 'left';
    
    const costStr = `${shopSystem.getSharpnessUpgradeCost(i + 1)}⊻`;
    const statusStr = isBought ? '✓' : (!isAffordable ? '🔒' : '');
    ctx.fillText(`${upgrade.name.substring(0, 10)} ${statusStr} ${costStr}`, panelX + padding + 3, y + 15);
    
    uiButtons.sharpnessUpgrades[i] = { x: panelX + padding, y: y, w: colorBtnWidth, h: colorBtnHeight };
  }
  
  // Shape upgrade - kompaktnější
  const shapeY = sharpnessStartY + 210;
  ctx.fillStyle = '#ffdd00';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⬟ Shape', panelX + panelWidth / 2, shapeY - shopScrollOffset);
  
  const shapeBtnX = panelX + padding;
  const shapeBtnY = shapeY + 10 - shopScrollOffset;
  const shapeBtnW = colorBtnWidth;
  const shapeBtnH = 24;
  
  const shapeUpgradeCost = levelSystem.upgradeCost;
  const maxSidesForLevel = levelSystem.currentLevel + 2;
  const isMaxed = levelSystem.playerSides >= maxSidesForLevel;
  const hasEnoughLevel = levelSystem.currentLevel >= 2;
  const hasEnoughAngles = levelSystem.angles >= shapeUpgradeCost;
  
  // Barva podle stavu
  let shapeBackground, shapeBorder, shapeTextColor;
  
  if (!hasEnoughLevel) {
    // ŠEDÁ - nemá level
    shapeBackground = 'rgba(100, 100, 100, 0.1)';
    shapeBorder = '#666666';
    shapeTextColor = '#888888';
  } else if (!hasEnoughAngles || isMaxed) {
    // ČERVENÁ - nemá peníze nebo je na maximu
    shapeBackground = 'rgba(255, 100, 100, 0.2)';
    shapeBorder = '#ff6464';
    shapeTextColor = '#ffffff';
  } else {
    // ŽLUTÁ - lze koupit
    shapeBackground = 'rgba(255, 220, 0, 0.2)';
    shapeBorder = '#ffdd00';
    shapeTextColor = '#ffffff';
  }
  
  ctx.fillStyle = shapeBackground;
  ctx.fillRect(shapeBtnX, shapeBtnY, shapeBtnW, shapeBtnH);
  
  ctx.strokeStyle = shapeBorder;
  ctx.lineWidth = 1;
  ctx.strokeRect(shapeBtnX, shapeBtnY, shapeBtnW, shapeBtnH);
  
  ctx.fillStyle = shapeTextColor;
  ctx.font = '8px Arial';
  ctx.textAlign = 'center';
  const shapeStatusStr = !hasEnoughLevel ? '🔒' : '';
  ctx.fillText(`${levelSystem.playerSides}-gon → ${levelSystem.playerSides + 1}-gon ${shapeStatusStr}`, panelX + panelWidth / 2, shapeBtnY + 12);
  ctx.font = '7px Arial';
  ctx.fillText(`(${shapeUpgradeCost}⊻) Max ${maxSidesForLevel}`, panelX + panelWidth / 2, shapeBtnY + 21);
  
  uiButtons.shapeUpgradeButton = { x: shapeBtnX, y: shapeBtnY, w: shapeBtnW, h: shapeBtnH };
  
  // Angle Multiplier upgrade
  const angleGeoY = shapeBtnY + 50;
  ctx.fillStyle = '#ff9f43';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⬠ Angle Multiplier', panelX + panelWidth / 2, angleGeoY);
  
  const angleBtnX = panelX + padding;
  const angleBtnY = angleGeoY + 10;
  const angleBtnW = colorBtnWidth;
  const angleBtnH = 24;
  
  const angleCost = 150;
  const hasAngleMultiplier = shopSystem.hasAngleMultiplier;
  const canAffordAngle = status.angles >= angleCost;
  const currentAngleMultiplier = shopSystem.getAngleMultiplier(levelSystem.playerSides);
  
  // Barva podle stavu
  let angleBackground, angleBorder, angleTextColor;
  
  if (hasAngleMultiplier) {
    // ZELENÁ - již koupeno
    angleBackground = 'rgba(0, 255, 100, 0.2)';
    angleBorder = '#00ff64';
    angleTextColor = '#ffffff';
  } else if (canAffordAngle) {
    // ČERVENÁ - lze koupit
    angleBackground = 'rgba(255, 100, 100, 0.2)';
    angleBorder = '#ff6464';
    angleTextColor = '#ffffff';
  } else {
    // ŠEDÁ - nemůžu koupit
    angleBackground = 'rgba(100, 100, 100, 0.1)';
    angleBorder = '#666666';
    angleTextColor = '#888888';
  }
  
  ctx.fillStyle = angleBackground;
  ctx.fillRect(angleBtnX, angleBtnY, angleBtnW, angleBtnH);
  
  ctx.strokeStyle = angleBorder;
  ctx.lineWidth = 1;
  ctx.strokeRect(angleBtnX, angleBtnY, angleBtnW, angleBtnH);
  
  ctx.fillStyle = angleTextColor;
  ctx.font = '8px Arial';
  ctx.textAlign = 'center';
  const angleStatusStr = hasAngleMultiplier ? '✓' : '';
  ctx.fillText(`+${(currentAngleMultiplier - 1).toFixed(2)}x ${angleStatusStr} ${angleCost}⊻`, panelX + panelWidth / 2, angleBtnY + 15);
  
  uiButtons.angleMultiplierButton = { x: angleBtnX, y: angleBtnY, w: angleBtnW, h: angleBtnH };
  
  // XP Multiplier upgrade
  const xpGeoY = angleBtnY + 50;
  ctx.fillStyle = '#ff6b9d';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⬠ XP Multiplier', panelX + panelWidth / 2, xpGeoY);
  
  const xpBtnX = panelX + padding;
  const xpBtnY = xpGeoY + 10;
  const xpBtnW = colorBtnWidth;
  const xpBtnH = 24;
  
  const xpCost = 150;
  const hasXPMultiplier = shopSystem.hasXPMultiplier;
  const canAffordXP = status.angles >= xpCost;
  const currentXPMultiplier = shopSystem.getXPMultiplier(levelSystem.playerSides);
  
  // Barva podle stavu
  let xpBackground, xpBorder, xpTextColor;
  
  if (hasXPMultiplier) {
    // ZELENÁ - již koupeno
    xpBackground = 'rgba(0, 255, 100, 0.2)';
    xpBorder = '#00ff64';
    xpTextColor = '#ffffff';
  } else if (canAffordXP) {
    // ČERVENÁ - lze koupit
    xpBackground = 'rgba(255, 100, 100, 0.2)';
    xpBorder = '#ff6464';
    xpTextColor = '#ffffff';
  } else {
    // ŠEDÁ - nemůžu koupit
    xpBackground = 'rgba(100, 100, 100, 0.1)';
    xpBorder = '#666666';
    xpTextColor = '#888888';
  }
  
  ctx.fillStyle = xpBackground;
  ctx.fillRect(xpBtnX, xpBtnY, xpBtnW, xpBtnH);
  
  ctx.strokeStyle = xpBorder;
  ctx.lineWidth = 1;
  ctx.strokeRect(xpBtnX, xpBtnY, xpBtnW, xpBtnH);
  
  ctx.fillStyle = xpTextColor;
  ctx.font = '8px Arial';
  ctx.textAlign = 'center';
  const xpStatusStr = hasXPMultiplier ? '✓' : '';
  ctx.fillText(`+${(currentXPMultiplier - 1).toFixed(2)}x ${xpStatusStr} ${xpCost}⊻`, panelX + panelWidth / 2, xpBtnY + 15);
  
  uiButtons.xpMultiplierButton = { x: xpBtnX, y: xpBtnY, w: xpBtnW, h: xpBtnH };
}

// TABLET LAYOUT (480px - 768px)
function drawShopTablet(panelX, panelY, panelWidth, panelHeight) {
  const status = levelSystem.getStatus();
  const padding = 12;
  const startY = panelY + 50;
  const colWidth = (panelWidth - 3 * padding) / 2;
  
  // Levý sloupec - barevné upgrady
  ctx.fillStyle = '#ff9f43';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('⬢ Colors', panelX + padding, startY);
  
  for (let i = 0; i < 5; i++) {
    const upgrade = shopSystem.colorUpgrades[i];
    const y = startY + 22 + i * 42;
    
    const isBought = shopSystem.selectedColorLevel > i;
    const isAffordable = status.angles >= shopSystem.getColorUpgradeCost(i + 1);
    
    // Barva podle stavu: Koupeno (zelené) / Lze koupit (červené) / Nemůžu koupit (šedé)
    if (isBought) {
      ctx.fillStyle = 'rgba(0, 255, 100, 0.2)';  // ZELENÁ - koupeno
    } else if (isAffordable) {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';  // ČERVENÁ - lze koupit
    } else {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';  // ŠEDÁ - nemůžu koupit
    }
    
    ctx.fillRect(panelX + padding, y, colWidth, 28);
    
    // Border barva
    let borderColor = '#666666';
    if (isBought) borderColor = '#00ff64';  // Zelená - koupeno
    if (isAffordable && !isBought) borderColor = '#ff6464';  // Červená - lze koupit
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(panelX + padding, y, colWidth, 28);
    
    // Text barva
    ctx.fillStyle = isBought || isAffordable ? '#ffffff' : '#888888';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    
    const costStr = `${shopSystem.getColorUpgradeCost(i + 1)}⊻`;
    const statusStr = isBought ? '✓' : (!isAffordable ? '🔒' : '');
    ctx.fillText(`${upgrade.name} ${statusStr}`, panelX + padding + 5, y + 8);
    ctx.fillText(costStr, panelX + padding + 5, y + 20);
    
    uiButtons.colorUpgrades[i] = { x: panelX + padding, y: y, w: colWidth, h: 28 };
  }
  
  // Pravý sloupec - upgrady ostrosti
  const rightX = panelX + padding + colWidth + padding;
  ctx.fillStyle = '#ff6b9d';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('◆ Sharpness', rightX, startY);
  
  for (let i = 0; i < 5; i++) {
    const upgrade = shopSystem.sharpnessUpgrades[i];
    const y = startY + 22 + i * 42;
    
    const isBought = shopSystem.selectedSharpnessLevel > i;
    const isAffordable = status.angles >= shopSystem.getSharpnessUpgradeCost(i + 1);
    
    // Barva podle stavu: Koupeno (zelené) / Lze koupit (červené) / Nemůžu koupit (šedé)
    if (isBought) {
      ctx.fillStyle = 'rgba(0, 255, 100, 0.2)';  // ZELENÁ - koupeno
    } else if (isAffordable) {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';  // ČERVENÁ - lze koupit
    } else {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';  // ŠEDÁ - nemůžu koupit
    }
    
    ctx.fillRect(rightX, y, colWidth, 28);
    
    // Border barva
    let borderColor = '#666666';
    if (isBought) borderColor = '#00ff64';  // Zelená - koupeno
    if (isAffordable && !isBought) borderColor = '#ff6464';  // Červená - lze koupit
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rightX, y, colWidth, 28);
    
    // Text barva
    ctx.fillStyle = isBought || isAffordable ? '#ffffff' : '#888888';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    
    const costStr = `${shopSystem.getSharpnessUpgradeCost(i + 1)}⊻`;
    const statusStr = isBought ? '✓' : (!isAffordable ? '🔒' : '');
    ctx.fillText(`${upgrade.name} ${statusStr}`, rightX + 5, y + 8);
    ctx.fillText(costStr, rightX + 5, y + 20);
    
    uiButtons.sharpnessUpgrades[i] = { x: rightX, y: y, w: colWidth, h: 28 };
  }
  
  // Shape upgrade
  const shapeY = startY + 185;
  ctx.fillStyle = '#ffdd00';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⬟ Shape', panelX + panelWidth / 2, shapeY);
  
  const shapeBtnX = panelX + panelWidth / 2 - 70;
  const shapeBtnY = shapeY + 10;
  const shapeBtnW = 140;
  const shapeBtnH = 26;
  
  const shapeUpgradeCost = levelSystem.upgradeCost;
  const maxSidesForLevel = levelSystem.currentLevel + 2;
  const isMaxed = levelSystem.playerSides >= maxSidesForLevel;
  const hasEnoughLevel = levelSystem.currentLevel >= 2;
  const hasEnoughAngles = levelSystem.angles >= shapeUpgradeCost;
  
  // Barva podle stavu
  let shapeBackground, shapeBorder, shapeTextColor;
  
  if (!hasEnoughLevel) {
    // ŠEDÁ - nemá level
    shapeBackground = 'rgba(100, 100, 100, 0.1)';
    shapeBorder = '#666666';
    shapeTextColor = '#888888';
  } else if (!hasEnoughAngles || isMaxed) {
    // ČERVENÁ - nemá peníze nebo je na maximu
    shapeBackground = 'rgba(255, 100, 100, 0.2)';
    shapeBorder = '#ff6464';
    shapeTextColor = '#ffffff';
  } else {
    // ŽLUTÁ - lze koupit
    shapeBackground = 'rgba(255, 220, 0, 0.2)';
    shapeBorder = '#ffdd00';
    shapeTextColor = '#ffffff';
  }
  
  ctx.fillStyle = shapeBackground;
  ctx.fillRect(shapeBtnX, shapeBtnY, shapeBtnW, shapeBtnH);
  
  ctx.strokeStyle = shapeBorder;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(shapeBtnX, shapeBtnY, shapeBtnW, shapeBtnH);
  
  ctx.fillStyle = shapeTextColor;
  ctx.font = '9px Arial';
  ctx.textAlign = 'center';
  const shapeStatusStr = !hasEnoughLevel ? '🔒' : '';
  ctx.fillText(`${levelSystem.playerSides}-gon → ${levelSystem.playerSides + 1}-gon ${shapeStatusStr}`, panelX + panelWidth / 2, shapeBtnY + 8);
  ctx.fillText(`(${shapeUpgradeCost}⊻)`, panelX + panelWidth / 2, shapeBtnY + 19);
  
  uiButtons.shapeUpgradeButton = { x: shapeBtnX, y: shapeBtnY, w: shapeBtnW, h: shapeBtnH };
  
  // Angle Multiplier upgrade - full width below shape
  const angleGeoY = shapeY + 60;
  ctx.fillStyle = '#ff9f43';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⬠ Angle Multiplier', panelX + panelWidth / 2, angleGeoY);
  
  const angleBtnX = panelX + padding;
  const angleBtnY = angleGeoY + 10;
  const angleBtnW = panelWidth - 2 * padding;
  const angleBtnH = 28;
  
  const angleCost = 150;
  const hasAngleMultiplier = shopSystem.hasAngleMultiplier;
  const canAffordAngle = status.angles >= angleCost;
  const currentAngleMultiplier = shopSystem.getAngleMultiplier(levelSystem.playerSides);
  
  // Barva podle stavu
  let angleBackground, angleBorder, angleTextColor;
  
  if (hasAngleMultiplier) {
    // ZELENÁ - již koupeno
    angleBackground = 'rgba(0, 255, 100, 0.2)';
    angleBorder = '#00ff64';
    angleTextColor = '#ffffff';
  } else if (canAffordAngle) {
    // ČERVENÁ - lze koupit
    angleBackground = 'rgba(255, 100, 100, 0.2)';
    angleBorder = '#ff6464';
    angleTextColor = '#ffffff';
  } else {
    // ŠEDÁ - nemůžu koupit
    angleBackground = 'rgba(100, 100, 100, 0.1)';
    angleBorder = '#666666';
    angleTextColor = '#888888';
  }
  
  ctx.fillStyle = angleBackground;
  ctx.fillRect(angleBtnX, angleBtnY, angleBtnW, angleBtnH);
  
  ctx.strokeStyle = angleBorder;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(angleBtnX, angleBtnY, angleBtnW, angleBtnH);
  
  ctx.fillStyle = angleTextColor;
  ctx.font = '9px Arial';
  ctx.textAlign = 'left';
  const angleStatusStr = hasAngleMultiplier ? '✓' : '';
  ctx.fillText(`Bonus +${(currentAngleMultiplier - 1).toFixed(2)}x ${angleStatusStr}`, angleBtnX + 5, angleBtnY + 8);
  ctx.fillText(`${currentAngleMultiplier.toFixed(1)}x multiplier | ${angleCost}⊻`, angleBtnX + 5, angleBtnY + 20);
  
  uiButtons.angleMultiplierButton = { x: angleBtnX, y: angleBtnY, w: angleBtnW, h: angleBtnH };
  
  // XP Multiplier upgrade - full width below angle
  const xpGeoY = angleGeoY + 60;
  ctx.fillStyle = '#ff6b9d';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⬠ XP Multiplier', panelX + panelWidth / 2, xpGeoY);
  
  const xpBtnX = panelX + padding;
  const xpBtnY = xpGeoY + 10;
  const xpBtnW = panelWidth - 2 * padding;
  const xpBtnH = 28;
  
  const xpCost = 150;
  const hasXPMultiplier = shopSystem.hasXPMultiplier;
  const canAffordXP = status.angles >= xpCost;
  const currentXPMultiplier = shopSystem.getXPMultiplier(levelSystem.playerSides);
  
  // Barva podle stavu
  let xpBackground, xpBorder, xpTextColor;
  
  if (hasXPMultiplier) {
    // ZELENÁ - již koupeno
    xpBackground = 'rgba(0, 255, 100, 0.2)';
    xpBorder = '#00ff64';
    xpTextColor = '#ffffff';
  } else if (canAffordXP) {
    // ČERVENÁ - lze koupit
    xpBackground = 'rgba(255, 100, 100, 0.2)';
    xpBorder = '#ff6464';
    xpTextColor = '#ffffff';
  } else {
    // ŠEDÁ - nemůžu koupit
    xpBackground = 'rgba(100, 100, 100, 0.1)';
    xpBorder = '#666666';
    xpTextColor = '#888888';
  }
  
  ctx.fillStyle = xpBackground;
  ctx.fillRect(xpBtnX, xpBtnY, xpBtnW, xpBtnH);
  
  ctx.strokeStyle = xpBorder;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(xpBtnX, xpBtnY, xpBtnW, xpBtnH);
  
  ctx.fillStyle = xpTextColor;
  ctx.font = '9px Arial';
  ctx.textAlign = 'left';
  const xpStatusStr = hasXPMultiplier ? '✓' : '';
  ctx.fillText(`Bonus +${(currentXPMultiplier - 1).toFixed(2)}x ${xpStatusStr}`, xpBtnX + 5, xpBtnY + 8);
  ctx.fillText(`${currentXPMultiplier.toFixed(1)}x multiplier | ${xpCost}⊻`, xpBtnX + 5, xpBtnY + 20);
  
  uiButtons.xpMultiplierButton = { x: xpBtnX, y: xpBtnY, w: xpBtnW, h: xpBtnH };
}

// DESKTOP LAYOUT (> 768px) - Původní design
function drawShopDesktop(panelX, panelY, panelWidth, panelHeight) {
  const status = levelSystem.getStatus();
  
  // ===== LEVÁ STRANA - BAREVNÉ UPGRADY =====
  const leftX = panelX + 20;
  const leftY = panelY + 80;
  
  ctx.fillStyle = '#ff9f43';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('⬢ Colors', leftX, leftY);
  
  for (let i = 0; i < 5; i++) {
    const upgrade = shopSystem.colorUpgrades[i];
    const y = leftY + 35 + i * 48;
    
    const btnX = leftX;
    const btnY = y - 15;
    const btnW = 210;
    const btnH = 30;
    
    const isBought = shopSystem.selectedColorLevel > i;
    const isAffordable = status.angles >= shopSystem.getColorUpgradeCost(i + 1);
    const isSelected = shopSystem.selectedColorLevel === i + 1;
    
    // Barva podle stavu: Koupeno (zelené) / Lze koupit (červené) / Nemůžu koupit (šedé)
    if (isBought) {
      ctx.fillStyle = 'rgba(0, 255, 100, 0.2)';  // ZELENÁ - koupeno
    } else if (isAffordable) {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';  // ČERVENÁ - lze koupit
    } else {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';  // ŠEDÁ - nemůžu koupit
    }
    
    ctx.fillRect(btnX, btnY, btnW, btnH);
    
    // Border barva
    let borderColor = '#666666';
    if (isBought) borderColor = '#00ff64';  // Zelená - koupeno
    if (isAffordable && !isBought) borderColor = '#ff6464';  // Červená - lze koupit
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(btnX, btnY, btnW, btnH);
    
    // Text barva
    ctx.fillStyle = isBought || isAffordable ? '#ffffff' : '#888888';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    
    const costStr = `${shopSystem.getColorUpgradeCost(i + 1)}⊻`;
    const statusStr = isBought ? '✓' : (!isAffordable ? '🔒' : '');
    
    ctx.fillText(`${upgrade.name} ${statusStr}`, btnX + 5, y - 2);
    ctx.fillText(upgrade.description + ' | ' + costStr, btnX + 5, y + 10);
    
    uiButtons.colorUpgrades[i] = { x: btnX, y: btnY, w: btnW, h: btnH };
  }
  
  // ===== PRAVÁ STRANA - UPGRADY OSTROSTI =====
  const rightX = panelX + 470;
  
  ctx.fillStyle = '#ff6b9d';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('◆ Sharpness', rightX, leftY);
  
  for (let i = 0; i < 5; i++) {
    const upgrade = shopSystem.sharpnessUpgrades[i];
    const y = leftY + 35 + i * 48;
    
    const btnX = rightX;
    const btnY = y - 15;
    const btnW = 210;
    const btnH = 30;
    
    const isBought = shopSystem.selectedSharpnessLevel > i;
    const isAffordable = status.angles >= shopSystem.getSharpnessUpgradeCost(i + 1);
    
    // Barva podle stavu: Koupeno (zelené) / Lze koupit (červené) / Nemůžu koupit (šedé)
    if (isBought) {
      ctx.fillStyle = 'rgba(0, 255, 100, 0.2)';  // ZELENÁ - koupeno
    } else if (isAffordable) {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';  // ČERVENÁ - lze koupit
    } else {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';  // ŠEDÁ - nemůžu koupit
    }
    
    ctx.fillRect(btnX, btnY, btnW, btnH);
    
    // Border barva
    let borderColor = '#666666';
    if (isBought) borderColor = '#00ff64';  // Zelená - koupeno
    if (isAffordable && !isBought) borderColor = '#ff6464';  // Červená - lze koupit
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(btnX, btnY, btnW, btnH);
    
    // Text barva
    ctx.fillStyle = isBought || isAffordable ? '#ffffff' : '#888888';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    
    const costStr = `${shopSystem.getSharpnessUpgradeCost(i + 1)}⊻`;
    const statusStr = isBought ? '✓' : (!isAffordable ? '🔒' : '');
    
    ctx.fillText(`${upgrade.name} ${statusStr}`, btnX + 5, y - 2);
    ctx.fillText(upgrade.description + ' | ' + costStr, btnX + 5, y + 10);
    
    uiButtons.sharpnessUpgrades[i] = { x: btnX, y: btnY, w: btnW, h: btnH };
  }
  
  // ===== UPGRADE TVARU - UPROSTŘED DOLE =====
  // Posunuto výše aby se neprekrývalo s XP sectionem a level up buttonem
  const shapeY = panelY + panelHeight - 200;
  
  ctx.fillStyle = '#ffdd00';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⬟ Shape Upgrade', panelX + panelWidth / 2, shapeY);
  
  const shapeBtnX = panelX + panelWidth / 2 - 95;
  const shapeBtnY = shapeY + 12;
  const shapeBtnW = 190;
  const shapeBtnH = 28;
  
  const shapeUpgradeCost = levelSystem.upgradeCost;
  const maxSidesForLevel = levelSystem.currentLevel + 2;
  const isMaxed = levelSystem.playerSides >= maxSidesForLevel;  // Már je na maximu pro level
  const hasEnoughLevel = levelSystem.currentLevel >= 2;  // Má dostatečný level
  const hasEnoughAngles = levelSystem.angles >= shapeUpgradeCost;  // Má dost peněz
  const canBuyShape = hasEnoughLevel && hasEnoughAngles && !isMaxed;
  
  // Barva podle stavu
  let shapeBackground, shapeBorder, shapeTextColor;
  
  if (!hasEnoughLevel) {
    // ŠEDÁ - nemá level
    shapeBackground = 'rgba(100, 100, 100, 0.1)';
    shapeBorder = '#666666';
    shapeTextColor = '#888888';
  } else if (!hasEnoughAngles || isMaxed) {
    // ČERVENÁ - nemá peníze nebo je na maximu
    shapeBackground = 'rgba(255, 100, 100, 0.2)';
    shapeBorder = '#ff6464';
    shapeTextColor = '#ffffff';
  } else {
    // ŽLUTÁ - lze koupit
    shapeBackground = 'rgba(255, 220, 0, 0.2)';
    shapeBorder = '#ffdd00';
    shapeTextColor = '#ffffff';
  }
  
  ctx.fillStyle = shapeBackground;
  ctx.fillRect(shapeBtnX, shapeBtnY, shapeBtnW, shapeBtnH);
  
  ctx.strokeStyle = shapeBorder;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(shapeBtnX, shapeBtnY, shapeBtnW, shapeBtnH);
  
  ctx.fillStyle = shapeTextColor;
  ctx.font = '10px Arial';
  ctx.textAlign = 'left';
  
  // Text - pokud není level, ukaž zámek
  const shapeStatusStr = !hasEnoughLevel ? '🔒' : '';
  ctx.fillText(`${levelSystem.playerSides}-gon → ${levelSystem.playerSides + 1}-gon ${shapeStatusStr} (${shapeUpgradeCost}⊻)`, shapeBtnX + 5, shapeBtnY + 9);
  ctx.fillText(`Max ${maxSidesForLevel} sides on Lvl ${levelSystem.currentLevel}`, shapeBtnX + 5, shapeBtnY + 20);
  
  uiButtons.shapeUpgradeButton = { x: shapeBtnX, y: shapeBtnY, w: shapeBtnW, h: shapeBtnH };
  
  // ===== ANGLE MULTIPLIER UPGRADE =====
  const angleGeoY = shapeY + 62;
  
  ctx.fillStyle = '#ff9f43';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⬠ Angle Multiplier', panelX + panelWidth / 2, angleGeoY);
  
  const angleBtnX = panelX + panelWidth / 2 - 95;
  const angleBtnY = angleGeoY + 12;
  const angleBtnW = 190;
  const angleBtnH = 28;
  
  const angleCost = 150;
  const hasAngleMultiplier = shopSystem.hasAngleMultiplier;
  const canAffordAngle = status.angles >= angleCost;
  const currentAngleMultiplier = shopSystem.getAngleMultiplier(levelSystem.playerSides);
  
  // Barva podle stavu
  let angleBackground, angleBorder, angleTextColor;
  
  if (hasAngleMultiplier) {
    // ZELENÁ - již koupeno
    angleBackground = 'rgba(0, 255, 100, 0.2)';
    angleBorder = '#00ff64';
    angleTextColor = '#ffffff';
  } else if (canAffordAngle) {
    // ČERVENÁ - lze koupit
    angleBackground = 'rgba(255, 100, 100, 0.2)';
    angleBorder = '#ff6464';
    angleTextColor = '#ffffff';
  } else {
    // ŠEDÁ - nemůžu koupit
    angleBackground = 'rgba(100, 100, 100, 0.1)';
    angleBorder = '#666666';
    angleTextColor = '#888888';
  }
  
  ctx.fillStyle = angleBackground;
  ctx.fillRect(angleBtnX, angleBtnY, angleBtnW, angleBtnH);
  
  ctx.strokeStyle = angleBorder;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(angleBtnX, angleBtnY, angleBtnW, angleBtnH);
  
  ctx.fillStyle = angleTextColor;
  ctx.font = '9px Arial';
  ctx.textAlign = 'left';
  const angleStatusStr = hasAngleMultiplier ? '✓' : '';
  ctx.fillText(`+${(currentAngleMultiplier - 1).toFixed(2)}x bonus (${currentAngleMultiplier.toFixed(1)}x) ${angleStatusStr}`, angleBtnX + 5, angleBtnY + 9);
  ctx.fillText(`${angleCost}⊻ | Permanent multiplier`, angleBtnX + 5, angleBtnY + 20);
  
  uiButtons.angleMultiplierButton = { x: angleBtnX, y: angleBtnY, w: angleBtnW, h: angleBtnH };
  
  // ===== XP MULTIPLIER UPGRADE =====
  const xpGeoY = angleGeoY + 62;
  
  ctx.fillStyle = '#ff6b9d';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⬠ XP Multiplier', panelX + panelWidth / 2, xpGeoY);
  
  const xpBtnX = panelX + panelWidth / 2 - 95;
  const xpBtnY = xpGeoY + 12;
  const xpBtnW = 190;
  const xpBtnH = 28;
  
  const xpCost = 150;
  const hasXPMultiplier = shopSystem.hasXPMultiplier;
  const canAffordXP = status.angles >= xpCost;
  const currentXPMultiplier = shopSystem.getXPMultiplier(levelSystem.playerSides);
  
  // Barva podle stavu
  let xpBackground, xpBorder, xpTextColor;
  
  if (hasXPMultiplier) {
    // ZELENÁ - již koupeno
    xpBackground = 'rgba(0, 255, 100, 0.2)';
    xpBorder = '#00ff64';
    xpTextColor = '#ffffff';
  } else if (canAffordXP) {
    // ČERVENÁ - lze koupit
    xpBackground = 'rgba(255, 100, 100, 0.2)';
    xpBorder = '#ff6464';
    xpTextColor = '#ffffff';
  } else {
    // ŠEDÁ - nemůžu koupit
    xpBackground = 'rgba(100, 100, 100, 0.1)';
    xpBorder = '#666666';
    xpTextColor = '#888888';
  }
  
  ctx.fillStyle = xpBackground;
  ctx.fillRect(xpBtnX, xpBtnY, xpBtnW, xpBtnH);
  
  ctx.strokeStyle = xpBorder;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(xpBtnX, xpBtnY, xpBtnW, xpBtnH);
  
  ctx.fillStyle = xpTextColor;
  ctx.font = '9px Arial';
  ctx.textAlign = 'left';
  const xpStatusStr = hasXPMultiplier ? '✓' : '';
  ctx.fillText(`+${(currentXPMultiplier - 1).toFixed(2)}x bonus (${currentXPMultiplier.toFixed(1)}x) ${xpStatusStr}`, xpBtnX + 5, xpBtnY + 9);
  ctx.fillText(`${xpCost}⊻ | Permanent multiplier`, xpBtnX + 5, xpBtnY + 20);
  
  uiButtons.xpMultiplierButton = { x: xpBtnX, y: xpBtnY, w: xpBtnW, h: xpBtnH };
}

// ===================================================================
// KONEC SHOP SYSTÉMU
// ===================================================================

// ===================================================================
// SCROLL EVENT LISTENERY - Scrollování v shopu
// ===================================================================

// Wheel scroll - myš/trackpad
canvas.addEventListener('wheel', (e) => {
  // Ignoruj scroll pokud není shop otevřený
  if (!shopOpen) return;
  
  e.preventDefault();  // Zakáž výchozí scrollování stránky
  
  // Zvýší offset při scroll dolů, sníží při scroll nahoru
  const scrollSpeed = 20;
  shopScrollOffset += e.deltaY > 0 ? scrollSpeed : -scrollSpeed;
  
  // Maximální offset - poslední prvek (XP multiplier) by měl mít 50px od spodku
  // Celkový obsah je cca 560px, panel je cca 500px, takže max offset ~60px
  // Bezpečný limit: 560px (poslední prvek + padding)
  const maxScrollOffset = 560;
  shopScrollOffset = Math.max(0, Math.min(shopScrollOffset, maxScrollOffset));
}, { passive: false });

// Touch swipe - mobilní zařízení
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
  if (!shopOpen) return;
  
  const touchCurrentY = e.touches[0].clientY;
  const touchDelta = touchStartY - touchCurrentY;  // Kladná hodnota = scroll dolů
  
  // Aplikuj scroll offset
  const scrollSpeed = 1;
  shopScrollOffset += touchDelta * scrollSpeed;
  
  // Omez scroll limit na poslední prvek + padding
  const maxScrollOffset = 560;
  shopScrollOffset = Math.max(0, Math.min(shopScrollOffset, maxScrollOffset));
  
  touchStartY = touchCurrentY;
}, { passive: true });

// Reset scroll offsetu při zavření shopu
export function closeShopAndReset() {
  shopOpen = false;
  shopScrollOffset = 0;
}
