// importy jednotlivyvh modulu
import { ctx } from './render.js';
import { geome, initPlayer, updatePlayer } from './player.js';
import { obstacles, generateObstacles, moveObstacles, removeOffscreenObstacles } from './obstacles.js';
import { checkCollision } from './collision.js';
import { drawGame } from './render.js';
import { setupInput } from './input.js';
import { config } from './config.js';
import { updateAnimation } from './animation.js';
import { generatePatterns, movePatterns, removeOffscreenPatterns, drawPatterns } from './background.js';


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
  updatePlayer(height, config.floorHeight); // aktualizace pozice hrace podle fyziky
  updateAnimation(isColliding); // aktualizace otaceni

  generatePatterns(width, height, config.floorHeight); //generovani objektu pozadi
  if (!isColliding) { //pokud hrac nenaraci, pohybuji se vzory
  movePatterns();
  }
  removeOffscreenPatterns(); //odstrani vzory co nejsou videt

  generateObstacles(width, height, config.floorHeight); //generovani prekazek
  moveObstacles(isColliding); //pohyb prekazek
  removeOffscreenObstacles(); //odstraneni prekazek mimo obrazovku

  isColliding = checkCollision(height, config.floorHeight); //kontrola narazu do prekazky

//kresleni sceny postupne
ctx.fillStyle = "#222"; //vycisteni canvasu tmavym pozadim
ctx.fillRect(0, 0, width, height); //vyplneni celeho canvasu

drawPatterns(); //vykresleni vzoru na pozadi

drawGame(width, height); //vykresleni prekazek a hrace


  //opakovani smycky pro dalsi snimek
  requestAnimationFrame(gameLoop);
}

//spusteni hry
gameLoop();
