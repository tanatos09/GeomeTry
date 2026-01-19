// ===================================================================
// BACKGROUND.JS - Dekorativní Vzory na Pozadí
// ===================================================================
// Účel: Kreslení dekorativních polygonů na pozadí
//
// Funkce:
// - Vytváří náladu (atmosféru) hry
// - Pohybuje se se zbytkem hry (parallax efekt)
// - Nekomunikuje se zbytkem herní mechanikou
// ===================================================================

import { EntityManager } from './entityManager.js';  // Správce entit (pooling)
import { drawPolygon } from './render.js';          // Kreslení polygonů

// ===================================================================
// KONFIGURACE POZADÍ
// ===================================================================

// Pole barev pro dekorativní polygony na pozadí
// Všechny mají nízkou průhlednost (0.08 = 8%) aby byly vidět zpoza
const colors = [
  'rgba(100, 150, 255, 0.08)',    // Světle modrá
  'rgba(150, 100, 255, 0.08)',    // Fialová
  'rgba(100, 200, 255, 0.08)',    // Azurová
  'rgba(200, 150, 255, 0.08)',    // Světlá fialová
  'rgba(50, 200, 255, 0.08)',     // Studená modrá
  'rgba(150, 200, 255, 0.08)',    // Ledová modrá
  'rgba(100, 255, 200, 0.08)'     // Tyrkysová
];

// Správce entit na pozadí
// (3 = počet polygonů generovaných najednou, 100 = interval v fraimech)
const backgroundManager = new EntityManager(3, 100);

// ===================================================================
// TVORBA VZORŮ POZADÍ
// ===================================================================

// Vytvoří jednu entitu pozadího (polygon)
// canvasWidth, canvasHeight: rozměry herního pole
// floorHeight: výška podlahy (polygony se negenerují v ní)
function createBackgroundPattern(canvasWidth, canvasHeight, floorHeight) {
  // Náhodný počet stran: 3-8 (trojúhelník až osmiúhelník)
  const sides = Math.floor(Math.random() * 6) + 3;
  
  // Náhodná velikost: 15-65 pixelů
  const size = Math.random() * 50 + 15;
  
  // Generuj mimo obrazovku (vpravo)
  const x = canvasWidth;
  
  // Náhodné Y (ale ne v podlaze)
  const y = Math.random() * (canvasHeight - floorHeight - size * 2) + size;
  
  // Náhodná barva z paletty
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // Náhodná počáteční rotace
  const angle = Math.random() * 2 * Math.PI;

  // Vrátí kompletní entitu pozadí
  return {
    x,                                   // X pozice
    y,                                   // Y pozice
    size,                                // Velikost
    sides,                               // Počet stran
    color,                               // Barva
    angle,                               // Rotace
    rotation: Math.random() * 0.02 - 0.01  // Rychlost rotace (-0.01 až +0.01)
  };
}

// ===================================================================
// GENEROVÁNÍ VZORŮ
// ===================================================================

// Generuj nové dekorativní polygony na pozadí
// Volá se jednou za čas z gameLoop()
export function generatePatterns(canvasWidth, canvasHeight, floorHeight) {
  // Deleguj na EntityManager - generuje skrze createBackgroundPattern
  backgroundManager.generateEntity(canvasWidth, canvasHeight, floorHeight, createBackgroundPattern);
}

// ===================================================================
// POHYB VZORŮ
// ===================================================================

// Posun všechny dekorativní polygony
// isColliding: je hráč právě v kolizi s překážkou?
// Když je v kolizi, pozadí se zpomaluje (visual feedback)
export function movePatterns(isColliding = false) {
  // Pokud je hráč v kolizi, zpomaluj pozadí na 10% normální rychlosti
  // Jinak normální rychlost
  const speedMultiplier = isColliding ? 0.1 : 1;
  
  // Deleguj na EntityManager - posune všechny entity
  backgroundManager.moveEntities(speedMultiplier);
  
  // ===== ANIMACE ROTACE =====
  // Všechny polygony se pomalu otáčejí
  backgroundManager.entities.forEach(e => {
    if (e.rotation) {
      e.angle += e.rotation;  // Aplikuj rotaci
    }
  });
}

// ===================================================================
// ÚDRŽBA
// ===================================================================

// Smaž polygony které opustily obrazovku (vlevo)
export function removeOffscreenPatterns() {
  // Deleguj na EntityManager
  backgroundManager.removeOffscreenEntities();
}

// ===================================================================
// KRESLENÍ VZORŮ
// ===================================================================

// Nakresli všechny dekorativní polygony na pozadí
export function drawPatterns() {
  // drawEntities zavolá callback pro každý polygon
  backgroundManager.drawEntities(e => {
    // Nakresli jeden polygon
    drawPolygon(e.x, e.y, e.size, e.sides, e.color, e.angle);
  });
}


