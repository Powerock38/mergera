class Cell {
  constructor(file) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", file, false);
    xhr.send(null);
    if(xhr.readyState != 4 || (xhr.status != 200 && xhr.status != 0))
    	throw new Error("Can't load cell " + file + " (" + xhr.status + ").");
    let data = JSON.parse(xhr.responseText);

    this.terrain = data.terrain;
    this.props = data.props;
    this.entities = data.entities;
    this.teleporters = data.teleporters;
  }

  getProp(x, y, z) {
    for(const prop of this.props) {
      const propObj = Prop.list.get(prop.id);
      if(x >= prop.x && x < prop.x + propObj.width
      && y >= prop.y && y < prop.y + propObj.height) {
        const tileNb = (x - prop.x) + propObj.width * (y - prop.y);
        if(z === propObj.getZ(prop.z, tileNb))
          return {...propObj, ...prop, tileNb: tileNb, index: this.props.indexOf(prop)};
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
              Tile.list[this.terrain[z][y][x]].draw(CTX, x, y);
          }
        }
      }

      for(let prop of this.props) {
        const propObj = Prop.list.get(prop.id);
        const tiles = propObj.width * propObj.height;
        for(let tileNb = 0; tileNb < tiles; tileNb++) {
          if(z === propObj.getZ(prop.z, tileNb)) {
            propObj.draw(tileNb, prop.x, prop.y);
          }
        }
      }

      // draw entities maybe one day
    }
  }
}
