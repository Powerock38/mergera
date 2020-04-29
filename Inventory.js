class Inventory {
  constructor(size, items, id, viewers) {
    this.size = size;
    this.items = items;
    this.id = id;
    this.viewers = viewers || [];

    //listen for crafting requests
    // SOCKET_LIST[this.owner.id].onmsg("craft", (data)=>{
    //   Craft.list[data.craftId].craft(this);
    // });
  }

  get nextSlot() {
    for(let i = 0; i < this.size; i++) {
      if(this.items[i] === undefined)
        return i;
    }
  }

  moveItem(id, slot) {
    if(this.items[slot])
      return false;
    for(let i in this.items) {
      if(this.items[i].id === id) {
        this.items[slot] = this.items[i];
        this.items[i] = undefined;
        this.update();
        return true;
      }
    }
  }

  addItem(id, amount) {
    for(let i in this.items) {
      if(this.items[i] && this.items[i].id === id) {
        this.items[i].amount += amount;
        this.update();
        return;
      }
    }

    this.items[this.nextSlot] = {
      id: id,
      amount: amount
    };
    this.update();
  }

  removeItem(id, amount) { // return false = cant remove more than available / true = all good
    for(let i in this.items) {
      if(this.items[i] && this.items[i].id === id) {
        if(this.items[i].amount < amount)
          return false;

        this.items[i].amount -= amount;

        if(this.items[i].amount <= 0)
          this.items.splice(i,1);

        this.update();
        return true;
      }
    }
  }

  hasItem(id, amount) {
    for(let i in this.items) {
      if(this.items[i] && this.items[i].id === id) {
        return this.items[i].amount >= amount;
      }
    }
  }

  send(ws, open) { // open = true => the inventory will open on the client
    ws.ssend("inventory", {
      id: this.id,
      items: this.items,
      size: this.size,
      open: open,
    });
  }

  open(id) {
    for(let viewer of this.viewers) {
      if(viewer === id)
        return;
    }
    this.viewers.push(id);
    this.update(true);
  }

  close(id) {
    for(let i in this.viewers) {
      if(this.viewers[i] === id) {
        this.viewers.splice(i, 1);
      }
    }
  }

  update(open) { // send items and possible crafts to Inventory owner
    // this.owner.updateStats();

    // let crafts = [];
    // for(let i in Craft.list) {
    //   let craft = Craft.list[i];
    //   if(craft.canCraft(this))
    //     crafts.push(craft);
    // }
    // send crafts
    for(let i in this.viewers) {
      let id = this.viewers[i];
      if(SOCKET_LIST[id]) {
        this.send(SOCKET_LIST[id], (open && i == this.viewers.length - 1));
      } else {
        this.viewers.splice(i, 1);
      }
    }
  }
}

module.exports = Inventory;
