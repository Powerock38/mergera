const D = {up: 11, down: 2, left: 5, right: 8};

class Entity {
  constructor(sprite, x, y) {
    this.x = x; // tile coordinates, not pixels
    this.y = y;
    this.frame = 2;
    this.map = null;

    this.facing = D.down;

    this.speed = 8;
    this.going = {
      up: 0,
      down: 0,
      left: 0,
      right: 0
    };

    this.sprite = new Tileset("sprites/" + sprite);
  }

  get adjTiles() {
    return {
      up: (this.map.terrain[this.y - 1] || {})[this.x],
      down: (this.map.terrain[this.y + 1] || {})[this.x],
      right: (this.map.terrain[this.y] || {})[this.x + 1],
      left: (this.map.terrain[this.y] || {})[this.x - 1]
    };
  }

  draw() {
    let x = this.x * 32;
    let y = this.y * 32;
    if(this.going.up > 0) {
      y += (this.going.up--) * (32 / this.speed);
      this.frame = (this.going.up % 3) + D.up - 1;
    } else if(this.going.down > 0) {
      y -= (this.going.down--) * (32 / this.speed);
      this.frame = (this.going.down % 3) + D.down - 1;
    } else if(this.going.left > 0) {
      x += (this.going.left--) * (32 / this.speed);
      this.frame = (this.going.left % 3) + D.left - 1;
    } else if(this.going.right > 0) {
      x -= (this.going.right--) * (32 / this.speed);
      this.frame = (this.going.right % 3) + D.right - 1;
    } else {
      this.frame = this.facing;
    }
    this.sprite.drawTile(Cell.ctx, this.frame, x, y);
    //console.log(this.adjTiles);
  }

  canMove(dir) {
    for(let go of Object.values(this.going)) {
      if(go > 0) return false;
    }

    if(dir === D.up) {
      return this.adjTiles.up !== undefined && !this.adjTiles.up.wall;
    } else if(dir === D.down) {
      return this.adjTiles.down !== undefined && !this.adjTiles.down.wall;
    } else if(dir === D.left) {
      return this.adjTiles.left !== undefined && !this.adjTiles.left.wall;
    } else if(dir === D.right) {
      return this.adjTiles.right !== undefined && !this.adjTiles.right.wall;
    }
  }

  move(dir) {
    this.facing = dir;
    if(this.canMove(dir)) {
      this.going = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
      };
      if(dir === D.up) {
        this.going.up = this.speed;
        this.y--;
      } else if(dir === D.down) {
        this.going.down = this.speed;
        this.y++;
      } else if(dir === D.left) {
        this.going.left = this.speed;
        this.x--;
      } else if(dir === D.right) {
        this.going.right = this.speed;
        this.x++;
      }
    }
  }
}

class Follower extends Entity {
  constructor(player) {
    super("dog", player.x, player.y);
  }

  update() {
    // mannhattan : abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
  }
}

class Player extends Entity {
  constructor() {
    super("player", 0, 0);
    document.addEventListener("keydown",(e)=>{
      if(e.key === "z") this.move(D.up);
      else if(e.key === "s") this.move(D.down);
      else if(e.key === "q") this.move(D.left);
      else if(e.key === "d") this.move(D.right);
    });
  }
}
