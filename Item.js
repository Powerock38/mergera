class Item {
  static load(list) {
    for(let item of list) {
      let {id, ...stats} = item;
      new Item(item.id, stats);
    }
  }

  constructor(id, stats) {
    this.id = id;
    this.stats = [];
    for(let i in stats) this.stats[i] = stats[i];
    Item.list[this.id] = this;
  }
}
Item.list = [];

Item.load([
  {id:"boots", speed: 1},
]);

module.exports = Item;
