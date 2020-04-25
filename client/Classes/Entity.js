class Entity {
  constructor(pack) {
    this.animX = pack.animX;
    this.animY = pack.animY;
    this.z = pack.z;
    this.frame = pack.frame;
    this.sprite = Spritesheet.list[pack.sprite];
  }

  draw() {
    this.sprite.drawFrame(this.frame, this.animX, this.animY);
  }
}
