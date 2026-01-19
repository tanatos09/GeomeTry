import { EntityManager } from "./entityManager.js";
import { drawPolygon } from "./render.js";
import { obstacles } from "./obstacles.js";
import { spawnEnemyExplosion } from "./enemyEffects.js";

export let score = 0;

const enemyManager = new EntityManager(3, 120);

const ENEMY_SPEED_X = -3;
const CLIMB_SPEED = 1.4;
const SIDE_SNAP = 6;

function createEnemy(canvasWidth, canvasHeight, floorHeight) {
  const sides = Math.floor(Math.random() * 5) + 3;
  const size = Math.random() * 15 + 10;

  const x = canvasWidth + size + 5;

  const minY = size;
  const maxY = canvasHeight - floorHeight - size;
  const y = Math.random() * (maxY - minY) + minY;

  return {
    x,
    y,
    size,
    sides,
    angle: Math.random() * Math.PI * 2,
    alive: true,

    vx: ENEMY_SPEED_X,
    vy: 0,

    state: "moving", // moving | climbing
    targetObsIndex: -1,

    spin: (Math.random() * 0.08 + 0.02) * (Math.random() < 0.5 ? -1 : 1),
  };
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function circleIntersectsRect(cx, cy, r, rx, ry, rw, rh) {
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < r * r;
}

function circleVsAabbMTV(cx, cy, r, rx, ry, rw, rh) {
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);

  const dx = cx - closestX;
  const dy = cy - closestY;
  const dist2 = dx * dx + dy * dy;

  if (dist2 >= r * r) return { hit: false, nx: 0, ny: 0, depth: 0 };

  const dist = Math.sqrt(dist2);
  if (dist === 0) {
    const left = Math.abs(cx - rx);
    const right = Math.abs(rx + rw - cx);
    const top = Math.abs(cy - ry);
    const bottom = Math.abs(ry + rh - cy);
    const m = Math.min(left, right, top, bottom);

    if (m === left) return { hit: true, nx: -1, ny: 0, depth: r };
    if (m === right) return { hit: true, nx: 1, ny: 0, depth: r };
    if (m === top) return { hit: true, nx: 0, ny: -1, depth: r };
    return { hit: true, nx: 0, ny: 1, depth: r };
  }

  return { hit: true, nx: dx / dist, ny: dy / dist, depth: r - dist };
}

function resolveCollisions(enemy, canvasHeight, floorHeight) {
  for (let iter = 0; iter < 3; iter++) {
    let any = false;

    for (const obs of obstacles) {
      if (obs.top > 0) {
        const mtv = circleVsAabbMTV(enemy.x, enemy.y, enemy.size, obs.x, 0, obs.width, obs.top);
        if (mtv.hit) {
          enemy.x += mtv.nx * mtv.depth;
          enemy.y += mtv.ny * mtv.depth;
          any = true;
        }
      }

      if (obs.bottom > 0) {
        const ry = canvasHeight - floorHeight - obs.bottom;
        const mtv = circleVsAabbMTV(enemy.x, enemy.y, enemy.size, obs.x, ry, obs.width, obs.bottom);
        if (mtv.hit) {
          enemy.x += mtv.nx * mtv.depth;
          enemy.y += mtv.ny * mtv.depth;
          any = true;
        }
      }
    }

    if (!any) break;
  }
}

function isCollidingWithObstacle(enemy, obs, canvasHeight, floorHeight) {
  if (obs.top > 0) {
    if (circleIntersectsRect(enemy.x, enemy.y, enemy.size, obs.x, 0, obs.width, obs.top)) return true;
  }
  if (obs.bottom > 0) {
    const ry = canvasHeight - floorHeight - obs.bottom;
    if (circleIntersectsRect(enemy.x, enemy.y, enemy.size, obs.x, ry, obs.width, obs.bottom)) return true;
  }
  return false;
}

function findSideObstacle(enemy, canvasHeight, floorHeight) {
  let best = null;

  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];

    const nearLeftEdge = enemy.x + enemy.size >= obs.x - SIDE_SNAP;
    const beforeRightEdge = enemy.x - enemy.size <= obs.x + obs.width;
    if (!nearLeftEdge || !beforeRightEdge) continue;

    const gapTop = obs.top > 0 ? obs.top : 0;
    const gapBottom = obs.bottom > 0 ? canvasHeight - floorHeight - obs.bottom : canvasHeight - floorHeight;

    const inGap =
      enemy.y - enemy.size >= gapTop && enemy.y + enemy.size <= gapBottom;

    if (inGap) continue;

    const dx = Math.abs((enemy.x + enemy.size) - obs.x);
    if (!best || dx < best.dx) best = { i, dx };
  }

  return best ? best.i : -1;
}

function computeGapTargetY(enemy, obs, canvasHeight, floorHeight) {
  const gapTop = obs.top > 0 ? obs.top : 0;
  const gapBottom = obs.bottom > 0 ? canvasHeight - floorHeight - obs.bottom : canvasHeight - floorHeight;

  const minY = gapTop + enemy.size;
  const maxY = gapBottom - enemy.size;

  if (minY > maxY) return null;

  if (enemy.y >= minY && enemy.y <= maxY) return enemy.y;

  return enemy.y < minY ? minY : maxY;
}

export function generateEnemies(w, h, floorHeight) {
  enemyManager.generateEntity(w, h, floorHeight, createEnemy);
}

export function moveEnemies(isColliding, canvasWidth, canvasHeight, floorHeight) {
  if (isColliding) return;

  enemyManager.entities.forEach(enemy => {
    if (!enemy.alive) return;

    if (enemy.state === "moving") {
      enemy.vx = ENEMY_SPEED_X;
      enemy.vy = 0;
    }

    if (enemy.state === "climbing") {
      enemy.vx = 0;

      const obs = obstacles[enemy.targetObsIndex];
      if (!obs) {
        enemy.state = "moving";
      } else {
        const targetY = computeGapTargetY(enemy, obs, canvasHeight, floorHeight);

        if (targetY == null) {
          enemy.vy = 0;
        } else {
          const dy = targetY - enemy.y;
          if (Math.abs(dy) < 0.8) {
            enemy.y = targetY;
            enemy.vy = 0;
          } else {
            enemy.vy = Math.sign(dy) * CLIMB_SPEED;
          }
        }
      }
    }

    enemy.x += enemy.vx;
    enemy.y += enemy.vy;

    if (enemy.y - enemy.size < 0) enemy.y = enemy.size;
    if (enemy.y + enemy.size > canvasHeight - floorHeight) {
      enemy.y = canvasHeight - floorHeight - enemy.size;
    }

    resolveCollisions(enemy, canvasHeight, floorHeight);

    if (enemy.state === "moving") {
      const sideIdx = findSideObstacle(enemy, canvasHeight, floorHeight);
      if (sideIdx !== -1) {
        enemy.state = "climbing";
        enemy.targetObsIndex = sideIdx;
      }
    } else if (enemy.state === "climbing") {
      const obs = obstacles[enemy.targetObsIndex];
      if (!obs) {
        enemy.state = "moving";
        enemy.targetObsIndex = -1;
      } else {
        if (!isCollidingWithObstacle(enemy, obs, canvasHeight, floorHeight)) {
          enemy.state = "moving";
          enemy.targetObsIndex = -1;
        }
      }
    }

    enemy.angle += enemy.spin;
  });
}

export function removeOffscreenEnemies() {
  enemyManager.removeOffscreenEntities();
}

export function drawEnemies() {
  enemyManager.drawEntities(enemy => {
    drawPolygon(enemy.x, enemy.y, enemy.size, enemy.sides, "#ff5252", enemy.angle);
  });
}

export function checkEnemyCollision(player) {
  enemyManager.entities.forEach(enemy => {
    if (!enemy.alive) return;

    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < enemy.size + player.radius) {
      spawnEnemyExplosion(enemy); 
      enemy.alive = false;
      score += enemy.sides;
    }
  });

  enemyManager.entities = enemyManager.entities.filter(e => e.alive);
}