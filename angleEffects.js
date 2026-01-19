// ===================================================================
// ANGLEEFFECTS.JS - Efekty Sbírání a Rozpadu Úhlů
// ===================================================================
// Účel: Vytváření a správa vizuálních efektů pro úhly (sbírané objekty)
//
// Dva typy efektů:
// 1. BREAK (Rozpady): Když úhel narazí na překážku
//    - 4 částice rozletí se všemi směry
//    - Oranžové barvy (#ff9f43)
//    - Krátký život (25-40 framů)
//
// 2. COLLECT (Sbírání): Když hráč sebere úhel
//    - 3 částice přitahované k hráči
//    - Zlaté barvy (#ffd32a)
//    - Létají směrem k hráči (targetX, targetY)
//    - Zastavují se během kolize hráče
//
// Oba typy mají:
// - Fyziku (gravitace, odraz od podlahy)
// - Rotaci (točení částic)
// - Alpha fade (postupné zmizení)
// - Glow efekt (viditelnost)
// ===================================================================

// IMPORTY
import { ctx } from "./render.js";  // Canvas context pro kreslení (save, restore, globalAlpha)
import { config } from "./config.js";  // Nastavení (gravity = 0.6)

// ===================================================================
// STAV - Správa Všech Aktivních Částic Efektů
// ===================================================================

// Pole všech aktivních částic (jak "break" tak "collect" typu)
// Každá částice má: pozici (x,y), rychlost (vx,vy), vizuál (size, rotation),
// životnost (life), barvu, typ (break/collect)
const particles = [];

// ===================================================================
// HELPER FUNKCE
// ===================================================================

// Vygeneruj náhodné číslo v rozsahu [min, max)
// Používáno pro variaci všech vlastností částic
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// ===================================================================
// EFEKT 1: ROZPADY ÚHLŮ (BREAK)
// ===================================================================

// Vytvoř efekt rozpadu když úhel narazí na překážku
// angle: objekt úhlu obsahující x, y
//
// Mechanika:
// - 4 částice (výrazný efekt bez overkill)
// - Rozletují se všemi směry (náhodný úhel 0-2π)
// - Oranžová barva pro rozlišení od sbírání
// - Krátký život (25-40 framů = 0.4-0.67 sekund)
//
// Vizuál:
// - Každá částice je malý polygon (2.5-4.5 pixelu)
// - Otáčí se vlastní rotační rychlostí (-0.15 až 0.15 rad/frame)
// - Postupně mizí s exponenciálním zeslabením (opcitita^1.5)
//
export function spawnAngleBreak(angle) {
  // Počet částic pro rozpady (méně než sbírání, je to "ničení")
  const count = 4;
  
  // Vytvoř každou částici rozpadu
  for (let i = 0; i < count; i++) {
    // Velikost částice: 2.5-4.5 pixelu
    // Malé, aby to byla jen sbírka fragmentů
    const size = rand(2.5, 4.5);
    
    // Náhodný směr rozletu (0 až 2π radiánů = celý kruh)
    const a = rand(0, Math.PI * 2);
    
    // Náhodná rychlost (2-6 pixelů/frame)
    // Zvolto poměrně pomalé aby to bylo vidět
    const speed = rand(2, 6);
    
    // Přidej novou částici rozpadu
    particles.push({
      // POZICE - Vychází z místa nárazu úhlu
      x: angle.x,
      y: angle.y,
      
      // RYCHLOST - Rozletování všemi směry
      // cos(a) * speed = X komponenta
      // sin(a) * speed = Y komponenta
      // Přidej malou random výchylku (-0.5 až 0.5) pro chaos
      vx: Math.cos(a) * speed + rand(-0.5, 0.5),
      vy: Math.sin(a) * speed + rand(-0.5, 0.5),
      
      // VIZUÁL - Jak částice vypadá
      size,  // Velikost polygonu
      rotation: Math.random() * Math.PI * 2,  // Počáteční rotace (0-2π)
      rotationSpeed: rand(-0.15, 0.15),  // Jak rychle se otáčí
      
      // ŽIVOTNOST
      life: rand(25, 40),      // Aktuální život v framech
      maxLife: 30,              // Maximální život (pro výpočet opacity)
      
      // VIZUÁLNÍ EFEKTY
      color: "#ff9f43",         // Oranžová (rozpady)
      opacity: 1,               // Alfa kanál (1 = viditelná, 0 = neviditelná)
      
      // TYP - Poznámka pro update a draw funkce
      type: "break"
    });
  }
}

// ===================================================================
// EFEKT 2: SBÍRÁNÍ ÚHLŮ (COLLECT)
// ===================================================================

// Vytvoř efekt sbírání když hráč sebere úhel
// angle: objekt úhlu obsahující x, y
// playerX, playerY: pozice hráče (cíl pro přitahování)
//
// Mechanika:
// - 3 částice (lehčí efekt, více elegantní)
// - Letí směrem k hráči (přitahování s příslušností k cíli)
// - Zlatá barva pro signalizaci sběru
// - Středně dlouhý život (18-30 framů)
// - Zastavují se během hráčovy kolize (isColliding flag)
//
// Fyzika sbírání:
// 1. Vypočítej vektor k cíli (targetX/Y)
// 2. Normalizuj jej (vydělením vzdáleností)
// 3. Přidej k rychlosti (přitahování)
// 4. Zpomal rychlost (0.95 násobitel) aby to nebylo násilné
//
export function spawnAngleCollect(angle, playerX, playerY) {
  // Počet částic pro sbírání (méně než rozpady, ale více elegantní)
  const count = 3;
  
  // Vytvoř každou sbírací částici
  for (let i = 0; i < count; i++) {
    // Velikost částice: 2-3.5 pixelu
    // Lehce menší než rozpady (vizuální rozdíl)
    const size = rand(2, 3.5);
    
    // Počáteční náhodný směr (0 až 2π)
    // Později se přitahuje k hráči, ale ne hned
    const angle_rad = rand(0, Math.PI * 2);
    
    // Počáteční rychlost (1-3 pixelů/frame)
    // Pomalejší než rozpady, elegantněji
    const speed = rand(1, 3);
    
    // Přidej novou sbírací částici
    particles.push({
      // POZICE - Začína na úhlu
      x: angle.x,
      y: angle.y,
      
      // POČÁTEČNÍ RYCHLOST - Náhodný směr
      vx: Math.cos(angle_rad) * speed,
      vy: Math.sin(angle_rad) * speed,
      
      // VIZUÁL - Jak částice vypadá
      size,  // Velikost polygonu
      rotation: Math.random() * Math.PI * 2,  // Počáteční rotace
      rotationSpeed: rand(-0.25, 0.25),  // Otáčení (trochu rychlejší)
      
      // CÍLEM HRÁČE - Sbírající částice přilétají k hráči
      targetX: playerX,
      targetY: playerY,
      isCollecting: true,  // Příznak že to jde sbírací režim
      
      // ŽIVOTNOST
      life: rand(18, 30),      // Aktuální život
      maxLife: 25,              // Maximální život
      
      // VIZUÁLNÍ EFEKTY
      color: "#ffd32a",         // Zlatá (sbírání)
      opacity: 1,               // Alpha kanál (1 = viditelná)
      
      // TYP - Poznámka pro update a draw
      type: "collect"
    });
  }
}

// ===================================================================
// AKTUALIZACE EFEKTŮ - FYZIKA ČÁSTIC
// ===================================================================

// Aktualizuj všechny aktivní částice efektů
// canvasHeight: výška herního okna (pro detekci podlahy)
// floorHeight: výška podlahy (60 pixelů)
// isColliding: je-li hráč v kolizi s překážkou (zastavuje sbírání)
//
// Co se děje:
// 1. Aplikuj gravitaci (částice padají)
// 2. Pokud je COLLECT typ: Přitahuj k hráči (pokud není hráč v kolizi)
// 3. Posunuj částici její rychlostí
// 4. Otáčej částici
// 5. Detekuj odraz od podlahy
// 6. Zpomaluj opacitu (Alpha fade) na konci života
// 7. Smaž mrtvé částice
//
export function updateAngleEffects(canvasHeight, floorHeight, isColliding) {
  // Iteruj POZADU aby smazání neovlivnilo zbývající iterace
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    
    // ===================================================================
    // FYZIKA - GRAVITACE A POHYB
    // ===================================================================
    
    // GRAVITACE - Přitahuj dolů
    // config.gravity = 0.6, zde jen 30% (0.6 * 0.3 = 0.18)
    // Částice padají pomaleji než hráč (účinek rozpadu/evaporizace)
    p.vy += config.gravity * 0.3;
    
    // ===================================================================
    // SBÍRACÍ CHOVÁNÍ - PŘITAHOVÁNÍ K HRÁČI
    // ===================================================================
    
    // Pouze pokud je to sbírací částice (type: "collect")
    // a hráč NENÍ v kolizi (během kolize se hráč zastavuje, není čas sbírat)
    if (p.isCollecting && !isColliding) {
      // Vypočítej vektor od částice k hráči
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      
      // Vypočítej vzdálenost mezi částicí a hráčem
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Pokud je částice dál než 5 pixelů od hráče
      if (dist > 5) {
        // Pevná přitažlivost (0.2 pixelu/frame)
        // Vyšší hodnota = silnější přitahování
        const speed = 0.2;
        
        // Normalizuj vektor (dx/dist, dy/dist) = směr jednotkový
        // Vynásobením speed získáš zrychlení směrem k hráči
        p.vx += (dx / dist) * speed;
        p.vy += (dy / dist) * speed;
        
        // TLUMENÍ - Zpomal rychlost aby to nebylo příliš divoké
        // 0.95 = zbyde 95% předchozí rychlosti
        // Vytvářím "viskózní" efekt (částice je v lepku)
        p.vx *= 0.95;
        p.vy *= 0.95;
      } else {
        // Pokud je velmi blízko hráči (< 5 pixelů)
        // Pomalu se přibližuj (více zpomalení)
        p.vx *= 0.9;
        p.vy *= 0.9;
      }
    }
    
    // ===================================================================
    // POHYB A ROTACE
    // ===================================================================
    
    // Posunuj částici její aktuální rychlostí
    p.x += p.vx;
    p.y += p.vy;
    
    // Otáčej částici její rotační rychlostí (radiánů za frame)
    p.rotation += p.rotationSpeed;
    
    // ===================================================================
    // KOLIZE S PODLAHOU - ODRAZ
    // ===================================================================
    
    // Vypočítej Y pozici podlahy
    const groundY = canvasHeight - floorHeight;
    
    // Pokud částice spadla pod podlahu
    if (p.y + p.size > groundY) {
      // Umístni ji přesně na podlahu
      p.y = groundY - p.size;
      
      // ODRAZ - Energie se ztrácí (neelastický odraz)
      // -0.5 = vrátí se (- znamená opačný směr)
      // ale jen s 50% energií (zbylých 50% se ztratí)
      p.vy *= -0.5;
      
      // TŘENÍ - Horizontální zpomalení
      // 0.8 = zbyde 80% horizontální rychlosti
      p.vx *= 0.8;
    }
    
    // ===================================================================
    // ŽIVOTNOST - ALPHA FADE (POSTUPNÉ MIZENÍ)
    // ===================================================================
    
    // Uberi 1 bod životnosti (každý frame)
    p.life -= 1;
    
    // Vypočítej poměr zbývajícího života (0 až 1)
    // 1 = plný život (nový), 0 = mrtvá (smaž)
    const lifeRatio = p.life / p.maxLife;
    
    // Vypočítej opacitu (alfa kanál) s ease-out efektem
    // Math.pow(lifeRatio, 1.5) = částice mizí poměrně pomalu
    // a v poslední třetině života se velmi zrychluje zeslabování
    // Př: lifeRatio=0.5 → opacity=0.35
    //     lifeRatio=0.3 → opacity=0.16
    //     lifeRatio=0.1 → opacity=0.032
    p.opacity = Math.pow(lifeRatio, 1.5);
    
    // Pokud je částice mrtvá (life <= 0)
    if (p.life <= 0) {
      // Smaž ji z pole
      particles.splice(i, 1);
    }
  }
}

// ===================================================================
// KRESLENÍ EFEKTŮ
// ===================================================================

// Nakresli všechny aktivní částice efektů
// Každá částice je malý "V" tvar (symbol úhlu) s glow efektem
//
// Kreslící technika:
// 1. Ulož canvas stav (save)
// 2. Nastav globální alfa (opacitu) pro fade efekt
// 3. Přesuň a otočit canvas (translate/rotate)
// 4. Nakresli "V" tvar (dvě čáry tvořící úhel)
// 5. Přidej glow efekt (vícevrstvý stroke s vyšší tloušťkou)
// 6. Obnov canvas stav (restore)
//
export function drawAngleEffects() {
  // Projdi všechny aktivní částice a nakresli je
  particles.forEach(p => {
    // ULOŽENÍ STAVU - Všechny změny jsou jen na tuto částici
    ctx.save();
    
    // OPACITA - Globální alfa kanál
    // Alpha fade efekt (částice postupně mizí)
    ctx.globalAlpha = p.opacity;
    
    // TRANSFORMACE - Přesuň a otočit prostor
    // Všechny další kreslete jsou relativní k (p.x, p.y)
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    
    // ZÁKLADNÍ VIZUÁL - Kreslení "V" tvaru
    ctx.strokeStyle = p.color;  // Barva čáry (oranžová/zlatá)
    
    // Tloušťka čáry je různá podle typu
    // Break = 2.5 (tučnější)
    // Collect = 2 (jemnější)
    ctx.lineWidth = p.type === "break" ? 2.5 : 2;
    
    // Zaokrouhlení konců čar (hezčí vzhled)
    ctx.lineCap = 'round';
    
    // Zaokrouhlování rohů (hezčí vzhled)
    ctx.lineJoin = 'round';
    
    // Nakresli "V" tvar (symbol úhlu)
    // Dva segmenty tvořící úhel: /
    //                             V
    ctx.beginPath();
    ctx.moveTo(p.size, -p.size);    // Horní bod
    ctx.lineTo(0, 0);               // Střední bod (vrchol úhlu)
    ctx.lineTo(p.size, p.size);     // Dolní bod
    ctx.stroke();
    
    // ===================================================================
    // GLOW EFEKT - Světelný efekt kolem "V" tvaru
    // ===================================================================
    
    // Sbírající částice mají silnější glow (jsou "zvláštní")
    if (p.isCollecting) {
      // GLOW PRO SBÍRÁNÍ - Viditelný halo efekt
      ctx.strokeStyle = p.color;  // Stejná barva
      
      // Glow je půlprůhledný (0.4 = 40% opacity)
      ctx.globalAlpha = p.opacity * 0.4;
      
      // Glow je silnější (5 pixelů místo 2-2.5)
      ctx.lineWidth = 5;
      
      // Nakresli znovu (tentokrát s glowem)
      // Nový stav nemáme beginPath, takže se kreslí znovu
      ctx.stroke();
      
    } else if (p.type === "break") {
      // GLOW PRO ROZPADY - Slabší efekt
      ctx.strokeStyle = p.color;
      
      // Slabší glow (0.2 = 20% opacity)
      ctx.globalAlpha = p.opacity * 0.2;
      
      // Glow je silnější (4 pixely)
      ctx.lineWidth = 4;
      
      // Nakresli glow
      ctx.stroke();
    }
    
    // OBNOVA STAVU - Vrátit canvas do předchozího stavu
    // Bez toho by transformace (translate/rotate) ovlivnila další částice
    ctx.restore();
  });
}
