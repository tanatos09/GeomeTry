// ===================================================================
// ENTITYMANAGER.JS - Generický Správce Entit
// ===================================================================
// Účel: Pooling a správa kolekcí podobných entit
//
// Používá se pro:
// - Nepřátelé (enemies.js)
// - Dekorace pozadí (background.js)
// - Sbírané úhly (angles.js - částečně)
//
// Umožňuje:
// - Generování entit v intervalech
// - Pohyb skupiny entit
// - Smazání mimo obrazovku
// - Kreslení všech entit najednou
// ===================================================================

// Export třídy EntityManager
export class EntityManager {
  // ===================================================================
  // KONSTRUKTOR
  // ===================================================================
  
  // Inicializuje správce entit
  // speed: rychlost pohybu entit (pixelů za frame, obvykle 2-3)
  // generateInterval: jak často generovat novou entitu (v fraimech)
  //   Např. 120 = generuj novou entitu každých 120 framů (= 2 sekundy při 60 FPS)
  constructor(speed, generateInterval) {
    this.entities = [];            // Pole všech aktivních entit
    this.frameCount = 0;           // Počítadlo framů (pro interval)
    this.speed = speed;            // Rychlost pohybu entit
    this.generateInterval = generateInterval;  // Interval generování
  }

  // ===================================================================
  // GENEROVÁNÍ ENTIT
  // ===================================================================
  
  // Generuj nové entity v pravidelných intervalech
  // canvasWidth, canvasHeight, floorHeight: rozměry herního pole
  // createEntityCallback: funkce která vytvoří novou entitu
  //   Příklad: (w, h, f) => ({ x: w, y: Math.random() * h, ... })
  generateEntity(canvasWidth, canvasHeight, floorHeight, createEntityCallback) {
    // Inkrementuj počítadlo framů
    this.frameCount++;
    
    // Každých N framů (kde N = generateInterval), vytvoř novou entitu
    // Příklad: generateInterval=120 → každý 120. frame se vytvoří entita
    if (this.frameCount % this.generateInterval === 0) {
      // Zavolej callback kterého předal volající (createBackgroundPattern, createEnemy, atd.)
      const entity = createEntityCallback(canvasWidth, canvasHeight, floorHeight);
      
      // Přidej entitu do pole
      this.entities.push(entity);
    }
  }

  // ===================================================================
  // POHYB ENTIT
  // ===================================================================
  
  // Posun všechny entity doleva (typicky)
  // speedMultiplier: násobitel pro pomalení (default 1 = normální rychlost)
  //   Příklady:
  //   - 1 = normální pohyb (-speed pixelů)
  //   - 0.5 = poloviční pohyb (zpomalení)
  //   - 0.1 = velmi pomalu (téměř zastaveno)
  //   - 0 = úplně zastaveno
  moveEntities(speedMultiplier = 1) {
    // Projdi všechny entity
    this.entities.forEach(e => {
      // Posunout entitu doleva
      // Odečítáme (negativní) protože chceme pohyb doleva (v záporném X směru)
      e.x -= this.speed * speedMultiplier;
    });
  }

  // ===================================================================
  // ÚDRŽBA - SMAZÁNÍ MIMO OBRAZOVKU
  // ===================================================================
  
  // Smaž všechny entity které opustily obrazovku (vlevo)
  // Udržuje seznam entit krátký a paměť čistou
  removeOffscreenEntities() {
    // Keep entities kde: x + size > 0
    // Jinými slovy: smaž jen když jsou zcela mimo obrazovku vlevo
    this.entities = this.entities.filter(e => e.x + (e.size || 0) > 0);
  }

  // ===================================================================
  // KRESLENÍ ENTIT
  // ===================================================================
  
  // Nakresli všechny entity na obrazovku
  // drawCallback: funkce která nakreslí jednu entitu
  //   Příklad: (e) => drawPolygon(e.x, e.y, e.size, e.sides, e.color, e.angle)
  //   Tímto způsobem EntityManager nemusí vědět jak se kreslí entita
  drawEntities(drawCallback) {
    // Projdi všechny entity a zavolej kreslící funkci pro každou
    this.entities.forEach(e => drawCallback(e));
  }
}
