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
  {id:"gun", cd: 1000, use:(player)=>{
    new Projectile("bullet", player.cell, player.x, player.y, player.z, player.facing);
  }},
]);

module.exports = Item;
