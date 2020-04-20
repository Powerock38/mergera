class Cell {
  constructor(file) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "./cells/" + file + ".json", false);
    xhr.send(null);
    if(xhr.readyState != 4 || (xhr.status != 200 && xhr.status != 0))
    	throw new Error("Can't load cell \"./cells/" + file + "\" (" + xhr.status + ").");
    let data = JSON.parse(xhr.responseText);

    this.id = file;
    this.defaultLevel = data.defaultLevel;
    this.terrain = data.terrain;
    this.props = data.props;
    this.rawEntities = data.entities;
    this.entities = [];
    for(let z in this.terrain)
      this.entities[z] = [];
    for(let entity of this.rawEntities)
      this.addEntity(new Entity(entity.sprite), entity.x, entity.y, entity.z);

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

  addEntity(entity, x, y, z) {
    if(z === undefined) z = this.defaultLevel;
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

      if(this.entities[z]) {
        for(let entity of this.entities[z]) {
          entity.update();
          entity.draw();
        }
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
Cell.list = {};
