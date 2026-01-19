# GeomeTry - A Geometry-Based Arcade Game

## Overview

GeomeTry is an interactive arcade-style game where the player controls a geometric polygon (starting as a triangle) and navigates through obstacles while collecting floating angles to earn upgrades and level up. The game features a progressive upgrade system with two main upgrade paths: **Color upgrades** (for collecting angles) and **Sharpness upgrades** (for earning XP from enemy kills).

## Game Features

- **Progressive Leveling System**: Earn XP by defeating enemies and gain angles by collecting floating angle collectibles
- **Two Upgrade Paths**:
  - **Color Upgrades**: Red → Orange → Gold → Turquoise → Purple (increase angle collection bonuses)
  - **Sharpness Upgrades**: Sharp → Very Sharp → Steel → Diamond → Plasma (increase XP per enemy kill)
- **Shape Upgrades**: Unlock new player shapes (more sides = more complex polygons) at Level 2+
- **Enemy Combat**: Defeat enemies with different polygon shapes to earn XP and angles
- **Obstacle Navigation**: Dodge obstacles while moving through the level
- **Visual Effects**: Particle explosions, angle collection animations, and levelup auras
- **Mobile-Friendly Controls**: Play with mouse clicks or touch on mobile devices
- **Shop System**: Click-based UI for purchasing upgrades with collected angles

## Game Mechanics

### Currency & Resources

- **Angles (⊻)**: Primary currency collected from floating angle pickups and enemy kills
  - Base collection: 1 angle per pickup + color bonus
  - Base enemy kill: 2 angles + color bonus
  - Color upgrade bonus: +1 to +15 angles per collection

- **XP**: Experience points earned by defeating enemies
  - Base XP: 1 per enemy side + sharpness bonus
  - Sharpness upgrade bonus: +1 to +20 XP per enemy

### Leveling

- Each level requires an exponentially increasing amount of XP
- Formula: `XP Required = baseXP * (multiplier ^ (level - 1))`
- Base XP for Level 1: 30 XP
- Multiplier: 3x per level

### Upgrades

#### Color Upgrades (Left side of shop)
| Tier | Name | Cost | Bonus |
|------|------|------|-------|
| 1 | Red | 10⊻ | +1 angle |
| 2 | Orange | 20⊻ | +2 angles |
| 3 | Gold | 35⊻ | +5 angles |
| 4 | Turquoise | 55⊻ | +10 angles |
| 5 | Purple | 80⊻ | +15 angles |

#### Sharpness Upgrades (Right side of shop)
| Tier | Name | Cost | Bonus |
|------|------|------|-------|
| 1 | Sharp | 10⊻ | +1 XP |
| 2 | Very Sharp | 20⊻ | +2 XP |
| 3 | Steel | 35⊻ | +5 XP |
| 4 | Diamond | 55⊻ | +10 XP |
| 5 | Plasma | 80⊻ | +20 XP |

#### Shape Upgrades
- Cost: 10⊻
- Requirement: Level 2+
- Effect: Increases player polygon from 3 sides → 4 sides → 5 sides, etc.

## How to Play

1. **Jump**: Click/touch the screen or press Space/Arrow Up
2. **Open Shop**: Click the shop icon in the top-left corner
3. **Buy Upgrades**: Click on an upgrade to purchase it (if you have enough angles)
4. **Close Shop**: Click the X button in the top-right of the shop panel
5. **Objective**: Survive obstacles, defeat enemies, collect angles, and reach higher levels

## Controls

- **Mouse/Touch**: Click to jump or interact with shop
- **Keyboard**: 
  - Space / Arrow Up: Jump
  - U: Buy shape upgrade (legacy)

## Technical Stack

- **Language**: JavaScript (ES6 modules)
- **Rendering**: HTML5 Canvas 2D Context
- **Architecture**: Module-based with EntityManager pattern
- **Physics**: Custom gravity and collision detection
- **Input**: Mouse/Touch and Keyboard events

## Visual Style

- **Color Scheme**: Cosmic/Space theme with neon colors
- **Player**: Cyan (#00f0ff) polygon with color upgrades available
- **Enemies**: Random polygons with red outlines
- **Background**: Semi-transparent decorative polygons in blues and purples
- **Effects**: Orange particles for explosions, neon green for highlights

## Browser Compatibility

- Requires ES6 module support
- Modern Canvas 2D API
- Works on desktop and mobile browsers
- Touch-friendly UI for mobile devices

---

# GeomeTry - Geometrická Arkádová Hra

## Přehled

GeomeTry je interaktivní arkádová hra, kde hráč ovládá geometrický polygon (začíná jako trojúhelník) a naviguje se skrz překážky, zatímco sbírá létající úhly, aby si koupil vylepšení a dosáhl vyšších úrovní. Hra obsahuje progresivní systém vylepšení se dvěma hlavními cestami: **Barevné upgrady** (pro sběr úhlů) a **Upgrady ostrosti** (pro zisk XP z vražd nepřátel).

## Herní Vlastnosti

- **Progresivní Systém Úrovní**: Získávej XP zabíjením nepřátel a sbírej úhly ze sběru létajících úhlů
- **Dva Upgrady**:
  - **Barevné Upgrady**: Rudá → Oranžová → Zlatá → Tyrkysová → Purpurová (zvyšují bonusy sběru úhlů)
  - **Upgrady Ostrosti**: Ostré → Velmi ostré → Ocelové → Diamantové → Plazmové (zvyšují XP za nepřátele)
- **Upgrady Tvaru**: Odemkni nové tvary hráče (více stran = komplexnější polygony) na úrovni 2+
- **Boj s Nepřáteli**: Poraz nepřátele s různými tvary polygonů a získej XP a úhly
- **Navigace Překážkami**: Vyhýbej se překážkám během pohybu hrou
- **Vizuální Efekty**: Explozivní částice, animace sběru úhlů, aury levelupu
- **Mobilní Ovládání**: Hrej pomocí kliknutí myší nebo dotyku na mobilních zařízeních
- **Systém Obchodu**: Klikací UI pro nákup vylepšení za sbírané úhly

## Herní Mechaniky

### Měna a Zdroje

- **Úhly (⊻)**: Primární měna sbíraná z létajících sbírek úhlů a z vražd nepřátel
  - Základní sběr: 1 úhel za sbírku + barevný bonus
  - Základní nepřítel: 2 úhly + barevný bonus
  - Barevný bonus: +1 až +15 úhlů za sběr

- **XP**: Body zkušenosti získané zabíjením nepřátel
  - Základní XP: 1 za stranu nepřítele + bonus ostrosti
  - Bonus ostrosti: +1 až +20 XP za nepřítele

### Levelování

- Každá úroveň vyžaduje exponenciálně rostoucí množství XP
- Formule: `XP Potřebný = základníXP * (násobitel ^ (úroveň - 1))`
- Základní XP pro Úroveň 1: 30 XP
- Násobitel: 3x za úroveň

### Upgrady

#### Barevné Upgrady (Levá strana obchodu)
| Úroveň | Název | Cena | Bonus |
|--------|-------|------|-------|
| 1 | Rudá | 10⊻ | +1 úhel |
| 2 | Oranžová | 20⊻ | +2 úhly |
| 3 | Zlatá | 35⊻ | +5 úhlů |
| 4 | Tyrkysová | 55⊻ | +10 úhlů |
| 5 | Purpurová | 80⊻ | +15 úhlů |

#### Upgrady Ostrosti (Pravá strana obchodu)
| Úroveň | Název | Cena | Bonus |
|--------|-------|------|-------|
| 1 | Ostré | 10⊻ | +1 XP |
| 2 | Velmi ostré | 20⊻ | +2 XP |
| 3 | Ocelové | 35⊻ | +5 XP |
| 4 | Diamantové | 55⊻ | +10 XP |
| 5 | Plazmové | 80⊻ | +20 XP |

#### Upgrady Tvaru
- Cena: 10⊻
- Požadavek: Úroveň 2+
- Efekt: Zvýší polygon hráče z 3 stran → 4 strany → 5 stran, atd.

## Jak Hrát

1. **Skok**: Klikni/dotykni obrazovku nebo stiskni Space/Šipka Nahoru
2. **Otevři Obchod**: Klikni na ikonu obchodu v levém horním rohu
3. **Kupuj Upgrady**: Klikni na upgrade, který chceš koupit (pokud máš dost úhlů)
4. **Zavři Obchod**: Klikni na tlačítko X v pravém horním rohu panelu obchodu
5. **Cíl**: Přežij překážky, poraz nepřátele, sbírej úhly a dosáhni vyšších úrovní

## Ovládání

- **Myš/Dotyk**: Klikni na skok nebo interakci s obchodem
- **Klávesnice**:
  - Mezerník / Šipka Nahoru: Skok
  - U: Kup upgrade tvaru (legacy)

## Technický Stack

- **Jazyk**: JavaScript (ES6 moduly)
- **Vykreslování**: HTML5 Canvas 2D Context
- **Architektura**: Modulární s vzorem EntityManager
- **Fyzika**: Vlastní gravitace a detekce kolizí
- **Vstup**: Události myši/dotyku a klávesnice

## Vizuální Styl

- **Barevné Schéma**: Kosmické/Space téma s neonovými barvami
- **Hráč**: Azurový (#00f0ff) polygon s dostupnými barevnými upgrady
- **Nepřátelé**: Náhodné polygony s červenými obrysy
- **Pozadí**: Semi-průhledné dekorativní polygony v modrých a fialových tónech
- **Efekty**: Oranžové částice na exploze, neonově zelené na zvýraznění

## Kompatibilita Prohlížečů

- Vyžaduje podporu ES6 modulů
- Moderní Canvas 2D API
- Funguje na stolních i mobilních prohlížečích
- Přívětivé dotyku UI pro mobilní zařízení
