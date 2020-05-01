class Entity {
  constructor(pack) {
    this.animX = pack.animX;
    this.animY = pack.animY;
    this.z = pack.z;
    this.going = pack.going;
    this.facing = pack.facing;
    this.sprite = Spritesheet.list[pack.sprite];
    this.frame;
    this.frameTick = 0;
  }

  draw() {
    if(this.going) {
      if(this.frameTick++ === 0)
        this.frame = this.sprite.nextFrame(this.frame, this.going);
      if(this.frameTick === 5)
        this.frameTick = 0;
    } else this.frame = this.sprite.stillFrame(this.facing);
    this.sprite.drawFrame(this.frame, this.animX, this.animY);
  }
}
