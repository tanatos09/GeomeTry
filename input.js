import { jump } from './player.js';

export function setupInput() {
  window.addEventListener("keydown", e => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      jump();
    }
  });

  window.addEventListener("mousedown", () => {
    jump();
  });
}
