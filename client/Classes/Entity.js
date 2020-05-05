class Entity {
  constructor(pack) {
    this.animX = pack.animX;
    this.animY = pack.animY;
    this.z = pack.z;
    this.going = pack.going;
    this.facing = pack.facing;
    this.swinging = pack.swinging;
    this.sprite = Spritesheet.list[pack.sprite];
    this.frame;
    this.frameTick = 0;
    this.swingAngle = 0;
  }

  draw() {
    if(this.going) {
      if(this.frameTick++ === 0)
        this.frame = this.sprite.nextFrame(this.frame, this.going);
      if(this.frameTick === 5)
        this.frameTick = 0;
    } else this.frame = this.sprite.stillFrame(this.facing);

    if(this.swinging && this.swinging.id !== null && Item.list[this.swinging.id]) {
      let angle = this.swingAngle + Entity.dirToInt[this.facing] * (Math.PI / 2);
      Item.list[this.swinging.id].drawSwing(angle, this.animX + 16, this.animY + 16);
      this.swingAngle += (Math.PI/2) / this.swinging.tick;
    } else this.swingAngle = 0;

    this.sprite.drawFrame(this.frame, this.animX, this.animY);
  }
}
Entity.dirToInt = {
  "up":0,
  "right":1,
  "down":2,
  "left": 3,
};
