const Projectile = require("./Projectile.js");
const Entity = require("./Entity.js");

class Item {
  static load(list) {
    for(let item of list) {
      new Item(item);
    }
  }

  constructor(item) {
    for(let i in item) this[i] = item[i];
    Item.list.set(this.id, this);
  }
}
Item.list = new Map();

Item.load([
  {id:"boots", stats:{speed: 4}},
  {id:"gun", swing: 5, cd: 9, use:(player)=>{
    if(player.inventory.removeItem("ammo")) {
      let front = player.frontXY;
      new Projectile(player.id, "bullet", player.cell, front.x, front.y, player.z, player.facing, 10);
    }
  }},
  {id:"sword", swing: 5, cd: 15, use:(player)=>{
    player.attack(10);
  }},
  {id:"neko-egg", cd: 30, use:(player)=>{
    if(player.inventory.removeItem("neko-egg"))
      new Entity(Entity.loadList["aquaneko"], player.cell, player.x, player.y, player.z);
  }},
]);

module.exports = Item;
