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

// Získání canvas elementu z HTML a inicializace 2D kontextu
// Canvas je hlavní plocha kde kreslíme vše (pozadí, hráč, překážky, UI)
const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');   // Exportujeme ctx pro ostatní soubory

// ===================================================================
// SHOP STATE - Sledování stavu obchodu
// ===================================================================
// shopOpen: boolean - Jestli je shop panel viditelný (true = otevřen)
export let shopOpen = false;

// uiButtons: objekt uchovávající souřadnice všech interaktivních prvků
// Souřadnice jsou nastavovány během kreslení a používají se pro detekci kliknutí
export const uiButtons = {
  shopButton: null,                              // Tlačítko pro otevření/zavření shopu
  closeButton: null,                             // Tlačítko X pro zavření (v rohu panelu)
  colorUpgrades: [null, null, null, null, null], // Pole 5 tlačítek pro barevné upgrady
  sharpnessUpgrades: [null, null, null, null, null], // Pole 5 tlačítek pro upgrady ostrosti
  shapeUpgradeButton: null,                      // Tlačítko pro přidání stran polygonu
  levelUpButton: null                            // Tlačítko pro levelup
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
    if (uiButtons.shapeUpgradeButton && isClickInRect(x, y, uiButtons.shapeUpgradeButton)) {
      const result = levelSystem.buyUpgrade();  // Pokus koupit upgrade
      if (result) {
        console.log(`Upgrade completed! New shape: ${levelSystem.playerSides}-gon`);
      }
      return;
    }
    
    // ----- TLAČÍTKO LEVELUP -----
    // Když hráč má dost XP, umožní levelup
    if (uiButtons.levelUpButton && isClickInRect(x, y, uiButtons.levelUpButton)) {
      // Kontrola: má hráč dost XP na level up?
      const needsXP = levelSystem.currentXP < levelSystem.getXPRequired(levelSystem.currentLevel);
      if (!needsXP) {
        levelSystem.levelUp();  // Provede levelup (zvýší level, resetuje XP)
        shopOpen = false;       // Zavři shop po levelupu
        console.log(`Level up! New level: ${levelSystem.currentLevel}`);
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
    return;
  }
  
  // Zjisti cenu upgradu
  const cost = shopSystem.getColorUpgradeCost(level);
  
  // Zkontroluj jestli má hráč dost úhlů (měny v hře)
  if (levelSystem.angles >= cost) {
    shopSystem.selectedColorLevel = level;  // Nastav nový upgrade
    levelSystem.angles -= cost;             // Odeber cenu z inventáře
    console.log(`Bought Color: ${shopSystem.colorUpgrades[level - 1].name}`);
  } else {
    // Chybí mu úhly - řekni kolik je potřeba
    console.log(`Potřebuješ ${cost - levelSystem.angles} více úhlů!`);
  }
}

// Koupí upgrade ostrosti (zvýší XP bonusy)
// level: 1-5 (Sharp-Plasma, Ultra-Sharp, Plasma, atd.)
function buySharpnessUpgrade(level) {
  // Kontrola: jestli už hráč má koupenou vyšší nebo stejnou úroveň
  if (shopSystem.selectedSharpnessLevel >= level) {
    console.log('Už máš tuto ostrost koupenou!');  // Nemohu koupit nižší level
    return;
  }
  
  // Zjisti cenu upgradu
  const cost = shopSystem.getSharpnessUpgradeCost(level);
  
  // Zkontroluj jestli má hráč dost úhlů (měny v hře)
  if (levelSystem.angles >= cost) {
    shopSystem.selectedSharpnessLevel = level;  // Nastav nový upgrade
    levelSystem.angles -= cost;                 // Odeber cenu z inventáře
    console.log(`Bought Sharpness: ${shopSystem.sharpnessUpgrades[level - 1].name}`);
  } else {
    // Chybí mu úhly - řekni kolik je potřeba
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
  
  // ===== HLAVNÍ TVAR: ORANŽOVÉ "<" ČÁRY =====
  ctx.strokeStyle = '#ff9f43';  // Kosmická oranžová
  ctx.lineWidth = 2.5;          // Tloušťka čáry
  ctx.lineCap = 'round';        // Kulaté konce čar
  ctx.lineJoin = 'round';       // Kulaté spoje čar
  
  // Nakreslení "V" tvaru - dvě čáry které tvoří "<"
  ctx.beginPath();
  ctx.moveTo(size, -size);      // Levý horní bod
  ctx.lineTo(0, 0);             // Středový bod
  ctx.lineTo(size, size);       // Levý dolní bod
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
  const padding = 20;        // Odsazení od okraje canvasu
  const lineHeight = 25;     // Výška jedné textové řádky
  
  // ===== LEVÝ HORNÍ PANEL - INFORMACE O HRÁČI =====
  // Tmavý background panel s kosmickým stylem
  ctx.fillStyle = 'rgba(10, 20, 40, 0.8)';     // Tmavá modrá, poloprůhledná
  ctx.fillRect(padding - 5, padding - 5, 320, 160);  // Obdélník panelu
  
  // Glowing border kolem panelu
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';  // Světle modrá
  ctx.lineWidth = 2;
  ctx.strokeRect(padding - 5, padding - 5, 320, 160);
  
  // Nastavení stylu textu
  ctx.fillStyle = '#00f0ff';                     // Kyanová barva
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'left';
  
  // ===== TEXT - LEVEL S IKONOU =====
  ctx.fillText(`⬢ Level: ${status.level}`, padding, padding + 25);
  
  // ===== TEXT - POČET ZABITÍ NEPŘÁTEL =====
  ctx.font = '14px Arial';
  ctx.fillStyle = '#88ddff';                     // Světlejší modrá
  ctx.fillText(`◆ Enemies: ${status.enemiesKilled}`, padding, padding + 50);
  
  // ===== TEXT - POČET SBÍRANÝCH ÚHLŮ =====
  ctx.fillStyle = '#ffaa00';                     // Oranžová
  ctx.fillText(`⊻ Angles: ${status.angles}`, padding, padding + 75);
  
  // ===== TEXT - PROGRESS NA DALŠÍ LEVEL =====
  ctx.fillStyle = '#00f0ff';                     // Kyanová
  ctx.fillText(`✦ XP: ${status.xp}/${status.requiredXP}`, padding, padding + 100);
  
  // ===== XP PROGRESS BAR =====
  const barWidth = 300;
  const barHeight = 20;
  const barX = padding;
  const barY = padding + 120;
  
  // Tmavé pozadí baru
  ctx.fillStyle = 'rgba(30, 50, 80, 0.8)';
  ctx.fillRect(barX, barY, barWidth, barHeight);
  
  // Gradient pro vyplnění baru (přechod ze světlé do zelenavé)
  const barGradient = ctx.createLinearGradient(barX, 0, barX + barWidth * status.progress / 100, 0);
  barGradient.addColorStop(0, '#00ddff');       // Kyanová
  barGradient.addColorStop(1, '#00ffaa');       // Zelená
  ctx.fillStyle = barGradient;
  
  // Vyplni bar - proporcionálně podle progress (0-100%)
  ctx.fillRect(barX, barY, (barWidth * status.progress) / 100, barHeight);
  
  // Border kolem baru
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
  
  // ===== PRAVÝ HORNÍ PANEL - UPGRADE INFO =====
  const upgradeX = canvasWidth - 320;
  const upgradeY = padding;
  
  // Tmavý background
  ctx.fillStyle = 'rgba(10, 20, 40, 0.8)';
  ctx.fillRect(upgradeX - 5, upgradeY - 5, 310, 110);
  
  // Glowing border (oranžový tón)
  ctx.strokeStyle = 'rgba(255, 170, 0, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(upgradeX - 5, upgradeY - 5, 310, 110);
  
  // Nadpis
  ctx.fillStyle = '#ffbb00';                     // Oranžová
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('⬡ Upgrade Shop', upgradeX, upgradeY + 25);
  
  // Aktuální tvar hráče
  ctx.fillStyle = '#ddddff';                     // Světle fialová
  ctx.font = '14px Arial';
  ctx.fillText(`Shape: ${status.sides}-gon`, upgradeX, upgradeY + 50);
  
  // Cena pro další upgrade tvaru
  ctx.fillText(`Cost: ${status.nextUpgradeCost} ⊻`, upgradeX, upgradeY + 75);
  
  // Informace o dostupnosti upgradu
  if (status.angles >= status.nextUpgradeCost && status.level >= 2) {
    ctx.fillStyle = '#00ff99';                   // Zelená - dostupné
    ctx.fillText('→ [SHOP]', upgradeX, upgradeY + 100);
  } else {
    ctx.fillStyle = '#ff7777';                   // Červená - není dostupné
    ctx.fillText(`Need lvl 2+ or ${status.nextUpgradeCost - status.angles} more`, upgradeX, upgradeY + 100);
  }
  
  // ===== SHOP TLAČÍTKO - LEVÝ DOLNÍ ROH =====
  const shopButtonX = padding;
  const shopButtonY = canvasHeight - 50;
  const shopButtonW = 120;
  const shopButtonH = 40;
  
  // Změň barvu tlačítka podle toho jestli je shop otevřen
  ctx.fillStyle = shopOpen ? 'rgba(100, 200, 255, 0.8)' : 'rgba(50, 100, 150, 0.6)';
  ctx.fillRect(shopButtonX, shopButtonY, shopButtonW, shopButtonH);
  
  // Border tlačítka
  ctx.strokeStyle = shopOpen ? '#00ffff' : '#0088ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(shopButtonX, shopButtonY, shopButtonW, shopButtonH);
  
  // Text na tlačítku
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('SHOP', shopButtonX + shopButtonW / 2, shopButtonY + 28);
  
  // Ulož souřadnice shop tlačítka (potřeba pro detekci kliknutí)
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
  
  // ===== POTEMŇUJÍCÍ OVERLAY =====
  // Zčernout všecho mimo shop panel aby byla vidět lépe
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // ===== CENTRÁLNÍ SHOP PANEL =====
  const panelWidth = 900;     // Šířka panelu
  const panelHeight = 700;    // Výška panelu
  const panelX = (canvasWidth - panelWidth) / 2;   // Centruj horizontálně
  const panelY = (canvasHeight - panelHeight) / 2; // Centruj vertikálně
  
  // Background panelu - tmavý s průhledností
  ctx.fillStyle = 'rgba(10, 20, 40, 0.95)';
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
  
  // Border kolem panelu - kyanový glow
  ctx.strokeStyle = '#00ddff';
  ctx.lineWidth = 3;
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
  
  // ===== NADPIS SHOPU =====
  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('✦ SHOP ✦', canvasWidth / 2, panelY + 40);
  
  // ===== TLAČÍTKO ZAVŘENÍ (X) - VPRAVO NAHOŘE =====
  const closeX = panelX + panelWidth - 35;
  const closeY = panelY + 10;
  const closeSize = 25;
  
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
  
  // ===== LEVÁ STRANA - BAREVNÉ UPGRADY =====
  const leftX = panelX + 20;
  const leftY = panelY + 80;
  
  ctx.fillStyle = '#ff9f43';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('⬢ Colors', leftX, leftY);
  
  // Projdi všech 5 barevných upgradů
  for (let i = 0; i < 5; i++) {
    const upgrade = shopSystem.colorUpgrades[i];
    const y = leftY + 35 + i * 40;  // Y pozice každého upgradu (40px apart)
    
    // ===== TLAČÍTKO UPGRADU =====
    const btnX = leftX;
    const btnY = y - 15;
    const btnW = 210;
    const btnH = 30;
    
    // Zjistit stavy upgradu
    const isBought = shopSystem.selectedColorLevel > i;           // Už koupen nižší level?
    const isAffordable = status.angles >= shopSystem.getColorUpgradeCost(i + 1);  // Má dost úhlů?
    const isSelected = shopSystem.selectedColorLevel === i + 1;    // Je to aktuálně vybraný?
    const isLevelLocked = (i + 1) > (status.level - 1);            // Je zamčen kvůli levelu?
    
    // ===== BARVA TLAČÍTKA PODLE STAVU =====
    if (isLevelLocked) {
      ctx.fillStyle = 'rgba(80, 80, 80, 0.2)';     // Tmavá šedá = zamčeno
    } else if (isBought) {
      ctx.fillStyle = 'rgba(0, 255, 100, 0.2)';   // Zelená = koupen
    } else if (isSelected) {
      ctx.fillStyle = 'rgba(0, 200, 255, 0.3)';   // Kyanová = vybrán
    } else if (isAffordable) {
      ctx.fillStyle = 'rgba(100, 180, 255, 0.2)';  // Modrá = dostupný
    } else {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';  // Šedá = nedostupný
    }
    
    ctx.fillRect(btnX, btnY, btnW, btnH);
    
    // ===== BORDER TLAČÍTKA PODLE STAVU =====
    let borderColor = '#666666';  // Default - šedý
    if (isLevelLocked) borderColor = '#444444';           // Tmavší šedá = zamčeno
    if (isBought) borderColor = '#00ff64';                // Zelená = koupen
    if (isSelected) borderColor = '#00ffff';              // Kyanová = vybrán
    if (isAffordable && !isBought && !isLevelLocked) borderColor = '#0088ff';  // Modrá = dostupný
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(btnX, btnY, btnW, btnH);
    
    // ===== TEXT NA TLAČÍTKU =====
    ctx.fillStyle = isLevelLocked ? '#666666' : (isAffordable || isBought ? '#ffffff' : '#888888');
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    
    // Ikona stavu: ✓ = koupen, ● = vybrán, 🔒 = zamčen
    const costStr = `${shopSystem.getColorUpgradeCost(i + 1)}⊻`;
    const statusStr = isBought ? '✓' : (isSelected ? '●' : (isLevelLocked ? '🔒' : ''));
    
    // Název upgradu + status
    ctx.fillText(`${upgrade.name} ${statusStr}`, btnX + 5, y - 2);
    // Popis + cena
    ctx.fillText(upgrade.description + ' | ' + costStr, btnX + 5, y + 10);
    
    // Ulož souřadnice tlačítka (pro detekci kliknutí)
    uiButtons.colorUpgrades[i] = { x: btnX, y: btnY, w: btnW, h: btnH };
  }
  
  // ===== PRAVÁ STRANA - UPGRADY OSTROSTI =====
  const rightX = panelX + 470;  // Odsazení na pravou stranu
  
  ctx.fillStyle = '#ff6b9d';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('◆ Sharpness', rightX, leftY);  // Nadpis vedle barevných upgradů
  
  // Projdi všech 5 upgradů ostrosti
  for (let i = 0; i < 5; i++) {
    const upgrade = shopSystem.sharpnessUpgrades[i];
    const y = leftY + 35 + i * 40;  // Stejné Y pozice jako barvy (vedle sebe)
    
    // ===== TLAČÍTKO UPGRADU =====
    const btnX = rightX;
    const btnY = y - 15;
    const btnW = 210;
    const btnH = 30;
    
    // Zjistit stavy upgradu (stejná logika jako barevné upgrady)
    const isBought = shopSystem.selectedSharpnessLevel > i;
    const isAffordable = status.angles >= shopSystem.getSharpnessUpgradeCost(i + 1);
    const isSelected = shopSystem.selectedSharpnessLevel === i + 1;
    const isLevelLocked = (i + 1) > (status.level - 1);
    
    // ===== BARVA TLAČÍTKA PODLE STAVU =====
    if (isLevelLocked) {
      ctx.fillStyle = 'rgba(80, 80, 80, 0.2)';     // Tmavá šedá = zamčeno
    } else if (isBought) {
      ctx.fillStyle = 'rgba(0, 255, 100, 0.2)';   // Zelená = koupen
    } else if (isSelected) {
      ctx.fillStyle = 'rgba(255, 100, 150, 0.3)';  // Růžová = vybrán
    } else if (isAffordable) {
      ctx.fillStyle = 'rgba(255, 150, 200, 0.2)';  // Světle růžová = dostupný
    } else {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';  // Šedá = nedostupný
    }
    
    ctx.fillRect(btnX, btnY, btnW, btnH);
    
    // ===== BORDER TLAČÍTKA PODLE STAVU =====
    let borderColor = '#666666';  // Default - šedý
    if (isLevelLocked) borderColor = '#444444';
    if (isBought) borderColor = '#00ff64';              // Zelená = koupen
    if (isSelected) borderColor = '#ff6b9d';            // Růžová = vybrán
    if (isAffordable && !isBought && !isLevelLocked) borderColor = '#ff9fbf';  // Světle růžová
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(btnX, btnY, btnW, btnH);
    
    // ===== TEXT NA TLAČÍTKU =====
    ctx.fillStyle = isLevelLocked ? '#666666' : (isAffordable || isBought ? '#ffffff' : '#888888');
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    
    // Cena a status
    const costStr = `${shopSystem.getSharpnessUpgradeCost(i + 1)}⊻`;
    const statusStr = isBought ? '✓' : (isSelected ? '●' : (isLevelLocked ? '🔒' : ''));
    
    ctx.fillText(`${upgrade.name} ${statusStr}`, btnX + 5, y - 2);
    ctx.fillText(upgrade.description + ' | ' + costStr, btnX + 5, y + 10);
    
    // Ulož souřadnice tlačítka (pro detekci kliknutí)
    uiButtons.sharpnessUpgrades[i] = { x: btnX, y: btnY, w: btnW, h: btnH };
  }
  
  // ===== UPGRADE TVARU - UPROSTŘED DOLE (PŘIDÁNÍ STRAN) =====
  const shapeY = panelY + panelHeight - 100;
  
  ctx.fillStyle = '#ffdd00';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⬟ Shape Upgrade', panelX + panelWidth / 2, shapeY);
  
  // Tlačítko pro upgrade tvaru
  const shapeBtnX = panelX + panelWidth / 2 - 95;
  const shapeBtnY = shapeY + 12;
  const shapeBtnW = 190;
  const shapeBtnH = 28;
  
  const shapeUpgradeCost = levelSystem.upgradeCost;
  const canBuyShape = levelSystem.currentLevel >= 2 && levelSystem.angles >= shapeUpgradeCost;
  
  // Barva tlačítka - žlutá pokud dostupné, šedá pokud ne
  ctx.fillStyle = canBuyShape ? 'rgba(255, 200, 50, 0.2)' : 'rgba(100, 100, 100, 0.1)';
  ctx.fillRect(shapeBtnX, shapeBtnY, shapeBtnW, shapeBtnH);
  
  // Border tlačítka
  ctx.strokeStyle = canBuyShape ? '#ffdd00' : '#666666';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(shapeBtnX, shapeBtnY, shapeBtnW, shapeBtnH);
  
  // Text na tlačítku
  ctx.fillStyle = canBuyShape ? '#ffffff' : '#888888';
  ctx.font = '10px Arial';
  ctx.textAlign = 'left';
  
  // Zobraz upgrade: 3-gon → 4-gon, apod.
  ctx.fillText(`${levelSystem.playerSides}-gon → ${levelSystem.playerSides + 1}-gon (${shapeUpgradeCost}⊻)`, shapeBtnX + 5, shapeBtnY + 9);
  ctx.fillText(`Requires Level 2+`, shapeBtnX + 5, shapeBtnY + 20);
  
  // Ulož souřadnice tlačítka (pro detekci kliknutí)
  uiButtons.shapeUpgradeButton = { x: shapeBtnX, y: shapeBtnY, w: shapeBtnW, h: shapeBtnH };
  
  // ===== LEVELUP TLAČÍTKO A PROGRESS - DLE DOLE =====
  const levelupBtnX = panelX + panelWidth / 2 - 105;
  const levelupBtnY = panelY + panelHeight - 48;
  const levelupBtnW = 210;
  const levelupBtnH = 35;
  
  // ===== INFORMACE O XP NA PŘÍŠTÍ LEVEL =====
  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Level ${status.level} → ${status.level + 1}`, panelX + panelWidth / 2, levelupBtnY - 38);
  
  ctx.fillStyle = '#cccccc';
  ctx.font = '9px Arial';
  ctx.fillText(`${status.xp} / ${status.requiredXP} XP`, panelX + panelWidth / 2, levelupBtnY - 26);
  
  // ===== PROGRESS BAR NA XP =====
  const barX = levelupBtnX + 10;
  const barY = levelupBtnY - 44;
  const barW = levelupBtnW - 20;
  const barH = 8;
  
  // Tmavé pozadí baru
  ctx.fillStyle = 'rgba(30, 50, 80, 0.8)';
  ctx.fillRect(barX, barY, barW, barH);
  
  // Vyplnění baru - gradient s růžovým a fialovým
  const xpPercent = Math.min(100, (status.xp / status.requiredXP) * 100);
  const xpGradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  xpGradient.addColorStop(0, '#ff6b9d');       // Růžová
  xpGradient.addColorStop(1, '#9d4edd');       // Fialová
  ctx.fillStyle = xpGradient;
  ctx.fillRect(barX, barY, (barW * xpPercent) / 100, barH);
  
  // Border baru
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barH);
  
  // ===== LEVELUP TLAČÍTKO =====
  const needsXP = status.xp < status.requiredXP;  // Chybí ještě XP?
  
  // Barva tlačítka - zelená pokud je XP dost, červená pokud ne
  ctx.fillStyle = needsXP ? 'rgba(100, 50, 50, 0.3)' : 'rgba(100, 200, 100, 0.3)';
  ctx.fillRect(levelupBtnX, levelupBtnY, levelupBtnW, levelupBtnH);
  
  // Border tlačítka
  ctx.strokeStyle = needsXP ? '#ff6666' : '#00ff99';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(levelupBtnX, levelupBtnY, levelupBtnW, levelupBtnH);
  
  // Text na tlačítku - "MORE XP" nebo "LEVEL UP!"
  ctx.fillStyle = needsXP ? '#ff6666' : '#00ff99';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(needsXP ? 'MORE XP' : 'LEVEL UP!', panelX + panelWidth / 2, levelupBtnY + 22);
  
  // Ulož souřadnice levelup tlačítka (pro detekci kliknutí)
  uiButtons.levelUpButton = { x: levelupBtnX, y: levelupBtnY, w: levelupBtnW, h: levelupBtnH };
}


