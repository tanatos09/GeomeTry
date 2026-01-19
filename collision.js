// ============================================================
// COLLISION.JS - DETEKCE KOLIZÍ HRÁČE S PŘEKÁŽKAMI
// ============================================================
// Účel: Detekuje kdy hráč (kruh) koliduje s překážkami (obdélníky)
// Zpracovává různé typy kolizí: přistání, skok do stropu, hra skončí
// ============================================================

import { geome } from './player.js';
import { obstacles } from './obstacles.js';
import { config } from './config.js';

// ============================================================
// FUNKCE: checkCollision(canvasHeight, floorHeight)
// Účel: Kontroluje kolize hráče se všemi překážkami
// Vrací: boolean - zda právě koliduje (hra skončila)
// ============================================================
export function checkCollision(canvasHeight, floorHeight) {
  let isColliding = false; // Výchozí stav: žádná kolize
  
  // ========== ULOŽENÍ PŘEDCHOZÍ POZICE ==========
  // Abychom mohli detekovat kam přesně hráč letěl
  // Používáme to pro přesné detekce (bez tunelování skrz překážky)
  const prevY = geome.y - geome.velocityY; // Kde byl hráč minulý snímek
  
  // ========== ITERACE VŠECH PŘEKÁŽEK ==========
  // Projdeme každou překážku a zkoušíme kolize
  for (const obs of obstacles) {
    
    // ========== HORIZONTÁLNÍ PŘESAH ==========
    // Kontrola: je hráč blízko překážce zleva/zprava?
    const hitX = geome.x + geome.radius > obs.x && 
                 geome.x - geome.radius < obs.x + obs.width;
    // Vysvětlení: 
    // geome.x + geome.radius = pravá hrana hráče
    // geome.x - geome.radius = levá hrana hráče
    // obs.x = levá hrana překážky
    // obs.x + obs.width = pravá hrana překážky
    
    // ========== VERTIKÁLNÍ PŘESAH: HORNÍ ČÁST ==========
    // Kontrola: má překážka horní část? A je tam hráč?
    const hitTop = obs.top > 0 && 
                   geome.y - geome.radius < obs.top;
    // obs.top = výška horní překážky (0 = žádná horní část)
    
    // ========== VERTIKÁLNÍ PŘESAH: SPODNÍ ČÁST ==========
    // Kontrola: má překážka spodní část? A je tam hráč?
    const hitBottom = obs.bottom > 0 && 
                      geome.y + geome.radius > canvasHeight - floorHeight - obs.bottom;
    // obs.bottom = výška spodní překážky
    // canvasHeight - floorHeight - obs.bottom = vrchol spodní překážky

    // ========== TYP 1: PŘISTÁNÍ NA PLATFORMĚ ==========
    // Hráč padá dolů a přistane na horní překážce
    if (hitX && hitBottom && geome.velocityY > 0 && 
        prevY + geome.radius <= obs.top) {
      // Podmínky:
      // - hitX: je v horizontálním rozsahu
      // - hitBottom: je tam horní překážka
      // - geome.velocityY > 0: padá dolů
      // - prevY + geome.radius <= obs.top: minulý snímek byl nad překážkou
      
      geome.y = obs.top - geome.radius; // Posuneme hráče na vrchol
      geome.velocityY = 0; // Zastavíme pád
      continue; // Pokračujeme na další překážku
    }

    // ========== TYP 2: NÁRAZ DO STROPU ==========
    // Hráč skáče nahoru a narazí do spodní překážky
    if (hitX && hitTop && geome.velocityY < 0 && 
        prevY - geome.radius >= obs.top) {
      // Podmínky:
      // - hitX: je v horizontálním rozsahu
      // - hitTop: je tam spodní překážka
      // - geome.velocityY < 0: letí nahoru
      // - prevY - geome.radius >= obs.top: minulý snímek byl pod překážkou
      
      geome.y = obs.top + geome.radius; // Posuneme hráče pod překážkou
      geome.velocityY = 0; // Zastavíme let nahoru
      continue; // Pokračujeme na další překážku
    }

    // ========== TYP 3: PŘISTÁNÍ NA SPODNÍ PŘEKÁŽCE ==========
    // Hráč padá a přistane na spodní části (méně časté, ale zbezpečujeme to)
    if (hitX && hitBottom && geome.velocityY > 0 && 
        prevY + geome.radius <= canvasHeight - floorHeight - obs.bottom) {
      // Pozice spodní překážky
      geome.y = canvasHeight - floorHeight - obs.bottom - geome.radius;
      geome.velocityY = 0;
      continue;
    }

    // ========== TYP 4: NÁRAZ ZBOKU = KONEC HRY! ==========
    // Hráč letí do překážky zboku (hra skončí)
    if (hitX && ((geome.y - geome.radius < obs.top) || 
                 (geome.y + geome.radius > canvasHeight - floorHeight - obs.bottom))) {
      // Podmínka: je v horizontálním rozsahu a zároveň je mimo vertikální prostor
      // (tzn. netrefil mezeru mezi horní a spodní částí)
      isColliding = true; // KONEC HRY!
      break; // Nemusíme kontrolovat další překážky
    }
  }
  
  // Vrátíme zda hráč koliduje (hra skončila)
  return isColliding;
}
