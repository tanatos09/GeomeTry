import { geome } from './player.js';
import { obstacles } from './obstacles.js';
import { config } from './config.js';

//ziskani canvasu z HTML po kresleni ve 2D
const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');

//funkce pro vykresleni pravidelneho mnohouhelniku
export function drawPolygon(x, y, radius, sides, color, rotation = 0) {
  if (sides < 3) return; //minimalne 3 strany (trojuhelnik)
  const angleStep = (2 * Math.PI) / sides; //uhel mezi vrcholy
  ctx.beginPath();

  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep + rotation; //aktualni uhel pro vrchol
    const pointX = x + Math.cos(angle) * radius; //X souradnice vrcholu
    const pointY = y + Math.sin(angle) * radius; //Y souradnice vrcholu
    i === 0 ? ctx.moveTo(pointX, pointY) : ctx.lineTo(pointX, pointY); // prvni vrchol
  }
  ctx.closePath(); //uzavreni tvaru
  ctx.fillStyle = color; //barva vyplne
  ctx.fill(); //vyplneni mnohouhelniku
}

//funkce vykresleni cele hry
export function drawGame(canvasWidth, canvasHeight) {
  // pozadí - NEVYKRESLUJ celý černý obdélník tady
  // to necháme dělat drawPatterns()

  // podlaha
  ctx.fillStyle = "#555";
  ctx.fillRect(0, canvasHeight - config.floorHeight, canvasWidth, config.floorHeight);

  // překážky
  ctx.fillStyle = "rgb(255, 251, 0)";
  obstacles.forEach(obs => {
    if (obs.top > 0) {
      ctx.fillRect(obs.x, 0, obs.width, obs.top);
    }
    if (obs.bottom > 0) {
      ctx.fillRect(obs.x, canvasHeight - config.floorHeight - obs.bottom, obs.width, obs.bottom);
    }
  });

  // hráč
  drawPolygon(geome.x, geome.y, geome.radius, 3, '#00e5ff', geome.angle);
}

