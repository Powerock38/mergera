class Spritesheet {
  static load(list, callback) {
    let nbToLoad = list.length;
    for(let sprite of list) {
      let image = new Image();
      image.src = "../sprites/" + sprite + ".png";
      image.onload = () =>  {
        new Spritesheet(image, sprite);
        console.log("Loaded sprite " + sprite);
        --nbToLoad === 0 && callback();
      }
    }
  }

  constructor(image, id) {
    this.image = image;
    //this.id = /[^/]*$/.exec(this.image.src)[0].slice(0, -4);
    this.id = id;
    this.width = this.image.width / 32;
    this.height = this.image.height / 32;
    Spritesheet.list[this.id] = this;
  }

  drawFrame(ctx, frame, x, y) {
    let sx = (frame % this.width) || this.width;
    let sy = Math.ceil(frame / this.width);
    ctx.drawImage(this.image, (sx - 1) * 32, (sy - 1) * 32, 32, 32, x, y, 32, 32);
  }
}
Spritesheet.list = {};
