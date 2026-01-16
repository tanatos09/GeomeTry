// importy jednotlivyvh modulu
import { ctx } from './render.js';
import { geome, initPlayer, updatePlayer } from './player.js';
import { obstacles, generateObstacles, moveObstacles, removeOffscreenObstacles } from './obstacles.js';
import { checkCollision } from './collision.js';
import { drawGame } from './render.js';
import { setupInput } from './input.js';
import { config } from './config.js';
import { updateAnimation } from './animation.js';

//ziskani canvas elementu z HTML
const canvas = document.getElementById('game');

let width, height; //velikost ccanvasu
let isColliding = false; //kontrola narazeni do prekazky

//nastaveni velikosti canvasu a inicializace hrace dle velikosti okna
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initPlayer(width, height);
}

//udalost zmeny velikosti okna
window.addEventListener('resize', resize);
resize();

//nastaveni ovladani
setupInput();

//hlavni smycka hry
function gameLoop() {
  //aktualizace pozice hrace
  updatePlayer(height, config.floorHeight);
  
  updateAnimation(isColliding);
  //generovani novych prekazek smerem k hraci
  generateObstacles(width, height, config.floorHeight);
  //posouvani prekazek smerem k hraci
  moveObstacles(isColliding);
  //odstraneni prekazek mimo obrazovku
  removeOffscreenObstacles();

  //kontrola kolize hrace s prekazkami
  isColliding = checkCollision(height, config.floorHeight);

  //vykresleni cele sceny
  drawGame(width, height);

  //volani gameLoop pro dalsi snimek
  requestAnimationFrame(gameLoop);
}

console.log("geome angle:", geome.angle)

//spusteni hry
gameLoop();
