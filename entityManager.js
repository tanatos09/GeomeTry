//sprava kolekce entit
export class EntityManager {
  constructor(speed, generateInterval) {
    this.entities = []; //pole vsech entit
    this.frameCount = 0; //pocitadlo snimku
    this.speed = speed; //rychlost pohybu
    this.generateInterval = generateInterval; // interval generovani
  }

  //funkce pro generovani entit
  generateEntity(canvasWidth, canvasHeight, floorHeight, createEntityCallback) {
    this.frameCount++; //zvyseni pocitadla
    if (this.frameCount % this.generateInterval === 0) {
      const entity = createEntityCallback(canvasWidth, canvasHeight, floorHeight);
      this.entities.push(entity); //pridani entity do pole
    }
  }

  //posun entit
  moveEntities() {
    this.entities.forEach(e => {
      e.x -= this.speed; //posun entit doleva
    });
  }

  //odstraneni entity mimo obrazovku
  removeOffscreenEntities() {
    this.entities = this.entities.filter(e => e.x + (e.size || 0) > 0);
  }

  //vykresli vsechny entity
  drawEntities(drawCallback) {
    this.entities.forEach(e => drawCallback(e));
  }
}
