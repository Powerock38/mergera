class Tileset {
  constructor(file) {
    this.image = new Image();
    this.image.src = file + ".png";
    this.name = /[^/]*$/.exec(file)[0];
    this.width = this.image.width / 32;
    this.height = this.image.height / 32;
  }

  drawTile(ctx, tile, x, y) {
    let sx = (tile % this.width) || this.width;
    let sy = Math.ceil(tile / this.width);

    ctx.drawImage(this.image, (sx - 1) * 32, (sy - 1) * 32, 32, 32, x, y, 32, 32);
  }
}

class Cell {
  constructor(file, onload) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "./maps/" + file + ".json", false);
    xhr.send(null);
    if(xhr.readyState != 4 || (xhr.status != 200 && xhr.status != 0))
    	throw new Error("Can't load map \"./maps/" + file + "\" (" + xhr.status + ").");
    let data = JSON.parse(xhr.responseText);

    this.tileset = new Tileset("tilesets/" + data.tileset);
    if(onload) {
      this.tileset.image.onload = () => {
        onload();
      };
    }
    this.terrain = data.terrain;
    this.entites = [];
    this.height = this.terrain.length;
    this.width = this.terrain[0].length;
  }

  addEntity(entity) {
    entity.map = this;
    this.entites.push(entity);
  }

  draw() {
    for(let i = 0; i < this.terrain.length; i++) {
      for(let j = 0; j < this.terrain[i].length; j++) {
        this.tileset.drawTile(Cell.ctx, this.terrain[i][j].id, j * 32, i * 32);
      }
    }

    for(let entity of this.entites) {
      entity.draw();
    }
  }
}
