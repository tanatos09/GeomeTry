// ============================================================
// CONFIG.JS - CENTRALIZOVANÁ KONFIGURACE HRY
// ============================================================
// Účel: Uchovává všechny magické čísla a konstanty v jednom místě
// Díky tomu je snadné upravit herní parametry bez lovení v kódu
// ============================================================

// Detekce typu zařízení
const isMobileDevice = () => {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Základní konfigurace
const baseConfig = {
  // ========== FYZIKA ==========
  floorHeight: 100, // Výška černé podlahy na spodu obrazovky (v pixelech)
  gravity: 0.6, // Síla gravitace - kolik se hráč zrychluje dolů každý snímek
  lift: -15, // Síla skoku - jakou rychlostí se hráč vymrští nahoru (záporné = nahoru)
  
  // ========== PŘEKÁŽKY ==========
  obstacleWidth: 100, // Šířka jednotlivé překážky (bloku) v pixelech
  obstacleGap: 900, // Vertikální mezera mezi horní a spodní překážkou (v pixelech)
  obstacleSpeed: 4, // Jak rychle se překážky pohybují doleva (pixely za snímek)
};

// Optimalizace pro mobilní zařízení
const mobileConfig = {
  obstacleGap: 700, // Větší mezera - snazší pro malé displeje
  obstacleSpeed: 3, // Pomalejší překážky
  floorHeight: 80, // Menší podlaha pro více herního prostoru
};

// Vyber config podle zařízení
export const config = isMobileDevice() ? { ...baseConfig, ...mobileConfig } : baseConfig;

// Funkce pro dynamickou úpravu při změně velikosti okna
export function updateConfigForScreen(windowWidth) {
  const isMobile = windowWidth <= 768;
  
  if (isMobile) {
    config.obstacleGap = 700;
    config.obstacleSpeed = 2.5;
    config.floorHeight = 80;
  } else {
    config.obstacleGap = 600;
    config.obstacleSpeed = 3;
    config.floorHeight = 100;
  }
}
