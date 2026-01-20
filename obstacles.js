// ============================================================
// OBSTACLES.JS - GENEROVÁNÍ A SPRÁVA PŘEKÁŽEK
// ============================================================
// Účel: Vytváří náhodné překážky, kterými hráč musí projít
// Překážky se generují s náhodnou mezerou, kterou hráč musí skokem projít
// ============================================================

import { config } from './config.js';

// ========== GLOBÁLNÍ STAV ==========
export const obstacles = []; // Pole všech aktivních překážek na obrazovce
let frameCount = 0; // Počítadlo snímků (pro kontrolu kdy generovat nové překážky)

// ============================================================
// FUNKCE: generateObstacles(canvasWidth, canvasHeight, floorHeight, isColliding)
// Účel: Generuje nové překážky v určitých intervalech
// Parametry:
//   - canvasWidth: šířka canvasu (překážky se generují vpravo)
//   - canvasHeight: výška canvasu (pro výpočet mezer)
//   - floorHeight: výška podlahy (součást maxY výpočtu)
//   - isColliding: boolean - pokud true, nepokračuje v generování
// ============================================================
export function generateObstacles(canvasWidth, canvasHeight, floorHeight, isColliding) {
  // ========== GENEROVÁNÍ JEN POKUD NENARAZÍME ==========
  if (isColliding) {
    return; // Zastavíme generování když je v kolizi
  }
  
  // ========== INTERVAL GENEROVÁNÍ ==========
  frameCount++; // Zvýšíme počítadlo snímků
  
  // Každých 150 snímků (~2.5s při 60 FPS) generujeme novou překážku
  if (frameCount % 150 === 0) {
    
    // ========== NÁHODNÝ TYP PŘEKÁŽKY ==========
    // Existují 3 typy:
    // 0 = pouze spodní (top = 0)
    // 1 = pouze horní (bottom = 0)
    // 2 = obě (top i bottom)
    const type = Math.floor(Math.random() * 3);
    
    // ========== NÁHODNÁ VÝŠKA HORNÍ PŘEKÁŽKY ==========
    // Musíme zajistit aby mezi horní a spodní částí byla mezera (config.obstacleGap)
    // Min: 40px (aby była nějaká prostor)
    // Max: zbytek po odečtení mezer
    const topHeight = Math.random() * 
      (canvasHeight - config.obstacleGap - floorHeight - 80) + 40;
    
    // ========== VYTVOŘENÍ PŘEKÁŽKY ==========
    obstacles.push({
      x: canvasWidth, // Překážka se generuje vpravo (mimo obrazovku)
      width: config.obstacleWidth, // Šířka je definována v config.js
      
      // Horní část - existuje pokud type !== 1
      top: type !== 1 ? topHeight : 0,
      
      // Spodní část - existuje pokud type !== 0
      // Spodní je výška (ne pozice), proto canvasHeight - topHeight - obstacleGap
      bottom: type !== 0 ? canvasHeight - topHeight - config.obstacleGap : 0,
    });
  }
}

// ============================================================
// FUNKCE: moveObstacles(isColliding)
// Účel: Posunuje všechny překážky doleva
// Parametry:
//   - isColliding: boolean - pokud true, překážky se nezpohybují
// ============================================================
export function moveObstacles(isColliding) {
  // ========== POHYB JEN POKUD NENARAZÍME ==========
  if (!isColliding) {
    // Každou překážku posuneme doleva
    obstacles.forEach(obs => {
      obs.x -= config.obstacleSpeed; // Odečteme rapidnost pohybu
    });
  }
  // Pokud koliduje, překážky se zastaví (dramatic efekt zpomalení)
}

// ============================================================
// FUNKCE: removeOffscreenObstacles()
// Účel: Smaže překážky, které už nejsou vidět (úspora paměti)
// ============================================================
export function removeOffscreenObstacles() {
  // ========== ITERACE ODZADU (DŮLEŽITÉ!) ==========
  // Když smažeme prvek z pole během iterace, můžeme přeskočit prvky
  // Proto iterujeme ODZADU aby se indexy neposunuly
  for (let i = obstacles.length - 1; i >= 0; i--) {
    // ========== PODMÍNKA: Je překážka mimo obrazovku? ==========
    // obs.x + obs.width = pravá hrana překážky
    // Pokud je menší než 0, překážka je kompletně vlevo mimo obrazovku
    if (obstacles[i].x + obstacles[i].width < 0) {
      // Smaž tuto překážku
      obstacles.splice(i, 1); // splice(index, deleteCount)
    }
  }
}
