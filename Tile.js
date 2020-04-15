class Tile {
  static loadList(list, callback) {
    let nbToLoad = list.length;
    for(let tile of list) {
      let image = new Image();
      image.src = "./tiles/" + tile + ".png";
      image.onload = () =>  {
        new Tile(image);
        console.log("Loaded tile " + tile);
        --nbToLoad === 0 && callback();
      }
    }
  }

  static notNull(string) {
    return !(string === "" || string === undefined || string === null);
  }

  constructor(image) {
    this.image = image;
    this.name = /[^/]*$/.exec(this.image.src)[0].slice(0, -4);
    Tile.list[this.name] = this;
  }

  draw(ctx, x, y) {
    ctx.drawImage(this.image, x, y, 32, 32);
  }
}
Tile.list = {};
