class Inventory {
  constructor(size, items, id, owner) {
    this.size = size;
    this.items = items || [];
    this.id = id;
    if(owner) {
      this.owner = owner;
      this.hbslot = 0;
      owner.ws.on("hotbarslot", (data)=>{
        this.hbslot = data;
      });
    }
  }

  get nextSlot() {
    for(let i = 0; i < this.size; i++) {
      if(this.items[i] == null)
        return i;
    }
  }

  moveToInventory(id, amount, inventory) { // false = failed; true = all good
    if(this.removeItem(id, amount)) {
      if(inventory.addItem(id, amount))
        //inventory.moveItem(id, slot);
      return true;
    } else return false;
  }

  moveItem(id, slot) { // false = item already in this slot; true = all good
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

  addItem(id, amount) { // false = incremented amount; true = made a new item
    amount = amount || 1;
    for(let i in this.items) {
      if(this.items[i]?.id === id) {
        this.items[i].amount += amount;
        this.update();
        return false;
      }
    }

    this.items[this.nextSlot] = {
      id: id,
      amount: amount
    };
    this.update();
    return true;
  }

  removeItem(id, amount) { // false = failed; true = all good
    amount = amount || 1;
    for(let i in this.items) {
      if(this.items[i]?.id === id) {
        if(this.items[i].amount < amount)
          return false;

        this.items[i].amount -= amount;

        if(this.items[i].amount <= 0)
          this.items.splice(i,1);

        this.update();
        return true;
      }
    }
    return false;
  }

  hasItem(id, amount) {
    amount = amount || 1;
    for(let i in this.items) {
      if(this.items[i]?.id === id) {
        return this.items[i].amount >= amount;
      }
    }
    return false;
  }

  update() {
    this.owner.updateStats();
    this.owner.ws.emit("inventory", {
      id: this.id,
      items: this.items,
      size: this.size,
    });
  }
}

module.exports = Inventory;
