const fs = require('fs');
const sizeOf = require('image-size');

class Prop {
  static load(callback) {
    let list = JSON.parse(fs.readFileSync("./client/loading/props.json"));
    let nbToLoad = list.length;
    for(let prop of list) {
      sizeOf("./client/props/" + prop.id + ".png", (err, dim) => {
        new Prop(prop, dim.width, dim.height);
        console.log("Loaded prop " + prop.id);
        --nbToLoad === 0 && callback();
      });
    }
  }

  constructor(param, width, height) {
    for(let p in param) this[p] = param[p];
    this.width = width / 32;
    this.height = height / 32;
    Prop.list.set(this.id, this);
  }
}
Prop.list = new Map();

module.exports = Prop;
