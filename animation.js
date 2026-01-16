import { geome } from "./player.js";
import { config } from "./config.js";

export function updateAnimation(isColliding) {
    if (!isColliding) {
        geome.angle += config.obstacleSpeed * 0.05;
        if (geome.angle > 2 * Math.PI){
            geome.angle -= 2 * Math.PI;
        }
    }
}
