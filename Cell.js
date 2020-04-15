class Cell {
  constructor(file) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "./cells/" + file + ".json", false);
    xhr.send(null);
    if(xhr.readyState != 4 || (xhr.status != 200 && xhr.status != 0))
    	throw new Error("Can't load cell \"./cells/" + file + "\" (" + xhr.status + ").");
    let data = JSON.parse(xhr.responseText);

    this.terrain = data.terrain;
    this.entites = [];
    // this.height = this.terrain.length;
    // this.width = this.terrain[0].length;
  }

  addEntity(entity, x, y, z) {
    if(z === undefined) z = this.terrain.defaultLevel;
    entity.setCell(this, x, y, z);
    if(this.entites[z] === undefined) this.entites[z] = [];
    this.entites[z].push(entity);
  }

  draw() {
    for(let z = 0; z < this.terrain.length; z++) {
      for(let y = 0; y < this.terrain[z].length; y++) {
        for(let x = 0; x < this.terrain[z][y].length; x++) {
          if(Tile.notNull(this.terrain[z][y][x]))
            Tile.list[this.terrain[z][y][x]].draw(Cell.ctx, x * 32, y * 32);
        }
      }
      if(this.entites[z] !== undefined)
        for(let entity of this.entites[z]) {
          entity.update();
          entity.draw();
        }
    }
  }

  // drawTileStack(x, y) {
  //   for(let z = 0; z < this.terrain.length; z++) {
  //     // for(let entity of this.entites[z]) {
  //     //   if(entity.x = x && entity.y = y)
  //     //     entity.draw();
  //     // }
  //     if(Tile.notNull(this.terrain[z][y][x]))
  //       Tile.list[this.terrain[z][y][x]].draw(Cell.ctx, x * 32, y * 32);
  //   }
  // }
}
