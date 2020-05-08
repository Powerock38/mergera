class Prop {
  static load(callback) {
    fetch("./loading/props.json").then(response => response.json())
    .then(list => {
      let nbToLoad = list.length;
      for(const prop of list) {
        let image = new Image();
        image.src = "./props/" + prop.id + ".png";
        image.onload = () =>  {
          new Prop(image, prop.id);
          console.log("Loaded prop " + prop.id);
          --nbToLoad === 0 && callback();
        }
      }
    });
  }

  constructor(image, id) {
    this.image = image;
    this.id = id;
    Prop.list.set(this.id, this);
  }

  draw(x, y) {
    CTX.drawImage(this.image, x * 32, y * 32);
  }
}
Prop.list = new Map();
