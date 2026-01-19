// ============================================================
// INPUT.JS - ZPRACOVÁNÍ VSTUPU (MYŠÍ, KLÁVESNICE, DOTYK)
// ============================================================
// Účel: Naslouchá uživatelským akcím a spouští odpovídající funkce
// Podporuje: klávesnice, myš, dotyk (mobile-friendly)
// ============================================================

import { jump } from './player.js';
import { levelSystem } from './leveling.js';
import { shopSystem } from './shop.js';
import { toggleShop, shopOpen } from './render.js';

// ============================================================
// FUNKCE: setupInput()
// Účel: Inicializuje všechny posluchače pro vstup hráče
// Volá se jednou na začátku hry v game.js
// ============================================================
export function setupInput() {
  
  // ========== KLIKNUTÍ MYŠÍ (mousedown) ==========
  // mousedown = tlačítko myši bylo stisknuté (včetně dotyku na mobile)
  window.addEventListener("mousedown", (e) => {
    // Zjistíme pozici kliknutí vzhledem k canvasu (ne k oknu)
    const rect = document.getElementById('game').getBoundingClientRect();
    const x = e.clientX - rect.left; // Relatívní X pozice v canvasu
    const y = e.clientY - rect.top;  // Relatívní Y pozice v canvasu
    
    // Dynamicky importujeme render.js abychom získali UI tlačítka
    // (Używáme dynamický import aby se vyhli circular dependency)
    import('./render.js').then(render => {
      // ========== LOGIKA: Je to kliknutí na UI prvek? ==========
      // Pokud je shop otevřený NEBO je to kliknutí na shop button
      if (render.shopOpen || (render.uiButtons.shopButton && 
          x >= render.uiButtons.shopButton.x && 
          x <= render.uiButtons.shopButton.x + render.uiButtons.shopButton.w &&
          y >= render.uiButtons.shopButton.y && 
          y <= render.uiButtons.shopButton.y + render.uiButtons.shopButton.h)) {
        // Nechej handleUIClick aby zpracoval UI kliknutí
        render.handleUIClick(x, y);
      } else {
        // Normální skok - není to kliknutí na UI
        jump();
      }
    });
  });
  
  // ========== OBECNÉ KLIKNUTÍ (click) ==========
  // click = myší tlačítko bylo stisknuté a uvolněné
  // Používáme to speciálně pro shop UI prvky (je to pro spolehlivost)
  window.addEventListener("click", (e) => {
    // Zkontrolujeme že kliknutí bylo UVNITŘ canvasu
    // Někdy se stane že hráč klikne mimo canvas a nemusíme to řešit
    const canvas = document.getElementById('game');
    if (!canvas.contains(e.target)) return; // Ignorujeme kliknutí mimo canvas
    
    // Zjistíme pozici kliknutí vzhledem k canvasu
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left; // Relatívní X pozice
    const y = e.clientY - rect.top;  // Relatívní Y pozice
    
    // Dynamicky importujeme render.js a zpracujeme UI kliknutí
    import('./render.js').then(render => {
      render.handleUIClick(x, y);
    });
  });
  
  // ========== KLÁVESNICE (keydown) ==========
  // keydown = kterákoliv klávesa byla stisknutá
  window.addEventListener("keydown", e => {
    // ========== SKOK: Space nebo Šipka Nahoru ==========
    if (e.code === "Space" || e.code === "ArrowUp") {
      jump(); // Zavoláme jump function z player.js
    }
    
    // ========== UPGRADE TVARU: Klávesa U (legacy funkce) ==========
    // Toto je stará funkce - v normální hře se kupují upgrady v shopu
    // Ale ponecháme ji pro backward compatibility
    if (e.code === "KeyU") {
      // Dynamicky importujeme leveling.js
      import('./leveling.js').then(module => {
        // Zavoláme nákup upgrade tvaru (přidání strany polygonu)
        const result = module.levelSystem.buyUpgrade();
        if (result) {
          console.log(`Upgrade completed! New shape: ${module.levelSystem.playerSides}-gon`);
        } else {
          console.log(`Not enough angles or need level 2!`);
        }
      });
    }
  });
}
