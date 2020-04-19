class Entity {
  constructor(spriteName) {
    this.x = null; // tile coordinates, not pixels
    this.y = null;
    this.z = null;
    this.cell = null;
    this.animX = this.x;
    this.animY = this.y;
    this.facing = D.down;
    this.frame = 2;
    this.speed = 8;
    this.sprite = Spritesheet.list[spriteName];
    this.going = {
      up: 0,
      down: 0,
      left: 0,
      right: 0
    };
  }

  setCell(cell, x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.cell = cell;
  }

  get adjProps() {
    return {
      on:    this.cell.getProp(this.x, this.y, this.z),
      up:    this.cell.getProp(this.x, this.y - 1, this.z),
      down:  this.cell.getProp(this.x, this.y + 1, this.z),
      right: this.cell.getProp(this.x + 1, this.y, this.z),
      left:  this.cell.getProp(this.x - 1, this.y, this.z)
    };
  }

  get adjTiles() {
    return {
      on:    Tile.list[(this.cell.terrain[this.z][this.y]     || "")[this.x]],
      up:    Tile.list[(this.cell.terrain[this.z][this.y - 1] || "")[this.x]],
      down:  Tile.list[(this.cell.terrain[this.z][this.y + 1] || "")[this.x]],
      right: Tile.list[(this.cell.terrain[this.z][this.y]     || "")[this.x + 1]],
      left:  Tile.list[(this.cell.terrain[this.z][this.y]     || "")[this.x - 1]]
    };
  }

  get belowTiles() {
    return {
      on:    Tile.list[((this.cell.terrain[this.z - 1] || "")[this.y]     || "")[this.x]],
      up:    Tile.list[((this.cell.terrain[this.z - 1] || "")[this.y - 1] || "")[this.x]],
      down:  Tile.list[((this.cell.terrain[this.z - 1] || "")[this.y + 1] || "")[this.x]],
      right: Tile.list[((this.cell.terrain[this.z - 1] || "")[this.y]     || "")[this.x + 1]],
      left:  Tile.list[((this.cell.terrain[this.z - 1] || "")[this.y]     || "")[this.x - 1]]
    };
  }

  updateAnimation() {
    let x = this.x * 32;
    let y = this.y * 32;
    if(this.going.up > 0) {
      y += (this.going.up--) * (32 / this.speed) - 32;
      this.frame = (this.going.up % 3) + Entity.df.up - 1;
      if(this.going.up === 0) this.afterMove(D.up);
    } else if(this.going.down > 0) {
      y -= (this.going.down--) * (32 / this.speed) - 32;
      this.frame = (this.going.down % 3) + Entity.df.down - 1;
      if(this.going.down === 0) this.afterMove(D.down);
    } else if(this.going.left > 0) {
      x += (this.going.left--) * (32 / this.speed) - 32;
      this.frame = (this.going.left % 3) + Entity.df.left - 1;
      if(this.going.left === 0) this.afterMove(D.left);
    } else if(this.going.right > 0) {
      x -= (this.going.right--) * (32 / this.speed) - 32;
      this.frame = (this.going.right % 3) + Entity.df.right - 1;
      if(this.going.right === 0) this.afterMove(D.right);
    } else {
      this.frame = Entity.df[this.facing];
    }
    this.animX = x;
    this.animY = y;
  }

  updateTP() {
    for(let tp of this.cell.teleporters) {
      if(this.facing === tp.facing
      && this.z >= tp.z1 && this.z <= tp.z2
      && this.x >= tp.x1 && this.x <= tp.x2
      && this.y >= tp.y1 && this.y <= tp.y2) {
        this.cell.removeEntity(this);
        Cell.list[tp.cell].addEntity(this, tp.x, tp.y, tp.z);
      }
    }
  }

  update() {
    this.updateAnimation();
    this.updateTP();
  }

  draw() {
    this.sprite.drawFrame(Cell.ctx, this.frame, this.animX, this.animY);
  }

  afterMove(dir) {
    if(dir === D.up) {
      this.y--;
    } else if(dir === D.down) {
      this.y++;
    } else if(dir === D.left) {
      this.x--;
    } else if(dir === D.right) {
      this.x++;
    }
    if(this.belowTiles.on && this.belowTiles.on.stairs)
      this.cell.moveEntity(this, this.x, this.y, this.z - 1);
  }

  canMove(dir) {
    for(let going of Object.values(this.going)) {
      if(going > 0) return false;
    }

    if(this.adjProps.on
    && this.adjProps.on.block
    && this.adjProps.on.block[this.adjProps.on.tileNb]
    && this.adjProps.on.block[this.adjProps.on.tileNb].includes(dir))
      return false;

    let can = true;
    for(let d of Object.values(D)) {
      if(dir === d) {
        let od;
             if(d === D.up)    od = D.down;
        else if(d === D.down)  od = D.up;
        else if(d === D.left)  od = D.right;
        else if(d === D.right) od = D.left;

        can = this.adjTiles[d] && this.adjTiles[d] !== Tile.list[""];
        can = can || (this.belowTiles[d] && this.belowTiles[d].stairs);
        if(this.adjProps[d] && this.adjProps[d].block && this.adjProps[d].block[this.adjProps[d].tileNb])
          can = !this.adjProps[d].block[this.adjProps[d].tileNb].includes(od);
        return can;
      }
    }
  }

  move(dir) {
    if(this.facing !== dir) {
      this.facing = dir;
    } else if(this.canMove(dir) || (this.adjTiles.on && this.adjTiles.on.stairs === dir)) {
      this.going = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
      };
      if(dir === D.up) {
        this.going.up = this.speed;
      } else if(dir === D.down) {
        this.going.down = this.speed;
      } else if(dir === D.left) {
        this.going.left = this.speed;
      } else if(dir === D.right) {
        this.going.right = this.speed;
      }
      if(this.adjTiles.on && this.adjTiles.on.stairs === dir) {
        this.cell.moveEntity(this, this.x, this.y, this.z + 1);
      }
    }
  }
}

class Player extends Entity {
  constructor(sprite) {
    super(sprite);
    this.go = {
      up: false,
      down: false,
      left: false,
      right: false
    }
    document.addEventListener("keydown",(e)=>{
           if(e.key === "z" || e.key === "ArrowUp") this.go.up = true;
      else if(e.key === "s" || e.key === "ArrowDown") this.go.down = true;
      else if(e.key === "q" || e.key === "ArrowLeft") this.go.left = true;
      else if(e.key === "d" || e.key === "ArrowRight") this.go.right = true;
    });

    document.addEventListener("keyup",(e)=>{
           if(e.key === "z" || e.key === "ArrowUp") this.go.up = false;
      else if(e.key === "s" || e.key === "ArrowDown") this.go.down = false;
      else if(e.key === "q" || e.key === "ArrowLeft") this.go.left = false;
      else if(e.key === "d" || e.key === "ArrowRight") this.go.right = false;
    });
  }

  update() {
    super.update();

    if(this.go.up) this.move(D.up);
    else if(this.go.down) this.move(D.down);
    else if(this.go.left) this.move(D.left);
    else if(this.go.right) this.move(D.right);
  }
}
Entity.df = {up: 11, down: 2, left: 5, right: 8};
