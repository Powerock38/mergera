class Cell {
  constructor(id, terrain, props) {
    this.id = id;
    this.terrain = terrain;
    this.props = props;
    this.entities = [];
    Cell.list[this.id] = this;
  }

  draw(ctrX, ctrY) {
    var tilesDrawn = 0;
    var propsDrawn = 0;
    var entitiesDrawn = 0;
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
                tilesDrawn++;
              }
            }
          }
        }

        if(this.props[z])
          for(let prop of this.props[z])
            if(isInSight(prop.x * 32, prop.y * 32, Prop.list[prop.id].image.width, Prop.list[prop.id].image.height)) {
              Prop.list[prop.id].draw(prop.x, prop.y);
              propsDrawn++;
            }

        for(let i in this.entities) {
          let entity = this.entities[i];
          if(entity.z === z && isInSight(entity.animX, entity.animY, entity.sprite.width * 32, entity.sprite.height * 32)) {
            entity.draw();
            entitiesDrawn++;
          }
        }
      }
    }
    //console.log(tilesDrawn + " tiles, " + propsDrawn + " props, " + entitiesDrawn + " entities");
    Cell.ctx.restore();
  }
}
Cell.list = [];
