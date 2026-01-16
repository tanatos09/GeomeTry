import { EntityManager } from './entityManager.js';
import { drawPolygon } from './render.js';

//pole barev entit pozadi
const colors = [
  'rgba(255, 87, 51, 0.1)',
  'rgba(51, 255, 87, 0.1)',
  'rgba(51, 87, 255, 0.1)',
  'rgba(241, 196, 15, 0.1)',
  'rgba(155, 89, 182, 0.1)'
];

//spravce entit na pozadi (rychlost, kazdych snimku)
const backgroundManager = new EntityManager(4, 20);

//funkce pro vytvoreni jedne entity
function createBackgroundPattern(canvasWidth, canvasHeight, floorHeight) {
  const sides = Math.floor(Math.random() * 8) + 3; //pocet stran
  const size = Math.random() * 40 + 20; //nahodna velikost
  const x = canvasWidth; //zacinaji na pravem okraji
  const y = Math.random() * (canvasHeight - floorHeight - size * 2) + size; //nahodna vyska
  const color = colors[Math.floor(Math.random() * colors.length)]; //nahodna barva v rozstahu barev
  const angle = Math.random() * 2 * Math.PI; //nahodny uhel

  return { x, y, size, sides, color, angle }; //vraci entitu
}

//generovani novych paternu
export function generatePatterns(canvasWidth, canvasHeight, floorHeight) {
  backgroundManager.generateEntity(canvasWidth, canvasHeight, floorHeight, createBackgroundPattern);
  console.log("generuju pattern, frame:", backgroundManager.frameCount, "entities:", backgroundManager.entities.length);
}

//posun paternu ktere jsou mimo obrazovku
export function movePatterns() {
  backgroundManager.moveEntities();
}

//odstraneni paternu mimo obrazovku
export function removeOffscreenPatterns() {
  backgroundManager.removeOffscreenEntities();
}

//vykresleni paternu
export function drawPatterns() {
  backgroundManager.drawEntities(e => {
    drawPolygon(e.x, e.y, e.size, e.sides, e.color, e.angle);
  });
}


