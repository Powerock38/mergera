class Inventory {
  constructor(items, size) {
    this.update(items, size);
    this.displayed = false;
    this.hbslot = 0;
    Inventory.main = this;
  }

  get hbsize() {
    return Math.min(this.size, 10);
  }

  update(items, size) {
    this.items = items;
    this.size = size;
  }

  toggle() {
    if(Container.displayed)
      return;
    if(this.displayed)
      this.close();
    else
      this.open();
  }

  draw() {
    hud.inventory.innerHTML = "";
    for(let i = 0; i < this.size; i++) {
      let item = this.items[i];
      let elem;
      if(item && Item.list.has(item.id)) {
        elem = Item.list.get(item.id).draw(item.amount);
        elem.onclick = ()=>{
          connection.emit("moveToContainer", {
            id: item.id,
            amount: 1, //item.amount,
            //slot: null
          });
        }
      } else {
        elem = Item.drawEmpty();
      }
      if(i === this.hbslot) {
        elem.classList.add("selected");
      }
      hud.inventory.appendChild(elem);
    }
  }

  drawHotbar() {
    hud.inventory.innerHTML = "";
    for(let i = 0; i < this.hbsize; i++) {
      let item = this.items[i];
      let elem;
      if(item && Item.list.get(item.id)) {
        elem = Item.list.get(item.id).draw(item.amount);
      } else {
        elem = Item.drawEmpty();
      }
      if(i === this.hbslot) {
        elem.classList.add("selected");
      }
      hud.inventory.appendChild(elem);
    }
  }

  sendHBslot() {
    connection.emit("hotbarslot", this.hbslot);
  }

  nextHBSlot() {
    this.hbslot = ++this.hbslot % this.hbsize;
    this.drawHotbar();
    this.sendHBslot();
  }

  previousHBSlot() {
    this.hbslot = --this.hbslot % this.hbsize;
    if(this.hbslot === -1) this.hbslot = this.hbsize - 1;
    this.drawHotbar();
    this.sendHBslot();
  }

  open() {
    this.displayed = true;
    this.draw();
  }

  close() {
    this.displayed = false;
    this.drawHotbar()
  }
}
Inventory.main;
new Inventory([], 0);
