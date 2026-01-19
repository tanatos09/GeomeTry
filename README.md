# GeomeTry: To Be Circle

## About

**GeomeTry** is a minimalist geometric game with RPG and idle elements. You control a character called **Geome** — a small triangle trying to become an almost perfect circle.

The goal is to gradually add sides and transform Geome from a triangle to a square, a pentagon, and eventually into an almost-circle.

---

## Story

In a world of shapes and forms lives Geome, a small triangle full of curiosity and the desire to become something more. He falls in love with Princess Star, who can be bonded only with round shapes, because they don’t disrupt her radiant inner structure.

Ordinary polygons would harm Princess Star’s offspring, so Geome must transform, become an almost perfect circle, and earn her love.

The journey is full of challenges, enemies, and obstacles — but Geome believes that love and determination can turn the impossible into reality.

---

## Tech Stack

- HTML, CSS, Vanilla JavaScript
- Canvas 2D
- Generative geometric shapes and animations
- Static hosting (GitHub Pages)

---

## Current Game Version

- **Geome** is represented as a **triangle** drawn on the canvas.
- The player can make Geome **jump** using:
  - Space,
  - Up Arrow,
  - Mouse click.
- **Gravity** pulls Geome down, and movement is limited by the **ceiling** and the **floor**.
- **Obstacles (blocks)** are generated randomly:
  - top only,
  - bottom only,
  - or both (with a gap between them),
  and move from **right to left**.
- **Collision detection** between Geome and obstacles is implemented, including **stopping movement on impact** (game over state).
- Off-screen obstacles are **removed**, and the game runs in an **endless loop**.
- Geome has a **rotation animation** that stops when a collision happens.
- The background contains **procedurally generated geometric patterns** with different colors, number of sides, and rotation.
  - The background is separated from the main scene.
  - Patterns move in sync with obstacles, are semi-transparent, and are drawn **behind obstacles and the player**.

### Enemies, Collisions, and Score

- The game randomly spawns **enemies** (polygonal shapes) that move from **right to left**.
- Enemies **do not pass through obstacles**:
  - they stop when they hit an obstacle,
  - then “climb” up/down toward the obstacle gap,
  - once they reach a passable level, they continue moving forward.
- When the player collides with an enemy, the enemy is removed and the player gains **score based on the enemy’s number of sides**.

### Effects (Kill Animation)

- When an enemy is killed, a **particle effect** is triggered (“shattering into pieces”):
  - small polygon fragments burst out from the enemy’s position,
  - fragments have velocity, rotation, gravity, and fade out over time.

---

## Future Plans

- **Geome evolution (progression)**
  - Killing enemies will grant **experience (XP)**.
  - Reaching XP thresholds will trigger **evolution** (transforming Geome into new shapes / adding sides).
  - Evolution can unlock new abilities, visuals, or game mechanics.

- **Currency and upgrades**
  - Introduce an in-game currency called **“angles”**, earned e.g. by defeating enemies, passing obstacles, or completing goals.
  - “Angles” will be used to buy **upgrades** (e.g. speed, jump strength, size, temporary shields, score/XP bonuses).

- **Game menu / UI**
  - Add a **game menu** (pause / shop / inventory / evolution tree).
  - UI for showing **score, XP, angles, current evolution**, and unlocked upgrades.

- **Expanded enemy variety**
  - More enemy types with richer behavior (faster, tougher, elite variants, different sizes and shapes).
  - Spawn variety similar to obstacles and background (timing, types, rarity).

- **Combat mechanics and interaction**
  - Add active abilities (e.g. dash, projectile, shield, time slow).
  - Interactions with the environment (e.g. destructible obstacles, traps, collectibles).

- **Story and chapters**
  - Expand the story and chapters (*To Be Animal*, *To Be Human*, and more).
  - Progress tied to evolution and unlocking shapes/abilities.

- **Visuals and atmosphere**
  - Further improvements to animations (including hit, evolution, and upgrade effects).
  - More particle effects and stronger visual mood (color/light work).

- **Modularization and optimization**
  - More modular structure (separating UI, effects, enemies, progression, saved data).
  - Performance optimization (particle pooling, more efficient collision handling, fewer allocations in the game loop).

---

## How to Play

1. Open [GeomeTry](https://tanatos09.github.io/GeomeTry/)
2. Play and enjoy GeomeTry!

---

## Contact

If you have questions, contact me on [LinkedIn](https://www.linkedin.com/in/tomasfrank/).

---

*The project is still in development — more information coming soon!*




# GeomeTry: To Be Circle

## O projektu

**GeomeTry** je minimalistická geometrická hra s RPG a idle prvky, kde hráč ovládá postavu jménem **Geome** — malý trojúhelník, který se snaží stát téměř dokonalým kruhem.

Cílem hry je postupným přidáváním hran transformovat Geomea od trojúhelníku přes čtverec, pětiúhelník až po téměř kruh.

---

## Příběh

Ve světě tvarů a forem žije Geome, malý trojúhelník plný zvědavosti a touhy stát se něčím víc. Zamiluje se do princezny Hvězdy, která může být spojena jen s kulatými tvary, protože ty nenarušují její zářivou vnitřní strukturu.

Obyčejné mnohouhelníky by poškodily potomky princezny Hvězdy, a proto Geome musí projít proměnou, stát se téměř dokonalým kruhem a tím získat její lásku.

Cesta je plná výzev, nepřátel a překážek, ale Geome věří, že láska a snaha dokážou změnit nemožné.

---

## Technologie

- HTML, CSS, Vanilla JavaScript
- Canvas 2D
- Generativní geometrické tvary a animace
- Statický hosting (GitHub Pages)

---

## Aktuální verze hry

- **Geome** je reprezentovaný jako **trojúhelník** vykreslený na canvasu.
- Hráč může Geomeho **skákat** pomocí:
  - mezerníku,
  - šipky nahoru,
  - kliknutí myší.
- **Gravitace** táhne Geomeho dolů a pohyb je omezen **stropem** a **podlahou**.
- **Překážky (bloky)** se generují náhodně:
  - jen nahoře,
  - jen dole,
  - nebo nahoře i dole (s mezerou mezi nimi),
  a posouvají se **zprava doleva**.
- Probíhá **detekce kolizí** mezi Geomem a překážkami, včetně **zastavení pohybu při nárazu** (game over stav).
- Překážky mimo obrazovku se **odstraňují** a hra běží v **nekonečné smyčce**.
- **Animace rotace** Geoma se při kolizi zastaví.
- Na pozadí se generují **geometrické vzory** s různými barvami, počtem hran a rotací.
  - Pozadí je oddělené od hlavní scény.
  - Vzory se pohybují synchronně s překážkami, jsou průhledné a vykreslené **pod překážkami i hráčem**.

### Nepřátelé, kolize a skóre

- Ve hře se náhodně generují **nepřátelé** (polygonální tvary), kteří se pohybují **z pravé strany doleva**.
- Nepřátelé při kontaktu s překážkou **neprocházejí skrz**:
  - zastaví se o překážku,
  - následně „lezou“ nahoru/dolů směrem do mezery (gap),
  - jakmile se dostanou na úroveň průchodu, pokračují dál v pohybu.
- Při kolizi hráče s nepřítelem je nepřítel odstraněn a hráči se přičte **skóre podle počtu stran nepřítele**.

### Efekty (animace zabití)

- Po zabití nepřítele se spustí **částicová animace** („roztrhání na kousky“):
  - z místa nepřítele se rozletí malé polygonální střepy,
  - střepy mají rychlost, rotaci, gravitaci a postupně zanikají.

---

## Plán do budoucna

- **Evoluce Geomea (progression)**
  - Při zabití nepřítele se budou přičítat **zkušenosti (XP)**.
  - Po dosažení prahů XP dojde k **evoluci** (transformaci Geomea do dalších tvarů / přidávání hran).
  - Evoluce může odemykat nové schopnosti, vzhled, nebo herní mechaniky.

- **Měna a vylepšení**
  - Zavedení herní měny **„úhly“**, získávané např. zabíjením nepřátel, průchodem překážek nebo plněním cílů.
  - „Úhly“ budou sloužit k nákupu **upgradů** (např. rychlost, skok, velikost, dočasné štíty, bonusy ke skóre/XP).

- **Herní menu / UI**
  - Přidání **herního menu** (pauza / obchod / inventář / strom evoluce).
  - UI pro zobrazení **skóre, XP, úhlů, aktuální evoluce** a odemčených vylepšení.

- **Rozšíření nepřátel**
  - Další typy nepřátel s rozšířeným chováním (rychlejší, těžší, „elite“, různé velikosti a tvary).
  - Variace spawnování podobně jako u překážek a pozadí (časování, typy, rarity).

- **Bojové mechaniky a interakce**
  - Přidání aktivních schopností (např. dash, střela, štít, zpomalení času).
  - Interakce s okolím (např. zničitelné překážky, pasti, sběratelné objekty).

- **Příběh a kapitoly**
  - Rozšíření příběhu a herních kapitol (*To Be Animal*, *To Be Human* a další).
  - Postup hrou navázaný na evoluci a odemykání tvarů/schopností.

- **Vizuální efekty a atmosféra**
  - Další vylepšení animací (včetně efektů při zásahu, evoluci a vylepšeních).
  - Rozšíření částicových efektů a práce se světlem/barvami pro výraznější atmosféru.

- **Modularizace a optimalizace**
  - Další modularizace (oddělení UI, efektů, nepřátel, progresu, uložených dat).
  - Optimalizace výkonu (particle pooling, efektivnější kolize, méně alokací v game loop).

---

## Jak spustit

1. Otevři [GeomeTry](https://tanatos09.github.io/GeomeTry/)
2. Hraj a užívej si GeomeTry!

---

## Kontakt

Pokud máš dotazy, kontaktuj mě na [LinkedIn](https://www.linkedin.com/in/tomasfrank/).

---

*Projekt je stále ve vývoji — více informací brzy!*