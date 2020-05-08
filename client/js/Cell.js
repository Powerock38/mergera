class Cell {
  static load(callback) {
    fetch("./loading/cells.json").then(response => response.json())
    .then(list => {
      let nbToLoad = list.length;
      for(const cell of list) {
        fetch("./cells/" + cell + ".json").then(response => response.json())
        .then(data => {
          new Cell(cell, data.terrain, data.props, data.sky);
          console.log("Loaded cell " + cell);
          --nbToLoad === 0 && callback();
        });
      }
    });
  }

  constructor(id, terrain, props, sky) {
    this.id = id;
    this.terrain = terrain;
    this.props = props;
    this.sky = sky;
    this.entities = new Map();
    Cell.list.set(this.id, this);
  }

  draw(ctrX, ctrY) {
    let cw = CTX.width / Zoom;
    let ch = CTX.height / Zoom;

    const isInSight = (x, y, width, height)=>{
      if(x >= ctrX + cw || ctrX >= x + width) return false;
      if(y >= ctrY + ch || ctrY >= y + height) return false;
      return true;
    }

    CTX.translate(-ctrX, -ctrY);

    for(let z = 0; z < this.terrain.length; z++) {
      if(this.terrain[z]) {
        for(let y = Math.floor(ctrY / 32); y < Math.min(this.terrain[z].length, Math.ceil((ctrY + ch) / 32)); y++) {
          if(this.terrain[z][y]) {
            for(let x = Math.floor(ctrX / 32); x < Math.min(this.terrain[z][y].length, Math.ceil((ctrX + cw) / 32)); x++) {
              if(Tile.list.has(this.terrain[z][y][x]))
                Tile.list.get(this.terrain[z][y][x]).draw(x, y);
            }
          }
        }

        if(this.props[z])
          for(let prop of this.props[z]) {
            const propObj = Prop.list.get(prop.id);
            if(isInSight(prop.x * 32, prop.y * 32, propObj.image.width, propObj.image.height)) {
              propObj.draw(prop.x, prop.y);
            }
          }

        for(let entity of this.entities.values()) {
          if(entity.z === z && isInSight(entity.animX, entity.animY, entity.sprite.width * 32, entity.sprite.height * 32)) {
            entity.draw();
          }
        }
      }
    }

    // if(this.sky) {
    //   const now = new Date(new Date().toUTCString().substr(0, 25));
    //   //const x = now.getHours();
    //   //const lightLevel = (x-4)/Math.sqrt(4*x*x - 32*x + 66.9) + (-x-4)/Math.sqrt(4*x*x + 32*x + 66.9);
    //   const lightLevel = (x-4)/Math.sqrt((2*x-8)*(2*x-8)+2.9) + (-x-4)/Math.sqrt((-2*x-8)*(-2*x-8)+2.9);
    //   console.log(lightLevel);
    //   CTX.fillStyle = "rgba(0, 0, 0, "+lightLevel+")";
    //   CTX.fillRect(0, 0, CTX.width, CTX.height);
    // }

    CTX.translate(ctrX, ctrY);
  }
}
Cell.list = new Map();
