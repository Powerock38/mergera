class Cell {
  constructor(file) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "../cells/"+file+".json", false);
    xhr.send(null);
    if(xhr.readyState != 4 || (xhr.status != 200 && xhr.status != 0))
    	throw new Error("Can't load cell " + file + " (" + xhr.status + ").");
    let data = JSON.parse(xhr.responseText);

    this.terrain = data.terrain;
    this.props = data.props;
    this.entities = data.entities;
    this.teleporters = data.teleporters;

    Cell.list[this.id] = this;
  }

  getProp(x, y, z) {
    if(this.props[z])
    for(let prop of this.props[z]) {
      let propObj = Prop.list[prop.id];
      if(x >= prop.x && x < prop.x + propObj.width
      && y >= prop.y && y < prop.y + propObj.height) {
        let tileNb = (x - prop.x) + propObj.width * (y - prop.y);
        return {...propObj, tileNb: tileNb};
      }
    }
  }

  draw() {
    for(let z = 0; z < this.terrain.length; z++) {
      this.drawLevel(z);
    }
  }

  drawLevel(z) {
    if(this.terrain[z]) {
      for(let y = 0; y < this.terrain[z].length; y++) {
        if(this.terrain[z][y]) {
          for(let x = 0; x < this.terrain[z][y].length; x++) {
            if(Tile.list[this.terrain[z][y][x]])
              Tile.list[this.terrain[z][y][x]].draw(Cell.ctx, x, y);
          }
        }
      }

      if(this.props[z])
        for(let prop of this.props[z])
          Prop.list[prop.id].draw(Cell.ctx, prop.x, prop.y);

      // for(let i in this.entities) {
      //   let entity = this.entities[i];
      //   if(entity.z === z)
      //     entity.draw();
      // }
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
Cell.list = {};
