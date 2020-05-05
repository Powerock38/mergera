const Projectile = require("./Projectile.js");

class Item {
  static load(list) {
    for(let item of list) {
      new Item(item);
    }
  }

  constructor(item) {
    for(let i in item) this[i] = item[i];
    Item.list[this.id] = this;
  }
}
Item.list = [];

Item.load([
  {id:"boots", stats:{speed: 1}},
  {id:"gun", swing: 5, cd: 9, use:(player)=>{
    let front = player.frontXY;
    new Projectile(player.id, "bullet", player.cell, front.x, front.y, player.z, player.facing, 10);
  }},
  {id:"sword", swing: 5, cd: 15, use:(player)=>{
    player.attack(10);
  }},
]);

module.exports = Item;
