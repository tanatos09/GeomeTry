// ===================================================================
// ANGLES.JS - Systém Sbíraných Úhlů (Letající Collectibles)
// ===================================================================
// Účel: Generování a správa sbíraných "úhlů" které padají ze nebe
//
// Úhly jsou:
// - Letající objekty které se pohybují zleva doprava
// - Sbírají se po dotyku s hráčem → XP bonusy
// - Rozbijí se když narazí na překážku → efekt rozbití
// - Mají vlnový pohyb a rotaci
// ===================================================================

import { drawAngleIcon } from './render.js';        // Kreslení ikony úhlu
import { obstacles } from './obstacles.js';        // Překážky (pro detekci kolizí)
import { config } from './config.js';              // Konfigurace (floorHeight)
import { spawnAngleBreak, spawnAngleCollect } from './angleEffects.js';  // Efekty

// Export správce úhlů
export const angleManager = {
  // ===================================================================
  // STAV
  // ===================================================================
  
  // Pole všech aktivních úhlů na obrazovce
  angles: [],
  
  // ===================================================================
  // KONFIGURACE
  // ===================================================================
  
  // Základní pravděpodobnost spawnu za jeden frame
  // Například 0.015 = 1.5% šance za frame (při 60 FPS = 1 úhel za ~40 framů)
  spawnRate: 0.015,
  
  // Dynamicky se měnící spawn chance (zvyšuje se s levelem)
  spawnChance: null,
  
  // Rychlost pohybu úhlů zleva doprava
  speed: 3,
  
  // Velikost ikony úhlu (pro kreslení a kolize)
  angleSize: 10,
  
  // ===================================================================
  // INICIALIZACE
  // ===================================================================
  
  // Inicializuje systém úhlů (při startu hry)
  init() {
    this.angles = [];              // Vynuluj pole úhlů
    this.spawnChance = this.spawnRate;  // Nastav spawn chance
  },
  
  // ===================================================================
  // GENEROVÁNÍ NOVÝCH ÚHLŮ
  // ===================================================================
  
  // Generuj nové úhly s určitou pravděpodobností
  // canvasWidth, canvasHeight: rozměry herního pole
  // floorHeight: výška podlahy (úhly se negenerují v ní)
  generate(canvasWidth, canvasHeight, floorHeight) {
    // Dynamické zvýšení spawn rate s velikostí canvasu (proxy pro level)
    // Čím větší canvas, tím více úhlů (obtížnější hra)
    const spawnChance = this.spawnRate + (Math.floor(canvasHeight / 100) * 0.002);
    
    // Generuj úhel s danou pravděpodobností?
    if (Math.random() < spawnChance) {
      // Vytvoř nový úhel objekt
      const angle = {
        // ===== POZICE =====
        x: canvasWidth + this.angleSize,  // Generuj mimo obrazovku (vpravo)
        y: Math.random() * (canvasHeight - floorHeight - this.angleSize * 2) + this.angleSize,  // Náhodné Y (ne v podlaze)
        
        // ===== RYCHLOST =====
        vx: -this.speed,                   // Pohyb doleva (negativní X)
        vy: (Math.random() - 0.5) * 0.8,   // Malý vertikální drift (náhodný)
        
        // ===== ROTACE =====
        rotation: Math.random() * Math.PI * 2,  // Náhodná počáteční rotace
        rotationSpeed: (Math.random() - 0.5) * 0.1,  // Náhodná rychlost rotace (-0.05 až +0.05)
        
        // ===== STAV =====
        alive: true  // Je úhel aktivní?
      };
      
      this.angles.push(angle);  // Přidej do pole
    }
  },
  
  // ===================================================================
  // AKTUALIZACE POHYBU
  // ===================================================================
  
  // Aktualizuj pozice a fyziku všech úhlů
  // isColliding: je hráč právě v kolizi s překážkou?
  // canvasHeight: výška canvasu (pro detekci mimo screen)
  update(isColliding, canvasHeight) {
    this.angles.forEach(angle => {
      if (!angle.alive) return;  // Přeskoč mrtvé úhly
      
      // ===== CHOVÁNÍ BĚHEM KOLIZE HRÁČE =====
      if (isColliding) {
        // Když hráč narazí, úhly se zpomalují a pohybují doprava
        angle.vx = this.speed * 0.15;  // 15% normální rychlosti, ale opačný směr
        angle.vy = 0;                  // Zastaví vertikální drift
      } else {
        // Normální chování - vx zůstává z inicializace (-this.speed)
        // vy se bude měnit níže (vlnový pohyb)
      }
      
      // ===== APLIKACE RYCHLOSTÍ =====
      angle.x += angle.vx;
      angle.y += angle.vy;
      
      // ===== ROTACE =====
      // Úhel se otáčí na základě své rotaceSpeed
      angle.rotation += angle.rotationSpeed;
      
      // ===== VLNOVÝ POHYB =====
      // Jemný vlnový efekt (sinusovka) - jen když hráč není v kolizi
      if (!isColliding) {
        // Přidej vertikální drift na základě rotace
        // sin() vytváří vlnový pohyb (-1 až 1)
        angle.vy += Math.sin(angle.rotation) * 0.08;
        
        // Tlumení - aby se úhel nezačal pohybovat moc rychle nahoru/dolů
        if (Math.abs(angle.vy) > 2.5) {
          angle.vy *= 0.92;  // Zpomal o 8%
        }
      }
      
      // ===== DETEKCE KOLIZÍ S PŘEKÁŽKAMI =====
      // Zjistí jestli úhel narazil do překážky
      this.checkObstacleCollision(angle, canvasHeight);
    });
  },
  
  // ===================================================================
  // DETEKCE KOLIZÍ S PŘEKÁŽKAMI
  // ===================================================================
  
  // Zkontroluj jestli úhel koliduje s nějakou překážkou
  checkObstacleCollision(angle, canvasHeight) {
    // Projdi všechny překážky
    for (const obs of obstacles) {
      // ===== HORNÍ PŘEKÁŽKA =====
      if (obs.top > 0) {
        if (this.circleIntersectsRect(
          angle.x, angle.y, this.angleSize,
          obs.x, 0, obs.width, obs.top
        )) {
          // Úhel narazil - rozbij ho
          this.resolveCollision(angle, obs.x, obs.top, obs.width, true, canvasHeight);
        }
      }
      
      // ===== SPODNÍ PŘEKÁŽKA =====
      if (obs.bottom > 0) {
        const bottomY = canvasHeight - config.floorHeight - obs.bottom;
        if (this.circleIntersectsRect(
          angle.x, angle.y, this.angleSize,
          obs.x, bottomY, obs.width, obs.bottom
        )) {
          // Úhel narazil - rozbij ho
          this.resolveCollision(angle, obs.x, bottomY, obs.width, false, canvasHeight);
        }
      }
    }
  },
  
  // Pomocná funkce: Zjistí jestli kruh (úhel) protíná obdélník (překážka)
  // cx, cy, r: střed a poloměr kruhu
  // rx, ry, rw, rh: pozice a rozměry obdélníku
  circleIntersectsRect(cx, cy, r, rx, ry, rw, rh) {
    // Najdi nejblížší bod na obdélníku
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    
    // Vypočítej vzdálenost
    const dx = cx - closestX;
    const dy = cy - closestY;
    
    // Protínají se? (vzdálenost < poloměr?)
    return dx * dx + dy * dy < r * r;
  },
  
  // ===================================================================
  // ŘEŠENÍ KOLIZE S PŘEKÁŽKOU - ROZBITÍ
  // ===================================================================
  
  // Řeší kolizi úhlu s překážkou - úhel se rozbije
  // angle: úhel objektu
  // obsX, obsY, obsWidth: pozice překážky
  // isTopObstacle: jestli je to horní nebo spodní překážka
  // canvasHeight: výška canvasu
  resolveCollision(angle, obsX, obsY, obsWidth, isTopObstacle, canvasHeight) {
    // Vytvoř efekt rozpadu - malé částice padající dolů
    spawnAngleBreak(angle);
    
    // Označ úhel jako mrtvý (bude vymažen z pole)
    angle.alive = false;
  },
  
  // ===================================================================
  // ÚDRŽBA - SMAZÁNÍ MIMO OBRAZOVKU
  // ===================================================================
  
  // Smaž úhly které opustily obrazovku (vlevo)
  removeOffscreen() {
    this.angles = this.angles.filter(angle => angle.x > -20);  // Keep pokud x > -20
  },
  
  // ===================================================================
  // KRESLENÍ
  // ===================================================================
  
  // Nakresli všechny aktivní úhly na obrazovku
  draw() {
    this.angles.forEach(angle => {
      if (angle.alive) {
        // Nakresli ikonu úhlu (oranžové "<" s gleam efektem)
        drawAngleIcon(angle.x, angle.y, this.angleSize, angle.rotation);
      }
    });
  },
  
  // ===================================================================
  // DETEKCE KOLIZE S HRÁČEM - SBĚR
  // ===================================================================
  
  // Zkontroluj jestli hráč sbírá nějaké úhly
  // Vrátí pole sbíraných úhlů (pro leveling bonusy)
  checkCollision(player) {
    const collectedAngles = [];  // Pole sbíraných úhlů
    
    // Projdi všechny úhly
    this.angles.forEach(angle => {
      if (!angle.alive) return;  // Přeskoč mrtvé
      
      // Vypočítej vzdálenost mezi hráčem a úhlem
      const dx = angle.x - player.x;
      const dy = angle.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Má dost blízko? (player.radius + angleSize + malý bonus)
      const collideDistance = player.radius + this.angleSize + 10;
      
      if (dist < collideDistance) {
        // ===== SBÍRÁNÍ =====
        
        // Vytvoř efekt sběru - malé částice letící do hráče
        spawnAngleCollect(angle, player.x, player.y);
        
        // Označ úhel jako sbíraný
        angle.alive = false;
        
        // Přidej do pole sbíraných
        collectedAngles.push(angle);
      }
    });
    
    // Smaž všechny mrtvé úhly z pole
    this.angles = this.angles.filter(a => a.alive);
    
    // Vrátí pole sbíraných úhlů
    return collectedAngles;
  },
  
  // ===================================================================
  // STATISTIKY (LEGACY - NEPOUŽÍVÁ SE V HLAVNÍ HŘE)
  // ===================================================================
  
  // Vrátí počet mrtvých (sbíraných) úhlů
  getTotalCollected() {
    return this.angles.filter(a => !a.alive).length;
  }
};
