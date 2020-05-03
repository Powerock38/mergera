const Projectile = require("./Projectile.js");

class Item {
  static load(list) {
    for(let item of list) {
      new Item(item);
    }
  }

  constructor(item) {
    this.id = item.id;
    this.stats = [];
    this.use = item.use;
    this.cooldown = item.cd;
    for(let i in item.stats) this.stats[i] = item.stats[i];
    Item.list[this.id] = this;
  }
}
Item.list = [];

Item.load([
  {id:"boots", stats:{speed: 1}},
  {id:"gun", cd: 100, use:(player)=>{
    let front = player.frontXY;
    new Projectile(player.id, "bullet", player.cell, front.x, front.y, player.z, player.facing, 10);
  }},
]);

module.exports = Item;
