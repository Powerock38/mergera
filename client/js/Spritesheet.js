class Spritesheet {
  static load(callback) {
    fetch("./loading/sprites.json").then(response => response.json())
    .then(list => {
      let nbToLoad = list.length;
      for(const sprite of list) {
        let image = new Image();
        image.src = "./sprites/" + sprite + ".png";
        image.onload = () =>  {
          new Spritesheet(image, sprite);
          console.log("Loaded sprite " + sprite);
          --nbToLoad === 0 && callback();
        }
      }
    });
  }

  constructor(image, id) {
    this.image = image;
    this.id = id;
    this.width = this.image.naturalWidth / 32;
    this.height = this.image.naturalHeight / 32;
    Spritesheet.list.set(this.id, this);
  }

  drawFrame(frame, x, y) {
    let sx = (frame % this.width) || this.width;
    let sy = Math.ceil(frame / this.width);
    CTX.drawImage(this.image, (sx - 1) * 32, (sy - 1) * 32, 32, 32, x, y, 32, 32);
  }

  nextFrame(frame, dir) {
    return Spritesheet.frames[dir][(Spritesheet.frames[dir].indexOf(frame) + 1) % 3];
  }

  stillFrame(dir) {
    return Spritesheet.frames[dir][1];
  }
}
Spritesheet.list = new Map();
Spritesheet.frames = {
  up: [10, 11, 12],
  down: [1, 2, 3],
  left: [4, 5, 6],
  right: [7, 8, 9]
}
