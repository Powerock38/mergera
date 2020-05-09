class Entity {
  constructor(entity, cell, x, y, z, id) {
    this.id = id || uuid();
    this.facing = D.down;
    this.going = null;
    this.can = {
      tp: true,
    };
    this.sprite = entity.sprite;
    this.stats = {
      speed: entity.speed,
      maxHP: entity.hp,
    };
    this.hp = entity.hp;
    this.setCell(cell, x, y, z);
  }

  setCell(cell, x, y, z) { //override in Player
    this.x = x;
    this.y = y;
    this.z = z;
    this.animX = this.x * 32;
    this.animY = this.y * 32;
    // this.animZ = this.z * 32;
    if(this.cell !== cell) { //if changing cell
      if(this.cell) this.cell.removeEntity(this.id);
      this.cell = cell;
      cell.addEntity(this);
      return true;
    }
    return false;
  }

  remove() {
    this.cell.removeEntity(this.id);
  }

  takeDamage(damage) {
    this.hp -= damage;
    if(this.hp <= 0)
      this.remove();
  }

  attack(damage) {
    let front = this.frontXY;
    this.cell.getEntity(front.x, front.y, this.z)?.takeDamage?.(damage);
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
      on:    this.cell.terrain[this.z]?.[this.y]?.[this.x],
      up:    this.cell.terrain[this.z]?.[this.y - 1]?.[this.x],
      down:  this.cell.terrain[this.z]?.[this.y + 1]?.[this.x],
      right: this.cell.terrain[this.z]?.[this.y]?.[this.x + 1],
      left:  this.cell.terrain[this.z]?.[this.y]?.[this.x - 1]
    };
  }

  get frontXY() {
         if(this.facing === D.up)    return {x: this.x,     y: this.y - 1};
    else if(this.facing === D.down)  return {x: this.x,     y: this.y + 1};
    else if(this.facing === D.right) return {x: this.x + 1, y: this.y};
    else if(this.facing === D.left)  return {x: this.x - 1, y: this.y};
  }

  update() { //override in Player
    this.updatePosition();
  }

  updateTP() {
    for(let tp of this.cell.teleporters) {
      if(this.facing === tp.facing
      && this.z >= tp.z1 && this.z <= tp.z2
      && this.x >= tp.x1 && this.x <= tp.x2
      && this.y >= tp.y1 && this.y <= tp.y2) {
        if(this.can.tp) {
          this.can.tp = false;
          setTimeout(()=>{
            this.can.tp = true;
          }, 500);
          let cell = require("./Cell.js").list.get(tp.cell);
          this.setCell(cell, tp.x, tp.y, tp.z);
        }
      }
    }
  }

  updatePosition() {
    const frontProp = this.adjProps[this.facing];
    if(this.going === D.up) {
      this.animY -= this.stats.speed;
      if(this.animY <= (this.y - 1) * 32) {
        this.going = null;
        this.afterMove(D.up);
      }
    } else if(this.going === D.down) {
      this.animY += this.stats.speed;
      if(this.animY >= (this.y + 1) * 32) {
        this.going = null;
        this.afterMove(D.down);
      }
    } else if(this.going === D.left) {
      this.animX -= this.stats.speed;
      if(frontProp?.stairs === D.left)
        this.animY -= this.stats.speed;
      else if(this.adjProps.on?.stairs === D.right)
        this.animY += this.stats.speed;
      if(this.animX <= (this.x - 1) * 32) {
        this.going = null;
        this.afterMove(D.left);
      }
    } else if(this.going === D.right) {
      this.animX += this.stats.speed;
      if(frontProp?.stairs === D.right)
        this.animY -= this.stats.speed;
      else if(this.adjProps.on?.stairs === D.left)
        this.animY += this.stats.speed;
      if(this.animX >= (this.x + 1) * 32) {
        this.going = null;
        this.afterMove(D.right);
      }
    }
  }

  afterMove(dir) {
    if(dir === D.up || dir === D.down) {
      if(dir === D.up) this.y--;
      else if(dir === D.down) this.y++;

      if(this.belowProps.on?.stairs)
        this.z--;

    } else if(dir === D.left || dir === D.right) {
      if(dir === D.left) this.x--;
      else if(dir === D.right) this.x++;

      if(this.adjProps[Do[dir]]?.stairs === Do[dir] && this.adjProps[Do[dir]]?.offset === 1) {
        this.y++;
        this.z--;
      }
    }
    this.animX = this.x * 32;
    this.animY = this.y * 32;
    this.updateTP();
  }

  move(dir) { //override in Player
    if(this.facing !== dir) {
      this.facing = dir;
    } else if(this.canMove(dir)) {
      if((dir === D.up || dir === D.down) && this.adjProps.on?.stairs === dir)
        this.z++;
      else if((dir === D.left || dir === D.right)
          && this.adjProps[dir]?.stairs === dir
          && !this.adjProps[dir]?.offset) {
          this.y--;
          this.z++;
      }
      this.going = dir;
    }
    this.updateTP();
  }

  canMove(dir) {
    if(this.going) return false;

    let onProp = this.adjProps.on;
    if(onProp?.stairs === dir || onProp?.stairs === Do[dir])
      return true;

    if(onProp?.block?.[onProp.tileNb]?.includes(dir))
      return false;

    let can = true;
    let frontProp = this.adjProps[dir];
    can = Boolean(this.adjTiles[dir]) || this.belowProps[dir]?.stairs;
    if(frontProp?.block?.[frontProp.tileNb]) {
      can = !frontProp.block[frontProp.tileNb].includes(Do[dir]);
    }
    return can;
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
      going: this.going,
      facing: this.facing,
      swinging: this.swinging,
    };
  }
}

Entity.loadList = {
  dog: {sprite:"dog", hp:10, speed:6},
  aquaneko: {sprite:"aquaneko", hp:20, speed:6},
  skeleton: {sprite:"skeleton", hp:20, speed:4},
};

module.exports = Entity;
