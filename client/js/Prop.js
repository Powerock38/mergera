class Prop {
  static load(list, callback) {
    let nbToLoad = list.length;
    for(let prop of list) {
      let image = new Image();
      image.src = "./props/" + prop + ".png";
      image.onload = () =>  {
        new Prop(image, prop);
        console.log("Loaded prop " + prop);
        --nbToLoad === 0 && callback();
      }
    }
  }

  constructor(image, id) {
    this.image = image;
    this.id = id;
    Prop.list.set(this.id, this);
  }

  draw(x, y) {
    Cell.ctx.drawImage(this.image, x * 32, y * 32);
  }
}
Prop.list = new Map();
