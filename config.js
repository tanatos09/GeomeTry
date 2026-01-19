// ============================================================
// CONFIG.JS - CENTRALIZOVANÁ KONFIGURACE HRY
// ============================================================
// Účel: Uchovává všechny magické čísla a konstanty v jednom místě
// Díky tomu je snadné upravit herní parametry bez lovení v kódu
// ============================================================

export const config = {
  // ========== FYZIKA ==========
  floorHeight: 100, // Výška černé podlahy na spodu obrazovky (v pixelech)
  gravity: 0.6, // Síla gravitace - kolik se hráč zrychluje dolů každý snímek
  lift: -15, // Síla skoku - jakou rychlostí se hráč vymrští nahoru (záporné = nahoru)
  
  // ========== PŘEKÁŽKY ==========
  obstacleWidth: 200, // Šířka jednotlivé překážky (bloku) v pixelech
  obstacleGap: 600, // Vertikální mezera mezi horní a spodní překážkou (v pixelech)
  obstacleSpeed: 3, // Jak rychle se překážky pohybují doleva (pixely za snímek)
  
  // Poznámka: Překážky se generují náhodně, ale vždy mají tuto mezeru mezi sebou
  // Hráč musí skrz tuto mezeru projít aby nepřistál na překážce
};
