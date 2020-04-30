class Container {
  constructor(id, items, size) {
    this.id = id;
    this.update(items, size);
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
      if(item)
        Item.list[item.id].draw(hud.container, item.amount);
      else {
        Item.drawEmpty(hud.container);
      }
    }
  }

  open() {
    this.draw();
    hud.containerAround.style.display = "flex";
  }

  close() {
    hud.containerAround.style.display = "none";
  }
}
Container.list = [];
