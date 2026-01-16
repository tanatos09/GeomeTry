import { geome } from './player.js';
import { obstacles } from './obstacles.js';
import { config } from './config.js';

// kontrola kolizi hrace s prekazkami
export function checkCollision(canvasHeight, floorHeight) {
  let isColliding = false;
  //predchozi vertikalni pozice hrace pred aktualizaci pohybu
  const prevY = geome.y - geome.velocityY;

  //prochazeni vsech prekazek ve hre
  for (const obs of obstacles) {
    //kontrola horizontalniho prekryti hrace a prekazky
    const hitX = geome.x + geome.radius > obs.x && geome.x - geome.radius < obs.x + obs.width;
    //kontrola kolize shora - nad plosinou
    const hitTop = obs.top > 0 && geome.y - geome.radius < obs.top;
    //kontrola kolize zdola - nad losinou
    const hitBottom = obs.bottom > 0 && geome.y + geome.radius > canvasHeight - floorHeight - obs.bottom;

    // kolize shora - přistání na plošině
    if (hitX && hitBottom && geome.velocityY > 0 && prevY + geome.radius <= obs.top) {
      geome.y = obs.top - geome.radius; //pozice hrace na vrchol plosiny
      geome.velocityY = 0; // zastavi vertikalni pad
      continue;
    }

    // kolize zdola - bouchnutí hlavou
    if (hitX && hitTop && geome.velocityY < 0 && prevY - geome.radius >= obs.top) {
      geome.y = obs.top + geome.radius; //posun pod plosinu
      geome.velocityY = 0; //zastaveni vestikalniho pohybu
      continue;
    }

    // kolize s podlahou překážky (shora na spodní část)
    if (hitX && hitBottom && geome.velocityY > 0 && prevY + geome.radius <= canvasHeight - floorHeight - obs.bottom) {
      geome.y = canvasHeight - floorHeight - obs.bottom - geome.radius;
      geome.velocityY = 0;
      continue;
    }

    // kolize zboku - zastavení hry
    if (hitX && ((geome.y - geome.radius < obs.top) || (geome.y + geome.radius > canvasHeight - floorHeight - obs.bottom))) {
      isColliding = true;
      break;
    }
  }
  return isColliding;
}
