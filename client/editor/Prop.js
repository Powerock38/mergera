class Prop {
  static load(list, callback) {
    let nbToLoad = list.length;
    for(let prop of list) {
      let image = new Image();
      image.src = "../props/" + prop.id + ".png";
      image.onload = () =>  {
        new Prop(image, prop);
        console.log("Loaded prop " + prop.id);
        --nbToLoad === 0 && callback();
      }
    }
  }

  constructor(image, param) {
    this.image = image;
    this.width = image.width / 32;
    this.height = image.height / 32;

    for(let p in param) this[p] = param[p];
    Prop.list[this.id] = this;
  }

  draw(ctx, x, y) {
    ctx.drawImage(this.image, x * 32, y * 32);
  }
}
Prop.list = {};
