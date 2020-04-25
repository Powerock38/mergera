class Spritesheet {
  static load(list, callback) {
    let nbToLoad = list.length;
    for(let sprite of list) {
      let image = new Image();
      image.src = "./sprites/" + sprite + ".png";
      image.onload = () =>  {
        new Spritesheet(image, sprite);
        console.log("Loaded sprite " + sprite);
        --nbToLoad === 0 && callback();
      }
    }
  }

  constructor(image, id) {
    this.image = image;
    this.id = id;
    this.width = this.image.naturalWidth / 32;
    this.height = this.image.naturalHeight / 32;
    Spritesheet.list[this.id] = this;
  }

  drawFrame(frame, x, y) {
    let sx = (frame % this.width) || this.width;
    let sy = Math.ceil(frame / this.width);
    Cell.ctx.drawImage(this.image, (sx - 1) * 32, (sy - 1) * 32, 32, 32, x, y, 32, 32);
  }
}
Spritesheet.list = {};
