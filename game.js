import { ctx } from './render.js';
import { geome, initPlayer, updatePlayer } from './player.js';
import { obstacles, generateObstacles, moveObstacles, removeOffscreenObstacles } from './obstacles.js';
import { checkCollision } from './collision.js';
import { drawGame } from './render.js';
import { setupInput } from './input.js';
import { config } from './config.js';

const canvas = document.getElementById('game');

let width, height;
let isColliding = false;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initPlayer(width, height);
}

window.addEventListener('resize', resize);
resize();

setupInput();

function gameLoop() {
  updatePlayer(height, config.floorHeight);
  generateObstacles(width, height, config.floorHeight);
  moveObstacles(isColliding);
  removeOffscreenObstacles();

  isColliding = checkCollision(height, config.floorHeight);

  drawGame(width, height);

  requestAnimationFrame(gameLoop);
}

gameLoop();
