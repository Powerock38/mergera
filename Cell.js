class Cell {
  constructor(file) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "./cells/" + file + ".json", false);
    xhr.send(null);
    if(xhr.readyState != 4 || (xhr.status != 200 && xhr.status != 0))
    	throw new Error("Can't load cell \"./cells/" + file + "\" (" + xhr.status + ").");
    let data = JSON.parse(xhr.responseText);

    this.terrain = data.terrain;
    this.entities = [];
    for(let i = 0; i < this.terrain.length; i++) {
      this.entities[i] = [];
    }
    // this.height = this.terrain.length;
    // this.width = this.terrain[0].length;
  }

  addEntity(entity, x, y, z) {
    if(z === undefined) z = this.terrain.defaultLevel;
    entity.setCell(this, x, y, z);
    this.entities[z].push(entity);
  }

  removeEntity(entity) {
    for(let i = 0; i < this.entities[entity.z].length; i++) {
      if(entity === this.entities[entity.z][i]) {
        this.entities[entity.z].splice(i, 1);
      }
    }
  }

  moveEntity(entity, x, y, z) {
    this.removeEntity(entity);
    this.addEntity(entity, x, y, z);
  }

  draw() {
    for(let z = 0; z < this.terrain.length; z++) {
      for(let y = 0; y < this.terrain[z].length; y++) {
        for(let x = 0; x < this.terrain[z][y].length; x++) {
          if(Tile.list[this.terrain[z][y][x]])
            Tile.list[this.terrain[z][y][x]].draw(Cell.ctx, x * 32, y * 32);
        }
      }
      for(let entity of this.entities[z]) {
        entity.update();
        entity.draw();
      }
    }
  }

  // drawTileStack(x, y) {
  //   for(let z = 0; z < this.terrain.length; z++) {
  //     // for(let entity of this.entities[z]) {
  //     //   if(entity.x = x && entity.y = y)
  //     //     entity.draw();
  //     // }
  //     if(Tile.notNull(this.terrain[z][y][x]))
  //       Tile.list[this.terrain[z][y][x]].draw(Cell.ctx, x * 32, y * 32);
  //   }
  // }
}
