// ===================================================================
// ENEMIES.JS - Systém Nepřátel a jejich AI
// ===================================================================
// Účel: Generování, AI, kreslení a detekce kolizí s nepřáteli
//
// Nepřátelé:
// - Mají náhodný počet stran (3-8)
// - Pohybují se zleva doprava
// - Zjišťují překážky a obcházejí je (lezení nahoru/dolů)
// - Jsou zabití kolizí s hráčem (výbuch + XP)
// ===================================================================

import { EntityManager } from "./entityManager.js";  // Správce entit (pool)
import { drawPolygon, ctx } from "./render.js";      // Kreslení polygonů
import { obstacles } from "./obstacles.js";          // Překážky (pro AI)
import { spawnEnemyExplosion } from "./enemyEffects.js";  // Efekty smrti
import { levelSystem } from "./leveling.js";         // XP systém

// Celkový skóre (počet stran všech zabítých nepřátel)
export let score = 0;

// Správce nepřátel - spravuje pool entit
// (3 = kolik nepřátel se generuje najednou, 120 = interval v fraimech)
const enemyManager = new EntityManager(3, 120);

// ===================================================================
// KONFIGURACE NEPŘÁTEL
// ===================================================================

// Rychlost pohybu nepřítele zleva doprava (negativní = doleva)
const ENEMY_SPEED_X = -2;

// Rychlost lezení nepřítele nahoru/dolů když se vyhýbá překážce
const CLIMB_SPEED = 1.4;

// Jak blízko musí být nepřítel k překážce aby ji "viděl" (pro AI)
const SIDE_SNAP = 6;

// ===================================================================
// TVORBA NEPŘÍTELE - STRUKTURA A INICIALIZACE
// ===================================================================

// Vytvoří jednoho nepřítele s náhodnými vlastnostmi
// canvasWidth, canvasHeight: velikost herního pole
// floorHeight: výška podlahy (nepřítel se negeneruje v ní)
function createEnemy(canvasWidth, canvasHeight, floorHeight) {
  // Náhodný počet stran: 3-8 (trojúhelník až osmiúhelník)
  const sides = Math.floor(Math.random() * 5) + 3;
  
  // Náhodná velikost: 10-25 pixelů
  const size = Math.random() * 15 + 10;

  // Generuj v levém horním rohu (mimo obrazovku, zleva přichází)
  const x = canvasWidth + size + 5;

  // Náhodné Y (ale ne v podlaze)
  const minY = size;
  const maxY = canvasHeight - floorHeight - size;
  const y = Math.random() * (maxY - minY) + minY;

  // Vrátí kompletní objekt nepřítele
  return {
    // ===== POZICE A VELIKOST =====
    x,                      // X pozice
    y,                      // Y pozice
    size,                   // Poloměr (pro kreslení a kolize)
    sides,                  // Počet stran polygonu
    
    // ===== ROTACE =====
    angle: Math.random() * Math.PI * 2,  // Náhodná počáteční rotace
    
    // ===== STAV =====
    alive: true,            // Je nepřítel živý?
    
    // ===== FYZIKA =====
    vx: ENEMY_SPEED_X,      // Rychlost X (pohyb doleva)
    vy: 0,                  // Rychlost Y (lezení nahoru/dolů)
    
    // ===== AI STATE MACHINE =====
    state: "moving",        // Stav: "moving" (normální pohyb) nebo "climbing" (lezení)
    targetObsIndex: -1,     // Index překážky kterou se snaží obejít
    
    // ===== ANIMACE =====
    // Náhodná rychlost rotace - někdy kladná, někdy záporná
    rotationSpeed: (Math.random() * 0.06 + 0.04) * (Math.random() < 0.5 ? -1 : 1)
  };
}

// ===================================================================
// POMOCNÉ MATEMATICKÉ FUNKCE
// ===================================================================

// Omezí hodnotu mezi min a max
// Příklady: clamp(5, 0, 10) = 5, clamp(-5, 0, 10) = 0, clamp(15, 0, 10) = 10
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Zjistí jestli kruh (nepřítel) protíná obdélník (překážka)
// cx, cy, r: střed a poloměr kruhu
// rx, ry, rw, rh: pozice a rozměry obdélníku
function circleIntersectsRect(cx, cy, r, rx, ry, rw, rh) {
  // Najdi nejblížší bod na obdélníku k středu kruhu
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);
  
  // Vypočítej vzdálenost
  const dx = cx - closestX;
  const dy = cy - closestY;
  
  // Protínají se? (vzdálenost < poloměr?)
  return dx * dx + dy * dy < r * r;
}

// MTV = Minimum Translation Vector
// Vrátí jak daleko a kterým směrem musíš posunout kruh aby nepřekrýval obdélník
// Vrací: { hit: boolean, nx, ny (směr), depth (hloubka průniku) }
function circleVsAabbMTV(cx, cy, r, rx, ry, rw, rh) {
  // Najdi nejblížší bod na obdélníku
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);

  // Vzdálenost
  const dx = cx - closestX;
  const dy = cy - closestY;
  const dist2 = dx * dx + dy * dy;

  // Žádná kolize?
  if (dist2 >= r * r) return { hit: false, nx: 0, ny: 0, depth: 0 };

  // Vypočítej vzdálenost
  const dist = Math.sqrt(dist2);
  
  // Speciální případ: centrum kruhu je přesně na zdi
  if (dist === 0) {
    // Zjistí ze kterého směru je nejblíž (left, right, top, bottom)
    const left = Math.abs(cx - rx);
    const right = Math.abs(rx + rw - cx);
    const top = Math.abs(cy - ry);
    const bottom = Math.abs(ry + rh - cy);
    const m = Math.min(left, right, top, bottom);

    // Vrátí normální vektor do správného směru
    if (m === left) return { hit: true, nx: -1, ny: 0, depth: r };
    if (m === right) return { hit: true, nx: 1, ny: 0, depth: r };
    if (m === top) return { hit: true, nx: 0, ny: -1, depth: r };
    return { hit: true, nx: 0, ny: 1, depth: r };
  }

  // Normální případ: vrátí normální vektor a hloubku
  return { hit: true, nx: dx / dist, ny: dy / dist, depth: r - dist };
}


// ===================================================================
// AI NEPŘÁTEL - ŘEŠENÍ KOLIZÍ A POHYB
// ===================================================================

// Řeší kolize nepřítele s překážkami
// Když nepřítel narazí na překážku, posune se pryč (iterativní náprava)
// canvasHeight, floorHeight: rozměry herního pole
function resolveCollisions(enemy, canvasHeight, floorHeight) {
  // Opakuj řešení kolizí až 3x (aby se nepřítel dostal z "hluboké" kolize)
  for (let iter = 0; iter < 3; iter++) {
    let any = false;  // Proběhla nějaká kolize?

    // Projdi všechny překážky
    for (const obs of obstacles) {
      // ===== HORNÍ PŘEKÁŽKA =====
      if (obs.top > 0) {
        // Zjistí MTV (jak daleko posunout nepřítele)
        const mtv = circleVsAabbMTV(enemy.x, enemy.y, enemy.size, obs.x, 0, obs.width, obs.top);
        
        if (mtv.hit) {
          // Posunu nepřítele pryč z překážky (v normální směru MTV)
          enemy.x += mtv.nx * mtv.depth;
          enemy.y += mtv.ny * mtv.depth;
          any = true;  // Byla kolize
        }
      }

      // ===== SPODNÍ PŘEKÁŽKA =====
      if (obs.bottom > 0) {
        // Spodní překážka je od vrchu podlahy (musíme spočítat Y pozici)
        const ry = canvasHeight - floorHeight - obs.bottom;
        const mtv = circleVsAabbMTV(enemy.x, enemy.y, enemy.size, obs.x, ry, obs.width, obs.bottom);
        
        if (mtv.hit) {
          // Posunu nepřítele pryč z překážky
          enemy.x += mtv.nx * mtv.depth;
          enemy.y += mtv.ny * mtv.depth;
          any = true;
        }
      }
    }

    // Pokud v tomto iteraci nebyla žádná kolize, konči (nepřítel je již opravený)
    if (!any) break;
  }
}

// Zjistí jestli nepřítel koliduje s určitou překážkou
// Používá se k detekci kdy skončit lezení překážky
function isCollidingWithObstacle(enemy, obs, canvasHeight, floorHeight) {
  // Kontrola horní překážky
  if (obs.top > 0) {
    if (circleIntersectsRect(enemy.x, enemy.y, enemy.size, obs.x, 0, obs.width, obs.top)) 
      return true;
  }
  
  // Kontrola spodní překážky
  if (obs.bottom > 0) {
    const ry = canvasHeight - floorHeight - obs.bottom;
    if (circleIntersectsRect(enemy.x, enemy.y, enemy.size, obs.x, ry, obs.width, obs.bottom)) 
      return true;
  }
  
  return false;
}

// ===================================================================
// AI - DETEKCE PŘEKÁŽEK A LEZENÍ
// ===================================================================

// Najde překážku kterou vidí nepřítel (je vlevo od něj)
// Vrací index překážky v obstacles poli, nebo -1 pokud žádná není
function findSideObstacle(enemy, canvasHeight, floorHeight) {
  let best = null;  // Nejlepší (nejbližší) překážka

  // Projdi všechny překážky
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];

    // Zjistí jestli je překážka přibližně před nepřítelem (v X ose)
    // "nearLeftEdge" = pravý okraj nepřítele je blízko levého okraje překážky?
    // "beforeRightEdge" = nepřítel ještě nedorazil na pravý okraj?
    const nearLeftEdge = enemy.x + enemy.size >= obs.x - SIDE_SNAP;
    const beforeRightEdge = enemy.x - enemy.size <= obs.x + obs.width;
    
    if (!nearLeftEdge || !beforeRightEdge) continue;  // Překážka není v dosahu X

    // Vypočítej mezimistr (gap) - kde je prostor mezi překážkami?
    const gapTop = obs.top > 0 ? obs.top : 0;
    const gapBottom = obs.bottom > 0 ? canvasHeight - floorHeight - obs.bottom : canvasHeight - floorHeight;

    // Jestli je nepřítel už v mezimiřu (bez nutnosti lézt), přeskoč tuto překážku
    const inGap = enemy.y - enemy.size >= gapTop && enemy.y + enemy.size <= gapBottom;
    if (inGap) continue;

    // Vyhodnoť jak blízko je překážka (vzdálenost v X ose)
    const dx = Math.abs((enemy.x + enemy.size) - obs.x);
    
    // Ulož jako nejlepší pokud je nejblíž
    if (!best || dx < best.dx) best = { i, dx };
  }

  return best ? best.i : -1;  // Vrátí index nejbližší překážky, nebo -1
}

// Vypočítá target Y pozici aby nepřítel prošel mezimiřem (mezerou mezi překážkami)
// enemy: nepřítel
// obs: překážka
// Vrátí Y pozici kterou by měl nepřítel dosáhnout, nebo null pokud není prostor
function computeGapTargetY(enemy, obs, canvasHeight, floorHeight) {
  // Vypočítej top a bottom mezimiřu
  const gapTop = obs.top > 0 ? obs.top : 0;
  const gapBottom = obs.bottom > 0 ? canvasHeight - floorHeight - obs.bottom : canvasHeight - floorHeight;

  // Vypočítej min a max Y aby nepřítel byl v mezimiřu (bez sjetí s hranou)
  const minY = gapTop + enemy.size;
  const maxY = gapBottom - enemy.size;

  // Není prostor pro nepřítele? (překážka je příliš úzká)
  if (minY > maxY) return null;

  // Pokud je nepřítel už v mezimiřu, udržuj jeho Y
  if (enemy.y >= minY && enemy.y <= maxY) return enemy.y;

  // Pokud ne, vrátí nejblížší bod v mezimiřu
  return enemy.y < minY ? minY : maxY;
}

// ===================================================================
// VEŘEJNÉ FUNKCE - GENEROVÁNÍ, POHYB, KRESLENÍ
// ===================================================================

// Generuj nové nepřátele
// Volá se jednou za určitý čas z gameLoop()
export function generateEnemies(w, h, floorHeight) {
  enemyManager.generateEntity(w, h, floorHeight, createEnemy);
}

// Aktualizuj pohyb všech nepřátel
// isColliding: je hráč právě v kolizi s překážkou?
// Když je v kolizi, nepřátelé se zpomalují
export function moveEnemies(isColliding, canvasWidth, canvasHeight, floorHeight) {
  // Projdi všechny nepřátele
  enemyManager.entities.forEach(enemy => {
    if (!enemy.alive) return;  // Přeskoč mrtvé nepřátele

    // ===== CHOVÁNÍ BĚHEM KOLIZE HRÁČE =====
    // Když hráč narazí na překážku, nepřátelé se zpomalují
    if (isColliding) {
      // Pomalá rychlost doprava (opačný směr, 15% normální)
      const slowSpeed = -ENEMY_SPEED_X * 0.15;
      enemy.vx = slowSpeed;
      enemy.vy = 0;
    } else {
      // ===== NORMÁLNÍ CHOVÁNÍ - STATE MACHINE =====
      
      if (enemy.state === "moving") {
        // "Moving" stav: nepřítel se pohybuje doleva normální rychlostí
        enemy.vx = ENEMY_SPEED_X;
        enemy.vy = 0;
      }

      if (enemy.state === "climbing") {
        // "Climbing" stav: nepřítel leze nahoru/dolů aby prošel mezimiřem
        enemy.vx = 0;  // Přestane se pohybovat v X

        // Zjistí překážku kterou leze
        const obs = obstacles[enemy.targetObsIndex];
        
        if (!obs) {
          // Překážka byla smazána - vrať se k normálnímu pohybu
          enemy.state = "moving";
        } else {
          // Vypočítej target Y aby prošel mezimiřem
          const targetY = computeGapTargetY(enemy, obs, canvasHeight, floorHeight);

          if (targetY == null) {
            // Není prostor - zastavit se
            enemy.vy = 0;
          } else {
            // Pohybuj se k target Y
            const dy = targetY - enemy.y;
            
            if (Math.abs(dy) < 0.8) {
              // Dosáhl target Y - zastavit se
              enemy.y = targetY;
              enemy.vy = 0;
            } else {
              // Pohybuj se směrem k target Y
              enemy.vy = Math.sign(dy) * CLIMB_SPEED;
            }
          }
        }
      }
    }

    // ===== APLIKACE RYCHLOSTI =====
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;

    // ===== OMEZENÍ NA SCREEN =====
    // Nepřítel nemůže jít nad horní okraj
    if (enemy.y - enemy.size < 0) enemy.y = enemy.size;
    
    // Nepřítel nemůže jít pod podlahu
    if (enemy.y + enemy.size > canvasHeight - floorHeight) {
      enemy.y = canvasHeight - floorHeight - enemy.size;
    }

    // ===== ŘEŠENÍ KOLIZÍ S PŘEKÁŽKAMI =====
    resolveCollisions(enemy, canvasHeight, floorHeight);

    // ===== AI STATE TRANSITIONS (KDYž NEJSOU V KOLIZI HRÁČE) =====
    if (!isColliding) {
      if (enemy.state === "moving") {
        // Pokud je v "moving" stavu, zjistí jestli vidí překážku
        const sideIdx = findSideObstacle(enemy, canvasHeight, floorHeight);
        
        if (sideIdx !== -1) {
          // Našel překážku - začni lézt!
          enemy.state = "climbing";
          enemy.targetObsIndex = sideIdx;
        }
      } else if (enemy.state === "climbing") {
        // V "climbing" stavu - kontrola kdy přestat lézt
        const obs = obstacles[enemy.targetObsIndex];
        
        if (!obs) {
          // Překážka již neexistuje - zpátky k normálnímu pohybu
          enemy.state = "moving";
          enemy.targetObsIndex = -1;
        } else {
          // Zkontroluj jestli stále koliduje s překážkou
          if (!isCollidingWithObstacle(enemy, obs, canvasHeight, floorHeight)) {
            // Překážka již není na cestě - vrátit se k pohybu
            enemy.state = "moving";
            enemy.targetObsIndex = -1;
          }
        }
      }
    }

    // ===== ANIMACE ROTACE =====
    // Nepřítel se otáčí stále stejnou rychlostí
    enemy.angle += enemy.rotationSpeed;
  });
}

// Smaž nepřátele mimo obrazovku (vlevo)
export function removeOffscreenEnemies() {
  enemyManager.removeOffscreenEntities();
}

// ===================================================================
// KRESLENÍ NEPŘÁTEL
// ===================================================================

// Kreslí všechny nepřátele na canvas
export function drawEnemies() {
  // drawEntities provede callback pro každého nepřítele
  enemyManager.drawEntities(enemy => {
    // Kosmické barvy - různá paletavý pro různé nepřátele
    const colors = ["#ff6b9d", "#ff4757", "#ff7675", "#ff9ff3"];
    const color = colors[enemy.sides % colors.length];
    
    // Nakresli polygon nepřítele
    drawPolygon(enemy.x, enemy.y, enemy.size, enemy.sides, color, enemy.angle);
    
    // ===== GLOW EFEKT =====
    // Měkký shadow okolo nepřítele (atmosphere)
    ctx.save();
    ctx.globalAlpha = 0.3;            // Poloprůhlednost
    ctx.shadowColor = color;          // Barva shadows
    ctx.shadowBlur = 10;              // Rozmazání
    drawPolygon(enemy.x, enemy.y, enemy.size, enemy.sides, color, enemy.angle);
    ctx.restore();
  });
}

// ===================================================================
// DETEKCE KOLIZE S HRÁČEM
// ===================================================================

// Zkontroluj jestli nějaký nepřítel koliduje s hráčem
// Pokud ano, zabij nepřítele a dej XP
export function checkEnemyCollision(player) {
  // Projdi všechny nepřátele
  enemyManager.entities.forEach(enemy => {
    if (!enemy.alive) return;  // Přeskoč mrtvé

    // Vypočítej vzdálenost mezi hráčem a nepřítelem
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Kolidují? (vzdálenost < součet poloměrů?)
    if (dist < enemy.size + player.radius) {
      // ===== SMRT NEPŘÍTELE =====
      
      // Vytvoř efekt - výbuch částic
      spawnEnemyExplosion(enemy);
      
      // Nepřítel je mrtvý
      enemy.alive = false;
      
      // Přidej skóre (počet stran nepřítele)
      score += enemy.sides;
      
      // Přidej XP a úhly do levelovacího systému
      levelSystem.addXP(enemy.sides);
    }
  });

  // Odstraň všechny mrtvé nepřátele z pole
  enemyManager.entities = enemyManager.entities.filter(e => e.alive);
}