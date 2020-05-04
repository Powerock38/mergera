class Item {
  static load(list, callback) {
    let nbToLoad = list.length;
    for(let item of list) {
      let image = new Image();
      image.src = "./items/" + item.id + ".png";
      image.onload = () =>  {
        new Item(image, item);
        console.log("Loaded item " + item.id);
        --nbToLoad === 0 && callback();
      }
    }
  }

  constructor(image, item) {
    this.image = image;
    for(let i in item) this[i] = item[i];
    Item.list[this.id] = this;
  }

  draw(amount) {
    let element = document.createElement("span");
    let legend = document.createElement("span");
    legend.innerHTML =`<b>${this.name}</b><br><i>${this.desc}</i>`;
    legend.classList.add("legend");
    element.classList.add("item");
    element.appendChild(this.image.cloneNode());
    if(amount > 1) {
      let amnt = document.createElement("span");
      amnt.textContent = amount;
      amnt.classList.add("amount");
      element.appendChild(amnt);
    }
    element.appendChild(legend);
    return element;
  }

  drawSwing(angle, x, y) {
    Cell.ctx.translate(x, y);
    Cell.ctx.rotate(angle);
    Cell.ctx.drawImage(this.image, -this.image.width, -this.image.height);
    Cell.ctx.rotate(-angle);
    Cell.ctx.translate(-x, -y);
  }

  static drawEmpty() {
    let element = document.createElement("span");
    element.classList.add("item");
    return element;
  }
}
Item.list = [];
