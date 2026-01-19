// ============================================================
// PLAYER.JS - FYZIKA A POHYB HRÁČE
// ============================================================
// Účel: Spravuje pozici hráče, gravitaci, skákání a fyziku
// Hráč je reprezentován jako polygon s konfigurovatelnými stranami
// ============================================================

import { config } from './config.js';

// ============================================================
// OBJEKT: geome - Základní entita hráče
// ============================================================
// Tento objekt obsahuje všechny data potřebná pro hráče
export const geome = {
  x: 0, // Horizontální pozice (levá strana obrazovky = 0, pravá = canvas.width)
  y: 0, // Vertikální pozice (horní strana = 0, spodní = canvas.height)
  radius: 30, // Poloměr hráče (pixel) - určuje velikost a hitbox
  velocityY: 0, // Vertikální rychlost (kladné = padá dolů, záporné = letí nahoru)
  gravity: config.gravity, // Gravitační zrychlení (kolik se velocityY zvětší každý snímek)
  lift: config.lift, // Síla skoku (kolik se velocityY sníží při skoku)
  angle: 0, // Úhel rotace (radiány - pro otáčení polygonu)
  sides: 3, // Počet stran polygonu (3=trojúhelník, 4=čtverec, 5=pětiúhelník, atd.)
};

// ============================================================
// FUNKCE: initPlayer(canvasWidth, canvasHeight)
// Účel: Inicializuje hráče na začátku hry nebo po změně velikosti okna
// Parametry:
//   - canvasWidth: šířka canvas v pixelech
//   - canvasHeight: výška canvas v pixelech
// ============================================================
export function initPlayer(canvasWidth, canvasHeight) {
  // Umístíme hráče na levou čtvrtinu obrazovky, vertikálně uprostřed
  geome.x = canvasWidth * 0.25; // 25% z šířky = levá čtvrtina
  geome.y = canvasHeight / 2; // 50% z výšky = střed vertikálně
  
  // Resetujeme vertikální rychlost (hráč nezačíná se skákáním)
  geome.velocityY = 0;
}

// ============================================================
// FUNKCE: updatePlayer(canvasHeight, floorHeight)
// Účel: Aktualizuje fyziku hráče každý snímek
// Parametry:
//   - canvasHeight: výška canvas (potřeba vědět kde je dno)
//   - floorHeight: výška podlahy (černý obdélník na spodu)
// ============================================================
export function updatePlayer(canvasHeight, floorHeight) {
  // ========== GRAVITACE ==========
  // Každý snímek přidáme gravitaci do vertikální rychlosti
  // config.gravity = 0.6 znamená že hráč zrychluje dolů
  geome.velocityY += geome.gravity;
  
  // ========== POHYB ==========
  // Aplikujeme rychlost na pozici (physika = position += velocity)
  geome.y += geome.velocityY;

  // ========== OMEZENÍ HORNÍ HRANICE (STROP) ==========
  // Pokud hráč letí příliš nahoru, zastavíme ho na stropu
  if (geome.y - geome.radius < 0) {
    // geome.y - geome.radius = horní hrana hráče
    // Pokud je to menší než 0, leží to mimo obrazovku
    
    geome.y = geome.radius; // Posuneme hráče aby právě se dotýkal stropu
    geome.velocityY = 0; // Zastavíme vertikální pohyb
  }

  // ========== OMEZENÍ SPODNÍ HRANICE (PODLAHA) ==========
  // Pokud hráč padá příliš dolů, zastavíme ho na podlaze
  if (geome.y + geome.radius > canvasHeight - floorHeight) {
    // geome.y + geome.radius = spodní hrana hráče
    // canvasHeight - floorHeight = vrchol podlahy
    
    geome.y = canvasHeight - floorHeight - geome.radius; // Posuneme hráče na podlahu
    geome.velocityY = 0; // Zastavíme pád
  }
}

// ============================================================
// FUNKCE: jump()
// Účel: Iniciuje skok hráče (změníme velocityY na zápornou hodnotu)
// Volá se když hráč stiskne Space, Arrow Up nebo klikne myší
// ============================================================
export function jump() {
  // config.lift = -15 (záporné číslo = pohyb nahoru)
  // Nastavíme vertikální rychlost na lift (skokovou sílu)
  geome.velocityY = geome.lift;
}
