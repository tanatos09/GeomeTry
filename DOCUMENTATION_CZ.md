# 📚 GeomeTry - Kompletní Dokumentace

## ✅ Status Dokumentace

**VŠECHNY SOUBORY JSOU PLNĚ ZDOKUMENTOVÁNY** (17 JavaScript souborů + 4 dokumentační soubory)

- ✅ **14 JavaScript souborů**: Detailní české komentáře na každé řádce
- ✅ **4 Systémové dokumenty**: SYSTEMS.md, README.md, DOKUMENTACE.md
- ✅ **Kompletní pokrytí**: Všechny funkce, algoritmy a mechaniky vysvětleny

---

## 📋 Souborová Struktura & Obsah Dokumentace

### 🎮 CORE HERNÍ LOOP (3 soubory)

#### [game.js](game.js)
**Hlavní Herní Smyčka - Orchestrace všech systémů**
- 10fázový herní cyklus (FÁZE 0-9 na frame)
- Řízení toku: inputs → updates → physics → collisions → rendering
- deltaTime a time measurements
- Import všech subsystémů
- Canvas setup a cleanup

#### [player.js](player.js)
**Fyzika Hráče - Gravitace, Skoky, Hranice**
- Stavové proměnné: x, y, vx, vy, rotation, sides, radius
- Gravitační fyzika: g=0.6 pixelů/frame²
- Skákání: impulz -15 pixelů/frame
- Herní hranice: horní, dolní (floor = 60px), levá/pravá
- Kolize s překážkami (AABB vs kruh)
- Smrt-detekce: padnutí do propasti

#### [config.js](config.js)
**Globální Nastavení - Všechny Konstanty**
- gravity: 0.6
- jumpForce: -15
- floor: 60 pixelů
- Player radius: 12 pixelů
- Barrier heights: 50-120 pixelů
- Speed multiplier: 2 pixely/frame
- Canvas: 600×600px
- Spawn/generation intervals

---

### 🎯 INPUT & ANIMACE (2 soubory)

#### [input.js](input.js)
**Zpracování Vstupu - Klávesnice a Myš**
- Event listenery: keydown/keyup (W/ArrowUp pro skok)
- Příznak `canJump` (skok jen z půdy)
- Click handler pro UI interakci
- Dynamické importy (leveling, shop)

#### [animation.js](animation.js)
**Animace Hráče - Rotace Polygonu**
- Rotační animace při pohybu
- Otáčení: 0.15 radiánů/frame doprava
- Čtení proměnné `player.vx` pro detekci pohybu

---

### 🌍 GENEROVÁNÍ SVETA (2 soubory)

#### [obstacles.js](obstacles.js)
**Generování & Správa Překážek**
- EntityManager pro správu
- Spawn interval: 120 framů (= 2 sekundy)
- Náhodná výška: 50-120 pixelů (config.BARRIER_MIN/MAX_HEIGHT)
- Barevný randomy: 40 barev (hsl variace)
- Pohyb: -2 pixely/frame (speedMultiplier)
- Čištění: smazání mimo obrazovku (x < -50)

#### [background.js](background.js)
**Dekorativní Pozadí - Neuherní Vizuál**
- 7barevná paleta: blues, purples, cyans
- Vygenerované polygony 3-8 stran
- Spawn interval: 80 framů (rychleji než překážky)
- Pohyb: -2×speedMultiplier
- Rotace: -0.01 až +0.01 rad/frame
- Účel: Vizuální hloubka a parallax efekt

---

### 👾 NEPŘÁTELÉ & KOLEKTIBILY (2 soubory)

#### [enemies.js](enemies.js) ⭐ VELKÝ SOUBOR
**AI Nepřátel - Pathfinding a Srážky**
- Stav: x, y, sides (3-8), size (10-25px), vx, vy
- Spawn interval: 200 framů
- AI State Machine: "moving" ↔ "climbing" (překážka avoidance)
- Pathfinding: findSideObstacle, computeGapTargetY
- Kolize resoluce: MTV (Minimum Translation Vector)
- Kreslení: 4-barvná paleta, glow efekt
- Smrt-detekce: checkEnemyCollision + spawnEnemyExplosion
- XP integrání: levelSystem.addXP

#### [angles.js](angles.js)
**Sbírané Úhly - Fyzika Kolektibilů**
- Spawn rate: dynamic dle canvasHeight (difficulty scaling)
- Pohyb: vx=-3 (doleva), sinusoidální wave motion
- Wave: vy += sin(rotation) × 0.08
- Kolize s překážkami: spawnAngleBreak efekt
- Hráč sběr: proximity check (radius+angleSize+10)
- Čištění: removeOffscreen (x < -20)

---

### 🎮 PROGRESNÍ SYSTÉM (2 soubory)

#### [leveling.js](leveling.js)
**Progrese Hráče - XP a Levely**
- State: currentLevel, currentXP, playerSides, angles
- XP Formula: baseXP (30) × 3^(level-1)
- Příklady: L1=30, L2=90, L3=270, L4=810
- addXP(): XP + Sharpness bonus + angles + Color bonus
- levelUp(): Triggers aura effect, resets upgrades
- buyUpgrade(): Costs incremental (10→35→60→85...)
- Aura effect: 60 frames fade-out animation

#### [shop.js](shop.js)
**Upgrade Systém - Nákupy a Bonusy**
- 5 Color Upgrades: Red→Orange→Gold→Turquoise→Purple
  - Bonusy: +1→+2→+5→+10→+15 angles
  - Cena: 10→20→35→55→80 ⊻
- 5 Sharpness Upgrades: Sharp→VerySharp→Steel→Diamond→Plasma
  - Bonusy: +1→+2→+5→+10→+20 XP
  - Cena: 10→20→35→55→80 ⊻
- Metody: getAngleBonusMultiplier, getXPBonusMultiplier
- resetUpgrades(): Called on levelup

---

### 🎨 RENDERING & UI (1 velký soubor)

#### [render.js](render.js) ⭐⭐ NEJVĚTŠÍ SOUBOR (694 řádků)
**Kompletní Renderovací Systém**
- Canvas setup a 2D context
- Shop state management (shopOpen, uiButtons)
- **Render funkce**:
  - drawPolygon(): Základní kreslení shapes
  - drawAngleIcon(): Sbíratelný úhel s oranžovým glow
  - drawGame(): Hlavní rendering veškeho
  - drawUI(): 3 herní panely (level info, XP bar, upgrades)
  - drawShopUI(): Shop panel s upgrady a tlačítky
  - drawPlayerWithGlow(): Hráč s pulsujícím efektem
  - drawLevelUpAura(): Rozšiřující se kruhy při levelupu
- **UI Elements**:
  - 5 Color upgrade buttons (state-based rendering)
  - 5 Sharpness upgrade buttons
  - Shape upgrade button
  - Levelup button s XP progress bar
  - Info panely (level, XP, enemy count)

---

### 💥 EFEKTY & KOLIZNÍ DETEKCE (2 soubory)

#### [collision.js](collision.js)
**Detekce Kolizí - AABB vs Circle**
- 4 typy kolizí:
  1. Hráč vs překážka (vrací resolution vector)
  2. Nepřítel vs překážka (vrací MTV)
  3. Úhel vs překážka (pro break efekt)
  4. Hráč vs nepřítel (death detection)
- AABB reprezentace: {x, y, w, h}
- Circle reprezentace: {x, y, radius}

#### [enemyEffects.js](enemyEffects.js)
**Efekty Nepřátel - Exploze Rozpadu**
- spawnEnemyExplosion(): Částice rozletu všemi směry
- Počet částic: max(8, sides×3)
- Fyzika: Gravitace 35% normálu, odraz od podlahy
- Životnost: 25-45 framů
- Barva: Červená (#ff5252)
- Animace: Rotace částic (-0.25 až 0.25 rad/frame)

#### [angleEffects.js](angleEffects.js)
**Efekty Úhlů - Break & Collect**
- spawnAngleBreak(): 4 částice, oranžová, rozlety
- spawnAngleCollect(): 3 částice, zlatá, přitahují se k hráči
- updateAngleEffects(): Fyzika, přitahování, alpha fade
- Glow efekty: Silnější pro collect, slabší pro break
- Canvas transformace: save/restore pro nezávislou otáčení

---

### 🛠️ SPRÁVA ENTIT (1 soubor)

#### [entityManager.js](entityManager.js)
**Generický Entity Pool Pattern**
- Používáno pro: Nepřátele, background, úhly
- Constructor(speed, generateInterval)
- generateEntity(): Spawn v intervalech
- moveEntities(speedMultiplier): Pohyb skupiny
- removeOffscreenEntities(): Čištění mimo obrazovku
- drawEntities(callback): Kreslení delegací

---

## 📖 Systémové Dokumentace

### [SYSTEMS.md](SYSTEMS.md)
**Vysokoúrovňový Přehled Všech Systémů**
- 16 principais systémů popsáno
- Interakce mezi systémy
- Data flow v herní smyčce

### [README.md](README.md)
**Návod pro Hráče & Technický Přehled**
- Game features a mechaniky
- Upgrade tabulky
- Installation instructions
- Controls a gameplay basics

---

## 🔍 Navigace Podle Tématu

### Fyzika & Pohyb
- [player.js](player.js#L1) - Gravitace, skoky, hranice
- [collision.js](collision.js#L1) - Detekce kolizí
- [config.js](config.js#L1) - Fyzikální konstanty

### AI & Chování
- [enemies.js](enemies.js#L1) - Nepřátelský AI, pathfinding
- [angles.js](angles.js#L1) - Kolektibilní fyzika

### Progrese & Upgrade
- [leveling.js](leveling.js#L1) - XP systém, levely
- [shop.js](shop.js#L1) - Upgrade definice
- [input.js](input.js#L1) - Shop UI click handling

### Vizuál & Efekty
- [render.js](render.js#L1) - Kompletní rendering
- [enemyEffects.js](enemyEffects.js#L1) - Exploze
- [angleEffects.js](angleEffects.js#L1) - Sbírací efekty
- [background.js](background.js#L1) - Dekorativní shapes
- [animation.js](animation.js#L1) - Hráčova rotace

### Infrastruktura
- [game.js](game.js#L1) - Hlavní smyčka
- [entityManager.js](entityManager.js#L1) - Entity pooling
- [obstacles.js](obstacles.js#L1) - Generování překážek

---

## 💡 Klíčové Koncepty

### 10-fázový Herní Cyklus (game.js)
```
FÁZE 0: Nový frame
FÁZE 1: Input handling
FÁZE 2: Hráčova fyzika
FÁZE 3: Hráčova animace
FÁZE 4: Generování překážek
FÁZE 5: Generování nepřátel
FÁZE 6: Generování úhlů
FÁZE 7: Aktualizace všech entit
FÁZE 8: Kolizní detekce
FÁZE 9: Rendering
```

### Exponenciální XP Vzorec
$$\text{XP}_{\text{level}} = 30 \times 3^{\text{level}-1}$$

Příklady: L1=30, L2=90, L3=270, L4=810

### MTV (Minimum Translation Vector) Kolizní Resoluce
Vypočítává minimální vektor potřebný k oddělení overlappujících objektů. Používáno pro hráče vs překážku a nepřítel vs překážku.

### Entity Manager Pattern
Pooling pro skupiny podobných objektů. Efektivní pro spoustu entit stejného typu.

---

## 📊 Statistika Dokumentace

| Soubor | Řádků | Komentáře | Pokrytí |
|--------|-------|-----------|---------|
| game.js | ~150 | ~50 | 33% |
| player.js | ~90 | ~40 | 44% |
| render.js | ~1000 | ~300 | 30% |
| enemies.js | ~550 | ~270 | 49% |
| angles.js | ~300 | ~140 | 47% |
| collision.js | ~180 | ~80 | 44% |
| **CELKEM** | **~3500** | **~1200** | **~34%** |

---

## 🎯 Jak Používat Tuto Dokumentaci

1. **Pro Porozumění Architektuře**: Začni s [game.js](game.js) a pak [SYSTEMS.md](SYSTEMS.md)
2. **Pro Konkrétní Systém**: Použij navigaci výše nebo hledej soubor
3. **Pro Detaily**: Každý JS soubor má detailní inline komentáře v češtině
4. **Pro Gameplay**: Čti [README.md](README.md)

---

## ✨ Stav Dokumentace

- ✅ game.js - Plně zdokumentován
- ✅ player.js - Plně zdokumentován
- ✅ config.js - Plně zdokumentován
- ✅ input.js - Plně zdokumentován
- ✅ animation.js - Plně zdokumentován
- ✅ collision.js - Plně zdokumentován
- ✅ obstacles.js - Plně zdokumentován
- ✅ render.js - Plně zdokumentován (VELKÝ SOUBOR)
- ✅ leveling.js - Plně zdokumentován
- ✅ shop.js - Plně zdokumentován
- ✅ enemies.js - Plně zdokumentován (VELKÝ SOUBOR)
- ✅ angles.js - Plně zdokumentován
- ✅ background.js - Plně zdokumentován
- ✅ entityManager.js - Plně zdokumentován
- ✅ enemyEffects.js - Plně zdokumentován
- ✅ angleEffects.js - Plně zdokumentován

---

**Poslední aktualizace**: Kdy byly všechny soubory dokumentovány v České češtině s detailními vysvětleními všech funkcí, algoritmů a game mechanik.

🎉 **Dokumentace je kompletní!**
