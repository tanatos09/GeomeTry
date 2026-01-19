// ===================================================================
// ENEMYEFFECTS.JS - Efekty Rozdrcených Nepřátel
// ===================================================================
// Účel: Vytváření a správa částic exploze při smrti nepřítele
//
// Systém:
// - Když nepřítel zemře (checkEnemyCollision), spustí se spawnEnemyExplosion
// - Vytvoří se N částic (8 + 3*sides), které se rozlétnou všemi směry
// - Každá částice má fyziku (gravitace, tření, odraz od půdy)
// - Částice postupně ztrácí "život" a zmizí po ~25-45 framech
// 
// Vizuální efekt: Červené/oranžové geometrické tvary létající ven z místa smrti
// ===================================================================

// IMPORTY
import { drawPolygon } from "./render.js";  // Funkce na kreslení polygonů
import { config } from "./config.js";       // Nastavení (gravity = 0.6)

// ===================================================================
// STAV - Správa Částic
// ===================================================================

// Pole všech aktivních částic exploze na obrazovce
// Každá částice má: pozici (x,y), rychlost (vx,vy), vizuál (size, sides, angle)
// a životnost (life)
const particles = [];

// ===================================================================
// HELPER FUNKCE
// ===================================================================

// Vygeneruj náhodné číslo v rozsahu [min, max)
// Používáno pro variaci všech vlastností částic (neměly by být identické)
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// ===================================================================
// GENEROVÁNÍ EXPLOZE - HLAVNÍ FUNKCE
// ===================================================================

// Vytvoř explozi částic při smrti nepřítele
// enemy: objekt nepřítele obsahující x, y, sides, size, a další
//
// Mechanika:
// 1. Vypočítej počet částic: minimum 8, plus 3 na každou stranu nepřítele
//    - Větší nepřítel (8 stran) = 32 částic (8 + 3*8)
//    - Menší nepřítel (3 strany) = 17 částic (8 + 3*3)
//
// 2. Pro každou částici:
//    - Velikost: 2.5-4 pixely (nebo 25% velikosti nepřítele)
//    - Počet stran: 3-5 stran (3D efekt)
//    - Rotační úhel: náhodný (0 až 2π)
//    - Směr: náhodný (0 až 2π radiánů)
//    - Rychlost: 2-7 pixelů za frame (různá pro každou částici)
//    - Rotační rychlost: -0.25 až 0.25 rad/frame (otáčení částice)
//    - Životnost: 25-45 framů (částice se kreslí až pak zmizí)
//    - Barva: Červená (oranžová pro různost)
//
// 3. Další variace:
//    - Malá náhodná výchylka v rychlostech (-0.5 až 0.5) pro více chaotickou explozi
//
export function spawnEnemyExplosion(enemy) {
  // Počet částic je závislý na počtu stran nepřítele
  // Minimálně 8 částic i pro malé nepřátele
  const count = Math.max(8, enemy.sides * 3);

  // Vytvoř každou částici s náhodnými vlastnostmi
  for (let i = 0; i < count; i++) {
    // Velikost částice: 2.5-4 pixely, nebo do 25% velikosti původního nepřítele
    // Maxima zajistí, že velcí nepřátelé mají větší částice
    const size = rand(2.5, Math.max(4, enemy.size * 0.25));
    
    // Počet stran tvaru: 3-5 (trojúhelník až pětiúhelník)
    // Dává explozi více vizuální variety
    const sides = Math.floor(rand(3, 6));
    
    // Počáteční rotační úhel v radiánech (0 až 2π)
    const angle = rand(0, Math.PI * 2);

    // FYZIKA EXPLOZE
    // Vypočítej náhodný směr (a = úhel v radiánech od 0 do 2π)
    const a = rand(0, Math.PI * 2);
    
    // Vypočítej náhodnou rychlost (2-7 pixelů za frame)
    const speed = rand(2, 7);

    // Přidej novou částici do seznamu aktivních částic
    particles.push({
      // POZICE - Explozi vychází z místa smrti nepřítele
      x: enemy.x,
      y: enemy.y,
      
      // RYCHLOST - Rozlétání ve všech směrech
      // cos(a) * speed = horizontální komponenta
      // sin(a) * speed = vertikální komponenta
      // Přidej malou náhodnou výchylku (-0.5 až 0.5) pro chaos
      vx: Math.cos(a) * speed + rand(-0.5, 0.5),
      vy: Math.sin(a) * speed + rand(-0.5, 0.5),

      // VIZUÁL - Jak částice vypadá
      size,        // Velikost polygonu
      sides,       // Počet stran (3-5)
      angle,       // Počáteční rotace
      
      // ANIMACE - Částice se otáčí
      // Náhodná rotační rychlost (-0.25 až 0.25 rad/frame)
      va: rand(-0.25, 0.25),

      // ŽIVOTNOST - Jak dlouho částice žije
      // 25-45 framů, pak se smaže
      // (~0.4-0.75 sekund při 60 FPS)
      life: rand(25, 45),
      
      // BARVA - Červená/oranžová exploze
      // #ff5252 = jasná červená pro viditelnost
      color: "#ff5252",
    });
  }
}

// ===================================================================
// AKTUALIZACE EFEKTŮ - FYZIKA ČÁSTIC
// ===================================================================

// Aktualizuj všechny aktivní částice exploze
// canvasHeight: výška herního okna (pro detekci podlahy)
// floorHeight: výška podlahy (aby se částice nepropadly)
//
// Co se děje:
// 1. Aplikuj gravitaci (částice padají dolů)
// 2. Posunuj částice jejich rychlostí
// 3. Otáčej částice jejich rotační rychlostí
// 4. Detekuj kolizi s podlahou a odraz
// 5. Smaž částice které ztratily všechny životy
//
export function updateEnemyEffects(canvasHeight, floorHeight) {
  // Iteruj smyčku POZADU (od posledního k prvnímu)
  // Důvod: Když smazeme částici (splice), indexy se posunují
  // Iterace pozadu zajišťuje, že smazání neovlivní zbývající iterace
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    // ===================================================================
    // FYZIKA
    // ===================================================================

    // GRAVITACE - Přitahuj částici dolů (gravitační zrychlení)
    // config.gravity = 0.6, ale zde jen 35% z toho (0.6 * 0.35 = 0.21)
    // Částice padají pomaleji než běžné objekty (efekt rozpadu)
    p.vy += config.gravity * 0.35;
    
    // POHYB - Posunuj částici její aktuální rychlostí
    p.x += p.vx;
    p.y += p.vy;
    
    // ROTACE - Otáčej částici (animace točení)
    p.angle += p.va;

    // ===================================================================
    // KOLIZE S PODLAHOU - ODRAZ
    // ===================================================================

    // Vypočítej Y pozici podlahy
    // Podlaha je 60 pixelů od spodku (floorHeight = 60)
    const groundY = canvasHeight - floorHeight;
    
    // Pokud částice spadla pod podlahu (y + size > groundY)
    // Poznámka: Přidáváme size abychom "drželi" částici nad podlahou
    if (p.y + p.size > groundY) {
      // Nastav Y na přesnou hodnotu podlahy (aby se nepropadla)
      p.y = groundY - p.size;
      
      // ODRAZ - Část energie se ztratí (tření)
      // Rychlost se otočí (- znamená opačný směr)
      // Vynásobena 0.35 = zbyde jen 35% energie
      // Zbytek se ztratí jako zvuk, teplo, deformace (neelastický odraz)
      p.vy *= -0.35;
      
      // TŘENÍ - Horizontální zpomalení při nárazu
      // vx se vynásobí 0.8 = zbyde 80% horizontální rychlosti
      // Částice se tedy "klouží" po podlaze se zpomalením
      p.vx *= 0.8;
    }

    // ===================================================================
    // ŽIVOTNOST - SMAZÁNÍ MRTVÝCH ČÁSTIC
    // ===================================================================

    // Uberi 1 bod životnosti (každý frame)
    p.life -= 1;
    
    // Pokud je částice "mrtvá" (life <= 0)
    if (p.life <= 0) {
      // Smaž ji z pole částic
      // splice(i, 1) = odstraní 1 prvek na pozici i
      particles.splice(i, 1);
    }
  }
}

// ===================================================================
// KRESLENÍ EFEKTŮ
// ===================================================================

// Nakresli všechny aktivní částice exploze
// Jednoduše iteruj všechny částice a zavolej drawPolygon
export function drawEnemyEffects() {
  // Projdi všechny aktivní částice
  for (const p of particles) {
    // Nakresli částici jako polygon
    // Parametry: pozice (x,y), velikost, počet stran, barva, rotace
    drawPolygon(p.x, p.y, p.size, p.sides, p.color, p.angle);
  }
}