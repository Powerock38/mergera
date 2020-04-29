class Inventory {
  constructor(id, items, size) {
    this.id = id;
    this.items = items;
    this.size = size;
    Inventory.list[this.id] = this;
  }

  open() {
    console.table(this.items);
  }
}
Inventory.list = [];
