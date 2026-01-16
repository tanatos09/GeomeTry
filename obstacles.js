import { config } from './config.js';

//pole pro ukladani aktivnich prekazek
export const obstacles = [];
let frameCount = 0; //citac snimku

//funkce pro generovani prekazek dle poctu snimku
export function generateObstacles(canvasWidth, canvasHeight, floorHeight) {
  frameCount++;
  if (frameCount % 100 === 0) {
    //nahodny typ prekazky 0, 1 nebo 2
    const type = Math.floor(Math.random() * 3);
    //nahodna vyska aby mezera byla v rozmezi obstacleGap (config)
    const topHeight = Math.random() * (canvasHeight - config.obstacleGap - floorHeight - 80) + 40;

    //pridani nove prekazky do pole zprava
    obstacles.push({
      x: canvasWidth, //zacatek zprava
      width: config.obstacleWidth, //sirka prekazky (config)
      //pritomnost horni prekazky (1)
      top: type !== 1 ? topHeight : 0,
      //pritomnost spodni prekazky (1)
      bottom: type !== 0 ? canvasHeight - topHeight - config.obstacleGap : 0,
    });
  }
}

//funkce pro posun prekazek doleva pokud neni kolize
export function moveObstacles(isColliding) {
  if (!isColliding) {
    obstacles.forEach(obs => {
      obs.x -= config.obstacleSpeed; //rychlost posunu (config)
    });
  }
}

//funkce pro odstraneni prekazek mimo obrazovku - vlevo
export function removeOffscreenObstacles() {
  //prochazeni pole odzadu pro bezpecne mazani
  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1); //smaze prekazku mimo obrazovku
    }
  }
}
