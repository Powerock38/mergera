class Entity {
  constructor(sprite, cell, x, y, z, id) {
    this.id = id || uuid();
    this.animX = x * 32;
    this.animY = y * 32;
    this.frame = 2;
    this.facing = D.down;
    this.sprite = sprite;
    this.going = {
      up: 0,
      down: 0,
      left: 0,
      right: 0
    };
    this.stats = {
      speed: 8,
    };
    this.setCell(cell, x, y, z);
  }

  setCell(cell, x, y, z) { //override in Player
    this.x = x;
    this.y = y;
    this.z = z;
    if(this.cell !== cell) { //if changing cell
      if(this.cell) this.cell.removeEntity(this.id);
      this.cell = cell;
      cell.addEntity(this);
      return true;
    }
    return false;
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

  get belowProps() {
    return {
      on:    this.cell.getProp(this.x, this.y, this.z - 1),
      up:    this.cell.getProp(this.x, this.y - 1, this.z - 1),
      down:  this.cell.getProp(this.x, this.y + 1, this.z - 1),
      right: this.cell.getProp(this.x + 1, this.y, this.z - 1),
      left:  this.cell.getProp(this.x - 1, this.y, this.z - 1)
    };
  }

  get adjTiles() {
    return {
      on:    (this.cell.terrain[this.z][this.y]     || "")[this.x],
      up:    (this.cell.terrain[this.z][this.y - 1] || "")[this.x],
      down:  (this.cell.terrain[this.z][this.y + 1] || "")[this.x],
      right: (this.cell.terrain[this.z][this.y]     || "")[this.x + 1],
      left:  (this.cell.terrain[this.z][this.y]     || "")[this.x - 1]
    };
  }

  updateAnimation() {
    let x = this.x * 32;
    let y = this.y * 32;
    if(this.going.up > 0) {
      y += (this.going.up--) * (32 / this.stats.speed) - 32;
      this.frame = (this.going.up % 3) + Entity.df.up - 1;
      if(this.going.up === 0) this.afterMove(D.up);
    } else if(this.going.down > 0) {
      y -= (this.going.down--) * (32 / this.stats.speed) - 32;
      this.frame = (this.going.down % 3) + Entity.df.down - 1;
      if(this.going.down === 0) this.afterMove(D.down);
    } else if(this.going.left > 0) {
      x += (this.going.left--) * (32 / this.stats.speed) - 32;
      this.frame = (this.going.left % 3) + Entity.df.left - 1;
      if(this.going.left === 0) this.afterMove(D.left);
    } else if(this.going.right > 0) {
      x -= (this.going.right--) * (32 / this.stats.speed) - 32;
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
        let cell = require("./Cell.js").list[tp.cell];
        this.setCell(cell, tp.x, tp.y, tp.z);
      }
    }
  }

  update() { //override in Player
    this.updateAnimation();
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
    if(this.belowProps.on?.stairs)
      this.z--;
    this.updateTP();
  }

  canMove(dir) {
    for(let going of Object.values(this.going))
      if(going > 0) return false;

    let onProp = this.adjProps.on;
    if(onProp?.stairs === dir)
      return true;

    if(onProp?.block?.[onProp.tileNb]?.includes(dir))
      return false;

    let can = true;
    for(let d of Object.values(D)) {
      if(dir === d) {
        let frontProp = this.adjProps[d];
        can = Boolean(this.adjTiles[d]) || this.belowProps[d]?.stairs;
        if(frontProp?.block?.[frontProp.tileNb])
          can = !frontProp.block[frontProp.tileNb].includes({"up":D.down, "down":D.up, "left":D.right, "right":D.left}[dir]);
        return can;
      }
    }
  }

  move(dir) { //override in Player
    if(this.facing !== dir) {
      this.facing = dir;
    } else if(this.canMove(dir)) {
      this.going = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
      };
      if(dir === D.up) {
        this.going.up = this.stats.speed;
      } else if(dir === D.down) {
        this.going.down = this.stats.speed;
      } else if(dir === D.left) {
        this.going.left = this.stats.speed;
      } else if(dir === D.right) {
        this.going.right = this.stats.speed;
      }
      if(this.adjProps.on?.stairs === dir)
        this.z++;
    }
    this.updateTP();
  }

  //NET CODE
  get initPack() {
    return Object.assign({
      sprite: this.sprite,
    }, this.updatePack);
  }

  get updatePack() {
    return {
      id: this.id,
      animX: this.animX,
      animY: this.animY,
      z: this.z,
      frame: this.frame,
    };
  }
}
Entity.df = {up: 11, down: 2, left: 5, right: 8};

module.exports = Entity;
