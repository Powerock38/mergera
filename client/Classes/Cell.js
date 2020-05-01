class Cell {
  static load(list, callback) {
    let nbToLoad = list.length;
    for(let cell of list) {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", "./cells/" + cell + ".json", true);
      xhr.onerror = ()=>{
        console.error(xhr.statusText);
      };
      xhr.onload = ()=>{
        let data = JSON.parse(xhr.responseText);
        new Cell(cell, data.terrain, data.props);
        console.log("Loaded cell " + cell);
        --nbToLoad === 0 && callback();
      };
      xhr.send(null);
    }
  }

  constructor(id, terrain, props) {
    this.id = id;
    this.terrain = terrain;
    this.props = props;
    this.entities = [];
    Cell.list[this.id] = this;
  }

  draw(ctrX, ctrY) {
    let cw = Cell.ctx.width / Zoom;
    let ch = Cell.ctx.height / Zoom;

    function isInSight(x, y, width, height) {
      if(x >= ctrX + cw || ctrX >= x + width) return false;
      if(y >= ctrY + ch || ctrY >= y + height) return false;
      return true;
    }

    Cell.ctx.save();
    Cell.ctx.scale(Zoom, Zoom);
    Cell.ctx.translate(-ctrX, -ctrY);

    for(let z = 0; z < this.terrain.length; z++) {
      if(this.terrain[z]) {
        for(let y = Math.floor(ctrY / 32); y < Math.min(this.terrain[z].length, Math.ceil((ctrY + ch) / 32)); y++) {
          if(this.terrain[z][y]) {
            for(let x = Math.floor(ctrX / 32); x < Math.min(this.terrain[z][y].length, Math.ceil((ctrX + cw) / 32)); x++) {
              if(Tile.list[this.terrain[z][y][x]]) {
                Tile.list[this.terrain[z][y][x]].draw(x, y);
              }
            }
          }
        }

        if(this.props[z])
          for(let prop of this.props[z])
            if(isInSight(prop.x * 32, prop.y * 32, Prop.list[prop.id].image.width, Prop.list[prop.id].image.height)) {
              Prop.list[prop.id].draw(prop.x, prop.y);
            }

        for(let i in this.entities) {
          let entity = this.entities[i];
          if(entity.z === z && isInSight(entity.animX, entity.animY, entity.sprite.width * 32, entity.sprite.height * 32)) {
            entity.draw();
          }
        }
      }
    }
    Cell.ctx.restore();
  }
}
Cell.list = [];
