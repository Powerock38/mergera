class Tile {
  static load(list, callback) {
    let nbToLoad = list.length;
    for(let tile of list) {
      let image = new Image();
      image.src = "./tiles/" + tile.id + ".png";
      image.onload = () =>  {
        new Tile(image, tile);
        console.log("Loaded tile " + tile.id);
        --nbToLoad === 0 && callback();
      }
    }
  }

  constructor(image, param) {
    this.image = image;
    //this.name = /[^/]*$/.exec(this.image.src)[0].slice(0, -4);
    for(let p in param) this[p] = param[p];
    Tile.list[this.id] = this;
  }

  draw(ctx, x, y) {
    ctx.drawImage(this.image, x, y, 32, 32);
  }
}
Tile.list = {"":false};
