const Inventory = require("./Inventory.js");

class Container extends Inventory {
  constructor(size, items, id) {
    super(size, items, id, null);
    Container.list.set(this.id, this);
  }

  send(ws, open) { // open = true => this inventory will open on the client
    ws.emit("container", {
      id: this.id,
      items: this.items,
      size: this.size,
      open: open,
    });
  }

  open(player) {
    player.viewing = this.id;
    this.send(player.ws, true);
    player.ws.of("inv:"+this.id).on("moveToMyInventory", (data)=>{
      this.moveToInventory(data.id, data.amount, player.inventory);
    });
    player.ws.on("moveToContainer", (data)=>{
      player.inventory.moveToInventory(data.id, data.amount, this);
    });
  }

  close(player) {
    player.viewing = null;
    this.send(player.ws, false);
    player.ws.of("inv:"+this.id).removeAllListeners("moveToMyInventory");
    player.ws.removeAllListeners("moveToContainer");
  }

  update(open) {
    const playerlist = require("./Player.js").list;
    let viewers = [];
    for(const player of playerlist.values()) {
      if(player.viewing === this.id)
        viewers.push(player);
    }

    for(const viewer of viewers)
      this.send(viewer.ws, null);
  }
}
Container.list = new Map();

module.exports = Container;
