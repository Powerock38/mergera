class Prop {
  static load(callback) {
    fetch("../loading/props.json").then(response => response.json())
    .then(list => {
      let nbToLoad = list.length;
      for(const prop of list) {
        let image = new Image();
        image.src = "../props/" + prop.id + ".png";
        image.onload = () =>  {
          new Prop(image, prop);
          console.log("Loaded prop " + prop.id);
          --nbToLoad === 0 && callback();
        }
      }
    });
  }

  constructor(image, prop) {
    this.image = image;
    this.width = image.width / 32;
    this.height = image.height / 32;
    this.id = prop.id;
    this.zOffset = prop.zOffset;
    Prop.list.set(this.id, this);
  }

  getZ(z, tileNb) {
    if(this.zOffset?.[tileNb])
      return z + this.zOffset[tileNb];
    else
      return z;
  }

  draw(tileNb, x, y) {
    let sx = (((tileNb + 1) % this.width) || this.width) - 1;
    let sy = Math.ceil((tileNb + 1) / this.width) - 1;
    CTX.drawImage(this.image, sx * 32, sy * 32, 32, 32, (x + sx) * 32, (y + sy) * 32, 32, 32);
  }
}
Prop.list = new Map();
