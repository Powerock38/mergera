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
      if(item) {
        let elem = Item.list[item.id].draw(item.amount);
        elem.onclick = ()=>{
          connection.emit("moveToMyInventory", {
            id: item.id,
            amount: 1, //item.amount,
            //slot: null
          }, "inv:"+this.id);
        }
        hud.container.appendChild(elem);
      } else {
        Item.drawEmpty(hud.container);
      }
    }
  }

  open() {
    this.displayed = true;
    this.draw();
    hud.containerAround.style.display = "flex";
  }

  close() {
    this.displayed = false;
    hud.containerAround.style.display = "none";
  }
}
Container.list = [];
