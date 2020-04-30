class Inventory {
  constructor(items, size) {
    this.update(items, size);
    this.displayed = false;
    Inventory.main = this;
  }

  update(items, size) {
    this.items = items;
    this.size = size;
  }

  toggle() {
    if(this.displayed)
      this.close();
    else
      this.open();
  }

  draw() {
    hud.inventory.innerHTML = "";
    for(let i = 0; i < this.size; i++) {
      let item = this.items[i];
      if(item && Item.list[item.id])
        Item.list[item.id].draw(hud.inventory, item.amount);
      else {
        Item.drawEmpty(hud.inventory);
      }
    }
  }

  open() {
    this.displayed = true;
    this.draw();
    hud.inventoryAround.style.display = "flex";
  }

  close() {
    this.displayed = false;
    hud.inventoryAround.style.display = "none";
  }
}
Inventory.main;
