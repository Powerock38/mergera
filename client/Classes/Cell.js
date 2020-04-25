class Cell {
  constructor(id, terrain, props) {
    this.id = id;
    this.terrain = terrain;
    this.props = props;
    this.entities = [];
    Cell.list[this.id] = this;
  }

  draw() {
    for(let z = 0; z < this.terrain.length; z++) {
      if(this.terrain[z]) {
        for(let y = 0; y < this.terrain[z].length; y++) {
          if(this.terrain[z][y]) {
            for(let x = 0; x < this.terrain[z][y].length; x++) {
              if(Tile.list[this.terrain[z][y][x]])
                Tile.list[this.terrain[z][y][x]].draw(x, y);
            }
          }
        }

        if(this.props[z])
          for(let prop of this.props[z])
            Prop.list[prop.id].draw(prop.x, prop.y);

        for(let i in this.entities) {
          let entity = this.entities[i];
          if(entity.z === z)
            entity.draw();
        }
      }
    }
  }
}
Cell.list = [];
