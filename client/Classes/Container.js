class Container {
  constructor(id, items, size) {
    this.id = id;
    this.update(items, size);
    this.displayed = false;
    Container.list[this.id] = this;
  }

  update(items, size) {
    this.items = items;
    this.size = size;
  }

  draw() {
    hud.container.innerHTML = "";
    for(let i = 0; i < this.size; i++) {
      let item = this.items[i];
      let elem;
      if(item) {
        elem = Item.list[item.id].draw(item.amount);
        elem.onclick = ()=>{
          connection.emit("moveToMyInventory", {
            id: item.id,
            amount: 1, //item.amount,
            //slot: null
          }, "inv:"+this.id);
        }
      } else {
        elem = Item.drawEmpty();
      }
      hud.container.appendChild(elem);
    }
  }

  open() {
    this.displayed = true;
    Container.displayed = true;
    this.draw();
    hud.containerAround.style.display = "flex";
    Inventory.main.open();
  }

  close() {
    this.displayed = false;
    Container.displayed = false;
    hud.containerAround.style.display = "none";
    Inventory.main.close();
  }
}
Container.list = [];
Container.displayed = false;
