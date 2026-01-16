# GeomeTry: To Be Circle

## O projektu

**GeomeTry** je minimalistická geometrická hra s RPG a idle prvky, kde hráč ovládá postavu jménem Geome — malý trojúhelník, který se snaží stát téměř dokonalým kruhem.

Cílem hry je postupným přidáváním hran transformovat Geomea od trojúhelníku přes čtverec, pětiúhelník až po téměř kruh.

---

## Příběh

Ve světě tvarů a forem žije Geome, malý trojúhelník plný zvědavosti a touhy stát se něčím víc. Zamiluje se do princezny Hvězdy, která může být spojena jen s kulatými tvary, protože ty nenarušují její zářivou vnitřní strukturu.

Obyčejné mnohouhelníky by poškodily potomky princezny Hvězdy, a proto Geome musí projít proměnou, stát se téměř dokonalým kruhem a tím získat její lásku.

Cesta je plná výzev, nepřátel a překážek, ale Geome věří, že láska a snaha dokážou změnit nemožné.

---

## Technologie

- HTML, CSS, Vanilla JavaScript  
- Generativní geometrické tvary a animace  
- Statický hosting (GitHub Pages)  

---

## Aktuální verze hry

- Geome je reprezentovaný jako trojúhelník na canvasu.  
- Hráč může Geomeho skákat pomocí mezerníku, šipky nahoru nebo kliknutím myši.  
- Gravitační síla táhne Geomeho dolů, pohyb je omezen stropem a podlahou.  
- Překážky (bloky) se generují náhodně nahoře, dole, nebo obojí, a posouvají se zprava doleva.  
- Detekce kolizí mezi Geomem a překážkami, včetně zastavení pohybu při nárazu.  
- Překážky mimo obraz se odstraňují, hra běží v nekonečné smyčce.  
- Animace rotace Geoma, která se zastaví při kolizi.  
- Dynamicky generované geometrické vzory v pozadí s různými barvami, počtem hran a rotací.  
- Pozadí je oddělené od hlavní scény, vzory se pohybují synchronně s překážkami, ale jsou průhledné a vykreslené pod překážkami i hráčem.  
- Kód je modulárně rozdělený (render, hráč, překážky, kolize, animace, pozadí, entitní manažer).  
- Responsivní velikost canvasu podle okna prohlížeče.

---

## Plán do budoucna

- Postupná proměna Geomea přidáváním hran a transformace do dalších tvarů.  
- Zavedení nepřátel s podobnou logikou generování jako překážky a pozadí.  
- Přidání bojových mechanik a interakcí s okolím.  
- Rozšíření příběhu a herních kapitol (*To Be Animal*, *To Be Human* a další).  
- Přidání herních systémů (skóre, postup, schopnosti, power-upy).  
- Vylepšení animací, vizuálních efektů a celkové atmosféry hry.  
- Další modularizace a optimalizace kódu pro snadnější rozšiřování.

---

## Jak spustit

1. Otevři [GeomeTry](https://tanatos09.github.io/GeomeTry/)
2. Hraj a užívej si GeomeTry!  

---

## Kontakt

Pokud máš dotazy, kontaktuj mě na [LinkedIn](https://www.linkedin.com/in/tomasfrank/).

---

*Projekt je stále ve vývoji — více informací brzy!*
