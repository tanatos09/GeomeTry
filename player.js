import { config } from './config.js';

//objekt hrace geome s jeho pozici a fyzikou
export const geome = {
  x: 0, //pocatecni pozice X (iniPlayer)
  y: 0, //pocatecni pozice Y (iniPlayer)
  radius: 30, //velikost hrace
  velocityY: 0, //vertikalni rychlost hrace
  gravity: config.gravity, //gravitace (config)
  lift: config.lift, //skok (config)
};

//pozice hrace pri startu nebo smene velikosti
export function initPlayer(canvasWidth, canvasHeight) {
  geome.x = canvasWidth * 0.25; //nalevo ve ctvrtine
  geome.y = canvasHeight /2; //pada z poloviny
}

//aktualizace pozice hrace kazdym snimkem
export function updatePlayer(canvasHeight, floorHeight) {
  geome.velocityY += geome.gravity; //gravitace zrychluje rychlost padu
  geome.y += geome.velocityY; //aktualizace podle rychlosti

  //omezeni horni casti obrazovky
  if (geome.y - geome.radius < 0) {
    geome.y = geome.radius; //minimalni polomer
    geome.velocityY = 0; //zastaveni vertikalniho pohybu
  }

  //omezeni spodni casti obrazovky
  if (geome.y + geome.radius > canvasHeight - floorHeight) {
    geome.y = canvasHeight - floorHeight - geome.radius; //nastaveni na podlahu
    geome.velocityY = 0; //zatavi pad
  }
}

//funkce spusteni skoku
export function jump() {
  geome.velocityY = geome.lift; //nastaveni vertikalni rychlosti dle lift (config)
}
