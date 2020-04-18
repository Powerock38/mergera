class Tile {
  static load(list, callback) {
    let nbToLoad = list.length;
    for(let tile of list) {
      if(tile.id === "") {
        new Tile(false, tile);
        console.log("Loaded empty tile");
        --nbToLoad === 0 && callback();
      } else {
        let image = new Image();
        image.src = "./tiles/" + tile.id + ".png";
        image.onload = () =>  {
          new Tile(image, tile);
          console.log("Loaded tile " + tile.id);
          --nbToLoad === 0 && callback();
        }
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
    if(this.image)
      ctx.drawImage(this.image, x * 32, y * 32, 32, 32);
  }
}
Tile.list = {};
