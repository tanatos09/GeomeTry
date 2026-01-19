// ============================================================
// GAME.JS - HLAVNÍ HERNÍ SMYČKA A ORCHESTRACE SYSTÉMŮ
// ============================================================
// Účel: Koordinuje všechny subsystémy hry (fyzika, renderování, AI, efekty)
// a zajišťuje správné pořadí aktualizací v každém snímku hry.
// ============================================================

// Import všech modulů hry - každý modul je ES6 modul s vlastní logikou
import { ctx } from './render.js'; // Kontext pro kreslení na canvas
import { geome, initPlayer, updatePlayer } from './player.js'; // Hráč a jeho fyzika
import { obstacles, generateObstacles, moveObstacles, removeOffscreenObstacles } from './obstacles.js'; // Překážky
import { checkCollision } from './collision.js'; // Detekce kolizí hráče a překážek
import { drawGame } from './render.js'; // Funkce pro vykreslení všech herních prvků
import { setupInput } from './input.js'; // Nastavení ovládání
import { config } from './config.js'; // Konfigurace hry (gravity, obstacleGap, apod.)
import { updateAnimation } from './animation.js'; // Animace rotace hráče
import { generatePatterns, movePatterns, removeOffscreenPatterns, drawPatterns } from './background.js'; // Pozadí
import { generateEnemies, moveEnemies, removeOffscreenEnemies, drawEnemies, checkEnemyCollision } from './enemies.js'; // Nepřátelé
import { updateEnemyEffects, drawEnemyEffects } from "./enemyEffects.js"; // Efekty (exploze) nepřátel
import { levelSystem } from './leveling.js'; // Systém úrovní a XP
import { angleManager } from './angles.js'; // Systém sbíraných úhlů
import { updateAngleEffects, drawAngleEffects } from './angleEffects.js'; // Efekty úhlů

// Získání canvas elementu z HTML - je potřeba aby byl <canvas id="game"></canvas> v index.html
const canvas = document.getElementById('game');

// Proměnné pro správu stavu hry
let width, height; // Aktuální rozměry canvasu (budou nastaveny v resize())
let isColliding = false; // Indikátor zda hráč právě koliduje s překážkou

// ============================================================
// FUNKCE: resize()
// Účel: Nastaví velikost canvasu podle okna a inicializuje hru
// ============================================================
function resize() {
  // Nastavíme canvas na plnou velikost okna
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  
  // Inicializujeme hráče na novou velikost okna
  initPlayer(width, height);
  
  // Nastavíme počet stran hráče dle aktuální úrovně v levelSystem
  geome.sides = levelSystem.playerSides;
  
  // Inicializujeme systém sbíraných úhlů
  angleManager.init();
}

// Nasloucháme změně velikosti okna a znovu inicializujeme hru
window.addEventListener('resize', resize);

// Spustíme resize() poprvé když se stránka načte
resize();

// Nastavíme ovládání (klikání myší, stisknutí kláves)
setupInput();

// ============================================================
// FUNKCE: gameLoop()
// Účel: HLAVNÍ HERNÍ SMYČKA - Tato funkce běží ~60x za sekundu
// Pořadí je VELMI DŮLEŽITÉ aby si všechny systémy navzájem nekonflikt
// ============================================================
function gameLoop() {
  // ========== FÁZE 1: AKTUALIZACE FYZIKY ==========
  
  // Aktualizujeme pozici hráče (gravitace, zpomalení/pádu)
  updatePlayer(height, config.floorHeight);
  
  // Aktualizujeme rotaci hráče (otáčení polygonu)
  updateAnimation(isColliding);

  // ========== FÁZE 2: GENEROVÁNÍ A POHYB PROSTŘEDÍ ==========
  
  // Generujeme nové vzory na pozadí (hvězdy, polygony)
  generatePatterns(width, height, config.floorHeight);
  
  // Posouváme vzory pozadí doleva (zpomalíme při kolizi)
  movePatterns(isColliding);
  
  // Odstraňujeme vzory které jsou mimo obrazovku (úspora paměti)
  removeOffscreenPatterns();

  // ========== FÁZE 3: PŘEKÁŽKY ==========
  
  // Generujeme nové překážky (náhodně každých ~100 snímků)
  generateObstacles(width, height, config.floorHeight);
  
  // Posouváme překážky doleva (zastavíme při kolizi)
  moveObstacles(isColliding);
  
  // Odstraňujeme překážky mimo obrazovku
  removeOffscreenObstacles();

  // ========== FÁZE 4: NEPŘÁTELÉ ==========
  
  // Generujeme nové nepřátele
  generateEnemies(width, height, config.floorHeight);
  
  // Aktualizujeme jejich AI (pohyb, lezení přes překážky)
  moveEnemies(isColliding, width, height, config.floorHeight);
  
  // Odstraňujeme nepřátele mimo obrazovku
  removeOffscreenEnemies();

  // Kontrolujeme kolizi hráče s nepřátelem - dává XP a úhly
  checkEnemyCollision(geome);
  
  // ========== FÁZE 5: DETEKCE KOLIZÍ ==========
  
  // KRITICKÉ: Musí být PŘED efekty aby správně věděly o kolizi
  isColliding = checkCollision(height, config.floorHeight);
  
  // ========== FÁZE 6: EFEKTY NEPŘÁTEL ==========
  
  // Aktualizujeme částice z výbuchů nepřátel - MUSÍ BÝT PO detekci kolize
  updateEnemyEffects(height, config.floorHeight);
  
  // ========== FÁZE 7: LEVELOVACÍ SYSTÉM ==========
  
  // Aktualizujeme aura efekt (skvělý efekt kolem hráče při levelupu)
  levelSystem.updateLevelUpAura();
  
  // ========== FÁZE 8: SBÍRANÉ ÚHLY ==========
  
  // Generujeme nové letající úhly na obrazovce
  angleManager.generate(width, height, config.floorHeight);
  
  // Aktualizujeme jejich pohyb (drift, vlnování, zpomalení při kolizi)
  angleManager.update(isColliding, height);
  
  // Odstraňujeme úhly mimo obrazovku
  angleManager.removeOffscreen();
  
  // Aktualizujeme efekty úhlů - MUSÍ BÝT PO detekci kolize aby věděly o isColliding
  updateAngleEffects(height, config.floorHeight, isColliding);
  
  // Kontrolujeme zda hráč sbírá úhly
  const collectedAngles = angleManager.checkCollision(geome);
  if (collectedAngles.length > 0) {
    // Přidáme sbírané úhly s color bonusem (z shop.js)
    levelSystem.addAnglesFromCollect(collectedAngles.length);
  }

  // ========== FÁZE 9: VYKRESLOVÁNÍ ==========
  
  // Vyzistíme background a připravíme ho na vykreslení
  ctx.fillStyle = "#222"; // Tmavé pozadí (skoro černé)
  ctx.fillRect(0, 0, width, height); // Vykreslíme celý screen tmavým obdélníkem (čistí obrazovku)

  // Kreslíme vzory na pozadí (hvězdy, polygony)
  drawPatterns();

  // Kreslíme nepřátele
  drawEnemies();
  
  // Kreslíme efekty nepřátel (kousky z výbuchů)
  drawEnemyEffects();
  
  // Kreslíme sbírané úhly
  angleManager.draw();
  
  // Kreslíme efekty sbírání úhlů (kousky, částice)
  drawAngleEffects();

  // Kreslíme hlavní herní prvky (hráč, překážky, UI)
  drawGame(width, height);

  // ========== FÁZE 10: PŘÍŠTÍ SNÍMEK ==========
  
  // requestAnimationFrame = browser řekne nám když je připravený další snímek
  // (obvykle 60x za sekundu, nebo podle refresh rate monitoru)
  requestAnimationFrame(gameLoop);
}

// Spustíme hlavní herní smyčku
gameLoop();

//spusteni hry
gameLoop();
