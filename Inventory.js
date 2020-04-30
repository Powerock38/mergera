class Inventory {
  constructor(size, items, id, owner) {
    this.size = size;
    this.items = items;
    this.id = id;
    this.owner = owner;
  }

  get nextSlot() {
    for(let i = 0; i < this.size; i++) {
      if(this.items[i] == null)
        return i;
    }
  }

  moveItem(id, slot) {
    if(this.items[slot])
      return false;
    for(let i in this.items) {
      if(this.items[i].id === id) {
        this.items[slot] = this.items[i];
        this.items[i] = null;
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

  update() {
    //this.owner.updateStats();
    SOCKET_LIST[this.owner.id].ssend("inventory", {
      id: this.id,
      items: this.items,
      size: this.size,
    });
  }
}

module.exports = Inventory;
