# 🎮 GeomeTry – Geometry-Based Arcade Game

👉 Playable demo: https://tanatos09.github.io/GeomeTry/  
📦 Source code: https://github.com/tanatos09/GeomeTry  
💬 Discord (community & ideas): https://discord.gg/ym3J6jfp  
💼 LinkedIn: https://www.linkedin.com/in/tomasfrank  

🚧 Status: Active development (playable, core gameplay finished)

---

## TL;DR
- Arcade game focused on geometry-based progression
- Collect angles, defeat enemies, upgrade your shape
- 100% code, 0% textures
- Endless improvement → clear goal coming soon: **Become a circle**

---

## Overview

**GeomeTry** is an arcade-style game where the player controls a geometric polygon — starting as a simple triangle — and navigates through obstacles, defeats enemies, and collects floating V-shaped angles to grow stronger.

The core gameplay loop is already finished and playable. Current development focuses on polishing visuals, UI details, and gradually expanding the game with a simple story and idle mechanics.

---

## Story (Early Concept)

Geome is a small triangle living in a world of shapes.

He falls in love with a mysterious **Star**, but Stars can only exist alongside smooth, rounded forms. Sharp edges disturb their inner structure.

To be together, Geome must go through a journey of transformation — adding sides, refining his shape, and slowly becoming closer to a **perfect circle**.

At first, the game is endless and focused purely on improvement. Soon, it will gain a clear narrative goal: **become a circle**.

---

## Game Features

- Progressive leveling system based on enemy defeats
- Five upgrade categories:
  - Color Upgrades – increase angle gains
  - Sharpness Upgrades – increase XP from enemies
  - Shape Upgrades – add sides to your polygon
  - Angle Multiplier – multiplies all collected angles
  - XP Multiplier – multiplies all XP gains
- Enemy combat with different polygon shapes
- Obstacle navigation with precise timing
- Physics-based collectibles (bouncing V-shaped angles)
- Visual effects: particles, collection animations, level-up auras
- Mobile-friendly controls
- Responsive shop UI (desktop, tablet, mobile)

---

## Game Mechanics

### Currency & Resources

**Angles (⊻)**  
Primary currency used for upgrades.
- Base pickup: 1 ⊻ + color bonus
- Enemy defeat: 2 ⊻ + color bonus
- Color bonus: +1 → +15 ⊻

**XP**  
Used for leveling.
- Base XP: 1 per enemy side + sharpness bonus
- Sharpness bonus: +1 → +20 XP

---

### Leveling System

XP requirements grow exponentially.

- Base XP (Level 1): 30
- Multiplier: 3x per level

---

## Upgrades

### Color Upgrades (Left side of shop)

| Tier | Name | Cost | Bonus |
|----|------|------|-------|
| 1 | Red | 10⊻ | +1 angle |
| 2 | Orange | 20⊻ | +2 angles |
| 3 | Gold | 35⊻ | +5 angles |
| 4 | Turquoise | 55⊻ | +10 angles |
| 5 | Purple | 80⊻ | +15 angles |

---

### Sharpness Upgrades (Right side of shop)

| Tier | Name | Cost | Bonus |
|----|------|------|-------|
| 1 | Sharp | 10⊻ | +1 XP |
| 2 | Very Sharp | 20⊻ | +2 XP |
| 3 | Steel | 35⊻ | +5 XP |
| 4 | Diamond | 55⊻ | +10 XP |
| 5 | Plasma | 80⊻ | +20 XP |

---

### Shape Upgrades
- Cost: 10 ⊻
- Requirement: Level 2+
- Effect: Adds a side to the player shape (3 → 4 → 5 → …)
- More sides = stronger multipliers

---

### Geometry Multipliers

| Shape | Multiplier |
|------|-----------|
| Triangle (3) | 1.2x |
| Square (4) | 1.4x |
| Pentagon (5) | 1.6x |
| Hexagon (6) | 1.8x |

- Cost: 150 ⊻ each
- Permanent effect (no reset on level-up)

---

## How to Play

1. Jump – Click / Touch / Space / Arrow Up
2. Open Shop – Shop icon or S
3. Buy Upgrades – Click on an upgrade
4. Scroll Shop – Mouse wheel or swipe
5. Close Shop – X button
6. Goal – Survive, improve, evolve

---

## Controls

- Mouse / Touch – Jump & UI
- Keyboard:
  - Space / Arrow Up – Jump
  - S – Open shop
  - U – Buy shape upgrade (legacy)

---

## Technical Stack

- Language: JavaScript (ES6 modules)
- Rendering: HTML5 Canvas 2D
- Architecture: Modular, EntityManager pattern
- Physics: Custom gravity, collision & bounce mechanics
- Responsive layouts: Mobile / Tablet / Desktop

---

## Visual Style

- Cosmic / space-inspired theme
- Neon colors
- Minimalist geometry-based visuals
- 100% code, no textures

---

## Development & Community

GeomeTry is a solo indie project.

The game is currently:
- Playable
- Mechanically complete
- Being polished (UI, visuals)
- Story development just starting
- Idle mechanics planned

I am currently building a community on Discord, where ideas and future features are discussed.

---

## Browser Compatibility

- ES6 modules required
- Modern Canvas 2D API
- Desktop & mobile browsers supported
- Touch-friendly UI



# 🎮 GeomeTry – Geometrická Arkádová Hra

👉 Hratelné demo: https://tanatos09.github.io/GeomeTry/  
📦 Zdrojový kód: https://github.com/tanatos09/GeomeTry  
💬 Discord (komunita & nápady): https://discord.gg/ym3J6jfp  
💼 LinkedIn: https://www.linkedin.com/in/tomasfrank  

🚧 Stav: Aktivní vývoj (hratelné, základní mechaniky hotové)

---

## TL;DR
- Arkádová hra založená na geometrické progresi
- Sbírej úhly, porážej nepřátele, vylepšuj svůj tvar
- 100 % kód, 0 % textury
- Nekonečné zlepšování → brzy jasný cíl: **stát se kruhem**

---

## Přehled

**GeomeTry** je arkádová hra, ve které hráč ovládá geometrický polygon — začíná jako jednoduchý trojúhelník — a prochází překážkami, poráží nepřátele a sbírá létající V-tvary úhlů, aby se postupně zlepšoval.

Základní herní smyčka je hotová a plně hratelná. Aktuální vývoj se zaměřuje na doladění vizuálu, UI a postupné přidání jednoduchého příběhu a idle prvků.

---

## Příběh (raný koncept)

Geome je malý trojúhelník žijící ve světě tvarů.

Zamiluje se do tajemné **Hvězdy**, ale Hvězdy mohou existovat pouze vedle hladkých, kulatých tvarů. Ostré hrany narušují jejich vnitřní strukturu.

Aby mohli být spolu, musí Geome projít cestou transformace — přidávat strany, zdokonalovat svůj tvar a postupně se přibližovat **dokonalému kruhu**.

Zpočátku je hra nekonečná a zaměřená čistě na zlepšování. Brzy ale získá jasný příběhový cíl: **stát se kruhem**.

---

## Herní Vlastnosti

- Progresivní systém levelování založený na porážení nepřátel
- Pět kategorií upgradů:
  - Barevné upgrady – zvyšují zisk úhlů
  - Upgrady ostrosti – zvyšují XP z nepřátel
  - Upgrady tvaru – přidávají strany polygonu
  - Násobitel úhlů – násobí všechny získané úhly
  - Násobitel XP – násobí všechny získané XP
- Souboje s nepřáteli různých tvarů
- Navigace skrz překážky s důrazem na timing
- Sbíratelné objekty s realistickou fyzikou
- Vizuální efekty: částice, animace sběru, aury levelupu
- Mobilní ovládání
- Responzivní obchod (desktop, tablet, mobil)

---

## Herní Mechaniky

### Měna a Zdroje

**Úhly (⊻)**  
Primární měna pro upgrady.
- Základní sběr: 1 ⊻ + barevný bonus
- Porážení nepřátel: 2 ⊻ + barevný bonus
- Barevný bonus: +1 → +15 ⊻

**XP**
- Základní XP: 1 za stranu nepřítele + bonus ostrosti
- Bonus ostrosti: +1 → +20 XP

---

### Levelování

- Základní XP (úroveň 1): 30
- Násobitel: 3x za úroveň

---

## Upgrady

### Barevné Upgrady (Levá strana obchodu)

| Úroveň | Název | Cena | Bonus |
|------|------|------|-------|
| 1 | Rudá | 10⊻ | +1 úhel |
| 2 | Oranžová | 20⊻ | +2 úhly |
| 3 | Zlatá | 35⊻ | +5 úhlů |
| 4 | Tyrkysová | 55⊻ | +10 úhlů |
| 5 | Purpurová | 80⊻ | +15 úhlů |

---

### Upgrady Ostrosti (Pravá strana obchodu)

| Úroveň | Název | Cena | Bonus |
|------|------|------|-------|
| 1 | Ostré | 10⊻ | +1 XP |
| 2 | Velmi ostré | 20⊻ | +2 XP |
| 3 | Ocelové | 35⊻ | +5 XP |
| 4 | Diamantové | 55⊻ | +10 XP |
| 5 | Plazmové | 80⊻ | +20 XP |

---

### Upgrady Tvaru
- Cena: 10 ⊻
- Požadavek: Úroveň 2+
- Efekt: Přidává stranu polygonu (3 → 4 → 5 → …)
- Více stran = silnější multiplikátory

---

### Geometrické Multiplikátory

| Tvar | Násobitel |
|----|-----------|
| Trojúhelník | 1.2x |
| Čtverec | 1.4x |
| Pětiúhelník | 1.6x |
| Šestiúhelník | 1.8x |

- Cena: 150 ⊻ každý
- Trvalý efekt (bez resetu po levelupu)

---

## Jak Hrát

1. Skok – Klik / Dotyk / Space / Šipka nahoru
2. Otevřít obchod – Ikona obchodu nebo S
3. Koupit upgrade – Kliknutím
4. Scroll obchodu – Kolečko myši nebo swipe
5. Zavřít obchod – Tlačítko X
6. Cíl – Přežít, zlepšovat se, transformovat se

---

## Ovládání

- Myš / Dotyk – Skok a UI
- Klávesnice:
  - Space / Šipka nahoru – Skok
  - S – Obchod
  - U – Upgrade tvaru (legacy)

---

## Technický Stack

- Jazyk: JavaScript (ES6 moduly)
- Vykreslování: HTML5 Canvas 2D
- Architektura: Modulární, EntityManager vzor
- Fyzika: Vlastní gravitace, kolize a odrazy
- Responzivní rozvržení: Mobil / Tablet / Desktop

---

## Vizuální Styl

- Kosmické / space téma
- Neonové barvy
- Minimalistická geometrie
- 100 % kód, žádné textury

---

## Vývoj & Komunita

GeomeTry je sólový indie projekt.

Aktuální stav:
- Hratelné
- Mechanicky hotové
- Probíhá ladění vizuálu a UI
- Začíná vývoj příběhu
- Plánované idle prvky

Momentálně buduju komunitu na Discordu, kde se sdílí nápady a směr dalšího vývoje.

---

## Kompatibilita Prohlížečů

- Vyžaduje ES6 moduly
- Moderní Canvas 2D API
- Podpora desktopu i mobilu
- Dotykově přívětivé UI
