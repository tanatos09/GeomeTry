import { drawPolygon } from "./render.js";
import { config } from "./config.js";

const particles = [];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export function spawnEnemyExplosion(enemy) {
  const count = Math.max(8, enemy.sides * 3);

  for (let i = 0; i < count; i++) {
    const size = rand(2.5, Math.max(4, enemy.size * 0.25));
    const sides = Math.floor(rand(3, 6)); // 3-5 stran
    const angle = rand(0, Math.PI * 2);

    const a = rand(0, Math.PI * 2);
    const speed = rand(2, 7);

    particles.push({
      x: enemy.x,
      y: enemy.y,
      vx: Math.cos(a) * speed + rand(-0.5, 0.5),
      vy: Math.sin(a) * speed + rand(-0.5, 0.5),

      size,
      sides,
      angle,
      va: rand(-0.25, 0.25),

      life: rand(25, 45),
      color: "#ff5252",
    });
  }
}

export function updateEnemyEffects(canvasHeight, floorHeight, isColliding) {
  if (isColliding) return;

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.vy += config.gravity * 0.35;
    p.x += p.vx;
    p.y += p.vy;
    p.angle += p.va;

    const groundY = canvasHeight - floorHeight;
    if (p.y + p.size > groundY) {
      p.y = groundY - p.size;
      p.vy *= -0.35;
      p.vx *= 0.8;
    }

    p.life -= 1;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

export function drawEnemyEffects() {
  for (const p of particles) {
    drawPolygon(p.x, p.y, p.size, p.sides, p.color, p.angle);
  }
}