// ============================================================
// ANIMATION.JS - ROTACE HRÁČE
// ============================================================
// Účel: Spravuje animaci rotace hráčova polygonu
// Polygon se otáčí plynule, když se hráč pohybuje,
// a zastavuje se, když hráč narazí do překážky
// ============================================================

import { geome } from "./player.js";

// ============================================================
// FUNKCE: updateAnimation(isColliding)
// Účel: Aktualizuje úhel rotace hráče každý snímek
// Parametry:
//   - isColliding: boolean - zda právě koliduje s překážkou
// ============================================================
export function updateAnimation(isColliding) {
  // ========== RYCHLOST ROTACE ==========
  const rotationSpeed = 0.06; // Radiány za snímek (0.05 = ~2.9°)
  // Vyšší číslo = rychlejší rotace
  
  // ========== PODMÍNKA: Rotace jen když nenarazíme ==========
  if (!isColliding) {
    // Přidáme rotační rychlost k aktuálnímu úhlu
    geome.angle += rotationSpeed;
    
    // Normalizace úhlu - když přesáhne 2π (plný obrat), resetujeme
    // Tím zabranujeme tomu aby angle rostl do nekonečna
    if (geome.angle > 2 * Math.PI) {
      geome.angle -= 2 * Math.PI; // Odstraníme jeden plný obrat
    }
    // Důvod: bez toho by angle po mnoha snímcích dosáhl obřích čísel
    // a mohlo by to způsobit problémy s přesností
  }
  // Pokud koliduje, rotace se ZASTAVÍ (angle se nezmění)
}
