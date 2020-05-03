class Projectile {
  constructor(ownerId, sprite, cell, x, y, z, direction, damage, id) {
    this.id = id || uuid();
    this.ownerId = ownerId;
    this.animX = x * 32;
    this.animY = y * 32;
    this.sprite = sprite;
    this.damage = damage;
    this.facing = direction;
    this.going = null;
    this.stats = {
      speed: 12,
    };
    this.x = x;
    this.y = y;
    this.z = z;
    this.cell = cell;
    cell.addEntity(this);
    this.move(this.facing);
  }

  get adjEntities() {
    return {
      on:    this.cell.getEntity(this.x, this.y, this.z),
      up:    this.cell.getEntity(this.x, this.y - 1, this.z),
      down:  this.cell.getEntity(this.x, this.y + 1, this.z),
      right: this.cell.getEntity(this.x + 1, this.y, this.z),
      left:  this.cell.getEntity(this.x - 1, this.y, this.z)
    };
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
      up:    this.cell.terrain[this.z][this.y - 1]?.[this.x],
      down:  this.cell.terrain[this.z][this.y + 1]?.[this.x],
      right: this.cell.terrain[this.z][this.y]?.[this.x + 1],
      left:  this.cell.terrain[this.z][this.y]?.[this.x - 1]
    };
  }

  updatePosition() {
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
      if(this.animX <= (this.x - 1) * 32) {
        this.going = null;
        this.afterMove(D.left);
      }
    } else if(this.going === D.right) {
      this.animX += this.stats.speed;
      if(this.animX >= (this.x + 1) * 32) {
        this.going = null;
        this.afterMove(D.right);
      }
    }
  }

  update() {
    this.updatePosition();
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
    this.animX = this.x * 32;
    this.animY = this.y * 32;
    this.move(dir);
  }

  move(dir) {
    let entityOn = this.cell.getEntity(this.x, this.y, this.z);
    if(entityOn && entityOn.hp && entityOn.id !== this.ownerId) {
      this.remove();
      entityOn.takeDamage(this.damage);
    } else if(this.canMove(dir)) {
      this.going = dir;
    } else {
      this.remove();
    }
  }

  canMove(dir) {
    if(this.going) return false;

    let onProp = this.adjProps.on;
    if(onProp?.block?.[onProp.tileNb]?.includes(dir))
      return false;

    let can = true;
    let frontProp = this.adjProps[dir];
    can = Boolean(this.adjTiles[dir]);
    if(frontProp?.block?.[frontProp.tileNb]) {
      let od = {"up":D.down, "down":D.up, "left":D.right, "right":D.left}[dir];
      can = !frontProp.block[frontProp.tileNb].includes(od);
    }
    return can;
  }

  remove() {
    this.cell.removeEntity(this.id);
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
    };
  }
}

module.exports = Projectile;
