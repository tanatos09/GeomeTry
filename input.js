import { jump } from './player.js';

//nastaveni ovladani hry
export function setupInput() {
  //stisk klaves
  window.addEventListener("keydown", e => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      jump();
    }
  });

  //kliknuti mysi
  window.addEventListener("mousedown", () => {
    jump();
  });
}
